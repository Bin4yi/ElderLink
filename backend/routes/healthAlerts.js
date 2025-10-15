// backend/routes/healthAlerts.js
const express = require('express');
const router = express.Router();
const healthAlertController = require('../controllers/healthAlertController');
const { auth, checkRole } = require('../middleware/auth');

// Get all alerts (admin only)
router.get('/',
  auth,
  checkRole(['admin']),
  healthAlertController.getAllAlerts
);

// Get alerts for logged-in staff member
router.get('/staff',
  auth,
  checkRole(['staff']),
  healthAlertController.getStaffAlerts
);

// Acknowledge alert
router.put('/:id/acknowledge',
  auth,
  checkRole(['staff', 'admin', 'family_member']),
  healthAlertController.acknowledgeAlert
);

// Resolve alert
router.put('/:id/resolve',
  auth,
  checkRole(['staff', 'admin']),
  healthAlertController.resolveAlert
);

// Mark emergency contacted
router.put('/:id/emergency-contacted',
  auth,
  checkRole(['staff', 'admin']),
  healthAlertController.markEmergencyContacted
);

// Mark next of kin notified
router.put('/:id/next-of-kin-notified',
  auth,
  checkRole(['staff', 'admin']),
  healthAlertController.markNextOfKinNotified
);

module.exports = router;
