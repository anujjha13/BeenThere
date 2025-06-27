import messaging from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

class NotificationService {
  static async requestUserPermission() {
    if (Platform.OS === 'ios') {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      return enabled;
    } else if (Platform.OS === 'android') {
      return await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
    }
  }

  static async getFCMToken() {
    try {
      const fcmToken = await AsyncStorage.getItem('fcmToken');
      
      if (!fcmToken) {
        const newToken = await messaging().getToken();
        if (newToken) {
          await AsyncStorage.setItem('fcmToken', newToken);
          return newToken;
        }
      }
      
      return fcmToken;
    } catch (error) {
      console.error('Error getting FCM token:', error);
      return null;
    }
  }

  static async updateFCMToken() {
    try {
      const newToken = await messaging().getToken();
      if (newToken) {
        await AsyncStorage.setItem('fcmToken', newToken);
        return newToken;
      }
    } catch (error) {
      console.error('Error updating FCM token:', error);
    }
  }

  static async onMessageReceived(callback: (message: any) => void) {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      callback(remoteMessage);
    });

    // Handle foreground messages
    return messaging().onMessage(async remoteMessage => {
      console.log('Received foreground message:', remoteMessage);
      callback(remoteMessage);
    });
  }

  static async saveFCMTokenToFirestore(userId: string, token: string) {
    try {
      const firestore = require('@react-native-firebase/firestore').default();
      await firestore
        .collection('users')
        .doc(userId)
        .update({
          fcmToken: token,
          lastTokenUpdate: firestore.FieldValue.serverTimestamp(),
        });
    } catch (error) {
      console.error('Error saving FCM token to Firestore:', error);
    }
  }
}

export default NotificationService; 