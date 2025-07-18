// backend/controllers/appointmentController.js (Family Member Side)
const { 
  Appointment, 
  Elder, 
  Doctor, 
  User, 
  DoctorSchedule, 
  ScheduleException,
  AppointmentNotification,
  Subscription 
} = require('../models');
const { Op } = require('sequelize');
const ZoomService = require('../services/zoomService');
const NotificationService = require('../services/notificationService');

class AppointmentController {
  
  // Get available doctors
  static async getAvailableDoctors(req, res) {
    try {
      const doctors = await Doctor.findAll({
        where: { 
          isVerified: true,
          status: 'active' 
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email', 'profileImage']
          },
          {
            model: DoctorSchedule,
            as: 'schedules',
            where: { isAvailable: true },
            required: false
          }
        ],
        attributes: [
          'id', 'specialization', 'experience', 'consultationFee', 
          'rating', 'languages', 'about'
        ]
      });

      res.json({
        message: 'Available doctors retrieved successfully',
        doctors
      });
    } catch (error) {
      console.error('Get available doctors error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get doctor availability for a specific date
  static async getDoctorAvailability(req, res) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ message: 'Date is required' });
      }

      const requestedDate = new Date(date);
      const dayOfWeek = requestedDate.getDay();

      // Get doctor's schedule for the day
      const schedule = await DoctorSchedule.findOne({
        where: { 
          doctorId,
          dayOfWeek,
          isAvailable: true 
        }
      });

      if (!schedule) {
        return res.json({
          message: 'Doctor not available on this day',
          availableSlots: []
        });
      }

      // Check for schedule exceptions (holidays, breaks)
      const exception = await ScheduleException.findOne({
        where: {
          doctorId,
          date: requestedDate,
          isUnavailable: true
        }
      });

      if (exception) {
        return res.json({
          message: 'Doctor not available on this date',
          availableSlots: [],
          reason: exception.reason
        });
      }

      // Get existing appointments for the date
      const existingAppointments = await Appointment.findAll({
        where: {
          doctorId,
          appointmentDate: {
            [Op.between]: [
              new Date(date + ' 00:00:00'),
              new Date(date + ' 23:59:59')
            ]
          },
          status: {
            [Op.in]: ['pending', 'approved']
          }
        },
        attributes: ['appointmentDate', 'duration']
      });

      // Generate available time slots
      const availableSlots = this.generateAvailableSlots(
        schedule, 
        existingAppointments, 
        requestedDate
      );

      res.json({
        message: 'Doctor availability retrieved successfully',
        availableSlots,
        schedule: {
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          slotDuration: schedule.slotDuration
        }
      });
    } catch (error) {
      console.error('Get doctor availability error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Helper method to generate available slots
  static generateAvailableSlots(schedule, existingAppointments, date) {
    const slots = [];
    const startTime = new Date(`${date.toDateString()} ${schedule.startTime}`);
    const endTime = new Date(`${date.toDateString()} ${schedule.endTime}`);
    const slotDuration = schedule.slotDuration;

    let currentSlot = new Date(startTime);

    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot.getTime() + (slotDuration * 60000));
      
      // Check if slot conflicts with existing appointments
      const isConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.appointmentDate);
        const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.duration * 60000));
        
        return (currentSlot < appointmentEnd && slotEnd > appointmentStart);
      });

      // Only add slots that are in the future
      const now = new Date();
      if (!isConflict && currentSlot > now) {
        slots.push({
          startTime: currentSlot.toTimeString().slice(0, 5),
          endTime: slotEnd.toTimeString().slice(0, 5),
          available: true
        });
      }

      currentSlot = new Date(currentSlot.getTime() + (slotDuration * 60000));
    }

    return slots;
  }

  // Book appointment
  static async bookAppointment(req, res) {
    try {
      const {
        elderId,
        doctorId,
        appointmentDate,
        duration = 30,
        type = 'consultation',
        priority = 'medium',
        reason,
        symptoms,
        notes
      } = req.body;

      // Validate required fields
      if (!elderId || !doctorId || !appointmentDate || !reason) {
        return res.status(400).json({ 
          message: 'Elder ID, Doctor ID, appointment date, and reason are required' 
        });
      }

      // Verify elder belongs to the family member
      const elder = await Elder.findOne({
        where: { id: elderId },
        include: [
          {
            model: Subscription,
            as: 'subscription',
            where: { userId: req.user.id }
          }
        ]
      });

      if (!elder) {
        return res.status(404).json({ 
          message: 'Elder not found or access denied' 
        });
      }

      // Verify doctor exists and is available
      const doctor = await Doctor.findOne({
        where: { 
          id: doctorId,
          isVerified: true,
          status: 'active'
        }
      });

      if (!doctor) {
        return res.status(404).json({ 
          message: 'Doctor not found or not available' 
        });
      }

      // Check if the time slot is still available
      const requestedDate = new Date(appointmentDate);
      const dayOfWeek = requestedDate.getDay();

      const schedule = await DoctorSchedule.findOne({
        where: { 
          doctorId,
          dayOfWeek,
          isAvailable: true 
        }
      });

      if (!schedule) {
        return res.status(400).json({ 
          message: 'Doctor not available on the selected day' 
        });
      }

      // Check for conflicts
      const conflictingAppointment = await Appointment.findOne({
        where: {
          doctorId,
          appointmentDate: requestedDate,
          status: {
            [Op.in]: ['pending', 'approved']
          }
        }
      });

      if (conflictingAppointment) {
        return res.status(400).json({ 
          message: 'Time slot is no longer available' 
        });
      }

      // Create appointment
      const appointment = await Appointment.create({
        familyMemberId: req.user.id,
        elderId,
        doctorId,
        appointmentDate: requestedDate,
        duration,
        type,
        priority,
        reason,
        symptoms,
        notes,
        status: 'pending'
      });

      // Send notification to doctor
      await NotificationService.createAppointmentNotification({
        appointmentId: appointment.id,
        recipientId: doctor.userId,
        type: 'booking_confirmation',
        title: 'New Appointment Request',
        message: `New appointment request from ${elder.firstName} ${elder.lastName} for ${new Date(appointmentDate).toLocaleDateString()}`
      });

      // Send confirmation to family member
      await NotificationService.createAppointmentNotification({
        appointmentId: appointment.id,
        recipientId: req.user.id,
        type: 'booking_confirmation',
        title: 'Appointment Request Submitted',
        message: `Your appointment request for ${elder.firstName} ${elder.lastName} has been submitted for review`
      });

      // Fetch complete appointment data
      const completeAppointment = await Appointment.findByPk(appointment.id, {
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['firstName', 'lastName', 'photo']
          },
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName']
              }
            ]
          }
        ]
      });

      res.status(201).json({
        message: 'Appointment booked successfully',
        appointment: completeAppointment
      });
    } catch (error) {
      console.error('Book appointment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get family member's appointments
  static async getAppointments(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = { familyMemberId: req.user.id };
      if (status) {
        whereClause.status = status;
      }

      const appointments = await Appointment.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'photo', 'dateOfBirth']
          },
          {
            model: Doctor,
            as: 'doctor',
            attributes: ['id', 'specialization', 'consultationFee'],
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'profileImage']
              }
            ]
          }
        ],
        order: [['appointmentDate', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        message: 'Appointments retrieved successfully',
        appointments: appointments.rows,
        pagination: {
          total: appointments.count,
          page: parseInt(page),
          pages: Math.ceil(appointments.count / limit)
        }
      });
    } catch (error) {
      console.error('Get appointments error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get appointment details
  static async getAppointmentById(req, res) {
    try {
      const { appointmentId } = req.params;

      const appointment = await Appointment.findOne({
        where: { 
          id: appointmentId,
          familyMemberId: req.user.id 
        },
        include: [
          {
            model: Elder,
            as: 'elder'
          },
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'email', 'profileImage']
              }
            ]
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ 
          message: 'Appointment not found' 
        });
      }

      res.json({
        message: 'Appointment details retrieved successfully',
        appointment
      });
    } catch (error) {
      console.error('Get appointment by ID error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Cancel appointment
  static async cancelAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const { reason } = req.body;

      const appointment = await Appointment.findOne({
        where: { 
          id: appointmentId,
          familyMemberId: req.user.id 
        },
        include: [
          {
            model: Doctor,
            as: 'doctor'
          },
          {
            model: Elder,
            as: 'elder'
          }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ 
          message: 'Appointment not found' 
        });
      }

      if (appointment.status === 'completed' || appointment.status === 'cancelled') {
        return res.status(400).json({ 
          message: 'Cannot cancel this appointment' 
        });
      }

      // Update appointment status
      await appointment.update({
        status: 'cancelled',
        notes: reason || 'Cancelled by family member'
      });

      // Notify doctor
      await NotificationService.createAppointmentNotification({
        appointmentId: appointment.id,
        recipientId: appointment.doctor.userId,
        type: 'cancellation',
        title: 'Appointment Cancelled',
        message: `Appointment with ${appointment.elder.firstName} ${appointment.elder.lastName} has been cancelled`
      });

      res.json({
        message: 'Appointment cancelled successfully',
        appointment
      });
    } catch (error) {
      console.error('Cancel appointment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Reschedule appointment
  static async rescheduleAppointment(req, res) {
    try {
      const { appointmentId } = req.params;
      const { newDate, reason } = req.body;

      if (!newDate) {
        return res.status(400).json({ 
          message: 'New appointment date is required' 
        });
      }

      const appointment = await Appointment.findOne({
        where: { 
          id: appointmentId,
          familyMemberId: req.user.id 
        },
        include: [
          { model: Doctor, as: 'doctor' },
          { model: Elder, as: 'elder' }
        ]
      });

      if (!appointment) {
        return res.status(404).json({ 
          message: 'Appointment not found' 
        });
      }

      if (appointment.status !== 'pending' && appointment.status !== 'approved') {
        return res.status(400).json({ 
          message: 'Cannot reschedule this appointment' 
        });
      }

      // Check availability for new date
      const requestedDate = new Date(newDate);
      const conflictingAppointment = await Appointment.findOne({
        where: {
          doctorId: appointment.doctorId,
          appointmentDate: requestedDate,
          status: {
            [Op.in]: ['pending', 'approved']
          },
          id: { [Op.ne]: appointmentId }
        }
      });

      if (conflictingAppointment) {
        return res.status(400).json({ 
          message: 'New time slot is not available' 
        });
      }

      // Update appointment
      await appointment.update({
        appointmentDate: requestedDate,
        status: 'pending', // Reset to pending for doctor approval
        notes: `${appointment.notes || ''}\nRescheduled: ${reason || 'No reason provided'}`
      });

      // Notify doctor
      await NotificationService.createAppointmentNotification({
        appointmentId: appointment.id,
        recipientId: appointment.doctor.userId,
        type: 'reschedule',
        title: 'Appointment Rescheduled',
        message: `Appointment with ${appointment.elder.firstName} ${appointment.elder.lastName} has been rescheduled to ${requestedDate.toLocaleDateString()}`
      });

      res.json({
        message: 'Appointment rescheduled successfully',
        appointment
      });
    } catch (error) {
      console.error('Reschedule appointment error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Get elder's medical history summary for appointment
  static async getElderSummary(req, res) {
    try {
      const { elderId } = req.params;

      // Verify elder belongs to family member
      const elder = await Elder.findOne({
        where: { id: elderId },
        include: [
          {
            model: Subscription,
            as: 'subscription',
            where: { userId: req.user.id }
          }
        ]
      });

      if (!elder) {
        return res.status(404).json({ 
          message: 'Elder not found or access denied' 
        });
      }

      // Get recent appointments and medical history
      const recentAppointments = await Appointment.findAll({
        where: { 
          elderId,
          status: 'completed'
        },
        include: [
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName']
              }
            ]
          }
        ],
        order: [['appointmentDate', 'DESC']],
        limit: 5
      });

      res.json({
        message: 'Elder summary retrieved successfully',
        elder: {
          id: elder.id,
          firstName: elder.firstName,
          lastName: elder.lastName,
          dateOfBirth: elder.dateOfBirth,
          gender: elder.gender,
          bloodType: elder.bloodType,
          medicalHistory: elder.medicalHistory,
          currentMedications: elder.currentMedications,
          allergies: elder.allergies,
          chronicConditions: elder.chronicConditions
        },
        recentAppointments
      });
    } catch (error) {
      console.error('Get elder summary error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = AppointmentController;