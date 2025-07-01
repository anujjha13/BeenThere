import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/authContext';
import { getProfile } from '../lib/api';

const InstagramRating = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [instagramPosts, setInstagramPosts] = useState([]);

  useEffect(() => {
    checkInstagramStatus();
  }, []);

  const checkInstagramStatus = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response.success) {
        const userData = response?.data?.user;
        setInstagramConnected(userData?.instagram_sync || false);
        // Here you would fetch actual Instagram posts if connected
        // For now, we'll use empty array to show the "no posts" state
        setInstagramPosts([]);
      }
    } catch (error) {
      console.error('Error checking Instagram status:', error);
    } finally {
      setLoading(false);
    }
  };

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
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2E7D32" />
              <Text style={styles.loadingText}>Checking Instagram connection...</Text>
            </View>
          ) : !instagramConnected ? (
            // Not connected to Instagram
            <View style={styles.noConnectionContainer}>
              <View style={styles.instagramIconContainer}>
                <Icon name="instagram" size={48} color="#E4405F" />
              </View>
              <Text style={styles.noConnectionTitle}>Instagram Not Connected</Text>
              <Text style={styles.noConnectionSubtitle}>
                Connect your Instagram account to see your location-tagged photos and rate the places you've visited.
              </Text>
              
              <TouchableOpacity 
                style={styles.connectInstagramButton}
                onPress={() => navigation.navigate('EditProfileScreen')}
              >
                <Icon name="instagram" size={20} color="white" />
                <Text style={styles.connectInstagramButtonText}>Connect Instagram in Profile</Text>
              </TouchableOpacity>
              
              <View style={styles.hintContainer}>
                <View style={styles.hintItem}>
                  <Icon name="map-pin" size={16} color="#2E7D32" />
                  <Text style={styles.hintText}>We'll find your location-tagged photos</Text>
                </View>
                <View style={styles.hintItem}>
                  <Icon name="star" size={16} color="#2E7D32" />
                  <Text style={styles.hintText}>Rate places you've visited</Text>
                </View>
                <View style={styles.hintItem}>
                  <Icon name="share-2" size={16} color="#2E7D32" />
                  <Text style={styles.hintText}>Share your travel experiences</Text>
                </View>
              </View>
            </View>
          ) : instagramPosts.length === 0 ? (
            // Connected but no posts
            <View style={styles.noPostsContainer}>
              <View style={styles.instagramIconContainer}>
                <Icon name="instagram" size={48} color="#2E7D32" />
                <Icon name="check-circle" size={20} color="#2E7D32" style={styles.connectedBadge} />
              </View>
              <Text style={styles.noPostsTitle}>No Instagram Posts Yet</Text>
              <Text style={styles.noPostsSubtitle}>
                Your Instagram is connected, but we haven't found any location-tagged photos yet. Try:
              </Text>
              
              <View style={styles.suggestionContainer}>
                <View style={styles.suggestionItem}>
                  <Icon name="camera" size={16} color="#666" />
                  <Text style={styles.suggestionText}>Post photos with location tags</Text>
                </View>
                <View style={styles.suggestionItem}>
                  <Icon name="refresh-cw" size={16} color="#666" />
                  <Text style={styles.suggestionText}>Check back later for new posts</Text>
                </View>
                <View style={styles.suggestionItem}>
                  <Icon name="settings" size={16} color="#666" />
                  <Text style={styles.suggestionText}>Reconnect Instagram in Profile if needed</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={checkInstagramStatus}
              >
                <Icon name="refresh-cw" size={18} color="#2E7D32" />
                <Text style={styles.refreshButtonText}>Refresh</Text>
              </TouchableOpacity>
            </View>
          ) : (
            // Has Instagram posts - show them
            <View>
              <Text style={styles.cardSubtitle}>
                We Found These Location-Tagged Photos From Your Instagram.
              </Text>
              {instagramPosts.map((post, index) => (
                <View key={index} style={styles.instagramItem}>
                  {/* Your existing Instagram post rendering code would go here */}
                </View>
              ))}
            </View>
          )}
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
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  noConnectionContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  instagramIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  connectedBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: 'white',
    borderRadius: 10,
  },
  noConnectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  noConnectionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  connectInstagramButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E4405F',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 25,
    marginBottom: 30,
  },
  connectInstagramButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  hintContainer: {
    width: '100%',
    marginTop: 10,
  },
  hintItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  noPostsContainer: {
    paddingVertical: 30,
    alignItems: 'center',
  },
  noPostsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  noPostsSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  suggestionContainer: {
    width: '100%',
    marginBottom: 20,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  suggestionText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2E7D32',
  },
  refreshButtonText: {
    color: '#2E7D32',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
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