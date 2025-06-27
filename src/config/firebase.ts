import firestore from '@react-native-firebase/firestore';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

class FirebaseConfig {
  static async initialize() {
    try {
      // Enable offline persistence
      await firestore().settings({
        persistence: true, // Enable offline data persistence
        cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED, // Use unlimited cache size
      });

      // Subscribe to network state changes
      NetInfo.addEventListener(state => {
        if (state.isConnected) {
          console.log('Back online, syncing data...');
          this.enableNetwork();
        } else {
          console.log('Offline, using cached data...');
        }
      });

      console.log('Firebase initialized with offline persistence');
    } catch (error) {
      console.error('Error initializing Firebase:', error);
    }
  }

  static async enableNetwork() {
    try {
      await firestore().enableNetwork();
    } catch (error) {
      console.error('Error enabling network:', error);
    }
  }

  static async disableNetwork() {
    try {
      await firestore().disableNetwork();
    } catch (error) {
      console.error('Error disabling network:', error);
    }
  }

  // Cache messages for a specific chat
  static async cacheMessages(chatId: string, messages: any[]) {
    try {
      await AsyncStorage.setItem(`chat_${chatId}`, JSON.stringify(messages));
    } catch (error) {
      console.error('Error caching messages:', error);
    }
  }

  // Get cached messages for a specific chat
  static async getCachedMessages(chatId: string) {
    try {
      const cached = await AsyncStorage.getItem(`chat_${chatId}`);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting cached messages:', error);
      return [];
    }
  }

  // Cache chat list
  static async cacheChatList(userId: string, chats: any[]) {
    try {
      await AsyncStorage.setItem(`chats_${userId}`, JSON.stringify(chats));
    } catch (error) {
      console.error('Error caching chat list:', error);
    }
  }

  // Get cached chat list
  static async getCachedChatList(userId: string) {
    try {
      const cached = await AsyncStorage.getItem(`chats_${userId}`);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.error('Error getting cached chat list:', error);
      return [];
    }
  }

  // Queue messages to be sent when back online
  static async queueMessage(chatId: string, message: any) {
    try {
      const queueKey = `message_queue_${chatId}`;
      const queuedMessages = await AsyncStorage.getItem(queueKey);
      const queue = queuedMessages ? JSON.parse(queuedMessages) : [];
      queue.push(message);
      await AsyncStorage.setItem(queueKey, JSON.stringify(queue));
    } catch (error) {
      console.error('Error queuing message:', error);
    }
  }

  // Get queued messages
  static async getQueuedMessages(chatId: string) {
    try {
      const queueKey = `message_queue_${chatId}`;
      const queuedMessages = await AsyncStorage.getItem(queueKey);
      return queuedMessages ? JSON.parse(queuedMessages) : [];
    } catch (error) {
      console.error('Error getting queued messages:', error);
      return [];
    }
  }

  // Clear queued messages after they're sent
  static async clearQueuedMessages(chatId: string) {
    try {
      const queueKey = `message_queue_${chatId}`;
      await AsyncStorage.removeItem(queueKey);
    } catch (error) {
      console.error('Error clearing queued messages:', error);
    }
  }
}

export default FirebaseConfig;