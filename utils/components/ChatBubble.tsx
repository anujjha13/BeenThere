import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ChatBubble = ({message, isMe} : { message: string, isMe: boolean }) => {
  return (
    <View style={[styles.messageContainer, isMe ? styles.right : styles.left]}>
      <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
        <Text style={isMe ? styles.messageTextMe : styles.messageTextOther }>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    paddingHorizontal: 16,
    marginVertical: 4,
    flexDirection: 'row',
  },
  left: {
    justifyContent: 'flex-start',
  },
  right: {
    justifyContent: 'flex-end',
  },
  bubble: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    maxWidth: '80%',
  },
  bubbleMe: {
    backgroundColor: '#088445',
    borderTopRightRadius: 0,
  },
  bubbleOther: {
    backgroundColor: 'white',
    borderTopLeftRadius: 0,
  },
  messageTextOther: {
    color: '#000',
    fontSize: 14,
  },
  messageTextMe: {
    color: 'white',
    fontSize: 14,
  },
});

export default ChatBubble;