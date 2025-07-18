// backend/routes/appointments.js
const express = require('express');
const router = express.Router();
const AppointmentController = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Family appointments route is working',
    timestamp: new Date().toISOString()
  });
});

// Get available doctors (with specialization filter)
router.get('/doctors', authenticate, AppointmentController.getAvailableDoctors);

// Get doctor availability for a specific date
router.get('/doctors/:doctorId/availability', authenticate, AppointmentController.getDoctorAvailability);
router.get('/doctors/:doctorId/available-dates', authenticate, AppointmentController.getDoctorAvailableDates);

// Book appointment (with slot blocking)
router.post('/', authenticate, authorize('family_member'), AppointmentController.bookAppointment);
router.post('/:appointmentId/confirm-payment', authenticate, authorize('family_member'), AppointmentController.confirmPayment);

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

// Reschedule Appointment
router.put('/:id/reschedule', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { newDateTime, reason } = req.body;

    if (!newDateTime) {
      return res.status(400).json({ message: 'New appointment date/time is required' });
    }

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Optional: Prevent rescheduling within 24 hours
    const now = new Date();
    const newDate = new Date(newDateTime);
    const hoursDiff = (newDate - now) / (1000 * 60 * 60);
    if (hoursDiff < 24) {
      return res.status(400).json({ message: 'Cannot reschedule less than 24 hours before appointment' });
    }

    const previousDate = appointment.appointmentDate;

    // Update appointmentDate (and optionally updatedAt or add to logs)
    appointment.appointmentDate = newDateTime;
    await appointment.save();

    // Optionally, log the reschedule action (if you have a log model/table)
    // await AppointmentLog.create({ appointmentId: id, action: 'reschedule', previousDate, newDate: newDateTime, reason, userId: req.user.id });

    res.json({ success: true, message: 'Appointment rescheduled successfully' });
  } catch (error) {
    console.error('❌ Reschedule error:', error);
    res.status(500).json({ message: 'Failed to reschedule appointment' });
  }
});


module.exports = router;