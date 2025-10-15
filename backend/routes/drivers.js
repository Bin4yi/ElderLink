const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driverController');
const { auth } = require('../middleware/auth');

// Protect all routes - require authentication
router.use(auth);

/**
 * @route   GET /api/drivers
 * @desc    Get all drivers
 * @access  Admin, Coordinator
 */
router.get('/', driverController.getAllDrivers);

/**
 * @route   GET /api/drivers/stats
 * @desc    Get driver statistics
 * @access  Admin, Coordinator
 */
router.get('/stats', driverController.getDriverStats);

/**
 * @route   GET /api/drivers/active-dispatch
 * @desc    Get driver's active dispatch (for logged-in driver)
 * @access  Driver
 */
router.get('/active-dispatch', driverController.getActiveDispatch);

/**
 * @route   GET /api/drivers/dispatch-history
 * @desc    Get driver's dispatch history (for logged-in driver)
 * @access  Driver
 */
router.get('/dispatch-history', driverController.getDispatchHistory);

/**
 * @route   POST /api/drivers/mark-available
 * @desc    Mark ambulance as available (for logged-in driver)
 * @access  Driver
 */
router.post('/mark-available', driverController.markAvailable);

/**
 * @route   GET /api/drivers/:id
 * @desc    Get single driver by ID
 * @access  Admin, Coordinator
 */
router.get('/:id', driverController.getDriverById);

/**
 * @route   POST /api/drivers
 * @desc    Create new driver
 * @access  Admin, Coordinator
 */
router.post('/', driverController.createDriver);

/**
 * @route   PUT /api/drivers/:id
 * @desc    Update driver
 * @access  Admin, Coordinator
 */
router.put('/:id', driverController.updateDriver);

/**
 * @route   DELETE /api/drivers/:id
 * @desc    Delete driver (soft delete)
 * @access  Admin
 */
router.delete('/:id', driverController.deleteDriver);

module.exports = router;
