import {
  getFirestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  writeBatch,
  arrayUnion,
  getDoc,
  setDoc,
} from '@react-native-firebase/firestore';
import {getUserId} from './token';
import functions from '@react-native-firebase/functions';
import FirebaseConfig from '../src/config/firebase';
import NetInfo from '@react-native-community/netinfo';

export async function getOrCreateChatRoom(
  otherUserId: string,
  otherUserImage: string,
  otherUserName: string,
  otherUserEmail: string,
  userId: string,
  userImage: string,
  userName: string,
  userEmail: string,
) {
  const db = getFirestore();
  if (!userId || !otherUserId) return null;
  const chatRoomsRef = collection(db, 'chatRooms');
  const q = query(chatRoomsRef, where('members', 'array-contains', userId));
  const snapshot = await getDocs(q);
  let chatRoomId = null;
  snapshot.forEach(docSnap => {
    const data = docSnap.data();
    if (data.members.includes(otherUserId)) {
      chatRoomId = docSnap.id;
    }
  });
  if (chatRoomId) return chatRoomId;

  // Create new chat room
  const membersInfo = [
    {
      id: userId,
      name: userName, // You can fetch and fill the current user's name if needed
      image: userImage, // You can fetch and fill the current user's image if needed
      email: userEmail, // You can fetch and fill the current user's email if needed
    },
    {
      id: otherUserId,
      name: otherUserName,
      image: otherUserImage,
      email: otherUserEmail,
    },
  ];
  const newRoomRef = await addDoc(chatRoomsRef, {
    // participants: [userId, otherUserId],
    // lastMessage: '',
    // lastMessageTime: '',
    // unreadCount: 0,
    // createdAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    //id: `${userId}_${otherUserId}`,
    members: [userId, otherUserId],
    membersInfo,
    updatedAt: serverTimestamp(),
  });
  console.log('New chat room created with ID:', newRoomRef.id);
  return newRoomRef.id;
}

export const sendMessage = async (
  chatId: string,
  messageText: string,
  mediaUrl?: string,
  mediaType?: 'image' | 'video' | 'file',
) => {
  const db = getFirestore();
  const currentUserId = await getUserId();
  
  if (!currentUserId || !messageText.trim()) return;

  // Check network status
  const networkState = await NetInfo.fetch();
  const isConnected = networkState.isConnected;

  try {
    // Get chat room data
    const chatRoomRef = doc(db, 'chatRooms', chatId);
    let chatRoomData;
    
    if (isConnected) {
      const chatRoomSnap = await getDoc(chatRoomRef);
      chatRoomData = chatRoomSnap.data();
    } else {
      // Use cached chat room data
      const cachedChats = await FirebaseConfig.getCachedChatList(currentUserId);
      chatRoomData = cachedChats.find((chat: any) => chat.id === chatId);
    }
    
    if (!chatRoomData) return;

    // Find user info
    const otherUserInfo = chatRoomData.membersInfo.find(
      (member: any) => member.id !== currentUserId
    );
    
    const currentUserInfo = chatRoomData.membersInfo.find(
      (member: any) => member.id === currentUserId
    );

    const message = {
      id: Date.now().toString(), // Temporary ID for offline messages
      senderId: currentUserId,
      text: messageText.trim(),
      timestamp: serverTimestamp(),
      readBy: [currentUserId],
      senderName: currentUserInfo?.name || 'User',
      pending: !isConnected, // Mark as pending if offline
    };

    if (mediaUrl) {
      // message.mediaUrl = mediaUrl;
      // message.mediaType = mediaType;
    }

    if (!isConnected) {
      // Store message in queue for later sending
      await FirebaseConfig.queueMessage(chatId, message);
      
      // Update local cache
      const cachedMessages = await FirebaseConfig.getCachedMessages(chatId);
      cachedMessages.unshift(message);
      await FirebaseConfig.cacheMessages(chatId, cachedMessages);
      
      // Update UI immediately with pending message
      return message;
    }

    // Online: Send message normally
    const messagesRef = collection(db, 'chatRooms', chatId, 'messages');
    const messageDoc = await addDoc(messagesRef, message);

    // Update chat room's last message
    const lastMessage = messageText.trim() || (mediaType ? `[${mediaType}]` : '');
    await updateDoc(chatRoomRef, {
      lastMessage,
      lastMessageTime: serverTimestamp(),
    });

    // Cache the message locally
    const cachedMessages = await FirebaseConfig.getCachedMessages(chatId);
    cachedMessages.unshift({ ...message, id: messageDoc.id });
    await FirebaseConfig.cacheMessages(chatId, cachedMessages);

    // Send notification if online
    if (otherUserInfo && otherUserInfo.fcmToken) {
      try {
        // TODO: Implement FCM notification
        // await sendFCMDirect(
        //   otherUserInfo.fcmToken,
        //   currentUserInfo?.name || 'New Message',
        //   messageText.trim() || `[${mediaType || 'media'}]`,
        //   {
        //     chatId,
        //     messageId: messageDoc.id,
        //     type: 'chat_message',
        //     senderId: currentUserId,
        //     senderName: currentUserInfo?.name || 'User',
        //   }
        // );
      } catch (error) {
        console.error('Error sending FCM notification:', error);
      }
    }

    return { ...message, id: messageDoc.id };
  } catch (error) {
    console.error('Error sending message:', error);
    return null;
  }
};

export const markMessagesAsRead = async (chatId: string) => {
  const db = getFirestore();
  const currentUserId = await getUserId();
  if (!currentUserId) return;

  const messagesRef = collection(db, 'chatRooms', chatId, 'messages');
  const unreadMessages = await getDocs(
    query(messagesRef, where('readBy', 'not-in', [currentUserId])),
  );

  const batch = writeBatch(db);
  unreadMessages.forEach(docSnap => {
    batch.update(docSnap.ref, {
      readBy: arrayUnion(currentUserId),
    });
  });

  await batch.commit();
};

export async function ensureUserProfile(
  userId: string,
  profile: {name: string; email: string; profilePicture?: string},
) {
  try {
    console.log('Ensuring user profile for:', userId, profile);
    const db = getFirestore();
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    console.log('User snapshot exists:', userSnap.exists());
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        ...profile,
        createdAt: serverTimestamp(),
      });
    } else {
      const userData = userSnap.data();
      if (userData) {
        console.log('User data:', userData);
        // Check if any profile field is different
        const needsUpdate =
          userData.name !== profile.name ||
          userData.email !== profile.email ||
          userData.profilePicture !== profile.profilePicture;
        if (needsUpdate) {
          await setDoc(
            userRef,
            {
              ...userData,
              ...profile,
              updatedAt: serverTimestamp(),
            },
            {merge: true},
          );
        }
      }
    }
  } catch (error) {
    console.error('Error ensuring user profile:', error);
  }
}

// Function to sync queued messages when back online
export const syncQueuedMessages = async (chatId: string) => {
  try {
    const queuedMessages = await FirebaseConfig.getQueuedMessages(chatId);
    if (!queuedMessages.length) return;

    for (const message of queuedMessages) {
      await sendMessage(chatId, message.text, message.mediaUrl, message.mediaType);
    }

    await FirebaseConfig.clearQueuedMessages(chatId);
  } catch (error) {
    console.error('Error syncing queued messages:', error);
  }
};
