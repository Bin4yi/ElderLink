// src/services/auth.js
import api from './api';

export const authService = {
  register: async (userData) => {
    try {
      console.log('AuthService: Registering user:', userData.email);
      const response = await api.post('/auth/register', userData);
      console.log('AuthService: Registration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService: Register error:', error.response?.data || error.message);
      throw error;
    }
  },

  login: async (credentials) => {
    try {
      console.log('AuthService: Logging in user:', credentials.email);
      const response = await api.post('/auth/login', credentials);
      console.log('AuthService: Login response:', response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService: Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  getProfile: async () => {
    try {
      console.log('AuthService: Getting profile');
      const response = await api.get('/auth/profile');
      console.log('AuthService: Profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('AuthService: Get profile error:', error.response?.data || error.message);
      throw error;
    }
  }
};