// backend/controllers/therapySessionController.js
const {
  TherapySession,
  Elder,
  User,
  GroupTherapySession,
} = require("../models");
const { Op } = require("sequelize");

// Create a therapy session (first session or regular)
const createSession = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const {
      elderId,
      sessionType,
      therapyType,
      scheduledDate,
      scheduledTime,
      duration,
      location,
      zoomLink,
      sessionGoals,
      notes,
      isFirstSession,
    } = req.body;

    // Verify elder is assigned to this specialist
    const { MentalHealthAssignment } = require("../models");
    const assignment = await MentalHealthAssignment.findOne({
      where: {
        elderId,
        specialistId,
        status: "active",
      },
    });

    if (!assignment) {
      return res.status(403).json({
        message: "Elder is not assigned to you",
      });
    }

    // Get elder emergency contact
    const elder = await Elder.findByPk(elderId);
    const emergencyContact = {
      name: elder.emergencyContactName || "N/A",
      phone: elder.emergencyContactPhone || "N/A",
      relationship: elder.emergencyContactRelation || "N/A",
    };

    // Determine session number
    const sessionCount = await TherapySession.count({
      where: { elderId, specialistId },
    });

    const session = await TherapySession.create({
      elderId,
      specialistId,
      sessionType,
      therapyType,
      status: "scheduled",
      sessionNumber: sessionCount + 1,
      isFirstSession: isFirstSession || sessionCount === 0,
      isMonthlySession: false,
      autoScheduled: false,
      scheduledDate,
      scheduledTime,
      duration: duration || 60,
      location: location || "video_call",
      zoomLink,
      sessionGoals: sessionGoals || [],
      sessionNotes: notes,
      emergencyContact,
    });

    const completeSession = await TherapySession.findByPk(session.id, {
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    res.status(201).json({
      message: "Therapy session created successfully",
      session: completeSession,
    });
  } catch (error) {
    console.error("Error creating therapy session:", error);
    res.status(500).json({
      message: "Error creating therapy session",
      error: error.message,
    });
  }
};

// Get all sessions for a specialist
const getSpecialistSessions = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const { status, elderId, startDate, endDate } = req.query;

    const whereClause = { specialistId };

    if (status) whereClause.status = status;
    if (elderId) whereClause.elderId = elderId;

    if (startDate && endDate) {
      whereClause.scheduledDate = {
        [Op.between]: [startDate, endDate],
      };
    }

    const sessions = await TherapySession.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "photo"],
        },
      ],
      order: [
        ["scheduledDate", "ASC"],
        ["scheduledTime", "ASC"],
      ],
    });

    res.status(200).json({
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error("Error fetching sessions:", error);
    res.status(500).json({
      message: "Error fetching sessions",
      error: error.message,
    });
  }
};

// Complete a session and auto-schedule next monthly session
const completeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { sessionNotes, homework, nextSessionDate } = req.body;
    const specialistId = req.user.id;

    const session = await TherapySession.findOne({
      where: { id: sessionId, specialistId },
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Update session as completed
    session.status = "completed";
    session.completedDate = new Date();
    if (sessionNotes) session.sessionNotes = sessionNotes;
    if (homework) session.homework = homework;

    // Calculate next monthly session date (30 days from completed date)
    const nextMonthDate = new Date();
    nextMonthDate.setDate(nextMonthDate.getDate() + 30);
    session.nextSessionDate =
      nextSessionDate || nextMonthDate.toISOString().split("T")[0];

    await session.save();

    // Auto-schedule next monthly session if this was first session or monthly session
    if (session.isFirstSession || session.isMonthlySession) {
      await TherapySession.create({
        elderId: session.elderId,
        specialistId: session.specialistId,
        sessionType: session.sessionType,
        therapyType: session.therapyType,
        status: "scheduled",
        sessionNumber: session.sessionNumber + 1,
        isFirstSession: false,
        isMonthlySession: true,
        autoScheduled: true,
        scheduledDate: session.nextSessionDate,
        scheduledTime: session.scheduledTime,
        duration: session.duration,
        location: session.location,
        zoomLink: session.zoomLink,
        sessionGoals: [
          "Review monthly progress",
          "Adjust treatment plan as needed",
        ],
        sessionNotes: `Auto-scheduled monthly follow-up session #${
          session.sessionNumber + 1
        }`,
        emergencyContact: session.emergencyContact,
      });
    }

    res.status(200).json({
      message: "Session completed and next session scheduled",
      session,
    });
  } catch (error) {
    console.error("Error completing session:", error);
    res.status(500).json({
      message: "Error completing session",
      error: error.message,
    });
  }
};

// Update session details
const updateSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;
    const specialistId = req.user.id;

    const session = await TherapySession.findOne({
      where: { id: sessionId, specialistId },
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Update allowed fields
    const allowedFields = [
      "scheduledDate",
      "scheduledTime",
      "duration",
      "location",
      "zoomLink",
      "sessionGoals",
      "sessionNotes",
      "homework",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        session[field] = updates[field];
      }
    });

    await session.save();

    res.status(200).json({
      message: "Session updated successfully",
      session,
    });
  } catch (error) {
    console.error("Error updating session:", error);
    res.status(500).json({
      message: "Error updating session",
      error: error.message,
    });
  }
};

// Cancel a session
const cancelSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const specialistId = req.user.id;

    const session = await TherapySession.findOne({
      where: { id: sessionId, specialistId },
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.status = "cancelled";
    await session.save();

    res.status(200).json({
      message: "Session cancelled successfully",
      session,
    });
  } catch (error) {
    console.error("Error cancelling session:", error);
    res.status(500).json({
      message: "Error cancelling session",
      error: error.message,
    });
  }
};

// Get session statistics for dashboard
const getSessionStatistics = async (req, res) => {
  try {
    const specialistId = req.user.id;

    const totalSessions = await TherapySession.count({
      where: { specialistId },
    });

    const completedSessions = await TherapySession.count({
      where: { specialistId, status: "completed" },
    });

    const scheduledSessions = await TherapySession.count({
      where: { specialistId, status: "scheduled" },
    });

    const overdueSessions = await TherapySession.count({
      where: {
        specialistId,
        status: "overdue",
      },
    });

    const monthlySessions = await TherapySession.count({
      where: {
        specialistId,
        isMonthlySession: true,
      },
    });

    // Active clients (unique elders with active sessions)
    const activeClients = await TherapySession.findAll({
      where: { specialistId },
      attributes: ["elderId"],
      group: ["elderId"],
    });

    res.status(200).json({
      statistics: {
        totalSessions,
        completedSessions,
        scheduledSessions,
        overdueSessions,
        monthlySessions,
        activeClients: activeClients.length,
      },
    });
  } catch (error) {
    console.error("Error fetching session statistics:", error);
    res.status(500).json({
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

module.exports = {
  createSession,
  getSpecialistSessions,
  completeSession,
  updateSession,
  cancelSession,
  getSessionStatistics,
};
