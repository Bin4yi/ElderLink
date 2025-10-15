import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { ValidationUtils } from '../../utils/validation';
import { COLORS } from '../../utils/colors';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errors, setErrors] = useState({});

  const { resetPassword } = useAuth();

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!ValidationUtils.validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      await resetPassword(email);
      setIsEmailSent(true);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateBack = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            {isEmailSent 
              ? "Check your email for reset instructions"
              : "Enter your email address and we'll send you instructions to reset your password"
            }
          </Text>
        </View>

        {isEmailSent ? (
          <View style={styles.messageContainer}>
            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>Email Sent Successfully!</Text>
              <Text style={styles.instructionStep}>
                1. Check your email inbox for a message from our support team
              </Text>
              <Text style={styles.instructionStep}>
                2. Click the reset link in the email
              </Text>
              <Text style={styles.instructionStep}>
                3. Follow the instructions to create a new password
              </Text>
              <Text style={styles.instructionStep}>
                4. Return to the app and sign in with your new password
              </Text>
            </View>

            <Button
              title="Back to Sign In"
              onPress={navigateBack}
              variant="primary"
              size="large"
              style={styles.backButton}
            />
          </View>
        ) : (
          <View style={styles.formContainer}>
            {errorMessage && (
              <Alert
                type="error"
                message={errorMessage}
                style={styles.alert}
                closable
                onClose={() => setErrorMessage('')}
              />
            )}

            {/* Email Input */}
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your registered email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              leftIcon="mail"
              error={errors.email}
              required
            />

            {/* Reset Button */}
            <Button
              title="Send Reset Instructions"
              onPress={handleResetPassword}
              variant="primary"
              size="large"
              loading={isLoading}
              disabled={isLoading}
              style={styles.resetButton}
            />

            {/* Back to Login */}
            <Button
              title="Back to Sign In"
              onPress={navigateBack}
              variant="outline"
              size="large"
              style={styles.backButton}
            />

            {/* Help Section */}
            <View style={styles.helpSection}>
              <Text style={styles.helpTitle}>Need Help?</Text>
              <Text style={styles.helpText}>
                If you don't receive the email within a few minutes, please check your spam folder. 
                If you still need assistance, contact your family member or care coordinator.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 40,
  },
  
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  
  title: {
    fontSize: 32,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 16,
  },
  
  subtitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    paddingHorizontal: 20,
  },
  
  messageContainer: {
    flex: 1,
  },
  
  formContainer: {
    flex: 1,
  },
  
  alert: {
    marginBottom: 24,
  },
  
  instructionsContainer: {
    backgroundColor: COLORS.gray50,
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  
  instructionsTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  
  instructionStep: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: 8,
  },
  
  resetButton: {
    marginTop: 24,
    marginBottom: 16,
  },
  
  backButton: {
    marginTop: 8,
  },
  
  helpSection: {
    backgroundColor: COLORS.gray50,
    padding: 20,
    borderRadius: 16,
    marginTop: 30,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  
  helpTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  
  helpText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
});

export default ForgotPasswordScreen;