// frontend/src/services/healthAlerts.js
import api from './api';

export const healthAlertService = {
  // Get all alerts (admin only)
  getAllAlerts: async (params = {}) => {
    try {
      const response = await api.get('/health-alerts', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get all alerts:', error);
      throw error;
    }
  },

  // Get alerts for staff member
  getStaffAlerts: async () => {
    try {
      console.log('🔍 Getting staff alerts...');
      const response = await api.get('/health-alerts/staff');
      console.log('✅ Staff alerts response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get staff alerts:', error);
      throw error;
    }
  },

  // Acknowledge alert
  acknowledgeAlert: async (alertId) => {
    try {
      const response = await api.put(`/health-alerts/${alertId}/acknowledge`);
      return response.data;
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw error;
    }
  },

  // Resolve alert
  resolveAlert: async (alertId) => {
    try {
      const response = await api.put(`/health-alerts/${alertId}/resolve`);
      return response.data;
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      throw error;
    }
  },

  // Mark emergency contacted
  markEmergencyContacted: async (alertId) => {
    try {
      const response = await api.put(`/health-alerts/${alertId}/emergency-contacted`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark emergency contacted:', error);
      throw error;
    }
  },

  // Mark next of kin notified
  markNextOfKinNotified: async (alertId) => {
    try {
      const response = await api.put(`/health-alerts/${alertId}/next-of-kin-notified`);
      return response.data;
    } catch (error) {
      console.error('Failed to mark next of kin notified:', error);
      throw error;
    }
  }
};
