import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');
import BeenThere from '../../utils/BeenThere';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import { register } from '../lib/api';
import { storeToken } from '../../utils/token';

const SignUp1 = ({route, navigation}) => {
  const { name, phone, email } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [loading, setLoading] = useState(false);

  const validatePassword = (pwd) => {
    const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!pwd) return 'Password is required';
    if (!pattern.test(pwd)) {
      return 'Min 8 chars, upper, lower, number & special char';
    }
    return '';
  };

  const validateConfirmPassword = (confirm) => {
    if (!confirm) return 'Confirm your password';
    if (confirm !== password) return 'Passwords do not match';
    return '';
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (passwordError) setPasswordError('');
    if (confirmError) setConfirmError('');
  };

  const handleConfirmChange = (text) => {
    setConfirmPassword(text);
    if (confirmError) setConfirmError('');
  };


  const handleRegister = async() => {
    const pwdError = validatePassword(password);
    const confError = validateConfirmPassword(confirmPassword, password);

    setPasswordError(pwdError);
    setConfirmError(confError);

    if (pwdError || confError) return;
    setLoading(true);
    try {
      const res = await register(name, phone, email, password, confirmPassword);
      if (res?.status === 200) {
        await storeToken(res?.token);
        console.log(res?.message);
        navigation.navigate('TabNavigation');
        navigation.reset({
            index: 0,
            routes: [{ name: 'TabNavigation' }],
          });
      } else {
        console.error('Registration failed:', res);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }finally{
      setLoading(false);
    }
  };

  const isFormValid = password && confirmPassword && !passwordError && !confirmError;
  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.container}>
            <View style={styles.logoContainer}>
              <BeenThere />
            </View>
            
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Create Account</Text>
              <Text style={styles.formSubtitle}>Hello, Welcome Back To Our Account!</Text>

              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, {borderWidth: 0}]}
                  placeholder="Enter your password"
                  placeholderTextColor={'#999'}
                  secureTextEntry={!showPassword}
                  maxLength={26}
                  value={password}
                  onChangeText={handlePasswordChange}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Text style={{ marginHorizontal: width * 0.025 }}>
                    {showPassword ? '🙈' : '👁'}
                  </Text>
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, {borderWidth: 0}]}
                  placeholder="Enter password to verify"
                  placeholderTextColor={'#999'}
                  secureTextEntry={!showConfirmPassword}
                  maxLength={26}
                  value={confirmPassword}
                  onChangeText={handleConfirmChange}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Text style={{ marginHorizontal: width * 0.025 }}>
                    {showConfirmPassword ? '🙈' : '👁'}
                  </Text>
                </TouchableOpacity>
              </View>
              {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}

              <TouchableOpacity
                style={[
                  styles.signUpButton,
                  { backgroundColor: isFormValid ? '#2E7D32' : '#A5D6A7' }
                ]}
                disabled={!isFormValid || loading}
                onPress={handleRegister}
              >
                <Text style={styles.signUpButtonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
    </GradientScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.02,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.03,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: width * 0.05, 
    borderRadius: 16,
    width: '100%',
    shadowColor: '#aaa',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  formTitle: {
    fontSize: Math.min(24, width * 0.06),
    fontWeight: '700',
    marginBottom: height * 0.005,
  },
  formSubtitle: {
    fontSize: Math.min(16, width * 0.04),
    color: '#666',
    marginBottom: height * 0.02,
  },
  label: {
    fontSize: Math.min(14, width * 0.035),
    fontWeight: '500',
    marginBottom: height * 0.005,
    marginTop: height * 0.01,
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 999,
    flex: 1,
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.04,
    fontSize: Math.min(16, width * 0.04),
    color: '#000',
  },
  errorText: {
    color: 'red',
    fontSize: Math.min(12, width * 0.03),
    marginTop: height * 0.004,
    marginLeft: width * 0.02,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 999,
  },
  signUpButton: {
    paddingVertical: height * 0.015,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: height * 0.025,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: Math.min(16, width * 0.04),
    fontWeight: '600',
  },
});

export default SignUp1;
