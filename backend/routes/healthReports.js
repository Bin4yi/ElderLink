const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { HealthMonitoring, Elder, User } = require('../models');
const {
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
  testReports
} = require('../controllers/healthReportController');

// Test route
router.get('/test', testReports);

// Get basic health reports data
router.get('/', authenticate, authorize(['admin', 'staff']), async (req, res) => {
  try {
    const reports = await HealthMonitoring.findAll({
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['monitoringDate', 'DESC']],
      limit: 10
    });
    
    res.json({
      success: true,
      data: reports
    });
  } catch (error) {
    console.error('Error fetching health reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health reports'
    });
  }
});

// Generate daily report
router.get('/daily', authenticate, authorize(['admin', 'staff']), generateDailyReport);

// Generate weekly report
router.get('/weekly', authenticate, authorize(['admin', 'staff']), generateWeeklyReport);

// Generate monthly report
router.get('/monthly', authenticate, authorize(['admin', 'staff']), generateMonthlyReport);

// ✅ Fixed: Add a basic PDF download endpoint (placeholder for now)
router.get('/pdf', authenticate, authorize(['admin', 'staff']), async (req, res) => {
  try {
    const { type, ...params } = req.query;
    
    // For now, return a simple response
    // In a real application, you would generate a PDF here
    res.json({
      success: true,
      message: 'PDF generation endpoint - implementation coming soon',
      data: {
        type,
        params,
        downloadUrl: '/api/health-reports/download-pdf'
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate PDF report'
    });
  }
});

module.exports = router;