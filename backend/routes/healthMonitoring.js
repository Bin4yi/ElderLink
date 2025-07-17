// backend/routes/healthMonitoring.js
const express = require('express');
const router = express.Router();
const {
  getAllHealthRecords,
  getTodayRecords,
  getElderHealthHistory,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord
} = require('../controllers/healthMonitoringController');
const { authenticate, authorize } = require('../middleware/auth');

// Test route (no auth needed)
router.get('/test', (req, res) => {
  console.log('🧪 Health monitoring test route hit');
  res.json({
    success: true,
    message: 'Health monitoring routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Get all health monitoring records (only assigned elders)
router.get('/all', authenticate, authorize('staff'), getAllHealthRecords);

// Get today's health monitoring records (only assigned elders)
router.get('/today', authenticate, authorize('staff'), getTodayRecords);

// Get elder health history (only assigned elders)
router.get('/elder/:elderId/history', authenticate, authorize('staff'), getElderHealthHistory);

// Create health monitoring record (only assigned elders)
router.post('/', authenticate, authorize('staff'), createHealthRecord);

// Update health monitoring record (only assigned elders)
router.put('/:id', authenticate, authorize('staff'), updateHealthRecord);

// Delete health monitoring record (only assigned elders)
router.delete('/:id', authenticate, authorize('staff'), deleteHealthRecord);

module.exports = router;