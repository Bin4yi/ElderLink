// backend/routes/treatmentPlanRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  createTreatmentPlan,
  getSpecialistTreatmentPlans,
  getCaregiverTreatmentPlans,
  getTreatmentPlanById,
  updateTreatmentPlan,
  submitProgressReport,
  getProgressReports,
  getTreatmentPlanStatistics,
} = require("../controllers/treatmentPlanController");

// Specialist routes
router.post("/", authenticate, createTreatmentPlan);
router.get("/specialist", authenticate, getSpecialistTreatmentPlans);
router.get("/statistics", authenticate, getTreatmentPlanStatistics);

// Caregiver routes
router.get("/caregiver", authenticate, getCaregiverTreatmentPlans);
router.post("/:planId/progress", authenticate, submitProgressReport);

// Shared routes
router.get("/:planId", authenticate, getTreatmentPlanById);
router.get("/:planId/progress", authenticate, getProgressReports);
router.put("/:planId", authenticate, updateTreatmentPlan);

module.exports = router;
