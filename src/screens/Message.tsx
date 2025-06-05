import React, {useEffect, useState} from 'react';
import {
  FlatList,
  Image,
  Dimensions,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StatusBar,
} from 'react-native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from '@react-native-firebase/firestore';
import {useAuth} from '../context/authContext';

const {width, height} = Dimensions.get('window');
// Add navigation type at the top of the file
type RootStackParamList = {
  MessageInner: {
    chatId: string;
    otherUserId: string;
    otherUserName: string;
    otherUserImage: any;
    otherUserOnline: boolean;
  };
};

interface MessageItemInterface {
  id: string;
  otherUserId: string;
  name: string;
  message: string;
  time: {
    seconds: number;
    nanoseconds: number;
  } | null;
  unread: number;
  online: boolean;
  image: any;
}

const SearchBar = ({onSearch}: {onSearch: (text: string) => void}) => (
  <View style={styles.searchBarContainer}>
    <Ionicons name="search" size={20} color="#088445" />
    <TextInput
      style={styles.searchInput}
      placeholder="Search conversation..."
      placeholderTextColor="#999"
      onChangeText={onSearch}
    />
  </View>
);

const formatMessageTime = (timestamp: any) => {
  if (!timestamp || !timestamp.seconds) return '';

  const messageDate = new Date(timestamp.seconds * 1000);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset hours to compare just the dates
  const messageDay = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate(),
  );
  const todayDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const yesterdayDay = new Date(
    yesterday.getFullYear(),
    yesterday.getMonth(),
    yesterday.getDate(),
  );

  if (messageDay.getTime() === todayDay.getTime()) {
    return messageDate.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } else if (messageDay.getTime() === yesterdayDay.getTime()) {
    return 'Yesterday';
  } else {
    return messageDate
      .toLocaleDateString([], {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
      })
      .replace(/\//g, '/');
  }
};

const MessageItem = ({item}: {item: MessageItemInterface}) => {
  const hasUnread = item.unread > 0;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('MessageInner', {
          chatId: item.id,
          otherUserId: item.otherUserId,
          otherUserName: item.name,
          otherUserImage: item.image,
          otherUserOnline: item.online,
        })
      }
      activeOpacity={0.6}
      style={[styles.messageCard, hasUnread && styles.unreadMessageCard]}>
      <View style={styles.leftContent}>
        <View style={styles.imageContainer}>
          <Image
            source={
              item.image
                ? {uri: item.image}
                : require('../../assets/images/profilepicture.png')
            }
            style={styles.userImage}
          />
          {item.online && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.messageInfo}>
          <Text style={[styles.userName, hasUnread && styles.unreadUserName]}>
            {item.name}
          </Text>
          <Text
            style={[styles.lastMessage, hasUnread && styles.unreadLastMessage]}
            numberOfLines={1}>
            {item.message}
          </Text>
        </View>
      </View>
      <View style={styles.rightContent}>
        <Text
          style={[styles.messageTime, hasUnread && styles.unreadMessageTime]}>
          {formatMessageTime(item.time)}
        </Text>
        {hasUnread && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{item.unread}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const EmptyMessages = () => (
  <View style={styles.emptyContainer}>
    <Text style={styles.emptyTitle}>No Messages Yet</Text>
    <Text style={styles.emptySubtitle}>
      Start connecting with your matches and begin your conversations here
    </Text>
    <View style={styles.newChatButton}>
      <Text style={styles.newChatButtonText}>Start a New Chat</Text>
    </View>
  </View>
);

const Message = ({navigation}: {navigation: NavigationProp<any>}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<MessageItemInterface[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<
    MessageItemInterface[]
  >([]);
  const db = getFirestore();
  const {user} = useAuth();

  useEffect(() => {
    const userId = user?.id;
    if (!userId) return;

    // Store unsubscribe functions
    const unsubscribers: (() => void)[] = [];

    // First, get all chat rooms for the user
    const chatRoomsQuery = query(
      collection(db, 'chatRooms'),
      where('members', 'array-contains', userId),
      where('lastMessageTime', '!=', null),
      orderBy('lastMessageTime', 'desc'),
    );

    // Listen to chat rooms
    const chatRoomsUnsubscribe = onSnapshot(
      chatRoomsQuery,
      async roomsSnapshot => {
        // Set up listeners for each chat room's messages
        roomsSnapshot.docs.forEach(roomDoc => {
          const roomData = roomDoc.data();
          const messagesRef = collection(
            db,
            'chatRooms',
            roomDoc.id,
            'messages',
          );
          // Query for messages that either have no readBy array or don't include the user
          const messagesQuery = query(
            messagesRef,
            orderBy('timestamp', 'desc'),
          );

          // Listen to latest message in each room
          const messageUnsubscribe = onSnapshot(
            messagesQuery,
            async messageSnapshot => {
              const unreadMessages = messageSnapshot.docs.filter(doc => {
                const data = doc.data();
                return !data.readBy || !data.readBy.includes(userId);
              });

              const latestMessage = messageSnapshot.docs[0]?.data();

              // Find other user in the chat
              const otherUser = roomData.membersInfo?.find(
                ({id}: {id: string}) => id !== userId,
              );

              if (otherUser) {
                // Update the messages state with the latest message
                setMessages(prevMessages => {
                  // Create new message object
                  const updatedMessage = {
                    id: roomDoc.id,
                    otherUserId: otherUser.id,
                    name: otherUser.name || 'Unknown User',
                    message:
                      latestMessage?.text ||
                      roomData.lastMessage ||
                      'No messages yet',
                    time: latestMessage?.timestamp || null,
                    unread: unreadMessages?.length || 0,
                    online: roomData.otherUserOnline || false,
                    image: otherUser.image || null,
                  };

                  // Find and update existing message or add new one
                  const existingIndex = prevMessages.findIndex(
                    msg => msg.id === roomDoc.id,
                  );

                  let newMessages;
                  if (existingIndex !== -1) {
                    newMessages = [...prevMessages];
                    newMessages[existingIndex] = updatedMessage;
                  } else {
                    newMessages = [...prevMessages, updatedMessage];
                  }

                  // Sort messages by timestamp in descending order
                  return newMessages.sort((a, b) => {
                    const timeA = a.time?.seconds || 0;
                    const timeB = b.time?.seconds || 0;
                    return timeB - timeA;
                  });
                });
              }
            },
          );

          unsubscribers.push(messageUnsubscribe);
        });
      },
    );

    unsubscribers.push(chatRoomsUnsubscribe);

    // Cleanup function
    return () => {
      console.log('Cleaning up listeners');
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [user?.id]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter(
        message =>
          message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          message.message.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setFilteredMessages(filtered);
    }
  }, [searchQuery, messages]);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
  };

  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Message</Text>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredMessages}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({item}) => <MessageItem item={item} />}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={<SearchBar onSearch={handleSearch} />}
          ListEmptyComponent={<EmptyMessages />}
        />
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
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.04,
    paddingBottom: height * 0.02,
    backgroundColor: 'white',
    marginBottom: height * 0.02,
    borderBottomWidth: 0.3,
    borderBottomColor: 'rgb(118, 118, 118)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 16,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'white',
    borderColor: '#ccc',
    paddingTop: 4,
    paddingRight: 10,
    paddingBottom: 4,
    paddingLeft: 10,
    gap: 10,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  messageCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
    // shadowColor: '#000',
    // shadowOffset: {width: 0, height: 1},
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
    // elevation: 2,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  userImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
  },
  onlineIndicator: {
    position: 'absolute',
    width: 12,
    height: 12,
    backgroundColor: '#088445',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: 'white',
    bottom: -2,
    right: -2,
  },
  messageInfo: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontWeight: 500,
    fontSize: 15,
    marginBottom: 4,
    color: '#000001',
  },
  lastMessage: {
    color: '#727272',
    fontSize: 12,
  },
  rightContent: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 44,
  },
  messageTime: {
    color: '#000001',
    fontSize: 10,
  },
  unreadMessageCard: {
    backgroundColor: '#088445',
  },
  unreadUserName: {
    color: 'white',
    fontWeight: '600',
  },
  unreadLastMessage: {
    color: '#E1E1E1',
  },
  unreadMessageTime: {
    color: 'white',
  },
  unreadBadge: {
    backgroundColor: '#ED1C24',
    borderRadius: 4,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 60,
    padding: 20,
  },
  emptyImage: {
    width: 120,
    height: 120,
    marginBottom: 20,
    opacity: 0.6,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  newChatButton: {
    backgroundColor: '#088445',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  newChatButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default Message;
