import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';

const { width, height } = Dimensions.get('window');
const IMAGE_SIZE = 100;

const images = [
  require('../../assets/images/place2.png'),
  require('../../assets/images/place1.png'),
  require('../../assets/images/place7.png'),
  require('../../assets/images/place3.png'),
  require('../../assets/images/place4.png'),
  require('../../assets/images/place5.png'),
  require('../../assets/images/place6.png'),
];

const config = [
  { left: width * 0.43, top: -80, rotate: '12deg' },
  { left: width * 0.12, top: -70, rotate: '-19deg' },
  { left: -IMAGE_SIZE / 2.6, top: 30, rotate: '-10deg' },
  { left: width * 0.72, top: -60, rotate: '42deg' },
  { left: width * 0.86, top: 78, rotate: '-10deg' },
  { left: width * 0.51, top: 74, rotate: '13deg' },
  { left: width * 0.20, top: 74, rotate: '-10deg' },
  { left: -IMAGE_SIZE / 2, top: 50, rotate: '20deg' },
];

const Startup = ({ navigation }) => {
  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={{ alignItems: 'center', flex: 1, justifyContent: "space-between" }}
          showsVerticalScrollIndicator={false}
        >
          <View />
          <View style={styles.imageRing}>
            {images.map((src, index) => (
              <Image
                key={index}
                source={src}
                style={[
                  styles.image,
                  {
                    top: config[index].top,
                    left: config[index].left,
                    transform: [{ rotate: config[index].rotate }],
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.greeting}>Hi There!</Text>
            <Text style={styles.title}>
              Welcome To Our <Text style={styles.brand}>BEEN THERE</Text>{'\n'}
              Mobile App
            </Text>
            <Text style={styles.description}>
              Discover Breathtaking Places, Share Your Journey, And Relive
              Unforgettable Moments. Whether You're A Traveler, An Adventurer, Or A
              Storyteller — BeenThere Is Your Space To Connect, Reflect, And Inspire.
            </Text>

            <TouchableOpacity
              style={styles.button}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.buttonText}>Get Started</Text>
              <View style={styles.iconWrapper}>
                <Image
                  source={require('../../assets/images/pajamas_arrow-right.png')}
                  style={styles.iconImage}
                />
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </GradientScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    display: 'flex',
      flexDirection: 'column',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 36,
  },
  scrollContainer: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingTop: 20,
  },
  imageRing: {
    width: width,
    height: 240,
    position: 'relative',
    marginTop: height * 0.08,
    marginBottom: 20,
  },
  image: {
    position: 'absolute',
    width: 135,
    height: 135,
    borderRadius: 18,
    borderWidth: 10,
    borderColor: '#fff',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    width: width * 0.92,
    shadowColor: 'gray',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  greeting: {
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: '#222',
    marginBottom: 10,
    lineHeight: 30,
  },
  brand: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  description: {
    fontSize: 16,
    color: 'rgb(126, 127, 127)',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 22,
    marginRight: 10,
  },
  iconWrapper: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 50,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});

export default Startup;
