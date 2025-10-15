const express = require('express');
const router = express.Router();
const ambulanceController = require('../controllers/ambulanceController');
const { auth } = require('../middleware/auth');

// Protect all routes - require authentication
router.use(auth);

/**
 * @route   GET /api/ambulance
 * @desc    Get all ambulances with optional filtering
 * @access  Admin, Coordinator
 * @query   status, type, isActive, hospitalId
 */
router.get('/', ambulanceController.getAllAmbulances);

/**
 * @route   GET /api/ambulance/available
 * @desc    Get available ambulances (for dispatch)
 * @access  Coordinator
 * @query   latitude, longitude, limit
 */
router.get('/available', ambulanceController.getAvailableAmbulances);

/**
 * @route   GET /api/ambulance/stats
 * @desc    Get ambulance statistics
 * @access  Admin, Coordinator
 */
router.get('/stats', ambulanceController.getAmbulanceStats);

/**
 * @route   GET /api/ambulance/drivers
 * @desc    Get available drivers (users with ambulance_driver role)
 * @access  Admin, Coordinator
 */
router.get('/drivers', ambulanceController.getAvailableDrivers);

/**
 * @route   GET /api/ambulance/:id
 * @desc    Get single ambulance by ID
 * @access  Admin, Coordinator, Driver (own ambulance)
 */
router.get('/:id', ambulanceController.getAmbulanceById);

/**
 * @route   POST /api/ambulance
 * @desc    Create new ambulance
 * @access  Admin
 */
router.post('/', ambulanceController.createAmbulance);

/**
 * @route   PUT /api/ambulance/:id
 * @desc    Update ambulance
 * @access  Admin
 */
router.put('/:id', ambulanceController.updateAmbulance);

/**
 * @route   PATCH /api/ambulance/:id/location
 * @desc    Update ambulance location
 * @access  Driver, Admin
 */
router.patch('/:id/location', ambulanceController.updateAmbulanceLocation);

/**
 * @route   PATCH /api/ambulance/:id/status
 * @desc    Update ambulance status
 * @access  Admin, Driver (own ambulance)
 */
router.patch('/:id/status', ambulanceController.updateAmbulanceStatus);

/**
 * @route   DELETE /api/ambulance/:id
 * @desc    Delete ambulance (soft delete)
 * @access  Admin
 */
router.delete('/:id', ambulanceController.deleteAmbulance);

module.exports = router;
