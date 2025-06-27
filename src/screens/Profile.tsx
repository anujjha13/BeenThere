import React, {useCallback, useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Modal,
  StatusBar,
  Alert,
  TouchableWithoutFeedback,
  TextInput,
  Platform,
} from 'react-native';

import TopDestinations from './TopDestinations';
import Wishlist from './Wishlist';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {User, Highlight, Wishlist as WishlistType} from '../../utils/type';
import {getProfile} from '../lib/api';
import {changePassword} from '../lib/api';
import {removeToken} from '../../utils/token';
import {removeUserId} from '../../utils/token';
import {useAuth} from '../context/authContext';
import {Dimensions} from 'react-native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import {useFocusEffect} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

const {width, height} = Dimensions.get('window');

interface Stats {
  totalFollowing: number;
  totalPosts: number;
  totalFollowers: number;
  compareStats?: {
    continent: number;
    country: number;
    city: number;
  };
  compareFromOthers?:number;
  numberOfReviews?:number;
}

interface ProfileProps {
  navigation: NativeStackNavigationProp<any>;
}

const Profile = ({navigation}: ProfileProps) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const {refreshUser} = useAuth();

  const [showComparison, setShowComparison] = useState(false);
  const [showTopDestinations, setShowTopDestinations] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showLogOutOptions, setShowLogOutOptions] = useState(false);
  const [activeTab, setActiveTab] = useState('continents');
  const [topDestinationType, setTopDestinationType] = useState<{
    filterType?: string;
    filterValue?: string;
  }>({});

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const topCities: Highlight[] =
    profile?.Highlights?.filter((h: Highlight) => h?.type === 'city') || [];
  const topCountry: Highlight[] =
    profile?.Highlights?.filter((h: Highlight) => h?.type === 'country') || [];
  const topContinent: Highlight[] =
    profile?.Highlights?.filter((h: Highlight) => h?.type === 'continent') ||
    [];

  useEffect(() => {
    refreshUser();
    fetchProfile();
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log('Profile screen focused - fetching fresh data');
      refreshUser();
      fetchProfile();
      // Optional cleanup function if needed
      return () => {
        console.log('Profile screen blurred');
        // Any cleanup code here
      };
    }, []),
  );

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      console.log('Profile response:', response);

      if (response.success) {
        setProfile(response?.data?.user);
        setStats(response?.data?.stats);
      } else {
        setError(response.message || 'Failed to load profile data');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // fetchProfile();

  const capitalizeName = (name: string | null | undefined): string => {
    if (!name) return '';
    return name
      .toLowerCase()
      .split(' ')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  const toggleComparison = () => {
    setShowComparison(!showComparison);
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Yes',
          onPress: async () => {
            console.log('Logged out'); // Replace with your logout logic
            await removeToken();
            navigation.navigate('Login');
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
          },
        },
      ],
      {cancelable: true},
    );
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match');
      return;
    }

    try {
      const response = await changePassword(
        currentPassword,
        newPassword,
        confirmPassword,
      );
      if (response.status === 200) {
        setErrorMessage('');
        setShowChangePasswordModal(false);
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000); // Auto-hide after 3
      } else if (response.status === 400) {
        setErrorMessage('Validation error. Please check your inputs.');
      } else if (response.status === 404) {
        setErrorMessage('User not found.');
      } else if (response.status === 500) {
        setErrorMessage('Internal server error. Please try again later.');
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Change password error:', error);
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: () => {
            console.log('Account deleted'); // Replace with delete logic
            removeUserId();
          },
        },
      ],
      {cancelable: true},
    );
  };

  const handleOpenTopDestinationModal = (
    filterType: string,
    filterValue: string,
  ) => {
    setShowTopDestinations(true);
    setTopDestinationType({filterType, filterValue});
  };
  return (
    <SafeAreaView style={styles.container}>
      <GradientScreenWrapper>
        <StatusBar barStyle="dark-content" />
        <ScrollView>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={24} color="black" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              {capitalizeName(profile?.full_name)}
            </Text>
            <TouchableOpacity>
              <SimpleLineIcons
                name="location-pin"
                size={24}
                color="transparent"
              />
            </TouchableOpacity>
          </View>

          {/* Profile Card */}
          <View style={styles.profileCard}>
            {/* <View style={{flex:1 ,flexDirection: "row", alignItems: "center",justifyContent:"space-between"}}> */}
            <View style={styles.profileImageContainer}>
              <Image
                source={
                  profile?.image
                    ? {uri: profile?.image}
                    : require('../../assets/images/profilepicture.png')
                }
                style={styles.profileImage}
              />
            </View>
            <TouchableOpacity
              onPress={() => setShowLogOutOptions(true)}
              style={styles.dot}>
              <Entypo name="dots-three-vertical" size={24} color="#4CAF50" />
            </TouchableOpacity>
            <Text style={styles.profileName}>
              {capitalizeName(profile?.full_name)}
            </Text>
            <Text style={styles.profileLocation}>
              {profile?.location_sharing}
            </Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{stats?.totalPosts || 0}</Text>
                <Text style={styles.statLabel}>Posts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats?.totalFollowers || 0}
                </Text>
                <Text style={styles.statLabel}>Followers</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>
                  {stats?.totalFollowing || 0}
                </Text>
                <Text style={styles.statLabel}>Following</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Passport')}>
                <Fontisto name="passport-alt" size={14} color="#2E7D32" />
                <Text style={styles.actionButtonText}>My Passport</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.push('EditProfileScreen')}>
                <Ionicons name="settings-outline" size={16} color="#4CAF50" />
                <Text style={styles.actionButtonText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Highlights Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {capitalizeName(profile?.full_name)}'s Highlights
              </Text>
              <TouchableOpacity
                style={styles.compareButton}
                onPress={toggleComparison}>
                <Text style={styles.compareButtonText}>Compare To Others</Text>
              </TouchableOpacity>
            </View>

            {!showComparison ? (
              <View style={styles.highlightsContainer}>
                <View style={styles.highlightItem}>
                  <View style={styles.highlightItemCard}>
                    <FontAwesome name="globe" size={24} color="#4CAF50" />
                    <Text style={styles.highlightNumber}>
                      {profile?.Highlights?.filter(h => h?.type === 'continent')
                        .length || 0}
                    </Text>
                  </View>
                  <Text style={styles.highlightLabel}>Continents</Text>
                </View>
                <View style={styles.highlightItem}>
                  <View style={styles.highlightItemCard}>
                    <Ionicons name="flag-outline" size={24} color="#4CAF50" />
                    <Text style={styles.highlightNumber}>
                      {profile?.Highlights?.filter(h => h?.type === 'country')
                        .length || 0}
                    </Text>
                  </View>
                  <Text style={styles.highlightLabel}>Countries</Text>
                </View>
                <View style={styles.highlightItem}>
                  <View style={styles.highlightItemCard}>
                    <Ionicons
                      name="location-outline"
                      size={24}
                      color="#4CAF50"
                    />
                    <Text style={styles.highlightNumber}>
                      {profile?.Highlights?.filter(h => h?.type === 'city')
                        .length || 0}
                    </Text>
                  </View>
                  <Text style={styles.highlightLabel}>Cities</Text>
                </View>
              </View>
            ) : (
              <View style={styles.highlightsComparisonContainer}>
                <View style={styles.highlightComparisonItem}>
                  <View style={styles.highlightComparisonLeft}>
                    <View style={styles.highlightItemCard}>
                      <FontAwesome name="globe" size={24} color="#4CAF50" />
                      <Text style={styles.highlightNumber}>{profile?.Highlights?.filter(h => h?.type === 'continent')
                        .length || 0}</Text>
                    </View>
                    <Text style={styles.highlightLabel}>Continents</Text>
                  </View>
                  <View style={styles.comparisonChart}>
                    <View style={styles.comparisonRing}>
                      <Text style={styles.comparisonPercentage}>{stats?.compareStats?.continent || 0}%</Text>
                    </View>
                    <Text style={styles.highlightLabel}>From Followers</Text>
                  </View>
                </View>

                <View style={styles.highlightComparisonItem}>
                  <View style={styles.highlightComparisonLeft}>
                    <View style={styles.highlightItemCard}>
                      <Ionicons name="flag-outline" size={24} color="#4CAF50" />
                      <Text style={styles.highlightNumber}>{profile?.Highlights?.filter(h => h?.type === 'country')
                        .length || 0}</Text>
                    </View>
                    <Text style={styles.highlightLabel}>Countries</Text>
                  </View>
                  <View style={styles.comparisonChart}>
                    <View style={styles.comparisonRing}>
                      <Text style={styles.comparisonPercentage}>{stats?.compareStats?.country || 0}%</Text>
                    </View>
                    <Text style={styles.highlightLabel}>From Followers</Text>
                  </View>
                </View>

                <View style={styles.highlightComparisonItem}>
                  <View style={styles.highlightComparisonLeft}>
                    <View style={styles.highlightItemCard}>
                      <Ionicons
                        name="location-outline"
                        size={24}
                        color="#4CAF50"
                      />
                      <Text style={styles.highlightNumber}>{profile?.Highlights?.filter(h => h?.type === 'city')
                        .length || 0}</Text>
                    </View>
                    <Text style={styles.highlightLabel}>Cities</Text>
                  </View>
                  <View style={styles.comparisonChart}>
                    <View style={styles.comparisonRing}>
                      <Text style={styles.comparisonPercentage}>{stats?.compareStats?.city || 0}%</Text>
                    </View>
                    <Text style={styles.highlightLabel}>From Followers</Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Top Destinations Section */}
          <TouchableOpacity style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {capitalizeName(profile?.full_name)}'s Top Destinations
              </Text>
            </View>
            <View style={styles.tabsContainer}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'continents' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('continents')}>
                <Ionicons name="globe-outline" size={16} color="#4CAF50" />
                <Text style={styles.tabText}>Continents</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'countries' && styles.activeTab,
                ]}
                onPress={() => setActiveTab('countries')}>
                <Ionicons name="flag-outline" size={16} color="#4CAF50" />
                <Text style={styles.tabText}>Countries</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'cities' && styles.activeTab]}
                onPress={() => setActiveTab('cities')}>
                <Ionicons name="location-outline" size={16} color="#4CAF50" />
                <Text style={styles.tabText}>Cities</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.destinationsContainer}>
              {activeTab === 'continents'
                ? topContinent?.map(item => (
                    <TouchableOpacity
                      onPress={() =>
                        handleOpenTopDestinationModal('continent', item?.value)
                      }
                      key={item?.id}
                      style={styles.destinationItem}>
                      <Ionicons name="location" size={16} color="#FFC107" />
                      <Text style={styles.destinationText}>
                        {capitalizeName(item?.value)}
                      </Text>
                    </TouchableOpacity>
                  ))
                : activeTab === 'countries'
                ? topCountry?.map(item => (
                    <TouchableOpacity
                      onPress={() =>
                        handleOpenTopDestinationModal('country', item?.value)
                      }
                      key={item?.id}
                      style={styles.destinationItem}>
                      <Ionicons name="location" size={16} color="#FFC107" />
                      <Text style={styles.destinationText}>
                        {capitalizeName(item?.value)}
                      </Text>
                    </TouchableOpacity>
                  ))
                : topCities?.map(item => (
                    <TouchableOpacity
                      onPress={() =>
                        handleOpenTopDestinationModal('city', item?.value)
                      }
                      key={item?.id}
                      style={styles.destinationItem}>
                      <Ionicons name="location" size={16} color="#FFC107" />
                      <Text style={styles.destinationText}>
                        {capitalizeName(item?.value)}
                      </Text>
                    </TouchableOpacity>
                  ))}
            </View>
          </TouchableOpacity>

          {/* Wishlist Section */}
          <TouchableOpacity
            style={styles.sectionCard}
            onPress={() => setShowWishlist(true)}>
            <View>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {capitalizeName(profile?.full_name)}'s Wishlist
                </Text>
              </View>
              <View style={styles.wishlistContainer}>
                {profile?.Wishlists?.length ? (
                  profile.Wishlists.map((item: WishlistType) => (
                    <View key={item.id} style={styles.wishlistItem}>
                      <Ionicons name="location" size={16} color="#FFC107" />
                      <Text style={styles.wishlistText}>
                        {capitalizeName(item.destination)}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.wishlistText}>No items in wishlist</Text>
                )}
              </View>
            </View>
          </TouchableOpacity>

          {/* Reviews Section */}
          <View style={styles.sectionCard}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Reviews</Text>
              <TouchableOpacity style={styles.compareButton}>
                <Text style={styles.seeAllText}>See Reviews</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.reviewsContainer}>
              <View style={styles.reviewsLeft}>
                <View style={styles.reviewsLeftDesc}>
                  <AntDesign name="staro" size={24} color="#4CAF50" />
                  <Text style={styles.reviewsNumber}>{stats?.numberOfReviews || 0}</Text>
                </View>
                <Text style={styles.reviewsLabel}>Reviews</Text>
              </View>
              <View style={styles.comparisonChart}>
                <View style={styles.comparisonRing}>
                  <Text style={styles.comparisonPercentage}>{stats?.compareFromOthers || 0}%</Text>
                </View>
                <Text style={styles.highlightLabel}>From Followers</Text>
              </View>
            </View>
          </View>

          {/* See Where Button */}
          <TouchableOpacity
            style={styles.seeWhereButton}
            onPress={() =>
              navigation.navigate('UserPosts', {
                userId: profile?.id,
                name: profile?.full_name,
              })
            }>
            <View style={styles.seeWhereContainer}>
              <Text style={styles.seeWhereButtonText}>
                See Where {capitalizeName(profile?.full_name)} Has Been
              </Text>
              <View style={styles.iconWrapper}>
                <AntDesign name="arrowright" size={20} color="black" />
              </View>
            </View>
          </TouchableOpacity>

          {/* Top Destinations Modal */}
          <Modal
            visible={showTopDestinations}
            animationType="slide"
            presentationStyle="overFullScreen"
            onRequestClose={() => setShowTopDestinations(false)}>
            <TopDestinations
              navigation={{goBack: () => setShowTopDestinations(false)}}
              filterType={topDestinationType?.filterType}
              filterValue={topDestinationType?.filterValue}
            />
          </Modal>

          <Modal
            visible={showWishlist}
            animationType="slide"
            presentationStyle="overFullScreen"
            onRequestClose={() => setShowWishlist(false)}>
            <Wishlist navigation={{goBack: () => setShowWishlist(false)}} />
          </Modal>

          <Modal
            transparent
            visible={showLogOutOptions}
            animationType="fade"
            onRequestClose={() => setShowLogOutOptions(false)}>
            <TouchableOpacity
              activeOpacity={1}
              onPressOut={() => setShowLogOutOptions(false)}
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.3)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  backgroundColor: 'white',
                  borderRadius: 10,
                  padding: 20,
                  width: 250,
                }}>
                <TouchableOpacity
                  onPress={() => {
                    setShowLogOutOptions(false);
                    handleLogout();
                  }}
                  style={{
                    padding: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ccc',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '600',
                        color: '#4CAF50',
                      }}>
                      Logout{' '}
                    </Text>
                    <Entypo name="log-out" size={20} color="red" />
                  </View>
                </TouchableOpacity>

                {/* Change Password Option */}
                <TouchableOpacity
                  onPress={() => {
                    setShowLogOutOptions(false);
                    setShowChangePasswordModal(true);
                  }}
                  style={{
                    padding: 20,
                    borderBottomWidth: 1,
                    borderBottomColor: '#ccc',
                  }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: '600',
                        color: '#2196F3',
                      }}>
                      Change Password
                    </Text>
                    <Entypo name="key" size={20} color="#2196F3" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setShowLogOutOptions(false);
                    handleDeleteAccount();
                  }}
                  style={{padding: 20}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                    <Text
                      style={{fontSize: 20, fontWeight: '600', color: 'red'}}>
                      Delete Account
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Modal>

          <Modal
            transparent
            visible={showChangePasswordModal}
            animationType="slide"
            onRequestClose={() => setShowChangePasswordModal(false)}>
            <TouchableOpacity
              activeOpacity={1}
              onPressOut={() => setShowChangePasswordModal(false)}
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.3)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <TouchableWithoutFeedback>
                <View
                  style={{
                    backgroundColor: 'white',
                    borderRadius: 10,
                    padding: 20,
                    width: '85%',
                  }}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: 'bold',
                      marginBottom: 10,
                    }}>
                    Change Password
                  </Text>

                  <TextInput
                    placeholder="Current Password"
                    placeholderTextColor="#888"
                    secureTextEntry
                    style={styles.inputStyle}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                  />
                  <TextInput
                    placeholder="New Password"
                    placeholderTextColor="#888"
                    secureTextEntry
                    style={styles.inputStyle}
                    value={newPassword}
                    onChangeText={setNewPassword}
                  />
                  <View>
                    <TextInput
                      placeholder="Confirm New Password"
                      placeholderTextColor="#888"
                      secureTextEntry={!showCurrentPassword}
                      style={styles.inputStyle}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                    <TouchableOpacity
                      style={{position: 'absolute', right: 20, top: 18}}
                      onPress={() => setShowCurrentPassword(prev => !prev)}>
                      <Text>{showCurrentPassword ? '🙈' : '👁'}</Text>
                    </TouchableOpacity>
                  </View>
                  {errorMessage ? (
                    <Text style={{color: 'red', marginBottom: 10}}>
                      {errorMessage}
                    </Text>
                  ) : null}

                  <TouchableOpacity
                    onPress={handleChangePassword}
                    style={{
                      backgroundColor: '#2E7D32',
                      padding: 12,
                      borderRadius: 8,
                      alignItems: 'center',
                      marginTop: 10,
                    }}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>
                      Submit
                    </Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </TouchableOpacity>
          </Modal>

          {showSuccessMessage && (
            <View
              style={{
                position: 'absolute',
                top: height * 0.5,
                alignSelf: 'center',
                backgroundColor: 'white',
                borderRadius: 10,
                padding: 15,
                flexDirection: 'row',
                alignItems: 'center',
                elevation: 5,
              }}>
              <AntDesign
                name="checkcircle"
                size={24}
                color="#2E7D32"
                style={{marginRight: 10}}
              />
              <Text style={{color: '#4F8A10', fontWeight: 'bold'}}>
                Password changed successfully
              </Text>
            </View>
          )}
        </ScrollView>
      </GradientScreenWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: Platform.OS === 'ios' ? height * 0.02 : height * 0.04,
    backgroundColor: 'white',
    borderBottomWidth: 0.3,
    borderBottomColor: 'rgb(118, 118, 118)',
    paddingBottom: height * 0.02,
    marginBottom: height * 0.01,
  },
  headerTitle: {
    fontSize: Math.min(22, width * 0.055),
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: 'white',
    padding: width * 0.05,
    alignItems: 'center',
    marginBottom: height * 0.025,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: width * 0.03,
  },
  profileImageContainer: {
    borderRadius: width * 0.11,
    borderWidth: 2,
    borderColor: '#4CAF50',
    marginBottom: height * 0.015,
    marginTop: height * 0.015,
  },
  dot: {
    position: 'absolute',
    top: height * 0.02,
    right: width * 0.025,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
  },
  profileImage: {
    width: width * 0.18,
    height: width * 0.18,
    borderRadius: width * 0.09,
  },
  profileName: {
    fontSize: Math.min(18, width * 0.045),
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: Math.min(14, width * 0.035),
    color: '#666',
    marginBottom: height * 0.02,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: height * 0.02,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F5D02',
    borderRadius: 8,
    paddingVertical: height * 0.01,
    marginHorizontal: width * 0.01,
    width: width * 0.25,
  },
  statNumber: {
    fontSize: Math.min(16, width * 0.04),
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: Math.min(12, width * 0.03),
    color: '#666',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.04,
    flex: 1,
    marginHorizontal: width * 0.01,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: Math.min(14, width * 0.035),
  },
  sectionCard: {
    backgroundColor: 'white',
    padding: width * 0.05,
    marginBottom: height * 0.025,
    borderRadius: 12,
    marginHorizontal: width * 0.03,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  sectionTitle: {
    fontSize: Math.min(20, width * 0.05),
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'Public-Sans',
  },
  compareButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: width * 0.03,
    paddingVertical: height * 0.008,
    borderRadius: 6,
  },
  compareButtonText: {
    color: '#4CAF50',
    fontSize: Math.min(12, width * 0.03),
    fontWeight: '400',
    fontFamily: 'Public-Sans',
  },
  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // height: height * 0.09,
  },
  highlightItem: {
    alignItems: 'center',
    flex: 1,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginHorizontal: width * 0.01,
    marginVertical: height * 0.01,
  },
  highlightItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: height * 0.01,
  },
  highlightNumber: {
    fontSize: Math.min(18, width * 0.045),
    fontWeight: 'bold',
    marginLeft: width * 0.04,
  },
  highlightLabel: {
    fontSize: Math.min(12, width * 0.03),
    fontFamily: 'Public-Sans',
    color: '#666',
    padding: 4,
  },
  highlightsComparisonContainer: {
    flexDirection: 'column',
    gap: height * 0.015,
  },
  highlightComparisonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: width * 0.03,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'rgb(245, 255, 249)',
  },
  highlightComparisonLeft: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  comparisonChart: {
    flexDirection: 'row',
    width: width * 0.15,
    height: width * 0.15,
    justifyContent: 'space-between',
    marginRight: width * 0.15,
    alignItems: 'center',
  },
  comparisonRing: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    borderWidth: 3,
    borderColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonPercentage: {
    fontSize: Math.min(14, width * 0.035),
    fontWeight: 'bold',
  },
  comparisonLabel: {
    fontSize: Math.min(12, width * 0.03),
    color: '#666',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: height * 0.02,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'space-between',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.03,
    //borderRadius: 16,
    //marginRight: width * 0.02,
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    marginLeft: 4,
    fontSize: Math.min(14, width * 0.035),
  },
  destinationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: width * 0.04,
    marginBottom: height * 0.01,
  },
  destinationText: {
    marginLeft: 4,
    fontSize: Math.min(14, width * 0.035),
  },
  wishlistContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: width * 0.035,
  },
  wishlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.015,
  },
  wishlistText: {
    marginLeft: 8,
    fontSize: Math.min(14, width * 0.035),
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: Math.min(14, width * 0.035),
  },
  reviewsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: height * 0.008,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: 'rgb(245, 255, 249)',
  },
  reviewsLeft: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  reviewsLeftDesc: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reviewsNumber: {
    fontSize: Math.min(24, width * 0.06),
    fontWeight: 'bold',
    marginLeft: width * 0.025,
  },
  reviewsLabel: {
    fontSize: Math.min(12, width * 0.03),
    color: '#666',
  },
  reviewsRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsChart: {
    width: width * 0.15,
    height: width * 0.15,
    borderRadius: width * 0.075,
    borderWidth: 3,
    borderColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsPercentage: {
    fontSize: Math.min(14, width * 0.035),
    fontWeight: 'bold',
  },
  reviewsComparisonLabel: {
    fontSize: Math.min(8, width * 0.02),
    color: '#666',
    textAlign: 'center',
  },
  seeWhereButton: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    borderRadius: 24,
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: width * 0.03,
    marginBottom: height * 0.03,
    marginTop: height * 0.01,
  },
  seeWhereContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  seeWhereButtonText: {
    color: 'white',
    fontSize: Math.min(20, width * 0.05),
    fontWeight: '500',
  },
  iconWrapper: {
    backgroundColor: '#fff',
    padding: width * 0.025,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputStyle: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: height * 0.015,
    marginBottom: height * 0.015,
    color: '#222',
    fontSize: Math.min(16, width * 0.04),
    backgroundColor: '#fff',
  },
});

export default Profile;
