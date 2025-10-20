// backend/routes/mobileNotifications.js
const express = require('express');
const router = express.Router();
const mobileNotificationController = require('../controllers/mobileNotificationController');
const { auth, authorize } = require('../middleware/auth');

// Get upcoming Zoom meetings for family member
router.get(
  '/zoom-meetings/upcoming',
  auth,
  authorize(['family_member']),
  mobileNotificationController.getUpcomingZoomMeetings
);

// Get single Zoom meeting details
router.get(
  '/zoom-meetings/:sessionId',
  auth,
  authorize(['family_member']),
  mobileNotificationController.getZoomMeetingById
);

// Get all notifications for user
router.get(
  '/notifications',
  auth,
  mobileNotificationController.getNotifications
);

// Mark notification as read
router.put(
  '/notifications/:notificationId/read',
  auth,
  mobileNotificationController.markNotificationRead
);

// Mark all notifications as read
router.put(
  '/notifications/read-all',
  auth,
  mobileNotificationController.markAllNotificationsRead
);

module.exports = router;
