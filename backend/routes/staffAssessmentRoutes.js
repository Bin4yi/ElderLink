// backend/routes/staffAssessmentRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getStaffAssessments,
  updateAssessmentStatus,
  getStaffAssessmentStats,
} = require("../controllers/staffAssessmentController");

// Get all assessments for assigned elders
router.get("/", authenticate, getStaffAssessments);

// Get statistics
router.get("/stats", authenticate, getStaffAssessmentStats);

// Update assessment status
router.patch("/:assessmentId/status", authenticate, updateAssessmentStatus);

module.exports = router;
