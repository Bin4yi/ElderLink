import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { AuthProvider } from './src/context/AuthContext';
import { EmergencyProvider } from './src/context/EmergencyContext';
import { HealthProvider } from './src/context/HealthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/utils/colors';
import { StorageUtils } from './src/utils/storage';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

async function loadFonts() {
  await Font.loadAsync({
    'OpenSans-Regular': require('./assets/fonts/OpenSans-Regular.ttf'),
    'OpenSans-SemiBold': require('./assets/fonts/OpenSans-SemiBold.ttf'),
    'OpenSans-Bold': require('./assets/fonts/OpenSans-Bold.ttf'),
  });
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize storage
        await StorageUtils.initialize();
        console.log('✅ Storage initialized');
        
        // Load fonts
        await loadFonts();
        console.log('✅ Fonts loaded');
        
        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <AuthProvider>
        <EmergencyProvider>
          <HealthProvider>
            <StatusBar 
              style="light" 
              backgroundColor={COLORS.primary}
              translucent={false}
            />
            <AppNavigator />
          </HealthProvider>
        </EmergencyProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}