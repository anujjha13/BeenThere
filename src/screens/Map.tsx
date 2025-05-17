import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';

const Map = () => {
  const navigation = useNavigation();
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('Portugal');
  
  const countries = [
    'Portugal',
    'Spain',
    'France',
    'Italy',
    'Greece',
    'United States',
  ];
  
  const markers = [
    { id: 1, coordinate: { latitude: 38.7223, longitude: -9.1393 } },
    { id: 2, coordinate: { latitude: 38.7123, longitude: -9.1293 } },
    { id: 3, coordinate: { latitude: 38.7323, longitude: -9.1493 } },
    { id: 4, coordinate: { latitude: 38.7423, longitude: -9.1593 } },
    { id: 5, coordinate: { latitude: 38.7523, longitude: -9.1693 } },
  ];

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>William's Map</Text>
        <TouchableOpacity>
          <Ionicons name="bookmark-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        {/* Country Selector */}
        <View style={styles.selectorContainer}>
          <Text style={styles.selectorLabel}>Select Your Country</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowCountryDropdown(!showCountryDropdown)}
          >
            <Text>{selectedCountry}</Text>
            <Ionicons name="chevron-down" size={20} color="black" />
          </TouchableOpacity>
          
          {/* Country Dropdown */}
          {showCountryDropdown && (
            <View style={styles.dropdownMenu}>
              {countries.map((country, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => handleCountrySelect(country)}
                >
                  {country === selectedCountry && (
                    <Ionicons name="checkmark" size={18} color="#4CAF50" style={styles.checkIcon} />
                  )}
                  <Text style={styles.dropdownItemText}>{country}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
        {/* Return Button */}
        <TouchableOpacity 
          style={styles.returnButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.returnButtonText}>Return To Passport</Text>
          <Ionicons name="arrow-forward" size={20} color="white" />
        </TouchableOpacity>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  selectorContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    zIndex: 10,
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
  dropdownMenu: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 16,
    paddingVertical: 8,
    zIndex: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  checkIcon: {
    marginRight: 8,
  },
  dropdownItemText: {
    fontSize: 16,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: 8,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -40 }],
  },
  mapControlButton: {
    width: 36,
    height: 36,
    backgroundColor: 'white',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  miniMap: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'white',
  },
  miniMapImage: {
    width: '100%',
    height: '100%',
  },
  returnButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginVertical: 16,
  },
  returnButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default Map;