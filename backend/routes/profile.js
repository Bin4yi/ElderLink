// backend/routes/profile.js
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { authenticate } = require("../middleware/auth");

// All profile routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/profile/staff
 * @desc    Get staff profile information
 * @access  Private (Staff only)
 */
router.get("/staff", profileController.getStaffProfile);

/**
 * @route   PUT /api/profile/staff
 * @desc    Update staff profile information
 * @access  Private (Staff only)
 */
router.put("/staff", profileController.updateStaffProfile);

/**
 * @route   PUT /api/profile/staff/password
 * @desc    Change staff password
 * @access  Private (Staff only)
 */
router.put("/staff/password", profileController.changeStaffPassword);

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

/**
 * @route   GET /api/profile/family
 * @desc    Get family member profile information
 * @access  Private (Family member only)
 */
router.get('/family', profileController.getFamilyProfile);

/**
 * @route   PUT /api/profile/family
 * @desc    Update family member profile information (email and name cannot be changed)
 * @access  Private (Family member only)
 */
router.put('/family', profileController.updateFamilyProfile);

/**
 * @route   GET /api/profile/coordinator
 * @desc    Get coordinator profile information
 * @access  Private (Coordinator only)
 */
router.get('/coordinator', profileController.getCoordinatorProfile);

/**
 * @route   PUT /api/profile/coordinator
 * @desc    Update coordinator profile information
 * @access  Private (Coordinator only)
 */
router.put('/coordinator', profileController.updateCoordinatorProfile);

/**
 * @route   GET /api/profile/settings
 * @desc    Get user settings/preferences
 * @access  Private
 */
router.get('/settings', profileController.getUserSettings);

/**
 * @route   PUT /api/profile/settings
 * @desc    Update user settings/preferences
 * @access  Private
 */
router.put('/settings', profileController.updateUserSettings);

module.exports = router;
