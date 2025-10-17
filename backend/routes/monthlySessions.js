// backend/routes/monthlySessions.js
const express = require('express');
const router = express.Router();
const monthlySessionController = require('../controllers/monthlySessionController');
const { auth, authorize } = require('../middleware/auth');

// IMPORTANT: Specific routes must come BEFORE parameterized routes

// Doctor routes (must be before /:sessionId)
router.get(
  '/doctor/sessions',
  auth,
  authorize(['doctor']),
  monthlySessionController.getDoctorMonthlySessions
);

// Statistics route (must be before /:sessionId)
router.get(
  '/stats',
  auth,
  authorize(['family_member']),
  monthlySessionController.getMonthlySessionStats
);

// Check if session exists for a specific month (must be before /:sessionId)
router.get(
  '/check-exists',
  auth,
  authorize(['family_member']),
  monthlySessionController.checkMonthlySessionExists
);

// Family member routes

// Create first monthly session (simple, no transaction)
router.post(
  '/create',
  auth,
  authorize(['family_member']),
  monthlySessionController.createFirstMonthlySession
);

// Auto-schedule multiple sessions (advanced)
router.post(
  '/auto-schedule',
  auth,
  authorize(['family_member']),
  monthlySessionController.autoScheduleMonthlySessions
);

router.get(
  '/',
  auth,
  authorize(['family_member', 'doctor', 'admin']),
  monthlySessionController.getMonthlySessions
);

// Parameterized routes (must come AFTER specific routes)
router.get(
  '/:sessionId',
  auth,
  authorize(['family_member', 'doctor', 'admin']),
  monthlySessionController.getMonthlySessionById
);

router.put(
  '/:sessionId',
  auth,
  authorize(['family_member', 'doctor', 'admin']),
  monthlySessionController.updateMonthlySession
);

router.post(
  '/:sessionId/cancel',
  auth,
  authorize(['family_member', 'doctor', 'admin']),
  monthlySessionController.cancelMonthlySession
);

router.post(
  '/:sessionId/reschedule',
  auth,
  authorize(['family_member', 'doctor', 'admin']),
  monthlySessionController.rescheduleMonthlySession
);

router.post(
  '/:sessionId/complete',
  auth,
  authorize(['doctor']),
  monthlySessionController.completeMonthlySession
);

module.exports = router;
