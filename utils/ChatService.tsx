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
import { getUserId } from './token';

export async function getOrCreateChatRoom(
  otherUserId: string,
  otherUserImage: string,
  otherUserName: string,
  otherUserEmail: string,
  userId: string,
  userImage: string,
  userName: string,
  userEmail: string
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

export const sendMessage = async (chatId: string, messageText: string ,mediaUrl?: string,
  mediaType?: 'image' | 'video' | 'file') => {
  const db = getFirestore();
  const currentUserId = await getUserId();
  console.log('Current user ID:', currentUserId);
  console.log('Chat ID:', chatId);
  console.log('Message text:', messageText);
  console.log('Media URL:', mediaUrl);
  if (!currentUserId || !messageText.trim()) return;
  
  const message = {
    senderId: currentUserId,
    text: messageText,
    timestamp: serverTimestamp(),
    readBy: [currentUserId],
  };

  if (messageText && messageText.trim()) message.text = messageText.trim();
  if (mediaUrl) {
    message.mediaUrl = mediaUrl;
    message.mediaType = mediaType; // Add mediaType to the message
  }
  try {
    console.log('Sending message:', message);
    console.log('Chat ID:', chatId);
    const chatRoomRef = doc(db, 'chatRooms', chatId);
    const messagesRef = collection(db, 'chatRooms', chatId, 'messages');

    const messageDoc = await addDoc(messagesRef, message);

     // For lastMessage, prefer text, else mediaType
    let lastMessage = messageText && messageText.trim()
      ? messageText.trim()
      : mediaType
        ? `[${mediaType}]`
        : '';

    await updateDoc(chatRoomRef, {
      lastMessage,
      lastMessageTime: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
};

export const markMessagesAsRead = async (chatId: string) => {
  const db = getFirestore();
  const currentUserId = await getUserId();
  if (!currentUserId) return;

  const messagesRef = collection(db, 'chatRooms', chatId, 'messages');
  const unreadMessages = await getDocs(
    query(messagesRef, where('readBy', 'not-in', [currentUserId]))
  );

  const batch = writeBatch(db);
  unreadMessages.forEach(docSnap => {
    batch.update(docSnap.ref, {
      readBy: arrayUnion(currentUserId),
    });
  });

  await batch.commit();
};

export async function ensureUserProfile(userId: string, profile: { name: string; email: string; profilePicture?: string }) {
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
  }
}