// backend/routes/healthMonitoring.js
const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const {
  getAllHealthMonitoring,
  getTodayHealthMonitoring,
  getHealthMonitoringById,
  createHealthMonitoring,
  updateHealthMonitoring,
  deleteHealthMonitoring,
  getHealthMonitoringStats
} = require('../controllers/healthMonitoringController');

// Routes accessible by both staff and elders (for viewing their own data)
router.get('/', auth, checkRole(['staff', 'elder']), getAllHealthMonitoring);
router.get('/today', auth, checkRole(['staff', 'elder']), getTodayHealthMonitoring);
router.get('/stats', auth, checkRole(['staff', 'elder']), getHealthMonitoringStats);
router.get('/:id', auth, checkRole(['staff', 'elder']), getHealthMonitoringById);

// Routes only accessible by staff (for creating/updating/deleting records)
router.post('/', auth, checkRole(['staff']), createHealthMonitoring);
router.put('/:id', auth, checkRole(['staff']), updateHealthMonitoring);
router.delete('/:id', auth, checkRole(['staff']), deleteHealthMonitoring);

module.exports = router;