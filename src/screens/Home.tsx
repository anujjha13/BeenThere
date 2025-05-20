import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  FlatList,
  ActivityIndicator,
} from 'react-native';
// import PostDetails from './PostDetails';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import {useNavigation} from '@react-navigation/native';
import {getAllPosts, getFollowingPosts} from '../lib/api';
import { Post } from '../../utils/type';
//import { MaterialIcons, Ionicons, FontAwesome} from 'react-native-vector-icons';

const Home = () => {
  const navigation = useNavigation();
  const [showMenu, setShowMenu] = useState(false);
  const [query, setQuery] = useState('');
  //const [result, setResult] = useState('');

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [feedType, setFeedType] = useState('discover'); // 'discover' or 'following'
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts(1, true);
  }, [feedType]);

  const fetchPosts = async (page = 1, isInitialLoad = false) => {
    if (loading && !isInitialLoad) return;

    if (isInitialLoad) {
      setInitialLoading(true);
    } else {
      setLoading(true);
    }

    try {
      // Get the right API function based on feed type
      const apiFunction =
        feedType === 'discover' ? getAllPosts : getFollowingPosts;
      const response = await apiFunction(page);

      if (response?.data?.posts) {
        if (page === 1) {
          // Reset posts on first page
          setPosts(response?.data?.posts);
        } else {
          // Append posts for pagination
          setPosts(prevPosts => [...prevPosts, ...response.posts]);
        }

        // Update pagination info
        setCurrentPage(response?.data.currentPage);
        setTotalPages(response?.data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  const handleEndReached = () => {
    // Load next page if available
    if (currentPage < totalPages && !loading) {
      fetchPosts(currentPage + 1);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPosts(1, true);
  };

  const handleSearch = () => {
    // Search functionality would go here
    console.log(`Searching for: ${query}`);
  };

  const handleFeedTypeChange = type => {
    setShowMenu(false);
    if (type !== feedType) {
      setFeedType(type);
      setCurrentPage(1);
    }
  };

  // const posts = [
  //   {
  //     id: '1',
  //     user: 'Billy Kloss',
  //     avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  //     location: 'Traveled To Lisbon',
  //     place: 'Paris, France',
  //     rating: 4,
  //     maxRating: 5,
  //     images: [
  //       'https://i.natgeofe.com/k/c41b4f59-181c-4747-ad20-ef69987c8d59/eiffel-tower-night.jpg?wp=1&w=1084.125&h=1627.5',
  //       'https://images.unsplash.com/photo-1520967824495-b529aeba26df',
  //       'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a',
  //     ],
  //     description: 'Enjoying The Beautiful View From The Eiffel Tower! ✨ #Paris #Travel',
  //     likes: 24,
  //     comments: 8,
  //   },
  //   {
  //     id: '2',
  //     user: 'Billy Kloss',
  //     avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  //     location: 'Dined At Bar Cargo',
  //     place: 'Chicago',
  //     rating: 4,
  //     maxRating: 5,
  //     images: [
  //       'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcStZG4hqhJSkFCv6jCoKdn66qqJ-vhqRbPWeg&s',
  //       'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a',
  //       'https://i.natgeofe.com/k/c41b4f59-181c-4747-ad20-ef69987c8d59/eiffel-tower-night.jpg?wp=1&w=1084.125&h=1627.5'
  //     ],
  //     description: 'Amazing Pizza And Cocktails! Must Try The Margherita 🍕',
  //     likes: 24,
  //     comments: 8,
  //   },
  // ];

  const renderStar = (index: number, rating: number) => {
    const filled = index <= rating;
    return (
      <FontAwesome
        key={index}
        name={filled ? 'star' : 'star-o'}
        size={16}
        color={filled ? '#FFD700' : '#aaa'}
        style={{marginRight: 2}}
      />
    );
  };

  const renderPost = ({item} : {item: Post}) => {
    console.log('item', item);
    return (
      <TouchableOpacity
        style={styles.postCard}
        onPress={() => navigation.navigate('PostDetails', {postId: item.id})}>
        <View style={styles.userInfo}>
          <View style={styles.userContainer}>
            <Image source={{uri: item?.User?.image || ''}} style={styles.avatar} />
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>{item?.user?.full_name}</Text>
              <Text style={styles.userLocation}>{item?.latitude} {item?.longitude}</Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(index => renderStar(index, item?.overall_rating))}
              </View>
              <Text style={styles.ratingText}>
                ({item?.overall_rating}/5)
              </Text>
            </View>
            <View style={styles.placeContainer}>
              <Ionicons name="location" size={14} color="#FF9500" />
              <Text style={styles.placeText}>{item?.city}, {item?.country}</Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}>
          {item?.photos && item?.photos.map((image, index) => (
            <Image key={index} source={{uri: image?.image_url}} style={styles.postImage} />
          ))}
        </ScrollView>

        <Text style={styles.description}>{item?.reason_for_visit}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity style={styles.likeButton}>
            <Ionicons name="heart-outline" size={24} color="#FF3B30" />
            <Text style={styles.actionText}>{item?.like_count}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.commentButton}>
            <Ionicons name="chatbubble-outline" size={22} color="#8E8E93" />
            <Text style={styles.actionText}>{item?.comment_count}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (!loading) return null;

    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color="#2E7D32" />
      </View>
    );
  };
  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="location-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BeenThere</Text>
          <TouchableOpacity>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {/* Discover section */}
        <View style={styles.discoverSection}>
          <TouchableOpacity
            style={styles.discoverButton}
            onPress={() => setShowMenu(!showMenu)}>
            <Text style={styles.discoverText}>
              {feedType === 'discover' ? 'Discover' : 'Following'}
            </Text>
            <MaterialIcons
              name={showMenu ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
              size={24}
              color="black"
            />
          </TouchableOpacity>

          {showMenu && (
            <View style={styles.menuDropdown}>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  feedType === 'discover' && styles.activeMenuItem,
                ]}
                onPress={() => handleFeedTypeChange('discover')}>
                <Text
                  style={[
                    styles.menuItemText,
                    feedType === 'discover' && styles.activeMenuItemText,
                  ]}>
                  Discover
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.menuItem,
                  feedType === 'following' && styles.activeMenuItem,
                ]}
                onPress={() => handleFeedTypeChange('following')}>
                <Text
                  style={[
                    styles.menuItemText,
                    feedType === 'following' && styles.activeMenuItemText,
                  ]}>
                  Following
                </Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.searchBar}>
            <Ionicons
              name="search"
              size={20}
              color="#8E8E93"
              style={{marginRight: 8}}
            />
            <TextInput
              style={styles.searchInput}
              placeholder="Search users or places"
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
              placeholderTextColor="#8E8E93"
            />
          </View>
        </View>
        {initialLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
          </View>
        ) : (
          <FlatList
            data={posts}
            renderItem={renderPost}
            keyExtractor={item => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.postsList}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            ListEmptyComponent={() => (
              <>
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  {feedType === 'following'
                    ? "You're not following anyone yet."
                    : 'No posts found.'}
                </Text>
              </View>
              </>
            )}
          />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 60,
    backgroundColor: 'white',
    borderColor: 'rgb(118, 118, 118)',
    borderWidth: 0.3,
    paddingBottom: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  discoverSection: {
    padding: 15,
    position: 'relative',
  },
  discoverButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discoverText: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 5,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 40,
    marginHorizontal: 16,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  menuDropdown: {
    position: 'absolute',
    top: 40,
    left: 15,
    width: 150,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    zIndex: 10,
  },
  menuItem: {
    padding: 12,
  },
  menuItemText: {
    fontSize: 16,
  },
  postsList: {
    paddingHorizontal: 15,
    paddingBottom: 80,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userTextContainer: {
    marginLeft: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  userLocation: {
    fontSize: 14,
    color: '#8E8E93',
  },
  ratingContainer: {
    alignItems: 'flex-end',
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  ratingText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  placeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  placeText: {
    fontSize: 12,
    color: '#8E8E93',
    marginLeft: 2,
  },
  imagesContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  postImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    marginRight: 10,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 15,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#8E8E93',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  activeMenuItem: {
    backgroundColor: '#f0f8f0',
  },
  activeMenuItemText: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
});

export default Home;
