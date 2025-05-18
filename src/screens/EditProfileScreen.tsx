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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { User } from '../../utils/type';
import { editProfile, getProfile } from '../lib/api';

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
  notifications: {
    new_followers: boolean;
    messages: boolean;
    likes_comments: boolean;
    email: boolean;
  };
}


const EditProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('account');
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

    useEffect(() => {
      fetchProfile();
    }, []);

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
          notifications: {
            new_followers: notificationType.includes('1'),
            messages: notificationType.includes('2'),
            likes_comments: notificationType.includes('3'),
            email: notificationType.includes('4')
          }
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

     // Update form data (for text inputs)
  const updateFormField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

   const updateNotification = (type: keyof FormData['notifications'], value: boolean) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: value,
      }
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Create notification_type string from notification preferences
      let notificationType = '';
      if (formData.notifications.new_followers) notificationType += '1';
      if (formData.notifications.messages) notificationType += '2';
      if (formData.notifications.likes_comments) notificationType += '3';
      if (formData.notifications.email) notificationType += '4';

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
        notification_type: notificationType || '0',
      };

      const response = await editProfile(updatedProfile);

      if (response.success) {
        setSuccess('Profile updated successfully');
        // Refresh profile data
        fetchProfile();
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
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
            source={{ uri:  profile?.image || 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton} onPress={() => navigation.navigate('Profile')}>
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
          placeholder="+1 000-000-0000"
          placeholderTextColor="#999"
          value={formData.phone}
          onChangeText={(text) => updateFormField('phone', text)}
          keyboardType="phone-pad"
        />

        <Text style={styles.inputLabel}>Email Address</Text>
         <TextInput
          style={styles.textInput}
          placeholder="abc@gmail.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
          value={formData.email}
          onChangeText={(text) => updateFormField('email', text)}
        />

        <Text style={styles.inputLabel}>Where Do You Live?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter Address"
          placeholderTextColor="#999"
          value={formData.address}
          onChangeText={(text) => updateFormField('address', text)}
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
          onPress={() => updateFormField('instagram_sync', !formData.instagram_sync)}
        >
          <Ionicons name="logo-instagram" size={20} color="white" />
          <Text style={styles.connectButtonText}>
            {formData.instagram_sync ? 'Disconnect Instagram' : 'Connect Instagram'}
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
        <Text style={styles.syncLabel}>Allow Access To Contacts</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioOption} 
            onPress={() => updateFormField('contact_sync', true)}
          >
            <View style={styles.radioButton}>
              {formData.contact_sync && <View style={styles.radioButtonSelected} />}
            </View>
            <Text style={styles.radioText}>Allow</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.radioOption} 
            onPress={() => updateFormField('contact_sync', false)}
          >
            <View style={styles.radioButton}>
              {!formData.contact_sync && <View style={styles.radioButtonSelected} />}
            </View>
            <Text style={styles.radioText}>Deny</Text>
          </TouchableOpacity>
        </View>
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
            <Text style={styles.settingDescription}>Allow Others To View Your Profile</Text>
          </View>
          <Switch
            trackColor={{ false: '#767577', true: '#2E7D32' }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => updateFormField('public_profile', !formData.public_profile)}
            value={formData.public_profile}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Location Sharing</Text>
            <Text style={styles.settingDescription}>Share Your Current Location With Followers</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#2E7D32" }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => updateFormField('location_sharing', !formData.location_sharing)}
            value={formData.location_sharing}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Message Requests</Text>
            <Text style={styles.settingDescription}>Allow Message Requests From Non-Followers</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#2E7D32" }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => updateFormField('message_request', !formData.message_request)}
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
            <Text style={styles.settingDescription}>Get Notified When Someone Follows You</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#2E7D32" }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => updateNotification('new_followers', !formData.notifications.new_followers)}
            value={formData.notifications.new_followers}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Messages</Text>
            <Text style={styles.settingDescription}>Get Notified For New Messages</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: "#2E7D32" }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => updateNotification('messages', !formData.notifications.messages)}
            value={formData.notifications.messages}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Likes & Comments</Text>
            <Text style={styles.settingDescription}>Get Notified When Someone Likes Or Comments On Your Post</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577", true: '#2E7D32' }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => updateNotification('likes_comments', !formData.notifications.likes_comments)}
            value={formData.notifications.likes_comments}
          />
        </View>

        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingTitle}>Email Notifications</Text>
            <Text style={styles.settingDescription}>Receive Email Notifications</Text>
          </View>
          <Switch
            trackColor={{ false: "#767577",true: '#2E7D32' }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => updateNotification('email', !formData.notifications.email)}
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile?.full_name || 'My Profile'}</Text>
        <TouchableOpacity>
          <Ionicons name="location-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'account' && styles.activeTab]}
          onPress={() => setActiveTab('account')}
        >
          <Ionicons 
            name="person-outline" 
            size={16} 
            color={activeTab === 'account' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'account' && styles.activeTabText]}>
            Account
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
          onPress={() => setActiveTab('privacy')}
        >
          <Ionicons 
            name="lock-closed-outline" 
            size={16} 
            color={activeTab === 'privacy' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>
            Privacy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'notification' && styles.activeTab]}
          onPress={() => setActiveTab('notification')}
        >
          <Ionicons 
            name="notifications-outline" 
            size={16} 
            color={activeTab === 'notification' ? '#4CAF50' : '#666'} 
          />
          <Text style={[styles.tabText, activeTab === 'notification' && styles.activeTabText]}>
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

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSaveProfile}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Text style={styles.saveButtonText}>Save Changes</Text>
          )}
        </TouchableOpacity>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF5FB',
    marginTop: 50,
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