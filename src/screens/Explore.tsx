import React, {useEffect, useState} from 'react';
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
import MapView from 'react-native-maps';
import GoogleMapInput from '../../utils/GoogleMapInput';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
const StarRating = ({rating, size = 16, showText = false, maxRating = 5}) => {
  // Convert to number and ensure valid range
  const ratingValue = Math.min(maxRating, Math.max(0, parseFloat(rating || 0)));

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

export default function Explore() {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [location, setLocation] = useState('');

  const [region, setRegion] = useState({
    latitude: 28.602699,
    longitude: 77.035490,
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  });


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
    setLoading(true);
    try {
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

  // useEffect(() => {
  //   fetchExploreData();
  // }, [location]);

  // const handleCall = () => {
  // fetchExploreData();
  // }

  return (
    <GradientScreenWrapper>
    <StatusBar backgroundColor="white" barStyle="dark-content" />
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

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
            <TextInput
              style={styles.searchInput}
              placeholder="Search countries or cities..."
              placeholderTextColor="gray"
              value={location}
              onChangeText={setLocation}
              onSubmitEditing={fetchExploreData}
              returnKeyType="go"
            />
          </View>

          {/* <View style={styles.mapWrapper}>
            <Image
              source={{
                uri: 'https://developers.google.com/static/maps/documentation/android-sdk/images/add-map-screenshot.png',
              }}
              style={styles.mapImage}
              resizeMode="cover"
            />
            <View style={styles.zoomControls}>
              <TouchableOpacity style={styles.zoomButton}>
                <Text style={styles.zoomButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.zoomButton}>
                <Text style={styles.zoomButtonText}>−</Text>
              </TouchableOpacity>
            </View>
          </View> */}

          <View style={styles.map}>
          <MapView
            style={styles.mapWrapper}
            region={region}
            onRegionChangeComplete={setRegion}
          />


          {/* Zoom Controls */}
            <View style={styles.zoomControls}>
              <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
                <Text style={styles.zoomButtonText}>+</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
                <Text style={styles.zoomButtonText}>−</Text>
              </TouchableOpacity>
            </View>
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
            <TouchableOpacity activeOpacity={1} style={styles.locationCard}>
              <View style={styles.locationNameContainer}>
                <FontAwesome name="map-marker" size={16} color="#FFC107" />
                <Text style={styles.locationName}>{location}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                navigation.navigate('TravelersList', {
                  posts: data?.posts,
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
                      {data?.posts.slice(0, 4).map((post, index) => (
                        <Image
                          key={post.id || index}
                          source={
                            post.User?.image
                              ? {uri: post.User.image}
                              : require('../../assets/images/profilepicture.png')
                          }
                          style={[
                            styles.avatarImage,
                            {marginLeft: index > 0 ? -10 : 0},
                          ]}
                          defaultSource={require('../../assets/images/profilepicture.png')}
                          onError={() =>
                            console.log(`Failed to load avatar ${index}`)
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
                    <Text style={styles.noAvatarsText}>No travelers found</Text>
                  )}
                </View>
                <View style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>Followed:</Text>
                  <View style={styles.starsContainer}>
                  <StarRating
                    rating={data?.statistics?.totalFollowerReviews || 0}
                    size={16}
                  />
                  <Text style={styles.ratingCount}>
                    {data?.statistics?.totalFollowerReviews.toFixed(2)}/5 (
                    {data?.statistics?.totalFollowerPosts})
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
                    {data?.statistics?.totalPublicReviews.toFixed(2)}/5 (
                    {data?.statistics?.totalPublicPosts})
                  </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() =>
                navigation.navigate('LocationDetails', {posts: data?.posts, location: location})
              }>
              <Text style={styles.exploreButtonText}>Explore</Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
    </GradientScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    padding: 8
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
    borderRadius: 8,
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
});
