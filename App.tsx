import React, { useState, useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Splash from './src/screens/Splash';
import Startup from './src/screens/Startup';
import Login from './src/screens/Login';
import SignUp from './src/screens/SignUp';
import SignUp1 from './src/screens/SignUp1';
import TabNavigation from './src/screens/TabNavigation';
import TravelersList from './src/screens/TravelersList';
import GradientScreenWrapper from './utils/GradientScreenWrapper';
//import TopDestinations from './src/screens/TopDestinations';
import Wishlist from './src/screens/Wishlist';
import Profile from './src/screens/Profile';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ForgotPassword from './src/screens/ForgotPassword';
import PostDetails from './src/screens/PostDetails';
import LocationDetails from './src/screens/LocationDetails';
import InstagramRating from './src/screens/InstagramRating';
import CustomRating from './src/screens/CustomRating';
import Passport from './src/screens/Passport';
import Map from './src/screens/Map';
import Message from './src/screens/Message';
import ChatList from './src/screens/ChatList';
//import Chat from './src/screens/Chat';
import MessageInner from './src/screens/MessageInner';
import { AuthProvider, useAuth } from './src/context/authContext';
import UserProfile from './src/screens/UserProfile';
import UserPosts from './src/screens/UserPosts';
import TermsModal from './src/screens/TermsModal';
import { acceptTerms, checkTermsAccepted } from './src/lib/api';
import { getToken } from './utils/token';

// Declare global crypto type
declare global {
  interface Crypto {
    getRandomValues: (array: ArrayBuffer) => ArrayBuffer;
  }
  
  var crypto: Crypto;
}

const Stack = createNativeStackNavigator();

// Only set crypto if it's undefined
if (typeof global.crypto === 'undefined') {
  const getRandomValues = require('react-native-get-random-values').getRandomValues;
  Object.defineProperty(global, 'crypto', {
    value: {
      getRandomValues: (array: ArrayBuffer) => getRandomValues(array)
    }
  });
}

const AuthStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Startup" component={Startup} />
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="SignUp" component={SignUp} />
    <Stack.Screen name="SignUp1" component={SignUp1} />
    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    <Stack.Screen name="TabNavigation" component={TabNavigation} />
    <Stack.Screen name="CustomRating" component={CustomRating} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="Message" component={Message} />
    <Stack.Screen name="MessageInner" component={MessageInner} />
    <Stack.Screen name="Wishlist" component={Wishlist} />
    <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
    <Stack.Screen name="PostDetails" component={PostDetails} />
    <Stack.Screen name="TravelersList" component={TravelersList} />
    <Stack.Screen name="LocationDetails" component={LocationDetails} />
    <Stack.Screen name="InstagramRating" component={InstagramRating} />
    <Stack.Screen name="UserProfile" component={UserProfile} />
    <Stack.Screen name="UserPosts" component={UserPosts} />
    <Stack.Screen name="ChatList" component={ChatList} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="TabNavigation" component={TabNavigation} />
    <Stack.Screen name="Profile" component={Profile} />
    <Stack.Screen name="SignUp" component={SignUp} />
    <Stack.Screen name="SignUp1" component={SignUp1} />
    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="Wishlist" component={Wishlist} />
    <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
    <Stack.Screen name="PostDetails" component={PostDetails} />
    <Stack.Screen name="TravelersList" component={TravelersList} />
    <Stack.Screen name="LocationDetails" component={LocationDetails} />
    <Stack.Screen name="InstagramRating" component={InstagramRating} />
    <Stack.Screen name="CustomRating" component={CustomRating} />
    <Stack.Screen name="Passport" component={Passport} />
    <Stack.Screen name="Map" component={Map} />
    <Stack.Screen name="Message" component={Message} />
    <Stack.Screen name="MessageInner" component={MessageInner} />
    <Stack.Screen name="UserProfile" component={UserProfile} />
    <Stack.Screen name="UserPosts" component={UserPosts} />
    <Stack.Screen name="ChatList" component={ChatList} />
  </Stack.Navigator>
);

const AppContent = () => {
  const {isAuthenticated, loading} = useAuth();
  const [showTerms, setShowTerms] = useState(false);
  const [checkingTerms, setCheckingTerms] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const checkTerms = async () => {
      if (isAuthenticated) {
        setCheckingTerms(true);
        const t = await getToken();
        setToken(t);
        if (t) {
          try {
            const res = await checkTermsAccepted(t);
            if (res?.data?.data?.terms_accepted) {
              setShowTerms(false);
            } else {
              setShowTerms(true);
            }
          } catch (e) {
            setShowTerms(true);
          }
        } else {
          setShowTerms(false);
        }
        setCheckingTerms(false);
      } else {
        setShowTerms(false);
      }
    };
    checkTerms();
  }, [isAuthenticated]);

  const handleAcceptTerms = async () => {
    if (token) {
      try {
        await acceptTerms(token);
        setShowTerms(false);
      } catch (e) {
        // Optionally show error to user
      }
    }
  };

  if (loading || checkingTerms) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{headerShown: false}}>
          <Stack.Screen name="Splash" component={Splash} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <>
      <NavigationContainer>
        {isAuthenticated ? <MainStack /> : <AuthStack />}
      </NavigationContainer>
      <TermsModal visible={showTerms} onAccept={handleAcceptTerms} />
    </>
  );
};

const App = () => {
  return (
    <>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </>
  );
};

export default App;
