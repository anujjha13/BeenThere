import React from 'react';
import { Text, View, StyleSheet, Image } from 'react-native';

export default function BeenThere() {

  return (
    <View>
        <View style={styles.container}>
            <Image style={styles.logo} source={require('../assets/images/logo.png')} />
        </View>
        <Text style={styles.font}>Share. Discover. Relieve.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
   container: {
    padding: 25,
    backgroundColor:'rgb(255, 255, 255)',
    borderRadius: 28,
    alignSelf: 'center',
   },
  logo: {
    width: 80,
    height: 80,
  },
  font: {
    fontSize: 25,
    fontFamily: 'Public-Sans',
    fontStyle: 'italic',
    color: '#088445',
    padding: 20,
    alignSelf: 'center',
  },
});
