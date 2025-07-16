// frontend/src/services/healthMonitoring.js
import api from './api';

export const healthMonitoringService = {
  // Test connection
  testConnection: async () => {
    try {
      console.log('🧪 Testing health monitoring connection...');
      const response = await api.get('/health-monitoring/test');
      console.log('✅ Health monitoring test response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Health monitoring test failed:', error);
      throw error;
    }
  },

  // Get all health monitoring records
  getAllRecords: async () => {
    try {
      console.log('🔍 Getting all health monitoring records...');
      const response = await api.get('/health-monitoring/all');
      console.log('✅ All health monitoring records:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get all health monitoring records:', error);
      throw error;
    }
  },

  // ⭐ CRITICAL: Get elder health history
  getElderHealthHistory: async (elderId, days = 7) => {
    try {
      console.log('🔍 Getting health history for elder:', elderId, 'for', days, 'days');
      
      const response = await api.get(`/health-monitoring/elder/${elderId}/history?days=${days}`);
      console.log('✅ Elder health history raw response:', response);
      console.log('✅ Elder health history data:', response.data);
      
      return {
        success: true,
        data: Array.isArray(response.data.data) ? response.data.data : [],
        total: response.data.total || 0,
        message: response.data.message || 'Success'
      };
    } catch (error) {
      console.error('❌ Failed to get elder health history:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error config:', error.config);
      
      return {
        success: false,
        data: [],
        total: 0,
        message: error.response?.data?.message || 'Failed to load health history'
      };
    }
  },

  // Get today's schedule
  getTodaysSchedule: async () => {
    try {
      console.log('🔍 Getting today\'s health monitoring schedule...');
      const response = await api.get('/health-monitoring/schedule/today');
      console.log('✅ Today\'s schedule response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get today\'s schedule:', error);
      return { data: { schedule: [] } };
    }
  },

  // Create health monitoring record
  createHealthMonitoring: async (data) => {
    try {
      console.log('📝 Creating health monitoring record:', data);
      const response = await api.post('/health-monitoring', data);
      console.log('✅ Created health monitoring record:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create health monitoring record:', error);
      throw error;
    }
  },

  // Update health monitoring record
  updateHealthMonitoring: async (id, data) => {
    try {
      console.log('📝 Updating health monitoring record:', id, data);
      const response = await api.put(`/health-monitoring/${id}`, data);
      console.log('✅ Updated health monitoring record:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update health monitoring record:', error);
      throw error;
    }
  },

  // Delete health monitoring record
  deleteHealthMonitoring: async (id) => {
    try {
      console.log('🗑️ Deleting health monitoring record:', id);
      const response = await api.delete(`/health-monitoring/${id}`);
      console.log('✅ Deleted health monitoring record:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete health monitoring record:', error);
      throw error;
    }
  }
};