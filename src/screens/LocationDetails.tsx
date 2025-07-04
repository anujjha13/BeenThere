import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';
import {getExploreWithFilter} from '../lib/api';
import {renderStarRating} from './Passport';
import {Post} from '../../utils/type';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const reviews = [
  {
    id: '1',
    name: 'Hilton - Porto',
    location: 'Chicago',
    rating: '4/5',
    date: 'January 2024',
    images: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    ],
    comment: 'Amazing Pizza And Cocktails! Must Try The Margherita 🍕',
  },
  {
    id: '2',
    name: 'Duoro Winery',
    location: 'Chicago',
    rating: '4/5',
    date: 'January 2024',
    images: [
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    ],
    comment: 'Amazing Pizza And Cocktails! Must Try The Margherita 🍕',
  },
];

const pictures = [
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1503152394-c571994fd383?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
];

// API response types
interface LocationDetailsData {
  posts?: Post[];
  locationPhotos?: {url: string}[];
}

// Navigation typing
type RootStackParamList = {
  UserProfile: { userId: string; name: string; image: string };
};

export default function LocationDetails() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const {posts, location} = route.params as {posts: Post[]; location: string};
  const [data, setData] = useState<LocationDetailsData | undefined>();
  const [loading, setLoading] = useState(false);

  const [isFollowedFilter, setIsFollowedFilter] = useState(false);
  const [isRecentFilter, setIsRecentFilter] = useState(false);
  const [showFollowedDropdown, setShowFollowedDropdown] = useState(false);

  const dropdownAnimation = useRef(new Animated.Value(0)).current;

  const fetchExploreWithFilter = async (
    location: string,
    followed: number,
    recent: number,
  ) => {
    setLoading(true);
    try {
      const res = await getExploreWithFilter(location, followed, recent);
      if (res?.success) {
        setData(res?.data);
        console.log('Explore data fetched successfully:', res?.data);
      } else {
        console.error('Failed to fetch explore data:', res?.message);
      }
    } catch (error) {
      console.error('Error fetching explore data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const followedValue = isFollowedFilter ? 1 : 0;
    const recentValue = isRecentFilter ? 1 : 0;
    fetchExploreWithFilter(location, followedValue, recentValue);
  }, [isFollowedFilter, isRecentFilter, location]);

  useEffect(() => {
    Animated.timing(dropdownAnimation, {
      toValue: showFollowedDropdown ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [showFollowedDropdown]);

  const toggleFollowedDropdown = () => {
    setShowFollowedDropdown(!showFollowedDropdown);
  };

  const selectFollowedOption = (isFollowed: boolean) => {
    setIsFollowedFilter(isFollowed);
    setShowFollowedDropdown(false);
  };

  const toggleRecentFilter = () => {
    setIsRecentFilter(!isRecentFilter);
  };

  const renderReview = (review: Post) => {
    const user = review?.User;
    return (
      <View key={review.id} style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewVenue}>
            <View style={styles.venueIconContainer}>
              <MaterialIcons name="restaurant" size={24} color="white" />
            </View>
            <View style={styles.venueDetails}>
              <Text style={styles.venueName}>
                {review.city || review.country || 'Place Name'}
              </Text>
              <View style={styles.venueLocation}>
                <Ionicons name="location" size={14} color="orange" />
                <Text style={styles.locationText}>{review?.city}</Text>
              </View>
            </View>
          </View>
          <View style={styles.reviewRating}>
            {renderStarRating(review?.overall_rating)}
            <Text style={styles.ratingText}>
              ({parseFloat(String(review?.overall_rating)).toFixed(1)}/5)
            </Text>
            <Text style={styles.dateText}>
              {review?.visit_date
                ? new Date(review?.visit_date).toDateString()
                : ''}
            </Text>
          </View>
        </View>
        <View style={styles.reviewImages}>
          {review?.Photos?.map((image: any, index: number) => (
            <Image
              key={index}
              source={{uri: image?.image_url || ''}}
              style={styles.reviewImage}
            />
          ))}
        </View>
        <Text style={styles.reviewComment}>{review?.experience}</Text>
        {isFollowedFilter && (
          <View style={styles.reviewHeaderRow}>
            <TouchableOpacity
              style={styles.followingContainer}
              activeOpacity={0.8}
              onPress={() => {
                if (user?.id) {
                  navigation.navigate('UserProfile', {
                    userId: user.id,
                    name: user.full_name || '',
                    image: user.image || '',
                  });
                }
              }}
            >
              <View style={styles.profilePicContainer}>
                <Image
                  source={{
                    uri: user?.image || 'https://ui-avatars.com/api/?name=User',
                  }}
                  style={styles.profilePic}
                />
              </View>
              <Text style={styles.userLabel}>{user?.full_name}</Text>
            </TouchableOpacity>
            <Text style={styles.followingLabel}>Following</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={24} color="transparent" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>
          See Details On Your Selected Location
        </Text>

        <TouchableOpacity style={styles.locationCard}>
          <View style={styles.locationNameContainer}>
            <FontAwesome name="map-marker" size={16} color="#FFC107" />
            <Text style={styles.locationName}>{location}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              isFollowedFilter ? styles.activeFilterButton : null,
            ]}
            onPress={() => setIsFollowedFilter(!isFollowedFilter)}>
            <Ionicons
              name="filter"
              size={16}
              color={isFollowedFilter ? 'white' : 'black'}
            />
            <Text
              style={
                isFollowedFilter ? styles.activeFilterText : styles.filterText
              }>
              Following
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              isRecentFilter ? styles.activeFilterButton : null,
            ]}
            onPress={toggleRecentFilter}>
            <Ionicons
              name="time-outline"
              size={16}
              color={isRecentFilter ? 'white' : 'black'}
            />
            <Text
              style={
                isRecentFilter ? styles.activeFilterText : styles.filterText
              }>
              Recent
            </Text>
          </TouchableOpacity>
        </View>
        {showFollowedDropdown && (
          <Animated.View
            style={[
              styles.dropdown,
              {
                opacity: dropdownAnimation,
                transform: [
                  {
                    translateY: dropdownAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
              },
            ]}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => selectFollowedOption(true)}>
              <Text style={styles.dropdownText}>Followed</Text>
              {isFollowedFilter && (
                <Ionicons name="checkmark" size={16} color="#2E7D32" />
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => selectFollowedOption(false)}>
              <Text style={styles.dropdownText}>Public</Text>
              {!isFollowedFilter && (
                <Ionicons name="checkmark" size={16} color="#2E7D32" />
              )}
            </TouchableOpacity>
          </Animated.View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionHeader}>{location} Reviews</Text>
              {data?.posts?.length ? (
                data?.posts?.map((review: Post) => renderReview(review))
              ) : (
                <View style={styles.noResultsContainer}>
                  <Text style={styles.noResultsText}>No reviews available</Text>
                </View>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionHeader}>{location} Pictures</Text>
              <View style={styles.picturesGrid}>
                {data?.locationPhotos?.length ? (
                  data?.locationPhotos?.map(
                    (picture: {url: string}, index: number) => (
                      <Image
                        key={index}
                        source={{uri: picture?.url || ''}}
                        style={styles.gridImage}
                      />
                    ),
                  )
                ) : (
                  <View style={styles.noResultsContainer}>
                    <Text style={styles.noResultsText}>
                      No pictures available
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  locationCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ratingText: {
    fontSize: 12,
    color: '#757575',
  },
  dateText: {
    fontSize: 12,
    color: '#757575',
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeFilterButton: {
    backgroundColor: '#2E7D32',
  },
  filterText: {
    marginLeft: 4,
    fontWeight: '500',
  },
  activeFilterText: {
    marginLeft: 4,
    fontWeight: '500',
    color: 'white',
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  reviewCard: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
    marginBottom: 16,
    borderRadius: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewVenue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  venueIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  venueDetails: {
    justifyContent: 'center',
  },
  venueName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  venueLocation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  reviewRating: {
    alignItems: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  reviewImages: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewComment: {
    fontSize: 14,
  },
  picturesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridImage: {
    width: '31%',
    height: 100,
    borderRadius: 8,
    marginBottom: 10,
  },
  dropdownContainer: {
    flex: 1,
    position: 'relative',
  },
  dropdown: {
    position: 'absolute',
    top: 175,
    left: 16,
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  noDataText: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
    backgroundColor: '#F2FEF8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#CCC',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  followingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profilePicContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#eee',
  },
  profilePic: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  followingLabel: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'black',
  },
});
