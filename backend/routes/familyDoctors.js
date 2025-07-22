const express = require('express');
const router = express.Router();
const FamilyDoctorController = require('../controllers/familyDoctorController');

// Route: GET /api/family/doctors
router.get('/doctors', FamilyDoctorController.getDoctorsList);

module.exports = router;
