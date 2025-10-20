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

    // Only allow editing scheduled sessions
    if (session.status !== "scheduled") {
      return res.status(400).json({
        message: "Only scheduled sessions can be edited",
      });
    }

    // Check if session date is in the future
    const sessionDate = new Date(session.scheduledDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (sessionDate < today) {
      return res.status(400).json({
        message: "Cannot edit past sessions",
      });
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
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        session[field] = updates[field];
      }
    });

    await session.save();

    // Fetch updated session with elder details
    const updatedSession = await TherapySession.findByPk(session.id, {
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "photo"],
        },
      ],
    });

    res.status(200).json({
      message: "Session updated successfully",
      session: updatedSession,
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

// Get all sessions for an elder (for elder dashboard)
const getElderSessions = async (req, res) => {
  try {
    // Check if user is an elder
    if (req.user.role !== "elder") {
      return res.status(403).json({
        message: "Access denied. Elder role required.",
      });
    }

    // Get elder record from userId
    const elder = await Elder.findOne({ where: { userId: req.user.id } });

    if (!elder) {
      return res.status(404).json({
        message: "Elder profile not found",
      });
    }

    const elderId = elder.id;
    const { status } = req.query;
    const whereClause = { elderId };

    if (status) {
      whereClause.status = status;
    }

    const sessions = await TherapySession.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: "specialist",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "photo",
          ],
        },
      ],
      order: [
        ["scheduledDate", "DESC"],
        ["scheduledTime", "DESC"],
      ],
    });

    // Calculate statistics
    const statistics = {
      total: sessions.length,
      scheduled: sessions.filter((s) => s.status === "scheduled").length,
      completed: sessions.filter((s) => s.status === "completed").length,
      upcoming: sessions.filter(
        (s) =>
          s.status === "scheduled" && new Date(s.scheduledDate) >= new Date()
      ).length,
    };

    res.status(200).json({
      count: sessions.length,
      sessions,
      statistics,
    });
  } catch (error) {
    console.error("Error fetching elder sessions:", error);
    res.status(500).json({
      message: "Error fetching sessions",
      error: error.message,
    });
  }
};

// Create Zoom meeting for a therapy session
const createZoomMeeting = async (req, res) => {
  try {
    console.log(
      "📹 Creating Zoom meeting for therapy session:",
      req.params.sessionId
    );

    const sessionId = req.params.sessionId;
    const specialistId = req.user.id;
    const zoomService = require("../services/zoomService");

    // Get therapy session with elder and specialist details
    const session = await TherapySession.findOne({
      where: {
        id: sessionId,
        specialistId,
      },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName"],
        },
        {
          model: User,
          as: "specialist",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Therapy session not found or you are not authorized",
      });
    }

    // Check if Zoom meeting already exists
    if (session.zoomLink && session.zoomLink.includes("zoom.us")) {
      return res.status(400).json({
        success: false,
        message: "Zoom meeting already exists for this session",
        data: {
          joinUrl: session.zoomLink,
        },
      });
    }

    // Create Zoom meeting
    const meetingTopic = `Therapy Session with ${session.specialist.firstName} ${session.specialist.lastName} - ${session.elder.firstName} ${session.elder.lastName}`;
    const meetingStartTime = new Date(
      `${session.scheduledDate}T${session.scheduledTime}`
    );

    const meeting = await zoomService.createMeeting({
      topic: meetingTopic,
      startTime: zoomService.formatDateForZoom(meetingStartTime),
      duration: session.duration || 60,
      agenda: session.sessionNotes || "Mental Health Therapy Session",
      waitingRoom: true,
      joinBeforeHost: false,
      autoRecording: "none",
    });

    // Update session with Zoom details
    await session.update({
      zoomLink: meeting.joinUrl,
    });

    console.log("✅ Zoom meeting created and saved:", meeting.meetingId);

    res.json({
      success: true,
      message: "Zoom meeting created successfully",
      data: {
        sessionId: session.id,
        meetingId: meeting.meetingId,
        joinUrl: meeting.joinUrl,
        startUrl: meeting.startUrl,
        password: meeting.password,
        topic: meeting.topic,
        startTime: meeting.startTime,
      },
    });
  } catch (error) {
    console.error("❌ Error creating Zoom meeting:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create Zoom meeting",
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
  getElderSessions,
  createZoomMeeting,
};
