import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  StatusBar,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
// import MapView, {Marker} from 'react-native-maps';
import { useAuth } from '../context/authContext';
import { getPassportCountryCities } from '../lib/api';

const Map = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const route = useRoute();
  const {countries} = route.params;
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0] || '');
  const [loading, setLoading] = useState(false);
  const [cities, setCities] = useState([]);

  const markers = [
    {id: 1, coordinate: {latitude: 38.7223, longitude: -9.1393}},
    {id: 2, coordinate: {latitude: 38.7123, longitude: -9.1293}},
    {id: 3, coordinate: {latitude: 38.7323, longitude: -9.1493}},
    {id: 4, coordinate: {latitude: 38.7423, longitude: -9.1593}},
    {id: 5, coordinate: {latitude: 38.7523, longitude: -9.1693}},
  ];

  const toggleCountryDropdown = () => {
    setShowCountryDropdown(!showCountryDropdown);
  };

  const handleSelectCountry = (country: string) => {
    setSelectedCountry(country);
    setShowCountryDropdown(false);
  };

  const fetchPassportCountryCities = async (country: string) => {
    setLoading(true);
    try {
      const res = await getPassportCountryCities(country);
      console.log('Fetched cities:', res);
      if(res?.success){
        setCities(res?.data?.cities || []);
      }else{
        console.error(res?.message || 'Failed to fetch cities');
      }
    } catch (error) {
      console.error('Error fetching passport country cities:', error);
    }finally{
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPassportCountryCities(selectedCountry);
  }, [selectedCountry]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{user?.full_name}'s Map</Text>
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
            onPress={toggleCountryDropdown}>
            <Text>{selectedCountry || 'Select Country'}</Text>
            <Ionicons name="chevron-down" size={20} color="black" />
          </TouchableOpacity>

          {showCountryDropdown && (
            <View style={styles.dropdownList}>
              <ScrollView style={styles.countryList} nestedScrollEnabled={true}>
                {countries.map((country, index) => (
                  <TouchableOpacity
                    key={index}
                    style={
                      selectedCountry === country
                        ? styles.selectedCountryItem
                        : styles.countryItem
                    }
                    onPress={() => handleSelectCountry(country)}>
                    <View style={styles.countryItemContent}>
                      {selectedCountry === country && (
                        <Ionicons
                          name="checkmark"
                          size={18}
                          color="#4CAF50"
                          style={styles.checkIcon}
                        />
                      )}
                      <Text style={styles.countryItemText}>{country}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>
        {/* Map Container */}
        <View style={styles.mapContainer}>
          {/* <MapView
            style={styles.map}
            onRegionChange={(region) => {
              console.log('Region changed:', region);
            }}
            initialRegion={{
              latitude: 38.7223,
              longitude: -9.1393,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            {cities?.length && cities?.map((marker, idx) => (
              <Marker
                key={idx}
                coordinate={{latitude: marker?.latitude, longitude: marker.longitude}}
                title={`${marker?.city}`}
                // description={`Country: ${selectedCountry}`}
              />
            ))}
          </MapView> */}

          {/* Map Controls */}
          <View style={styles.mapControls}>
            <TouchableOpacity style={styles.mapControlButton}>
              <Ionicons name="locate-outline" size={20} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.mapControlButton}>
              <Ionicons name="search-outline" size={20} color="black" />
            </TouchableOpacity>
          </View>

          {/* Mini Map */}
          <View style={styles.miniMap}>
            <Image
              source={{uri: 'https://via.placeholder.com/150'}}
              style={styles.miniMapImage}
            />
          </View>
        </View>

        {/* Return Button */}
        <TouchableOpacity
          style={styles.returnButton}
          onPress={() => navigation.goBack()}>
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
    zIndex: 1,
  },
  dropdownList: {
    position: 'absolute',
    width: '100%',
    top: 95,
    left: 20,
    backgroundColor: 'white',
    // borderWidth: 1,
    // borderColor: '#e0e0e0',
    borderRadius: 12,
    marginTop: 4,
    maxHeight: 200,
    zIndex: 2,
    padding: 8,
    paddingHorizontal: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  countryList: {
    // padding: 6,
  },
  countryItem: {
    padding: 8,
    // paddingHorizontal: 16,
    borderRadius: 12,
    // borderColor: '#e0e0e0',
    // borderWidth: 1,
    marginVertical: 4,
  },
  selectedCountryItem: {
    padding: 8,
    // paddingHorizontal: 16,
    borderRadius: 12,
    borderColor: '#CCCCCC',
    backgroundColor: '#F2FEF8',
    borderWidth: 1,
    marginVertical: 4,
  },
  countryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryItemText: {
    fontSize: 15,
  },
  selectedCountryText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  checkIcon: {
    marginRight: 8,
  },
  countryContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
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
    transform: [{translateY: -40}],
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
    shadowOffset: {width: 0, height: 2},
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
