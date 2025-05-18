import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

const InstagramRating = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate & Review </Text>
        <TouchableOpacity>
          <Ionicons name="location-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Instagram Photos</Text>
          <Text style={styles.cardSubtitle}>
            We Found These Location-Tagged Photos From Your Instagram.
          </Text>

          {[1, 2, 3, 4].map((item) => (
            <View key={item} style={styles.instagramItem}>
              <View style={styles.instagramHeader}>
                <View style={styles.instagramLogo}>
                  <Icon name="instagram" size={16} color="white" />
                </View>
                <Text style={styles.instagramText}>Instagram Photo</Text>
                <TouchableOpacity style={styles.rateButton}>
                  <Text style={styles.rateButtonText}>Rate This Place</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.locationContainer}>
                <View style={styles.location}>
                  <Icon name="map-pin" size={12} color="#f59e0b" />
                  <Text style={styles.locationText}>Rome, Italy</Text>
                </View>
                <Text style={styles.dateText}>August 2023</Text>
              </View>

              <View style={styles.photoContainer}>
                <Image
                  source={{ uri: 'https://source.unsplash.com/random/100x100?pizza' }}
                  style={styles.foodPhoto}
                />
                <Image
                  source={{ uri: 'https://source.unsplash.com/random/100x100?cocktail' }}
                  style={styles.foodPhoto}
                />
              </View>

              <Text style={styles.photoCaption}>
                Amazing Pizza And Cocktails! Must Try The Margherita 🍕
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f1ff',
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
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  instagramItem: {
    borderWidth: 1,
    borderColor:'rgb(199, 199, 199)',
    padding: 10,
    marginBottom: 16,
  },
  instagramHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    border:1,
    borderColor:'rgb(199, 199, 199)',
    borderRadius: 6,
    padding: 8,
    backgroundColor:'rgb(233, 255, 239)',
  },
  instagramLogo: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  instagramText: {
    fontSize: 14,
    fontWeight: '500',
  },
  rateButton: {
    marginLeft: 'auto',
    backgroundColor: '#2E7D32',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  rateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#f59e0b',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  photoContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  foodPhoto: {
    width: 64,
    height: 64,
    borderRadius: 6,
    marginRight: 8,
  },
  photoCaption: {
    fontSize: 14,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 20, // For iOS safe area
  },
  navItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    backgroundColor: '#22c55e',
  },
  navText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  activeNavText: {
    fontSize: 12,
    color: 'white',
    marginTop: 4,
  },
});

export default InstagramRating;