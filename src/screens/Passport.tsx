import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import {useNavigation} from '@react-navigation/native';
import {getPassportCountries, getPassportCountryStats} from '../lib/api';
import { useAuth } from '../context/authContext';
import {Dimensions} from 'react-native';
const { width, height } = Dimensions.get('window');
export const renderStarRating = rating => {
  // Convert to number and ensure it's between 0-5
  const ratingValue = Math.min(5, Math.max(0, parseFloat(rating || 0)));

  // Calculate full stars, half stars and empty stars
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <View style={styles.starsContainer}>
      {/* Full stars */}
      {[...Array(fullStars)].map((_, index) => (
        <Ionicons key={`full-${index}`} name="star" size={14} color="#FFD700" />
      ))}

      {/* Half star if needed */}
      {hasHalfStar && (
        <Ionicons key="half" name="star-half" size={14} color="#FFD700" />
      )}

      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, index) => (
        <Ionicons
          key={`empty-${index}`}
          name="star-outline"
          size={14}
          color="#FFD700"
        />
      ))}
    </View>
  );
};

const Passport = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const [selectedCountry, setSelectedCountry] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [countries, setCountries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountryStats, setSelectedCountryStats] = useState({});

  const fetchPassportCountries = async () => {
    setLoading(true);
    try {
      const res = await getPassportCountries();
      if (res?.success) {
        setCountries(res?.data?.countries || []);
        if (res?.data?.countries.length > 0) {
          setSelectedCountry(res?.data?.countries[0]); // Set default selected country
        }
      } else {
        console.log(res?.message || 'Failed to fetch countries:');
      }
    } catch (error) {
      console.error('Error fetching passport countries:', error.response);
    } finally {
      setLoading(false);
    }
  };

  const fetchPassportCountryStats = async (country: string) => {
    setLoadingStats(true);
    try {
      const res = await getPassportCountryStats(country, '', 'all', '', '');
      console.log(`Fetching stats for country: ${country}`, res);
      
      if (res?.success) {
        setSelectedCountryStats(res?.data || {});
      } else {
        console.log(res?.message || 'Failed to fetch countries:');
      }
    } catch (error) {
      console.error('Error fetching passport countries:', error.response);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchPassportCountries();
  }, []);

  useEffect(() => {
    fetchPassportCountryStats(selectedCountry);
  }, [selectedCountry]);

  const toggleCountryDropdown = () => {
    setShowCountryDropdown(!showCountryDropdown);
  };

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  const filteredReviews = () => {
    if (!selectedCountryStats?.posts || !selectedCountryStats.posts.length) {
      return [];
    }

    if (!searchQuery.trim()) {
      return selectedCountryStats.posts;
    }

    const query = searchQuery.toLowerCase().trim();

    return selectedCountryStats.posts.filter(review => {
      // Search in multiple fields
      return (
        (review?.city && review.city.toLowerCase().includes(query)) ||
        (review?.experience &&
          review.experience.toLowerCase().includes(query)) ||
        (selectedCountry && selectedCountry.toLowerCase().includes(query))
      );
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading passport...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Passport</Text>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {/* Country Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Select Your Country</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={toggleCountryDropdown}>
            <Text>{selectedCountry || 'Select Country'}</Text>
            <Ionicons name="chevron-down" size={20} color="black" />
          </TouchableOpacity>

          {showCountryDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView style={styles.countryList} nestedScrollEnabled={true}>
                {countries.map((country, index) => (
                  <TouchableOpacity
                    key={index}
                    style={
                      selectedCountry === country
                        ? styles.selectedCountryItem
                        : styles.countryItem
                    }
                    onPress={() => handleSelectCountry(country)}>
                    <View style={styles.countryItemContent}>
                      {selectedCountry === country && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color="#4CAF50"
                          style={styles.checkIcon}
                        />
                      )}
                      <Text style={styles.countryItemText}>{country}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Country Stats */}
        <View style={styles.countryContainer}>
          <Text style={styles.countryName}>
            {selectedCountry || 'Select country'}
          </Text>
          <View style={styles.statsContainer}>
            <View style={[styles.statBox, styles.activeStatBox]}>
              <Text style={styles.statLabel}>Visits</Text>
              <Text style={[styles.statValue]}>
                {selectedCountryStats?.visitCount || '0'}
              </Text>
            </View>
            <View style={[styles.statBox, styles.activeStatBox]}>
              <Text style={styles.statLabel}>Cities</Text>
              <Text style={[styles.statValue]}>
                {selectedCountryStats?.citiesVisited || '0'}
              </Text>
            </View>
            <View style={[styles.statBox, styles.activeStatBox]}>
              <Text style={styles.statLabel}>Last Visit</Text>
              <Text style={[styles.statValue]}>
                {selectedCountryStats?.lastVisit ? new Date(selectedCountryStats?.lastVisit).toLocaleDateString() : '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color="gray"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reviews..."
            placeholderTextColor="gray"
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color="gray" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'all' && styles.activeFilterTab,
            ]}
            onPress={() => setActiveFilter('all')}>
            <MaterialIcons
              name="filter-list"
              size={16}
              color={activeFilter === 'all' ? 'white' : 'black'}
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === 'all' && styles.activeFilterText,
              ]}>
              All
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'recent' && styles.activeFilterTab,
            ]}
            onPress={() => setActiveFilter('recent')}>
            <Ionicons
              name="time-outline"
              size={16}
              color={activeFilter === 'recent' ? 'white' : 'black'}
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === 'recent' && styles.activeFilterText,
              ]}>
              Recent
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterTab,
              activeFilter === 'rating' && styles.activeFilterTab,
            ]}
            onPress={() => setActiveFilter('rating')}>
            <Ionicons
              name="star-outline"
              size={16}
              color={activeFilter === 'rating' ? 'white' : 'black'}
            />
            <Text
              style={[
                styles.filterText,
                activeFilter === 'rating' && styles.activeFilterText,
              ]}>
              Rating
            </Text>
          </TouchableOpacity>
        </View>

        {/* Reviews Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>My Reviews</Text>

          {loadingStats ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#2E7D32" />
              <Text style={styles.loadingText}>Loading reviews...</Text>
            </View>
          ) : filteredReviews().length > 0 ? (
            filteredReviews().map(review => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={styles.reviewPlace}>
                    <View style={styles.placeIcon}>
                      <MaterialIcons
                        name="restaurant"
                        size={20}
                        color="white"
                      />
                    </View>
                    <View>
                      <Text style={styles.placeName}>{selectedCountry}</Text>
                      <View style={styles.locationRow}>
                        <Ionicons name="location" size={14} color="orange" />
                        <Text style={styles.locationText}>{review?.city}</Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.reviewRating}>
                    {renderStarRating(review?.overall_rating)}
                    <Text style={styles.ratingText}>
                      ({parseFloat(review?.overall_rating).toFixed(1)}/5)
                    </Text>
                    <Text style={styles.dateText}>
                      {new Date(review?.visit_date).toDateString()}
                    </Text>
                  </View>
                </View>

                <View style={styles.reviewImages}>
                  {review?.photos?.map((image, index) => (
                    <Image
                      key={index}
                      source={{uri: image?.image_url}}
                      style={styles.reviewImage}
                    />
                  ))}
                </View>

                <Text style={styles.reviewComment}>{review?.experience}</Text>
              </View>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              {searchQuery.length > 0 ? (
                <>
                  <Ionicons name="search-outline" size={24} color="#757575" />
                  <Text style={styles.noResultsText}>
                    No reviews match your search
                  </Text>
                </>
              ) : (
                <Text style={styles.noResultsText}>No reviews available</Text>
              )}
            </View>
          )}
        </View>

        {/* Photos Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>My Photos</Text>
          <View style={styles.photosGrid}>
            {selectedCountryStats && selectedCountryStats?.allImages?.length ? (
              selectedCountryStats?.allImages?.map((photo, index) => (
                <Image
                  key={index}
                  source={{uri: photo?.image_url}}
                  style={styles.photoThumbnail}
                />
              ))
            ) : (
              <Text style={{textAlign: 'center', color: '#757575'}}>
                No photos available
              </Text>
            )}
          </View>
        </View>

        {/* Map Button */}
        <TouchableOpacity
          style={styles.mapButton}
          onPress={() => navigation.navigate('Map', {countries: countries})}>
          <Text style={styles.mapButtonText}>View {user?.full_name}'s Map</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>

        {/* Bottom Spacing */}
        <View style={{height: 20}} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f2f1',
  },
  // header: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   paddingHorizontal: 16,
  //   paddingVertical: 10,
  // },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.007,
    paddingBottom: height * 0.004,
    //borderColor: 'rgb(118, 118, 118)',
    //borderWidth: 0.3,
    marginBottom: height * 0.001,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  selectorContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    position: 'relative',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
    zIndex: 1,
  },
  dropdownList: {
    position: 'absolute',
    width: '100%',
    top: 95,
    left: 20,
    backgroundColor: 'white',
    // borderWidth: 1,
    // borderColor: '#e0e0e0',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 2,
    padding: 8,
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  countryList: {
    // padding: 6,
  },
  countryItem: {
    padding: 8,
    // paddingHorizontal: 16,
    borderRadius: 12,
    // borderColor: '#e0e0e0',
    // borderWidth: 1,
    marginVertical: 4,
  },
  selectedCountryItem: {
    padding: 8,
    // paddingHorizontal: 16,
    borderRadius: 12,
    borderColor: '#CCCCCC',
    backgroundColor: '#F2FEF8',
    borderWidth: 1,
    marginVertical: 4,
  },
  countryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryItemText: {
    fontSize: 15,
  },
  selectedCountryText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  checkIcon: {
    marginRight: 8,
  },
  countryContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  countryName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeStatBox: {
    borderColor: '#4CAF50',
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  activeStatValue: {
    color: '#4CAF50',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  activeFilterTab: {
    backgroundColor: '#2E7D32',
  },
  filterText: {
    marginLeft: 4,
  },
  activeFilterText: {
    color: 'white',
  },
  sectionContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  reviewCard: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 16,
    marginBottom: 16,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  reviewPlace: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2E7D32',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  placeName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 2,
  },
  reviewRating: {
    alignItems: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 12,
    color: '#757575',
  },
  dateText: {
    fontSize: 12,
    color: '#757575',
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
  reviewImages: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  reviewImage: {
    width: 80,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
  },
  reviewComment: {
    fontSize: 14,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  photoThumbnail: {
    width: '32%',
    height: 100,
    borderRadius: 8,
    marginBottom: 8,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  mapButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default Passport;
