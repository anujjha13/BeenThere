import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

const reviews = [
  {
    id: '1',
    name: 'Hilton - Porto',
    location: 'Chicago',
    rating: '4/5',
    date: 'January 2024',
    images: [
      'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    comment: 'Amazing Pizza And Cocktails! Must Try The Margherita 🍕'
  },
  {
    id: '2',
    name: 'Duoro Winery',
    location: 'Chicago',
    rating: '4/5',
    date: 'January 2024',
    images: [
      'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
    ],
    comment: 'Amazing Pizza And Cocktails! Must Try The Margherita 🍕'
  }
];

const pictures = [
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1503152394-c571994fd383?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
  'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
];

export default function LocationDetails() {
  const navigation = useNavigation();

  const renderReview = (review) => (
    <View key={review.id} style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewVenue}>
          <View style={styles.venueIconContainer}>
            <MaterialIcons name="restaurant" size={24} color="white" />
          </View>
          <View style={styles.venueDetails}>
            <Text style={styles.venueName}>{review.name}</Text>
            <View style={styles.venueLocation}>
              <FontAwesome name="map-marker-alt" size={12} color="#FFC107" />
              <Text style={styles.locationText}>{review.location}</Text>
            </View>
          </View>
        </View>
        <View style={styles.reviewRating}>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4].map((_, index) => (
              <Ionicons key={index} name="star" size={14} color="#FFC107" />
            ))}
            <Ionicons name="star-outline" size={14} color="#FFC107" />
          </View>
          <Text style={styles.dateText}>{review.date}</Text>
        </View>
      </View>
      <View style={styles.reviewImages}>
        {review.images.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.reviewImage} />
        ))}
      </View>
      <Text style={styles.reviewComment}>{review.comment}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
        <Text style={styles.sectionTitle}>See Details On Your Selected Location</Text>
        
        <TouchableOpacity style={styles.locationCard}>
          <View style={styles.locationNameContainer}>
            <FontAwesome name="map-marker" size={16} color="#FFC107" />
            <Text style={styles.locationName}>Greece</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={[styles.filterButton, styles.activeFilterButton]}
            onPress={() => navigation.navigate('LocationDetailsWithFollowing')}
          >
            <Ionicons name="filter" size={16} color="white" />
            <Text style={styles.activeFilterText}>Followed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="time-outline" size={16} color="black" />
            <Text style={styles.filterText}>Recent</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Greece Reviews</Text>
          {reviews.map(review => renderReview(review))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Greece Pictures</Text>
          <View style={styles.picturesGrid}>
            {pictures.map((picture, index) => (
              <Image key={index} source={{ uri: picture }} style={styles.gridImage} />
            ))}
          </View>
        </View>
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
    shadowOffset: { width: 0, height: 1 },
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
    shadowOffset: { width: 0, height: 1 },
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
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 16,
    marginBottom: 16,
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
});