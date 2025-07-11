// backend/routes/doctorSyncRoutes.js
const express = require('express');
const router = express.Router();
const doctorSyncController = require('../controllers/doctorSyncController');
// const auth = require('../middleware/auth'); // Add your auth middleware
// const adminAuth = require('../middleware/adminAuth'); // Add admin auth middleware

// All routes require admin authentication
// router.use(auth, adminAuth);

// Sync operations
router.post('/sync-all', doctorSyncController.syncAllDoctors);
router.post('/sync-user/:userId', doctorSyncController.syncSingleDoctor);
router.delete('/remove-profile/:userId', doctorSyncController.removeDoctorProfile);

// Get operations
router.get('/doctor-users', doctorSyncController.getDoctorUsers);
router.get('/needs-update', doctorSyncController.getDoctorsNeedingUpdate);
router.get('/stats', doctorSyncController.getSyncStats);

// Complete doctor profile
router.put('/complete-profile/:doctorId', doctorSyncController.completeDoctorProfile);

module.exports = router;

// Add this to your main routes/index.js file:
/*
const doctorSyncRoutes = require('./doctorSyncRoutes');
router.use('/doctor-sync', doctorSyncRoutes);
*/