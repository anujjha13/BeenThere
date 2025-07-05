import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import BeenThere from '../../utils/BeenThere';
import { login, saveFcmToken, deleteFcmToken } from '../lib/api';
import { getToken, storeToken, storeUserId, getUserId } from '../../utils/token';
import { useAuth } from '../context/authContext';
import { NavigationProp } from '@react-navigation/native';
import { getMessaging, getToken as getFcmToken } from '@react-native-firebase/messaging';
import { getApp } from '@react-native-firebase/app';
const {width, height} = Dimensions.get('window');

const Login = ({navigation}: {navigation: NavigationProp<any>}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const {refreshUser} = useAuth();

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
  };

  const handleLogin = async () => {
    let valid = true;
    // if (emailError || passwordError) {
    //   return;
    // }
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
        'Password must be at least 8 characters, include uppercase, lowercase, and a number.',
      );
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) return;
    setLoading(true);
    setLoginError(''); // Reset login error message
    try {
      const res = await login(email, password);
      console.log('res: ', res);

      if (res?.success) {
        await storeToken(res?.token);
        await storeUserId(res?.data?.id);
        console.log('res.data:', res.data);
        console.log('res.data.id:', res.data?.id);
        const userId = await getUserId();
        console.log('User ID stored:', userId);
        const storedToken = await getToken();
        if (storedToken) {
          await refreshUser();
          navigation.navigate('TabNavigation');
          navigation.reset({
            index: 0,
            routes: [{name: 'TabNavigation'}],
          });
          // Save FCM token after login
          const fcmToken = await getFcmTokenSomehow();
          if (fcmToken) {
            console.log('[Login] FCM token to save:', fcmToken);
            await saveFcmToken(fcmToken, Platform.OS);
          }
        } else {
          console.log('Token not stored');
          Alert.alert('Error', 'Failed to store token');
        }
      } else {
        setEmailError('Invalid email or password');
      }
    } catch (error) {
      console.log(error);
      setLoginError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientScreenWrapper>
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SafeAreaView style={styles.container}>
            <View style={styles.inner}>
              <View style={styles.logoContainer}>
                <BeenThere />
              </View>
              <View style={styles.formContainer}>
                <Text style={styles.loginTitle}>Welcome Back!</Text>
                <Text style={styles.loginSubtitle}>
                  Continue discovering real places from real people
                </Text>

                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={'#999'}
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                {emailError ? (
                  <Text style={styles.errorText}>{emailError}</Text>
                ) : null}

                <Text style={styles.label}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, {flex: 1, borderWidth: 0}]}
                    placeholder="Enter your password"
                    placeholderTextColor={'#999'}
                    value={password}
                    onChangeText={handlePasswordChange}
                    secureTextEntry={!showPassword}
                    maxLength={26}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(prev => !prev)}>
                    <Text style={{marginHorizontal: 10}}>
                      {showPassword ? '🙈' : '👁'}
                    </Text>
                  </TouchableOpacity>
                </View>
                {passwordError ? (
                  <Text style={styles.errorText}>{passwordError}</Text>
                ) : null}

            <View style={styles.rememberRow}>
              {/* <Text style={styles.rememberText}>Remember Me</Text> */}
              <TouchableOpacity
                style={{marginLeft: 'auto'}}
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            
            {loginError ? (
              <Text style={styles.loginErrorText}>{loginError}</Text>
            ) : null}

                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  style={styles.loginButton}>
                  <Text style={styles.loginButtonText}>
                    {loading ? 'Logging in...' : 'Log In'}
                  </Text>
                </TouchableOpacity>

                <View style={styles.signupRow}>
                  <Text style={styles.signupText}>Don't have an account?</Text>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('SignUp')}>
                    <Text style={styles.signupLink}> Sign Up!</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </SafeAreaView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </GradientScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  inner: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.04,
    paddingBottom: height * 0.03, // Minimal bottom margin
    paddingTop: 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.02,
    paddingTop: height * 0.02,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: width * 0.05,
    borderRadius: 16,
    width: '100%',
    maxWidth: 420,
    shadowColor: '#aaa',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
    alignSelf: 'center',
  },
  loginTitle: {
    fontSize: Math.min(26, width * 0.065),
    fontWeight: '700',
    marginBottom: 4,
  },
  loginSubtitle: {
    fontSize: Math.min(16, width * 0.04),
    color: '#666',
    marginBottom: height * 0.015,
  },
  label: {
    fontSize: Math.min(14, width * 0.035),
    fontWeight: '500',
    marginBottom: 6,
    marginTop: height * 0.01,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 999,
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.04,
    fontSize: Math.min(16, width * 0.04),
    color: '#000',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: Math.min(12, width * 0.03),
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
    marginVertical: height * 0.015,
    justifyContent: 'space-between',
  },
  rememberText: {
    fontSize: Math.min(14, width * 0.035),
    color: '#333',
  },
  forgotText: {
    fontSize: Math.min(14, width * 0.035),
    color: 'red',
  },
  loginErrorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: height * 0.01,
    fontSize: Math.min(14, width * 0.035),
  },
  loginButton: {
    backgroundColor: '#2E7D32',
    paddingVertical: height * 0.015,
    borderRadius: 999,
    alignItems: 'center',
    marginVertical: height * 0.01,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: Math.min(16, width * 0.04),
    fontWeight: '600',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: height * 0.01,
  },
  signupText: {
    fontSize: Math.min(14, width * 0.035),
    color: '#333',
  },
  signupLink: {
    fontSize: Math.min(14, width * 0.035),
    color: '#2E7D32',
    fontWeight: '600',
  },
});

const getFcmTokenSomehow = async () => {
  try {
    const app = getApp();
    const messaging = getMessaging(app);
    const token = await getFcmToken(messaging);
    console.log('[FCM] Token:', token);
    return token;
  } catch (error) {
    console.error('[FCM] Error getting token:', error);
    return null;
  }
};

export default Login;
