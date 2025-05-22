import React ,{use, useState}from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
  Alert,
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';



const { width } = Dimensions.get('window');
import BeenThere from '../../utils/BeenThere'
import { login } from '../lib/api';
import { getToken, storeToken } from '../../utils/token';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);


  const handleEmailChange = (text) => {
    setEmail(text);
    if (emailError) setEmailError(''); 
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError) setPasswordError(''); 
  };

  const handleLogin = async () => {
    console.log('Login button pressed');
    let valid = true; 
    if (emailError || passwordError) {
        return;
    }
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!password) {
      setPasswordError('Password is required');
      valid = false;
    } else if (!passwordRegex.test(password)) {
      setPasswordError(
        'Password must be at least 8 characters, include uppercase, lowercase, and a number.'
      );
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) return;
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res?.success) {
        await storeToken(res?.token);
        const storedToken = await getToken();
        if (storedToken) {
          navigation.navigate('TabNavigation');
        }else{
          console.log('Token not stored');
          Alert.alert('Error', 'Failed to store token');
        }
      } else {
        setEmailError('Invalid email or password');
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.login}>
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        <View style={styles.logo}><BeenThere /></View>
        <View style={styles.loginContainer}>
          <Text style={styles.loginTitle}>Log In</Text>
          <Text style={styles.loginSubtitle}>Hello, Welcome Back To Our Account!</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={handleEmailChange}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? <Text style={{ color: 'red', marginTop: 4 }}>{emailError}</Text> : null}


          <Text style={styles.label}>Password</Text>
          <View>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="Enter your password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                maxLength={26}
              />
              <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                <Text style={{ marginHorizontal: 10 }}>
                  {showPassword ? '🙈' : '👁'}
                </Text>
              </TouchableOpacity>
            </View>
            {passwordError ? (
              <Text style={{ color: 'red', marginTop: 4 }}>{passwordError}</Text>
            ) : null}
          </View>


      <View style={styles.rememberRow}>
        {/* <CheckBox/> */}
        <Text style={styles.rememberText}> Remember Me</Text>
        <TouchableOpacity style={{ marginLeft: 'auto' }} onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.loginButton}>
        <Text style={styles.loginButtonText}>{loading ? 'Logging' : 'Log In'}</Text>
      </TouchableOpacity>

      <View style={styles.signupRow}>
        <Text style={styles.signupText}>Don’t have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signupLink}> Sign Up!</Text>
        </TouchableOpacity>
      </View>
    </View>
    </ScrollView>
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
    token: {
      color: 'red',
      marginTop: 4,
      fontSize: 14,
      fontWeight: '500',
      textAlign: 'center',
      backgroundColor: 'black',
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
      color: '#000',
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
      zIndex: 20,
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
  });
  
export default Login