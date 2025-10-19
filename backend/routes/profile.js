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

module.exports = router;
