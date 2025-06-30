import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface InstagramMedia {
  id: string;
  media_url: string;
  caption: string;
  media_type: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  location?: {
    name?: string;
    latitude?: number;
    longitude?: number;
  };
}

const InstagramRating = () => {
  const navigation = useNavigation();
  const [instagramMedia, setInstagramMedia] = useState<InstagramMedia[]>([]);
  const [selectedImages, setSelectedImages] = useState<InstagramMedia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInstagramMedia();
  }, []);

  const loadInstagramMedia = async () => {
    try {
      const storedMedia = await AsyncStorage.getItem('instagram_media');
      if (storedMedia) {
        setInstagramMedia(JSON.parse(storedMedia));
      }
    } catch (error) {
      console.error('Error loading Instagram media:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleImageSelection = (item: InstagramMedia) => {
    setSelectedImages(prev => {
      const isSelected = prev.some(img => img.id === item.id);
      if (isSelected) {
        return prev.filter(img => img.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handleContinue = () => {
    if (selectedImages.length > 0) {
      navigation.navigate('CustomRating', {
        selectedMedia: selectedImages
      });
    }
  };

  const renderItem = ({ item }: { item: InstagramMedia }) => {
    const isSelected = selectedImages.some(img => img.id === item.id);
    const windowWidth = Dimensions.get('window').width;
    const imageSize = (windowWidth - 40) / 3; // 3 images per row with padding

    return (
      <TouchableOpacity
        style={[
          styles.imageContainer,
          { width: imageSize, height: imageSize },
          isSelected && styles.selectedContainer
        ]}
        onPress={() => toggleImageSelection(item)}
      >
        <Image
          source={{ uri: item.media_url }}
          style={[
            styles.image,
            { width: imageSize - 4, height: imageSize - 4 }
          ]}
        />
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

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

          <FlatList
            data={instagramMedia}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={styles.gridContainer}
          />
        </View>
      </ScrollView>

      {selectedImages.length > 0 && (
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>
            Continue with {selectedImages.length} selected
          </Text>
        </TouchableOpacity>
      )}
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
  gridContainer: {
    padding: 8,
  },
  imageContainer: {
    margin: 2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  selectedContainer: {
    borderWidth: 2,
    borderColor: '#0066cc',
  },
  image: {
    borderRadius: 8,
  },
  checkmark: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#0066cc',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: '#0066cc',
    padding: 16,
    margin: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default InstagramRating;