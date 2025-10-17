// backend/routes/groupSessionRoutes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  createGroupSession,
  getSpecialistGroupSessions,
  getGroupSessionById,
  addParticipant,
  removeParticipant,
  updateGroupSession,
  completeGroupSession,
  cancelGroupSession,
} = require("../controllers/groupSessionController");

// CRUD operations
router.post("/", authenticate, createGroupSession);
router.get("/", authenticate, getSpecialistGroupSessions);
router.get("/:sessionId", authenticate, getGroupSessionById);
router.put("/:sessionId", authenticate, updateGroupSession);

// Participant management
router.post("/:sessionId/participants", authenticate, addParticipant);
router.delete(
  "/:sessionId/participants/:elderId",
  authenticate,
  removeParticipant
);

// Session actions
router.put("/:sessionId/complete", authenticate, completeGroupSession);
router.put("/:sessionId/cancel", authenticate, cancelGroupSession);

module.exports = router;
