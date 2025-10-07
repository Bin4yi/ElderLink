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
   * @param {string} method - HTTP method (GET, POST, PUT, DELETE, PATCH)
   * @param {string} url - API endpoint path
   * @param {object} data - Request body data (for POST/PUT/PATCH)
   * @param {object} options - Additional fetch options
   */
  async makeRequest(method, url, data = null, options = {}) {
    try {
      console.log(`🔍 makeRequest called with:`);
      console.log(`  - method: "${method}" (type: ${typeof method})`);
      console.log(`  - url: "${url}"`);
      console.log(`  - data: ${JSON.stringify(data)} (type: ${typeof data})`);
      console.log(`  - data truthy?: ${!!data}`);
      
      const headers = await this.getAuthHeaders();
      
      const config = {
        method: method.toUpperCase(),
        headers,
        ...options,
      };

      console.log(`  - config.method: "${config.method}"`);
      console.log(`  - Is POST?: ${config.method === 'POST'}`);
      console.log(`  - Includes POST?: ${['POST', 'PUT', 'PATCH'].includes(config.method)}`);
      console.log(`  - Should add body?: ${data && ['POST', 'PUT', 'PATCH'].includes(config.method)}`);

      // Add body for POST/PUT/PATCH requests
      if (data && ['POST', 'PUT', 'PATCH'].includes(config.method)) {
        config.body = JSON.stringify(data);
        console.log(`📦 Request data:`, JSON.stringify(data, null, 2));
        console.log(`📦 Request body (stringified):`, config.body);
      } else {
        console.log(`❌ NOT adding body! data=${!!data}, method=${config.method}`);
      }

      console.log(`🌐 Making ${config.method} request to: ${this.baseURL}${url}`);
      console.log(`📋 Headers:`, JSON.stringify(config.headers, null, 2));
      
      const response = await fetch(`${this.baseURL}${url}`, config);
      
      console.log(`Response status: ${response.status}`);

      // Handle different response statuses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Only treat 401 as token expiration if we're NOT on the login endpoint
        if (response.status === 401 && !url.includes('/auth/login')) {
          // Token expired or invalid
          await StorageUtils.auth.logout();
          throw new Error(ERROR_MESSAGES.AUTHENTICATION);
        }

        if (response.status === 403) {
          throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
        }

        // For all other errors (including login 401), throw the server's message
        throw new Error(errorData.message || ERROR_MESSAGES.SERVER_ERROR);
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);
      
      return responseData;
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
    
    return this.makeRequest('GET', fullUrl);
  }

  /**
   * POST request
   */
  async post(url, data = {}) {
    return this.makeRequest('POST', url, data);
  }

  /**
   * PUT request
   */
  async put(url, data = {}) {
    return this.makeRequest('PUT', url, data);
  }

  /**
   * DELETE request
   */
  async delete(url) {
    return this.makeRequest('DELETE', url);
  }

  /**
   * PATCH request
   */
  async patch(url, data = {}) {
    return this.makeRequest('PATCH', url, data);
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