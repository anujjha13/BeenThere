import React from 'react';
import { View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const GoogleMapInput = () => {
  return (
    <View style={{ flex: 1 , backgroundColor: 'blue', padding: 20 }}>
    <GooglePlacesAutocomplete
      placeholder='Search'
      fetchDetails={true}
      onPress={(data, details = null) => {
        // 'details' is provided when fetchDetails = true
        console.log(data, details);
      }}
      query={{
        key: 'AIzaSyCH6GrzC1Vs8jnE7MTn-ssHzD_zwbjOuKM',
        language: 'en',
      }}
      predefinedPlaces={[]}
    />
    </View>
  );
};

export default GoogleMapInput;