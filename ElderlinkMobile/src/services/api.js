import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from '../utils/constants';
import { StorageUtils } from '../utils/storage';

/**
 * API service for making HTTP requests to the backend
 * Includes authentication, error handling, and request/response interceptors
 */
class ApiService {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.defaultHeaders = API_CONFIG.HEADERS;
  }

  /**
   * Get authentication headers
   */
  async getAuthHeaders() {
    const token = await AsyncStorage.getItem('auth_token');
    return {
      ...API_CONFIG.HEADERS,
      Authorization: token ? `Bearer ${token}` : undefined,
    };
  }

  /**
   * Make HTTP request with proper error handling
   */
  async makeRequest(url, options = {}) {
    try {
      const headers = await this.getAuthHeaders();
      
      const config = {
        method: 'GET',
        headers,
        ...options,
      };

      // Add body for POST/PUT requests
      if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
      }

      console.log(`Making ${config.method} request to: ${this.baseURL}${url}`);
      
      const response = await fetch(`${this.baseURL}${url}`, config);
      
      console.log(`Response status: ${response.status}`);

      // Handle different response statuses
      if (response.status === 401) {
        // Token expired or invalid
        await StorageUtils.auth.logout();
        throw new Error(ERROR_MESSAGES.AUTHENTICATION);
      }

      if (response.status === 403) {
        throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || ERROR_MESSAGES.SERVER_ERROR);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      return data;
    } catch (error) {
      console.error('API Request Error:', error);
      
      // Handle network errors
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error(ERROR_MESSAGES.NETWORK);
      }
      
      throw error;
    }
  }

  /**
   * GET request
   */
  async get(url, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return this.makeRequest(fullUrl);
  }

  /**
   * POST request
   */
  async post(url, data = {}) {
    return this.makeRequest(url, {
      method: 'POST',
      body: data,
    });
  }

  /**
   * PUT request
   */
  async put(url, data = {}) {
    return this.makeRequest(url, {
      method: 'PUT',
      body: data,
    });
  }

  /**
   * DELETE request
   */
  async delete(url) {
    return this.makeRequest(url, {
      method: 'DELETE',
    });
  }

  /**
   * PATCH request
   */
  async patch(url, data = {}) {
    return this.makeRequest(url, {
      method: 'PATCH',
      body: data,
    });
  }

  /**
   * Upload file
   */
  async uploadFile(url, file, additionalData = {}) {
    try {
      const token = await StorageUtils.auth.getToken();
      const formData = new FormData();
      
      formData.append('file', file);
      
      // Add additional data
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });

      const response = await fetch(`${this.baseURL}${url}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : undefined,
          // Don't set Content-Type for FormData - let browser set it
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('File upload error:', error);
      throw error;
    }
  }

  /**
   * Check API health
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return response.ok;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;