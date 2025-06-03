import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { getFirestore, collection, query, where, onSnapshot , getDoc, doc } from '@react-native-firebase/firestore';
import { getUserId } from '../../utils/token';

interface MessageItemInterface {
  id: string;
  name: string;
  message: string;
  time: string;
  unread: number;
  online: boolean;
  image: any;
}

const SearchBar = ({ onSearch }: { onSearch: (text: string) => void }) => (
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

const MessageItem = ({ item }: { item: MessageItemInterface }) => {
  const hasUnread = item.unread > 0;
  const navigation = useNavigation();
  console.log('MessageItem', item);
  return (
    <TouchableOpacity onPress={() => navigation.navigate('MessageInner', { chatId: item?.id,otherUserId: item.otherUserId,
      otherUserName: item.name,
      otherUserImage: item.image,
      otherUserOnline: item.online, 
      })
    }
    activeOpacity={0.6} style={[styles.messageCard, hasUnread && styles.unreadMessageCard]}>
      <View style={styles.leftContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.userImage} />
          {item.online && <View style={styles.onlineIndicator} />}
        </View>
        <View style={styles.messageInfo}>
          <Text style={[styles.userName, hasUnread && styles.unreadUserName]}>{item.name}</Text>
          <Text style={[styles.lastMessage, hasUnread && styles.unreadLastMessage]} numberOfLines={1}>
            {item.message}
          </Text>
        </View>
      </View>
      <View style={styles.rightContent}>
        <Text style={[styles.messageTime, hasUnread && styles.unreadMessageTime]}>{item.time}</Text>
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
    <TouchableOpacity style={styles.newChatButton}>
      <Text style={styles.newChatButtonText}>Start a New Chat</Text>
    </TouchableOpacity>
  </View>
);

const Message = ({ navigation }: { navigation: NavigationProp<any> }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<MessageItemInterface[]>([]);
  const [filteredMessages, setFilteredMessages] = useState<MessageItemInterface[]>([]);

  useEffect(() => {
    let unsubscribe = () => {};
    (async () => {
      const userId = await getUserId();
      if (!userId) return;
      const db = getFirestore();
      const q = query(
        collection(db, 'chatRooms'),
        where('members', 'array-contains', userId),
        where('lastMessage', '!=', ''),
      );
      unsubscribe = onSnapshot(q, async snapshot => {
        // Fetch all user profiles in parallel
        const rooms = await Promise.all(snapshot.docs.map(async docSnap => {
          const data = docSnap.data();
          const otherUser = data.membersInfo?.find(({id}:{id:string}) => id !== userId);
          console.log('otherUserId', otherUser);
          if (otherUser) {
            var otherUserId = otherUser.id;
            var name = otherUser.name || 'Unknown User';
            var image = otherUser.image || 'https://example.com/default-avatar.png';
          }
          return {
            id: docSnap.id,
            otherUserId,
            name,
            message: data.lastMessage || 'No messages yet',
            time: data.lastMessageTime && data.lastMessageTime.seconds
              ? new Date(data.lastMessageTime.seconds * 1000).toLocaleTimeString()
              : '',
            unread: data.unreadCount || 0,
            online: data.otherUserOnline || false,
            image,
          };
        }));
        setMessages(rooms);
        setFilteredMessages(rooms);
      });
    })();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredMessages(messages);
    } else {
      const filtered = messages.filter(
        message =>
          message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          message.message.toLowerCase().includes(searchQuery.toLowerCase())
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
          renderItem={({ item }) => <MessageItem item={item} />}
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
    paddingHorizontal: 16,
    paddingVertical: 60,
    backgroundColor: 'white',
    borderColor: 'rgb(118, 118, 118)',
    borderWidth: 0.3,
    paddingBottom: 16,
    marginBottom: 16,
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