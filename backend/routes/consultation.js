// backend/routes/consultation.js
const express = require('express');
const router = express.Router();
const consultationController = require('../controllers/consultationController');
const { auth, checkRole } = require('../middleware/auth');

// Doctor routes - create and manage consultation records
router.post(
  '/records',
  auth,
  checkRole(['doctor']),
  consultationController.createConsultationRecord
);

router.get(
  '/records',
  auth,
  checkRole(['doctor']),
  consultationController.getDoctorConsultationRecords
);

router.get(
  '/records/:id',
  auth,
  consultationController.getConsultationRecordById
);

router.put(
  '/records/:id',
  auth,
  checkRole(['doctor']),
  consultationController.updateConsultationRecord
);

router.delete(
  '/records/:id',
  auth,
  checkRole(['doctor']),
  consultationController.deleteConsultationRecord
);

// Elder consultation records (for family members and elders)
router.get(
  '/elder/:elderId/records',
  auth,
  checkRole(['family_member', 'elder', 'doctor']),
  consultationController.getElderConsultationRecords
);

// Get elder's last consultation record with latest vitals
router.get(
  '/elder/:elderId/last-record-with-vitals',
  auth,
  checkRole(['doctor', 'family_member', 'elder']),
  consultationController.getElderLastRecordWithVitals
);

module.exports = router;
