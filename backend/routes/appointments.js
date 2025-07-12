// backend/routes/appointments.js
const express = require('express');
const router = express.Router();

// Import middleware - make sure this path is correct
const { authenticate } = require('../middleware/auth');

// Import models
const { User, Doctor, Appointment, Elder } = require('../models');
const { Op } = require('sequelize');

// Test route (no auth required for testing)
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Appointments route is working',
    timestamp: new Date().toISOString()
  });
});

// Get available doctors
router.get('/doctors', authenticate, async (req, res) => {
  try {
    console.log('🔄 Getting available doctors...');
    
    // Get doctors from doctors table with user info
    const doctors = await Doctor.findAll({
      where: {
        isActive: true
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email', 'profileImage', 'phone']
      }]
    });

    console.log(`✅ Found ${doctors.length} doctors`);

    // Transform the data for frontend
    const doctorsList = doctors.map(doctor => ({
      id: doctor.id,
      userId: doctor.userId,
      specialization: doctor.specialization,
      experience: doctor.experience,
      consultationFee: doctor.consultationFee,
      licenseNumber: doctor.licenseNumber,
      verificationStatus: doctor.verificationStatus,
      user: {
        firstName: doctor.user.firstName,
        lastName: doctor.user.lastName,
        email: doctor.user.email,
        profileImage: doctor.user.profileImage,
        phone: doctor.user.phone
      }
    }));

    res.json({
      success: true,
      doctors: doctorsList,
      count: doctorsList.length
    });

  } catch (error) {
    console.error('❌ Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available doctors',
      error: error.message
    });
  }
});

// Get doctor availability
router.get('/doctors/:doctorId/availability', authenticate, async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    // Generate available time slots (9 AM to 5 PM, 30-minute slots)
    const availableSlots = [];
    const startHour = 9;
    const endHour = 17;
    const slotDuration = 30;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        availableSlots.push({
          startTime: timeSlot,
          endTime: `${Math.floor((hour * 60 + minute + slotDuration) / 60).toString().padStart(2, '0')}:${((hour * 60 + minute + slotDuration) % 60).toString().padStart(2, '0')}`,
          available: true
        });
      }
    }

    res.json({
      success: true,
      date: date,
      doctorId: doctorId,
      availableSlots: availableSlots
    });

  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor availability',
      error: error.message
    });
  }
});

// Book appointment
router.post('/', authenticate, async (req, res) => {
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

    console.log('📝 Booking appointment:', {
      elderId,
      doctorId,
      appointmentDate,
      reason,
      familyMemberId: req.user.id
    });

    // Validate required fields
    if (!elderId || !doctorId || !appointmentDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: elderId, doctorId, appointmentDate, reason'
      });
    }

    // Create appointment
    const appointment = await Appointment.create({
      familyMemberId: req.user.id,
      elderId: elderId,
      doctorId: doctorId,
      appointmentDate: new Date(appointmentDate),
      duration: duration,
      type: type,
      priority: priority,
      reason: reason,
      symptoms: symptoms,
      notes: notes,
      status: 'pending'
    });

    console.log('✅ Appointment created:', appointment.id);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: appointment
    });

  } catch (error) {
    console.error('❌ Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message
    });
  }
});

// Get appointments for current user
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, date, doctorId } = req.query;
    const whereClause = {};

    // Filter by family member
    if (req.user.role === 'family_member') {
      whereClause.familyMemberId = req.user.id;
    }

    // Additional filters
    if (status) whereClause.status = status;
    if (date) {
      whereClause.appointmentDate = {
        [Op.between]: [
          new Date(date + 'T00:00:00.000Z'),
          new Date(date + 'T23:59:59.999Z')
        ]
      };
    }
    if (doctorId) whereClause.doctorId = doctorId;

    const appointments = await Appointment.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['firstName', 'lastName', 'dateOfBirth', 'gender']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email', 'profileImage']
          }]
        }
      ],
      order: [['appointmentDate', 'ASC']]
    });

    res.json({
      success: true,
      appointments: appointments,
      count: appointments.length
    });

  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

module.exports = router;




// backend/routes/index.js (Add to main router)
// Add these lines to your main route index file:

/*
const appointmentRoutes = require('./appointments');
const doctorAppointmentRoutes = require('./doctorAppointments');

// Family member appointment routes
app.use('/api/appointments', appointmentRoutes);

// Doctor appointment routes
app.use('/api/doctor', doctorAppointmentRoutes);
*/