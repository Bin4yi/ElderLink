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

router.post('/:appointmentId/join',
  authenticate,
  authorize('family_member'),
  ConsultationController.joinConsultation
);

// Doctor routes
router.get('/doctor/consultations',
  authenticate,
  authorize('doctor'),
  ConsultationController.getDoctorConsultations
);

router.post('/:appointmentId/start',
  authenticate,
  authorize('doctor'),
  ConsultationController.startConsultation
);

router.post('/:appointmentId/complete',
  authenticate,
  authorize('doctor'),
  ConsultationController.completeConsultation
);

router.post('/:consultationId/prescription',
  authenticate,
  authorize('doctor'),
  ConsultationController.createPrescription
);

router.get('/doctor/elders/:elderId/details',
  authenticate,
  authorize('doctor'),
  ConsultationController.getElderDetails
);

router.get('/elder/:elderId/history',
  authenticate,
  authorize('doctor'),
  ConsultationController.getConsultationHistory
);

// Shared routes
router.get('/appointments/:appointmentId/details',
  authenticate,
  ConsultationController.getAppointmentDetails
);

router.patch('/:appointmentId/status',
  authenticate,
  ConsultationController.updateConsultationStatus
);

module.exports = router;