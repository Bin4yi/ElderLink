import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../utils/constants';
import { COLORS } from '../utils/colors';

// Import main screens
import HomeScreen from '../screens/main/HomeScreen';
import AppointmentsScreen from '../screens/main/AppointmentsScreen';
import HealthMetricsScreen from '../screens/main/HealthMetricsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SettingsScreen from '../screens/main/SettingsScreen';

const Tab = createBottomTabNavigator();

/**
 * Bottom tab navigator for main app screens
 * Optimized for elderly users with large icons and clear labels
 */
const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName={ROUTES.HOME}
      screenOptions={({ route }) => ({
        // Header configuration
        headerStyle: {
          backgroundColor: COLORS.primary,
          height: 80, 
          elevation: 4,
          shadowOpacity: 0.3,
        },
        headerTitleStyle: {
          fontSize: 28, // Large font size for elderly users
          fontWeight: 'bold',
          color: COLORS.white,
        },
        headerTintColor: COLORS.white,
        
        // Tab bar configuration
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 90, // Taller tab bar for easier touch
          paddingBottom: 10,
          paddingTop: 10,
          elevation: 8,
          shadowOpacity: 0.3,
        },
        tabBarLabelStyle: {
          fontSize: 16, // Large label text
          fontWeight: '600',
          marginTop: 5,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray500,
        
        // Tab bar icon configuration
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          const iconSize = 32; // Large icons for better visibility

          switch (route.name) {
            case ROUTES.HOME:
              iconName = focused ? 'home' : 'home-outline';
              break;
            case ROUTES.APPOINTMENTS:
              iconName = focused ? 'calendar' : 'calendar-outline';
              break;
            case ROUTES.HEALTH_METRICS:
              iconName = focused ? 'heart' : 'heart-outline';
              break;
            case ROUTES.PROFILE:
              iconName = focused ? 'person' : 'person-outline';
              break;
            case ROUTES.SETTINGS:
              iconName = focused ? 'settings' : 'settings-outline';
              break;
            default:
              iconName = 'circle-outline';
          }

          return (
            <Ionicons 
              name={iconName} 
              size={iconSize} 
              color={color}
              style={{ marginBottom: -3 }}
            />
          );
        },

        swipeEnabled: false, // Disable swipe navigation
      })}
    >
      <Tab.Screen 
        name={ROUTES.HOME} 
        component={HomeScreen}
        options={{
          title: 'Home',
          headerTitle: 'ElderLink Home',
          tabBarLabel: 'Home',
        }}
      />
      
      <Tab.Screen 
        name={ROUTES.APPOINTMENTS} 
        component={AppointmentsScreen}
        options={{
          title: 'Appointments',
          headerTitle: 'My Appointments',
          tabBarLabel: 'Appointments',
        }}
      />
      
      <Tab.Screen 
        name={ROUTES.HEALTH_METRICS} 
        component={HealthMetricsScreen}
        options={{
          title: 'Health',
          headerTitle: 'Health Metrics',
          tabBarLabel: 'Health',
        }}
      />
      
      <Tab.Screen 
        name={ROUTES.PROFILE} 
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
          tabBarLabel: 'Profile',
        }}
      />
      
      <Tab.Screen 
        name={ROUTES.SETTINGS} 
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerTitle: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator;