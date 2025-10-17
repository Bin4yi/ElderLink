// backend/routes/doctorPatients.js
const express = require('express');
const router = express.Router();
const DoctorPatientController = require('../controllers/doctorPatientController');
const { authenticate, authorize } = require('../middleware/auth');

// Get all patients for logged-in doctor
router.get('/', 
  authenticate, 
  authorize('doctor'), 
  DoctorPatientController.getDoctorPatients
);

// Get specific patient details
router.get('/:elderId', 
  authenticate, 
  authorize('doctor'), 
  DoctorPatientController.getPatientDetails
);

module.exports = router;
