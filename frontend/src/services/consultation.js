// frontend/src/services/consultation.js
import api from './api';

class ConsultationService {
  // ✅ FIXED: Get doctor consultations from appointments table
  async getDoctorConsultations(params = {}) {
    try {
      console.log('🔄 Fetching doctor consultations with params:', params);
      
      const response = await api.get('/consultations/doctor/consultations', { 
        params: {
          status: params.status || 'all',
          page: params.page || 1,
          limit: params.limit || 50
        }
      });
      
      console.log('✅ Doctor consultations response:', response.data);
      return response.data;
    } catch (error) {
      console.log('API Error:', error.response?.data);
      console.error('❌ Error fetching doctor consultations:', error);
      throw error;
    }
  }

  // Get family consultations
  async getFamilyConsultations(params = {}) {
    try {
      const response = await api.get('/consultations/family/consultations', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching family consultations:', error);
      throw error;
    }
  }

  // Start consultation (for doctors)
  async startConsultation(appointmentId) {
    try {
      const response = await api.post(`/consultations/${appointmentId}/start`);
      return response.data;
    } catch (error) {
      console.error('Error starting consultation:', error);
      throw error;
    }
  }

  // Join consultation (for family members)
  async joinConsultation(appointmentId) {
    try {
      const response = await api.post(`/consultations/${appointmentId}/join`);
      return response.data;
    } catch (error) {
      console.error('Error joining consultation:', error);
      throw error;
    }
  }

  // Complete consultation
  async completeConsultation(appointmentId, consultationData) {
    try {
      const response = await api.post(`/consultations/${appointmentId}/complete`, consultationData);
      return response.data;
    } catch (error) {
      console.error('Error completing consultation:', error);
      throw error;
    }
  }

  // Create prescription
  async createPrescription(consultationId, prescriptionData) {
    try {
      const response = await api.post(`/consultations/${consultationId}/prescription`, prescriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  }

  // Get appointment details
  async getAppointmentDetails(appointmentId) {
    try {
      const response = await api.get(`/consultations/appointments/${appointmentId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error getting appointment details:', error);
      throw error;
    }
  }

  // Get elder details for doctor
  async getElderDetails(elderId) {
    try {
      const response = await api.get(`/consultations/doctor/elders/${elderId}/details`);
      return response.data;
    } catch (error) {
      console.error('Error getting elder details:', error);
      throw error;
    }
  }

  // Get elder medical summary (alternative method)
  async getElderMedicalSummary(elderId) {
    try {
      const response = await api.get(`/doctor/elders/${elderId}/medical-summary`);
      return response.data;
    } catch (error) {
      console.error('Error getting elder medical summary:', error);
      throw error;
    }
  }

  // Get consultation history for elder
  async getConsultationHistory(elderId) {
    try {
      const response = await api.get(`/consultations/elder/${elderId}/history`);
      return response.data;
    } catch (error) {
      console.error('Error getting consultation history:', error);
      throw error;
    }
  }

  // Update consultation status
  async updateConsultationStatus(appointmentId, status) {
    try {
      const response = await api.patch(`/consultations/${appointmentId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating consultation status:', error);
      throw error;
    }
  }

  // Handle API errors
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      console.error('API Error:', message);
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.request);
      return new Error('Network error - please check your connection');
    } else {
      // Something else happened
      console.error('Error:', error.message);
      return new Error(error.message);
    }
  }
}

// Export a singleton instance
const consultationService = new ConsultationService();
export default consultationService;