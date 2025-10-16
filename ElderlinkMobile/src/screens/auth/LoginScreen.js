import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../context/AuthContext';
import { ValidationUtils } from '../../utils/validation';
import { COLORS } from '../../utils/colors';
import { ROUTES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [errors, setErrors] = useState({});

  const { login, user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigation.replace(ROUTES.MAIN);
    }
  }, [isAuthenticated, user, navigation]);

  const validateForm = () => {
    const validationErrors = {};

    if (!ValidationUtils.validateEmail(email.trim())) {
      validationErrors.email = 'Please enter a valid email address';
    }

    if (!ValidationUtils.validatePassword(password)) {
      validationErrors.password = 'Password must be at least 6 characters long';
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      await login(email.trim(), password);
      // Navigation will be handled by useEffect when isAuthenticated changes
    } catch (error) {
      setErrorMessage(error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToForgotPassword = () => {
    navigation.navigate(ROUTES.AUTH.FORGOT_PASSWORD);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading) {
    return <Loading message="Signing you in..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>ElderLink</Text>
            <Text style={styles.tagline}>Your health, our priority</Text>
          </View>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome Back</Text>
          <Text style={styles.subtitleText}>
            Sign in to access your health dashboard and stay connected with your care team.
          </Text>

          {errorMessage && (
            <Alert
              type="error"
              message={errorMessage}
              style={styles.errorAlert}
              closable
              onClose={() => setErrorMessage('')}
            />
          )}

          {/* Email Input */}
          <Input
            label="Email Address"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email address"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon="mail"
            error={errors.email}
            required
          />

          {/* Password Input */}
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!showPassword}
            autoComplete="password"
            leftIcon="lock-closed"
            error={errors.password}
            required
          />

          {/* Login Button */}
          <Button
            title="Sign In"
            onPress={handleLogin}
            variant="primary"
            size="large"
            loading={isLoading}
            disabled={isLoading}
            style={styles.loginButton}
          />

          {/* Forgot Password Link */}
          <Button
            title="Forgot your password?"
            onPress={navigateToForgotPassword}
            variant="ghost"
            size="medium"
            style={styles.forgotButton}
          />
        </View>

        {/* Help Section */}
        <View style={styles.helpSection}>
          <Text style={styles.helpTitle}>Need Help?</Text>
          <Text style={styles.helpText}>
            If you're having trouble signing in, please contact your family member or care coordinator for assistance.
          </Text>
        </View>
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
    paddingBottom: 40,
  },
  
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
  },
  
  logoText: {
    fontSize: 42,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  
  tagline: {
    fontSize: 20,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.white,
    opacity: 0.95,
  },
  
  formContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
  },
  
  welcomeText: {
    fontSize: 36,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  
  subtitleText: {
    fontSize: 20,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
  },
  
  errorAlert: {
    marginBottom: 20,
  },
  
  loginButton: {
    marginTop: 20,
    marginBottom: 16,
  },
  
  forgotButton: {
    marginTop: 8,
  },
  
  helpSection: {
    backgroundColor: COLORS.gray50,
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  
  helpTitle: {
    fontSize: 20,
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

export default LoginScreen;