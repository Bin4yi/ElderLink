// backend/routes/healthMonitoring.js
const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { HealthMonitoring, User, Elder } = require('../models');
const { Op } = require('sequelize');

// Test route (no auth needed)
router.get('/test', (req, res) => {
  console.log('🧪 Health monitoring test route hit');
  res.json({
    success: true,
    message: 'Health monitoring routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Get all health monitoring records - FIX THE AUTHORIZATION
router.get('/all', authenticate, authorize('staff'), async (req, res) => {
  try {
    console.log('🔍 Getting all health monitoring records...');
    console.log('🔍 Request user:', req.user);
    
    const allRecords = await HealthMonitoring.findAll({
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });

    console.log('✅ Found', allRecords.length, 'health monitoring records');

    res.json({
      success: true,
      data: allRecords,
      total: allRecords.length,
      message: 'All health monitoring records retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get all health monitoring records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health monitoring records',
      error: error.message
    });
  }
});

// Get elder health history - FIX THE AUTHORIZATION
router.get('/elder/:elderId/history', authenticate, authorize('staff'), async (req, res) => {
  try {
    const { elderId } = req.params;
    const { days = 7 } = req.query;
    
    console.log('🔍 Getting health history for elder:', elderId, 'for last', days, 'days');
    console.log('🔍 Request user:', req.user);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    console.log('🔍 Start date for query:', startDate);
    
    const healthHistory = await HealthMonitoring.findAll({
      where: {
        elderId: elderId,
        monitoringDate: {
          [Op.gte]: startDate
        }
      },
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });

    console.log('✅ Found', healthHistory.length, 'health monitoring records for elder:', elderId);

    res.json({
      success: true,
      data: healthHistory,
      total: healthHistory.length,
      message: 'Health history retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get elder health history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get elder health history',
      error: error.message,
      data: []
    });
  }
});

module.exports = router;