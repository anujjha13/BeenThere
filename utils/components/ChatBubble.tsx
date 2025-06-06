import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ChatBubble = ({message, isMe, messageTime} : { message: string, isMe: boolean, messageTime: string }) => {
  return (
    <View style={styles.messageContainer}>
      <View style={[styles.bubbleContainer, isMe ? styles.right : styles.left]}>
        <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleOther]}>
          <Text style={isMe ? styles.messageTextMe : styles.messageTextOther}>{message}</Text>
           <Text style={[
        styles.messageTime,
        isMe ? styles.messageTimeRight : styles.messageTimeLeft
      ]}>
        {messageTime}
      </Text>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    paddingHorizontal: 12,
    marginVertical: 4,
    flexDirection: 'column',
    width: '100%',
  },
  left: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  right: {
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  bubbleContainer: {
    flexDirection: 'row',
    width: '100%',
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
  messageTime: {
    fontSize: 8,
    marginTop: 2,
    color: 'white',
    marginBottom: 2,
  },
  messageTimeRight: {
    alignSelf: 'flex-end',
  },
  messageTimeLeft: {
    alignSelf: 'flex-start',
    color: 'green',
  },
});

export default ChatBubble;