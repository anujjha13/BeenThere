import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';

const { width, height } = Dimensions.get('window');

interface InstagramMedia {
  id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  timestamp: string;
}

interface Props {
  navigation: any;
  route: {
    params: {
      instagramImages: InstagramMedia[];
      userProfile?: any;
    };
  };
}

const InstagramImageSelector: React.FC<Props> = ({ navigation, route }) => {
  const { instagramImages, userProfile } = route.params;
  const [selectedImages, setSelectedImages] = useState<InstagramMedia[]>([]);

  const toggleImageSelection = (image: InstagramMedia) => {
    const isSelected = selectedImages.find(img => img.id === image.id);
    
    if (isSelected) {
      // Remove from selection
      setSelectedImages(prev => prev.filter(img => img.id !== image.id));
    } else {
      // Add to selection (max 10)
      if (selectedImages.length >= 10) {
        Alert.alert('Limit Reached', 'You can select maximum 10 images');
        return;
      }
      setSelectedImages(prev => [...prev, image]);
    }
  };

  const handleProceed = () => {
    if (selectedImages.length === 0) {
      Alert.alert('No Images Selected', 'Please select at least one image to proceed');
      return;
    }

    // Navigate to CustomRating with selected images and user profile data
    navigation.navigate('CustomRating', {
      selectedInstagramImages: selectedImages,
      userProfile: userProfile,
      isFromInstagram: true,
    });
  };

  const renderImageGrid = () => {
    const itemsPerRow = 3;
    const itemSize = (width - 32 - 16) / itemsPerRow; // 32 for padding, 16 for gaps

    return (
      <View style={styles.gridContainer}>
        {instagramImages.map((image, index) => {
          const isSelected = selectedImages.find(img => img.id === image.id);
          const selectionIndex = selectedImages.findIndex(img => img.id === image.id);
          
          return (
            <TouchableOpacity
              key={image.id}
              style={[styles.imageContainer, { width: itemSize, height: itemSize }]}
              onPress={() => toggleImageSelection(image)}
            >
              <Image
                source={{ uri: image.media_url }}
                style={[
                  styles.image,
                  isSelected && styles.selectedImage
                ]}
              />
              {isSelected && (
                <View style={styles.selectionBadge}>
                  <Text style={styles.selectionNumber}>{selectionIndex + 1}</Text>
                </View>
              )}
              {image.media_type === 'VIDEO' && (
                <View style={styles.videoIndicator}>
                  <Ionicons name="play" size={20} color="white" />
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    );
  };

  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Select Instagram Photos</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Selection Info */}
        <View style={styles.selectionInfo}>
          <Text style={styles.selectionText}>
            {selectedImages.length}/10 selected
          </Text>
          <Text style={styles.instructionText}>
            Select up to 10 photos to add to your rating
          </Text>
        </View>

        {/* Image Grid */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {renderImageGrid()}
        </ScrollView>

        {/* Proceed Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[
              styles.proceedButton,
              selectedImages.length === 0 && styles.disabledButton
            ]}
            onPress={handleProceed}
            disabled={selectedImages.length === 0}
          >
            <Text style={[
              styles.proceedButtonText,
              selectedImages.length === 0 && styles.disabledButtonText
            ]}>
              Proceed with {selectedImages.length} photos
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 0.3,
    borderBottomColor: 'rgb(118, 118, 118)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  selectionInfo: {
    backgroundColor: 'white',
    padding: 16,
    alignItems: 'center',
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scrollView: {
    flex: 1,
    backgroundColor: 'white',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    justifyContent: 'space-between',
  },
  imageContainer: {
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  selectedImage: {
    opacity: 0.7,
    borderWidth: 3,
    borderColor: '#2E7D32',
  },
  selectionBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#2E7D32',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionNumber: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 16,
    padding: 4,
  },
  bottomContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderTopWidth: 0.3,
    borderTopColor: 'rgb(118, 118, 118)',
  },
  proceedButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#999',
  },
});

export default InstagramImageSelector; 