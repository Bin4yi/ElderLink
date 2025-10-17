// backend/controllers/assessmentController.js
const { MentalHealthAssessment, Elder, User } = require("../models");
const { Op } = require("sequelize");

// Create a new assessment
const createAssessment = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const {
      elderId,
      assessmentType,
      priority,
      scheduledDate,
      duration,
      notes,
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

    const assessment = await MentalHealthAssessment.create({
      elderId,
      specialistId,
      assessmentType,
      status: "scheduled",
      priority: priority || "medium",
      scheduledDate,
      duration: duration || 60,
      riskLevel: "low",
    });

    const completeAssessment = await MentalHealthAssessment.findByPk(
      assessment.id,
      {
        include: [
          {
            model: Elder,
            as: "elder",
            attributes: ["id", "firstName", "lastName", "dateOfBirth"],
          },
        ],
      }
    );

    res.status(201).json({
      message: "Assessment created successfully",
      assessment: completeAssessment,
    });
  } catch (error) {
    console.error("Error creating assessment:", error);
    res.status(500).json({
      message: "Error creating assessment",
      error: error.message,
    });
  }
};

// Get all assessments for a specialist
const getSpecialistAssessments = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const { status, priority, elderId } = req.query;

    const whereClause = { specialistId };

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (elderId) whereClause.elderId = elderId;

    const assessments = await MentalHealthAssessment.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "photo"],
        },
      ],
      order: [
        ["scheduledDate", "DESC"],
        ["priority", "DESC"],
      ],
    });

    res.status(200).json({
      count: assessments.length,
      assessments,
    });
  } catch (error) {
    console.error("Error fetching assessments:", error);
    res.status(500).json({
      message: "Error fetching assessments",
      error: error.message,
    });
  }
};

// Get single assessment by ID
const getAssessmentById = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const specialistId = req.user.id;

    const assessment = await MentalHealthAssessment.findOne({
      where: { id: assessmentId, specialistId },
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

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    res.status(200).json({ assessment });
  } catch (error) {
    console.error("Error fetching assessment:", error);
    res.status(500).json({
      message: "Error fetching assessment",
      error: error.message,
    });
  }
};

// Complete an assessment with findings
const completeAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const specialistId = req.user.id;
    const { score, findings, recommendations, riskLevel, nextAssessment } =
      req.body;

    const assessment = await MentalHealthAssessment.findOne({
      where: { id: assessmentId, specialistId },
    });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Update assessment with completion data
    assessment.status = "completed";
    assessment.completedDate = new Date();
    assessment.score = score;
    assessment.findings = findings;
    assessment.recommendations = recommendations;
    assessment.riskLevel = riskLevel || assessment.riskLevel;
    assessment.nextAssessment = nextAssessment;

    await assessment.save();

    const completeAssessment = await MentalHealthAssessment.findByPk(
      assessmentId,
      {
        include: [
          {
            model: Elder,
            as: "elder",
            attributes: ["id", "firstName", "lastName"],
          },
        ],
      }
    );

    res.status(200).json({
      message: "Assessment completed successfully",
      assessment: completeAssessment,
    });
  } catch (error) {
    console.error("Error completing assessment:", error);
    res.status(500).json({
      message: "Error completing assessment",
      error: error.message,
    });
  }
};

// Update assessment
const updateAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const specialistId = req.user.id;
    const updates = req.body;

    const assessment = await MentalHealthAssessment.findOne({
      where: { id: assessmentId, specialistId },
    });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    // Update allowed fields
    const allowedFields = [
      "assessmentType",
      "priority",
      "scheduledDate",
      "duration",
      "status",
      "score",
      "findings",
      "recommendations",
      "riskLevel",
      "nextAssessment",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        assessment[field] = updates[field];
      }
    });

    await assessment.save();

    res.status(200).json({
      message: "Assessment updated successfully",
      assessment,
    });
  } catch (error) {
    console.error("Error updating assessment:", error);
    res.status(500).json({
      message: "Error updating assessment",
      error: error.message,
    });
  }
};

// Delete assessment
const deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const specialistId = req.user.id;

    const assessment = await MentalHealthAssessment.findOne({
      where: { id: assessmentId, specialistId },
    });

    if (!assessment) {
      return res.status(404).json({ message: "Assessment not found" });
    }

    await assessment.destroy();

    res.status(200).json({
      message: "Assessment deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting assessment:", error);
    res.status(500).json({
      message: "Error deleting assessment",
      error: error.message,
    });
  }
};

// Get assessment statistics
const getAssessmentStatistics = async (req, res) => {
  try {
    const specialistId = req.user.id;

    const totalAssessments = await MentalHealthAssessment.count({
      where: { specialistId },
    });

    const completedAssessments = await MentalHealthAssessment.count({
      where: { specialistId, status: "completed" },
    });

    const pendingAssessments = await MentalHealthAssessment.count({
      where: { specialistId, status: "scheduled" },
    });

    const urgentAssessments = await MentalHealthAssessment.count({
      where: { specialistId, status: "urgent" },
    });

    const highRiskClients = await MentalHealthAssessment.count({
      where: { specialistId, riskLevel: "high" },
    });

    res.status(200).json({
      statistics: {
        totalAssessments,
        completedAssessments,
        pendingAssessments,
        urgentAssessments,
        highRiskClients,
      },
    });
  } catch (error) {
    console.error("Error fetching assessment statistics:", error);
    res.status(500).json({
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

module.exports = {
  createAssessment,
  getSpecialistAssessments,
  getAssessmentById,
  completeAssessment,
  updateAssessment,
  deleteAssessment,
  getAssessmentStatistics,
};
