import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ROUTES } from '../utils/constants';
import { COLORS } from '../utils/colors';

// Import auth screens
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createStackNavigator();

/**
 * Authentication navigator
 * Handles login and password recovery flows
 */
const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={ROUTES.LOGIN}
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.primary,
          elevation: 0,
          shadowOpacity: 0},
        headerTitleStyle: {
          fontSize: 24,
          fontWeight: 'bold',
          color: COLORS.white},
        headerTintColor: COLORS.white,
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: COLORS.background },
        gestureEnabled: false, // Disable swipe gestures for elderly users
        animationEnabled: false}}>
      <Stack.Screen 
        name={ROUTES.LOGIN} 
        component={LoginScreen}
        options={{
          headerShown: false, // Hide header for login screen
        }}
      />
      <Stack.Screen 
        name={ROUTES.FORGOT_PASSWORD} 
        component={ForgotPasswordScreen}
        options={{
          headerTitle: 'Reset Password',
          headerShown: true}}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;