// backend/routes/adminUserRoutes.js
const express = require('express');
const router = express.Router();
const adminUserController = require('../controllers/adminUserController');
const { authenticate, authorize } = require('../middleware/auth');

// Protect all admin user routes
router.use(authenticate);
router.use(authorize('admin'));

/**
 * @route   GET /api/admin/users
 * @desc    Get all non-family users with pagination and filtering
 * @access  Admin only
 */
router.get('/users', adminUserController.getAllNonFamilyUsers);

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user statistics for dashboard
 * @access  Admin only
 */
router.get('/users/stats', adminUserController.getUserStats);

/**
 * @route   POST /api/admin/users
 * @desc    Create a new non-family member user
 * @access  Admin only
 */
router.post('/users', adminUserController.createNonFamilyUser);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user information
 * @access  Admin only
 */
router.put('/users/:id', adminUserController.updateUser);

/**
 * @route   PATCH /api/admin/users/:id/status
 * @desc    Toggle user active status
 * @access  Admin only
 */
router.patch('/users/:id/status', adminUserController.toggleUserStatus);

/**
 * @route   POST /api/admin/users/:id/reset-password
 * @desc    Reset user password and send new temporary password via email
 * @access  Admin only
 */
router.post('/users/:id/reset-password', adminUserController.resetUserPassword);

module.exports = router;