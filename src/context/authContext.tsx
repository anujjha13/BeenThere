import React, { createContext, useState, useEffect, useContext } from "react";
import { getProfile } from "../lib/api";
import { getToken, removeToken } from "../../utils/token";
import { User } from "../../utils/type";

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

  // Function to handle logout
  const logout = async () => {
    try {
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