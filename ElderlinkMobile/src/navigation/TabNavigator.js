import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ROUTES } from '../utils/constants';
import { COLORS } from '../utils/colors';

// Import main screens
import HomeScreen from '../screens/main/HomeScreen';
import HealthMetricsScreen from '../screens/main/HealthMetricsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

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
          height: 60,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          fontSize: 20,
          fontWeight: 'bold',
          color: COLORS.white,
          fontFamily: 'OpenSans-Bold',
        },
        headerTintColor: COLORS.white,
        
        // Tab bar configuration
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopColor: COLORS.gray200,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
          elevation: 8,
          shadowColor: COLORS.black,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: '600',
          marginTop: 4,
          fontFamily: 'OpenSans-SemiBold',
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
        
        // Tab bar icon configuration
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          const iconSize = 26;

          switch (route.name) {
            case ROUTES.HOME:
              iconName = focused ? 'home' : 'home-outline';
              break;
            case ROUTES.HEALTH_METRICS:
              iconName = focused ? 'medical' : 'medical-outline';
              break;
            case ROUTES.PROFILE:
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'circle-outline';
          }

          return (
            <Ionicons 
              name={iconName} 
              size={iconSize} 
              color={color}
            />
          );
        },

        swipeEnabled: false,
      })}
    >
      <Tab.Screen 
        name={ROUTES.HOME} 
        component={HomeScreen}
        options={{
          title: 'Home',
          headerTitle: 'ElderLink',
          tabBarLabel: 'Home',
        }}
      />
      
      <Tab.Screen 
        name={ROUTES.HEALTH_METRICS} 
        component={HealthMetricsScreen}
        options={{
          title: 'Health',
          headerTitle: 'My Health',
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
    </Tab.Navigator>
  );
};

export default TabNavigator;