/**
 * Debug script to set up test authentication data
 * Run this to create test user data for development
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

export const setupTestAuth = async () => {
  try {
    const testUser = {
      id: 'test-user-123',
      email: 'test@elderlink.com',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      role: 'elder'
    };

    const testElder = {
      id: 'test-elder-123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+1234567890',
      dateOfBirth: '1950-01-01',
      emergencyContacts: []
    };

    const testToken = 'test-token-123';

    await AsyncStorage.setItem('auth_token', testToken);
    await AsyncStorage.setItem('user_data', JSON.stringify(testUser));
    await AsyncStorage.setItem('elder_data', JSON.stringify(testElder));

    console.log('✅ Test auth data created');
    console.log('User:', testUser);
    console.log('Elder:', testElder);
    
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to create test auth data:', error);
    return { success: false, error };
  }
};

export const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_data');
    await AsyncStorage.removeItem('elder_data');
    console.log('✅ Auth data cleared');
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to clear auth data:', error);
    return { success: false, error };
  }
};
