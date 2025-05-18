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

const { width } = Dimensions.get('window');
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
    setPasswordError(validatePassword(text));
    setConfirmError(validateConfirmPassword(confirmPassword));
  };

  const handleConfirmChange = (text) => {
    setConfirmPassword(text);
    setConfirmError(validateConfirmPassword(text));
  };

  const isFormValid = !passwordError && !confirmError && password && confirmPassword;

  const handleRegister = async() => {
    setLoading(true);
    try {
      const res = await register(name, phone, email, password, confirmPassword);
      if (res?.status === 200) {
        await storeToken(res?.token);
        console.log(res?.message);
        navigation.navigate('TabNavigation');
      } else {
        console.error('Registration failed:', res);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }finally{
      setLoading(false);
    }
  };

  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.signUp}>
        <View style={styles.logo}><BeenThere /></View>
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpTitle}>Create Account</Text>
          <Text style={styles.signUpSubtitle}>Hello, Welcome Back To Our Account!</Text>

          <Text style={styles.label}>Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              placeholder="Enter your password"
              secureTextEntry={!showPassword}
              maxLength={26}
              value={password}
              onChangeText={handlePasswordChange}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Text style={{ marginHorizontal: 10 }}>{showPassword ? '🙈' : '👁'}</Text>
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}

          <Text style={styles.label}>Confirm Password</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.input, { flex: 1, borderWidth: 0 }]}
              placeholder="Enter password to verify"
              maxLength={26}
              value={confirmPassword}
              onChangeText={handleConfirmChange}
            />
          </View>
          {confirmError ? <Text style={styles.error}>{confirmError}</Text> : null}

          <TouchableOpacity
            style={[
              styles.signUpButton,
              { backgroundColor: isFormValid ? '#2E7D32' : '#A5D6A7' }
            ]}
            disabled={!isFormValid || loading}
            onPress={handleRegister}
          >
            <Text style={styles.signUpButtonText}>{loading ? 'Signing..' : 'Sign Up'}</Text>
          </TouchableOpacity>

        </View>
      </SafeAreaView>
    </GradientScreenWrapper>
  );
};

const styles = StyleSheet.create({
  signUp: {
    flex: 1,
    justifyContent: 'space-around',
    padding: 24,
  },
  logo: {
    marginTop: 110,
  },
  signUpContainer: {
    backgroundColor: '#fff',
    padding: 26,
    borderRadius: 16,
    width: width * 0.9,
    shadowColor: '#aaa',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginTop: 85,
  },
  signUpTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginBottom: 4,
  },
  signUpSubtitle: {
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
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  signUpButton: {
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    marginVertical: 10,
    marginTop: 32,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 999,
  },
});

export default SignUp1;
