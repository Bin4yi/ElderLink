import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Update this URL to your backend server
const API_URL = 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - could trigger logout
      console.log('Unauthorized - token may be invalid');
    }
    return Promise.reject(error);
  }
);

// SOS Response Service - Driver endpoints
export const sosResponseService = {
  // Get active dispatch for current driver
  getActiveDispatch: () => {
    return api.get('/sos-response/active');
  },

  // Accept a dispatch
  acceptDispatch: (dispatchId) => {
    return api.post(`/sos-response/dispatch/${dispatchId}/accept`);
  },

  // Update driver location
  updateLocation: (dispatchId, location) => {
    return api.post(`/sos-response/dispatch/${dispatchId}/location`, location);
  },

  // Mark arrival at scene
  markArrived: (dispatchId) => {
    return api.post(`/sos-response/dispatch/${dispatchId}/arrived`);
  },

  // Complete dispatch
  completeDispatch: (dispatchId, data) => {
    return api.post(`/sos-response/dispatch/${dispatchId}/complete`, data);
  },

  // Get driver statistics
  getDriverStats: () => {
    return api.get('/sos-response/stats');
  },

  // Get driver dispatch history
  getDispatchHistory: (params) => {
    return api.get('/sos-response/history', { params });
  },
};

// Emergency Service - For creating emergencies (elder side)
export const emergencyService = {
  // Create emergency alert
  createEmergency: (data) => {
    return api.post('/emergency/alert', data);
  },

  // Get elder's emergency history
  getEmergencyHistory: () => {
    return api.get('/emergency/history');
  },

  // Cancel emergency
  cancelEmergency: (alertId) => {
    return api.delete(`/emergency/alert/${alertId}`);
  },
};

// Ambulance Service - Fleet information
export const ambulanceService = {
  // Get all ambulances
  getAmbulances: (params) => {
    return api.get('/ambulance', { params });
  },

  // Get ambulance by ID
  getAmbulance: (id) => {
    return api.get(`/ambulance/${id}`);
  },

  // Get ambulance statistics
  getAmbulanceStats: () => {
    return api.get('/ambulance/stats');
  },
};

// Auth Service
export const authService = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  },

  // Get current user
  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Register
  register: (data) => {
    return api.post('/auth/register', data);
  },
};

// Export api instance for custom requests
export default api;
