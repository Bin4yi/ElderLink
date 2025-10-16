// backend/routes/therapySessionRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  createSession,
  getSpecialistSessions,
  completeSession,
  updateSession,
  cancelSession,
  getSessionStatistics,
} = require("../controllers/therapySessionController");

// Create and get sessions
router.post("/", authenticate, createSession);
router.get("/", authenticate, getSpecialistSessions);
router.get("/statistics", authenticate, getSessionStatistics);

// Session actions
router.put("/:sessionId/complete", authenticate, completeSession);
router.put("/:sessionId", authenticate, updateSession);
router.delete("/:sessionId", authenticate, cancelSession);

module.exports = router;
