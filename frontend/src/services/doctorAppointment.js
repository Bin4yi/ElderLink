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

  // ✅ FIXED: Schedule management - using correct /api/doctor/schedules endpoint
  
  // Get doctor's schedules
  async getDoctorSchedule(params = {}) {
    try {
      const { month, year } = params;
      const queryParams = new URLSearchParams();
      
      if (month) queryParams.append('month', month);
      if (year) queryParams.append('year', year);
      
      const response = await api.get(`/doctor/schedules?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching doctor schedule:', error);
      throw error;
    }
  },

  // Add single schedule
  async addSchedule(scheduleData) {
    try {
      console.log('🔄 Adding schedule:', scheduleData);
      const response = await api.post('/doctor/schedules', scheduleData);
      console.log('✅ Schedule added:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding schedule:', error);
      throw error;
    }
  },

  // Add bulk schedules
  async addBulkSchedules(bulkData) {
    try {
      console.log('🔄 Adding bulk schedules:', bulkData);
      const response = await api.post('/doctor/schedules/bulk', bulkData);
      console.log('✅ Bulk schedules added:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error adding bulk schedules:', error);
      throw error;
    }
  },

  // Update specific schedule
  async updateSchedule(scheduleId, scheduleData) {
    try {
      console.log('🔄 Updating schedule:', scheduleId, scheduleData);
      const response = await api.put(`/doctor/schedules/${scheduleId}`, scheduleData);
      console.log('✅ Schedule updated:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error updating schedule:', error);
      throw error;
    }
  },

  // Delete specific schedule
  async deleteSchedule(scheduleId) {
    try {
      console.log('🔄 Deleting schedule:', scheduleId);
      const response = await api.delete(`/doctor/schedules/${scheduleId}`);
      console.log('✅ Schedule deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error deleting schedule:', error);
      throw error;
    }
  }
};
