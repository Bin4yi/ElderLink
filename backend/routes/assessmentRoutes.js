// backend/routes/assessmentRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  createAssessment,
  getSpecialistAssessments,
  getAssessmentById,
  completeAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentStatistics,
} = require("../controllers/assessmentController");

// CRUD operations
router.post("/", authenticate, createAssessment);
router.get("/", authenticate, getSpecialistAssessments);
router.get("/statistics", authenticate, getAssessmentStatistics);
router.get("/:assessmentId", authenticate, getAssessmentById);
router.put("/:assessmentId/complete", authenticate, completeAssessment);
router.put("/:assessmentId", authenticate, updateAssessment);
router.delete("/:assessmentId", authenticate, deleteAssessment);

module.exports = router;
