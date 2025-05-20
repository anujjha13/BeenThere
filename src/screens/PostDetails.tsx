import React, { useState ,useRef, useEffect } from 'react';
import { 
  View, Text, SafeAreaView, StyleSheet, TouchableOpacity, 
  Image, FlatList, ScrollView, TextInput, Dimensions, ActivityIndicator
} from 'react-native';

import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import AntDesign from 'react-native-vector-icons/AntDesign';
import Feather from 'react-native-vector-icons/Feather';
import { getPostDetails } from '../lib/api';
import { Comment, Post } from '../../utils/type';
import { useRoute } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const PostDetails = ({ navigation}) => {
  const route = useRoute();
  const { postId } = route.params;
  console.log("PostId",postId);
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [comments, setComments] = useState<Comment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMoreComments, setLoadingMoreComments] = useState(false);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [imageWidth, setImageWidth] = useState(width);
  const scrollToIndex = (index: number) => {
      scrollRef.current?.scrollTo({
      x: index * imageWidth,
      animated: true,
    });
    setActiveImageIndex(index);
  };

  const fetchPostDetails = async (page = 1, isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMoreComments(true);
      }
      const response = await getPostDetails(postId, page = currentPage, 10);
      console.log("Response",response);
      
      if (response.success) {
        // Set post data on first load
        if (isInitialLoad || page === 1) {
          setPost(response?.data?.post);
        }
        
        // Handle comments pagination
        if (response?.data?.comments) {
          if (page === 1) {
            // Reset comments on first page
            setComments(response?.data?.comments);
          } else {
            // Append comments for additional pages
            setComments(prevComments => [...prevComments, ...response?.data?.comments]);
          }
          
          // Update pagination info
          setCurrentPage(page);
          setTotalPages(response?.data?.totalPages || 1);
        }
      } else {
        setError('Failed to load post details');
      }
    } catch (err) {
      console.error('Error fetching post details:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMoreComments(false);
    }
  };

useEffect(() => {
    fetchPostDetails(1, true);
  }, [postId]);

  const handleLoadMoreComments = () => {
    if (currentPage < totalPages && !loadingMoreComments) {
      fetchPostDetails(currentPage + 1);
    }
  };


  // const post = {
  //   id: '1',
  //   user: 'Billy Kloss',
  //   avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  //   location: 'Traveled To Lisbon',
  //   place: 'Paris, France',
  //   rating: 4,
  //   maxRating: 5,
  //   images: [
  //     'https://i.natgeofe.com/k/c41b4f59-181c-4747-ad20-ef69987c8d59/eiffel-tower-night.jpg?wp=1&w=1084.125&h=1627.5',
  //     'https://images.unsplash.com/photo-1520967824495-b529aeba26df',
  //     'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a',
  //   ],
  //   description: 'Enjoying The Beautiful View From The Eiffel Tower! The City Lights At Night Are Absolutely Magical. I Recommend Visiting Both During The Day And At Night For Different Experiences. #Paris #Travel #EiffelTower',
  //   likes: 24,
  //   comments: 8,
  //   details: {
  //     visited: 'June 2023',
  //     reason: 'Tourism',
  //     safetyRating: 4,
  //     costRating: 3,
  //   }
  // };

// {comments data}

  // const comments = [
  //   {
  //     id: '1',
  //     user: 'Jane Doe',
  //     avatar: 'https://randomuser.me/api/portraits/women/22.jpg',
  //     comment: 'Looks Amazing! I\'m Going There Next Month. Any Restaurant Recommendations?',
  //     time: '1 Hour Ago',
  //   },
  //   {
  //     id: '2',
  //     user: 'Mike Smith',
  //     avatar: 'https://randomuser.me/api/portraits/men/22.jpg',
  //     comment: 'The Night View Is Spectacular! Did You Go To The Top Level?',
  //     time: '45 Minutes Ago',
  //   },
  //   {
  //     id: '3',
  //     user: 'Sarah Johnson',
  //     avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
  //     comment: 'I Was There Last Summer. Such A Beautiful City!',
  //     time: '30 Minutes Ago',
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
        style={{ marginRight: 2 }}
      />
    );
  };
  
  const renderComment = ({ item }: {item: Comment}) => {
    return (
      <View style={styles.commentItem}>
        <Image source={{ uri: item?.User?.image }} style={styles.commentAvatar} />
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUser}>{item.User?.full_name}</Text>
            <Text style={styles.commentTime}>{item.created_at_formatted}</Text>
          </View>
          <Text style={styles.commentText}>{item.comment}</Text>
        </View>
      </View>
    );
  };

  const renderCommentsFooter = () => {
    if (currentPage >= totalPages) return null;
    
    return (
      <TouchableOpacity 
        style={styles.loadMoreButton}
        onPress={handleLoadMoreComments}
        disabled={loadingMoreComments}
      >
        {loadingMoreComments ? (
          <ActivityIndicator size="small" color="#2E7D32" />
        ) : (
          <Text style={styles.loadMoreText}>Load More Comments</Text>
        )}
      </TouchableOpacity>
    );
  };
  const scrollRef = useRef();

  if (loading) {
    return (
      <GradientScreenWrapper>
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Loading post details...</Text>
        </SafeAreaView>
      </GradientScreenWrapper>
    );
  }

  if (error || !post) {
    return (
      <GradientScreenWrapper>
        <SafeAreaView style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
          <Text style={styles.errorText}>{error || 'Post not found'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchPostDetails(1, true)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </GradientScreenWrapper>
    );
  }

  return (
    <GradientScreenWrapper>
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post Details</Text>
        <View style={styles.headerRightButtons}>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="heart-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Ionicons name="share-social-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Post Card */}
        <View style={styles.postCard}>
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={() => navigation.navigate('Profile', { userId: post?.User?.id })}>
              <View style={styles.userContainer}>
                <Image source={{ uri: post?.User?.image || '' }} style={styles.avatar} />
                <View style={styles.userTextContainer}>
                  <Text style={styles.userName}>{post.User?.full_name}</Text>
                  <Text style={styles.userLocation}>{post.latitude} {post.longitude}</Text>
                </View>
              </View>
            </TouchableOpacity>
            
            <View style={styles.ratingContainer}>
               <View style={styles.ratingStars}>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map(index => renderStar(index, post.overall_rating))}
                  </View>
                  <Text style={styles.ratingText}>({post.overall_rating}/5)</Text>
                </View>
              <View style={styles.placeContainer}>
                <Ionicons name="location" size={14} color="#FF9500" />
                <Text style={styles.placeText}>{post.city}, {post.country}</Text>
              </View>
            </View>
          </View>
         
        {/* Image carousel */}
          <View style={styles.imageCarousel}>
            <ScrollView
              ref={scrollRef}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onLayout={(e) => {
                setImageWidth(e.nativeEvent.layout.width);
              }}
              onScroll={(event) => {
                const offsetX = event.nativeEvent.contentOffset.x;
                setActiveImageIndex(Math.floor(offsetX / imageWidth));
              }}
              scrollEventThrottle={16}
            >
              {post.Photos && post.Photos.map((image, index) => (
                <Image
                  key={index}
                  source={{ uri: image.image_url }}
                  style={styles.carouselImage}
                />
              ))}
            </ScrollView>
            
          
            <View style={styles.pagination}>
              <Text style={styles.paginationText}>
                {activeImageIndex + 1}/{post?.Photos ? post.Photos.length : 0}
              </Text>
            </View>
            

            {activeImageIndex > 0 && (
              <TouchableOpacity
                style={[styles.arrowButton, { left: 10 }]}
                onPress={() => scrollToIndex(activeImageIndex - 1)}
              >
                <AntDesign name="left" size={24} color="#fff" />
              </TouchableOpacity>
            )}

            {activeImageIndex < post?.Photos.length - 1 && (
              <TouchableOpacity
                style={styles.nextButton}
                onPress={() => {
                  const nextIndex = Math.min(activeImageIndex + 1, post?.Photos.length - 1);
                  scrollToIndex(nextIndex);
                }}
              >
                <AntDesign name="right" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.description}>{post?.reason_for_visit}</Text>

          {/* Details section */}
          <View style={styles.detailsSection}>
            <Text style={styles.detailsTitle}>Details</Text>
            
            <View style={styles.detailsGrid}>
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="calendar-outline" size={20} color="#8E8E93" />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Visited</Text>
                  <Text style={styles.detailValue}>{post?.visit_date_formatted}</Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="help-circle-outline" size={20} color="#8E8E93" />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Reason For Visit</Text>
                  <Text style={styles.detailValue}>{post?.reason_for_visit}</Text>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="shield-checkmark-outline" size={20} color="#8E8E93" />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Safety Rating</Text>
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map(index => renderStar(index, post.safety_rating))}
                    <Text style={styles.smallRatingText}>
                      ({post.safety_rating}/5)
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.detailItem}>
                <View style={styles.detailIconContainer}>
                  <Ionicons name="cash-outline" size={20} color="#8E8E93" />
                </View>
                <View>
                  <Text style={styles.detailLabel}>Cost Rating</Text>
                  <View style={styles.ratingStars}>
                    {[1, 2, 3, 4, 5].map(index => renderStar(index, post.cost_rating))}
                    <Text style={styles.smallRatingText}>
                      ({post.cost_rating}/5)
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
          
          <View style={styles.postActions}>
            <TouchableOpacity style={styles.likeButton}>
              <Ionicons name="heart-outline" size={24} color="#FF3B30" />
              <Text style={styles.actionText}>{post.like_count}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.commentButton}>
              <Ionicons name="chatbubble-outline" size={22} color="#8E8E93" />
              <Text style={styles.actionText}>{post.comment_count}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Comments section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comments ({post.comment_count})</Text>
          
          <FlatList
            data={comments}
            renderItem={renderComment}
            keyExtractor={item => item.id.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
               <Text style={styles.noCommentsText}>No comments yet. Be the first to comment!</Text>
            }
            ListFooterComponent={renderCommentsFooter}
          />
          
          {/* Comment input */}
          <View style={styles.commentInputContainer}>
            <Image 
              source={{ uri: 'https://randomuser.me/api/portraits/men/42.jpg' }} 
              style={styles.commentInputAvatar} 
            />
            <View style={styles.commentInputWrapper}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a message..."
                value={message}
                onChangeText={setMessage}
              />
            </View>
            <TouchableOpacity style={styles.sendButton} disabled={!message.trim()}>
                <Feather
                  name="send"
                  size={20}
                  color="rgb(255, 255, 255)"
                />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    marginLeft: 15,
  },
  scrollContent: {
    flex: 1,
  },
   loadMoreButton: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 20,
    alignItems: 'center',
    marginVertical: 10,
  },
  loadMoreText: {
    color: '#2E7D32',
    fontWeight: '600',
  },
  postCard: {
    backgroundColor: '#fff',
    padding: 15,
    margin: 10,
    borderRadius: 15,
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
  imageCarousel: {
    position: 'relative',
    height: 250,
    marginBottom: 15,
  },
  carouselImage: {
    width: width - 30,
    height: 250,
    borderRadius: 10,
  },
  pagination: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  paginationText: {
    color: '#fff',
    fontSize: 12,
  },
  nextButton: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: [{ translateY: -15 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  detailsSection: {
    marginTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 15,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    width: '48%',
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 10,
    padding: 10,
  },
  detailIconContainer: {
    marginRight: 10,
  },
  detailLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  smallRatingText: {
    fontSize: 10,
    color: '#8E8E93',
    marginLeft: 2,
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 15,
    marginTop: 5,
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
  commentsSection: {
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 80,
    padding: 15,
    borderRadius: 15,
    margin: 'auto',
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentContent: {
    marginLeft: 10,
    flex: 1,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    backgroundColor:'rgb(224, 255, 225)',
    padding: 10,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
  },
  commentTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  commentInputAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  commentInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 10,
  },
  commentInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
  },
  sendButton: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor:'#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 10,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  backButtonText: {
    color: '#2E7D32',
    fontSize: 16,
  },
  noCommentsText: {
    padding: 20,
    textAlign: 'center',
    color: '#8E8E93',
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -15 }],
    backgroundColor: 'rgba(0,0,0,0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default PostDetails;
