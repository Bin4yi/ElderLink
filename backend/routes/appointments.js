// backend/routes/appointments.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const AppointmentController = require('../controllers/appointmentController');

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Appointments route is working',
    timestamp: new Date().toISOString()
  });
});

// Family Member Routes
router.get('/doctors', authenticate, AppointmentController.getAvailableDoctors);
router.get('/doctors/:doctorId/availability', AppointmentController.getDoctorAvailability);
router.get('/doctor/:doctorId/availability', AppointmentController.getDoctorAvailability);
router.get('/doctors/:doctorId/available-dates', authenticate, AppointmentController.getDoctorAvailableDates);
router.post('/', authenticate, authorize(['family_member', 'elder']), AppointmentController.bookAppointment);
router.get('/', authenticate, AppointmentController.getAppointments);
router.get('/:id', authenticate, AppointmentController.getAppointmentById);
router.put('/:id/cancel', authenticate, AppointmentController.cancelAppointment);
router.put('/:id/reschedule', authenticate, AppointmentController.rescheduleAppointment);
router.post('/:id/confirm-payment', authenticate, AppointmentController.confirmPayment);

// Elder summary route
router.get('/elders/:elderId/summary', authenticate, AppointmentController.getElderSummary);
router.get('/doctor/:doctorId/available-dates', AppointmentController.getDoctorAvailableDates);

module.exports = router;