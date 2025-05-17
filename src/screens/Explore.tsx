import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';

export default function Explore() {
  const navigation = useNavigation();

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
        <View style={styles.mapContainer}>
          <Text style={styles.mapTitle}>Find A Location For Your Next Adventure</Text>
          
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="gray" style={styles.searchIcon} />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search countries or cities..." 
              placeholderTextColor="gray"
            />
          </View>
          
          <View style={styles.mapWrapper}>
            <Image 
              source={{ uri: 'https://developers.google.com/static/maps/documentation/android-sdk/images/add-map-screenshot.png' }} 
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
          </View>
        </View>

        <TouchableOpacity 
          style={styles.locationCard}
        >
          <View style={styles.locationNameContainer}>
            <FontAwesome name="map-marker" size={16} color="#FFC107" />
            <Text style={styles.locationName}>Greece</Text>
          </View>
        </TouchableOpacity>

      <TouchableOpacity
          onPress={() => navigation.navigate('TravelersList')}>
        <View style={styles.followersCard}>
          <Text style={styles.followersText}>
            <Text style={styles.followersCount}>13 Travelers</Text> You Follow Have Visited
          </Text>
          <View style={styles.avatarRow}>
            {[1, 2, 3, 4].map((_, index) => (
              <Image 
                key={index}
                source={{ uri: 'https://randomuser.me/api/portraits/men/' + (index + 1) + '.jpg' }} 
                style={[styles.avatarImage, { marginLeft: index > 0 ? -10 : 0 }]} 
              />
            ))}
            <View style={styles.moreAvatars}>
              <Text style={styles.moreAvatarsText}>9+</Text>
            </View>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Followed:</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4].map((_, index) => (
                <Ionicons key={index} name="star" size={16} color="#FFC107" />
              ))}
              <Ionicons name="star-half" size={16} color="#FFC107" />
            </View>
            <Text style={styles.ratingCount}>4/5 (13)</Text>
          </View>
          <View style={styles.ratingRow}>
            <Text style={styles.ratingLabel}>Public:</Text>
            <View style={styles.starsContainer}>
              {[1, 2, 3, 4].map((_, index) => (
                <Ionicons key={index} name="star" size={16} color="#FFC107" />
              ))}
              <Ionicons name="star-half" size={16} color="#FFC107" />
            </View>
            <Text style={styles.ratingCount}>4/5 (10k)</Text>
          </View>
        </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.exploreButton}
          onPress={() => navigation.navigate('LocationDetails')}
        >
          <Text style={styles.exploreButtonText}>Explore</Text>
          <MaterialIcons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
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
  mapContainer: {
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    borderWidth: 1,
    borderColor: '#90CAF9',
    borderStyle: 'dashed',
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
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    height: 300,
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  zoomControls: {
    position: 'absolute',
    right: 10,
    bottom: 10,
  },
  zoomButton: {
    backgroundColor: 'white',
    width: 30,
    height: 30,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  zoomButtonText: {
    fontSize: 18,
    fontWeight: '500',
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
  followersCard: {
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