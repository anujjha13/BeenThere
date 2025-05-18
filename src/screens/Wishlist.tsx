import React from 'react';
import {
  View,
  SafeAreaView,
  Text,
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const DestinationCard = () => (
    <ImageBackground
      source={{ uri: 'https://c8.alamy.com/comp/CRCGYP/the-niagara-falls-view-from-above-from-a-lookout-tower-niagara-falls-CRCGYP.jpg' }}
      style={styles.card}
      imageStyle={styles.imageStyle}
    >
      <View style={styles.overlay}>
        {/* Top Row */}
        <View style={styles.topRow}>
          <View style={styles.locationTag}>
            <Ionicons name="location" size={14} color="#FFC107" />
            <Text style={styles.locationText}>North America</Text>
          </View>
          <View style={styles.badges}>
            <View style={styles.visitedBadge}>
              <Text style={styles.visitedText}>Visited</Text>
            </View>
            <TouchableOpacity style={styles.heartButton}>
              <Ionicons name="heart" size={20} color="#E53935" />
            </TouchableOpacity>
          </View>
        </View>
  
        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
            <View style={styles.bottomInfoLeft}>
                <Text style={styles.destinationName}>Niagara Falls</Text>
                <View style={styles.ratingRow}>
                    <View style={styles.stars}>
                        {[...Array(4)].map((_, i) => (
                            <Ionicons key={i} name="star" size={16} color="#FFC107" />
                        ))}
                        <Ionicons name="star-outline" size={16} color="#FFC107" />
                    </View>
                    <Text style={styles.ratingText}>(4/5)</Text>
                </View>
            </View>
  
            <View style={styles.bottomInfoRight}>
                <Text style={styles.followersLabel}>Visited By Your Followers:</Text>
                <View style={styles.avatarsRow}>
                    <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={styles.avatar} />
                    <Image source={{ uri: 'https://randomuser.me/api/portraits/women/44.jpg' }} style={styles.avatar} />
                    <Image source={{ uri: 'https://randomuser.me/api/portraits/men/46.jpg' }} style={styles.avatar} />
                    <Image source={{ uri: 'https://randomuser.me/api/portraits/women/68.jpg' }} style={styles.avatar} />
                    <View style={styles.moreAvatar}>
                        <Text style={styles.moreText}>8+</Text>
                    </View>
                </View>
            </View>
        </View>
      </View>
    </ImageBackground>
  );

const Wishlist = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Willam.Kloss</Text>
        <TouchableOpacity>
          <Ionicons name="location-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.screenTitle}>William's Wishlist</Text>
      
      <ScrollView style={styles.scrollView}>
        <DestinationCard />
        <DestinationCard />
        <DestinationCard />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5FB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  scrollView: {
    paddingHorizontal: 16,
  },
  card: {
    height: 300,
    borderRadius: 16,
    overflow: 'hidden',
    margin: 16,
    justifyContent: 'space-between',
  },
  imageStyle: {
    resizeMode: 'cover',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.25)', // Optional: darken whole card a bit
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationTag: {
    flexDirection: 'row',
    backgroundColor: '#333',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
  },
  locationText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitedBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  visitedText: {
    color: '#fff',
    fontSize: 12,
  },
  heartButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 6,
    borderRadius: 16,
  },
  bottomInfo: {
    // Shadow background
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    padding: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomInfoLeft: {
    marginBottom: 1,
  },
  destinationName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  stars: {
    flexDirection: 'row',
  },
  ratingText: {
    color: '#fff',
    marginLeft: 6,
    fontSize: 12,
  },
  followersLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
  },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: -6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  moreAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  moreText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  destinationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  destinationImage: {
    width: '100%',
    height: 200,
  },
  destinationInfo: {
    padding: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -4,
  },
  followersContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  followersText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  followerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginRight: -8,
    borderWidth: 2,
    borderColor: 'white',
  },
  moreAvatars: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  moreAvatarsText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Wishlist;