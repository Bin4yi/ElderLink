const express = require('express');
const router = express.Router();
const coordinatorController = require('../controllers/coordinatorController');
const { auth } = require('../middleware/auth');

// Protect all routes - require authentication
router.use(auth);

/**
 * @route   GET /api/coordinator/dashboard
 * @desc    Get emergency dashboard overview
 * @access  Coordinator, Admin
 */
router.get('/dashboard', coordinatorController.getDashboardOverview);

/**
 * @route   GET /api/coordinator/queue
 * @desc    Get emergency queue (pending and active emergencies)
 * @access  Coordinator, Admin
 * @query   status, priority, limit
 */
router.get('/queue', coordinatorController.getEmergencyQueue);

/**
 * @route   POST /api/coordinator/emergency/:emergencyId/acknowledge
 * @desc    Acknowledge emergency (coordinator sees it)
 * @access  Coordinator, Admin
 */
router.post('/emergency/:emergencyId/acknowledge', coordinatorController.acknowledgeEmergency);

/**
 * @route   POST /api/coordinator/emergency/:emergencyId/dispatch
 * @desc    Dispatch ambulance to emergency
 * @access  Coordinator, Admin
 * @body    ambulanceId, hospitalDestination
 */
router.post('/emergency/:emergencyId/dispatch', coordinatorController.dispatchAmbulance);

/**
 * @route   GET /api/coordinator/dispatch/history
 * @desc    Get dispatch history
 * @access  Coordinator, Admin
 * @query   status, startDate, endDate, limit
 */
router.get('/dispatch/history', coordinatorController.getDispatchHistory);

/**
 * @route   GET /api/coordinator/analytics
 * @desc    Get analytics and statistics
 * @access  Coordinator, Admin
 * @query   period (24h, 7d, 30d)
 */
router.get('/analytics', coordinatorController.getAnalytics);

module.exports = router;
