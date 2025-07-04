import React, {useEffect, useState, useRef} from 'react';
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
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {useAuth} from '../context/authContext';
import {getPassportCountryCities} from '../lib/api';
import MapView, {Marker, Region} from 'react-native-maps';
import {Dimensions} from 'react-native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';

const {width, height} = Dimensions.get('window');

type City = {
  city: string;
  latitude: string;
  longitude: string;
};

type MapScreenParams = {
  countries: string[];
};

const Map = () => {
  const navigation = useNavigation();
  const {user} = useAuth();
  const route = useRoute<RouteProp<Record<string, MapScreenParams>, string>>();
  const countries: string[] =
    (route.params as MapScreenParams)?.countries || [];
  const [showCountryDropdown, setShowCountryDropdown] =
    useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<string>(
    countries[0] || '',
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [cities, setCities] = useState<City[]>([]);
  const [mapRegion, setMapRegion] = useState({
    latitude: 28.7223,
    longitude: 77.1393,
    latitudeDelta: 5,
    longitudeDelta: 5,
  });
  const [isFullScreen, setIsFullScreen] = useState<boolean>(false);
  const mapRef = useRef<MapView>(null);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

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
      if (country) {
        const res = await getPassportCountryCities(country);
        console.log('Fetched cities:', res);
        if (res?.success) {
          setCities(res?.data?.cities || []);
          const region = calculateRegion(res?.data?.cities || []);
          setTimeout(() => {
            if (mapRef.current) {
              mapRef.current.animateToRegion(region as Region, 1000);
            }
          }, 300);
        } else {
          console.error(res?.message || 'Failed to fetch cities');
        }
      }
    } catch (error) {
      console.error('Error fetching passport country cities:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRegion = (citiesData: City[]): typeof mapRegion => {
    if (!citiesData || citiesData.length === 0) {
      return {
        latitude: 28.7223,
        longitude: 77.1393,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      };
    }

    // Filter out cities with invalid coordinates
    const validCities = citiesData.filter(
      (city: City) =>
        city?.latitude &&
        city?.longitude &&
        !isNaN(parseFloat(city.latitude)) &&
        !isNaN(parseFloat(city.longitude)),
    );

    if (validCities.length === 0) {
      return {
        latitude: 28.7223,
        longitude: 77.1393,
        latitudeDelta: 5,
        longitudeDelta: 5,
      };
    }

    // Calculate the center
    const totalLat = validCities.reduce(
      (sum: number, city: City) => sum + parseFloat(city.latitude),
      0,
    );
    const totalLng = validCities.reduce(
      (sum: number, city: City) => sum + parseFloat(city.longitude),
      0,
    );

    return {
      latitude: totalLat / validCities.length,
      longitude: totalLng / validCities.length,
      latitudeDelta: 5,
      longitudeDelta: 5,
    };
  };

  useEffect(() => {
    fetchPassportCountryCities(selectedCountry);
  }, [selectedCountry]);

  useEffect(() => {
    if (cities && cities.length > 0) {
      setMapRegion(calculateRegion(cities));
    }
  }, [cities]);

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
          <Ionicons name="bookmark-outline" size={24} color="transparent" />
        </TouchableOpacity>
      </View>

      <GradientScreenWrapper>
        <View style={styles.content}>
          {/* Country Selector */}
          <View style={styles.selectorContainer}>
            <Text style={styles.selectorLabel}>Select Your Country</Text>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={toggleCountryDropdown}>
              <Text style={{textTransform: 'capitalize', fontSize: 16}}>
                {selectedCountry || 'Select Country'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="black" />
            </TouchableOpacity>

            {showCountryDropdown && (
              <View style={styles.dropdownList}>
                <ScrollView
                  style={styles.countryList}
                  nestedScrollEnabled={true}>
                  {countries.map((country: string, index: number) => (
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
          <View
            style={[
              styles.mapContainer,
              isFullScreen && styles.fullScreenMapContainer,
            ]}>
            <MapView
              ref={mapRef}
              style={{width: '100%', height: '100%'}}
              initialRegion={{
                latitude: 28.7223,
                longitude: 77.1393,
                latitudeDelta: 10,
                longitudeDelta: 10,
              }}>
              <Marker
                coordinate={{latitude: 28.7223, longitude: 77.1393}}
                title="Test Marker"
                description="This is a test marker"
              />
              <Marker
                coordinate={{latitude: 27.7223, longitude: 79.1393}}
                title="Test Marker"
                description="This is a test marker"
              />
              {cities?.length ? (
                cities?.map((city: City, idx: number) => (
                  <Marker
                    key={idx}
                    coordinate={{
                      latitude: parseFloat(city.latitude),
                      longitude: parseFloat(city.longitude),
                    }}
                    title={city.city}
                  />
                ))
              ) : (
                <Marker
                  coordinate={{latitude: 28.7223, longitude: 77.1393}}
                  title="No Cities Found"
                  description="Please select a different country."
                />
              )}
            </MapView>
            <TouchableOpacity
              style={styles.fullScreenButton}
              onPress={toggleFullScreen}>
              <Ionicons
                name={isFullScreen ? 'contract' : 'expand'}
                size={24}
                color="black"
              />
            </TouchableOpacity>
          </View>

          {/* Return Button */}
          <TouchableOpacity
            style={styles.returnButton}
            onPress={() => navigation.goBack()}>
            <Text style={styles.returnButtonText}>Return To Passport</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </GradientScreenWrapper>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.01,
    paddingBottom: height * 0.02,
    borderBottomWidth: 0.3,
    borderBottomColor: 'rgb(118, 118, 118)',
    marginBottom: height * 0.001,
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
    textTransform: 'capitalize',
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
    height: 400,
    width: '100%',
    marginVertical: 16,
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  fullScreenMapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    height: '100%',
    width: '100%',
    zIndex: 999,
    marginVertical: 0,
    borderRadius: 0,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  fullScreenButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 25,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 1000,
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
