import React, {useState} from 'react';
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useNavigation} from '@react-navigation/native';
import Slider from '@react-native-community/slider';
import { createPost } from '../lib/api';

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
  longitude: string;
  latitude: string;
  city : string;
}

const CustomRating = () => {
  const navigation = useNavigation();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReasons, setShowReasons] = useState(false);
  // const [date, setDate] = useState(new Date());
  // const [formattedDate, setFormattedDate] = useState('');
  // const [selectedReasons, setSelectedReasons] = useState([]);
  // const [overallRating, setOverallRating] = useState(0);
  // const [costRating, setCostRating] = useState(3);
  //const [safetyRating, setSafetyRating] = useState(3);
  //const [foodRating, setFoodRating] = useState(3);

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
    longitude: '',
    latitude: '',
  });

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || formData.visit_date;
    setShowDatePicker(false);
    updateFormField('visit_date', currentDate);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const reasonOptions = [
    'Study Abroad',
    'Traveling With Kids',
    'Leisure',
    'Work',
    'Family Visit',
    'Education',
    'Other',
  ];

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

  const selectReason = (reason) => {
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
    if (formData.overall_rating === 0) {
      Alert.alert('Error', 'Please provide an overall rating');
      return;
    }

    if (!formData.reason_for_visit) {
      Alert.alert('Error', 'Please select a reason for visit');
      return;
    }

    try {
      setIsSubmitting(true);

      // Prepare form data for API
      const postData = {
        ...formData,
        visit_date: formatDate(formData.visit_date),
      };

      // Call API
      const response = await createPost(postData);

      if (response.success) {
        Alert.alert('Success', 'Your post has been created successfully', [
          { text: 'OK', onPress: () => navigation.goBack() }
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


  return (
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
            <View style={styles.photoItem}>
              <Image
                source={{
                  uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-17%20at%206.46.29%E2%80%AFPM-HG6P4t88lItdY6hKl4WcyQBB363Ztk.png',
                }}
                style={styles.uploadedPhoto}
              />
              <TouchableOpacity style={styles.removeButton}>
                <Feather name="x" size={12} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.photoItem}>
              <Image
                source={{
                  uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202025-05-17%20at%206.46.29%E2%80%AFPM-HG6P4t88lItdY6hKl4WcyQBB363Ztk.png',
                }}
                style={styles.uploadedPhoto}
              />
              <TouchableOpacity style={styles.removeButton}>
                <Feather name="x" size={12} color="#000" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.addPhotoButton}>
              <Feather name="camera" size={24} color="#ccc" />
              <Text style={styles.addPhotoText}>Add Photo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Visit Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Visit Details</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Place Type</Text>
            <TextInput
              style={styles.input}
              placeholder="Place Name"
              value={formData.place_type}
              onChangeText={(text) => updateFormField('place_type', text)}
            />
          </View>

          {/* <View style={styles.formGroup}>
            <Text style={styles.label}>Place Type</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text>Select Place Type</Text>
              <Feather name="chevron-down" size={16} color="#000" />
            </TouchableOpacity>
          </View> */}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Country</Text>
            <View style={styles.rowGroup}>
              <TextInput
                style={[styles.input, {flex: 1}]}
                placeholder="Country"
                value={formData.country}
                onChangeText={(text) => updateFormField('country', text)}
              />
              <TouchableOpacity style={styles.locationButton}>
                <Feather name="map-pin" size={16} color="#f59e0b" />
                <Text style={styles.locationButtonText}>Locate On Map</Text>
              </TouchableOpacity>
            </View>
          </View>

           <View style={styles.formGroup}>
            <Text style={styles.label}>City</Text>
            <View style={styles.rowGroup}>
              <TextInput
                style={[styles.input, {flex: 1}]}
                placeholder="City"
                value={formData.city}
                onChangeText={(text) => updateFormField('city', text)}
              />
              {/* <TouchableOpacity style={styles.locationButton}>
                <Feather name="map-pin" size={16} color="#f59e0b" />
                <Text style={styles.locationButtonText}>Locate On Map</Text>
              </TouchableOpacity> */}
            </View>
          </View>

          <View style={styles.formGroup}>
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
          </View>

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
              <Text>
                {formData.reason_for_visit || 'Select Reason'}
              </Text>
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
                    color={star <= formData.overall_rating ? '#FFCC00' : '#ddd'}
                    solid={star <= formData.overall_rating}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingValue}>{formData.overall_rating}/5</Text>
          </View>
          <TextInput
            style={styles.textarea}
            placeholder="Share Your Experience..."
            multiline
            numberOfLines={4}
            value={formData.experience}
            onChangeText={(text) => updateFormField('experience', text)}
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
            onValueChange={(value: any) => updateFormField('cost_rating', value)}
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
            onValueChange={(value: any) => updateFormField('safety_rating', value)}
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
            onValueChange={(value: any) => updateFormField('food_rating', value)}
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
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.submitButtonText}>Create Post</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6f1ff',
  },
  submitButton: {
    backgroundColor: '#22c55e',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
    borderStyle: 'dashed',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  photoGrid: {
    flexDirection: 'row',
  },
  photoItem: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    position: 'relative',
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
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
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
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  locationButtonText: {
    fontSize: 12,
    color: '#f59e0b',
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
});

export default CustomRating;
