// backend/routes/profile.js
const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profileController');
const { authenticate } = require('../middleware/auth');

// All profile routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/profile/staff
 * @desc    Get staff profile information
 * @access  Private (Staff only)
 */
router.get('/staff', profileController.getStaffProfile);

/**
 * @route   PUT /api/profile/staff
 * @desc    Update staff profile information
 * @access  Private (Staff only)
 */
router.put('/staff', profileController.updateStaffProfile);

/**
 * @route   GET /api/profile/pharmacist
 * @desc    Get pharmacist profile information
 * @access  Private (Pharmacist only)
 */
router.get('/pharmacist', profileController.getPharmacistProfile);

/**
 * @route   PUT /api/profile/pharmacist
 * @desc    Update pharmacist profile information
 * @access  Private (Pharmacist only)
 */
router.put('/pharmacist', profileController.updatePharmacistProfile);

module.exports = router;
