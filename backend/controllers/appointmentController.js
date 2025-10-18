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
          // 'qualifications', 
          'consultationFee',
          // 'rating', // <-- REMOVE or comment out this line
          // 'about',
          // 'languages'
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

      console.log(`🔍 Checking availability for doctor ${doctorId} on ${date}`);

      if (!date) {
        return res.status(400).json({ 
          success: false,
          message: 'Date is required' 
        });
      }

      // Get all schedules for this doctor on this date
      const schedules = await DoctorSchedule.findAll({
        where: {
          doctorId,
          date: date,
          isAvailable: true
        }
      });

      console.log(`📅 Found ${schedules.length} schedule(s) for this date`);

      if (schedules.length === 0) {
        return res.json({
          success: true,
          availableSlots: [],
          message: 'Doctor is not available on this date'
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
            [Op.in]: ['upcoming', 'today', 'in-progress', 'reserved']
          }
        }
      });

      console.log(`📋 Found ${existingAppointments.length} existing appointment(s)`);

      // Generate available slots for all schedules
      let allSlots = [];
      for (const schedule of schedules) {
        const slots = AppointmentController.generateAvailableSlots(
          schedule, 
          existingAppointments, 
          new Date(date)
        );
        allSlots = allSlots.concat(slots);
      }

      // Sort slots by time
      allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

      console.log(`✅ Generated ${allSlots.length} available slot(s)`);

      res.json({
        success: true,
        availableSlots: allSlots
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
      
      console.log(`🔍 Fetching available dates for doctor ${doctorId}`);
      
      const availableDates = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check next 30 days
      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        // Check if doctor has schedule for this day
        const scheduleCount = await DoctorSchedule.count({
          where: {
            doctorId,
            date: dateStr,
            isAvailable: true
          }
        });
        
        if (scheduleCount > 0) {
          availableDates.push(dateStr);
        }
      }
      
      console.log(`✅ Found ${availableDates.length} available date(s)`);
      
      res.json({
        success: true,
        dates: availableDates
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
    console.log(`🔧 Generating slots for schedule:`, {
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      slotDuration: schedule.slotDuration,
      date: date
    });

    // Ensure date is a Date object
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    const slots = [];
    
    // Parse time strings properly
    const dateStr = date.toISOString().split('T')[0];
    const startTime = new Date(`${dateStr}T${schedule.startTime}`);
    const endTime = new Date(`${dateStr}T${schedule.endTime}`);
    const slotDuration = schedule.slotDuration || 30; // Default 30 minutes

    console.log(`⏰ Time range: ${startTime} to ${endTime}`);

    let currentSlot = new Date(startTime);
    const now = new Date();

    while (currentSlot < endTime) {
      const slotEnd = new Date(currentSlot.getTime() + (slotDuration * 60000));
      
      // Only add slots that are in the future
      if (currentSlot > now) {
        // Check if slot conflicts with existing appointments
        const conflictingAppointment = existingAppointments.find(appointment => {
          const appointmentStart = new Date(appointment.appointmentDate);
          const appointmentEnd = new Date(appointmentStart.getTime() + ((appointment.duration || 30) * 60000));
          
          return (currentSlot < appointmentEnd && slotEnd > appointmentStart);
        });

        let status = 'available';
        
        if (conflictingAppointment) {
          if (conflictingAppointment.status === 'reserved') {
            // Check if reservation has expired
            const reservedAt = new Date(conflictingAppointment.reservedAt);
            const expiresAt = new Date(reservedAt.getTime() + (10 * 60000)); // 10 minutes
            if (new Date() < expiresAt) {
              status = 'reserved';
            }
          } else {
            status = 'booked';
          }
        }
        
        slots.push({
          startTime: currentSlot.toTimeString().slice(0, 5),
          endTime: slotEnd.toTimeString().slice(0, 5),
          status
        });
      }

      currentSlot = new Date(currentSlot.getTime() + (slotDuration * 60000));
    }

    console.log(`✅ Generated ${slots.length} slots`);
    return slots;
  }

  // Reserve time slot (locks for 10 minutes)
  static async reserveTimeSlot(req, res) {
    try {
      const { doctorId, appointmentDate } = req.body;

      console.log('🔒 Reserving time slot:', { 
        doctorId, 
        appointmentDate, 
        userId: req.user.id,
        userRole: req.user.role 
      });

      if (!doctorId || !appointmentDate) {
        return res.status(400).json({ 
          success: false,
          message: 'Doctor ID and appointment date are required' 
        });
      }

      // Check if slot is already reserved or booked
      const existingAppointment = await Appointment.findOne({
        where: {
          doctorId,
          appointmentDate: new Date(appointmentDate),
          status: {
            [Op.in]: ['upcoming', 'today', 'in-progress', 'reserved']
          }
        }
      });

      if (existingAppointment) {
        if (existingAppointment.status === 'reserved') {
          // Check if reservation has expired
          const reservedAt = new Date(existingAppointment.reservedAt);
          const expiresAt = new Date(reservedAt.getTime() + (10 * 60000)); // 10 minutes
          
          if (new Date() < expiresAt) {
            console.log('⚠️  Slot already reserved, expires at:', expiresAt);
            return res.status(400).json({
              success: false,
              message: 'This time slot is currently reserved by another user'
            });
          }
          // If expired, delete the old reservation
          console.log('🗑️  Deleting expired reservation');
          await existingAppointment.destroy();
        } else {
          console.log('⚠️  Slot already booked');
          return res.status(400).json({
            success: false,
            message: 'This time slot is already booked'
          });
        }
      }

      // Get doctor's current consultation fee
      const doctor = await Doctor.findByPk(doctorId);
      const consultationFee = doctor ? doctor.consultationFee : null;

      // Create a temporary reservation
      // familyMemberId is the user's ID (not a separate table)
      const reservation = await Appointment.create({
        doctorId,
        appointmentDate: new Date(appointmentDate),
        status: 'reserved',
        reservedAt: new Date(),
        reservedBy: req.user.id,
        familyMemberId: req.user.id, // Family member is the logged-in user
        duration: 30,
        type: 'consultation',
        priority: 'medium',
        consultationFee: consultationFee // Record doctor's fee at booking time
        // reason, elderId, symptoms, notes will be added when completing reservation
      });

      console.log('✅ Reservation created:', reservation.id);

      // Set expiry time (10 minutes from now)
      const expiresAt = new Date(Date.now() + (10 * 60000));

      res.json({
        success: true,
        reservation: {
          id: reservation.id,
          expiresAt,
          remainingSeconds: 600 // 10 minutes in seconds
        },
        message: 'Time slot reserved for 10 minutes'
      });
    } catch (error) {
      console.error('❌ Error reserving time slot:', error);
      console.error('   Error details:', error.message);
      console.error('   Stack:', error.stack);
      res.status(500).json({ 
        success: false,
        message: 'Failed to reserve time slot',
        error: error.message 
      });
    }
  }

  // Complete reservation with booking details
  static async completeReservation(req, res) {
    try {
      const { reservationId } = req.params;
      const {
        elderId,
        duration = 30,
        type = 'consultation',
        priority = 'medium',
        reason,
        symptoms,
        notes
      } = req.body;

      console.log('🔄 Completing reservation:', { 
        reservationId, 
        elderId, 
        reason,
        userId: req.user.id 
      });

      if (!elderId || !reason) {
        return res.status(400).json({ 
          success: false,
          message: 'Elder ID and reason are required' 
        });
      }

      // Find the reservation
      const reservation = await Appointment.findByPk(reservationId);
      
      if (!reservation) {
        console.log('❌ Reservation not found:', reservationId);
        return res.status(404).json({ 
          success: false,
          message: 'Reservation not found' 
        });
      }

      console.log('📋 Reservation details:', {
        id: reservation.id,
        status: reservation.status,
        reservedBy: reservation.reservedBy,
        reservedAt: reservation.reservedAt,
        currentUser: req.user.id
      });

      if (reservation.status !== 'reserved') {
        console.log('❌ Invalid status:', reservation.status, '(expected: reserved)');
        return res.status(400).json({ 
          success: false,
          message: `Invalid reservation status: ${reservation.status}. Expected: reserved` 
        });
      }

      // Check if reservation has expired
      const reservedAt = new Date(reservation.reservedAt);
      const expiresAt = new Date(reservedAt.getTime() + (10 * 60000));
      const now = new Date();
      
      console.log('⏰ Time check:', {
        reservedAt,
        expiresAt,
        now,
        expired: now >= expiresAt
      });
      
      if (now >= expiresAt) {
        console.log('❌ Reservation expired');
        await reservation.destroy();
        return res.status(400).json({
          success: false,
          message: 'Reservation has expired. Please select a new time slot.'
        });
      }

      // Check if user is the one who reserved this slot
      if (reservation.reservedBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only complete your own reservations'
        });
      }

      // Get family member ID
      const familyMemberId = req.user.role === 'family_member' ? req.user.id : null;

      console.log('💾 Updating reservation to pending appointment...');

      // Update reservation to pending appointment
      await reservation.update({
        elderId,
        familyMemberId,
        duration,
        type,
        priority,
        reason,
        symptoms,
        notes,
        status: 'pending',
        reservedAt: null,
        reservedBy: null
      });

      console.log('✅ Reservation updated to pending appointment');

      // Fetch the complete appointment with relations
      const completeAppointment = await Appointment.findByPk(reservation.id, {
        include: [
          {
            model: Elder,
            as: 'elder',
            attributes: ['id', 'firstName', 'lastName', 'phone', 'dateOfBirth', 'gender']
          },
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['firstName', 'lastName', 'email']
              }
            ]
          }
        ]
      });

      res.json({
        success: true,
        appointment: completeAppointment,
        message: 'Appointment booked successfully'
      });
    } catch (error) {
      console.error('❌ Error completing reservation:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to complete reservation',
        error: error.message 
      });
    }
  }

  // Cancel reservation
  static async cancelReservation(req, res) {
    try {
      const { reservationId } = req.params;

      const reservation = await Appointment.findByPk(reservationId);
      
      if (!reservation) {
        return res.status(404).json({ 
          success: false,
          message: 'Reservation not found' 
        });
      }

      if (reservation.status !== 'reserved') {
        return res.status(400).json({ 
          success: false,
          message: 'Can only cancel reserved slots' 
        });
      }

      // Check if user is the one who reserved this slot
      if (reservation.reservedBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only cancel your own reservations'
        });
      }

      await reservation.destroy();

      res.json({
        success: true,
        message: 'Reservation cancelled successfully'
      });
    } catch (error) {
      console.error('❌ Error cancelling reservation:', error);
      res.status(500).json({ 
        success: false,
        message: 'Failed to cancel reservation',
        error: error.message 
      });
    }
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

      // Get doctor's current consultation fee
      const doctorData = await Doctor.findByPk(doctorId);
      const consultationFee = doctorData ? doctorData.consultationFee : null;

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
        status: 'pending',
        consultationFee: consultationFee // Record doctor's fee at booking time
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
        status: 'upcoming' // Rescheduled appointments go back to upcoming
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