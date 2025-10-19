import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';

// Import driver screens
import DriverDashboard from '../screens/DriverDashboard';
import DriverProfileScreen from '../screens/driver/DriverProfileScreen';

const Tab = createBottomTabNavigator();

/**
 * Bottom tab navigator for driver screens
 * Matches the elder's navigation style with Home and Profile tabs
 */
const DriverTabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        // Header configuration - matching elder style
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
        
        // Tab bar configuration - matching elder style
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
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Profile':
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
        name="Home" 
        component={DriverDashboard}
        options={{
          title: 'Home',
          headerTitle: 'Driver Dashboard',
          tabBarLabel: 'Home',
          headerShown: false, // DriverDashboard has its own header
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={DriverProfileScreen}
        options={{
          title: 'Profile',
          headerTitle: 'My Profile',
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};

export default DriverTabNavigator;
