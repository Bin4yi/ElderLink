// backend/routes/progressReportRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  createProgressReport,
  getSpecialistProgressReports,
  getProgressReportById,
  updateProgressReport,
  deleteProgressReport,
  getProgressReportStatistics,
} = require("../controllers/progressReportController");

// CRUD operations
router.post("/", authenticate, createProgressReport);
router.get("/", authenticate, getSpecialistProgressReports);
router.get("/statistics", authenticate, getProgressReportStatistics);
router.get("/:reportId", authenticate, getProgressReportById);
router.put("/:reportId", authenticate, updateProgressReport);
router.delete("/:reportId", authenticate, deleteProgressReport);

module.exports = router;
