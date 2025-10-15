import apiService from './api';
import { API_ENDPOINTS } from '../utils/constants';

class DriverService {
  /**
   * Get driver's active dispatch
   * @returns {Promise<Object>} Active dispatch details
   */
  async getActiveDispatch() {
    try {
      console.log('🚗 Getting active dispatch...');
      const response = await apiService.makeRequest(
        'GET',
        API_ENDPOINTS.DRIVER.ACTIVE_DISPATCH
      );
      console.log('✅ Active dispatch:', response);
      return response;
    } catch (error) {
      console.error('❌ Error getting active dispatch:', error);
      throw error;
    }
  }

  /**
   * Get driver's dispatch history
   * @param {Object} params - Query parameters { status, limit, offset }
   * @returns {Promise<Object>} Dispatch history
   */
  async getDispatchHistory(params = {}) {
    try {
      console.log('📋 Getting dispatch history with params:', params);
      const queryString = new URLSearchParams(params).toString();
      const endpoint = `${API_ENDPOINTS.DRIVER.HISTORY}${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiService.makeRequest('GET', endpoint);
      console.log('✅ Dispatch history:', response);
      return response;
    } catch (error) {
      console.error('❌ Error getting dispatch history:', error);
      throw error;
    }
  }

  /**
   * Accept a dispatch
   * @param {string} dispatchId - Dispatch ID
   * @returns {Promise<Object>} Updated dispatch
   */
  async acceptDispatch(dispatchId) {
    try {
      console.log('✅ Accepting dispatch:', dispatchId);
      const response = await apiService.makeRequest(
        'POST',
        API_ENDPOINTS.SOS_RESPONSE.ACCEPT_DISPATCH(dispatchId)
      );
      console.log('✅ Dispatch accepted:', response);
      return response;
    } catch (error) {
      console.error('❌ Error accepting dispatch:', error);
      throw error;
    }
  }

  /**
   * Update dispatch status to en route
   * @param {string} dispatchId - Dispatch ID
   * @returns {Promise<Object>} Updated dispatch
   */
  async updateToEnRoute(dispatchId) {
    try {
      console.log('🚗 Updating to en route:', dispatchId);
      const response = await apiService.makeRequest(
        'PATCH',
        API_ENDPOINTS.SOS_RESPONSE.UPDATE_STATUS(dispatchId),
        { status: 'en_route' }
      );
      console.log('✅ Updated to en route:', response);
      return response;
    } catch (error) {
      console.error('❌ Error updating to en route:', error);
      throw error;
    }
  }

  /**
   * Mark dispatch as arrived
   * @param {string} dispatchId - Dispatch ID
   * @returns {Promise<Object>} Updated dispatch
   */
  async markArrived(dispatchId) {
    try {
      console.log('📍 Marking as arrived:', dispatchId);
      const response = await apiService.makeRequest(
        'POST',
        API_ENDPOINTS.SOS_RESPONSE.MARK_ARRIVED(dispatchId)
      );
      console.log('✅ Marked as arrived:', response);
      return response;
    } catch (error) {
      console.error('❌ Error marking as arrived:', error);
      throw error;
    }
  }

  /**
   * Complete a dispatch
   * @param {string} dispatchId - Dispatch ID
   * @param {string} notes - Completion notes
   * @returns {Promise<Object>} Completed dispatch
   */
  async completeDispatch(dispatchId, notes = '') {
    try {
      console.log('✅ Completing dispatch:', dispatchId);
      const response = await apiService.makeRequest(
        'POST',
        API_ENDPOINTS.SOS_RESPONSE.COMPLETE_DISPATCH(dispatchId),
        { notes }
      );
      console.log('✅ Dispatch completed:', response);
      return response;
    } catch (error) {
      console.error('❌ Error completing dispatch:', error);
      throw error;
    }
  }

  /**
   * Mark ambulance as available
   * @returns {Promise<Object>} Response
   */
  async markAvailable() {
    try {
      console.log('✓ Marking ambulance as available...');
      const response = await apiService.makeRequest(
        'POST',
        '/api/drivers/mark-available'
      );
      console.log('✅ Ambulance marked as available:', response);
      return response;
    } catch (error) {
      console.error('❌ Error marking ambulance as available:', error);
      throw error;
    }
  }
}

export default new DriverService();
