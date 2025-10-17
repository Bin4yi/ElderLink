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
      <StatusBar style="dark" />
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
          </View>
        </View>

        {/* Form Container */}
        <View style={styles.formContainer}>
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

          {/* Forgot Password Link */}
          <Button
            title="Forgot password?"
            onPress={navigateToForgotPassword}
            variant="ghost"
            size="medium"
            style={styles.forgotButton}
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
  },
  
  header: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 64,
    paddingHorizontal: 24,
  },
  
  logoContainer: {
    alignItems: 'center',
  },
  
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  
  logoText: {
    fontSize: 32,
    fontFamily: 'OpenSans-Bold',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
  },
  
  errorAlert: {
    marginBottom: 24,
  },
  
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    marginBottom: 32,
  },
  
  loginButton: {
    marginBottom: 24,
  },
});

export default LoginScreen;