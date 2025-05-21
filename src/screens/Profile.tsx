import React, {useEffect, useState} from 'react';
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
  Alert
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
import {getProfile} from '../lib/api';
import { removeToken } from '../../utils/token';

interface Stats {
  totalFollowing: number;
  totalPosts: number;
  totalFollowers: number;
}

const Profile = ({navigation}) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [stats, setStats] = useState<Stats>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [showComparison, setShowComparison] = useState(false);
  const [showTopDestinations, setShowTopDestinations] = useState(false);
  const [showWishlist, setShowWishlist] = useState(false);
  const [showLogOutOptions, setShowLogOutOptions] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      //console.log('Profile response:', response);

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
        },
      },
    ],
    {cancelable: true},
  );
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
        },
      },
    ],
    {cancelable: true},
  );
};
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{profile?.full_name || 'John Doe'}</Text>
          <TouchableOpacity>
            <SimpleLineIcons name="location-pin" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          {/* <View style={{flex:1 ,flexDirection: "row", alignItems: "center",justifyContent:"space-between"}}> */}
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri:
                    profile?.image ||
                    'https://randomuser.me/api/portraits/men/32.jpg',
                }}
                style={styles.profileImage}
              />
            </View>
            <TouchableOpacity onPress={() => setShowLogOutOptions(true)} style={styles.dot}>
              <Entypo name="dots-three-vertical" size={24} color="#4CAF50" />
            </TouchableOpacity>
          <Text style={styles.profileName}>{profile?.full_name || 'John Doe'}</Text>
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
              <Text style={styles.statNumber}>{stats?.totalFollowers || 0}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats?.totalFollowing || 0}</Text>
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
              onPress={() => navigation.navigate('EditProfileScreen')}>
              <Ionicons name="settings-outline" size={16} color="#4CAF50" />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Highlights Section */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {profile?.first_name || 'John Doe'}'s Highlights
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
                  <Text style={styles.highlightNumber}>3 </Text>
                </View>
                <Text style={styles.highlightLabel}>Continents</Text>
              </View>
              <View style={styles.highlightItem}>
                <View style={styles.highlightItemCard}>
                  <Ionicons name="flag-outline" size={24} color="#4CAF50" />
                  <Text style={styles.highlightNumber}>8</Text>
                </View>
                <Text style={styles.highlightLabel}>Countries</Text>
              </View>
              <View style={styles.highlightItem}>
                <View style={styles.highlightItemCard}>
                  <Ionicons name="location-outline" size={24} color="#4CAF50" />
                  <Text style={styles.highlightNumber}>46</Text>
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
                    <Text style={styles.highlightNumber}>3</Text>
                  </View>
                  <Text style={styles.highlightLabel}>Continents</Text>
                </View>
                <View style={styles.comparisonChart}>
                  <View style={styles.comparisonRing}>
                    <Text style={styles.comparisonPercentage}>68%</Text>
                  </View>
                  <Text style={styles.highlightLabel}>From Others</Text>
                </View>
              </View>

              <View style={styles.highlightComparisonItem}>
                <View style={styles.highlightComparisonLeft}>
                  <View style={styles.highlightItemCard}>
                    <Ionicons name="flag-outline" size={24} color="#4CAF50" />
                    <Text style={styles.highlightNumber}>8</Text>
                  </View>
                  <Text style={styles.highlightLabel}>Countries</Text>
                </View>
                <View style={styles.comparisonChart}>
                  <View style={styles.comparisonRing}>
                    <Text style={styles.comparisonPercentage}>45%</Text>
                  </View>
                  <Text style={styles.highlightLabel}>From Others</Text>
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
                    <Text style={styles.highlightNumber}>46</Text>
                  </View>
                  <Text style={styles.highlightLabel}>Cities</Text>
                </View>
                <View style={styles.comparisonChart}>
                  <View style={styles.comparisonRing}>
                    <Text style={styles.comparisonPercentage}>74%</Text>
                  </View>
                  <Text style={styles.highlightLabel}>From Others</Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Top Destinations Section */}
        <TouchableOpacity
          style={styles.sectionCard}
          presentationStyle="fullScreen"
          onPress={() => setShowTopDestinations(true)}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {profile?.full_name || 'John Doe'}'s Top Destinations
            </Text>
          </View>
          <View style={styles.tabsContainer}>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Ionicons name="globe-outline" size={16} color="#4CAF50" />
              <Text style={styles.tabText}>Continents</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Ionicons name="flag-outline" size={16} color="#4CAF50" />
              <Text style={styles.tabText}>Countries</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Ionicons name="location-outline" size={16} color="#4CAF50" />
              <Text style={styles.tabText}>Cities</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.destinationsContainer}>
            <View style={styles.destinationItem}>
              <Ionicons name="location" size={16} color="#FFC107" />
              <Text style={styles.destinationText}>North America</Text>
            </View>
            <View style={styles.destinationItem}>
              <Ionicons name="location" size={16} color="#FFC107" />
              <Text style={styles.destinationText}>Asia</Text>
            </View>
            <View style={styles.destinationItem}>
              <Ionicons name="location" size={16} color="#FFC107" />
              <Text style={styles.destinationText}>Europe</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Wishlist Section */}
        <TouchableOpacity
          style={styles.sectionCard}
          onPress={() => setShowWishlist(true)}>
          <View>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {profile?.full_name || 'John Doe'}'s Wishlist
              </Text>
            </View>
            <View style={styles.wishlistContainer}>
              {profile?.Wishlist?.map(item => (
                <View key={item?.id} style={styles.wishlistItem}>
                  <Ionicons name="location" size={16} color="#FFC107" />
                  <Text style={styles.wishlistText}>{item?.destination}</Text>
                </View>
              ))}
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
                <Text style={styles.reviewsNumber}>2000</Text>
              </View>
              <Text style={styles.reviewsLabel}>Reviews</Text>
            </View>
            <View style={styles.comparisonChart}>
              <View style={styles.comparisonRing}>
                <Text style={styles.comparisonPercentage}>74%</Text>
              </View>
              <Text style={styles.highlightLabel}>From Others</Text>
            </View>
          </View>
        </View>

        {/* See Where Button */}
        <TouchableOpacity style={styles.seeWhereButton}  onPress={() => navigation.navigate('Passport')}>
          <View style={styles.seeWhereContainer}>
            <Text style={styles.seeWhereButtonText}>
              See Where {profile?.full_name || 'John Doe'} Has Been
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
                <View style={{flexDirection:"row" , justifyContent:"space-around"}}>
                  <Text style={{fontSize: 20,fontWeight:"600",color:"#4CAF50"}}>Logout </Text>
                  <Entypo name="log-out" size={20} color="red"/>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  setShowLogOutOptions(false);
                  handleDeleteAccount();
                }}
                style={{padding: 20}}>
                <View style={{flexDirection:"row" , justifyContent:"space-around"}}>
                  <Text style={{fontSize: 20, color: 'red'}}>Delete Account</Text>
                </View>
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

export default Profile;
