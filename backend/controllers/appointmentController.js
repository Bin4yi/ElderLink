// backend/controllers/appointmentController.js
const { Appointment, User, Doctor, Elder, FamilyMember, DoctorSchedule } = require('../models');
const { Op } = require('sequelize');

class AppointmentController {
  
  // Get available doctors
  static async getAvailableDoctors(req, res) {
    try {
      const { specialization } = req.query;
      
      const whereClause = specialization && specialization !== 'all' 
        ? { specialization } 
        : {};

      const doctors = await Doctor.findAll({

        where: whereClause,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profileImage']
          }
        ],
        attributes: [
          'id', 
          'specialization', 
          'experience', 
          'qualifications', 
          'consultationFee',
          'rating',
          'about',
          'languages'
        ]

      });

      console.log('✅ Found doctors:', doctors.length);
      
      res.json({
        success: true,
        doctors: doctors || []
      });
    } catch (error) {
      console.error('❌ Error fetching doctors:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch available doctors',
        error: error.message 
      });
    }
  }

  // Get doctor availability for specific date
  static async getDoctorAvailability(req, res) {
    try {
      const { doctorId } = req.params;
      const { date } = req.query;

      if (!date) {
        return res.status(400).json({ 
          success: false,
          message: 'Date is required' 
        });
      }

      const requestedDate = new Date(date);
      const dayOfWeek = requestedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

      // Get doctor's schedule for the requested day
      const schedule = await DoctorSchedule.findOne({
        where: {
          doctorId,
          dayOfWeek,
          isActive: true
        }
      });

      if (!schedule) {
        return res.json({
          success: true,
          availableSlots: [],
          message: 'Doctor is not available on this day'
        });
      }

      // Get existing appointments for this date
      const startOfDay = new Date(date + 'T00:00:00');
      const endOfDay = new Date(date + 'T23:59:59');

      const existingAppointments = await Appointment.findAll({
        where: {
          doctorId,
          appointmentDate: {
            [Op.between]: [startOfDay, endOfDay]
          },
          status: {
            [Op.in]: ['pending', 'approved']
          }
        }
      });

      // Generate available slots
      const availableSlots = AppointmentController.generateAvailableSlots(
        schedule, 
        existingAppointments, 
        requestedDate
      );

      res.json({
        success: true,
        availableSlots
      });
    } catch (error) {
      console.error('❌ Error fetching doctor availability:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch doctor availability',
        error: error.message 
      });
    }
  }

  // Get doctor's available dates (next 30 days)
  static async getDoctorAvailableDates(req, res) {
    try {
      const { doctorId } = req.params;
      
      const availableDates = [];
      const today = new Date();
      
      // Check next 30 days
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dayOfWeek = checkDate.getDay();
        
        // Check if doctor has schedule for this day
        const schedule = await DoctorSchedule.findOne({
          where: {
            doctorId,
            dayOfWeek,
            isActive: true
          }
        });
        
        if (schedule) {
          availableDates.push(checkDate.toISOString().split('T')[0]);
        }
      }
      
      res.json({
        success: true,
        availableDates
      });
    } catch (error) {
      console.error('❌ Error fetching available dates:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch available dates',
        error: error.message 
      });
    }
  }

  // Helper method to generate available slots
  static generateAvailableSlots(schedule, existingAppointments, date) {
    const slots = [];
    const startTime = new Date(`${date.toDateString()} ${schedule.startTime}`);
    const endTime = new Date(`${date.toDateString()} ${schedule.endTime}`);
    const slotDuration = schedule.slotDuration || 30; // Default 30 minutes

    let currentSlot = new Date(startTime);

    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot.getTime() + (slotDuration * 60000));
      
      // Check if slot conflicts with existing appointments
      const isConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.appointmentDate);
        const appointmentEnd = new Date(appointmentStart.getTime() + ((appointment.duration || 30) * 60000));
        
        return (currentSlot < appointmentEnd && slotEnd > appointmentStart);
      });

      // Only add slots that are in the future
      const now = new Date();
      if (!isConflict && currentSlot > now) {
        slots.push({
          startTime: currentSlot.toTimeString().slice(0, 5),
          endTime: slotEnd.toTimeString().slice(0, 5),
          status: 'available'
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

      console.log('📋 Booking appointment with data:', {
        elderId, doctorId, appointmentDate, duration, type, priority, reason, symptoms, notes
      });

      if (!elderId || !doctorId || !appointmentDate || !reason) {
        return res.status(400).json({ 
          success: false,
          message: 'Elder ID, Doctor ID, appointment date, and reason are required' 
        });
      }

      // Check if elder exists
      const elder = await Elder.findByPk(elderId);
      if (!elder) {
        return res.status(404).json({ 
          success: false,
          message: 'Elder not found' 
        });
      }

      // Check if doctor exists
      const doctor = await Doctor.findByPk(doctorId);
      if (!doctor) {
        return res.status(404).json({ 
          success: false,
          message: 'Doctor not found' 
        });
      }

      // Get family member ID from authenticated user
      const familyMemberId = req.user.role === 'family_member' ? req.user.id : null;

      // Create appointment
      const appointment = await Appointment.create({
        elderId,
        doctorId,
        familyMemberId,
        appointmentDate: new Date(appointmentDate),
        duration,
        type,
        priority,
        reason,
        symptoms,
        notes,
        status: 'pending'
      });

      // Fetch the complete appointment with relations
      const completeAppointment = await Appointment.findByPk(appointment.id, {
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'email']
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
          },
          {
            model: FamilyMember,
            as: 'familyMember',
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

      console.log('✅ Appointment created successfully:', appointment.id);

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        appointment: completeAppointment
      });
    } catch (error) {
      console.error('❌ Error booking appointment:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to book appointment',
        error: error.message 
      });
    }
  }

  // Get appointments for family member
  static async getAppointments(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (req.user.role === 'family_member') {
        whereClause.familyMemberId = req.user.id;
      } else if (req.user.role === 'elder') {
        whereClause.elderId = req.user.id;
      }

      if (status) {
        whereClause.status = status;
      }

      const appointments = await Appointment.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'photo']
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
        ],
        order: [['appointmentDate', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        appointments: appointments.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(appointments.count / limit),
          totalItems: appointments.count,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch appointments',
        error: error.message 
      });
    }
  }

  // Get appointment by ID
  static async getAppointmentById(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findByPk(id, {
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
                attributes: ['firstName', 'lastName']
              }
            ]
          },
          {
            model: FamilyMember,
            as: 'familyMember',
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

      if (!appointment) {
        return res.status(404).json({ 
          success: false,
          message: 'Appointment not found' 
        });
      }

      res.json({
        success: true,
        appointment
      });
    } catch (error) {
      console.error('❌ Error fetching appointment:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch appointment',
        error: error.message 
      });
    }
  }

  // Cancel appointment
  static async cancelAppointment(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ 
          success: false,
          message: 'Appointment not found' 
        });
      }

      await appointment.update({
        status: 'cancelled',
        cancellationReason: reason
      });

      res.json({
        success: true,
        message: 'Appointment cancelled successfully',
        appointment
      });
    } catch (error) {
      console.error('❌ Error cancelling appointment:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to cancel appointment',
        error: error.message 
      });
    }
  }

  // Reschedule appointment
  static async rescheduleAppointment(req, res) {
    try {
      const { id } = req.params;
      const { newDateTime, reason } = req.body;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ 
          success: false,
          message: 'Appointment not found' 
        });
      }

      await appointment.update({
        appointmentDate: new Date(newDateTime),
        rescheduleReason: reason,
        status: 'approved' // Assuming rescheduled appointments are approved
      });

      res.json({
        success: true,
        message: 'Appointment rescheduled successfully',
        appointment
      });
    } catch (error) {
      console.error('❌ Error rescheduling appointment:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to reschedule appointment',
        error: error.message 
      });
    }
  }

  // Confirm payment
  static async confirmPayment(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findByPk(id);
      if (!appointment) {
        return res.status(404).json({ 
          success: false,
          message: 'Appointment not found' 
        });
      }

      await appointment.update({
        paymentStatus: 'completed'
      });

      res.json({
        success: true,
        message: 'Payment confirmed successfully',
        appointment
      });
    } catch (error) {
      console.error('❌ Error confirming payment:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to confirm payment',
        error: error.message 
      });
    }
  }

  // Get elder summary
  static async getElderSummary(req, res) {
    try {
      const { elderId } = req.params;

      const elder = await Elder.findByPk(elderId);
      if (!elder) {
        return res.status(404).json({ 
          success: false,
          message: 'Elder not found' 
        });
      }

      // Get recent appointments
      const recentAppointments = await Appointment.findAll({
        where: { elderId },
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
        success: true,
        elder,
        recentAppointments
      });
    } catch (error) {
      console.error('❌ Error fetching elder summary:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to fetch elder summary',
        error: error.message 
      });
    }
  }
}

module.exports = AppointmentController;