import { NavigationProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatBubble from '../../utils/components/ChatBubble';
import ChatInput from '../../utils/components/ChatInput';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import {
  sendMessage,
  markMessagesAsRead,
  getOrCreateChatRoom,
  ensureUserProfile,
} from '../../utils/ChatService';
import { getUserId } from '../../utils/token';
// import { ensureUserProfile } from '../../utils/UserService';

const MessageInner = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const route = useRoute();
  const {
    chatId: initialChatId,
    otherUserId,
    otherUserName,
    otherUserImage,
    otherUserOnline,
  } = route.params;
  console.log('MessageInner params:', route.params);
  const [chatId, setChatId] = useState<string | null>(initialChatId || null);
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatRoomReady, setChatRoomReady] = useState(false);

  const db = getFirestore();

  // Step 1: Fetch userId and create or fetch chatId
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const id = await getUserId();
      setUserId(id);

      const otherProfile = {
        name: otherUserName,
        profilePicture: otherUserImage,
      };
      if (otherUserId) await ensureUserProfile(otherUserId, otherProfile);

      if (id && otherUserId) {
        const roomId = await getOrCreateChatRoom(otherUserId);
        setChatId(roomId);
      }
    };
    init();
  }, []);

  // Step 2: Ensure chat room exists
  useEffect(() => {
    const ensureChatRoom = async () => {
      if (!chatId || !userId || !otherUserId) return;

      const chatRoomRef = doc(db, 'chatRooms', chatId);
      const docSnap = await getDoc(chatRoomRef);

      if (!docSnap.exists()) {
        await setDoc(chatRoomRef, {
          participants: [userId, otherUserId],
          otherUserName,
          otherUserImage,
          otherUserOnline: false,
          lastMessage: '',
          lastMessageTime: '',
          unreadCount: 0,
          createdAt: serverTimestamp(),
        });
      }

      setChatRoomReady(true);
    };

    ensureChatRoom();
  }, [chatId, userId, otherUserId]);

  // Step 3: Listen for messages
  useEffect(() => {
    if (!chatId || !chatRoomReady) return;

    const messagesRef = collection(db, 'chatRooms', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, snapshot => {
      const fetchedMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(fetchedMessages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [chatId, chatRoomReady]);

  // Step 4: Mark as read
  useEffect(() => {
    if (chatId) markMessagesAsRead(chatId);
  }, [chatId]);

  const handleSend = async (text: string) => {
    if (chatId && text.trim()) {
      await sendMessage(chatId, text);
    }
  };

  // Show loading spinner until chat room is ready
  if (!userId || !chatId || !chatRoomReady) {
    return (
      <GradientScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </GradientScreenWrapper>
    );
  }

  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.headerLeft}>
              <Image
                source={{
                  uri:
                    otherUserImage && otherUserImage.trim() !== ''
                      ? otherUserImage
                      : 'https://ui-avatars.com/api/?name=User',
                }}
                style={styles.userImage}
              />
              <View>
                <Text style={styles.headerTitle}>{otherUserName}</Text>
                <Text
                  style={
                    otherUserOnline ? styles.onlineStatus : styles.offlineStatus
                  }>
                  {otherUserOnline ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        {loading ? (
          <ActivityIndicator style={{ flex: 1 }} />
        ) : (
          <FlatList
            data={messages}
            renderItem={({ item }) => (
              <ChatBubble
                message={item.text}
                isMe={item.senderId === userId}
              />
            )}
            keyExtractor={item => item.id}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        )}

        {/* Input */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ChatInput onSend={handleSend} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 60,
    backgroundColor: 'white',
    borderColor: 'rgb(118, 118, 118)',
    borderWidth: 0.3,
    paddingBottom: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    letterSpacing: -0.41,
    color: '#000001',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userImage: {
    width: 35,
    height: 35,
    borderRadius: 99,
    borderWidth: 1,
    borderColor: '#088445',
  },
  onlineStatus: {
    color: '#00D85D',
    fontSize: 10,
    fontWeight: '400',
  },
  offlineStatus: {
    color: '#727272',
    fontSize: 10,
    fontWeight: '400',
  },
});

export default MessageInner;
