// backend/routes/mentalHealthAssignmentRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  createAssignment,
  getFamilyAssignments,
  getSpecialistClients,
  terminateAssignment,
  updateAssignment,
  getAvailableSpecialists,
} = require("../controllers/mentalHealthAssignmentController");

// Family member routes
router.post("/", authenticate, createAssignment);
router.get("/family", authenticate, getFamilyAssignments);

// Specialist routes
router.get("/clients", authenticate, getSpecialistClients);
router.get("/specialists/available", authenticate, getAvailableSpecialists);

// Shared routes
router.put("/:assignmentId", authenticate, updateAssignment);
router.delete("/:assignmentId", authenticate, terminateAssignment);

module.exports = router;
