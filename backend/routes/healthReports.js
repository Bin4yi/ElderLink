const express = require('express');
const router = express.Router();
const {
  generateDailyReport,
  generateWeeklyReport,
  generateMonthlyReport,
  generatePDFReport
} = require('../controllers/healthReportController');

const { authenticate } = require('../middleware/auth');

// Apply authentication middleware to all routes
router.use(authenticate);

// Report generation routes
router.get('/daily', generateDailyReport);
router.get('/weekly', generateWeeklyReport);
router.get('/monthly', generateMonthlyReport);
router.get('/pdf', generatePDFReport);

module.exports = router;