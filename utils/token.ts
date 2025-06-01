import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'auth_token';
const USER_ID = 'user_id';

export const storeToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

export const storeUserId = async (userId: string) => {
  try {
    await AsyncStorage.setItem(USER_ID, userId);
  } catch (error) {
    console.error('Error storing token:', error);
  }
};

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting token:', error);
    return null;
  }
};

export const getUserId = async () => {
  try {
    return await AsyncStorage.getItem(USER_ID);
  } catch (error) {
    console.error('Error getting UserId:', error);
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing token:', error);
  }
};

export const removeUserId = async () => {
  try {
    await AsyncStorage.removeItem(USER_ID);
  } catch (error) {
    console.error('Error removing userId:', error);
  }
};