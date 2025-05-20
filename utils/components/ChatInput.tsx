import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ChatInput = () => {
  const [showMenu, setShowMenu] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <View style={styles.container}>

      <View style={styles.inputRow}>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.add}>
          <Ionicons name={showMenu ? 'close' : 'add'} size={20} color="white" />
        </TouchableOpacity>
        <TextInput
          placeholder="Write a message..."
          value={message}
          onChangeText={setMessage}
          style={styles.input}
        />
        <TouchableOpacity style={styles.send}>
          <Ionicons name="send" size={16} style={styles.sendIcon} color="white" />
        </TouchableOpacity>
      </View>
      {showMenu && (
        <>
        <View style={styles.seperator}/>
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="document" size={20} color="#000" />
            <Text style={styles.menuText}>File</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="image" size={20} color="#000" />
            <Text style={styles.menuText}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="camera" size={20} color="#000" />
            <Text style={styles.menuText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="videocam" size={20} color="#000" />
            <Text style={styles.menuText}>Video</Text>
          </TouchableOpacity>
        </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderTopEndRadius: 20,
    borderTopStartRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 10,
    position: 'relative',
    zIndex: 10,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
  },
  add: {
    backgroundColor: '#088445',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#088445',
    padding: 4,
  },
  send: {
    backgroundColor: '#088445',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#088445',
    padding: 8,
  },
  sendIcon: {
    transform: [{ rotate: '330deg' }],
  },
  input: {
    flex: 1,
    borderWidth: 0.3,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
  },
  seperator: {
    height: 1,
    backgroundColor: '#ccc',
    marginTop: 16,
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  menuButton: {
    alignItems: 'center',
  },
  menuText: {
    fontSize: 12,
    color: '#333',
  },
});

export default ChatInput;