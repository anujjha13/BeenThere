
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  ScrollView,
  StatusBar,
  Switch,
  ActivityIndicator,
  Alert
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { User } from '../../utils/type';
import { editProfile, getProfile, syncContacts, instagram_sync } from '../lib/api';
import { launchImageLibrary } from 'react-native-image-picker';
import { PermissionsAndroid, Platform } from 'react-native';
import { useAuth } from '../context/authContext';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import Contacts, { Contact } from 'react-native-contacts';
import { Dimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import axios from 'axios';
const {width, height} = Dimensions.get('window');

interface FormData {
  full_name: string;
  phone: string;
  email: string;
  address: string;
  public_profile: boolean;
  location_sharing: boolean;
  message_request: boolean;
  instagram_sync: boolean;
  contact_sync: boolean;
  image: any;
  notifications: {
    new_followers: boolean;
    messages: boolean;
    likes_comments: boolean;
    email: boolean;
  };
}

const EditProfileScreen = ({navigation}: any) => {
  const {refreshUser} = useAuth();
  const [activeTab, setActiveTab] = useState('account');
  const [showWebView, setShowWebView] = useState(false);
  const [instagramImages, setInstagramImages] = useState([]);
  const [formData, setFormData] = useState<FormData>({
    full_name: '',
    phone: '',
    email: '',
    address: '',
    public_profile: false,
    location_sharing: false,
    message_request: false,
    instagram_sync: false,
    contact_sync: false,
    image: null,
    notifications: {
      new_followers: false,
      messages: false,
      likes_comments: false,
      email: false,
    },
  });

  const [profile, setProfile] = useState<User | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [syncContactLoading, setSyncContactLoading] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    fetchProfile();
    ReadContacts();
  }, []);

  const ReadContacts = async () => {
    try {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        {
          title: 'Contacts',
          message: 'This app would like to view your contacts.',
          buttonPositive: 'Please accept bare mortal',
        },
      );
      if (permission === PermissionsAndroid.RESULTS.GRANTED) {
        const contact = await Contacts.getAll();
        // Alert.alert(JSON.stringify(contact));
        setContacts(contact);
        console.log(JSON.stringify(contact));
      } else {
        setContacts([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleSyncContacts = async () => {
    setSyncContactLoading(true);
    setError('');
    setSuccess('');

    try {
      // Check for permission first
      let permissionStatus;

      if (Platform.OS === 'android') {
        // Check if we already have permission
        permissionStatus = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
        );

        // If no permission, request it
        if (!permissionStatus) {
          const requestResult = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
            {
              title: 'Contacts Permission',
              message:
                'BeenThere needs access to your contacts to find friends using the app.',
              buttonPositive: 'Allow',
              buttonNegative: 'Deny',
              buttonNeutral: 'Ask Later',
            },
          );

          permissionStatus =
            requestResult === PermissionsAndroid.RESULTS.GRANTED;
        }
      } else {
        // iOS permission handling
        permissionStatus = await Contacts.checkPermission();

        if (permissionStatus !== 'authorized') {
          permissionStatus = await Contacts.requestPermission();
          permissionStatus = permissionStatus === 'authorized';
        } else {
          permissionStatus = true;
        }
      }

      // If we have permission, fetch contacts and sync
      if (permissionStatus) {
        // Fetch fresh contacts
        const freshContacts = await Contacts.getAll();
        console.log(`Retrieved ${freshContacts.length} contacts to sync`);
        console.log('contacts : ', freshContacts);

        // Update state for future use
        setContacts(freshContacts);
        // Transform contacts to array of strings (e.g., names)
        const contactsToSend = freshContacts
          .flatMap(c => c.phoneNumbers.map(p => p.number))
          .filter(Boolean);

        console.log('Contacts to send:', contactsToSend);
        // Call API with fresh contacts
        //const res = await syncContacts(freshContacts);
        const res = await syncContacts({contacts: contactsToSend});
        console.log('Sync Contacts Response:', res);
        if (res.success) {
          setSuccess(`Successfully synced ${freshContacts.length} contacts`);
          updateFormField('contact_sync', true);
          console.log('Contacts synced successfully:', res.data);
        } else {
          setError(res.message || 'Failed to sync contacts');
          console.error('Failed to sync contacts:', res.message);
        }
      } else {
        // No permission granted
        setError('Contact access permission is required to sync contacts');
        console.log('Contact permission denied');
      }
    } catch (error) {
      console.error('Error syncing contacts:', error);
      setError('Failed to sync contacts. Please try again later.');
    } finally {
      setSyncContactLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await getProfile();
      if (response.success) {
        const userData = response?.data?.user;
        setProfile(userData);
        const notificationType = userData.notification_type || '0';

        setFormData({
          full_name: userData.full_name || '',
          phone: userData.phone || '',
          email: userData.email || '',
          address: userData.address || '',
          public_profile: userData.public_profile || false,
          location_sharing: userData.location_sharing || false,
          message_request: userData.message_request || false,
          instagram_sync: userData.instagram_sync || false,
          contact_sync: userData.contact_sync || false,
          image: userData.image ? {uri: userData.image} : null,
          notifications: {
            new_followers: notificationType.includes('1'),
            messages: notificationType.includes('2'),
            likes_comments: notificationType.includes('3'),
            email: notificationType.includes('4'),
          },
        });
      } else {
        setError(response.message || 'Failed to load profile data');
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const requestGalleryPermission = async () => {
    if (Platform.OS === 'android') {
      console.log('request android');
      const permission =
        Platform.Version >= 33
          ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
          : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
      const granted = await PermissionsAndroid.request(permission, {
        title: 'Gallery Permission',
        message: 'App needs access to your gallery',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      });
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const uploadImage = async () => {
    console.log('uplaod call');
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert('Permission denied');
      return;
    }
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 500,
        maxHeight: 500,
        quality: 0.8,
        selectionLimit: 1,
      },
      response => {
        if (response.didCancel) return;
        if (response.errorCode) {
          console.error('ImagePicker Error:', response.errorMessage);
          return;
        }
        if (response.assets && response.assets.length > 0) {
          setFormData(prev => ({
            ...prev,
            image: response.assets[0],
          }));
        }
      },
    );
  };
  // Update form data (for text inputs)
  const updateFormField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateNotification = (
    type: keyof FormData['notifications'],
    value: boolean,
  ) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      },
    }));
  };

  const getQueryParam = (url: string, param: string) => {
    const regex = new RegExp(`[\\?&]${param}=([^&#]*)`);
    const results = regex.exec(url);
    return results ? decodeURIComponent(results[1]) : null;
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Create notification_type string from notification preferences
      let notificationTypes = [];
      if (formData.notifications.new_followers) notificationTypes.push('1');
      if (formData.notifications.messages) notificationTypes.push('2');
      if (formData.notifications.likes_comments) notificationTypes.push('3');
      if (formData.notifications.email) notificationTypes.push('4');

      const notificationType = notificationTypes.join(',');

      // Create the payload for the API
      const updatedProfile = {
        full_name: formData.full_name,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        public_profile: formData.public_profile,
        location_sharing: formData.location_sharing,
        message_request: formData.message_request,
        instagram_sync: formData.instagram_sync,
        contact_sync: formData.contact_sync,
        notification_type: notificationType || '1',
        image: formData.image,
      };
      console.log('updatedProfile:', updatedProfile);
      const response = await editProfile(updatedProfile);

      if (response?.success) {
        setSuccess('Profile updated successfully');
        // Refresh profile data
        fetchProfile();
        refreshUser();
        navigation.navigate('Profile');
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err.response);
      setError('Something went wrong. Please try again later.');
    } finally {
      setSaving(false);
    }
  };

  const renderAccountTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.profileImageSection}>
        <View style={styles.profileImageContainer}>
          <Image
            // source={{
            //   uri:
            //     formData.image?.uri ||
            //     profile?.image ||
            //     'https://randomuser.me/api/portraits/men/32.jpg',
            // }}
            source={
              formData.image || profile?.image
                ? {uri: formData.image?.uri || profile?.image}
                : require('../../assets/images/profilepicture.png')
            }
            style={styles.profileImage}
          />
          <TouchableOpacity
            style={styles.editImageButton}
            onPress={uploadImage}>
            <Ionicons name="pencil" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>{formData.full_name}</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Edit User Details</Text>

        <Text style={styles.inputLabel}>Phone</Text>
        <TextInput
          style={styles.textInput}
          placeholder="1234567899"
          placeholderTextColor="#999"
          value={formData.phone}
          onChangeText={text => updateFormField('phone', text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.textInput}
          placeholder="abc@gmail.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={text => updateFormField('email', text)}
        />

        <Text style={styles.inputLabel}>Where Do You Live?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter Address"
          placeholderTextColor="#999"
          value={formData.address}
          onChangeText={text => updateFormField('address', text)}
        />
      </View>

      <View style={styles.connectSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Connect Instagram</Text>
          <Text style={styles.incompleteText}>
            {formData.instagram_sync ? 'Connected' : 'Incomplete'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.connectButton}
          onPress={() => {
            if (formData.instagram_sync && instagramImages.length > 0) {
              // Navigate to Instagram image selector
              navigation.navigate('InstagramImageSelector', {
                instagramImages: instagramImages,
                userProfile: profile,
              });
            } else {
              setShowWebView(true);
            }
          }}
        >
          <Ionicons name="logo-instagram" size={20} color="white" />
          <Text style={styles.connectButtonText}>
            {formData.instagram_sync && instagramImages.length > 0
              ? 'Use Instagram Photos'
              : formData.instagram_sync
              ? 'Reconnect Instagram'
              : 'Connect Instagram'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.syncSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sync Contacts</Text>
          <Text style={styles.incompleteText}>
            {formData.contact_sync ? 'Synced' : 'Incomplete'}
          </Text>
        </View>
        {/* <Text style={styles.syncLabel}>Allow Access To Contacts</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateFormField('contact_sync', true)}>
            <View style={styles.radioButton}>
              {formData.contact_sync && (
                <View style={styles.radioButtonSelected} />
              )}
            </View>
            <Text style={styles.radioText}>Allow</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption}
            onPress={() => updateFormField('contact_sync', false)}>
            <View style={styles.radioButton}>
              {!formData.contact_sync && (
                <View style={styles.radioButtonSelected} />
              )}
            </View>
            <Text style={styles.radioText}>Deny</Text>
          </TouchableOpacity>
        </View> */}
        <TouchableOpacity
          style={styles.connectButton}
          onPress={handleSyncContacts}
          disabled={syncContactLoading}
          // onPress={() =>
          //   updateFormField('instagram_sync', !formData.instagram_sync)
          // }
        >
          {syncContactLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Ionicons name="people-outline" size={20} color="white" />
              <Text style={styles.connectButtonText}>
                {formData.contact_sync
                  ? 'Disconnect Contacts'
                  : 'Sync Contacts'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* <View style={styles.uploadSection}>
        <Text style={styles.sectionTitle}>Upload Pictures</Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload Pictures</Text>
        </TouchableOpacity>
      </View> */}
    </View>
  );

  const renderPrivacyTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.privacySection}>
        <Text style={styles.sectionTitle}>Privacy Settings</Text>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Public Profile</Text>
            <Text style={styles.settingDescription}>
              Allow Others To View Your Profile
            </Text>
          </View>
          <Switch
            trackColor={{false: '#767577', true: '#2E7D32'}}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() =>
              updateFormField('public_profile', !formData.public_profile)
            }
            value={formData.public_profile}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Location Sharing</Text>
            <Text style={styles.settingDescription}>
              Share Your Current Location With Followers
            </Text>
          </View>
          <Switch
            trackColor={{false: '#767577', true: '#2E7D32'}}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() =>
              updateFormField('location_sharing', !formData.location_sharing)
            }
            value={formData.location_sharing}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Message Requests</Text>
            <Text style={styles.settingDescription}>
              Allow Message Requests From Non-Followers
            </Text>
          </View>
          <Switch
            trackColor={{false: '#767577', true: '#2E7D32'}}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() =>
              updateFormField('message_request', !formData.message_request)
            }
            value={formData.message_request}
          />
        </View>
      </View>
    </View>
  );

  const renderNotificationTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.notificationSection}>
        <Text style={styles.sectionTitle}>Notification Preferences</Text>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>New Followers</Text>
            <Text style={styles.settingDescription}>
              Get Notified When Someone Follows You
            </Text>
          </View>
          <Switch
            trackColor={{false: '#767577', true: '#2E7D32'}}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() =>
              updateNotification(
                'new_followers',
                !formData.notifications.new_followers,
              )
            }
            value={formData.notifications.new_followers}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Messages</Text>
            <Text style={styles.settingDescription}>
              Get Notified For New Messages
            </Text>
          </View>
          <Switch
            trackColor={{false: '#767577', true: '#2E7D32'}}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() =>
              updateNotification('messages', !formData.notifications.messages)
            }
            value={formData.notifications.messages}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Likes & Comments</Text>
            <Text style={styles.settingDescription}>
              Get Notified When Someone Likes Or Comments On Your Post
            </Text>
          </View>
          <Switch
            trackColor={{false: '#767577', true: '#2E7D32'}}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() =>
              updateNotification(
                'likes_comments',
                !formData.notifications.likes_comments,
              )
            }
            value={formData.notifications.likes_comments}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Email Notifications</Text>
            <Text style={styles.settingDescription}>
              Receive Email Notifications
            </Text>
          </View>
          <Switch
            trackColor={{false: '#767577', true: '#2E7D32'}}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() =>
              updateNotification('email', !formData.notifications.email)
            }
            value={formData.notifications.email}
          />
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text style={styles.loadingText}>Loading profile settings...</Text>
      </SafeAreaView>
    );
  }

  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {profile?.full_name || 'My Profile'}
          </Text>
          <TouchableOpacity>
            <Ionicons name="location-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'account' && styles.activeTab]}
            onPress={() => setActiveTab('account')}>
            <Ionicons
              name="person-outline"
              size={16}
              color={activeTab === 'account' ? '#4CAF50' : '#666'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'account' && styles.activeTabText,
              ]}>
              Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
            onPress={() => setActiveTab('privacy')}>
            <Ionicons
              name="lock-closed-outline"
              size={16}
              color={activeTab === 'privacy' ? '#4CAF50' : '#666'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'privacy' && styles.activeTabText,
              ]}>
              Privacy
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'notification' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('notification')}>
            <Ionicons
              name="notifications-outline"
              size={16}
              color={activeTab === 'notification' ? '#4CAF50' : '#666'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'notification' && styles.activeTabText,
              ]}>
              Notification
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView}>
          {activeTab === 'account' && renderAccountTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
          {activeTab === 'notification' && renderNotificationTab()}
        </ScrollView>

        {success ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{success}</Text>
          </View>
        ) : null}

        {/* Error message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

  {showWebView && (
  <View
    style={{
      position: 'absolute',
      top: 10,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
      backgroundColor: 'white',
    }}>
    <TouchableOpacity
      onPress={() => setShowWebView(false)}
      style={{
        position: 'absolute',
        top: 40,
        right: 20,
        backgroundColor: '#2E7D32',
        borderRadius: 20,
        padding: 8,
        zIndex: 1000,
      }}>
      <Ionicons name="close" size={24} color="white" />
    </TouchableOpacity>

    {/* Instagram WebView */}
    <WebView
      style={{ flex: 1 }}
      source={{
        uri: 'https://www.instagram.com/oauth/authorize?client_id=1084826773498768&redirect_uri=https://api.beenaround.app/instagram/auth&response_type=code&scope=instagram_business_basic,instagram_business_manage_messages,instagram_business_manage_comments,instagram_business_content_publish',
        //uri: 'https://www.instagram.com/accounts/logout',
      }}
      onNavigationStateChange={async navState => {
        const { url } = navState;
        console.log("Url:",url);
        if (url.startsWith('https://api.beenaround.app/instagram/auth')) {
          setShowWebView(false);
          const code = getQueryParam(url, 'code');
          console.log("code fetched",code );
          if (code) {
            const tokenData = await instagram_sync(code);
            if (tokenData.access_token) {
              // const images = await fetchInstagramMedia(tokenData.access_token);
              // setInstagramImages(images);
              // Update instagram_sync status to true
              updateFormField('instagram_sync', true);
              // Show success message
              setSuccess('Instagram connected successfully! You can now use your Instagram photos for ratings.');
            }
          }
        }
      }}
    />
  </View>
)}


      {instagramImages.length > 0 && (
  <ScrollView horizontal style={{ marginTop: 10 }}>
    {instagramImages.map((media, index) => (
      <Image
        key={index}
        source={{ uri: media.media_url }}
        style={{ width: 100, height: 100, borderRadius: 10, marginRight: 10 }}
      />
    ))}
  </ScrollView>
)}

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSaveProfile}
          disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </SafeAreaView>
    </GradientScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // marginTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.04,
    backgroundColor: 'white',
    borderBottomWidth: 0.3,
    borderBottomColor: 'rgb(118, 118, 118)',
    paddingBottom: height * 0.02,
    marginBottom: height * 0.01,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 12,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#E8F5E9',
  },
  tabText: {
    marginLeft: 4,
    color: '#666',
  },
  activeTabText: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  profileImageSection: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#4CAF50',
    position: 'relative',
  },
  profileImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4CAF50',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 12,
  },
  formSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  connectSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  incompleteText: {
    color: '#F44336',
    fontSize: 14,
  },
  completeText: {
    color: '#2E7D32',
    fontSize: 14,
  },
  connectButton: {
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  connectButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
  syncSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  syncLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  radioButtonSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  radioText: {
    fontSize: 14,
  },
  uploadSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  uploadButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  privacySection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    maxWidth: '80%',
  },
  notificationSection: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    fontSize: 10,
    marginTop: 4,
    color: '#666',
  },
  profileNavIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navProfileImage: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  successText: {
    color: '#2E7D32',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#2E7D32',
    padding: 16,
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default EditProfileScreen;
