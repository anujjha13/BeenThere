import {NavigationProp, useRoute, RouteProp} from '@react-navigation/native';
import React, {useEffect, useState, useRef} from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
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
  syncQueuedMessages,
} from '../../utils/ChatService';
import {getUserId} from '../../utils/token';
import {useAuth} from '../context/authContext';
import {getMessageRequest} from '../lib/api';
import {ensureUserProfile} from '../../utils/ChatService';
import FirebaseConfig from '../config/firebase';
import NetInfo from '@react-native-community/netinfo';

// Define route params type
type RootStackParamList = {
  MessageInner: {
    chatId?: string;
    otherUserId: string;
    otherUserName: string;
    otherUserImage?: string;
    otherUserEmail?: string;
    otherUserOnline?: boolean;
  };
};

// Define message type
interface Message {
  id: string;
  text: string;
  senderId: string;
  timestamp: {
    seconds: number;
    nanoseconds: number;
  };
  readBy?: string[];
  pending?: boolean;
}

type MediaType = 'video' | 'image' | 'file';

// Add a utility function to format the timestamp
const formatMessageTime = (timestamp: Message['timestamp']) => {
  if (!timestamp) return '';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
};

// Add date formatter
const formatMessageDate = (timestamp: Message['timestamp']) => {
  if (!timestamp) return '';
  const date = new Date(timestamp.seconds * 1000);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const DateDivider = ({date}: {date: string}) => (
  <View style={styles.dateDividerContainer}>
    <Text style={styles.dateDividerText}>{date}</Text>
  </View>
);

const MessageInner = ({navigation}: {navigation: NavigationProp<any>}) => {
  const route = useRoute<RouteProp<RootStackParamList, 'MessageInner'>>();
  const {
    chatId: initialChatId,
    otherUserId,
    otherUserName,
    otherUserImage,
    otherUserEmail,
    otherUserOnline,
  } = route.params;

  const [chatId, setChatId] = useState<string | null>(initialChatId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatRoomReady, setChatRoomReady] = useState(false);
  const {user} = useAuth();
  const db = getFirestore();
  const [messageAllowed, setMessageAllowed] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [hasPendingMessages, setHasPendingMessages] = useState(false);

  // Initialize Firebase config and check network status
  useEffect(() => {
    FirebaseConfig.initialize();

    // Monitor network status
    const unsubscribe = NetInfo.addEventListener(state => {
      const online = state.isConnected ?? false;
      setIsOnline(online);
      
      if (online && chatId) {
        syncQueuedMessages(chatId);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const id = await getUserId();
      if (id) {
        setUserId(id);

        // Try to get cached messages first
        if (chatId) {
          const cached = await FirebaseConfig.getCachedMessages(chatId);
          if (cached.length > 0) {
            setMessages(cached);
          }
        }

        // Rest of your initialization code...
        const messageRequest = await getMessageRequest(id);
        if (!user) return;

        const otherProfile = {
          name: otherUserName,
          email: otherUserEmail || '',
          profilePicture: otherUserImage || 'https://ui-avatars.com/api/?name=User',
        };

        if (otherUserId) await ensureUserProfile(otherUserId, otherProfile);

        const selfProfile = {
          name: user.full_name || '',
          email: user.email || '',
          profilePicture: user.image || 'https://ui-avatars.com/api/?name=User',
        };

        await ensureUserProfile(id, selfProfile);

        if (otherUserId && user) {
          const roomId = await getOrCreateChatRoom(
            otherUserId,
            otherUserImage || '',
            otherUserName,
            otherUserEmail || '',
            user.id,
            user.image || '',
            user.full_name || '',
            user.email || '',
          );
          setChatId(roomId);
        }
        setLoading(false);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const ensureChatRoom = async () => {
      if (!chatId || !userId || !otherUserId || !user) return;

      const chatRoomRef = doc(db, 'chatRooms', chatId);
      const docSnap = await getDoc(chatRoomRef);
      const membersInfo = [
        {
          id: user.id,
          name: user.full_name || '',
          image: user.image || '',
          email: user.email || '',
        },
        {
          id: otherUserId,
          name: otherUserName,
          image: otherUserImage || '',
          email: otherUserEmail || '',
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
  }, [chatId, userId, otherUserId, user]);

  useEffect(() => {
    if (!chatId || !isOnline) return;

    const messagesRef = collection(db, 'chatRooms', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'desc'));

    const unsubscribe = onSnapshot(q, async snapshot => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Cache messages locally
      await FirebaseConfig.cacheMessages(chatId, newMessages);
      setMessages(newMessages);

      // Mark messages as read
      if (userId) {
        await markMessagesAsRead(chatId);
      }
    });

    return () => unsubscribe();
  }, [chatId, isOnline]);

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      try {
        flatListRef.current.scrollToOffset({offset: 0, animated: true});
      } catch (error) {
        console.error('Error scrolling:', error);
      }
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Show button if user has scrolled up a bit
    const currentOffset = event.nativeEvent.contentOffset.y;
    setShowScrollButton(currentOffset > 180); // Show button when scrolled down (away from latest messages)
  };

  const handleSend = async (text: string) => {
    if (!chatId || !text.trim()) return;

    const sentMessage = await sendMessage(chatId, text);
    if (sentMessage) {
      // Update messages immediately for better UX
      setMessages(prev => [sentMessage, ...prev]);
      
      // Check for pending messages
      const hasPending = messages.some(msg => msg.pending);
      setHasPendingMessages(hasPending);
    }
  };

  const handlePickImage = async (imageUri: string, mediaType: MediaType) => {
    if (chatId) {
      await sendMessage(chatId, '', imageUri, mediaType);
    }
  };

  interface RenderItemProps {
    item: Message;
    index: number;
    messages: Message[];
  }

  const renderItem = ({item, index, messages}: RenderItemProps) => {
    const currentMessageDate = formatMessageDate(item.timestamp);
    const previousMessage =
      index < messages.length - 1 ? messages[index + 1] : null;
    const previousMessageDate = previousMessage
      ? formatMessageDate(previousMessage.timestamp)
      : null;
    const showDateDivider = currentMessageDate !== previousMessageDate;

    return (
      <>
        <View
          style={[
            styles.messageContainer,
            item.senderId === userId
              ? styles.myMessageContainer
              : styles.otherMessageContainer,
          ]}>
          {item.senderId !== userId && (
            <Image
              source={
                otherUserImage
                  ? {uri: otherUserImage}
                  : require('../../assets/images/profilepicture.png')
              }
              style={styles.messageAvatar}
            />
          )}
          <View style={styles.messageContentContainer}>
            <ChatBubble
              message={item.text}
              isMe={item.senderId === userId}
              messageTime={formatMessageTime(item.timestamp)}
            />
          </View>
        </View>
        {showDateDivider && <DateDivider date={currentMessageDate} />}
      </>
    );
  };

  const renderConnectionStatus = () => {
    if (!isOnline || hasPendingMessages) {
      return (
        <View style={styles.connectionStatus}>
          <Text style={styles.connectionText}>
            {!isOnline 
              ? 'Offline - Messages will be sent when connected'
              : hasPendingMessages 
                ? 'Syncing messages...'
                : ''}
          </Text>
        </View>
      );
    }
    return null;
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      {renderConnectionStatus()}
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <View style={styles.wrapper}>
          <GradientScreenWrapper>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                  <Ionicons name="chevron-back" size={24} color="black" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('UserProfile', {
                      userId: otherUserId,
                      name: otherUserName,
                      image: otherUserImage,
                    })
                  }
                  style={styles.headerLeft}>
                  <Image
                    source={
                      otherUserImage
                        ? {uri: otherUserImage}
                        : require('../../assets/images/profilepicture.png')
                    }
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
                      {/* {otherUserOnline ? 'Online' : 'Offline'} */}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={24} color="black" />
              </TouchableOpacity>
            </View>

            <View style={styles.mainContainer}>
              {loading ? (
                <ActivityIndicator style={{flex: 1}} />
              ) : (
                <View style={{flex: 1}}>
                <FlatList
                  ref={flatListRef}
                  data={[...messages].reverse()}
                  inverted={true}
                  renderItem={({item, index}) =>
                    renderItem({item, index, messages: [...messages].reverse()})
                  }
                  keyExtractor={item => item.id}
                  contentContainerStyle={{paddingBottom: 10}}
                  onScroll={handleScroll}
                  maintainVisibleContentPosition={{
                    minIndexForVisible: 0,
                  }}
                />
                </View>
              )}

              {showScrollButton && (
                <TouchableOpacity
                  style={styles.scrollButton}
                  onPress={scrollToBottom}
                  activeOpacity={0.8}>
                  <Ionicons
                    name="chevron-down-circle"
                    size={40}
                    color="#088445"
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Input */}
            {messageAllowed ? (
              <View style={styles.inputContainer}>
                <ChatInput onSend={handleSend} onPickImage={handlePickImage} />
              </View>
            ) : (
              <View style={styles.disabledMessageContainer}>
                <Text style={styles.disabledMessageText}>
                  User has disabled message requests.
                </Text>
              </View>
            )}
          </GradientScreenWrapper>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  wrapper: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderColor: 'rgb(118, 118, 118)',
    borderBottomWidth: 0.3,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: -0.41,
    color: '#000001',
    marginTop: 5,
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
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
  scrollButton: {
    position: 'absolute',
    right: 15,
    bottom: 15,
    backgroundColor: 'white',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 9999,
  },
  messageContainer: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
  },
  messageContentContainer: {
    flex: 1,
    maxWidth: '85%',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  dateDividerContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dateDividerText: {
    fontSize: 12,
    color: '#727272',
    marginHorizontal: 8,
    fontWeight: '500',
    backgroundColor: 'white',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  disabledMessageContainer: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  disabledMessageText: {
    color: '#727272',
    fontSize: 15,
    textAlign: 'center',
  },
  inputContainer: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    marginTop: -1,
    paddingBottom: Platform.OS === 'ios' ? 0 : 0,
  },
  connectionStatus: {
    backgroundColor: '#f8d7da',
    padding: 8,
    width: '100%',
  },
  connectionText: {
    color: '#721c24',
    textAlign: 'center',
    fontSize: 12,
  },
});

export default MessageInner;
