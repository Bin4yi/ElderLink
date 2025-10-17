// backend/routes/adminAnalyticsRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate, checkRole } = require("../middleware/auth");
const {
  getUserStatistics,
  getSubscriptionStatistics,
  getRevenueStatistics,
  getDashboardOverview,
} = require("../controllers/adminAnalyticsController");

// All routes require admin authentication
router.use(authenticate);
router.use(checkRole("admin"));

// Dashboard overview
router.get("/overview", getDashboardOverview);

// User statistics
router.get("/users", getUserStatistics);

// Subscription statistics
router.get("/subscriptions", getSubscriptionStatistics);

// Revenue statistics
router.get("/revenue", getRevenueStatistics);

module.exports = router;
