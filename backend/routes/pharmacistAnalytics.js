// backend/routes/pharmacistAnalytics.js
const express = require("express");
const router = express.Router();
const {
  getTopDoctors,
  getPrescriptionStats,
  getDeliveryStats,
} = require("../controllers/pharmacistAnalyticsController");
const { authenticate } = require("../middleware/auth");

// All routes require authentication
router.use(authenticate);

// Analytics routes
router.get("/top-doctors", getTopDoctors);
router.get("/prescriptions", getPrescriptionStats);
router.get("/deliveries", getDeliveryStats);

module.exports = router;
