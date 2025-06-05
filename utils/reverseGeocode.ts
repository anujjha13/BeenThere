export const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
        console.log('Reverse geocoding coordinates:', latitude, longitude);
      if( !latitude || !longitude) {
        return {country: '', city: ''};
      }
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
        {
          headers: {
            'User-Agent': 'BeenThere-App/1.0',
            'Accept-Language': 'en'
          }
        }
      );
      console.log('Response:', response);
      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
    }
      const data = await response.json();
      // Nominatim returns address object with country and city/locality
      const country = data.address?.country || '';
      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.village ||
        data.address?.state_district ||
        data.address?.state ||
        '';
      return {country, city};
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return {country: '', city: ''};
    }
};