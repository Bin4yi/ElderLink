// backend/routes/doctorDashboard.js
const express = require('express');
const router = express.Router();
const DoctorDashboardController = require('../controllers/doctorDashboardController');
const { authenticate, authorize } = require('../middleware/auth');

// Apply authentication and doctor authorization to all routes
router.use(authenticate);
router.use(authorize('doctor'));

// Dashboard statistics
router.get('/stats', DoctorDashboardController.getDashboardStats);

// Today's schedule
router.get('/schedule/today', DoctorDashboardController.getTodaySchedule);

// Recent activity
router.get('/activity/recent', DoctorDashboardController.getRecentActivity);

// Health alerts for doctor's patients
router.get('/health-alerts', DoctorDashboardController.getHealthAlerts);

// Upcoming appointments
router.get('/appointments/upcoming', DoctorDashboardController.getUpcomingAppointments);

module.exports = router;
