const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const healthReportsController = require('../controllers/healthReportsController');

// ✅ Existing routes - using correct middleware
router.get('/daily', authenticate, authorize(['admin', 'staff']), healthReportsController.generateDailyReport);
router.get('/weekly', authenticate, authorize(['admin', 'staff']), healthReportsController.generateWeeklyReport);
router.get('/monthly', authenticate, authorize(['admin', 'staff']), healthReportsController.generateMonthlyReport);

// ✅ New PDF routes - using correct middleware
router.get('/daily/pdf', authenticate, authorize(['admin', 'staff']), healthReportsController.generateDailyReportPDF);
router.get('/weekly/pdf', authenticate, authorize(['admin', 'staff']), healthReportsController.generateWeeklyReportPDF);
router.get('/monthly/pdf', authenticate, authorize(['admin', 'staff']), healthReportsController.generateMonthlyReportPDF);

module.exports = router;