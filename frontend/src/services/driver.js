import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Driver service methods
export const driverService = {
  /**
   * Get all drivers with optional filters
   * @param {Object} filters - Optional filters { status: 'active'|'inactive', hasAmbulance: true|false }
   * @returns {Promise<Array>} List of drivers
   */
  getAllDrivers: async (filters = {}) => {
    try {
      console.log('🔍 Driver Service: Fetching drivers with filters:', filters);
      console.log('🔍 API Base URL:', API_BASE_URL);
      console.log('🔍 Token exists:', !!localStorage.getItem('token'));
      
      const response = await api.get('/drivers', { params: filters });
      console.log('✅ Driver Service: Response received:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Driver Service: Error fetching drivers:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get driver statistics
   * @returns {Promise<Object>} Driver statistics
   */
  getDriverStats: async () => {
    try {
      const response = await api.get('/drivers/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching driver stats:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get single driver by ID
   * @param {number} id - Driver ID
   * @returns {Promise<Object>} Driver details
   */
  getDriverById: async (id) => {
    try {
      const response = await api.get(`/drivers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching driver ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Create new driver
   * @param {Object} driverData - Driver data
   * @param {string} driverData.firstName - First name (required)
   * @param {string} driverData.lastName - Last name (required)
   * @param {string} driverData.email - Email (required, unique)
   * @param {string} driverData.password - Password (required)
   * @param {string} driverData.phone - Phone number
   * @returns {Promise<Object>} Created driver
   */
  createDriver: async (driverData) => {
    try {
      const response = await api.post('/drivers', driverData);
      return response.data;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Update driver
   * @param {number} id - Driver ID
   * @param {Object} driverData - Updated driver data
   * @returns {Promise<Object>} Updated driver
   */
  updateDriver: async (id, driverData) => {
    try {
      const response = await api.put(`/drivers/${id}`, driverData);
      return response.data;
    } catch (error) {
      console.error(`Error updating driver ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Delete driver (soft delete)
   * @param {number} id - Driver ID
   * @returns {Promise<Object>} Delete confirmation
   */
  deleteDriver: async (id) => {
    try {
      const response = await api.delete(`/drivers/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting driver ${id}:`, error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get driver's active dispatch (for mobile app)
   * @returns {Promise<Object>} Active dispatch details
   */
  getActiveDispatch: async () => {
    try {
      const response = await api.get('/drivers/active-dispatch');
      return response.data;
    } catch (error) {
      console.error('Error fetching active dispatch:', error);
      throw error.response?.data || error.message;
    }
  },

  /**
   * Get driver's dispatch history (for mobile app)
   * @param {Object} params - Query parameters { status, limit, offset }
   * @returns {Promise<Object>} Dispatch history
   */
  getDispatchHistory: async (params = {}) => {
    try {
      const response = await api.get('/drivers/dispatch-history', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching dispatch history:', error);
      throw error.response?.data || error.message;
    }
  },
};

export default driverService;
