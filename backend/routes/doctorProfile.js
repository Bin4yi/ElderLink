// backend/routes/doctorProfile.js
const express = require('express');
const router = express.Router();
const DoctorProfileController = require('../controllers/doctorProfileController');
const { authenticate, authorize } = require('../middleware/auth');

// Get doctor profile
router.get('/', 
  authenticate, 
  authorize('doctor'), 
  DoctorProfileController.getDoctorProfile
);

// Update doctor profile
router.put('/', 
  authenticate, 
  authorize('doctor'), 
  DoctorProfileController.updateDoctorProfile
);

// Get doctor statistics
router.get('/stats', 
  authenticate, 
  authorize('doctor'), 
  DoctorProfileController.getDoctorStats
);

// Get daily revenue for chart
router.get('/revenue-chart', 
  authenticate, 
  authorize('doctor'), 
  DoctorProfileController.getDailyRevenue
);

module.exports = router;
