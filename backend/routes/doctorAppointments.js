// backend/routes/doctorAppointments.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const DoctorAppointmentController = require('../controllers/doctorAppointmentController');

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Doctor appointments route is working',
    timestamp: new Date().toISOString()
  });
});

// Get doctor's appointments
router.get('/appointments', 
  authenticate, 
  authorize('doctor'), 
  DoctorAppointmentController.getDoctorAppointments
);

// Review appointment (approve/reject) - ✅ FIXED: Changed from :appointmentId to :id
router.patch('/appointments/:id/review', 
  authenticate, 
  authorize('doctor'), 
  DoctorAppointmentController.reviewAppointment
);

router.patch('/appointments/:id/reschedule',
  authenticate,
  authorize('doctor'),
  DoctorAppointmentController.rescheduleAppointment
);

// Get dashboard stats
router.get('/dashboard/stats', 
  authenticate, 
  authorize('doctor'), 
  DoctorAppointmentController.getDoctorDashboardStats
);

module.exports = router;
