import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  TextInput,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

import { useNavigation } from '@react-navigation/native';

const Passport = () => {
  const navigation = useNavigation();
  const [selectedCountry, setSelectedCountry] = useState('Portugal');
  const [activeFilter, setActiveFilter] = useState('All');

  const reviews = [
    {
      id: 1,
      place: 'Hilton-Porto',
      location: 'Chicago',
      rating: 4.5,
      date: 'January 2024',
      images: [],
      comment: 'Amazing Pizza And Cocktails! Must Try The Margherita 👌',
    },
    {
      id: 2,
      place: 'Duoro Winery',
      location: 'Chicago',
      rating: 4.5,
      date: 'January 2024',
      images: [
  
      ],
      comment: 'Amazing Pizza And Cocktails! Must Try The Margherita 👌',
    },
  ];

  const photos = [

  ];

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
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Country Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Select Your Country</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => navigation.navigate('Map')}
          >
            <Text>{selectedCountry}</Text>
            <Ionicons name="chevron-down" size={20} color="black" />
          </TouchableOpacity>
        </View>
        
        {/* Country Stats */}
        <View style={styles.countryContainer}>
          <Text style={styles.countryName}>Portugal</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Visits</Text>
              <Text style={styles.statValue}>1</Text>
            </View>
            <View style={[styles.statBox, styles.activeStatBox]}>
              <Text style={styles.statLabel}>Cities</Text>
              <Text style={[styles.statValue, styles.activeStatValue]}>2</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Last Visit</Text>
              <Text style={styles.statValue}>Jan, 24</Text>
            </View>
          </View>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="gray" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search reviews..."
            placeholderTextColor="gray"
          />
        </View>
        
        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterTab, activeFilter === 'All' && styles.activeFilterTab]}
            onPress={() => setActiveFilter('All')}
          >
            <MaterialIcons name="filter-list" size={16} color={activeFilter === 'All' ? 'white' : 'black'} />
            <Text style={[styles.filterText, activeFilter === 'All' && styles.activeFilterText]}>All</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterTab, activeFilter === 'Recent' && styles.activeFilterTab]}
            onPress={() => setActiveFilter('Recent')}
          >
            <Ionicons name="time-outline" size={16} color={activeFilter === 'Recent' ? 'white' : 'black'} />
            <Text style={[styles.filterText, activeFilter === 'Recent' && styles.activeFilterText]}>Recent</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.filterTab, activeFilter === 'Rating' && styles.activeFilterTab]}
            onPress={() => setActiveFilter('Rating')}
          >
            <Ionicons name="star-outline" size={16} color={activeFilter === 'Rating' ? 'white' : 'black'} />
            <Text style={[styles.filterText, activeFilter === 'Rating' && styles.activeFilterText]}>Rating</Text>
          </TouchableOpacity>
        </View>
        
        {/* Reviews Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>My Reviews</Text>
          
          {reviews.map((review) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.reviewPlace}>
                  <View style={styles.placeIcon}>
                    <MaterialIcons name="restaurant" size={20} color="white" />
                  </View>
                  <View>
                    <Text style={styles.placeName}>{review.place}</Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={14} color="orange" />
                      <Text style={styles.locationText}>{review.location}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.reviewRating}>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4].map((star) => (
                      <Ionicons key={star} name="star" size={14} color="#FFD700" />
                    ))}
                    <Ionicons name="star-half" size={14} color="#FFD700" />
                  </View>
                  <Text style={styles.ratingText}>({review.rating}/5)</Text>
                  <Text style={styles.dateText}>{review.date}</Text>
                </View>
              </View>
              
              <View style={styles.reviewImages}>
                {review.images.map((image, index) => (
                  <Image key={index} source={image} style={styles.reviewImage} />
                ))}
              </View>
              
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))}
        </View>
        
        {/* Photos Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>My Photos</Text>
          <View style={styles.photosGrid}>
            {photos.map((photo, index) => (
              <Image key={index} source={photo} style={styles.photoThumbnail} />
            ))}
          </View>
        </View>
        
        {/* Map Button */}
        <TouchableOpacity 
          style={styles.mapButton}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.mapButtonText}>View William's Map</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
        
        {/* Bottom Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0f2f1',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#4CAF50',
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