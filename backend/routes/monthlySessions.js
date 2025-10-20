// backend/routes/monthlySessions.js
const express = require('express');
const router = express.Router();
const monthlySessionController = require('../controllers/monthlySessionController');
const monthlySessionZoomController = require('../controllers/monthlySessionZoomController');
const { auth, authorize } = require('../middleware/auth');

// IMPORTANT: Specific routes must come BEFORE parameterized routes

// Doctor routes (must be before /:sessionId)
router.get(
  '/doctor/sessions',
  auth,
  authorize(['doctor']),
  monthlySessionController.getDoctorMonthlySessions
);

// Elder routes (must be before /:sessionId)
router.get(
  '/elder/sessions',
  auth,
  authorize(['elder']),
  monthlySessionController.getElderMonthlySessions
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

router.patch(
  '/:sessionId/mark-completed',
  auth,
  monthlySessionController.markAsCompleted
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

// ========== ZOOM MEETING ROUTES ==========

// Get pharmacies list (for prescription upload)
router.get(
  '/pharmacies/list',
  auth,
  authorize(['doctor']),
  monthlySessionZoomController.getPharmacies
);

// Create Zoom meeting for a session
router.post(
  '/:sessionId/create-zoom',
  auth,
  authorize(['doctor']),
  monthlySessionZoomController.createZoomMeeting
);

// Send Zoom meeting links to family and elder
router.post(
  '/:sessionId/send-links',
  auth,
  authorize(['doctor']),
  monthlySessionZoomController.sendMeetingLinks
);

// Start a Zoom meeting (get start URL)
router.post(
  '/:sessionId/start-meeting',
  auth,
  authorize(['doctor']),
  monthlySessionZoomController.startMeeting
);

// Complete session with prescription upload
router.post(
  '/:sessionId/complete-with-prescription',
  auth,
  authorize(['doctor']),
  monthlySessionZoomController.completeSession
);

module.exports = router;
