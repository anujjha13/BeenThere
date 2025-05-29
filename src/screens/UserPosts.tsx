import React, {use, useEffect, useState} from 'react';
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
  FlatList,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useAuth} from '../context/authContext';
import {getAllPostByUserId, getAllTopDestination} from '../lib/api';
import {ActivityIndicator} from 'react-native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import {renderStarRating} from './Passport';
import {useRoute} from '@react-navigation/native';

const DestinationCard = ({post}) => {
  return (
    <ImageBackground
      source={{
        uri: post?.Photos[0]
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
            <Text style={styles.locationText}>{post?.country}</Text>
          </View>
          <View style={styles.badges}>
            <View style={styles.visitedBadge}>
              <Text style={styles.visitedText}>
                {post?.visit_date ? 'Visited' : 'Not Visited'}
              </Text>
            </View>
            {/* <TouchableOpacity style={styles.heartButton}>
              <Ionicons name={toggleHeart ? 'heart' : 'heart-outline'} size={20} color="#E53935" />
            </TouchableOpacity> */}
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

          <View style={styles.bottomInfoRight}>
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

const UserPosts = ({navigation}) => {
  const {user, currentUserWishList} = useAuth();
  const route = useRoute();
  const {userId} = route.params;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [posts, setPosts] = useState([]);

  const fetchUserPosts = async (page = 1) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    try {
      const response = await getAllPostByUserId(userId, 1, 10);
      console.log('Response from getAllPostByUserId:', response);

      if (response?.success) {
        setTotalPages(response?.data?.totalPages || 1);
        if (page === 1) {
          setPosts(response?.data?.posts || []);
        } else {
          setPosts(prevPosts => [
            ...prevPosts,
            ...(response?.data?.posts || []),
          ]);
        }

        setData(response?.data);
        setCurrentPage(page);
      } else {
        console.error('Failed to fetch top destinations:', response?.message);
      }
    } catch (error) {
      console.error('Error fetching top destinations:', error);
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMorePosts = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      fetchUserPosts(currentPage + 1);
    }
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#2E7D32" />
        <Text style={styles.loadingMoreText}>Loading more posts...</Text>
      </View>
    );
  };

  const handleRefresh = () => {
    setCurrentPage(1);
    fetchUserPosts(1);
  };

  useEffect(() => {
    fetchUserPosts(1);
  }, [userId]);

  //   if (loading) {
  //     return (
  //       <SafeAreaView style={styles.loadingContainer}>
  //         <ActivityIndicator size="large" color="#2E7D32" />
  //         <Text style={styles.loadingText}>Loading Posts..</Text>
  //       </SafeAreaView>
  //     );
  //   }
  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{user?.full_name}</Text>
          <TouchableOpacity>
            <Ionicons name="location-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        <Text style={styles.screenTitle}>{user?.full_name}'s Posts</Text>
        {loading && currentPage === 1 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
            <Text style={styles.loadingText}>Loading Posts...</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={posts}
              keyExtractor={item => item.id.toString()}
              renderItem={({item}) => <DestinationCard post={item} />}
              contentContainerStyle={styles.flatListContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Ionicons name="images-outline" size={60} color="#CCCCCC" />
                  <Text style={styles.emptyText}>No Posts Found</Text>
                </View>
              }
              onEndReached={loadMorePosts}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              refreshing={loading && currentPage === 1}
              onRefresh={handleRefresh}
            />
          </>
        )}
      </SafeAreaView>
    </GradientScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // height: 100,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
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
  flatListContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  footerLoader: {
    alignItems: 'center',
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  paginationInfo: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  paginationText: {
    fontSize: 12,
    color: '#666',
  },
});

export default UserPosts;
