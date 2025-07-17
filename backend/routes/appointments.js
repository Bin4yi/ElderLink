// backend/routes/appointments.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Family appointments route is working',
    timestamp: new Date().toISOString()
  });
});

// Get available doctors for appointment booking
router.get('/doctors', authenticate, authorize('family_member'), async (req, res) => {
  try {
    // Mock data for now - replace with actual database query
    const doctors = [
      {
        id: 1,
        specialization: 'General Medicine',
        experience: 15,
        consultationFee: 50,
        rating: 4.8,
        languages: ['English', 'Spanish'],
        user: {
          id: 101,
          firstName: 'John',
          lastName: 'Smith',
          email: 'dr.john@elderlink.com',
          profileImage: null
        }
      },
      {
        id: 2,
        specialization: 'Cardiology',
        experience: 20,
        consultationFee: 75,
        rating: 4.9,
        languages: ['English'],
        user: {
          id: 102,
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'dr.sarah@elderlink.com',
          profileImage: null
        }
      }
    ];

    res.json({
      success: true,
      message: 'Available doctors retrieved successfully',
      doctors: doctors
    });
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available doctors'
    });
  }
});

// Get doctor availability for specific date
router.get('/doctors/:doctorId/availability', authenticate, authorize('family_member'), async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    // Mock availability data - replace with actual database query
    const availableSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];

    res.json({
      success: true,
      message: 'Doctor availability retrieved successfully',
      availableSlots: availableSlots,
      date: date,
      doctorId: doctorId
    });
  } catch (error) {
    console.error('Error fetching doctor availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor availability'
    });
  }
});

// Book appointment (Family member)
router.post('/', authenticate, authorize('family_member'), async (req, res) => {
  try {
    const {
      elderId,
      doctorId,
      appointmentDate,
      reason,
      symptoms,
      notes,
      priority,
      type
    } = req.body;

    // Validate required fields
    if (!elderId || !doctorId || !appointmentDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: elderId, doctorId, appointmentDate, reason'
      });
    }

    // Mock appointment creation - replace with actual database insertion
    const newAppointment = {
      id: Date.now(), // Mock ID
      elderId,
      doctorId,
      familyMemberId: req.user.id,
      appointmentDate: new Date(appointmentDate),
      reason,
      symptoms,
      notes,
      priority: priority || 'medium',
      type: type || 'consultation',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('📅 New appointment created:', newAppointment);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: newAppointment
    });
  } catch (error) {
    console.error('Error booking appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment'
    });
  }
});

// Get family member's appointments
router.get('/', authenticate, authorize('family_member'), async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    // Mock appointments data - replace with actual database query
    const appointments = [
      {
        id: 1,
        elderId: 1,
        doctorId: 1,
        familyMemberId: req.user.id,
        appointmentDate: new Date('2024-01-15T10:00:00'),
        reason: 'Regular checkup',
        symptoms: 'Mild fatigue',
        notes: 'Monthly health monitoring',
        priority: 'medium',
        type: 'consultation',
        status: 'approved',
        elder: {
          id: 1,
          firstName: 'John',
          lastName: 'Elder',
          dateOfBirth: '1950-01-01',
          gender: 'male'
        },
        doctor: {
          id: 1,
          specialization: 'General Medicine',
          user: {
            id: 101,
            firstName: 'Dr. John',
            lastName: 'Smith'
          }
        }
      },
      {
        id: 2,
        elderId: 1,
        doctorId: 2,
        familyMemberId: req.user.id,
        appointmentDate: new Date('2024-01-20T14:30:00'),
        reason: 'Heart checkup',
        symptoms: 'Chest discomfort',
        notes: 'Follow-up appointment',
        priority: 'high',
        type: 'follow-up',
        status: 'pending',
        elder: {
          id: 1,
          firstName: 'John',
          lastName: 'Elder',
          dateOfBirth: '1950-01-01',
          gender: 'male'
        },
        doctor: {
          id: 2,
          specialization: 'Cardiology',
          user: {
            id: 102,
            firstName: 'Dr. Sarah',
            lastName: 'Johnson'
          }
        }
      }
    ];

    // Filter by status if provided
    let filteredAppointments = appointments;
    if (status && status !== 'all') {
      filteredAppointments = appointments.filter(apt => apt.status === status);
    }

    res.json({
      success: true,
      message: 'Appointments retrieved successfully',
      appointments: filteredAppointments,
      pagination: {
        total: filteredAppointments.length,
        page: parseInt(page),
        pages: Math.ceil(filteredAppointments.length / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments'
    });
  }
});

// Get appointment by ID
router.get('/:appointmentId', authenticate, authorize('family_member'), async (req, res) => {
  try {
    const { appointmentId } = req.params;

    // Mock appointment data - replace with actual database query
    const appointment = {
      id: parseInt(appointmentId),
      elderId: 1,
      doctorId: 1,
      familyMemberId: req.user.id,
      appointmentDate: new Date('2024-01-15T10:00:00'),
      reason: 'Regular checkup',
      symptoms: 'Mild fatigue',
      notes: 'Monthly health monitoring',
      priority: 'medium',
      type: 'consultation',
      status: 'approved',
      elder: {
        id: 1,
        firstName: 'John',
        lastName: 'Elder',
        dateOfBirth: '1950-01-01',
        gender: 'male'
      },
      doctor: {
        id: 1,
        specialization: 'General Medicine',
        user: {
          id: 101,
          firstName: 'Dr. John',
          lastName: 'Smith'
        }
      }
    };

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    res.json({
      success: true,
      message: 'Appointment retrieved successfully',
      appointment: appointment
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment'
    });
  }
});

// Cancel appointment
router.put('/:appointmentId/cancel', authenticate, authorize('family_member'), async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { reason } = req.body;

    // Mock cancellation - replace with actual database update
    console.log(`📅 Cancelling appointment ${appointmentId} with reason: ${reason}`);

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      appointmentId: appointmentId,
      cancellationReason: reason
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment'
    });
  }
});

module.exports = router;