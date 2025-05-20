import {NavigationProp, useRoute} from '@react-navigation/native';
import React from 'react';
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
} from 'react-native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ChatBubble from '../../utils/components/ChatBubble';
import ChatInput from '../../utils/components/ChatInput';

const MessageInner = ({navigation}: {navigation: NavigationProp<any>}) => {
  const route = useRoute();
  const {chatId} = route.params;

  const user = {
    id: '1',
    name: 'John Doe',
    image: 'https://randomuser.me/api/portraits/men/1.jpg',
    message: 'Hello, how are you?',
    time: '10:30 AM',
    unread: 2,
    online: true,
  };
  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <View style={styles.headerLeft}>
              <Image source={{uri: user?.image}} style={styles.userImage} />
              <View>
                <Text style={styles.headerTitle}>{user?.name}</Text>
                <Text
                  style={
                    user?.online ? styles.onlineStatus : styles.offlineStatus
                  }>
                  {user?.online ? 'Online' : 'Offline'}
                </Text>
              </View>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={[
            {id: 1, text: "Hello! What's up?", isMe: false},
            {id: 2, text: 'Hello! Emily', isMe: true},
            {id: 3, text: 'I am doing great! How are you today?', isMe: true},
            {id: 4, text: 'Hmm, everything is fine.', isMe: false},
            {
              id: 5,
              text: 'When an unknown printer took a gallery of type and scrambled',
              isMe: false,
            },
            {id: 6, text: 'WOW! Amazing country', isMe: true},
            {
              id: 7,
              text: 'I have also interested on the nice green country...',
              isMe: true,
            },
            {
              id: 8,
              text: 'When an unknown printer took a gallery of type and scrambled',
              isMe: false,
            },
            {id: 9, text: 'Great!', isMe: false},
          ]}
          renderItem={({item}) => (
            <ChatBubble message={item.text} isMe={item.isMe} />
          )}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{paddingBottom: 20}}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          {/* Input */}
          <ChatInput />
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
    fontWeight: 500,
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
    fontWeight: 400,
  },
  offlineStatus: {
    color: '#727272',
    fontSize: 10,
    fontWeight: 400,
  },
});

export default MessageInner;