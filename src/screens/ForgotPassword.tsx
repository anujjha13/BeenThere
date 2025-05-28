import React, {useState} from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import AntDesign from 'react-native-vector-icons/AntDesign';

const { width, height } = Dimensions.get('window');
import BeenThere from '../../utils/BeenThere';
import { resetPassword, sendOtp, verifyOtp } from '../lib/api';

const ForgotPassword = ({navigation}) => {
  const [formStep, setFormStep] = useState('email');

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');

  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');

  const handleEmailChange = text => {
    setEmail(text);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (text && !emailRegex.test(text)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = text => {
    setNewPassword(text);
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (text && !passwordRegex.test(text)) {
      setPasswordError(
        'Password must be at least 8 characters, include uppercase, lowercase, and a number.',
      );
    } else {
      setPasswordError('');
    }
  };

  const handleConfirmPasswordChange = text => {
    setConfirmPassword(text);
    if (text !== newPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleSendOtp = async () => {
    if (!email || emailError) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    try {
      const response = await sendOtp(email);
      if (response.success) {
        setFormStep('otp');
      } else {
        setEmailError(response.message || 'Failed to send OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setEmailError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setOtpError('Please enter the OTP');
      return;
    }
    setLoading(true);
    try {
      const response = await verifyOtp(email, otp);
      if (response.success) {
        setResetToken(response?.data.resetToken);
        setFormStep('newPassword');
      } else {
        setOtpError(response.message || 'Invalid OTP. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setOtpError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

   const handleResetPassword = async () => {
    if (!newPassword || passwordError || !confirmPassword || confirmPasswordError) {
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword(resetToken, newPassword, confirmPassword);
      if (response?.success) {
        // Password reset successful
        console.log('Password reset successful:', response.message);

        navigation.navigate('Login');
      } else {
        setPasswordError(response.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setPasswordError('An error occurred. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderForm = () => {
    switch (formStep) {
      case 'email':
        return (
          <>
            <Text style={styles.title}>Forgot Password</Text>
            <Text style={styles.description}>
              Enter The Email You Used To Login Your Account So We Can Send You A
              Link For Resetting Your Password.
            </Text>

            <Text style={styles.inputLabel}>Enter Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              value={email}
              onChangeText={handleEmailChange}
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Send OTP</Text>
              )}
            </TouchableOpacity>
          </>
        );
        
      case 'otp':
        return (
          <>
            <Text style={styles.title}>Enter OTP</Text>
            <Text style={styles.description}>
              We have sent a verification code to your email. Please enter it below.
            </Text>

            <Text style={styles.inputLabel}>Enter OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
            {otpError ? <Text style={styles.errorText}>{otpError}</Text> : null}

            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Verify OTP</Text>
              )}
            </TouchableOpacity>
          </>
        );
        
      case 'newPassword':
        return (
          <>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.description}>
              Create a new password for your account.
            </Text>

            <Text style={styles.inputLabel}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, { flex: 1, borderWidth: 0 }]}
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                <Text style={{ marginHorizontal: 10 }}>
                  {showPassword ? '🙈' : '👁'}
                </Text>
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
              secureTextEntry={!showPassword}
            />
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}

            <TouchableOpacity 
              style={styles.sendButton} 
              onPress={handleResetPassword}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.sendButtonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          </>
        );
    }
  };

  return (
    <GradientScreenWrapper>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.login}>
          <View />
          <View>
            <BeenThere />
          </View>
        {/* Form Box */}
        <View style={styles.formBox}>
          {renderForm()}

          <TouchableOpacity
            style={styles.backLink}
            onPress={() => {
              if (formStep === 'email') {
                navigation.navigate('Login');
              } else {
                // Go back to previous step
                setFormStep(formStep === 'otp' ? 'email' : 'otp');
              }
            }}>
            <AntDesign name="arrowleft" size={20} color="#2E7D32" />
            <Text style={styles.backText}>
              {formStep === 'email' ? ' Back to Log In' : ' Back'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  </GradientScreenWrapper>
  );
};

const styles = StyleSheet.create({
  login: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: height * 0.04,
    backgroundColor: '#E4F6ED',
  },
  formBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: width * 0.05,
    //elevation: 5,
    shadowColor: '#aaa',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 10,
    width: '100%',
    maxWidth: 420,
  },
  title: {
    fontSize: Math.min(22, width * 0.055),
    fontWeight: '700',
    marginBottom: height * 0.012,
  },
  description: {
    fontSize: Math.min(14, width * 0.037),
    color: '#666',
    marginBottom: height * 0.025,
    lineHeight: 20,
  },
  inputLabel: {
    fontSize: Math.min(14, width * 0.035),
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 999,
    paddingVertical: height * 0.012,
    paddingHorizontal: width * 0.04,
    fontSize: Math.min(16, width * 0.04),
    marginBottom: height * 0.01,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 999,
    marginBottom: height * 0.01,
  },
  sendButton: {
    backgroundColor: '#388E3C',
    paddingVertical: height * 0.018,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: height * 0.025,
    marginTop: height * 0.025,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: Math.min(18, width * 0.045),
    fontWeight: '600',
  },
  backLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: height * 0.01,
  },
  backText: {
    color: '#2E7D32',
    fontSize: Math.min(16, width * 0.04),
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    fontSize: Math.min(12, width * 0.03),
    marginTop: 4,
    marginLeft: 8,
  },
});

export default ForgotPassword;
