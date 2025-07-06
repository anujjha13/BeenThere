import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

type RootStackParamList = {
  InstagramRating: undefined;
  CustomRating: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

type RatingMethod = 'instagram' | 'custom';

const Rate = () => {
  const [modalVisible, setModalVisible] = useState(true);
  const navigation = useNavigation<NavigationProp>();

  const handleRatingMethodSelect = (method: RatingMethod) => {
    setModalVisible(false);
    if (method === 'instagram') {
      navigation.navigate('InstagramRating');
    } else {
      navigation.navigate('CustomRating');
    }
  };
  useFocusEffect(
    useCallback(() => {
      setModalVisible(true);
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Rate & Review</Text>
        <Text style={styles.subtitle}>Select a rating method to continue</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}>
          <Text style={styles.buttonText}>Choose Rating Method</Text>
        </TouchableOpacity>
      </View>

      {modalVisible && (
        <View style={styles.modalContainer}>
          <View style={styles.modalArrow} />
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Select A Rating Method</Text>

                <TouchableOpacity
                  style={styles.methodButton}
                  onPress={() => handleRatingMethodSelect('custom')}>
                  <View style={styles.methodIconContainer}>
                    <Icon name="edit" size={20} color="#2E7D32" />
                  </View>
                  <Text style={styles.methodButtonText}>Custom Rating</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.methodButton}
                  onPress={() => handleRatingMethodSelect('instagram')}>
                  <View style={styles.methodIconContainer}>
                    <Icon name="instagram" size={20} color="#2E7D32" />
                  </View>
                  <Text style={styles.methodButtonText}>
                    Rate Instagram Photos
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalArrow: {
    position: 'absolute',
    bottom: 10,
    left: '50%',
    marginLeft: -10,
    height: 20,
    backgroundColor: 'white',
    width: 20,
    transform: [{rotate: '45deg'}],
    borderRadius: 2,
    zIndex: 1,
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    zIndex: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 20,
  },
  methodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#F3FEF9',
  },
  methodIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f7ef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  methodButtonText: {
    fontSize: 16,
  },
});

export default Rate;
