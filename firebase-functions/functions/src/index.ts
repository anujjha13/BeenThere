import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

interface NotificationData {
  recipientId: string;
  message: {
    title: string;
    body: string;
    data?: {
      chatId: string;
      messageId: string;
      type: string;
      senderId: string;
      senderName: string;
    };
  };
}

export const sendChatNotification = functions.https.onCall(
  async (data: NotificationData, context) => {
    // Ensure the user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to send notifications.',
      );
    }

    try {
      // Get recipient's FCM token
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(data.recipientId)
        .get();

      const recipientData = userDoc.data();
      if (!recipientData?.fcmToken) {
        console.log('No FCM token found for user:', data.recipientId);
        return;
      }

      // Construct notification message
      const message = {
        token: recipientData.fcmToken,
        notification: {
          title: data.message.title,
          body: data.message.body,
        },
        data: {
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
          ...data.message.data,
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'chat_messages',
            priority: 'high',
            defaultSound: true,
            defaultVibrateTimings: true,
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
              contentAvailable: true,
            },
          },
        },
      };

      // Send the notification
      const response = await admin.messaging().send(message);
      console.log('Successfully sent notification:', response);

      return { success: true };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw new functions.https.HttpsError(
        'internal',
        'Error sending notification.',
      );
    }
  },
); 