// backend/routes/adminStatsRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getAdminStats, getSystemActivity } = require('../controllers/adminStatsController');

/**
 * @route   GET /api/admin/stats
 * @desc    Get admin dashboard statistics
 * @access  Admin only
 */
router.get('/stats', authenticate, authorize(['admin']), getAdminStats);

/**
 * @route   GET /api/admin/activity
 * @desc    Get system activity feed
 * @access  Admin only
 */
router.get('/activity', authenticate, authorize(['admin']), getSystemActivity);

/**
 * @route   GET /api/admin/debug
 * @desc    Get debug information (temporary route)
 * @access  Admin only
 */
router.get('/debug', authenticate, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive
    },
    message: 'Debug info'
  });
});

module.exports = router;