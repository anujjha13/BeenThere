import React, {act, useEffect, useState} from 'react';
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
  ActivityIndicator,
  Dimensions,
  Linking,
} from 'react-native';

import TopDestinations from './TopDestinations';
import Wishlist from './Wishlist';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Entypo from 'react-native-vector-icons/Entypo';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import Fontisto from 'react-native-vector-icons/Fontisto';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import {User} from '../../utils/type';
import {followUser, getProfile, getUserProfile} from '../lib/api';
import {removeToken} from '../../utils/token';
import {useRoute} from '@react-navigation/native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
const {width, height} = Dimensions.get('window');

interface Stats {
  totalFollowing: number;
  totalPosts: number;
  totalFollowers: number;
}

const UserProfile = ({navigation}) => {
  const route = useRoute();
  const {userId, name, image} = route.params;
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showComparison, setShowComparison] = useState(false);
  const [showTopDestinations, setShowTopDestinations] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showLogOutOptions, setShowLogOutOptions] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [activeTab, setActiveTab] = useState('continents');
  const [privateuser, setPrivateUser] = useState({name: '', image: ''});

  const topCities = profile
    ? profile?.TopDestinations?.filter(h => h?.type === 'city')
    : [];
  const topCountry = profile
    ? profile?.TopDestinations?.filter(h => h?.type === 'country')
    : [];
  const topContinent = profile
    ? profile?.TopDestinations?.filter(h => h?.type === 'continent')
    : [];

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getUserProfile(userId);
      console.log('Profile response:', response);

      if (response.success) {
        if (response?.data?.user?.public_profile === false) {
          Alert.alert(
            'Profile Private',
            'This profile is private. You cannot view it.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setProfile(null);
                  setStats(null);
                },
              },
            ],
          );
          navigation.goBack();
        } else {
          setProfile(response?.data?.user);
          setStats(response?.data?.user?.stats);
        }
      } else {
        setError(response.message || 'Failed to load profile data');
      }
    } catch (err) {
      if (err.response?.data?.status === 422) {
        // navigation.goBack();
        setPrivateUser({
          name: name,
          image: image,
        });
        return;
      }
      console.error('Error fetching profile:', err.response);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const capitalizeName = name => {
    if (!name) return '';
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleFollow = async () => {
    try {
      const res = await followUser(userId);
      console.log('Follow response:', res);
      if (res.success) {
        // Alert.alert('Success', `${res?.message || 'User followed successfully.'}`);
        fetchProfile();
      } else {
        Alert.alert('Error', res.message || 'Failed to follow user.');
      }
    } catch (error) {
      console.error('Error following user:', error);
      Alert.alert('Error', 'Failed to follow user. Please try again later.');
    }
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://www.termsfeed.com/live/c848f0b7-bff9-49ad-b0fe-bff0cab70d07');
  };

  if (loading) {
    return (
      <GradientScreenWrapper>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </SafeAreaView>
      </GradientScreenWrapper>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {privateuser?.name
              ? privateuser?.name
              : capitalizeName(profile?.full_name)}
          </Text>
          <TouchableOpacity>
            <SimpleLineIcons name="location-pin" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* <View style={{flex:1 ,flexDirection: "row", alignItems: "center",justifyContent:"space-between"}}> */}
          <View style={styles.profileImageContainer}>
            {privateuser?.name ? (
              <Image
                source={
                  privateuser?.image
                    ? {uri: privateuser?.image}
                    : require('../../assets/images/profilepicture.png')
                }
                style={styles.profileImage}
              />
            ) : (
              <Image
                source={
                  profile?.image
                    ? {uri: profile?.image}
                    : require('../../assets/images/profilepicture.png')
                }
                style={styles.profileImage}
              />
            )}
          </View>
          <Text style={styles.profileName}>
            {privateuser?.name
              ? privateuser?.name
              : capitalizeName(profile?.full_name)}
          </Text>
          <Text style={styles.profileLocation}>
            {privateuser?.name ? 'Private Account' : profile?.location_sharing}
            {/* {privateuser && <Ionicons name="lock-closed" size={16} color="gray" style={{ marginLeft: 8 }} />} */}
          </Text>

          {/* Stats */}
          {!privateuser?.name && (
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
          )}

          {/* Action Buttons */}
          {!privateuser.name && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleFollow}>
              <AntDesign name="user" size={14} color="#2E7D32" />
              <Text style={styles.actionButtonText}>
                {privateuser?.name ? 'Follow' : capitalizeName(profile?.follow)}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate('MessageInner', {
                  otherUserId: userId,
                  otherUserName: name, // or name
                  otherUserImage: image,
                })
              }>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={14}
                color="#2E7D32"
              />
              <Text style={styles.actionButtonText}>Message</Text>
            </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Passport')}>
                <Fontisto name="passport-alt" size={14} color="#2E7D32" />
                <Text style={styles.actionButtonText}>Passport</Text>
              </TouchableOpacity>
          </View>
          )}
        </View>
        {!privateuser?.name ? (
          <>
            {/* Highlights Section */}
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {capitalizeName(profile?.full_name)}'s Highlights
                </Text>
              </View>

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
            </View>

            {/* Top Destinations Section */}
            <TouchableOpacity activeOpacity={1} style={styles.sectionCard}>
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
                  style={[
                    styles.tab,
                    activeTab === 'cities' && styles.activeTab,
                  ]}
                  onPress={() => setActiveTab('cities')}>
                  <Ionicons name="location-outline" size={16} color="#4CAF50" />
                  <Text style={styles.tabText}>Cities</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.destinationsContainer}>
                {activeTab === 'continents'
                  ? topContinent?.map(item => (
                      <View key={item?.id} style={styles.destinationItem}>
                        <Ionicons name="location" size={16} color="#FFC107" />
                        <Text style={styles.destinationText}>
                          {item?.value}
                        </Text>
                      </View>
                    ))
                  : activeTab === 'countries'
                  ? topCountry?.map(item => (
                      <View key={item?.id} style={styles.destinationItem}>
                        <Ionicons name="location" size={16} color="#FFC107" />
                        <Text style={styles.destinationText}>
                          {item?.value}
                        </Text>
                      </View>
                    ))
                  : topCities?.map(item => (
                      <View key={item?.id} style={styles.destinationItem}>
                        <Ionicons name="location" size={16} color="#FFC107" />
                        <Text style={styles.destinationText}>
                          {item?.value}
                        </Text>
                      </View>
                    ))}
              </View>
            </TouchableOpacity>

            {/* Wishlist Section */}
            <TouchableOpacity activeOpacity={1} style={styles.sectionCard}>
              <View>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>
                    {capitalizeName(profile?.full_name)}'s Wishlist
                  </Text>
                </View>
                <View style={styles.wishlistContainer}>
                  {profile?.Wishlist?.length ? (
                    profile?.Wishlist?.map(item => (
                      <View key={item?.id} style={styles.wishlistItem}>
                        <Ionicons name="location" size={16} color="#FFC107" />
                        <Text style={styles.wishlistText}>
                          {item?.destination}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.wishlistText}>
                      No items in wishlist
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>

            {/* See Where Button */}
            <TouchableOpacity
              style={styles.seeWhereButton}
              onPress={() => navigation.navigate('UserPosts', {userId: userId, name: profile?.full_name})}>
              <View style={styles.seeWhereContainer}>
                <Text style={styles.seeWhereButtonText}>
                  See Where {capitalizeName(profile?.full_name)} Has Been
                </Text>
                <View style={styles.iconWrapper}>
                  <AntDesign name="arrowright" size={20} color="black" />
                </View>
              </View>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.privateAccountContainer}>
            <Ionicons name="lock-closed" size={80} color="#9E9E9E" />
            <Text style={styles.privateAccountTitle}>Private Account</Text>
            <Text style={styles.privateAccountText}>
              This user has set their profile to private.
            </Text>
            <Text style={styles.privateAccountText}>
              Follow them to request access to their content.
            </Text>
          </View>
        )}

        {/* Modals */}
        <Modal
          visible={showTopDestinations}
          animationType="slide"
          resentationStyle="overFullScreen"
          onRequestClose={() => setShowTopDestinations(false)}>
          <TopDestinations
            navigation={{goBack: () => setShowTopDestinations(false)}}
          />
        </Modal>
        <Modal
          visible={showWishlist}
          animationType="slide"
          transparent={true}
          presentationStyle="overFullScreen"
          onRequestClose={() => setShowWishlist(false)}>
          <Wishlist navigation={{goBack: () => setShowWishlist(false)}} />
        </Modal>
        <Modal
          transparent
          visible={showLogOutOptions}
          animationType="fade"
          onRequestClose={() => setShowLogoutOptions(false)}>
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
                    style={{fontSize: 20, fontWeight: '600', color: '#4CAF50'}}>
                    Logout{' '}
                  </Text>
                  <Entypo name="log-out" size={20} color="red" />
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
                  <Text style={{fontSize: 20, color: 'red'}}>
                    Delete Account
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity style={{padding: 20}} onPress={openPrivacyPolicy}>
                <Text style={{fontSize: 20, color: 'black'}}>Privacy Policy</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5FB',
  },
  privateAccountContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 20,
  },
  privateAccountTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  privateAccountText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 60,
    backgroundColor: 'white',
    borderColor: 'rgb(118, 118, 118)',
    borderWidth: 0.3,
    paddingBottom: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileCard: {
    backgroundColor: 'white',
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginHorizontal: 20,
  },
  profileImageContainer: {
    //width: 80,
    //height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#4CAF50',
    //justifyContent: 'center',
    //alignItems: 'center',
    marginBottom: 12,
    marginTop: 12,
  },
  dot: {
    position: 'absolute',
    top: 16,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
  },
  profileImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1F5D02',
    borderRadius: 8,
    paddingVertical: 8,
    marginHorizontal: 4,
    width: 150,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
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
    paddingVertical: 8,
    paddingHorizontal: 16,
    flex: 1,
    marginHorizontal: 4,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 14,
  },
  sectionCard: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 20,
    borderRadius: 12,
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
    fontFamily: 'Public-Sans',
  },
  compareButton: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  compareButtonText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '400',
    fontFamily: 'Public-Sans',
  },
  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 80,
  },
  highlightItem: {
    alignItems: 'center',
    flex: 1,
    padding: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginHorizontal: 4,
    marginVertical: 8,
  },
  highlightItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  highlightNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  highlightLabel: {
    fontSize: 12,
    fontFamily: 'Public-Sans',
    color: '#666',
    padding: 4,
  },
  highlightsComparisonContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  highlightComparisonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
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
    width: 60,
    height: 60,
    justifyContent: 'space-between',
    marginRight: 36,
    alignItems: 'center',
  },
  comparisonRing: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
  },
  comparisonPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  comparisonLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    marginRight: 8,
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
  },
  destinationsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  destinationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  destinationText: {
    marginLeft: 4,
    fontSize: 14,
  },
  wishlistContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 40,
    flexWrap: 'wrap',
  },
  wishlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  wishlistText: {
    marginLeft: 8,
    fontSize: 14,
  },
  seeAllText: {
    color: '#4CAF50',
    fontSize: 14,
  },
  reviewsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 6,
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
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  reviewsLabel: {
    fontSize: 12,
    color: '#666',
  },
  reviewsRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsChart: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#FFC107',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewsComparisonLabel: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
  },
  seeWhereButton: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
    marginBottom: 24,
    marginTop: 8,
  },
  seeWhereContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: height * 0.012,
    fontSize: Math.min(16, width * 0.04),
    color: '#555',
  },
  seeWhereButtonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '500',
  },
  iconWrapper: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: {width: 0, height: 2},
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UserProfile;
