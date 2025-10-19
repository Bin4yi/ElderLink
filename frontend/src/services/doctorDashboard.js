// frontend/src/services/doctorDashboard.js
import api from './api';

const doctorDashboardService = {
  // Get comprehensive dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/doctor/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Get today's schedule
  getTodaySchedule: async () => {
    try {
      const response = await api.get('/doctor/dashboard/schedule/today');
      return response.data;
    } catch (error) {
      console.error('Error fetching today\'s schedule:', error);
      throw error;
    }
  },

  // Get recent activity
  getRecentActivity: async (limit = 10) => {
    try {
      const response = await api.get('/doctor/dashboard/activity/recent', {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw error;
    }
  },

  // Get health alerts
  getHealthAlerts: async (severity = null, limit = 10) => {
    try {
      const params = { limit };
      if (severity) params.severity = severity;
      
      const response = await api.get('/doctor/dashboard/health-alerts', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching health alerts:', error);
      throw error;
    }
  },

  // Get upcoming appointments
  getUpcomingAppointments: async (days = 7, limit = 10) => {
    try {
      const response = await api.get('/doctor/dashboard/appointments/upcoming', {
        params: { days, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      throw error;
    }
  }
};

export default doctorDashboardService;
