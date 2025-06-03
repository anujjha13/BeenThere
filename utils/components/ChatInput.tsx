import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Image, ScrollView, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import { launchCamera } from 'react-native-image-picker';

const ChatInput = ({ onSend, onPickImage }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);

  const handleSend = () => {
    if (message.trim()) {
      onSend(message);
      setMessage('');
    }
    // Send selected images if any
    if (selectedImages.length > 0) {
      selectedImages.forEach(image => {
        onPickImage(image.uri, 'image'); // Send each selected image
      });
      setSelectedImages([]); // Clear selected images after sending
    }
  };

  const handlePickImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Cannot access gallery without permission.');
      return;
    }

    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.8,
        selectionLimit: 3 - selectedImages.length, // Limit selection based on already selected images
      },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Image picker error');
          return;
        }
        if (response.assets) {
          const newImages = response.assets.map(asset => ({
            uri: asset.uri,
            type: asset.type,
            name: asset.fileName || 'image.jpg',
          }));
          setSelectedImages(prev => [...prev, ...newImages]);
        }
      },
    );
  };


const handleOpenCamera = async () => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    Alert.alert('Permission denied', 'Cannot access camera without permission.');
    return;
  }
  launchCamera(
    {
      mediaType: 'photo',
      maxWidth: 500,
      maxHeight: 500,
      quality: 0.8,
    },
    response => {
      if (response.didCancel) return;
      if (response.errorCode) {
        Alert.alert('Error', response.errorMessage || 'Camera error');
        return;
      }
      if (response.assets) {
        const newImages = response.assets.map(asset => ({
          uri: asset.uri,
          type: asset.type,
          name: asset.fileName || 'image.jpg',
        }));
        setSelectedImages(prev => [...prev, ...newImages]);
      }
    }
  );
  };

  const handlePickVideo = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied', 'Cannot access gallery without permission.');
      return;
    }
    launchImageLibrary(
      {
        mediaType: 'video',
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Video picker error');
          return;
        }
        if (response.assets) {
          const video = response.assets[0];
          setSelectedImages(prev => [...prev, { uri: video.uri, type: video.type, name: video.fileName || 'video.mp4' }]);
        }
      }
    );
  };


const handleOpenVideoCamera = async () => {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) {
        Alert.alert('Permission denied', 'Cannot access camera without permission.');
        return;
      }
      launchCamera(
        {
          mediaType: 'video',
          videoQuality: 'high',
          durationLimit: 60, // seconds
        },
        response => {
          if (response.didCancel) return;
          if (response.errorCode) {
            Alert.alert('Error', response.errorMessage || 'Camera error');
            return;
          }
          if (response.assets) {
            const video = response.assets[0];
            setSelectedImages(prev => [...prev, { uri: video.uri, type: video.type, name: video.fileName || 'video.mp4' }]);
          }
        }
      );
  };


  const requestGalleryPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      if (Platform.Version >= 33) {
        // Android 13+ uses READ_MEDIA_IMAGES
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        // Older Android uses READ_EXTERNAL_STORAGE
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch (err) {
      return false;
    }
  }

  const requestCameraPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        return false;
      }
    }
    return true;
  };
  
  return true;
};

  const handleRemoveImage = (uri) => {
    setSelectedImages(prev => prev.filter(image => image.uri !== uri));
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputRow}>
        {/* <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={styles.add}>
          <Ionicons name={showMenu ? 'close' : 'add'} size={20} color="white" />
        </TouchableOpacity> */}
        <TextInput
          placeholder="Write a message..."
          value={message}
          onChangeText={setMessage}
          style={styles.input}
        />
        <TouchableOpacity style={styles.send} onPress={handleSend}>
          <Ionicons name="send" size={16} style={styles.sendIcon} color="white" />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuButton} onPress={handlePickImage}>
            <Ionicons name="image" size={20} color="#000" />
            <Text style={styles.menuText}>Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton}>
            <Ionicons name="document" size={20} color="#000" />
            <Text style={styles.menuText}>File</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={handleOpenCamera}>
            <Ionicons name="camera" size={20} color="#000" />
            <Text style={styles.menuText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuButton} onPress={() =>
                Alert.alert(
                  'Send Video',
                  'Choose an option',
                  [
                    { text: 'Pick from Gallery', onPress: handlePickVideo },
                    { text: 'Capture Video', onPress: handleOpenVideoCamera },
                    { text: 'Cancel', style: 'cancel' },
                  ],
                  { cancelable: true }
                )
        }>
            <Ionicons name="videocam" size={20} color="#000" />
            <Text style={styles.menuText}>Video</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Selected Images Grid */}
      {selectedImages.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageGrid}>
          {selectedImages.map((image, index) => (
            <View key={index} style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.selectedImage} />
              <TouchableOpacity style={styles.removeButton} onPress={() => handleRemoveImage(image.uri)}>
                <Ionicons name="close-circle" size={20} color="red" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
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
  menu: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  menuButton: {
    alignItems: 'center',
  },
  menuText: {
    fontSize: 12,
    color: '#333',
  },
  imageGrid: {
    marginTop: 8,
    marginBottom: 8,
  },
  imageContainer: {
    position: 'relative',
    marginRight: 8,
  },
  selectedImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 10,
    zIndex: 2,
  },
});

export default ChatInput;
