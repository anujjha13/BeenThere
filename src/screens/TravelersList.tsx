import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import {useNavigation} from '@react-navigation/native';
import {useRoute} from '@react-navigation/native';

const travelers = Array(7)
  .fill(null)
  .map((_, index) => ({
    id: index.toString(),
    name: 'Billy Kloss',
    rating: '4/5',
    date: 'January 2024',
    profileImage: `https://randomuser.me/api/portraits/men/${
      (index % 3) + 1
    }.jpg`,
    travelImages: [
      'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    ],
  }));

export default function TravelersList() {
  const navigation = useNavigation();
  const route = useRoute();
  const {posts, location} = route.params;

  console.log('Posts:', posts);

  const renderTravelerItem = ({item}) => {
    const rating = Math.min(
      5,
      Math.max(0, parseFloat(item?.overall_rating || 0)),
    );

    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    return (
      <View style={styles.travelerCard}>
        <View style={styles.travelerInfo}>
          <Image
            source={
              item?.User?.image
                ? {uri: item?.User?.image}
                : require('../../assets/images/profilepicture.png')
            }
            style={styles.profileImage}
          />
          <View style={styles.travelerDetails}>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('UserProfile', {userId: item?.User?.id})
              }>
              <Text style={styles.travelerName}>{item?.User?.full_name}</Text>
            </TouchableOpacity>
            <View style={styles.ratingContainer}>
              {[...Array(fullStars)].map((_, index) => (
                <Ionicons
                  key={`full-${index}`}
                  name="star"
                  size={14}
                  color="#FFC107"
                />
              ))}
              {hasHalfStar && (
                <Ionicons
                  key="half"
                  name="star-half"
                  size={14}
                  color="#FFC107"
                />
              )}
              {[...Array(emptyStars)].map((_, index) => (
                <Ionicons
                  key={`empty-${index}`}
                  name="star-outline"
                  size={14}
                  color="#FFC107"
                />
              ))}
              <Text style={styles.ratingText}>{item?.overall_rating}/5</Text>
            </View>
            <Text style={styles.dateText}>{item?.date || 'January 2024'}</Text>
          </View>
        </View>
        <View style={styles.travelImagesContainer}>
          {/* only show 2 images */}
          {item?.Photos &&
            item?.Photos?.slice(0, 2).map((image, index) => (
              <Image
                key={image?.id}
                source={{uri: image?.image_url}}
                style={styles.travelImage}
              />
            ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <StatusBar barStyle="dark-content" />
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Explore</Text>
        <TouchableOpacity>
          <SimpleLineIcons name="location-pin" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <View style={styles.titleContainer}>
        <Text style={styles.title}>Travelers List Who Visited </Text>
        <Text style={styles.locationName}>{location}</Text>
      </View>

      <FlatList
        data={posts}
        renderItem={renderTravelerItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 600,
  },
  titleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#E3F2FD',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  locationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  listContent: {
    padding: 16,
  },
  travelerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  travelerInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  travelerDetails: {},
  travelerName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    color: '#757575',
    marginLeft: 4,
  },
  dateText: {
    fontSize: 12,
    color: '#757575',
  },
  travelImagesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  travelImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
});
