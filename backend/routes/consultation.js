// backend/routes/consultation.js
const express = require('express');
const router = express.Router();
const ConsultationController = require('../controllers/ConsultationController');
const { authenticate, authorize } = require('../middleware/auth');

// Family member routes
router.get('/family/consultations', 
  authenticate, 
  authorize('family_member'), 
  ConsultationController.getFamilyConsultations
);

// Doctor routes
router.get('/doctor/consultations', 
  authenticate, 
  authorize('doctor'), 
  ConsultationController.getDoctorConsultations
);

router.post('/doctor/consultations/:appointmentId/start', 
  authenticate, 
  authorize('doctor'), 
  ConsultationController.startConsultation
);

router.post('/doctor/consultations/:appointmentId/complete', 
  authenticate, 
  authorize('doctor'), 
  ConsultationController.completeConsultation
);

router.post('/doctor/consultations/:consultationId/prescription', 
  authenticate, 
  authorize('doctor'), 
  ConsultationController.createPrescription
);

router.get('/doctor/elders/:elderId/details', 
  authenticate, 
  authorize('doctor'), 
  ConsultationController.getElderDetails
);

// Shared routes
router.get('/appointments/:appointmentId/details', 
  authenticate, 
  ConsultationController.getAppointmentDetails
);

module.exports = router;