// frontend/src/services/doctorPatient.js
import api from './api';

export const doctorPatientService = {
  // Get all patients for logged-in doctor
  // Combines patients from appointments and assigned patients
  async getDoctorPatients(params = {}) {
    try {
      const { search, status, riskLevel, page = 1, limit = 100 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (search) queryParams.append('search', search);
      if (status) queryParams.append('status', status);
      if (riskLevel) queryParams.append('riskLevel', riskLevel);
      
      const response = await api.get(`/doctor/patients?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor patients:', error);
      throw error;
    }
  },

  // Get specific patient details
  async getPatientDetails(elderId) {
    try {
      const response = await api.get(`/doctor/patients/${elderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient details:', error);
      throw error;
    }
  },

  // Get patient medical history
  async getPatientMedicalHistory(elderId) {
    try {
      const response = await api.get(`/doctor/patients/${elderId}/medical-history`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient medical history:', error);
      throw error;
    }
  },

  // Get patient appointments
  async getPatientAppointments(elderId) {
    try {
      const response = await api.get(`/doctor/patients/${elderId}/appointments`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      throw error;
    }
  },

  // Get patient vitals
  async getPatientVitals(elderId) {
    try {
      const response = await api.get(`/doctor/patients/${elderId}/vitals`);
      return response.data;
    } catch (error) {
      console.error('Error fetching patient vitals:', error);
      throw error;
    }
  }
};

export default doctorPatientService;
