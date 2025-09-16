import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../utils/constants';
import { COLORS } from '../utils/colors';

// Import navigators
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

// Import screens
import EmergencyScreen from '../screens/main/EmergencyScreen';

// Loading screen component
import Loading from '../components/common/Loading';

const Stack = createStackNavigator();

/**
 * Main app navigator
 * Handles authentication flow and main app navigation
 */
const AppNavigator = () => {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <Loading message="Loading ElderLink..." />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: COLORS.background },
        gestureEnabled: false, // Disable gesture navigation for elderly users
      }}>
      {!isAuthenticated ? (
        // Authentication stack
        <Stack.Screen 
          name={ROUTES.AUTH} 
          component={AuthNavigator}
          options={{
            animationEnabled: false}}
        />
      ) : (
        // Main app stack
        <>
          <Stack.Screen 
            name={ROUTES.MAIN} 
            component={TabNavigator}
            options={{
              animationEnabled: false}}
          />
          <Stack.Screen 
            name={ROUTES.EMERGENCY} 
            component={EmergencyScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Emergency',
              headerStyle: {
                backgroundColor: COLORS.emergency.background},
              headerTitleStyle: {
                fontSize: 24,
                fontWeight: 'bold',
                color: COLORS.emergency.text},
              headerTintColor: COLORS.emergency.text,
              gestureEnabled: false}}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;