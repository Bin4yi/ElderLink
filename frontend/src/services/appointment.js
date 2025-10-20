// frontend/src/services/appointment.js
import api from './api';

class AppointmentService {
  
  // Family Member Appointment Services
  
  
  // Get available doctors
  async getAvailableDoctors() {
    try {
      const response = await api.get('/appointments/doctors');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get doctor available dates
  async getDoctorAvailableDates(doctorId) {
    try {
      const response = await api.get(`/appointments/doctor/${doctorId}/available-dates`);
      return response.data.dates; // should be an array of date strings
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get doctor availability for specific date
  async getDoctorAvailability(doctorId, date) {
    try {
      const response = await api.get(`/appointments/doctor/${doctorId}/availability`, {
        params: { date }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Reserve time slot (locks for 10 minutes)
  async reserveTimeSlot(doctorId, appointmentDate) {
    try {
      const response = await api.post('/appointments/reserve-slot', {
        doctorId,
        appointmentDate
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Complete reservation with booking details
  async completeReservation(reservationId, bookingData) {
    try {
      const response = await api.post(`/appointments/reservations/${reservationId}/complete`, bookingData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cancel reservation
  async cancelReservation(reservationId) {
    try {
      const response = await api.delete(`/appointments/reservations/${reservationId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Book appointment
  async bookAppointment(appointmentData) {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get family member's appointments
  async getAppointments(params = {}) {
    try {
      const response = await api.get('/appointments', { params });
      return response.data.appointments || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get appointment by ID
  async getAppointmentById(appointmentId) {
    try {
      const response = await api.get(`/appointments/${appointmentId}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Cancel appointment
  async cancelAppointment(appointmentId, reason) {
    try {
      const response = await api.put(`/appointments/${appointmentId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

    // Reschedule appointment (shared for both doctor & family)
  async rescheduleAppointment(appointmentId, { newDateTime, reason }) {
    try {
      const response = await api.put(`/appointments/${appointmentId}/reschedule`, {
        newDateTime,
        reason
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }


  // Get elder summary for appointment
  async getElderSummary(elderId) {
    try {
      const response = await api.get(`/appointments/elders/${elderId}/summary`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Elder Appointment Services
  
  // Get elder's appointments (for elder role)
  async getElderAppointments(params = {}) {
    try {
      // Use the main appointments endpoint which already handles elder role
      const response = await api.get('/appointments', { params });
      return response.data.appointments || response.data || [];
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Doctor Appointment Services
  
  // Get doctor's appointments
  async getDoctorAppointments(params = {}) {
    try {
      const response = await api.get('/doctor/appointments', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Review appointment (approve/reject)
  async reviewAppointment(appointmentId, action, doctorNotes, rejectionReason) {
    try {
      const response = await api.put(`/doctor/appointments/${appointmentId}/review`, {
        action,
        doctorNotes,
        rejectionReason
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get elder medical summary for doctor
  async getElderMedicalSummary(elderId) {
    try {
      const response = await api.get(`/doctor/elders/${elderId}/summary`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Complete appointment
  async completeAppointment(appointmentId, consultationData) {
    try {
      const response = await api.put(`/doctor/appointments/${appointmentId}/complete`, consultationData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create prescription
  async createPrescription(consultationId, prescriptionData) {
    try {
      const response = await api.post(`/doctor/consultations/${consultationId}/prescription`, prescriptionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get consultation records
  async getConsultationRecords(params = {}) {
    try {
      const response = await api.get('/doctor/consultations', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Update doctor schedule
  async updateDoctorSchedule(schedules) {
    try {
      const response = await api.put('/doctor/schedule', { schedules });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Add schedule exception
  async addScheduleException(exceptionData) {
    try {
      const response = await api.post('/doctor/schedule/exceptions', exceptionData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Get doctor dashboard stats
  async getDoctorDashboardStats() {
    try {
      const response = await api.get('/doctor/dashboard/stats');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Notification Services

  // Get user notifications
  async getNotifications(params = {}) {
    try {
      const response = await api.get('/notifications', { params });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark notification as read
  async markNotificationAsRead(notificationId) {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead() {
    try {
      const response = await api.put('/notifications/mark-all-read');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Utility methods
  
  // Format appointment date for display
  formatAppointmentDate(date) {
    const appointmentDate = new Date(date);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const dateStr = appointmentDate.toLocaleDateString();
    const timeStr = appointmentDate.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    if (appointmentDate.toDateString() === today.toDateString()) {
      return `Today at ${timeStr}`;
    } else if (appointmentDate.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${timeStr}`;
    } else {
      return `${dateStr} at ${timeStr}`;
    }
  }

  // Get appointment status color
  getStatusColor(status) {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      approved: 'text-green-600 bg-green-100',
      rejected: 'text-red-600 bg-red-100',
      completed: 'text-blue-600 bg-blue-100',
      cancelled: 'text-gray-600 bg-gray-100',
      'no-show': 'text-orange-600 bg-orange-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  }

  // Get priority color
  getPriorityColor(priority) {
    const colors = {
      low: 'text-green-600 bg-green-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      urgent: 'text-red-600 bg-red-100'
    };
    return colors[priority] || 'text-gray-600 bg-gray-100';
  }

  // Check if appointment can be cancelled
  canCancelAppointment(appointment) {
    const now = new Date();
    const appointmentDate = new Date(appointment.appointmentDate);
    const hoursDifference = (appointmentDate - now) / (1000 * 60 * 60);
    
    return (
      ['pending', 'approved'].includes(appointment.status) &&
      hoursDifference > 2 // Can cancel if more than 2 hours before
    );
  }

  // Check if appointment can be rescheduled
  canRescheduleAppointment(appointment) {
    const now = new Date();
    const appointmentDate = new Date(appointment.appointmentDate);
    const hoursDifference = (appointmentDate - now) / (1000 * 60 * 60);
    
    return (
      ['pending', 'approved'].includes(appointment.status) &&
      hoursDifference > 24 // Can reschedule if more than 24 hours before
    );
  }

  // Generate time slots for a given date range
  generateTimeSlots(startTime, endTime, duration = 30) {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    let current = new Date(start);
    
    while (current < end) {
      const slotEnd = new Date(current.getTime() + (duration * 60000));
      if (slotEnd <= end) {
        slots.push({
          startTime: current.toTimeString().slice(0, 5),
          endTime: slotEnd.toTimeString().slice(0, 5),
          available: true
        });
      }
      current = new Date(current.getTime() + (duration * 60000));
    }
    
    return slots;
  }

  // Error handling
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'An error occurred';
      return new Error(message);
    } else if (error.request) {
      // Request was made but no response received
      return new Error('Network error. Please check your connection.');
    } else {
      // Something else happened
      return new Error('An unexpected error occurred');
    }
  }
}

export const appointmentService = new AppointmentService();

// Export individual methods for convenience
export const {
  getAvailableDoctors,
  getDoctorAvailableDates,
  getDoctorAvailability,
  bookAppointment,
  getAppointments,
  getAppointmentById,
  cancelAppointment,
  rescheduleAppointment,
  getElderSummary,
  getElderAppointments,
  getDoctorAppointments,
  reviewAppointment,
  getElderMedicalSummary,
  completeAppointment,
  createPrescription,
  getConsultationRecords,
  updateDoctorSchedule,
  addScheduleException,
  getDoctorDashboardStats,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  formatAppointmentDate,
  getStatusColor,
  getPriorityColor,
  canCancelAppointment,
  canRescheduleAppointment,
  generateTimeSlots
} = appointmentService;