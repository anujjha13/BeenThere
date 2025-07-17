import React, {useEffect, useState, useRef} from 'react';
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
  Alert,
  StatusBar,
  Animated,
  Platform,
  Modal,
} from 'react-native';
// import PostDetails from './PostDetails';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import {useNavigation} from '@react-navigation/native';
import {getAllPosts, getFollowingPosts, likePost, flagPost} from '../lib/api';
import {Post} from '../../utils/type';
import {useAuth} from '../context/authContext';
import {Dimensions} from 'react-native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

// Define navigation types
// Adjust this RootStackParamList to match your app's navigation structure
// Add all screens you navigate to from Home

type RootStackParamList = {
  Home: undefined;
  PostDetails: {postId: string; like: number};
  Message: undefined;
};

const {width, height} = Dimensions.get('window');
const FLAG_REASONS = [
  "Spam",
  "Inappropriate Content",
  "Harassment or Bullying",
  "False Information",
  "Hate Speech",
  "Other"
];
const Home = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [showMenu, setShowMenu] = useState(false);
  const [query, setQuery] = useState('');
  // const {refreshUser} = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [feedType, setFeedType] = useState<'discover' | 'following'>(
    'discover',
  );
  const [refreshing, setRefreshing] = useState(false);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const toggleAnim = useRef(new Animated.Value(0)).current;
  //const [filterModalVisible, setFilterModalVisible] = useState(false);
  // const [filterByRating, setFilterByRating] = useState(false);
  // const [selectedRating, setSelectedRating] = useState(0);
  const [flagModalVisible, setFlagModalVisible] = useState(false);
  const [selectedFlagReason, setSelectedFlagReason] = useState<string | null>(null);
  const [customFlagReason, setCustomFlagReason] = useState('');
  const [flagPostId, setFlagPostId] = useState<string | null>(null);
  useEffect(() => {
    fetchPosts(1, true);
  }, [feedType]);

  useEffect(() => {
    setFilteredPosts(posts);
  }, [posts]);

  useEffect(() => {
    Animated.timing(toggleAnim, {
      toValue: feedType === 'discover' ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
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
          setPosts(response?.data?.posts || []);
          console.log('Posts fetched:', response?.data?.posts);
        } else {
          // Append posts for pagination
          setPosts(prevPosts => [...prevPosts, ...(response.data.posts || [])]);
        }

        // Update pagination info
        setCurrentPage(response?.data.currentPage || 1);
        setTotalPages(response?.data.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setInitialLoading(false);
      setRefreshing(false);
    }
  };

  const handleSearch = (text: string) => {
    if (!text) {
      setFilteredPosts(posts);
      return;
    }
    const lowerText = text.toLowerCase();
    const filtered = posts.filter(post =>
      // post.city?.toLowerCase().includes(lowerText) ||
      // post.country?.toLowerCase().includes(lowerText) ||
      post.User?.full_name?.toLowerCase().includes(lowerText),
    );
    setFilteredPosts(filtered);
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

  const handleFeedTypeChange = (type: string) => {
    setShowMenu(false);
    if (type !== feedType) {
      setFeedType(type as 'discover' | 'following');
      setCurrentPage(1);
    }
  };

  const handleToggleLike = async (postId: string) => {
    try {
      const res = await likePost(postId);
      console.log('post wishlist response:', res);
      if (res.success) {
        // Alert.alert('Success', `${res?.message || 'Post liked.'}`);
        fetchPosts();
      } else {
        console.error('Error liking post:', res.message);
        Alert.alert('Error', res.message || 'Failed to like post.');
      }
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert('Error', 'Failed to like post.');
    }
  };

  const handleFlag = async () => {
    let reasonToSend = selectedFlagReason;
    if (selectedFlagReason === 'Other') {
      if (!customFlagReason.trim()) {
        Alert.alert('Please enter a reason');
        return;
      }
      reasonToSend = customFlagReason.trim();
    }
    if (!reasonToSend || !flagPostId) {
      Alert.alert('Please select a reason');
      return;
    }
    try {
      await flagPost(flagPostId, reasonToSend);
      setFlagModalVisible(false);
      setSelectedFlagReason(null);
      setCustomFlagReason('');
      setFlagPostId(null);
      Alert.alert('Thank you', 'Your report has been submitted.');
    } catch (e) {
      Alert.alert('Error', 'Could not submit your report,either you flagged this post already ');
    }
  };

  const capitalizeFirst = (str?: string | null) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

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

  const renderPost = ({item}: {item: Post}) => {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={styles.postCard}
        onPress={() =>
          navigation.navigate('PostDetails', {
            postId: item.id,
            like: item?.like_count,
          })
        }>
        <View style={styles.userInfo}>
          <View style={styles.userContainer}>
            <Image
              source={
                item?.User?.image
                  ? {uri: item?.User?.image}
                  : require('../../assets/images/profilepicture.png')
              }
              style={styles.avatar}
            />
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>{item?.User?.full_name}</Text>
              <Text style={styles.userLocation}>
                {capitalizeFirst(item?.city)}
              </Text>
            </View>
          </View>

          <View style={styles.ratingContainer}>
            <View style={styles.ratingStars}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map(index =>
                  renderStar(index, item?.overall_rating),
                )}
              </View>
              <Text style={styles.ratingText}>({item?.overall_rating}/5)</Text>
            </View>
            <View style={styles.placeContainer}>
              <Ionicons name="location" size={14} color="#FF9500" />
              <Text style={styles.placeText}>
                {capitalizeFirst(item?.city)}, {capitalizeFirst(item?.country)}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}>
          {item?.Photos &&
            item?.Photos.map((image, index) => (
              <Image
                key={index}
                source={{uri: image?.image_url}}
                style={styles.postImage}
              />
            ))}
        </ScrollView>

        <Text style={styles.description}>{item?.reason_for_visit}</Text>

        <View style={styles.postActions}>
          <TouchableOpacity
            onPress={() => handleToggleLike(item?.id)}
            style={styles.likeButton}>
            <Ionicons name={'heart-outline'} size={24} color="#FF3B30" />
            <Text style={styles.actionText}>{item?.like_count}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.commentButton}>
            <Ionicons name="chatbubble-outline" size={22} color="#8E8E93" />
            <Text style={styles.actionText}>{item?.comment_count}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.flagButton}
            onPress={e => {
              e.stopPropagation && e.stopPropagation();
              setFlagPostId(item.id);
              setFlagModalVisible(true);
            }}>
            <Ionicons name="flag-outline" size={22} color="red" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFooter = () => {
    if (loading) {
      return (
        <View style={styles.loaderFooter}>
          <ActivityIndicator size="small" color="#2E7D32" />
        </View>
      );
    }

    if (posts.length > 0 && currentPage >= totalPages) {
      return (
        <View style={styles.endOfResultsFooter}>
          <Text style={styles.endOfResultsText}>You've viewed all posts</Text>
        </View>
      );
    }

    return null;
  };
  return (
    <SafeAreaView style={styles.container}>
      <GradientScreenWrapper>
        <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Image
              source={require('../../assets/images/logo.png')}
              style={{width: 30, height: 30}}
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>BeenAround</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Message')}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={24}
              color="black"
            />
          </TouchableOpacity>
        </View>

        {/* Discover section */}
        <View style={styles.discoverSection}>
          <View style={styles.segmentedControlContainerSmall}>
            <Animated.View
              style={[
                styles.segmentedControlSlider,
                {
                  left: toggleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [2, 52],
                  }),
                },
              ]}
            />
            <TouchableOpacity
              style={styles.segmentedControlOptionSmall}
              onPress={() => setFeedType('discover')}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.segmentedControlTextSmall,
                  feedType === 'discover' &&
                    styles.segmentedControlTextActiveSmall,
                ]}>
                Discover
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.segmentedControlOptionSmall}
              onPress={() => setFeedType('following')}
              activeOpacity={0.8}>
              <Text
                style={[
                  styles.segmentedControlTextSmall,
                  feedType === 'following' &&
                    styles.segmentedControlTextActiveSmall,
                ]}>
                Following
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.searchBarWrapper}>
            <View style={styles.searchBarContainer}>
              <Ionicons name="search" size={20} color="#088445" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search travelers..."
                placeholderTextColor="#999"
                value={query}
                onChangeText={text => {
                  setQuery(text);
                  handleSearch(text);
                }}
              />
            </View>
          </View>
        </View>
        {initialLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#2E7D32" />
          </View>
        ) : (
          <FlatList
            data={filteredPosts}
            renderItem={renderPost}
            keyExtractor={item => item.id}
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
      </GradientScreenWrapper>
      {/* Flag Modal */}
      <Modal
        visible={flagModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setFlagModalVisible(false)}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#00000099' }}>
          <View style={{ backgroundColor: 'white', borderRadius: 8, padding: 20, width: 300 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 10, fontSize: 16 }}>Why are you flagging this post?</Text>
            {FLAG_REASONS.map(reason => (
              <TouchableOpacity
                key={reason}
                onPress={() => setSelectedFlagReason(reason)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
                <View style={{
                  height: 20,
                  width: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: '#2E7D32',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}>
                  {selectedFlagReason === reason && (
                    <View style={{
                      height: 10,
                      width: 10,
                      borderRadius: 5,
                      backgroundColor: '#2E7D32',
                    }} />
                  )}
                </View>
                <Text>{reason}</Text>
              </TouchableOpacity>
            ))}
            {selectedFlagReason === 'Other' && (
              <View style={{ marginTop: 10 }}>
                <TextInput
                  placeholder="Enter your reason"
                  value={customFlagReason}
                  onChangeText={setCustomFlagReason}
                  style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 6,
                    padding: 8,
                    marginTop: 4,
                    fontSize: 15,
                  }}
                  multiline
                />
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
              <TouchableOpacity onPress={() => { setFlagModalVisible(false); setCustomFlagReason(''); setSelectedFlagReason(null); setFlagPostId(null); }} style={{ marginRight: 20 }}>
                <Text style={{ color: 'grey', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleFlag}>
                <Text style={{ color: '#2E7D32', fontWeight: 'bold' }}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  // header: {
  //   flexDirection: 'row',
  //   justifyContent: 'space-between',
  //   alignItems: 'center',
  //   paddingHorizontal: width * 0.04,
  //   paddingTop: height * 0.06,
  //   paddingBottom: height * 0.02,
  //   backgroundColor: 'white',
  //   borderColor: 'rgb(118, 118, 118)',
  //   borderWidth: 0.3,
  //   marginBottom: height * 0.001,
  // },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingTop: Platform.OS === 'ios' ? height * 0.02 : height * 0.04,
    paddingBottom: height * 0.02,
    backgroundColor: 'white',
    borderBottomWidth: 0.3,
    borderBottomColor: 'rgb(118, 118, 118)',
    marginBottom: height * 0.001,
  },
  headerTitle: {
    fontSize: Math.min(22, width * 0.055),
    fontWeight: 'bold',
  },
  discoverSection: {
    padding: width * 0.04,
    position: 'relative',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  segmentedControlContainerSmall: {
    width: 100,
    backgroundColor: '#f5f6fa',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    position: 'relative',
    marginBottom: 0,
    minWidth: 100,
    maxWidth: 100,
    flexShrink: 0,
    overflow: 'hidden',
  },
  segmentedControlOptionSmall: {
    flex: 1,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  segmentedControlSlider: {
    position: 'absolute',
    top: 2,
    width: 46,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  segmentedControlTextSmall: {
    color: '#888',
    fontSize: 9,
    fontWeight: '400',
  },
  segmentedControlTextActiveSmall: {
    color: '#222',
    fontWeight: '600',
    fontSize: 9,
  },
  searchBarWrapper: {
    width: '100%',
    marginTop: 10,
    marginLeft: 0,
    minWidth: 0,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#fff',
    borderColor: '#ccc',
    // paddingVertical: 6,
    paddingHorizontal: 12,
    width: '100%',
    gap: 10,
    marginVertical: 0,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    backgroundColor: '#fff',
    height: 40,
    paddingHorizontal: 8,
    borderRadius: 6,
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
  endOfResultsFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  endOfResultsText: {
    fontSize: 14,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagButton: {
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
