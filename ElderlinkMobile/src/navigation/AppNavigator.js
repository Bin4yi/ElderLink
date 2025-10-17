import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { ROUTES, USER_ROLES } from '../utils/constants';
import { COLORS } from '../utils/colors';

// Import navigators
import AuthNavigator from './AuthNavigator';
import TabNavigator from './TabNavigator';

// Import screens
import EmergencyScreen from '../screens/main/EmergencyScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import DriverDashboard from '../screens/DriverDashboard';
import RideDetails from '../screens/RideDetails';

// Loading screen component
import Loading from '../components/common/Loading';

const Stack = createStackNavigator();

/**
 * Main app navigator
 * Handles authentication flow and main app navigation
 * Routes users to appropriate screens based on their role
 */
const AppNavigator = () => {
  const { isLoading, isAuthenticated, user } = useAuth();

  // Show loading screen while checking authentication
  if (isLoading) {
    return <Loading message="Loading ElderLink..." />;
  }

  // Debug logging
  console.log('🔍 AppNavigator Debug:');
  console.log('  - isAuthenticated:', isAuthenticated);
  console.log('  - user:', JSON.stringify(user, null, 2));
  console.log('  - user.role:', user?.role);
  console.log('  - user.role type:', typeof user?.role);
  console.log('  - USER_ROLES.AMBULANCE_DRIVER:', USER_ROLES.AMBULANCE_DRIVER);
  console.log('  - USER_ROLES.AMBULANCE_DRIVER type:', typeof USER_ROLES.AMBULANCE_DRIVER);
  
  // Check if user is a driver
  const isDriver = user?.role === USER_ROLES.AMBULANCE_DRIVER;
  console.log('  - isDriver:', isDriver);
  console.log('  - Strict equality check:', user?.role, '===', USER_ROLES.AMBULANCE_DRIVER, '=', isDriver);

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
            animationEnabled: false,
          }}
        />
      ) : isDriver ? (
        // Driver app stack
        <>
          <Stack.Screen 
            name="DriverDashboard" 
            component={DriverDashboard}
            options={{
              animationEnabled: false,
            }}
          />
          <Stack.Screen 
            name="RideDetails" 
            component={RideDetails}
            options={{
              animationEnabled: true,
            }}
          />
        </>
      ) : (
        // Main app stack (for elders/family members)
        <>
          <Stack.Screen 
            name={ROUTES.MAIN} 
            component={TabNavigator}
            options={{
              animationEnabled: false,
            }}
          />
          <Stack.Screen 
            name={ROUTES.EMERGENCY} 
            component={EmergencyScreen}
            options={{
              presentation: 'modal',
              headerShown: true,
              headerTitle: 'Emergency',
              headerStyle: {
                backgroundColor: COLORS.emergency.background,
              },
              headerTitleStyle: {
                fontSize: 24,
                fontWeight: 'bold',
                color: COLORS.emergency.text,
              },
              headerTintColor: COLORS.emergency.text,
              gestureEnabled: false,
            }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{
              presentation: 'card',
              headerShown: true,
              headerTitle: 'Edit Profile',
              headerStyle: {
                backgroundColor: COLORS.white,
              },
              headerTitleStyle: {
                fontSize: 20,
                fontFamily: 'OpenSans-Bold',
                color: COLORS.textPrimary,
              },
              headerTintColor: COLORS.primary,
              gestureEnabled: true,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;