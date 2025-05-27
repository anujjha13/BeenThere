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
  Platform,
} from 'react-native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';

const { width, height } = Dimensions.get('window');
const IMAGE_SIZE = Math.min(width * 0.32, 135); // Responsive image size

const images = [
  require('../../assets/images/place2.png'),
  require('../../assets/images/place1.png'),
  require('../../assets/images/place7.png'),
  require('../../assets/images/place3.png'),
  require('../../assets/images/place4.png'),
  require('../../assets/images/place5.png'),
  require('../../assets/images/place6.png'),
];

// Responsive config for image positions
const config = [
  { left: width * 0.43, top: -height * 0.09, rotate: '12deg' },
  { left: width * 0.12, top: -height * 0.08, rotate: '-19deg' },
  { left: -IMAGE_SIZE / 2.6, top: height * 0.04, rotate: '-10deg' },
  { left: width * 0.72, top: -height * 0.07, rotate: '42deg' },
  { left: width * 0.86, top: height * 0.09, rotate: '-10deg' },
  { left: width * 0.51, top: height * 0.09, rotate: '13deg' },
  { left: width * 0.20, top: height * 0.09, rotate: '-10deg' },
  { left: -IMAGE_SIZE / 2, top: height * 0.06, rotate: '20deg' },
];

const Startup = ({ navigation }) => {
  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <View style={styles.imageRing}>
            {images.map((src, index) => (
              <Image
                key={index}
                source={src}
                style={[
                  styles.image,
                  {
                    top: config[index]?.top ?? 0,
                    left: config[index]?.left ?? 0,
                    transform: [{ rotate: config[index]?.rotate ?? '0deg' }],
                  },
                ]}
              />
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.greeting}>Hi There!</Text>
            <Text style={styles.title}>
              Welcome To Our <Text style={styles.brand}>BEEN THERE </Text>
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
              activeOpacity={0.8}
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
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: height * 0.04,
    paddingHorizontal: width * 0.05,
    minHeight: height,
  },
  imageRing: {
    width: width,
    height: Math.max(height * 0.28, 180),
    position: 'relative',
    marginBottom: height * 0.03,
  },
  image: {
    position: 'absolute',
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: 18,
    borderWidth: 6,
    borderColor: '#fff',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: Platform.OS === 'ios' ? 0.2 : 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  card: {
    backgroundColor: '#fff',
    padding: width * 0.06,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    shadowColor: 'gray',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
    marginBottom: height * 0.04,
  },
  greeting: {
    fontSize: Math.min(30, width * 0.08),
    fontWeight: '700',
    marginBottom: 8,
  },
  title: {
    fontSize: Math.min(20, width * 0.055),
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
    fontSize: Math.min(16, width * 0.045),
    color: 'rgb(126, 127, 127)',
    marginBottom: 20,
    lineHeight: 22,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#2E7D32',
    paddingVertical: height * 0.018,
    paddingHorizontal: width * 0.06,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: Math.min(22, width * 0.06),
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