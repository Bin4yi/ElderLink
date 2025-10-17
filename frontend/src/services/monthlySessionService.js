// frontend/src/services/monthlySessionService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Monthly Session Service
 * Handles API calls for monthly sessions, Zoom meetings, and prescriptions
 */

// Get all monthly sessions
export const getMonthlySessions = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/monthly-sessions`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get doctor's monthly sessions
export const getDoctorMonthlySessions = async (params = {}) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/monthly-sessions/doctor/sessions`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get session by ID
export const getMonthlySessionById = async (sessionId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/monthly-sessions/${sessionId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Create Zoom meeting for a session
export const createZoomMeeting = async (sessionId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/monthly-sessions/${sessionId}/create-zoom`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Send Zoom meeting links to family and elder
export const sendMeetingLinks = async (sessionId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/monthly-sessions/${sessionId}/send-links`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Start a Zoom meeting
export const startMeeting = async (sessionId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/monthly-sessions/${sessionId}/start-meeting`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Complete session with prescription
export const completeSessionWithPrescription = async (sessionId, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/monthly-sessions/${sessionId}/complete-with-prescription`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Get pharmacies list
export const getPharmacies = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/monthly-sessions/pharmacies/list`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Cancel session
export const cancelSession = async (sessionId, reason) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/monthly-sessions/${sessionId}/cancel`,
      { cancellationReason: reason },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Reschedule session
export const rescheduleSession = async (sessionId, data) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(
      `${API_URL}/monthly-sessions/${sessionId}/reschedule`,
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export default {
  getMonthlySessions,
  getDoctorMonthlySessions,
  getMonthlySessionById,
  createZoomMeeting,
  sendMeetingLinks,
  startMeeting,
  completeSessionWithPrescription,
  getPharmacies,
  cancelSession,
  rescheduleSession
};
