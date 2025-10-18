// frontend/src/services/monthlySession.js
import api from './api';

const monthlySessionService = {
  /**
   * Create a simple first monthly session (no transaction, no complexity)
   * @param {Object} data - { elderId, doctorId, sessionDate, sessionTime }
   * @returns {Promise} Response with created session
   */
  createFirstMonthlySession: async (data) => {
    try {
      const response = await api.post('/monthly-sessions/create', data);
      return response.data;
    } catch (error) {
      console.error('Error creating monthly session:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Auto-schedule monthly sessions for an elder
   * @param {Object} data - { elderId, doctorId, startDate, numberOfMonths }
   * @returns {Promise} Response with scheduled sessions
   */
  autoScheduleMonthlySessions: async (data) => {
    try {
      const response = await api.post('/monthly-sessions/auto-schedule', data);
      return response.data;
    } catch (error) {
      console.error('Error auto-scheduling monthly sessions:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get all monthly sessions for family member's elders
   * @param {Object} filters - { elderId, status, startDate, endDate }
   * @returns {Promise} Response with sessions array
   */
  getMonthlySessions: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.elderId) params.append('elderId', filters.elderId);
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/monthly-sessions?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly sessions:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get monthly sessions for doctor
   * @param {Object} filters - { status, startDate, endDate }
   * @returns {Promise} Response with sessions array
   */
  getDoctorMonthlySessions: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/monthly-sessions/doctor/sessions?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor monthly sessions:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get single monthly session details
   * @param {string} sessionId - Session ID
   * @returns {Promise} Response with session details
   */
  getMonthlySessionById: async (sessionId) => {
    try {
      const response = await api.get(`/monthly-sessions/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly session:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Update monthly session
   * @param {string} sessionId - Session ID
   * @param {Object} updates - Fields to update
   * @returns {Promise} Response with updated session
   */
  updateMonthlySession: async (sessionId, updates) => {
    try {
      const response = await api.put(`/monthly-sessions/${sessionId}`, updates);
      return response.data;
    } catch (error) {
      console.error('Error updating monthly session:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Cancel monthly session
   * @param {string} sessionId - Session ID
   * @param {string} cancellationReason - Reason for cancellation
   * @returns {Promise} Response with cancelled session
   */
  cancelMonthlySession: async (sessionId, cancellationReason) => {
    try {
      const response = await api.post(`/monthly-sessions/${sessionId}/cancel`, {
        cancellationReason
      });
      return response.data;
    } catch (error) {
      console.error('Error cancelling monthly session:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Reschedule monthly session
   * @param {string} sessionId - Session ID
   * @param {Object} data - { newDate, newTime, reason }
   * @returns {Promise} Response with rescheduled session
   */
  rescheduleMonthlySession: async (sessionId, data) => {
    try {
      const response = await api.post(`/monthly-sessions/${sessionId}/reschedule`, data);
      return response.data;
    } catch (error) {
      console.error('Error rescheduling monthly session:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Complete monthly session (doctor only)
   * @param {string} sessionId - Session ID
   * @param {Object} data - { doctorNotes, sessionSummary, vitalSigns, prescriptions, nextSessionDate, sessionDuration }
   * @returns {Promise} Response with completed session
   */
  completeMonthlySession: async (sessionId, data) => {
    try {
      const response = await api.post(`/monthly-sessions/${sessionId}/complete`, data);
      return response.data;
    } catch (error) {
      console.error('Error completing monthly session:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get monthly session statistics
   * @param {string} elderId - Optional elder ID to filter stats
   * @returns {Promise} Response with statistics
   */
  getMonthlySessionStats: async (elderId = null) => {
    try {
      const params = elderId ? `?elderId=${elderId}` : '';
      const response = await api.get(`/monthly-sessions/stats${params}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching monthly session stats:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Check if a monthly session exists for a specific month
   * @param {string} elderId - Elder ID
   * @param {number} year - Year (e.g., 2025)
   * @param {number} month - Month (1-12)
   * @returns {Promise} Response with exists flag and session details if exists
   */
  checkMonthlySessionExists: async (elderId, year, month) => {
    try {
      const response = await api.get(`/monthly-sessions/check-exists`, {
        params: { elderId, year, month }
      });
      return response.data;
    } catch (error) {
      console.error('Error checking monthly session:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Start session timer (update status to in-progress)
   * @param {string} sessionId - Session ID
   * @returns {Promise} Response
   */
  startSession: async (sessionId) => {
    try {
      const response = await api.put(`/monthly-sessions/${sessionId}`, {
        status: 'in-progress'
      });
      return response.data;
    } catch (error) {
      console.error('Error starting session:', error);
      throw error.response?.data || error;
    }
  }
};

export default monthlySessionService;
