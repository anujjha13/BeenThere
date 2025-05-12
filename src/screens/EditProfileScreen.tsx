import React, { useState } from 'react';
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
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';


const EditProfileScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('account');
  const [publicProfile, setPublicProfile] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [messageRequests, setMessageRequests] = useState(true);
  const [newFollowers, setNewFollowers] = useState(true);
  const [messages, setMessages] = useState(false);
  const [likesComments, setLikesComments] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [allowContacts, setAllowContacts] = useState(true);

  const renderAccountTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.profileImageSection}>
        <View style={styles.profileImageContainer}>
          <Image
            source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.editImageButton} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="pencil" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={styles.profileName}>Willam Kloss </Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.sectionTitle}>Edit User Details</Text>
        
        <Text style={styles.inputLabel}>Phone</Text>
        <TextInput
          style={styles.textInput}
          placeholder="+1 000-000-0000"
          placeholderTextColor="#999"
        />
        
        <Text style={styles.inputLabel}>Email Address</Text>
        <TextInput
          style={styles.textInput}
          placeholder="abc@gmail.com"
          placeholderTextColor="#999"
          keyboardType="email-address"
        />
        
        <Text style={styles.inputLabel}>Where Do You Live?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter Address"
          placeholderTextColor="#999"
        />
      </View>

      <View style={styles.connectSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Connect Instagram</Text>
          <Text style={styles.incompleteText}>Incomplete</Text>
        </View>
        <TouchableOpacity style={styles.connectButton}>
          <Ionicons name="logo-instagram" size={20} color="white" />
          <Text style={styles.connectButtonText}>Connect Instagram</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.syncSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sync Contacts</Text>
          <Text style={styles.incompleteText}>Incomplete</Text>
        </View>
        <Text style={styles.syncLabel}>Allow Access To Contacts</Text>
        <View style={styles.radioGroup}>
          <TouchableOpacity 
            style={styles.radioOption} 
            onPress={() => setAllowContacts(true)}
          >
            <View style={styles.radioButton}>
              {allowContacts && <View style={styles.radioButtonSelected} />}
            </View>
            <Text style={styles.radioText}>Allow</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.radioOption} 
            onPress={() => setAllowContacts(false)}
          >
            <View style={styles.radioButton}>
              {!allowContacts && <View style={styles.radioButtonSelected} />}
            </View>
            <Text style={styles.radioText}>Deny</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.uploadSection}>
        <Text style={styles.sectionTitle}>Upload Pictures</Text>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>Upload Pictures</Text>
        </TouchableOpacity>
      </View>
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
            trackColor={{ false: "#767577", true: "#2E7D32" }}
            thumbColor="#f4f3f4"
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setPublicProfile(!publicProfile)}
            value={publicProfile}
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
            onValueChange={() => setLocationSharing(!locationSharing)}
            value={locationSharing}
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
            onValueChange={() => setMessageRequests(!messageRequests)}
            value={messageRequests}
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
            onValueChange={() => setNewFollowers(!newFollowers)}
            value={newFollowers}
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
            onValueChange={() => setMessages(!messages)}
            value={messages}
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
            onValueChange={() => setLikesComments(!likesComments)}
            value={likesComments}
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
            onValueChange={() => setEmailNotifications(!emailNotifications)}
            value={emailNotifications}
          />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Willam.Kloss</Text>
        <TouchableOpacity>
          <Ionicons name="location-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>
      
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'account' && styles.activeTab
          ]}
          onPress={() => setActiveTab('account')}
        >
          <Ionicons 
            name="person-outline" 
            size={16} 
            color={activeTab === 'account' ? '#4CAF50' : '#666'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'account' && styles.activeTabText
            ]}
          >
            Account
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'privacy' && styles.activeTab
          ]}
          onPress={() => setActiveTab('privacy')}
        >
          <Ionicons 
            name="lock-closed-outline" 
            size={16} 
            color={activeTab === 'privacy' ? '#4CAF50' : '#666'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'privacy' && styles.activeTabText
            ]}
          >
            Privacy
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.tab, 
            activeTab === 'notification' && styles.activeTab
          ]}
          onPress={() => setActiveTab('notification')}
        >
          <Ionicons 
            name="notifications-outline" 
            size={16} 
            color={activeTab === 'notification' ? '#4CAF50' : '#666'} 
          />
          <Text 
            style={[
              styles.tabText, 
              activeTab === 'notification' && styles.activeTabText
            ]}
          >
            Notification
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {activeTab === 'account' && renderAccountTab()}
        {activeTab === 'privacy' && renderPrivacyTab()}
        {activeTab === 'notification' && renderNotificationTab()}
      </ScrollView>
      
    
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
});

export default EditProfileScreen;