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

const SignUp = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateFields = () => {
    let valid = true;
    if (!name.trim()) {
      setNameError('Name is required');
      valid = false;
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      setNameError('Name must contain only letters');
      valid = false;
    } else {
      setNameError('');
    }
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      valid = false;
    } else if (!/^\d{10}$/.test(phone)) {
      setPhoneError('Enter a valid 10-digit phone number');
      valid = false;
    } else {
      setPhoneError('');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      valid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }
    return valid;
  };

  const handleProceed = () => {
    const valid = validateFields();
    if (valid) {
      navigation.navigate('SignUp1', {
        name,
        phone,
        email,
      });
    }
  };

  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.container}>
            <View style={styles.logo}>
              <BeenThere />
            </View>
            
            <View style={styles.signUpContainer}>
              <Text style={styles.signUpTitle}>Create Account</Text>
              <Text style={styles.signUpSubtitle}>Hello, Welcome Back To Our Account!</Text>

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your name"
                placeholderTextColor={'#999'}
                value={name}
                onChangeText={setName}
                returnKeyType="next"
              />
              {nameError ? <Text style={styles.error}>{nameError}</Text> : null}

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your Mobile Number"
                placeholderTextColor={'#999'}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                maxLength={14}
                returnKeyType="next"
              />
              {phoneError ? <Text style={styles.error}>{phoneError}</Text> : null}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={'#999'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                returnKeyType="done"
              />
              {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleProceed}
              >
                <Text style={styles.signUpButtonText}>Proceed for Signup</Text>
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
  logo: {
    alignItems: 'center',
    marginBottom: height * 0.02,
  },
  signUpContainer: {
    backgroundColor: '#fff',
    padding: width * 0.05,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#aaa',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  signUpTitle: {
    fontSize: Math.min(26, width * 0.065),
    fontWeight: '700',
    marginBottom: height * 0.005,
  },
  signUpSubtitle: {
    fontSize: Math.min(16, width * 0.04),
    color: '#666',
    marginBottom: height * 0.015,
  },
  label: {
    fontSize: Math.min(14, width * 0.035),
    fontWeight: '500',
    marginBottom: height * 0.005,
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
  },
  error: {
    color: 'red',
    fontSize: Math.min(12, width * 0.03),
    marginTop: height * 0.004,
    marginLeft: width * 0.02,
  },
  signUpButton: {
    backgroundColor: '#2E7D32',
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

export default SignUp;