import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {NavigationContainer } from '@react-navigation/native';
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
import MessageInner from './src/screens/MessageInner';
import { getToken } from './utils/token';
const Stack = createNativeStackNavigator();

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Startup" component={Startup} />
    <Stack.Screen name="Login" component={Login} />
    <Stack.Screen name="SignUp" component={SignUp} />
    <Stack.Screen name="SignUp1" component={SignUp1} />
    <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    <Stack.Screen name="TabNavigation" component={TabNavigation} />
  </Stack.Navigator>
);

const MainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="TabNavigation" component={TabNavigation} />
    <Stack.Screen name="Profile" component={Profile} />
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
    <Stack.Screen name="MapInner" component={MessageInner} />
  </Stack.Navigator>
);

// const StackNavigator = () => {
//   return (
//     <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
//       <Stack.Screen name="Startup" component={Startup}  />
//       <Stack.Screen name="Login" component={Login} />
//       <Stack.Screen name="Splash" component={Splash} />
//       <Stack.Screen name="SignUp" component={SignUp} />
//       <Stack.Screen name="SignUp1" component={SignUp1} />
//       <Stack.Screen name="Profile" component={Profile} />
//       <Stack.Screen name="TabNavigation" component={TabNavigation} />
//       <Stack.Screen name="Wishlist" component={Wishlist} />
//       <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
//       <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
//       <Stack.Screen name="PostDetails" component={PostDetails} />
//       <Stack.Screen name="TravelersList" component={TravelersList} />
//       <Stack.Screen name="LocationDetails" component={LocationDetails} />
//       <Stack.Screen name="InstagramRating" component={InstagramRating} />
//       <Stack.Screen name="CustomRating" component={CustomRating} />
//       <Stack.Screen name="Passport" component={Passport} />
//       <Stack.Screen name="Map" component={Map} />
//       {/* Add other screens here */}
//     </Stack.Navigator>
//   );
// }

const App = () => {
   const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists when app starts
    const checkToken = async () => {
      try {
        const token = await getToken();
        setIsAuthenticated(!!token); // Convert to boolean
      } catch (error) {
        console.error('Error checking authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  if (isLoading) {
    // Show splash screen while checking auth status
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={Splash} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }
  return (
    <GradientScreenWrapper>
      <NavigationContainer>
        {isAuthenticated ? (
          <MainStack />
        ) : (
          <AuthStack />
        )}
      </NavigationContainer>
    </GradientScreenWrapper>
  );
};

export default App;

