// backend/controllers/groupSessionController.js
const {
  GroupTherapySession,
  TherapySession,
  Elder,
  User,
} = require("../models");
const { Op } = require("sequelize");

// Create a group therapy session
const createGroupSession = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const {
      sessionName,
      description,
      maxParticipants,
      scheduledDate,
      scheduledTime,
      duration,
      location,
      meetingLink,
      participants,
    } = req.body;

    const groupSession = await GroupTherapySession.create({
      specialistId,
      sessionName,
      description,
      maxParticipants: maxParticipants || 10,
      scheduledDate,
      scheduledTime,
      duration: duration || 90,
      location: location || "in_person",
      meetingLink,
      status: "scheduled",
      participants: participants || [],
    });

    res.status(201).json({
      message: "Group therapy session created successfully",
      groupSession,
    });
  } catch (error) {
    console.error("Error creating group session:", error);
    res.status(500).json({
      message: "Error creating group session",
      error: error.message,
    });
  }
};

// Get all group sessions for a specialist
const getSpecialistGroupSessions = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const { status } = req.query;

    const whereClause = { specialistId };
    if (status) whereClause.status = status;

    const groupSessions = await GroupTherapySession.findAll({
      where: whereClause,
      order: [["scheduledDate", "DESC"]],
    });

    // Get participant details for each session
    const sessionsWithParticipants = await Promise.all(
      groupSessions.map(async (session) => {
        const participantDetails = await Elder.findAll({
          where: { id: { [Op.in]: session.participants } },
          attributes: ["id", "firstName", "lastName", "photo"],
        });

        return {
          ...session.toJSON(),
          participantDetails,
        };
      })
    );

    res.status(200).json({
      count: sessionsWithParticipants.length,
      groupSessions: sessionsWithParticipants,
    });
  } catch (error) {
    console.error("Error fetching group sessions:", error);
    res.status(500).json({
      message: "Error fetching group sessions",
      error: error.message,
    });
  }
};

// Get single group session by ID
const getGroupSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const specialistId = req.user.id;

    const groupSession = await GroupTherapySession.findOne({
      where: { id: sessionId, specialistId },
    });

    if (!groupSession) {
      return res.status(404).json({ message: "Group session not found" });
    }

    // Get participant details
    const participantDetails = await Elder.findAll({
      where: { id: { [Op.in]: groupSession.participants } },
      attributes: ["id", "firstName", "lastName", "photo", "dateOfBirth"],
    });

    res.status(200).json({
      groupSession: {
        ...groupSession.toJSON(),
        participantDetails,
      },
    });
  } catch (error) {
    console.error("Error fetching group session:", error);
    res.status(500).json({
      message: "Error fetching group session",
      error: error.message,
    });
  }
};

// Add participant to group session
const addParticipant = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { elderId } = req.body;
    const specialistId = req.user.id;

    const groupSession = await GroupTherapySession.findOne({
      where: { id: sessionId, specialistId },
    });

    if (!groupSession) {
      return res.status(404).json({ message: "Group session not found" });
    }

    // Check if already at max capacity
    if (groupSession.participants.length >= groupSession.maxParticipants) {
      return res.status(400).json({
        message: "Group session is at maximum capacity",
      });
    }

    // Check if elder already added
    if (groupSession.participants.includes(elderId)) {
      return res.status(400).json({
        message: "Elder is already added to this session",
      });
    }

    // Verify elder is assigned to this specialist
    const { MentalHealthAssignment } = require("../models");
    const assignment = await MentalHealthAssignment.findOne({
      where: { elderId, specialistId, status: "active" },
    });

    if (!assignment) {
      return res.status(403).json({
        message: "Elder is not assigned to you",
      });
    }

    // Add participant
    groupSession.participants = [...groupSession.participants, elderId];
    await groupSession.save();

    // Create individual therapy session linked to group
    await TherapySession.create({
      elderId,
      specialistId,
      sessionType: "group",
      therapyType: "Group Therapy",
      status: "scheduled",
      scheduledDate: groupSession.scheduledDate,
      scheduledTime: groupSession.scheduledTime,
      duration: groupSession.duration,
      location: groupSession.location,
      groupSessionId: groupSession.id,
      sessionGoals: ["Participate in group therapy"],
      sessionNotes: `Group session: ${groupSession.sessionName}`,
    });

    res.status(200).json({
      message: "Participant added successfully",
      groupSession,
    });
  } catch (error) {
    console.error("Error adding participant:", error);
    res.status(500).json({
      message: "Error adding participant",
      error: error.message,
    });
  }
};

// Remove participant from group session
const removeParticipant = async (req, res) => {
  try {
    const { sessionId, elderId } = req.params;
    const specialistId = req.user.id;

    const groupSession = await GroupTherapySession.findOne({
      where: { id: sessionId, specialistId },
    });

    if (!groupSession) {
      return res.status(404).json({ message: "Group session not found" });
    }

    // Remove participant
    groupSession.participants = groupSession.participants.filter(
      (id) => id !== elderId
    );
    await groupSession.save();

    // Cancel linked individual session
    await TherapySession.update(
      { status: "cancelled" },
      {
        where: {
          elderId,
          groupSessionId: sessionId,
          status: "scheduled",
        },
      }
    );

    res.status(200).json({
      message: "Participant removed successfully",
      groupSession,
    });
  } catch (error) {
    console.error("Error removing participant:", error);
    res.status(500).json({
      message: "Error removing participant",
      error: error.message,
    });
  }
};

// Update group session
const updateGroupSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const specialistId = req.user.id;
    const updates = req.body;

    const groupSession = await GroupTherapySession.findOne({
      where: { id: sessionId, specialistId },
    });

    if (!groupSession) {
      return res.status(404).json({ message: "Group session not found" });
    }

    const allowedFields = [
      "sessionName",
      "description",
      "maxParticipants",
      "scheduledDate",
      "scheduledTime",
      "duration",
      "location",
      "meetingLink",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        groupSession[field] = updates[field];
      }
    });

    await groupSession.save();

    res.status(200).json({
      message: "Group session updated successfully",
      groupSession,
    });
  } catch (error) {
    console.error("Error updating group session:", error);
    res.status(500).json({
      message: "Error updating group session",
      error: error.message,
    });
  }
};

// Complete group session
const completeGroupSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const specialistId = req.user.id;

    const groupSession = await GroupTherapySession.findOne({
      where: { id: sessionId, specialistId },
    });

    if (!groupSession) {
      return res.status(404).json({ message: "Group session not found" });
    }

    groupSession.status = "completed";
    await groupSession.save();

    // Mark all linked individual sessions as completed
    await TherapySession.update(
      { status: "completed", completedDate: new Date() },
      {
        where: {
          groupSessionId: sessionId,
          status: "scheduled",
        },
      }
    );

    res.status(200).json({
      message: "Group session completed successfully",
      groupSession,
    });
  } catch (error) {
    console.error("Error completing group session:", error);
    res.status(500).json({
      message: "Error completing group session",
      error: error.message,
    });
  }
};

// Cancel group session
const cancelGroupSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const specialistId = req.user.id;

    const groupSession = await GroupTherapySession.findOne({
      where: { id: sessionId, specialistId },
    });

    if (!groupSession) {
      return res.status(404).json({ message: "Group session not found" });
    }

    groupSession.status = "cancelled";
    await groupSession.save();

    // Cancel all linked individual sessions
    await TherapySession.update(
      { status: "cancelled" },
      {
        where: {
          groupSessionId: sessionId,
          status: "scheduled",
        },
      }
    );

    res.status(200).json({
      message: "Group session cancelled successfully",
      groupSession,
    });
  } catch (error) {
    console.error("Error cancelling group session:", error);
    res.status(500).json({
      message: "Error cancelling group session",
      error: error.message,
    });
  }
};

module.exports = {
  createGroupSession,
  getSpecialistGroupSessions,
  getGroupSessionById,
  addParticipant,
  removeParticipant,
  updateGroupSession,
  completeGroupSession,
  cancelGroupSession,
};
