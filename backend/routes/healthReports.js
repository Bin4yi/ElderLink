const express = require('express');
const router = express.Router();
const { auth, checkRole } = require('../middleware/auth');
const healthReportsController = require('../controllers/healthReportsController');

// Generate daily health report
router.get('/daily', auth, checkRole(['admin', 'staff', 'elder', 'family_member']), healthReportsController.generateDailyReport);

// Generate weekly health report
router.get('/weekly', auth, checkRole(['admin', 'staff', 'elder', 'family_member']), healthReportsController.generateWeeklyReport);

// Generate monthly health report
router.get('/monthly', auth, checkRole(['admin', 'staff', 'elder', 'family_member']), healthReportsController.generateMonthlyReport);

// Generate custom date range report
router.get('/custom', auth, checkRole(['admin', 'staff', 'elder', 'family_member']), healthReportsController.generateCustomReport);

// Get elder's health summary
router.get('/summary/:elderId', auth, checkRole(['admin', 'staff', 'elder', 'family_member']), healthReportsController.getElderHealthSummary);

// Export daily report as PDF
router.get('/daily/pdf', auth, checkRole(['admin', 'staff', 'elder', 'family_member']), healthReportsController.exportHealthReportPDF);

// Export weekly report as PDF
router.get('/weekly/pdf', auth, checkRole(['admin', 'staff', 'elder', 'family_member']), healthReportsController.exportHealthReportPDF);

// Export monthly report as PDF
router.get('/monthly/pdf', auth, checkRole(['admin', 'staff', 'elder', 'family_member']), healthReportsController.exportHealthReportPDF);

// Export health data as PDF (by elder ID)
router.get('/pdf/:elderId', auth, checkRole(['admin', 'staff', 'elder', 'family_member']), healthReportsController.exportHealthReportPDF);

// Export health data as CSV
router.get('/csv/:elderId', auth, checkRole(['admin', 'staff', 'elder', 'family_member']), healthReportsController.exportHealthReportCSV);

module.exports = router;