import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Home from './Home';
import Explore from './Explore';
import Rate from './Rate';
import Profile from './Profile';
import Passport from './Passport';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import Entypo from 'react-native-vector-icons/Entypo';

const Tab = createBottomTabNavigator();

function TabNavigation() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          height: 90, 
          paddingBottom: 10, 
          paddingTop: 10,
        },
      }}>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeBackground]}>
              <Feather name="globe" size={24} color={focused ? '#1F5D02' : 'black'} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Explore"
        component={Explore}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeBackground]}>
              <MaterialIcons name="explore" size={24} color={focused ? '#1F5D02' : 'black'} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Rate"
        component={Rate}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeBackground]}>
              <Entypo name="map" size={24} color={focused ? '#1F5D02' : 'black'} />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Passport"
        component={Passport}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeBackground]}>
              <Fontisto name="passport-alt" size={24} color={focused ? '#1F5D02' : 'black'} />
            </View>
          ),
        }}
      />
      <Tab.Screen
  name="Profile"
  component={Profile}
  options={{
    tabBarIcon: ({ focused }) => (
      <View style={[styles.iconContainer, focused && styles.activeBackground]}>
        <View style={styles.profileIconContainer}>
          <Image
            source={require('../../assets/images/profilepicture.jpeg')}
            style={styles.profileImage}
          />
        </View>
      </View>
    ),
  }}
/>

    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeBackground: {
    backgroundColor: '#2E7D32'
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor:'rgb(255, 255, 255)',
  },
  profileImage: {
    width: 40,
    height: 40,
  },
});

export default TabNavigation;
