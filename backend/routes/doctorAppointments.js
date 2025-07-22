// backend/routes/doctorAppointments.js
const express = require('express');
const router = express.Router();
const DoctorAppointmentController = require('../controllers/doctorAppointmentController');
const { authenticate, authorize } = require('../middleware/auth');

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Doctor appointments route is working',
    timestamp: new Date().toISOString()
  });
});

// Get doctor's appointments
router.get('/appointments', authenticate, authorize('doctor'), DoctorAppointmentController.getDoctorAppointments);

// Review appointment (approve/reject)
router.patch('/appointments/:id/review', authenticate, authorize('doctor'), DoctorAppointmentController.reviewAppointment);

// Reschedule appointment
router.patch('/appointments/:appointmentId/reschedule', authenticate, authorize('doctor'), DoctorAppointmentController.rescheduleAppointment);

// Get elder's medical summary
router.get('/elders/:elderId/medical-summary', authenticate, authorize('doctor'), DoctorAppointmentController.getElderMedicalSummary);

// Get dashboard stats
router.get('/dashboard/stats', authenticate, authorize('doctor'), DoctorAppointmentController.getDoctorDashboardStats);

// Get doctor consultations (if you have this method)
router.get('/consultations', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { page = 1, limit = 10, elderId } = req.query;
    
    // Mock consultation data for now - you can implement this later
    const mockConsultations = [];

    res.json({
      success: true,
      message: 'Doctor consultations retrieved successfully',
      consultations: mockConsultations,
      pagination: {
        total: 0,
        page: parseInt(page),
        pages: 0
      }
    });
  } catch (error) {
    console.error('❌ Get doctor consultations error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error'
    });
  }
});

// Complete appointment (if you have this method)
router.patch('/appointments/:id/complete', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { id } = req.params;
    const consultationData = req.body;

    // TODO: Implement appointment completion logic
    console.log('🔄 Completing appointment:', { id, consultationData });

    res.json({
      success: true,
      message: 'Appointment completed successfully'
    });
  } catch (error) {
    console.error('❌ Complete appointment error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error'
    });
  }
});

// Create prescription (if you have this method)
router.post('/appointments/:id/prescriptions', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { id } = req.params;
    const prescriptionData = req.body;

    // TODO: Implement prescription creation logic
    console.log('💊 Creating prescription:', { appointmentId: id, prescriptionData });

    res.status(201).json({
      success: true,
      message: 'Prescription created successfully'
    });
  } catch (error) {
    console.error('❌ Create prescription error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update schedule (if you have this method)
router.post('/schedule', authenticate, authorize('doctor'), async (req, res) => {
  try {
    const { schedules } = req.body;

    // TODO: Implement schedule update logic
    console.log('📅 Updating doctor schedule:', { schedules });

    res.json({
      success: true,
      message: 'Schedule updated successfully'
    });
  } catch (error) {
    console.error('❌ Update schedule error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;