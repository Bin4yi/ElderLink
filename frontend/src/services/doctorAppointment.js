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
      
      if (status) queryParams.append('status', status);
      if (date) queryParams.append('date', date);
      
      const response = await api.get(`/doctor/appointments?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      throw error;
    }
  },

  // Review appointment (approve/reject)
  async reviewAppointment(appointmentId, action, notes = '') {
    try {
      console.log('🔄 Reviewing appointment:', { appointmentId, action, notes });
      
      const response = await api.patch(`/doctor/appointments/${appointmentId}/review`, {
        action,
        doctorNotes: notes, // ✅ CHANGED: from notes to doctorNotes
        rejectionReason: action === 'reject' ? notes : undefined
      });
      
      console.log('✅ Review response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error reviewing appointment:', error);
      throw error;
    }
  },

  async rescheduleAppointment(appointmentId, data) {
    try {
      const response = await api.patch(`/doctor/appointments/${appointmentId}/reschedule`, data);
      return response.data;
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      throw error;
    }
  },

  // Get elder's medical summary
  async getElderMedicalSummary(elderId) {
    try {
      const response = await api.get(`/doctor/elders/${elderId}/medical-summary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching elder medical summary:', error);
      throw error;
    }
  },

  // Complete appointment
  async completeAppointment(appointmentId, data) {
    try {
      const response = await api.patch(`/doctor/appointments/${appointmentId}/complete`, data);
      return response.data;
    } catch (error) {
      console.error('Error completing appointment:', error);
      throw error;
    }
  },

  // Create prescription
  async createPrescription(appointmentId, prescriptionData) {
    try {
      const response = await api.post(`/doctor/appointments/${appointmentId}/prescriptions`, prescriptionData);
      return response.data;
    } catch (error) {
      console.error('Error creating prescription:', error);
      throw error;
    }
  },

  // Get consultation records
  async getConsultationRecords(params = {}) {
    try {
      const { page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      
      const response = await api.get(`/doctor/consultations?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching consultation records:', error);
      throw error;
    }
  },

  // Get dashboard stats
  async getDashboardStats() {
    try {
      const response = await api.get('/doctor/dashboard/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  },

  // ✅ FIXED: Update schedule - now using the correct endpoint
  // Replace the existing updateSchedule method
  updateSchedule: async (data) => {
    try {
      console.log('🔄 Updating doctor schedule:', data);
      
      const response = await api.post('/doctor/schedule', data);
      
      console.log('✅ Schedule update response:', response);
      return response;
    } catch (error) {
      console.error('❌ Error updating schedule:', error);
      throw error;
    }
  },

  // Add schedule exception
  async addScheduleException(exceptionData) {
    try {
      const response = await api.post('/doctor/schedule/exceptions', exceptionData);
      return response.data;
    } catch (error) {
      console.error('Error adding schedule exception:', error);
      throw error;
    }
  },

  // ✅ NEW: Get doctor's current schedule
  async getDoctorSchedule(params = {}) {
    try {
      const { startDate, endDate } = params;
      const queryParams = new URLSearchParams();
      
      if (startDate) queryParams.append('startDate', startDate);
      if (endDate) queryParams.append('endDate', endDate);
      
      const response = await api.get(`/doctor/schedule?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor schedule:', error);
      throw error;
    }
  },

  // ✅ NEW: Delete specific schedule slots
  async deleteScheduleSlots(scheduleIds) {
    try {
      const response = await api.delete('/doctor/schedule', {
        data: { scheduleIds }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting schedule slots:', error);
      throw error;
    }
  }
};
