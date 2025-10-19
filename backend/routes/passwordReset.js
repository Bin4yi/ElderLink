// backend/routes/passwordReset.js
const express = require('express');
const router = express.Router();
const {
  requestPasswordReset,
  verifyOTP,
  resetPassword,
  cleanupExpiredOTPs
} = require('../controllers/passwordResetController');

/**
 * @route   POST /api/password-reset/request
 * @desc    Request password reset - sends OTP to email
 * @access  Public
 */
router.post('/request', requestPasswordReset);

/**
 * @route   POST /api/password-reset/verify-otp
 * @desc    Verify OTP code
 * @access  Public
 */
router.post('/verify-otp', verifyOTP);

/**
 * @route   POST /api/password-reset/reset
 * @desc    Reset password with verified OTP
 * @access  Public
 */
router.post('/reset', resetPassword);

/**
 * @route   POST /api/password-reset/cleanup
 * @desc    Cleanup expired OTPs (admin/cron only)
 * @access  Public (should be protected in production)
 */
router.post('/cleanup', cleanupExpiredOTPs);

module.exports = router;
