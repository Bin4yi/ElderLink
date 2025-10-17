// backend/routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getDashboardStatistics,
  getTodaySchedule,
  getRecentActivities,
  getAlerts,
} = require("../controllers/dashboardController");

// Dashboard endpoints
router.get("/statistics", authenticate, getDashboardStatistics);
router.get("/today", authenticate, getTodaySchedule);
router.get("/activities", authenticate, getRecentActivities);
router.get("/alerts", authenticate, getAlerts);

module.exports = router;
