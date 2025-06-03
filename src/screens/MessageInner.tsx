import {NavigationProp, useRoute} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
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
} from '../../utils/ChatService';
import {getUserId} from '../../utils/token';
import {useAuth} from '../context/authContext';
import {getMessageRequest} from '../lib/api';
// import { ensureUserProfile } from '../../utils/UserService';

const MessageInner = ({navigation}: {navigation: NavigationProp<any>}) => {
  const route = useRoute();
  const {
    chatId: initialChatId,
    otherUserId,
    otherUserName,
    otherUserImage,
    otherUserEmail,
    otherUserOnline
  } = route.params;
  const [chatId, setChatId] = useState<string | null>(initialChatId || null);
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatRoomReady, setChatRoomReady] = useState(false);
  const {user} = useAuth();
  const db = getFirestore();
  const [messageAllowed, setMessageAllowed] = useState(true);

  // Step 1: Fetch userId and create or fetch chatId
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const id = await getUserId();
      setUserId(id);
      console.log('User ID:', id);
      const messageRequest = await getMessageRequest(id);
      console.log('Message Request:', messageRequest);
      setMessageAllowed(false);
      // const otherProfile = {
      //   name: otherUserName,
      //   profilePicture: otherUserImage,
      // };
      //if (otherUserId) await ensureUserProfile(otherUserId, otherProfile);

      // const selfProfile = {
      //   name: user.full_name,
      //   profilePicture: user.image,
      //   userId: user.id,
      // };
      //if (id) await ensureUserProfile(id, selfProfile);

      if (id && otherUserId) {
        const roomId = await getOrCreateChatRoom(
          otherUserId,
          otherUserImage,
          otherUserName,
          otherUserEmail,
          user.id,
          user.image,
          user.full_name,
          user.email,
        );
        setChatId(roomId);
      }
    };
    init();
  }, []);

  // Step 2: Ensure chat room exists
  useEffect(() => {
    const ensureChatRoom = async () => {
      console.log('chatId, userId, otherUserId', chatId, userId, otherUserId);
      if (!chatId || !userId || !otherUserId) return;

      const chatRoomRef = doc(db, 'chatRooms', chatId);
      const docSnap = await getDoc(chatRoomRef);
      const membersInfo = [
        {
          id: user.id,
          name: user.full_name, // You can fetch and fill the current user's name if needed
          image: user.image, // You can fetch and fill the current user's image if needed
          email: user.email, // You can fetch and fill the current user's email if needed
        },
        {
          id: otherUserId,
          name: otherUserName,
          image: otherUserImage,
          email: otherUserEmail,
        },
      ];
      if (!docSnap.exists()) {
        await setDoc(chatRoomRef, {
          createdAt: serverTimestamp(),
          id: `${userId}_${otherUserId}`,
          members: [userId, otherUserId],
          membersInfo,
          updatedAt: serverTimestamp(),
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

  const handleSend = async text => {
    if (chatId && text.trim()) {
      console.log('Sending message:', text);
      console.log('Chat ID:', chatId);
      await sendMessage(chatId, text);
    }
  };
  const handlePickImage = async (imageUri, mediaType) => {
    if (chatId) {
      await sendMessage(chatId, '', imageUri, mediaType); // Send image with mediaUrl and mediaType
    }
  };

  // Show loading spinner until chat room is ready
  if (!userId || !chatId || !chatRoomReady) {
    return (
      <GradientScreenWrapper>
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <ActivityIndicator size="large" />
        </View>
      </GradientScreenWrapper>
    );
  }

  return (
    <GradientScreenWrapper>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0} // adjust as needed
      >
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
                      otherUserOnline
                        ? styles.onlineStatus
                        : styles.offlineStatus
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
            <ActivityIndicator style={{flex: 1}} />
          ) : (
            <FlatList
              data={messages}
              renderItem={({item}) => (
                <ChatBubble
                  message={item.text}
                  isMe={item.senderId === userId}
                />
              )}
              keyExtractor={item => item.id}
              contentContainerStyle={{paddingBottom: 20}}
            />
          )}

          {/* Input */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            {messageAllowed ?
            <ChatInput onSend={handleSend} onPickImage={handlePickImage} /> :
            <View style={{padding: 40, alignItems: 'center'}}>
              <Text style={{color: '#727272', fontSize: 15, textAlign: 'center'}}>
                User has disabled message requests.
              </Text>
            </View>}
          </KeyboardAvoidingView>
        </SafeAreaView>
      </KeyboardAvoidingView>
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
