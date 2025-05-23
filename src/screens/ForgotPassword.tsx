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
} from 'react-native';
import GradientScreenWrapper from '../../utils/GradientScreenWrapper';
import AntDesign from 'react-native-vector-icons/AntDesign';

const {width} = Dimensions.get('window');
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
    </GradientScreenWrapper>
  );
};

const styles = StyleSheet.create({
  login: {
     display: 'flex',
      flexDirection: 'column',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 36,
  },
  // logo: {
  //   marginTop: 110,
  // },
  loginContainer: {
    backgroundColor: '#fff',
    padding: 26,
    borderRadius: 16,
    width: width * 0.92,
    shadowColor: '#aaa',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
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
    shadowOffset: {width: 0, height: 4},
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
});

export default ForgotPassword;
