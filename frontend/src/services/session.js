// frontend/src/services/session.js
import api from './api';

export const sessionService = {
  // Get all monthly sessions for the current user
  getSessions: async () => {
    try {
      const response = await api.get('/family/sessions');
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  // Get sessions for a specific month
  getSessionsByMonth: async (year, month) => {
    try {
      const response = await api.get(`/family/sessions?year=${year}&month=${month}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions by month:', error);
      throw error;
    }
  },

  // Get a specific session by ID
  getSession: async (sessionId) => {
    try {
      const response = await api.get(`/family/sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw error;
    }
  },

  // Schedule a new session
  scheduleSession: async (sessionData) => {
    try {
      const response = await api.post('/family/sessions', sessionData);
      return response.data;
    } catch (error) {
      console.error('Error scheduling session:', error);
      throw error;
    }
  },

  // Reschedule an existing session
  rescheduleSession: async (sessionId, newDateTime, reason) => {
    try {
      const response = await api.put(`/family/sessions/${sessionId}/reschedule`, {
        newDateTime,
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error rescheduling session:', error);
      throw error;
    }
  },

  // Complete a session
  completeSession: async (sessionId, summary, notes) => {
    try {
      const response = await api.put(`/family/sessions/${sessionId}/complete`, {
        summary,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error completing session:', error);
      throw error;
    }
  },

  // Cancel a session
  cancelSession: async (sessionId, reason) => {
    try {
      const response = await api.put(`/family/sessions/${sessionId}/cancel`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling session:', error);
      throw error;
    }
  },

  // Get available doctors for session scheduling
  getAvailableDoctors: async () => {
    try {
      const response = await api.get('/family/sessions/doctors');
      return response.data;
    } catch (error) {
      console.error('Error fetching available doctors:', error);
      throw error;
    }
  },

  // Get session statistics
  getSessionStats: async () => {
    try {
      const response = await api.get('/family/sessions/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching session stats:', error);
      throw error;
    }
  },

  // Update session timer
  updateSessionTimer: async (sessionId, timerData) => {
    try {
      const response = await api.put(`/family/sessions/${sessionId}/timer`, timerData);
      return response.data;
    } catch (error) {
      console.error('Error updating session timer:', error);
      throw error;
    }
  }
};