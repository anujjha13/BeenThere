import React, {useState, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../context/authContext';
import {getExploreByLocation} from '../lib/api';
import MapView, {Marker} from 'react-native-maps';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import {Dimensions} from 'react-native';
import {Post} from '../../utils/type';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

const {width, height} = Dimensions.get('window');

// StarRating props type
interface StarRatingProps {
  rating: number;
  size?: number;
  showText?: boolean;
  maxRating?: number;
}

// API response types
interface Statistics {
  totalFollowerPosts: number;
  totalFollowerReviews: number;
  totalPublicReviews: number;
  totalPublicPosts: number;
}
interface ExploreData {
  posts: Post[];
  statistics: Statistics;
}

const StarRating = ({
  rating,
  size = 16,
  showText = false,
  maxRating = 5,
}: StarRatingProps) => {
  // Convert to number and ensure valid range
  const ratingValue = Math.min(
    maxRating,
    Math.max(0, parseFloat(String(rating || 0))),
  );

  // Calculate full, half and empty stars
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={{flexDirection: 'row', alignItems: 'center'}}>
      {/* Full stars */}
      {[...Array(fullStars)].map((_, index) => (
        <Ionicons
          key={`full-${index}`}
          name="star"
          size={size}
          color="#FFC107"
        />
      ))}

      {/* Half star if needed */}
      {hasHalfStar && (
        <Ionicons key="half" name="star-half" size={size} color="#FFC107" />
      )}

      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, index) => (
        <Ionicons
          key={`empty-${index}`}
          name="star-outline"
          size={size}
          color="#FFC107"
        />
      ))}

      {/* Rating text if showText is true */}
      {showText && (
        <Text style={{marginLeft: 4, fontSize: size * 0.75}}>
          {ratingValue.toFixed(1)}
        </Text>
      )}
    </View>
  );
};

async function geocodeLocation(
  location: string,
): Promise<{latitude: number; longitude: number} | null> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        location,
      )}`,
    );
    const data = await response.json();
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export default function Explore() {
  // Navigation typing
  type RootStackParamList = {
    TravelersList: {posts: Post[]; location: string};
    LocationDetails: {posts: Post[]; location: string};
  };
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ExploreData | null>(null);
  const [location, setLocation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const blurTimeout = useRef<NodeJS.Timeout | null>(null);

  const [region, setRegion] = useState({
    latitude: 28.602699,
    longitude: 77.03549,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);

  const toggleMapFullScreen = () => {
    setIsMapFullScreen(!isMapFullScreen);
  };

  const handleZoomIn = () => {
    setRegion(prev => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta / 2,
      longitudeDelta: prev.longitudeDelta / 2,
    }));
  };

  const handleZoomOut = () => {
    setRegion(prev => ({
      ...prev,
      latitudeDelta: prev.latitudeDelta * 2,
      longitudeDelta: prev.longitudeDelta * 2,
    }));
  };

  const fetchExploreData = async () => {
    try {
      if (!location) return;
      setLoading(true);
      // Geocode the location and update the map region
      const geo = await geocodeLocation(location);
      if (geo) {
        setRegion(prev => ({
          ...prev,
          latitude: geo.latitude,
          longitude: geo.longitude,
        }));
      }
      const res = await getExploreByLocation(location);
      console.log('Explore data response: ', res);

      if (res?.success) {
        setData(res?.data);
      } else {
        console.log(res?.message);
      }
    } catch (error) {
      console.log('error occred fetcxhing explore data: ', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch suggestions from Nominatim
  const fetchSuggestions = async (query: string) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query,
        )}&addressdetails=1&limit=5`,
      );
      const data = await response.json();
      if (data && data.length > 0) {
        setSuggestions(data.map((item: any) => item.display_name));
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      setSuggestions([]);
    }
  };

  const handleLocationChange = (text: string) => {
    setLocation(text);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 300);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    if (blurTimeout.current) clearTimeout(blurTimeout.current);
    setLocation(suggestion);
    setIsInputFocused(false);
    setSuggestions([]);
    fetchExploreData();
  };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <StatusBar backgroundColor="white" barStyle="dark-content" />

      {!isMapFullScreen && (
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Explore</Text>
          <TouchableOpacity>
            <Ionicons name="bookmark-outline" size={24} color="transparent" />
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.contentContainer}>
        <GradientScreenWrapper>
          {isMapFullScreen ? (
            <View style={styles.mapFullScreen}>
              <MapView
                style={styles.mapWrapperFullScreen}
                region={region}
                onRegionChangeComplete={setRegion}>
                {data?.posts &&
                  data.posts.length > 0 &&
                  data.posts.map((post: Post, idx: number) => (
                    <Marker
                      key={post.id || idx}
                      coordinate={{
                        latitude: parseFloat(post?.latitude || '27'),
                        longitude: parseFloat(post?.longitude || '25'),
                      }}
                      title={post?.city || ''}
                    />
                  ))}
              </MapView>

              {/* Zoom Controls */}
              <View style={styles.zoomControls}>
                <TouchableOpacity
                  style={styles.zoomButton}
                  onPress={handleZoomIn}>
                  <Text style={styles.zoomButtonText}>+</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.zoomButton}
                  onPress={handleZoomOut}>
                  <Text style={styles.zoomButtonText}>−</Text>
                </TouchableOpacity>
              </View>

              {/* Full Screen Toggle Button */}
              <TouchableOpacity
                style={styles.fullScreenButton}
                onPress={toggleMapFullScreen}>
                <Ionicons name="contract" size={24} color="black" />
              </TouchableOpacity>

              {/* Back Button */}
              <TouchableOpacity
                style={styles.fullScreenBackButton}
                onPress={toggleMapFullScreen}>
                <Ionicons name="arrow-back" size={22} color="black" />
                <Text style={styles.fullScreenBackText}>Exit Full Screen</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView style={styles.content}>
              <View style={styles.mapContainer}>
                <Text style={styles.mapTitle}>
                  Find A Location For Your Next Adventure
                </Text>

                {/* <GoogleMapInput/> */}
                <View style={styles.searchBar}>
                  <Ionicons
                    name="search"
                    size={20}
                    color="gray"
                    style={styles.searchIcon}
                  />
                  <View style={{flex: 1}}>
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search countries or cities..."
                      placeholderTextColor="gray"
                      value={location}
                      onChangeText={handleLocationChange}
                      onFocus={() => setIsInputFocused(true)}
                      onSubmitEditing={fetchExploreData}
                      returnKeyType="go"
                    />
                    {isInputFocused && suggestions.length > 0 && (
                      <View style={styles.suggestionsDropdown}>
                        {suggestions.map((suggestion, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.suggestionItem}
                            onBlur={() => setIsInputFocused(false)}
                            onPress={() => handleSuggestionSelect(suggestion)}>
                            <Text style={styles.suggestionText}>
                              {suggestion}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </View>

                <View
                  style={[styles.map, isMapFullScreen && styles.mapFullScreen]}>
                  <MapView
                    style={[
                      styles.mapWrapper,
                      isMapFullScreen && styles.mapWrapperFullScreen,
                    ]}
                    region={region}
                    initialRegion={{
                      latitude: 28.7223,
                      longitude: 77.1393,
                      latitudeDelta: 10,
                      longitudeDelta: 10,
                    }}>
                    {data?.posts?.length &&
                      data.posts.length > 0 &&
                      data.posts.map((post: Post, idx: number) => (
                        <Marker
                          key={post.id || idx}
                          coordinate={{
                            latitude: parseFloat(post?.latitude || '27'),
                            longitude: parseFloat(post?.longitude || '25'),
                          }}
                          title={post?.city || ''}
                        />
                      ))}
                  </MapView>

                  {/* Zoom Controls */}
                  <View style={styles.zoomControls}>
                    <TouchableOpacity
                      style={styles.zoomButton}
                      onPress={handleZoomIn}>
                      <Text style={styles.zoomButtonText}>+</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.zoomButton}
                      onPress={handleZoomOut}>
                      <Text style={styles.zoomButtonText}>−</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Full Screen Toggle Button */}
                  <TouchableOpacity
                    style={styles.fullScreenButton}
                    onPress={toggleMapFullScreen}>
                    <Ionicons
                      name={isMapFullScreen ? 'contract' : 'expand'}
                      size={24}
                      color="black"
                    />
                  </TouchableOpacity>

                  {/* Back Button (only visible in full screen) */}
                  {isMapFullScreen && (
                    <TouchableOpacity
                      style={styles.fullScreenBackButton}
                      onPress={toggleMapFullScreen}>
                      <Ionicons name="arrow-back" size={22} color="black" />
                      <Text style={styles.fullScreenBackText}>
                        Exit Full Screen
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
              {loading ? (
                <Text style={{textAlign: 'center', marginVertical: 20}}>
                  Loading...
                </Text>
              ) : !data ? (
                <Text style={{textAlign: 'center', marginVertical: 20}}>
                  Please try another location
                </Text>
              ) : (
                <>
                  <TouchableOpacity
                    activeOpacity={1}
                    style={styles.locationCard}>
                    <View style={styles.locationNameContainer}>
                      <FontAwesome
                        name="map-marker"
                        size={16}
                        color="#FFC107"
                      />
                      <Text style={styles.locationName}>{location}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('TravelersList', {
                        posts: data?.posts || [],
                        location: location,
                      })
                    }>
                    <View style={styles.followersCard}>
                      <Text style={styles.followersText}>
                        <Text style={styles.followersCount}>
                          {data?.statistics?.totalFollowerPosts} Travelers
                        </Text>{' '}
                        You Follow Have Visited
                      </Text>
                      <View style={styles.avatarRow}>
                        {data?.posts && data?.posts.length > 0 ? (
                          <>
                            {/* Show first 4 user avatars */}
                            {data?.posts
                              .slice(0, 4)
                              .map((post: Post, index: number) => (
                                <Image
                                  key={post.id || index}
                                  source={
                                    post.User?.image
                                      ? {uri: post.User.image || ''}
                                      : require('../../assets/images/profilepicture.png')
                                  }
                                  style={[
                                    styles.avatarImage,
                                    {marginLeft: index > 0 ? -10 : 0},
                                  ]}
                                  defaultSource={require('../../assets/images/profilepicture.png')}
                                  onError={() =>
                                    console.log(
                                      `Failed to load avatar ${index}`,
                                    )
                                  }
                                />
                              ))}

                            {/* Show +X more if there are more than 4 users */}
                            {data?.posts.length > 4 && (
                              <View style={styles.moreAvatars}>
                                <Text style={styles.moreAvatarsText}>
                                  +{data?.posts.length - 4}
                                </Text>
                              </View>
                            )}
                          </>
                        ) : (
                          <Text style={styles.noAvatarsText}>
                            No travelers found
                          </Text>
                        )}
                      </View>
                      <View style={styles.ratingRow}>
                        <Text style={styles.ratingLabel}>Following:</Text>
                        <View style={styles.starsContainer}>
                          <StarRating
                            rating={data?.statistics?.totalFollowerReviews || 0}
                            size={16}
                          />
                          <Text style={styles.ratingCount}>
                            {data?.statistics?.totalFollowerReviews?.toFixed(2)}
                            /5 ({data?.statistics?.totalFollowerPosts})
                          </Text>
                        </View>
                      </View>
                      <View style={styles.ratingRow}>
                        <Text style={styles.ratingLabel}>Public:</Text>
                        <View style={styles.starsContainer}>
                          <StarRating
                            rating={data?.statistics?.totalPublicReviews || 0}
                            size={16}
                          />
                          <Text style={styles.ratingCount}>
                            {data?.statistics?.totalPublicReviews?.toFixed(2)}/5
                            ({data?.statistics?.totalPublicPosts})
                          </Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.exploreButton}
                    onPress={() =>
                      navigation.navigate('LocationDetails', {
                        posts: data?.posts || [],
                        location: location,
                      })
                    }>
                    <Text style={styles.exploreButtonText}>Explore</Text>
                    <MaterialIcons
                      name="arrow-forward"
                      size={20}
                      color="white"
                    />
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          )}
        </GradientScreenWrapper>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.01,
    paddingBottom: height * 0.02,
    backgroundColor: 'white',
    borderColor: 'rgb(118, 118, 118)',
    borderBottomWidth: 0.3,
    marginBottom: height * 0.001,
  },
  noAvatarsText: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    // backgroundColor: '#E3F2FD',
    padding: 4,
    borderRadius: 8,
    margin: 16,
  },
  map: {
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  mapWrapper: {
    borderRadius: 12,
    overflow: 'hidden',
    height: 300,
    width: '100%',
  },
  zoomControls: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'column',
    zIndex: 10,
  },
  zoomButton: {
    backgroundColor: 'white',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  zoomButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
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
  // Add these styles to your StyleSheet
  mapFullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    padding: 0,
    margin: 0,
    borderRadius: 0,
    backgroundColor: 'white',
  },
  mapWrapperFullScreen: {
    height: '100%',
    borderRadius: 0,
  },
  fullScreenButton: {
    position: 'absolute',
    top: 48,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  fullScreenBackButton: {
    position: 'absolute',
    top: 48,
    left: 16,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10,
  },
  fullScreenBackText: {
    marginLeft: 6,
    fontWeight: '500',
  },
  followersCard: {
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
  followersText: {
    fontSize: 14,
    marginBottom: 12,
  },
  followersCount: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  avatarRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'white',
  },
  moreAvatars: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,
    borderWidth: 2,
    borderColor: 'white',
  },
  moreAvatarsText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  ratingLabel: {
    width: 70,
    fontSize: 14,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingCount: {
    fontSize: 12,
    color: '#757575',
  },
  exploreButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 24,
  },
  exploreButtonText: {
    color: 'white',
    fontWeight: '600',
    marginRight: 8,
  },
  suggestionsDropdown: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 100,
    maxHeight: 180,
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 14,
    color: '#333',
  },
});
