import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {NavigationContainer } from '@react-navigation/native';
import Splash from './src/screens/Splash';
import Startup from './src/screens/Startup';
import Login from './src/screens/Login';
import SignUp from './src/screens/SignUp';
import SignUp1 from './src/screens/SignUp1';
import TabNavigation from './src/screens/TabNavigation';
//import TopDestinations from './src/screens/TopDestinations';
import Wishlist from './src/screens/Wishlist';
import Profile from './src/screens/Profile';
import EditProfileScreen from './src/screens/EditProfileScreen';
import ForgotPassword from './src/screens/ForgotPassword';
const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Startup" component={Startup}  />
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="SignUp1" component={SignUp1} />
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="TabNavigation" component={TabNavigation} />
      <Stack.Screen name="Wishlist" component={Wishlist} />
      <Stack.Screen name="EditProfileScreen" component={EditProfileScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
      {/* Add other screens here */}
    </Stack.Navigator>
  );
}

const App = () => {
  return (
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
  );
}

export default App;

