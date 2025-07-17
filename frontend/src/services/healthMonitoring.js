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
      console.log('✅ All health monitoring records response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get all health monitoring records:', error);
      throw error;
    }
  },

  // Added: Method for getting all health monitoring (used in HealthMonitoring component)
  getAllHealthMonitoring: async () => {
    try {
      console.log('🔍 Getting all health monitoring records...');
      const response = await api.get('/health-monitoring/all');
      console.log('✅ All health monitoring records response:', response.data);
      return {
        success: true,
        data: {
          healthMonitoring: response.data.data || []
        }
      };
    } catch (error) {
      console.error('❌ Failed to get all health monitoring records:', error);
      return {
        success: false,
        data: {
          healthMonitoring: []
        }
      };
    }
  },

  // Get today's health monitoring records
  getTodayRecords: async () => {
    try {
      console.log('🔍 Getting today\'s health monitoring records...');
      const response = await api.get('/health-monitoring/today');
      console.log('✅ Today\'s records response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get today\'s records:', error);
      return { data: { records: [] } };
    }
  },

  // Get elder health history
  getElderHealthHistory: async (elderId, days = 7) => {
    try {
      console.log('🔍 Getting health history for elder:', elderId, 'for', days, 'days');
      
      const response = await api.get(`/health-monitoring/elder/${elderId}/history`, {
        params: { days }
      });
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

  // Create health monitoring record
  createRecord: async (recordData) => {
    try {
      console.log('📝 Creating health monitoring record:', recordData);
      const response = await api.post('/health-monitoring', recordData);
      console.log('✅ Created health monitoring record:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to create health monitoring record:', error);
      throw error;
    }
  },

  // Added: Alias for createRecord
  createHealthMonitoring: async (recordData) => {
    return await healthMonitoringService.createRecord(recordData);
  },

  // Update health monitoring record
  updateRecord: async (recordId, recordData) => {
    try {
      console.log('📝 Updating health monitoring record:', recordId, recordData);
      const response = await api.put(`/health-monitoring/${recordId}`, recordData);
      console.log('✅ Updated health monitoring record:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to update health monitoring record:', error);
      throw error;
    }
  },

  // Added: Alias for updateRecord
  updateHealthMonitoring: async (recordId, recordData) => {
    return await healthMonitoringService.updateRecord(recordId, recordData);
  },

  // Delete health monitoring record
  deleteRecord: async (recordId) => {
    try {
      console.log('🗑️ Deleting health monitoring record:', recordId);
      const response = await api.delete(`/health-monitoring/${recordId}`);
      console.log('✅ Deleted health monitoring record:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to delete health monitoring record:', error);
      throw error;
    }
  },

  // Added: Alias for deleteRecord
  deleteHealthMonitoring: async (recordId) => {
    return await healthMonitoringService.deleteRecord(recordId);
  }
};