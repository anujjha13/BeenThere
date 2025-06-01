import React, { useEffect, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { getFirestore, collection, query, where, onSnapshot } from '@react-native-firebase/firestore';
import { getUserId } from '../../utils/token';

const ChatList = ({ navigation }) => {
  const [chatRooms, setChatRooms] = useState([]);

  useEffect(() => {
    // getUserId is async, so you need to handle it
    let unsubscribe = () => {};
    (async () => {
      const userId = await getUserId();
      if (!userId) return;
      const db = getFirestore();
      const q = query(
        collection(db, 'chatRooms'),
        where('participants', 'array-contains', userId)
      );
      unsubscribe = onSnapshot(q, snapshot => {
        const rooms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setChatRooms(rooms);
      });
    })();
    return () => unsubscribe();
  }, []);

  return (
    <FlatList
      data={chatRooms}
      keyExtractor={item => item.id}
      renderItem={({ item }) => {
        // getUserId is async, so you should store it in state
        // For now, just show participants
        return (
          <TouchableOpacity onPress={() => navigation.navigate('MessageScreen', { roomId: item.id })}>
            <View style={{ padding: 16, borderBottomWidth: 1 }}>
              <Text>{item.lastMessage || 'No messages yet'}</Text>
            </View>
          </TouchableOpacity>
        );
      }}
    />
  );
};

export default ChatList;