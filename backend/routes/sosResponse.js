const express = require('express');
const router = express.Router();
const sosResponseController = require('../controllers/sosResponseController');
const { auth } = require('../middleware/auth');

// Protect all routes - require authentication
router.use(auth);

/**
 * @route   POST /api/sos/dispatch/:dispatchId/accept
 * @desc    Driver accepts dispatch assignment
 * @access  Driver
 */
router.post('/dispatch/:dispatchId/accept', sosResponseController.acceptDispatch);

/**
 * @route   PATCH /api/sos/dispatch/:dispatchId/status
 * @desc    Driver updates dispatch status (en_route, arrived, etc.)
 * @access  Driver
 * @body    status
 */
router.patch('/dispatch/:dispatchId/status', sosResponseController.updateDispatchStatus);

/**
 * @route   POST /api/sos/dispatch/:dispatchId/location
 * @desc    Driver updates location during dispatch
 * @access  Driver
 * @body    latitude, longitude, accuracy, altitude, speed, heading
 */
router.post('/dispatch/:dispatchId/location', sosResponseController.updateDispatchLocation);

/**
 * @route   POST /api/sos/dispatch/:dispatchId/arrived
 * @desc    Driver marks arrival at emergency location
 * @access  Driver
 */
router.post('/dispatch/:dispatchId/arrived', sosResponseController.markArrived);

/**
 * @route   POST /api/sos/dispatch/:dispatchId/complete
 * @desc    Driver completes dispatch
 * @access  Driver
 * @body    notes, patientCondition, hospitalArrived
 */
router.post('/dispatch/:dispatchId/complete', sosResponseController.completeDispatch);

/**
 * @route   GET /api/sos/driver/active
 * @desc    Get driver's active dispatch
 * @access  Driver
 */
router.get('/driver/active', sosResponseController.getActiveDispatch);

/**
 * @route   GET /api/sos/driver/history
 * @desc    Get driver's dispatch history
 * @access  Driver
 * @query   limit, offset
 */
router.get('/driver/history', sosResponseController.getDispatchHistory);

/**
 * @route   GET /api/sos/driver/stats
 * @desc    Get driver statistics
 * @access  Driver
 */
router.get('/driver/stats', sosResponseController.getDriverStats);

module.exports = router;
