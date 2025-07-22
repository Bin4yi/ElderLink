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
const { sequelize } = require('../models');
// const ZoomService = require('../services/zoomService');
// const notificationService = require('../services/notificationService');

class AppointmentController {
  
  // Get available doctors, optionally filtered by specialization
  static async getAvailableDoctors(req, res) {
    try {
      const { specialization } = req.query;
      const where = {
        isActive: true,
        verificationStatus: 'Verified'
      };
      if (specialization && specialization !== 'all') {
        where.specialization = specialization;
      }
      const doctors = await Doctor.findAll({
        where: {
          isActive: true // Only filter by isActive, or remove this too if you want ALL doctors
        },
        include: [{ model: User, as: 'user' }]
      });

      // Get unique specializations for tags
      const specializations = await Doctor.findAll({
        attributes: [[sequelize.fn('DISTINCT', sequelize.col('specialization')), 'specialization']]
      });

      res.json({
        message: 'Available doctors retrieved successfully',
        doctors,
        specializations: specializations.map(s => s.specialization)
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
      if (!date) return res.status(400).json({ message: 'Date is required' });

      // Get all available slots for the date
      const schedules = await DoctorSchedule.findAll({
        where: { doctorId, date, isAvailable: true }
      });

      // Get appointments for this doctor/date
      const appointments = await Appointment.findAll({
        where: {
          doctorId,
          appointmentDate: {
            [Op.between]: [
              new Date(date + 'T00:00:00'),
              new Date(date + 'T23:59:59')
            ]
          }
        },
        attributes: ['appointmentDate', 'isBlocked', 'blockedUntil', 'paymentStatus', 'status']
      });

      // Build slot status
      const slots = schedules.map(slot => {
        const slotAppointment = appointments.find(app => {
          const appTime = new Date(app.appointmentDate).toTimeString().slice(0, 5);
          return appTime === slot.startTime;
        });
        let status = 'available';
        if (slotAppointment) {
          if (slotAppointment.status === 'approved' || slotAppointment.paymentStatus === 'completed') {
            status = 'booked';
          } else if (slotAppointment.isBlocked && slotAppointment.blockedUntil > new Date()) {
            status = 'reserved';
          }
        }
        return { startTime: slot.startTime, endTime: slot.endTime, status };
      });

      res.json({ availableSlots: slots });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch doctor availability' });
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
        duration = 60,
        type = 'consultation',
        priority = 'medium',
        reason,
        symptoms,
        notes
      } = req.body;

      if (!elderId || !doctorId || !appointmentDate || !reason) {
        return res.status(400).json({ 
          message: 'Elder ID, Doctor ID, appointment date, and reason are required' 
        });
      }

      // Release expired blocks before checking
      await Appointment.update(
        { isBlocked: false, blockedUntil: null, paymentStatus: 'expired' },
        {
          where: {
            isBlocked: true,
            blockedUntil: { [Op.lt]: new Date() },
            paymentStatus: 'pending'
          }
        }
      );

      // Check for conflicts
      const slotTime = new Date(appointmentDate).toTimeString().slice(0, 5);
      const dateStr = new Date(appointmentDate).toISOString().slice(0, 10);

      const conflicting = await Appointment.findOne({
        where: {
          doctorId,
          appointmentDate: {
            [Op.between]: [
              new Date(dateStr + 'T' + slotTime + ':00'),
              new Date(dateStr + 'T' + slotTime + ':59')
            ]
          },
          [Op.or]: [
            { status: 'approved' },
            { paymentStatus: 'completed' },
            {
              isBlocked: true,
              blockedUntil: { [Op.gt]: new Date() },
              paymentStatus: 'pending'
            }
          ]
        }
      });

      if (conflicting) {
        return res.status(400).json({ message: 'Time slot is not available' });
      }

      // Block slot for 15 minutes
      const blockedUntil = new Date(Date.now() + 15 * 60 * 1000);

      const appointment = await Appointment.create({
        familyMemberId: req.user.id,
        elderId,
        doctorId,
        appointmentDate: new Date(appointmentDate),
        duration,
        type,
        priority,
        reason,
        symptoms,
        notes,
        status: 'pending',
        isBlocked: true,
        blockedUntil,
        paymentStatus: 'pending'
      });

      res.status(201).json({
        message: 'Appointment slot reserved. Complete payment within 15 minutes.',
        appointment
      });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  // Confirm payment for appointment
  static async confirmPayment(req, res) {
    try {
      const { appointmentId } = req.params;
      const { paymentMethod, transactionId } = req.body;

      // Validate request
      if (!paymentMethod || !transactionId) {
        return res.status(400).json({ message: 'Payment method and transaction ID are required' });
      }

      // Find appointment
      const appointment = await Appointment.findOne({
        where: {
          id: appointmentId,
          familyMemberId: req.user.id,
          status: 'pending'
        }
      });

      if (!appointment) {
        return res.status(404).json({ message: 'Appointment not found or already processed' });
      }

      // Update appointment status and payment details
      await appointment.update({
        status: 'approved',
        paymentStatus: 'completed',
        transactionId
      });

      // Notify doctor and family member
      await NotificationService.createAppointmentNotification({
        appointmentId: appointment.id,
        recipientId: appointment.doctor.userId,
        type: 'payment_confirmation',
        title: 'Appointment Payment Confirmed',
        message: `Payment for appointment with ${appointment.elder.firstName} ${appointment.elder.lastName} has been confirmed`
      });

      await NotificationService.createAppointmentNotification({
        appointmentId: appointment.id,
        recipientId: req.user.id,
        type: 'payment_confirmation',
        title: 'Payment Successful',
        message: `Your payment for the appointment has been successfully processed`
      });

      res.json({ message: 'Payment confirmed successfully' });
    } catch (error) {
      console.error('Confirm payment error:', error);
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

  // Get doctor available dates
  static async getDoctorAvailableDates(req, res) {
    try {
      const { doctorId } = req.params;
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 31);

      // Find all dates with at least one available slot
      const schedules = await DoctorSchedule.findAll({
        where: {
          doctorId,
          date: { [Op.between]: [today, endDate] },
          isAvailable: true
        }
      });

      // Only unique dates
      const availableDates = [...new Set(schedules.map(sch => sch.date))];

      res.json({ availableDates });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch available dates' });
    }
  }
}

module.exports = AppointmentController;