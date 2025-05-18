import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList ,ScrollView ,StatusBar,} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SimpleLineIcons from 'react-native-vector-icons/SimpleLineIcons';
import { useNavigation } from '@react-navigation/native';

const travelers = Array(7).fill(null).map((_, index) => ({
  id: index.toString(),
  name: 'Billy Kloss',
  rating: '4/5',
  date: 'January 2024',
  profileImage: `https://randomuser.me/api/portraits/men/${(index % 3) + 1}.jpg`,
  travelImages: [
    'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60'
  ]
}));

export default function TravelersList() {
  const navigation = useNavigation();

  const renderTravelerItem = ({ item }) => (
    <View style={styles.travelerCard}>
      <View style={styles.travelerInfo}>
        <Image source={{ uri: item.profileImage }} style={styles.profileImage} />
        <View style={styles.travelerDetails}>
          <Text style={styles.travelerName}>{item.name}</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4].map((_, index) => (
              <Ionicons key={index} name="star" size={14} color="#FFC107" />
            ))}
            <Ionicons name="star-outline" size={14} color="#FFC107" />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </View>
      <View style={styles.travelImagesContainer}>
        {item.travelImages.map((image, index) => (
          <Image key={index} source={{ uri: image }} style={styles.travelImage} />
        ))}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <StatusBar barStyle="dark-content" />
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Willam.Kloss</Text>
          <TouchableOpacity>
            <SimpleLineIcons name="location-pin" size={24} color="black" />
          </TouchableOpacity>
        </View>


      <View style={styles.titleContainer}>
        <Text style={styles.title}>Travelers List Who Visited </Text>
        <Text style={styles.locationName}>Greece</Text>
      </View>

      <FlatList
        data={travelers}
        renderItem={renderTravelerItem}
        keyExtractor={item => item.id}
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
    shadowOffset: { width: 0, height: 1 },
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
  travelerDetails: {
  },
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