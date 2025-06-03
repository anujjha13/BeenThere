import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import {createPost} from '../lib/api';
import {launchImageLibrary} from 'react-native-image-picker';
import MapView, {Marker, Region} from 'react-native-maps';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import {Dimensions} from 'react-native';
import {reverseGeocode} from '../../utils/reverseGeocode';
const { width, height } = Dimensions.get('window');
interface Photo {
  id?: string;
  image_url?: string;
  uri?: string;
  type?: string;
  fileName?: string;
}
interface FormData {
  place_type: string;
  country: string;
  visit_date: Date;
  reason_for_visit: string;
  overall_rating: number;
  experience: string;
  cost_rating: number;
  safety_rating: number;
  food_rating: number;
  longitude: number;
  latitude: number;
  city: string;
  Photos: Photo[];
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRID_GAP = 8; // same as your styles.photoGrid gap
const ITEMS_PER_ROW = SCREEN_WIDTH > 400 ? 5 : 4; // 4 per row on large screens, 3 on small
const ITEM_WIDTH = (SCREEN_WIDTH - GRID_GAP * (ITEMS_PER_ROW + 1)) / ITEMS_PER_ROW;
const placeTypeOptions = [
  {
    label: 'Restaurant',
    icon: 'silverware-fork-knife',
    iconSet: 'MaterialCommunityIcons',
  },
  {label: 'Winery', icon: 'glass-wine', iconSet: 'MaterialCommunityIcons'},
  {
    label: 'Hotel',
    icon: 'home-battery-outline',
    iconSet: 'MaterialCommunityIcons',
  },
];
const CustomRating = () => {
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReasons, setShowReasons] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [showPlaceTypeDropdown, setShowPlaceTypeDropdown] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);
  const [mapRegion, setMapRegion] = useState<Region>({
    latitude: 28.7041,
    longitude: 77.1025,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [formData, setFormData] = useState<FormData>({
    country: '',
    city: '',
    visit_date: new Date(),
    reason_for_visit: '',
    overall_rating: 0,
    experience: '',
    place_type: '',
    cost_rating: 3,
    safety_rating: 3,
    food_rating: 3,
    longitude: 28,
    latitude: 77,
    Photos: [],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  const handleMapPress = event => {
    const {coordinate} = event.nativeEvent;
    setSelectedLocation(coordinate);
    setMapRegion({
      ...mapRegion,
      latitude: coordinate.latitude,
      longitude: coordinate.longitude,
    });
  };

  const confirmLocation = async () => {
    if (selectedLocation) {
      updateFormField('latitude', selectedLocation.latitude);
      updateFormField('longitude', selectedLocation.longitude);

      const {country, city} = await reverseGeocode(
        selectedLocation.latitude,
        selectedLocation.longitude,
      );
      updateFormField('country', country);
      updateFormField('city', city);
      setShowMap(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.visit_date;
    setShowDatePicker(false);
    updateFormField('visit_date', currentDate);
  };

  const reasonOptions = [
    'Study Abroad',
    'Traveling With Kids',
    'Leisure',
    'Work',
    'Family Visit',
    'Education',
    'Other',
  ];

  function chunkArray(array, size) {
    const chunked = [];
    for (let i = 0; i < array.length; i += size) {
      chunked.push(array.slice(i, i + size));
    }
    return chunked;
  }
  const updateFormField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add this utility function anywhere in your file
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const selectReason = reason => {
    updateFormField('reason_for_visit', reason);
    setShowReasons(false);
  };

  const handleSubmit = async () => {
    if (!formData.country.trim()) {
      Alert.alert('Error', 'Please enter country');
      return;
    }

    if (!formData.city.trim()) {
      Alert.alert('Error', 'Please enter city');
      return;
    }
    // if (formData.overall_rating === 0) {
    //   Alert.alert('Error', 'Please provide an overall rating');
    //   return;
    // }

    if (!formData.reason_for_visit) {
      Alert.alert('Error', 'Please select a reason for visit');
      return;
    }
    if (!formData.latitude || !formData.longitude) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    try {
      setIsSubmitting(true);

      // Create a FormData object for multipart/form-data submission
      const form = new FormData();

      // Append text fields to form data
      form.append('country', formData.country);
      form.append('city', formData.city);
      form.append('visit_date', formatDate(formData.visit_date));
      form.append('reason_for_visit', formData.reason_for_visit);
      form.append('overall_rating', formData.overall_rating.toString());
      form.append('experience', formData.experience);

      if (formData.place_type) {
        form.append('place_type', formData.place_type);
      }

      form.append('cost_rating', formData.cost_rating.toString());
      form.append('safety_rating', formData.safety_rating.toString());
      form.append('food_rating', formData.food_rating.toString());

      // Append coordinates if available
      if (formData.latitude && formData.longitude) {
        form.append('latitude', formData.latitude.toString());
        form.append('longitude', formData.longitude.toString());
      }

      // Correctly append each photo individually to the form
      // The key needs to be 'photos' (plural) to match the API expectation
      selectedPhotos.forEach((photo, index) => {
        const fileType = photo.type || 'image/jpeg';
        const fileName = photo.fileName || `photo_${index}.jpg`;

        form.append('photos', {
          uri: photo.uri,
          type: fileType,
          name: fileName,
        });
      });

      console.log('Submitting form data:', form);

      // Call API with the FormData object
      const response = await createPost(form);

      if (response.success) {
        Alert.alert('Success', 'Your post has been created successfully', [
          {text: 'OK', onPress: () => navigation.goBack()},
        ]);
      } else {
        Alert.alert('Error', response.message || 'Failed to create post');
      }
    } catch (error) {
      console.error('Error submitting post:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      const permission =
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const granted = await PermissionsAndroid.request(permission, {
        title: 'Gallery Permission',
        message: 'App needs access to your gallery',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleAddPhotos = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert(
        'Permission denied',
        'Cannot access gallery without permission.',
      );
      return;
    }
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.8,
        selectionLimit: 5 - selectedPhotos.length,
      },
      response => {
        if (response.didCancel) {
          return;
        }
        if (response.errorCode) {
          Alert.alert('Error', response.errorMessage || 'Image picker error');
          return;
        }
        if (response.assets) {
          console.log('Selected photos:', response);
          setSelectedPhotos(prev => [
            ...prev,
            ...response.assets.slice(0, 10 - prev.length),
          ]);
        }
      },
    );
  };

  const handleRemovePhoto = (index: number) => {
    setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
  };

  // const reverseGeocode = async (latitude: number, longitude: number) => {
  //   try {
  //     const response = await fetch(
  //       `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
  //     );
  //     const data = await response.json();
  //     // Nominatim returns address object with country and city/locality
  //     const country = data.address?.country || '';
  //     const city =
  //       data.address?.city ||
  //       data.address?.town ||
  //       data.address?.village ||
  //       data.address?.state_district ||
  //       data.address?.state ||
  //       '';
  //     return {country, city};
  //   } catch (error) {
  //     console.error('Reverse geocoding failed:', error);
  //     return {country: '', city: ''};
  //   }
  // };

  useEffect(() => {
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor(showMap ? 'white' : '#e6f1ff');
      StatusBar.setBarStyle(showMap ? 'dark-content' : 'dark-content');
    }
  }, [showMap]);

  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="chevron-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rate & Review</Text>
          <TouchableOpacity>
            <Feather name="heart" size={20} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Upload Pictures */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Upload Pictures</Text>
            <View style={styles.photoGrid}>
              {selectedPhotos.map((photo, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.photoItem,
                    (idx + 1) % ITEMS_PER_ROW === 0 && {marginRight: 0},
                  ]}>
                  <Image
                    source={{uri: photo.uri}}
                    style={styles.uploadedPhoto}
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleRemovePhoto(idx)}>
                    <Feather name="x" size={12} color="#000" />
                  </TouchableOpacity>
                </View>
              ))}
              {selectedPhotos.length < 10 && (
                <TouchableOpacity
                  style={[
                    styles.addPhotoButton,
                    (selectedPhotos.length + 1) % ITEMS_PER_ROW === 0 && {
                      marginRight: 0,
                    },
                  ]}
                  onPress={handleAddPhotos}>
                  <Feather name="camera" size={24} color="#ccc" />
                  <Text style={styles.addPhotoText}>Add Photo</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Visit Details */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Visit Details</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Place Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Place Name"
                placeholderTextColor="black"
                value={formData.place_type}
                onChangeText={text => updateFormField('place_type', text)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Place Type</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowPlaceTypeDropdown(!showPlaceTypeDropdown)}
                activeOpacity={0.8}>
                <Text>
                  {formData.place_type
                    ? formData.place_type
                    : 'Select Place Type'}
                </Text>
                <Feather name="chevron-down" size={16} color="#000" />
              </TouchableOpacity>
              {showPlaceTypeDropdown && (
                <View style={styles.reasonsDropdown}>
                  {placeTypeOptions.map(option => (
                    <TouchableOpacity
                      key={option.label}
                      style={styles.reasonOption}
                      onPress={() => {
                        updateFormField('place_type', option.label);
                        setShowPlaceTypeDropdown(false);
                      }}>
                      {option.iconSet === 'MaterialCommunityIcons' ? (
                        <MaterialCommunityIcons
                          name={option.icon}
                          size={18}
                          color="#22c55e"
                          style={{marginRight: 8}}
                        />
                      ) : (
                        <Feather
                          name={option.icon}
                          size={18}
                          color="#22c55e"
                          style={{marginRight: 8}}
                        />
                      )}
                      <Text style={styles.reasonText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
            {/* <View style={styles.formGroup}>
            <Text style={styles.label}>Place Type</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text>Select Place Type</Text>
              <Feather name="chevron-down" size={16} color="#000" />
            </TouchableOpacity>
          </View> */}

            <View style={styles.formGroup}>
              <View style={styles.rowGroup}>
                <Text style={styles.label}>Country, City</Text>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={toggleMap}>
                  <MaterialIcons
                    name="location-searching"
                    size={16}
                    color="#f59e0b"
                  />
                  <Text style={styles.locationButtonText}>Locate On Map</Text>
                </TouchableOpacity>
              </View>
              <View>
                <TextInput
                  style={[styles.input, {flex: 1}]}
                   placeholderTextColor="black"
                  onChangeText={text => {
                    const [country = '', city = ''] = text
                      .split(',')
                      .map(s => s.trim());
                    updateFormField('country', country);
                    updateFormField('city', city);
                  }}
                />
              </View>
            </View>

            {/* <View style={styles.formGroup}>
            <Text style={styles.label}>City</Text>
            <View style={styles.rowGroup}>
              <TextInput
                style={[styles.input, {flex: 1}]}
                placeholder="City"
                value={formData.city}
                onChangeText={text => updateFormField('city', text)}
              /> */}
            {/* <TouchableOpacity style={styles.locationButton}>
                <Feather name="map-pin" size={16} color="#f59e0b" />
                <Text style={styles.locationButtonText}>Locate On Map</Text>
              </TouchableOpacity> */}
            {/* </View>
          </View> */}

            {/* <View style={styles.formGroup}>
            <Text style={styles.label}>Location Coordinates</Text>
            <View style={styles.rowGroup}>
              <TextInput
                style={[styles.input, {flex: 1, marginRight: 8}]}
                placeholder="Longitude"
                value={formData.longitude}
                onChangeText={(text) => updateFormField('longitude', text)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.input, {flex: 1}]}
                placeholder="Latitude"
                value={formData.latitude}
                onChangeText={(text) => updateFormField('latitude', text)}
                keyboardType="numeric"
              />
            </View>
          </View> */}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Last Visited</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}>
                <Feather
                  name="calendar"
                  size={16}
                  color="#000"
                  style={{marginRight: 8}}
                />
                <Text>{formData.visit_date.toLocaleDateString()}</Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={formData.visit_date}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                />
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Reason For Visit</Text>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => setShowReasons(!showReasons)}>
                <Text>{formData.reason_for_visit || 'Select Reason'}</Text>
                <Feather name="chevron-down" size={16} color="#000" />
              </TouchableOpacity>

              {showReasons && (
                <View style={styles.reasonsDropdown}>
                  {reasonOptions.map(reason => (
                    <TouchableOpacity
                      key={reason}
                      style={styles.reasonOption}
                      onPress={() => selectReason(reason)}>
                      <View
                        style={[
                          styles.checkbox,
                          formData.reason_for_visit === reason &&
                            styles.checkboxChecked,
                        ]}>
                        {formData.reason_for_visit === reason && (
                          <Feather name="check" size={12} color="white" />
                        )}
                      </View>
                      <Text style={styles.reasonText}>{reason}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Overall Rating */}
          <View style={styles.card}>
            <View style={styles.headerWithOptional}>
              <Text style={styles.cardTitle}>Overall Rating?</Text>
              <Text style={styles.optionalText}>Optional</Text>
            </View>

            <View style={styles.starRating}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map(star => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => updateFormField('overall_rating', star)}>
                    <Feather
                      name="star"
                      size={28}
                      color={
                        star <= formData.overall_rating ? '#FFCC00' : '#ddd'
                      }
                      solid={star <= formData.overall_rating}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingValue}>
                {formData.overall_rating}/5
              </Text>
            </View>
            <TextInput
              style={styles.textarea}
              placeholder="Share Your Experience..."
               placeholderTextColor="black"
              multiline
              numberOfLines={4}
              value={formData.experience}
              onChangeText={text => updateFormField('experience', text)}
            />
          </View>

          {/* Cost Rating */}
          <View style={styles.card}>
            <View style={styles.headerWithOptional}>
              <Text style={styles.cardTitle}>Cost Rating</Text>
              <Text style={styles.optionalText}>Optional</Text>
            </View>
            <View style={styles.sliderLabels}>
              <Text>Very Affordable</Text>
              <Text>Very Expensive</Text>
            </View>
            <Slider
              value={formData.cost_rating}
              minimumValue={1}
              maximumValue={5}
              step={1}
              thumbTintColor="#4CAF50"
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#ddd"
              onValueChange={(value: any) =>
                updateFormField('cost_rating', value)
              }
              style={styles.slider}
            />
            <View style={styles.sliderValues}>
              <Text>1</Text>
              <View style={styles.currentValue}>
                <Text>{formData.cost_rating}</Text>
              </View>
              <Text>5</Text>
            </View>
          </View>

          {/* Safety Rating */}
          <View style={styles.card}>
            <View style={styles.headerWithOptional}>
              <Text style={styles.cardTitle}>Safety Rating</Text>
              <Text style={styles.optionalText}>Optional</Text>
            </View>
            <View style={styles.sliderLabels}>
              <Text>Not Safe</Text>
              <Text>Very Safe</Text>
            </View>
            <Slider
              value={formData.safety_rating}
              minimumValue={1}
              maximumValue={5}
              step={1}
              thumbTintColor="#4CAF50"
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#ddd"
              onValueChange={(value: any) =>
                updateFormField('safety_rating', value)
              }
              style={styles.slider}
            />
            <View style={styles.sliderValues}>
              <Text>1</Text>
              <View style={styles.currentValue}>
                <Text>{formData.safety_rating}</Text>
              </View>
              <Text>5</Text>
            </View>
          </View>

          {/* Food Rating */}
          <View style={styles.card}>
            <View style={styles.headerWithOptional}>
              <Text style={styles.cardTitle}>Food Rating</Text>
              <Text style={styles.optionalText}>Optional</Text>
            </View>
            <View style={styles.sliderLabels}>
              <Text>Poor Food</Text>
              <Text>Excellent Food</Text>
            </View>
            <Slider
              value={formData.food_rating}
              minimumValue={1}
              maximumValue={5}
              step={1}
              thumbTintColor="#4CAF50"
              minimumTrackTintColor="#4CAF50"
              maximumTrackTintColor="#ddd"
              onValueChange={(value: any) =>
                updateFormField('food_rating', value)
              }
              style={styles.slider}
            />
            <View style={styles.sliderValues}>
              <Text>1</Text>
              <View style={styles.currentValue}>
                <Text>{formData.food_rating}</Text>
              </View>
              <Text>5</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.submitButtonText}>Create Post</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        {/* Full Screen Map */}
        {showMap && (
          <View style={styles.fullScreenMap}>
            <MapView
              style={styles.map}
              region={mapRegion}
              onRegionChangeComplete={setMapRegion}
              onPress={handleMapPress}>
              {selectedLocation && (
                <Marker
                  coordinate={selectedLocation}
                  title="Selected Location"
                  description="This location will be used for your review"
                />
              )}
            </MapView>

            <View style={styles.mapControls}>
              <TouchableOpacity style={styles.mapButton} onPress={toggleMap}>
                <Feather name="x" size={24} color="black" />
                <Text style={styles.mapButtonText}>Close Map</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.mapButton,
                  styles.confirmButton,
                  !selectedLocation && styles.disabledButton,
                ]}
                onPress={confirmLocation}
                disabled={!selectedLocation}>
                <Feather name="check" size={24} color="white" />
                <Text style={styles.confirmButtonText}>Confirm Location</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.mapInstructions}>
              <Text style={styles.instructionText}>
                Tap on the map to select your location
              </Text>
              {selectedLocation && (
                <View style={styles.locationDetails}>
                  <Text style={styles.locationText}>
                    Latitude: {selectedLocation.latitude.toFixed(6)}
                  </Text>
                  <Text style={styles.locationText}>
                    Longitude: {selectedLocation.longitude.toFixed(6)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}
      </SafeAreaView>
    </GradientScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#2E7D32',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // header: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   paddingHorizontal: 16,
  //   paddingVertical: 12,
  //   backgroundColor: 'white',
  //   borderBottomWidth: 1,
  //   borderBottomColor: '#eee',
  // },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.009,
    paddingBottom: height * 0.004,
    backgroundColor: 'white',
    borderColor: 'rgb(118, 118, 118)',
    borderWidth: 0.3,
    marginBottom: height * 0.001,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#b3dcff',
    //borderStyle: 'dashed',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // or use margin if gap is not supported
  },
  photoItem: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 8,
    marginBottom: GRID_GAP,
    marginRight: GRID_GAP,
    position: 'relative',
  },
  addPhotoButton: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: GRID_GAP,
    marginRight: GRID_GAP,
  },
  uploadedPhoto: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addPhotoText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    paddingHorizontal: 16,
  },
  selectButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  locationButtonText: {
    fontSize: 12,
    color: 'rgb(0, 136, 23)',
    marginLeft: 4,
  },
  dateButton: {
    height: 48,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reasonsDropdown: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  reasonOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#22c55e',
    borderColor: '#22c55e',
  },
  reasonText: {
    fontSize: 14,
  },
  headerWithOptional: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  optionalText: {
    fontSize: 14,
    color: '#f43f5e',
  },
  starRating: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  stars: {
    flexDirection: 'row',
  },
  ratingValue: {
    fontSize: 14,
  },
  textarea: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    textAlignVertical: 'top',
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  slider: {
    height: 40,
  },
  sliderValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentValue: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
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
  fullScreenMap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    zIndex: 1000,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapControls: {
    position: 'absolute',
    top: 48,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  mapButtonText: {
    marginLeft: 8,
    fontWeight: '500',
  },
  confirmButton: {
    backgroundColor: '#2E7D32',
  },
  confirmButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.7,
  },
  mapInstructions: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  locationDetails: {
    marginTop: 8,
    width: '100%',
  },
  locationText: {
    fontSize: 14,
    marginBottom: 4,
  },
});

export default CustomRating;
