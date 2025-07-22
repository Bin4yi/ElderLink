// backend/routes/prescriptions.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const prescriptionController = require('../controllers/prescriptionController');

// Prescription management routes
router.get('/', authenticate, authorize(['pharmacist', 'admin']), prescriptionController.getPrescriptions);
router.get('/stats', authenticate, authorize(['pharmacist', 'admin']), prescriptionController.getPrescriptionStats);
router.get('/:id', authenticate, authorize(['pharmacist', 'admin']), prescriptionController.getPrescription);
router.post('/:id/fill', authenticate, authorize(['pharmacist']), prescriptionController.fillPrescription);
router.put('/:id/cancel', authenticate, authorize(['pharmacist', 'admin']), prescriptionController.cancelPrescription);

module.exports = router;