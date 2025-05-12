import React ,{useState}from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import AntDesign from 'react-native-vector-icons/AntDesign';


const { width } = Dimensions.get('window');
import BeenThere from '../../utils/BeenThere'

const ForgotPassword = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');


  const handleEmailChange = (text) => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text && !emailRegex.test(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (text && !passwordRegex.test(text)) {
      setPasswordError(
        'Password must be at least 8 characters, include uppercase, lowercase, and a number.'
      );
    } else {
      setPasswordError('');
    }
  };
  
  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.login}>
        <View style={styles.logo}><BeenThere /></View>
        {/* Form Box */}
<View style={styles.formBox}>
<Text style={styles.title}>Forgot Password</Text>
<Text style={styles.description}>
  Enter The Email You Used To Login Your Account So We Can Send You A Link For Resetting Your Password.
</Text>

<Text style={styles.inputLabel}>Enter Email</Text>
<TextInput
  style={styles.input}
  placeholder="example@gmail.com"
  placeholderTextColor="#888"
/>

<TouchableOpacity style={styles.sendButton}>
  <Text style={styles.sendButtonText}>Send</Text>
</TouchableOpacity>

<TouchableOpacity style={styles.backLink} onPress={() => navigation.navigate('Login')}>
  {/* Back Arrow Icon */}
  <AntDesign name="arrowleft" size={20} color="black" />
  <Text style={styles.backText}>      Back to log In</Text>
</TouchableOpacity>
</View>
    </SafeAreaView>
    </GradientScreenWrapper>
  )
}

const styles = StyleSheet.create({
    login: {
        flex: 1,
        justifyContent: 'space-around',
        padding: 24,
    },
    logo: {
      marginTop: 110,
    },
    loginContainer: {
      backgroundColor: '#fff',
      padding: 26,
      borderRadius: 16,
      width: width * 0.9,
      shadowColor: '#aaa',
      shadowOpacity: 0.3,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      marginTop: 15,
    },
    loginTitle: {
      fontSize: 26,
      fontWeight: '700',
      marginBottom: 4,
    },
    loginSubtitle: {
      fontSize: 16,
      color: '#666',
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '500',
      marginBottom: 6,
      marginTop: 12,
    },
    input: {
      backgroundColor: '#F8F8F8',
      borderWidth: 1,
      borderColor: '#DDD',
      borderRadius: 999,
      paddingVertical: 10,
      paddingHorizontal: 16,
      fontSize: 16,
    },
    passwordContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F8F8F8',
      borderWidth: 1,
      borderColor: '#DDD',
      borderRadius: 999,
    },
    rememberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 16,
    },
    rememberText: {
      fontSize: 14,
      color: '#333',
      marginLeft: 4,
    },
    forgotText: {
      fontSize: 14,
      color: 'red',
    },
    loginButton: {
      backgroundColor: '#2E7D32',
      paddingVertical: 14,
      borderRadius: 999,
      alignItems: 'center',
      marginVertical: 10,
    },
    loginButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: '600',
    },
    signupRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 10,
    },
    signupText: {
      fontSize: 14,
      color: '#333',
    },
    signupLink: {
      fontSize: 14,
      color: '#2E7D32',
      fontWeight: '600',
    },
    container: {
        flex: 1,
        backgroundColor: '#E4F6ED', // light green gradient tone
        justifyContent: 'flex-start',
      },
      header: {
        alignItems: 'center',
        marginTop: 60,
      },
      tagline: {
        color: '#2E7D32',
        fontSize: 16,
        fontStyle: 'italic',
        fontWeight: '500',
      },
      formBox: {
        backgroundColor: '#fff',
        margin: 20,
        borderRadius: 20,
        padding: 20,
        elevation: 5, // shadow for Android
        shadowColor: '#000', // shadow for iOS
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 10,
      },
      description: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
        lineHeight: 20,
      },
      inputLabel: {
        fontSize: 14,
        marginBottom: 5,
        color: '#333',
      },
      sendButton: {
        backgroundColor: '#388E3C',
        paddingVertical: 14,
        borderRadius: 30,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
      },
      sendButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
      },
      backLink: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
      },
      backArrow: {
        fontSize: 18,
        marginRight: 5,
        color: '#2E7D32',
      },
      backText: {
        color: '#2E7D32',
        fontSize: 16,
        fontWeight: '600',
      },
  });
  
export default ForgotPassword;
