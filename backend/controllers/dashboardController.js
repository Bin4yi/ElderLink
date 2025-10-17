// backend/controllers/dashboardController.js
const {
  MentalHealthAssignment,
  TherapySession,
  MentalHealthAssessment,
  TreatmentPlan,
  ProgressReport,
  Elder,
  User,
} = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// Get comprehensive dashboard statistics
const getDashboardStatistics = async (req, res) => {
  try {
    const specialistId = req.user.id;

    // Total Clients
    const totalClients = await MentalHealthAssignment.count({
      where: { specialistId, status: "active" },
    });

    // Sessions Today
    const today = new Date().toISOString().split("T")[0];
    const sessionsToday = await TherapySession.count({
      where: {
        specialistId,
        scheduledDate: today,
        status: "scheduled",
      },
    });

    // Pending Assessments
    const pendingAssessments = await MentalHealthAssessment.count({
      where: {
        specialistId,
        status: { [Op.in]: ["scheduled", "in_progress"] },
      },
    });

    // Active Treatment Plans
    const activeTreatmentPlans = await TreatmentPlan.count({
      where: {
        specialistId,
        status: "active",
      },
    });

    // Upcoming Sessions (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingSessions = await TherapySession.findAll({
      where: {
        specialistId,
        scheduledDate: {
          [Op.between]: [today, nextWeek.toISOString().split("T")[0]],
        },
        status: "scheduled",
      },
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
      limit: 5,
    });

    // Recent Assessments
    const recentAssessments = await MentalHealthAssessment.findAll({
      where: { specialistId },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "photo"],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit: 5,
    });

    // Critical Clients (high risk assessments or critical treatment plans)
    const criticalClients = await MentalHealthAssessment.count({
      where: {
        specialistId,
        riskLevel: "high",
        status: { [Op.ne]: "completed" },
      },
    });

    // Monthly session trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySessionTrends = await TherapySession.findAll({
      where: {
        specialistId,
        createdAt: { [Op.gte]: sixMonthsAgo },
      },
      attributes: [
        [
          sequelize.fn("DATE_TRUNC", "month", sequelize.col("createdAt")),
          "month",
        ],
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      group: [sequelize.fn("DATE_TRUNC", "month", sequelize.col("createdAt"))],
      order: [
        [
          sequelize.fn("DATE_TRUNC", "month", sequelize.col("createdAt")),
          "ASC",
        ],
      ],
    });

    // Client progress overview
    const clientProgress = await ProgressReport.findAll({
      where: { specialistId },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("mentalHealthScore")), "avgScore"],
        [sequelize.fn("AVG", sequelize.col("overallProgress")), "avgProgress"],
      ],
    });

    res.status(200).json({
      statistics: {
        totalClients,
        sessionsToday,
        pendingAssessments,
        activeTreatmentPlans,
        criticalClients,
      },
      upcomingSessions,
      recentAssessments,
      monthlySessionTrends,
      clientProgress: {
        averageScore: clientProgress[0]?.dataValues.avgScore || 0,
        averageProgress: clientProgress[0]?.dataValues.avgProgress || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    res.status(500).json({
      message: "Error fetching dashboard statistics",
      error: error.message,
    });
  }
};

// Get today's schedule
const getTodaySchedule = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const todaySessions = await TherapySession.findAll({
      where: {
        specialistId,
        scheduledDate: today,
      },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "photo"],
        },
      ],
      order: [["scheduledTime", "ASC"]],
    });

    const todayAssessments = await MentalHealthAssessment.findAll({
      where: {
        specialistId,
        scheduledDate: today,
      },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "photo"],
        },
      ],
    });

    res.status(200).json({
      todaySessions,
      todayAssessments,
    });
  } catch (error) {
    console.error("Error fetching today schedule:", error);
    res.status(500).json({
      message: "Error fetching today schedule",
      error: error.message,
    });
  }
};

// Get recent activities
const getRecentActivities = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    // Get recent sessions
    const recentSessions = await TherapySession.findAll({
      where: { specialistId },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["updatedAt", "DESC"]],
      limit: limit,
    });

    // Get recent assessments
    const recentAssessments = await MentalHealthAssessment.findAll({
      where: { specialistId },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["updatedAt", "DESC"]],
      limit: limit,
    });

    // Get recent treatment plans
    const recentTreatmentPlans = await TreatmentPlan.findAll({
      where: { specialistId },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["updatedAt", "DESC"]],
      limit: limit,
    });

    // Get recent progress reports
    const recentProgressReports = await ProgressReport.findAll({
      where: { specialistId },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["updatedAt", "DESC"]],
      limit: limit,
    });

    // Combine and sort all activities
    const allActivities = [
      ...recentSessions.map((s) => ({
        type: "session",
        action: s.status === "completed" ? "completed" : "scheduled",
        data: s,
        timestamp: s.updatedAt,
      })),
      ...recentAssessments.map((a) => ({
        type: "assessment",
        action: a.status === "completed" ? "completed" : "scheduled",
        data: a,
        timestamp: a.updatedAt,
      })),
      ...recentTreatmentPlans.map((t) => ({
        type: "treatment_plan",
        action: t.status === "active" ? "created" : "updated",
        data: t,
        timestamp: t.updatedAt,
      })),
      ...recentProgressReports.map((p) => ({
        type: "progress_report",
        action: "created",
        data: p,
        timestamp: p.updatedAt,
      })),
    ];

    // Sort by timestamp and limit
    allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const limitedActivities = allActivities.slice(0, limit);

    res.status(200).json({
      count: limitedActivities.length,
      activities: limitedActivities,
    });
  } catch (error) {
    console.error("Error fetching recent activities:", error);
    res.status(500).json({
      message: "Error fetching recent activities",
      error: error.message,
    });
  }
};

// Get alerts and notifications
const getAlerts = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const today = new Date().toISOString().split("T")[0];

    const alerts = [];

    // Overdue sessions
    const overdueSessions = await TherapySession.findAll({
      where: {
        specialistId,
        scheduledDate: { [Op.lt]: today },
        status: "scheduled",
      },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    overdueSessions.forEach((session) => {
      alerts.push({
        type: "overdue_session",
        priority: "high",
        message: `Session with ${session.elder.firstName} ${session.elder.lastName} is overdue`,
        data: session,
      });
    });

    // Urgent assessments
    const urgentAssessments = await MentalHealthAssessment.findAll({
      where: {
        specialistId,
        status: "urgent",
      },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    urgentAssessments.forEach((assessment) => {
      alerts.push({
        type: "urgent_assessment",
        priority: "critical",
        message: `Urgent assessment required for ${assessment.elder.firstName} ${assessment.elder.lastName}`,
        data: assessment,
      });
    });

    // High risk clients
    const highRiskClients = await MentalHealthAssessment.findAll({
      where: {
        specialistId,
        riskLevel: "high",
        status: { [Op.ne]: "completed" },
      },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    highRiskClients.forEach((assessment) => {
      alerts.push({
        type: "high_risk_client",
        priority: "critical",
        message: `${assessment.elder.firstName} ${assessment.elder.lastName} is high risk - requires attention`,
        data: assessment,
      });
    });

    // Critical treatment plans
    const criticalPlans = await TreatmentPlan.findAll({
      where: {
        specialistId,
        status: "critical",
      },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    criticalPlans.forEach((plan) => {
      alerts.push({
        type: "critical_treatment_plan",
        priority: "high",
        message: `Treatment plan for ${plan.elder.firstName} ${plan.elder.lastName} requires immediate attention`,
        data: plan,
      });
    });

    // Sort by priority
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    alerts.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    res.status(200).json({
      count: alerts.length,
      alerts,
    });
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({
      message: "Error fetching alerts",
      error: error.message,
    });
  }
};

module.exports = {
  getDashboardStatistics,
  getTodaySchedule,
  getRecentActivities,
  getAlerts,
};
