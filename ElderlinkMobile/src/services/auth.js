import apiService from './api';
import { API_ENDPOINTS } from '../utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Authentication service for handling login, logout, and token management
 */
class AuthService {
  /**
   * Login user with email and password
   */
  async login(email, password) {
    try {
      console.log('🔐 Auth service login...');
      console.log('📧 Email:', email);
      console.log('🔑 Password:', password ? '***' : 'undefined');
      console.log('🎯 Endpoint:', API_ENDPOINTS.AUTH.LOGIN);
      
      const loginData = { email, password };
      console.log('📦 Login data object:', loginData);
      
      const response = await apiService.post(API_ENDPOINTS.AUTH.LOGIN, loginData);

      console.log('🔐 Auth service response:', response);

      // The response is already the parsed JSON, not wrapped in a data property
      if (response.success && response.token && response.user) {
        // Store token immediately
        await AsyncStorage.setItem('auth_token', response.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));

        return {
          success: true,
          token: response.token,
          user: response.user,
          elder: response.elder || null,
          message: response.message,
        };
      } else {
        return {
          success: false,
          error: response.message || 'Login failed',
        };
      }
    } catch (error) {
      console.error('❌ Auth service login error:', error);
      return {
        success: false,
        error: error.message || 'Network error during login',
      };
    }
  }

  /**
   * Logout user
   */
  async logout() {
    try {
      console.log('🚪 Auth service logout...');
      
      // Try to call logout endpoint (optional)
      try {
        await apiService.post(API_ENDPOINTS.AUTH.LOGOUT);
      } catch (error) {
        console.log('Logout endpoint call failed, continuing...');
      }

      // Always clear local storage
      await AsyncStorage.multiRemove(['auth_token', 'user_data', 'elder_data']);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Auth service logout error:', error);
      
      // Force clear storage even if there's an error
      try {
        await AsyncStorage.multiRemove(['auth_token', 'user_data', 'elder_data']);
      } catch (storageError) {
        console.error('Storage clear error:', storageError);
      }
      
      return { success: true }; // Always return success for logout
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken() {
    try {
      console.log('🔄 Refreshing token...');
      
      const response = await apiService.post(API_ENDPOINTS.AUTH.REFRESH);

      if (response.success && response.token) {
        await AsyncStorage.setItem('auth_token', response.token);
        return {
          success: true,
          token: response.token,
        };
      } else {
        return {
          success: false,
          error: response.message || 'Token refresh failed',
        };
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      return {
        success: false,
        error: error.message || 'Network error during token refresh',
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    try {
      console.log('👤 Updating profile...');
      
      const response = await apiService.put('/user/profile', profileData);

      if (response.success) {
        // Update stored user data
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));
        
        return {
          success: true,
          user: response.user,
          message: response.message,
        };
      } else {
        return {
          success: false,
          error: response.message || 'Profile update failed',
        };
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);
      return {
        success: false,
        error: error.message || 'Network error during profile update',
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword, newPassword) {
    try {
      console.log('🔐 Changing password...');
      
      const response = await apiService.post('/user/change-password', {
        currentPassword,
        newPassword,
      });

      return {
        success: response.success,
        message: response.message,
        error: response.success ? null : response.message,
      };
    } catch (error) {
      console.error('❌ Change password error:', error);
      return {
        success: false,
        error: error.message || 'Network error during password change',
      };
    }
  }

  /**
   * Forgot password
   */
  async forgotPassword(email) {
    try {
      console.log('📧 Requesting password reset...');
      
      const response = await apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email,
      });

      return {
        success: response.success,
        message: response.message,
        error: response.success ? null : response.message,
      };
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      return {
        success: false,
        error: error.message || 'Network error during password reset request',
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token, newPassword) {
    try {
      console.log('🔐 Resetting password...');
      
      const response = await apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
        token,
        newPassword,
      });

      return {
        success: response.success,
        message: response.message,
        error: response.success ? null : response.message,
      };
    } catch (error) {
      console.error('❌ Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Network error during password reset',
      };
    }
  }

  /**
   * Get current user from storage
   */
  async getCurrentUser() {
    try {
      const userData = await AsyncStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Get current user error:', error);
      return null;
    }
  }

  /**
   * Get current token from storage
   */
  async getCurrentToken() {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('❌ Get current token error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      return !!(token && userData);
    } catch (error) {
      console.error('❌ Check authentication error:', error);
      return false;
    }
  }
}

// Create singleton instance
export const authService = new AuthService();
export default authService;