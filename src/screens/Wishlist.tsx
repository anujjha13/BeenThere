import React, {useEffect, useState} from 'react';
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
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/authContext';
import {addToWishList, getAllWishlist} from '../lib/api';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import {renderStarRating} from './Passport';
import { Post } from '../../utils/type';

type WishlistItem = {
  id: string;
  post_id: string;
  destination: string;
  Post: Post;
  [key: string]: any;
};

interface DestinationCardProps {
  data: WishlistItem;
  post: Post;
  dest: string;
  refreshUser: () => void;
  user: WishlistItem[];
}

const DestinationCard = ({data, post, dest, refreshUser, user}: DestinationCardProps) => {
  const [toggleHeart, setToggleHeart] = useState(
    Array.isArray(user) && user.some((item: WishlistItem) => item?.post_id === data?.post_id) ? true : false,
  );
  const handleToggleWishList = async () => {
    try {
      const res = await addToWishList(data?.post_id);

      if (res?.success) {
        // Alert.alert('Success', `${res?.message || 'Post added to wishlist.'}`);
        refreshUser();
        setToggleHeart(!toggleHeart);
      } else {
        Alert.alert('Error', res.message || 'Failed to add post to wishlist.');
      }
    } catch (error) {
      console.error('Error adding post to wishlist:', error);
      Alert.alert('Error', 'Something went wrong. Please try again later.');
    }
  };
  return (
    <ImageBackground
      source={{
        uri: post?.Photos && post?.Photos[0]
          ? post?.Photos[0]?.image_url
          : 'https://c8.alamy.com/comp/CRCGYP/the-niagara-falls-view-from-above-from-a-lookout-tower-niagara-falls-CRCGYP.jpg',
      }}
      style={styles.card}
      imageStyle={styles.imageStyle}>
      <View style={styles.overlay}>
        {/* Top Row */}
        <View style={styles.topRow}>
          <View style={styles.locationTag}>
            <Ionicons name="location" size={14} color="#FFC107" />
            <Text style={styles.locationText}>{(post as any)?.continent || dest}</Text>
          </View>
          <View style={styles.badges}>
            <View style={styles.visitedBadge}>
              <Text style={styles.visitedText}>
                {post?.visit_date ? 'Visited' : 'Not Visited'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleToggleWishList}
              style={styles.heartButton}>
              <Ionicons
                name={toggleHeart ? 'heart' : 'heart-outline'}
                size={20}
                color="#E53935"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Info */}
        <View style={styles.bottomInfo}>
          <View style={styles.bottomInfoLeft}>
            <Text style={styles.destinationName}>{post?.city}</Text>
            <View style={styles.ratingRow}>
              {renderStarRating(post?.overall_rating)}
              <Text style={styles.ratingText}>{post?.overall_rating}/5</Text>
            </View>
          </View>

          <View style={styles.bottomInfo}>
            <Text style={styles.followersLabel}>
              Visited By Your Followers:
            </Text>
            <View style={styles.avatarsRow}>
              <Image
                source={{uri: 'https://randomuser.me/api/portraits/men/32.jpg'}}
                style={styles.avatar}
              />
              <Image
                source={{
                  uri: 'https://randomuser.me/api/portraits/women/44.jpg',
                }}
                style={styles.avatar}
              />
              <Image
                source={{uri: 'https://randomuser.me/api/portraits/men/46.jpg'}}
                style={styles.avatar}
              />
              <View style={styles.moreAvatar}>
                <Text style={styles.moreText}>8+</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
};

interface WishlistProps {
  navigation: { goBack: () => void };
}

const Wishlist = ({navigation}: WishlistProps) => {
  const {user, refreshUser} = useAuth();
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  const fetchWishlist = async (userId?: string) => {
    setLoading(true);
    try {
      const res = await getAllWishlist(userId || '');
      if (res.success) {
        console.log('Wishlist fetched successfully:', res.data);

        setWishlist(res?.data);
        setLoading(false);
      } else {
        console.error('Failed to fetch wishlist:', res.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching wishlist:', error.message);
      } else {
        console.error('Error fetching wishlist:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchWishlist(user.id);
    }
  }, [user?.id]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2E7D32" />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <TouchableOpacity>
          <Image
            source={require('../../assets/images/logo.png')}
            style={{width: 30, height: 30}}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.screenTitle}>{user?.full_name}'s Wishlist</Text>

      <ScrollView style={styles.scrollView}>
        {wishlist?.length > 0 &&
          wishlist?.map((item, idx) => (
            <DestinationCard
              key={idx}
              data={item}
              post={item?.Post}
              dest={item?.destination}
              refreshUser={refreshUser}
              user={wishlist}
            />
          ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
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
