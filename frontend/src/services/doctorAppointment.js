// frontend/src/services/doctorAppointment.js
import api from './api';

export const doctorAppointmentService = {
  // Get doctor's appointments
  async getDoctorAppointments(params = {}) {
    try {
      const { status, date, page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (status && status !== 'all') {
        queryParams.append('status', status);
      }
      if (date) {
        queryParams.append('date', date);
      }
      
      console.log('🔄 Fetching doctor appointments with params:', { status, date, page, limit });
      
      const response = await api.get(`/doctor/appointments?${queryParams}`);
      
      console.log('✅ Doctor appointments response:', response.data);
      
      // Ensure we return the expected structure
      return {
        success: response.data.success !== false,
        appointments: response.data.appointments || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('❌ Error fetching doctor appointments:', error);
      
      // Return a structured error response
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch appointments',
        appointments: [],
        pagination: {}
      };
    }
  },

  // Review appointment (approve/reject)
  async reviewAppointment(appointmentId, action, notes = '') {
    try {
      console.log('🔄 Reviewing appointment:', { appointmentId, action, notes });
      
      const response = await api.patch(`/doctor/appointments/${appointmentId}/review`, {
        action,
        doctorNotes: notes,
        rejectionReason: action === 'reject' ? (notes || 'Rejected by doctor') : undefined
      });
      
      console.log('✅ Review response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error reviewing appointment:', error);
      throw error;
    }
  },

  // Reschedule appointment
  async rescheduleAppointment(appointmentId, newDateTime, reason = '') {
    try {
      console.log('🔄 Rescheduling appointment:', { appointmentId, newDateTime, reason });
      
      const response = await api.patch(`/doctor/appointments/${appointmentId}/reschedule`, {
        newDateTime,
        reason
      });
      
      console.log('✅ Reschedule response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error rescheduling appointment:', error);
      throw error;
    }
  },

  // Get elder's medical summary
  async getElderMedicalSummary(elderId) {
    try {
      console.log('🔄 Fetching elder medical summary:', { elderId });
      
      const response = await api.get(`/doctor/elders/${elderId}/medical-summary`);
      
      console.log('✅ Elder medical summary response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching elder medical summary:', error);
      throw error;
    }
  },

  // Complete appointment
  async completeAppointment(appointmentId, consultationData) {
    try {
      console.log('🔄 Completing appointment:', { appointmentId, consultationData });
      
      const response = await api.patch(`/doctor/appointments/${appointmentId}/complete`, consultationData);
      
      console.log('✅ Complete appointment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error completing appointment:', error);
      throw error;
    }
  },

  // Create prescription
  async createPrescription(appointmentId, prescriptionData) {
    try {
      console.log('🔄 Creating prescription:', { appointmentId, prescriptionData });
      
      const response = await api.post(`/doctor/appointments/${appointmentId}/prescriptions`, prescriptionData);
      
      console.log('✅ Create prescription response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error creating prescription:', error);
      throw error;
    }
  },

  // Get consultation records
  async getConsultationRecords(params = {}) {
    try {
      const { page = 1, limit = 10, elderId } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      if (elderId) {
        queryParams.append('elderId', elderId);
      }
      
      console.log('🔄 Fetching consultation records:', params);
      
      const response = await api.get(`/doctor/consultations?${queryParams}`);
      
      console.log('✅ Consultation records response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching consultation records:', error);
      throw error;
    }
  },

  // Get dashboard stats
  async getDashboardStats() {
    try {
      console.log('🔄 Fetching dashboard stats');
      
      const response = await api.get('/doctor/dashboard/stats');
      
      console.log('✅ Dashboard stats response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // Update schedule
  async updateSchedule(schedules) {
    try {
      console.log('🔄 Updating schedule:', { schedules });
      
      const response = await api.post('/doctor/schedule', { schedules });
      
      console.log('✅ Update schedule response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating schedule:', error);
      throw error;
    }
  },

  // Add schedule exception
  async addScheduleException(exceptionData) {
    try {
      console.log('🔄 Adding schedule exception:', exceptionData);
      
      const response = await api.post('/doctor/schedule/exceptions', exceptionData);
      
      console.log('✅ Add schedule exception response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding schedule exception:', error);
      throw error;
    }
  }
};

