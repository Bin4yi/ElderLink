// frontend/src/services/consultation.js
import api from './api';

class ConsultationService {
  // Get doctor consultations (FIXED: Changed endpoint)
  async getDoctorConsultations(params = {}) {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      // ✅ FIXED: Changed from /consultation/doctor/consultations to /doctor/consultations
      const response = await api.get(`/doctor/consultations?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor consultations:', error);
      throw this.handleError(error);
    }
  }

  // Get doctor appointments
  async getDoctorAppointments(params = {}) {
    try {
      const { status, date, page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (status) queryParams.append('status', status);
      if (date) queryParams.append('date', date);
      
      // ✅ CORRECT: This endpoint matches the backend route
      const response = await api.get(`/doctor/appointments?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      throw this.handleError(error);
    }
  }

  // Create consultation record
  async createConsultation(consultationData) {
    try {
      const response = await api.post('/doctor/consultations', consultationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update consultation
  async updateConsultation(consultationId, consultationData) {
    try {
      const response = await api.put(`/doctor/consultations/${consultationId}`, consultationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Delete consultation
  async deleteConsultation(consultationId) {
    try {
      const response = await api.delete(`/doctor/consultations/${consultationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get consultation by ID
  async getConsultationById(consultationId) {
    try {
      const response = await api.get(`/doctor/consultations/${consultationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Review appointment (approve/reject)
  async reviewAppointment(appointmentId, action, notes = '') {
    try {
      console.log('🔄 Reviewing appointment:', { appointmentId, action, notes });
      
      const response = await api.patch(`/doctor/appointments/${appointmentId}/review`, {
        action,
        doctorNotes: notes,
        rejectionReason: action === 'reject' ? notes : undefined
      });
      
      console.log('✅ Review response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error reviewing appointment:', error);
      throw this.handleError(error);
    }
  }

  // Complete appointment
  async completeAppointment(appointmentId, data) {
    try {
      const response = await api.patch(`/doctor/appointments/${appointmentId}/complete`, data);
      return response.data;
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw this.handleError(error);
    }
  }

  // Get elder's medical summary
  async getElderMedicalSummary(elderId) {
    try {
      const response = await api.get(`/doctor/elders/${elderId}/medical-summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching elder medical summary:', error);
      throw this.handleError(error);
    }
  }

  // Create prescription
  async createPrescription(appointmentId, prescriptionData) {
    try {
      const response = await api.post(`/doctor/appointments/${appointmentId}/prescriptions`, prescriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw this.handleError(error);
    }
  }

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const response = await api.get('/doctor/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw this.handleError(error);
    }
  }

  // Update schedule
  async updateSchedule(schedules) {
    try {
      const response = await api.post('/doctor/schedule', { schedules });
      return response.data;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw this.handleError(error);
    }
  }

  // Add schedule exception
  async addScheduleException(exceptionData) {
    try {
      const response = await api.post('/doctor/schedule/exceptions', exceptionData);
      return response.data;
    } catch (error) {
      console.error('Error adding schedule exception:', error);
      throw this.handleError(error);
    }
  }

  // Reschedule appointment
  async rescheduleAppointment(appointmentId, data) {
    try {
      const response = await api.patch(`/doctor/appointments/${appointmentId}/reschedule`, data);
      return response.data;
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw this.handleError(error);
    }
  }

  // Error handler
  handleError(error) {
    console.error('ConsultationService Error:', error);
    
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      throw new Error(data.message || `HTTP ${status} Error`);
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export default new ConsultationService();