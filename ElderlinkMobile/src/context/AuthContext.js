import React, { createContext, useContext, useReducer, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth';
import { testLogin } from '../services/testLogin';

/**
 * Authentication Context for managing user state and authentication
 * Optimized for elderly users with simple state management
 */

// Initial state
const initialState = {
  isLoading: true,
  isAuthenticated: false,
  user: null,
  elder: null,
  token: null,
  error: null,
};

// Auth actions
const AUTH_ACTIONS = {
  LOADING: 'LOADING',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_ERROR: 'LOGIN_ERROR',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  UPDATE_ELDER: 'UPDATE_ELDER',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_AUTHENTICATION_STATE: 'SET_AUTHENTICATION_STATE',
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        elder: action.payload.elder,
        token: action.payload.token,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_ERROR:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        elder: null,
        token: null,
        error: action.payload.error,
      };

    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        user: null,
        elder: null,
        token: null,
        error: null,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    case AUTH_ACTIONS.UPDATE_ELDER:
      return {
        ...state,
        elder: { ...state.elder, ...action.payload },
      };

    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case AUTH_ACTIONS.SET_AUTHENTICATION_STATE:
      return {
        ...state,
        isLoading: false,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
        elder: action.payload.elder,
        token: action.payload.token,
      };

    default:
      return state;
  }
};

// Create context
const AuthContext = createContext(undefined);

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check authentication status on app start
  useEffect(() => {
    checkAuthenticationStatus();
  }, []);

  /**
   * Check if user is already authenticated
   */
  const checkAuthenticationStatus = async () => {
    try {
      console.log('🔍 Checking authentication status...');
      dispatch({ type: AUTH_ACTIONS.LOADING });

      const token = await AsyncStorage.getItem('auth_token');
      const userData = await AsyncStorage.getItem('user_data');
      const elderData = await AsyncStorage.getItem('elder_data');

      console.log('🔍 Auth check results:', { 
        hasToken: !!token, 
        hasUserData: !!userData, 
        hasElderData: !!elderData 
      });

      if (token && userData) {
        const user = JSON.parse(userData);
        const elder = elderData ? JSON.parse(elderData) : null;
        
        console.log('✅ Found stored auth data:', { 
          userEmail: user?.email, 
          userId: user?.id || user?.userId,
          userRole: user?.role,
          elderName: elder?.firstName,
          elderId: elder?.id || elder?.userId
        });
        
        console.log('📦 Loaded user data:', JSON.stringify(user, null, 2));
        console.log('📦 Loaded user role:', user?.role, 'Type:', typeof user?.role);
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            token,
            user,
            elder,
          },
        });

        console.log('✅ User already authenticated:', user?.email, 'Role:', user?.role);
      } else {
        dispatch({
          type: AUTH_ACTIONS.SET_AUTHENTICATION_STATE,
          payload: {
            isAuthenticated: false,
            user: null,
            elder: null,
            token: null,
          },
        });

        console.log('ℹ️ User not authenticated');
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      dispatch({
        type: AUTH_ACTIONS.SET_AUTHENTICATION_STATE,
        payload: {
          isAuthenticated: false,
          user: null,
          elder: null,
          token: null,
        },
      });
    }
  };

  /**
   * Login user
   */
  const login = async (email, password) => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING });

      console.log('🔐 Attempting login...');
      console.log(`🔐 Attempting login for: ${email}`);
      console.log('⚡ NEW CODE VERSION - Oct 7, 2025 - 3:30 PM');
      
      // USE TEST LOGIN FUNCTION
      console.log('🧪 Using test login function...');
      const testResponse = await testLogin(email, password);
      console.log('🧪 Test response:', testResponse);
      
      const response = await authService.login(email, password);
      console.log('✅ Login response:', response);

      if (response.success && response.token && response.user) {
        // Debug: Log what we're storing
        console.log('📦 Storing user data:', JSON.stringify(response.user, null, 2));
        console.log('📦 User role:', response.user?.role, 'Type:', typeof response.user?.role);

        // Store auth data
        await AsyncStorage.setItem('auth_token', response.token);
        await AsyncStorage.setItem('user_data', JSON.stringify(response.user));

        // If user has elder data, store it
        if (response.elder) {
          await AsyncStorage.setItem('elder_data', JSON.stringify(response.elder));
        }

        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            token: response.token,
            user: response.user,
            elder: response.elder || null,
          },
        });

        console.log('✅ Login successful - User role:', response.user?.role);
        return { success: true };
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.message || 'Login failed';
      
      dispatch({
        type: AUTH_ACTIONS.LOGIN_ERROR,
        payload: { error: errorMessage },
      });

      console.log(`❌ Login failed: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      dispatch({ type: AUTH_ACTIONS.LOADING });

      console.log('🚪 Logging out...');
      
      await AsyncStorage.multiRemove(['auth_token', 'user_data', 'elder_data']);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });

      console.log('✅ Logout completed');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      
      // Force logout even if service call fails
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      
      return { success: true }; // Always return success for logout
    }
  };

  /**
   * Update user profile
   */
  const updateUserProfile = async (profileData) => {
    try {
      console.log('👤 Updating user profile...');
      
      const result = await authService.updateProfile(profileData);

      if (result.success) {
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: result.user,
        });

        console.log('✅ Profile updated');
        return { success: true, message: result.message };
      } else {
        console.log('❌ Profile update failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Profile update error:', error);
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  };

  /**
   * Update elder data
   */
  const updateElderData = async (elderData) => {
    try {
      console.log('👴 Updating elder data...');
      
      // Update local storage
      await AsyncStorage.setItem('elder_data', JSON.stringify(elderData));
      
      // Update context state
      dispatch({
        type: AUTH_ACTIONS.UPDATE_ELDER,
        payload: elderData,
      });

      console.log('✅ Elder data updated');
      return { success: true };
    } catch (error) {
      console.error('❌ Elder data update error:', error);
      return { success: false, error: error.message || 'Failed to update elder data' };
    }
  };

  /**
   * Refresh authentication token
   */
  const refreshToken = async () => {
    try {
      console.log('🔄 Refreshing token...');
      
      const result = await authService.refreshToken();

      if (result.success) {
        // Token is automatically updated in storage by the service
        console.log('✅ Token refreshed');
        return { success: true };
      } else {
        // If refresh fails, logout user
        dispatch({ type: AUTH_ACTIONS.LOGOUT });
        console.log('❌ Token refresh failed, user logged out');
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Token refresh error:', error);
      dispatch({ type: AUTH_ACTIONS.LOGOUT });
      return { success: false, error: error.message || 'Token refresh failed' };
    }
  };

  /**
   * Clear authentication error
   */
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  /**
   * Change password
   */
  const changePassword = async (currentPassword, newPassword) => {
    try {
      console.log('🔐 Changing password...');
      
      const result = await authService.changePassword(currentPassword, newPassword);

      if (result.success) {
        console.log('✅ Password changed successfully');
        return { success: true, message: result.message };
      } else {
        console.log('❌ Password change failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Password change error:', error);
      return { success: false, error: error.message || 'Failed to change password' };
    }
  };

  /**
   * Forgot password
   */
  const forgotPassword = async (email) => {
    try {
      console.log('📧 Requesting password reset...');
      
      const result = await authService.forgotPassword(email);

      if (result.success) {
        console.log('✅ Password reset email sent');
        return { success: true, message: result.message };
      } else {
        console.log('❌ Password reset failed:', result.error);
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      return { success: false, error: error.message || 'Failed to send password reset email' };
    }
  };

  // Context value
  const value = {
    // State
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    user: state.user,
    elder: state.elder,
    token: state.token,
    error: state.error,

    // Actions
    login,
    logout,
    updateUserProfile,
    updateElderData,
    refreshToken,
    clearError,
    changePassword,
    forgotPassword,
    checkAuthenticationStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};