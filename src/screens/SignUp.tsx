import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ScrollView,
} from 'react-native';

const { width } = Dimensions.get('window');
import BeenThere from '../../utils/BeenThere';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';

const SignUp = ({ navigation }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    validateFields();
  }, [name, phone, email]);

  const validateFields = () => {
    let valid = true;

    // Name validation
    if (!name.trim()) {
      setNameError('Name is required');
      valid = false;
    } else if (!/^[A-Za-z\s]+$/.test(name)) {
      setNameError('Name must contain only letters');
      valid = false;
    } else {
      setNameError('');
    }

    // Phone validation
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      valid = false;
    } else if (!/^\d{10}$/.test(phone)) {
      setPhoneError('Enter a valid 10-digit phone number');
      valid = false;
    } else {
      setPhoneError('');
    }

    // Email validation
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

    setIsValid(valid);
  };

  const handleProceed = () => {
    if (isValid) {
      navigation.navigate('SignUp1', {
        name,
        phone,
        email,
      });
    }
  };

  return (
    <GradientScreenWrapper>
      <SafeAreaView style={styles.signUp}>
        <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
        <View style={styles.logo}><BeenThere /></View>
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpTitle}>Create Account</Text>
          <Text style={styles.signUpSubtitle}>Hello, Welcome Back To Our Account!</Text>

          <Text style={styles.label}>Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
          {nameError ? <Text style={styles.error}>{nameError}</Text> : null}

          <Text style={styles.label}>Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your Mobile Number"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            maxLength={14}
          />
          {phoneError ? <Text style={styles.error}>{phoneError}</Text> : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {emailError ? <Text style={styles.error}>{emailError}</Text> : null}

          <TouchableOpacity
            style={[
              styles.signUpButton,
              { backgroundColor: isValid ? '#2E7D32' : '#A5D6A7' }
            ]}
            onPress={handleProceed}
            disabled={!isValid}
          >
            <Text style={styles.signUpButtonText}>Proceed for Signup</Text>
          </TouchableOpacity>
        </View>
        </ScrollView>
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
    marginTop: 5,
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
});

export default SignUp;
