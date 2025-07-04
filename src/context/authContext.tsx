import React, { createContext, useState, useEffect, useContext } from "react";
import { getProfile, deleteFcmToken } from "../lib/api";
import { getToken, removeToken } from "../../utils/token";
import { User } from "../../utils/type";
import { getMessaging, getToken as getFirebaseToken } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';

// Define the shape of our context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
  refreshUser: async () => {},
  logout: async () => {},
});

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile data
  const fetchUserProfile = async () => {
    try {
      setError(null);
      
      const response = await getProfile();
      
      if (response?.success) {
        setUser(response?.data?.user);
      } else {
        setError(response.message || "Failed to fetch user profile");
        // If we can't get the profile, we should logout
        await removeToken();
        setUser(null);
      }
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError(err.message || "An error occurred while fetching your profile");
      // If there's an error, clear user data
      await removeToken();
      setUser(null);
    }
  };

  // Check for existing auth on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        if (token) {
          await fetchUserProfile();
        }
      } catch (err) {
        console.error("Auth check error:", err);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Function to manually refresh user data
  const refreshUser = async () => {
    await fetchUserProfile();
  };

  const getFcmTokenSomehow = async () => {
    try {
      const app = getApp();
      const messaging = getMessaging(app);
      const token = await getFirebaseToken(messaging);
      console.log('[FCM] Token:', token);
      return token;
    } catch (error) {
      console.error('[FCM] Error getting token:', error);
      return null;
    }
  };

  // Function to handle logout
  const logout = async () => {
    try {
      const fcmToken = await getFcmTokenSomehow();
      if (fcmToken) {
        console.log('[Logout] FCM token to delete:', fcmToken);
        await deleteFcmToken(fcmToken);
      }
      await removeToken();
      setUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Define the value object that will be provided to consumers
  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    refreshUser,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

export default AuthContext;