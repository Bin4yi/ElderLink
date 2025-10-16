import apiService from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { StorageUtils } from '../utils/storage';

/**
 * Appointments service for managing elder appointments
 * Handles booking, updating, canceling, and retrieving appointments
 */
export const appointmentsService = {
  /**
   * Get all appointments for an elder
   */
  getElderAppointments: async (elderId) => {
    try {
      console.log('📅 Getting appointments for elder:', elderId);
      
      const response = await apiService.get(API_ENDPOINTS.APPOINTMENTS.ELDER(elderId));
      
      console.log('✅ Elder appointments response:', response);
      
      if (response.success) {
        // Cache appointments data
        await StorageUtils.appointments.cacheAppointments(response.data.appointments);
        
        return {
          success: true,
          appointments: response.data.appointments || [],
        };
      } else {
        throw new Error(response.message || 'Failed to get appointments');
      }
    } catch (error) {
      console.error('❌ Get elder appointments error:', error);
      
      // Try to get cached data if available
      const cachedAppointments = await StorageUtils.appointments.getCachedAppointments();
      
      return {
        success: false,
        appointments: cachedAppointments || [],
        error: error.message || 'Failed to get appointments',
        fromCache: !!cachedAppointments,
      };
    }
  },

  /**
   * Get upcoming appointments for an elder
   */
  getUpcomingAppointments: async (elderId) => {
    try {
      console.log('📅 Getting upcoming appointments for elder:', elderId);
      
      const response = await apiService.get(API_ENDPOINTS.APPOINTMENTS.UPCOMING(elderId));
      
      console.log('✅ Upcoming appointments response:', response);
      
      if (response.success) {
        return {
          success: true,
          appointments: response.data.appointments || [],
        };
      } else {
        throw new Error(response.message || 'Failed to get upcoming appointments');
      }
    } catch (error) {
      console.error('❌ Get upcoming appointments error:', error);
      return {
        success: false,
        appointments: [],
        error: error.message || 'Failed to get upcoming appointments',
      };
    }
  },

  /**
   * Get all appointments
   */
  getAllAppointments: async () => {
    try {
      console.log('📅 Getting all appointments...');
      
      const response = await apiService.get(API_ENDPOINTS.APPOINTMENTS.BASE);
      
      console.log('✅ All appointments response:', response);
      
      if (response.success) {
        return {
          success: true,
          appointments: response.data.appointments || [],
        };
      } else {
        throw new Error(response.message || 'Failed to get appointments');
      }
    } catch (error) {
      console.error('❌ Get all appointments error:', error);
      return {
        success: false,
        appointments: [],
        error: error.message || 'Failed to get appointments',
      };
    }
  },

  /**
   * Book a new appointment
   */
  bookAppointment: async (appointmentData) => {
    try {
      console.log('📝 Booking new appointment:', appointmentData);
      
      const response = await apiService.post(API_ENDPOINTS.APPOINTMENTS.CREATE, appointmentData);
      
      console.log('✅ Book appointment response:', response);
      
      if (response.success) {
        // Clear cached appointments to force refresh
        await StorageUtils.appointments.clearAppointmentsCache();
        
        return {
          success: true,
          appointment: response.data.appointment,
          message: response.message || 'Appointment booked successfully',
        };
      } else {
        throw new Error(response.message || 'Failed to book appointment');
      }
    } catch (error) {
      console.error('❌ Book appointment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to book appointment',
      };
    }
  },

  /**
   * Update an appointment
   */
  updateAppointment: async (appointmentId, updateData) => {
    try {
      console.log('✏️ Updating appointment:', appointmentId, updateData);
      
      const response = await apiService.put(
        API_ENDPOINTS.APPOINTMENTS.UPDATE(appointmentId), 
        updateData
      );
      
      console.log('✅ Update appointment response:', response);
      
      if (response.success) {
        // Clear cached appointments to force refresh
        await StorageUtils.appointments.clearAppointmentsCache();
        
        return {
          success: true,
          appointment: response.data.appointment,
          message: response.message || 'Appointment updated successfully',
        };
      } else {
        throw new Error(response.message || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('❌ Update appointment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update appointment',
      };
    }
  },

  /**
   * Cancel an appointment
   */
  cancelAppointment: async (appointmentId, reason = '') => {
    try {
      console.log('❌ Cancelling appointment:', appointmentId, 'Reason:', reason);
      
      const response = await apiService.put(
        API_ENDPOINTS.APPOINTMENTS.CANCEL(appointmentId),
        { reason }
      );
      
      console.log('✅ Cancel appointment response:', response);
      
      if (response.success) {
        // Clear cached appointments to force refresh
        await StorageUtils.appointments.clearAppointmentsCache();
        
        return {
          success: true,
          message: response.message || 'Appointment cancelled successfully',
        };
      } else {
        throw new Error(response.message || 'Failed to cancel appointment');
      }
    } catch (error) {
      console.error('❌ Cancel appointment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel appointment',
      };
    }
  },

  /**
   * Get appointment details by ID
   */
  getAppointmentDetails: async (appointmentId) => {
    try {
      console.log('📋 Getting appointment details:', appointmentId);
      
      const response = await apiService.get(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${appointmentId}`);
      
      console.log('✅ Appointment details response:', response);
      
      if (response.success) {
        return {
          success: true,
          appointment: response.data.appointment,
        };
      } else {
        throw new Error(response.message || 'Failed to get appointment details');
      }
    } catch (error) {
      console.error('❌ Get appointment details error:', error);
      return {
        success: false,
        appointment: null,
        error: error.message || 'Failed to get appointment details',
      };
    }
  },

  /**
   * Get available appointment slots
   */
  getAvailableSlots: async (doctorId, date) => {
    try {
      console.log('🕐 Getting available slots for doctor:', doctorId, 'on date:', date);
      
      const response = await apiService.get('/appointments/available-slots', {
        doctorId,
        date,
      });
      
      console.log('✅ Available slots response:', response);
      
      if (response.success) {
        return {
          success: true,
          slots: response.data.slots || [],
        };
      } else {
        throw new Error(response.message || 'Failed to get available slots');
      }
    } catch (error) {
      console.error('❌ Get available slots error:', error);
      return {
        success: false,
        slots: [],
        error: error.message || 'Failed to get available slots',
      };
    }
  },

  /**
   * Get doctors list
   */
  getDoctors: async () => {
    try {
      console.log('👨‍⚕️ Getting doctors list...');
      
      const response = await apiService.get('/doctor/appointments/doctors');
      
      console.log('✅ Doctors list response:', response);
      
      if (response.success) {
        return {
          success: true,
          doctors: response.data.doctors || [],
        };
      } else {
        throw new Error(response.message || 'Failed to get doctors list');
      }
    } catch (error) {
      console.error('❌ Get doctors error:', error);
      return {
        success: false,
        doctors: [],
        error: error.message || 'Failed to get doctors list',
      };
    }
  },

  /**
   * Confirm appointment attendance
   */
  confirmAttendance: async (appointmentId) => {
    try {
      console.log('✅ Confirming attendance for appointment:', appointmentId);
      
      const response = await apiService.post(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${appointmentId}/confirm`);
      
      console.log('✅ Confirm attendance response:', response);
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'Attendance confirmed successfully',
        };
      } else {
        throw new Error(response.message || 'Failed to confirm attendance');
      }
    } catch (error) {
      console.error('❌ Confirm attendance error:', error);
      return {
        success: false,
        error: error.message || 'Failed to confirm attendance',
      };
    }
  },

  /**
   * Join Zoom meeting
   */
  joinZoomMeeting: async (appointmentId) => {
    try {
      console.log('📹 Getting Zoom meeting details for appointment:', appointmentId);
      
      const response = await apiService.get(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${appointmentId}/zoom`);
      
      console.log('✅ Zoom meeting response:', response);
      
      if (response.success && response.data.zoomJoinUrl) {
        return {
          success: true,
          zoomJoinUrl: response.data.zoomJoinUrl,
          zoomPassword: response.data.zoomPassword,
          meetingId: response.data.zoomMeetingId,
        };
      } else {
        throw new Error(response.message || 'Zoom meeting not available');
      }
    } catch (error) {
      console.error('❌ Get Zoom meeting error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get Zoom meeting details',
      };
    }
  },

  /**
   * Rate appointment
   */
  rateAppointment: async (appointmentId, rating, review = '') => {
    try {
      console.log('⭐ Rating appointment:', appointmentId, 'Rating:', rating);
      
      const response = await apiService.post(`${API_ENDPOINTS.APPOINTMENTS.BASE}/${appointmentId}/rate`, {
        rating,
        review,
      });
      
      console.log('✅ Rate appointment response:', response);
      
      if (response.success) {
        return {
          success: true,
          message: response.message || 'Thank you for your feedback',
        };
      } else {
        throw new Error(response.message || 'Failed to submit rating');
      }
    } catch (error) {
      console.error('❌ Rate appointment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to submit rating',
      };
    }
  },

  /**
   * Get appointment statistics
   */
  getAppointmentStats: async (elderId) => {
    try {
      console.log('📊 Getting appointment statistics for elder:', elderId);
      
      const response = await apiService.get(`${API_ENDPOINTS.APPOINTMENTS.BASE}/stats`, {
        elderId,
      });
      
      console.log('✅ Appointment stats response:', response);
      
      if (response.success) {
        return {
          success: true,
          stats: response.data.stats,
        };
      } else {
        throw new Error(response.message || 'Failed to get appointment statistics');
      }
    } catch (error) {
      console.error('❌ Get appointment stats error:', error);
      return {
        success: false,
        stats: {
          total: 0,
          completed: 0,
          upcoming: 0,
          cancelled: 0,
        },
        error: error.message || 'Failed to get appointment statistics',
      };
    }
  },
};