// backend/controllers/progressReportController.js
const { ProgressReport, Elder, User } = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// Create a new progress report
const createProgressReport = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const {
      elderId,
      reportType,
      period,
      overallProgress,
      mentalHealthScore,
      previousScore,
      keyMetrics,
      highlights,
      concerns,
      recommendations,
      nextReview,
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

    const progressReport = await ProgressReport.create({
      elderId,
      specialistId,
      reportType,
      period,
      status: "completed",
      dateCreated: new Date(),
      overallProgress: overallProgress || 0,
      mentalHealthScore,
      previousScore,
      keyMetrics: keyMetrics || {},
      highlights: highlights || [],
      concerns: concerns || [],
      recommendations: recommendations || [],
      nextReview,
    });

    const completeReport = await ProgressReport.findByPk(progressReport.id, {
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    res.status(201).json({
      message: "Progress report created successfully",
      progressReport: completeReport,
    });
  } catch (error) {
    console.error("Error creating progress report:", error);
    res.status(500).json({
      message: "Error creating progress report",
      error: error.message,
    });
  }
};

// Get all progress reports for a specialist
const getSpecialistProgressReports = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const { status, elderId, reportType } = req.query;

    const whereClause = { specialistId };

    if (status) whereClause.status = status;
    if (elderId) whereClause.elderId = elderId;
    if (reportType) whereClause.reportType = { [Op.like]: `%${reportType}%` };

    const progressReports = await ProgressReport.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "photo"],
        },
      ],
      order: [["dateCreated", "DESC"]],
    });

    res.status(200).json({
      count: progressReports.length,
      progressReports,
    });
  } catch (error) {
    console.error("Error fetching progress reports:", error);
    res.status(500).json({
      message: "Error fetching progress reports",
      error: error.message,
    });
  }
};

// Get single progress report by ID
const getProgressReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    const specialistId = req.user.id;

    const progressReport = await ProgressReport.findOne({
      where: { id: reportId, specialistId },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "dateOfBirth", "photo"],
        },
        {
          model: User,
          as: "specialist",
          attributes: ["id", "firstName", "lastName", "specialization"],
        },
      ],
    });

    if (!progressReport) {
      return res.status(404).json({ message: "Progress report not found" });
    }

    res.status(200).json({ progressReport });
  } catch (error) {
    console.error("Error fetching progress report:", error);
    res.status(500).json({
      message: "Error fetching progress report",
      error: error.message,
    });
  }
};

// Update progress report
const updateProgressReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const specialistId = req.user.id;
    const updates = req.body;

    const progressReport = await ProgressReport.findOne({
      where: { id: reportId, specialistId },
    });

    if (!progressReport) {
      return res.status(404).json({ message: "Progress report not found" });
    }

    // Update allowed fields
    const allowedFields = [
      "reportType",
      "period",
      "status",
      "overallProgress",
      "mentalHealthScore",
      "previousScore",
      "keyMetrics",
      "highlights",
      "concerns",
      "recommendations",
      "nextReview",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        progressReport[field] = updates[field];
      }
    });

    await progressReport.save();

    res.status(200).json({
      message: "Progress report updated successfully",
      progressReport,
    });
  } catch (error) {
    console.error("Error updating progress report:", error);
    res.status(500).json({
      message: "Error updating progress report",
      error: error.message,
    });
  }
};

// Delete progress report
const deleteProgressReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const specialistId = req.user.id;

    const progressReport = await ProgressReport.findOne({
      where: { id: reportId, specialistId },
    });

    if (!progressReport) {
      return res.status(404).json({ message: "Progress report not found" });
    }

    await progressReport.destroy();

    res.status(200).json({
      message: "Progress report deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting progress report:", error);
    res.status(500).json({
      message: "Error deleting progress report",
      error: error.message,
    });
  }
};

// Get progress report statistics
const getProgressReportStatistics = async (req, res) => {
  try {
    const specialistId = req.user.id;

    const totalReports = await ProgressReport.count({
      where: { specialistId },
    });

    const improvingClients = await ProgressReport.count({
      where: {
        specialistId,
        mentalHealthScore: { [Op.gt]: sequelize.col("previousScore") },
      },
    });

    const stableClients = await ProgressReport.count({
      where: {
        specialistId,
        mentalHealthScore: sequelize.col("previousScore"),
      },
    });

    const urgentReports = await ProgressReport.count({
      where: { specialistId, status: "urgent" },
    });

    res.status(200).json({
      statistics: {
        totalReports,
        improvingClients,
        stableClients,
        urgentReports,
      },
    });
  } catch (error) {
    console.error("Error fetching progress report statistics:", error);
    res.status(500).json({
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

module.exports = {
  createProgressReport,
  getSpecialistProgressReports,
  getProgressReportById,
  updateProgressReport,
  deleteProgressReport,
  getProgressReportStatistics,
};
