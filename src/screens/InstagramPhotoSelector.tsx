import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import axios from 'axios';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width / 3 - 4;

interface InstagramMedia {
  id: string;
  media_type: string;
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
  location?: {
    name: string;
    latitude?: number;
    longitude?: number;
  };
}

const InstagramPhotoSelector = ({ navigation, route }: { navigation: NativeStackNavigationProp<any>, route: any }) => {
  const [loading, setLoading] = useState(true);
  const [mediaItems, setMediaItems] = useState<InstagramMedia[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<InstagramMedia | null>(null);

  useEffect(() => {
    fetchInstagramMedia();
  }, []);

  const fetchInstagramMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Replace with your actual Instagram API call
      const response = await axios.get(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,location&access_token=YOUR_ACCESS_TOKEN`
      );
      
      const filteredMedia = response.data.data.filter(
        (item: InstagramMedia) => item.media_type === 'IMAGE' || item.media_type === 'CAROUSEL_ALBUM'
      );
      
      setMediaItems(filteredMedia);
    } catch (err) {
      console.error('Error fetching Instagram media:', err);
      setError('Failed to load Instagram photos. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMediaSelect = async (media: InstagramMedia) => {
    try {
      setSelectedMedia(media);
      
      // Navigate to rating screen with media data
      navigation.navigate('CustomRating', {
        mediaData: {
          imageUrl: media.media_url,
          caption: media.caption || '',
          location: media.location?.name || '',
          timestamp: media.timestamp,
          coordinates: media.location ? {
            latitude: media.location.latitude,
            longitude: media.location.longitude
          } : null
        }
      });
    } catch (err) {
      console.error('Error selecting media:', err);
      Alert.alert('Error', 'Failed to load photo details. Please try again.');
    }
  };

  const renderMediaItem = ({ item }: { item: InstagramMedia }) => (
    <TouchableOpacity
      style={[
        styles.mediaItem,
        selectedMedia?.id === item.id && styles.selectedMediaItem
      ]}
      onPress={() => handleMediaSelect(item)}>
      <Image
        source={{ uri: item.media_url }}
        style={styles.mediaImage}
        resizeMode="cover"
      />
      {selectedMedia?.id === item.id && (
        <View style={styles.selectedOverlay}>
          <Ionicons name="checkmark-circle" size={24} color="white" />
        </View>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <GradientScreenWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading your Instagram photos...</Text>
        </View>
      </GradientScreenWrapper>
    );
  }

  if (error) {
    return (
      <GradientScreenWrapper>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchInstagramMedia}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </GradientScreenWrapper>
    );
  }

  return (
    <GradientScreenWrapper>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Instagram Photo</Text>
          <View style={{ width: 24 }} />
        </View>

        <FlatList
          data={mediaItems}
          renderItem={renderMediaItem}
          keyExtractor={item => item.id}
          numColumns={3}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No Instagram photos found</Text>
            </View>
          }
        />
      </View>
    </GradientScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  gridContainer: {
    padding: 2,
  },
  mediaItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    margin: 2,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  selectedMediaItem: {
    opacity: 0.8,
  },
  selectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(46, 125, 50, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#D32F2F',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default InstagramPhotoSelector; 