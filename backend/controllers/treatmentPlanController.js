// backend/controllers/treatmentPlanController.js
const {
  TreatmentPlan,
  TreatmentPlanProgress,
  Elder,
  User,
} = require("../models");
const { Op } = require("sequelize");
const sequelize = require("../config/database");

// Create a new treatment plan
const createTreatmentPlan = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const {
      elderId,
      planTitle,
      priority,
      startDate,
      endDate,
      primaryDiagnosis,
      secondaryDiagnosis,
      goals,
      interventions,
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

    const treatmentPlan = await TreatmentPlan.create({
      elderId,
      specialistId,
      planTitle,
      status: "active",
      priority: priority || "medium",
      startDate,
      endDate,
      progress: 0,
      primaryDiagnosis,
      secondaryDiagnosis,
      goals: goals || [],
      interventions: interventions || [],
      nextReview,
      lastUpdated: new Date(),
    });

    const completePlan = await TreatmentPlan.findByPk(treatmentPlan.id, {
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
    });

    res.status(201).json({
      message: "Treatment plan created successfully",
      treatmentPlan: completePlan,
    });
  } catch (error) {
    console.error("Error creating treatment plan:", error);
    res.status(500).json({
      message: "Error creating treatment plan",
      error: error.message,
    });
  }
};

// Get all treatment plans for a specialist
const getSpecialistTreatmentPlans = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const { status, priority, elderId } = req.query;

    const whereClause = { specialistId };

    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (elderId) whereClause.elderId = elderId;

    const treatmentPlans = await TreatmentPlan.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "photo"],
        },
        {
          model: TreatmentPlanProgress,
          as: "progressReports",
          include: [
            {
              model: User,
              as: "caregiver",
              attributes: ["firstName", "lastName"],
            },
          ],
          limit: 5,
          order: [["reportDate", "DESC"]],
        },
      ],
      order: [["startDate", "DESC"]],
    });

    res.status(200).json({
      count: treatmentPlans.length,
      treatmentPlans,
    });
  } catch (error) {
    console.error("Error fetching treatment plans:", error);
    res.status(500).json({
      message: "Error fetching treatment plans",
      error: error.message,
    });
  }
};

// Get treatment plans for caregivers (staff) to see
const getCaregiverTreatmentPlans = async (req, res) => {
  try {
    const caregiverId = req.user.id;
    const { elderId } = req.query;

    // Get elders assigned to this caregiver
    const { StaffAssignment } = require("../models");
    const assignments = await StaffAssignment.findAll({
      where: {
        staffId: caregiverId,
        isActive: true,
      },
      attributes: ["elderId"],
    });

    const elderIds = assignments.map((a) => a.elderId);

    if (elderIds.length === 0) {
      return res.status(200).json({
        count: 0,
        treatmentPlans: [],
      });
    }

    const whereClause = {
      elderId: { [Op.in]: elderIds },
      status: "active",
    };

    if (elderId) {
      whereClause.elderId = elderId;
    }

    const treatmentPlans = await TreatmentPlan.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "photo"],
        },
        {
          model: User,
          as: "specialist",
          attributes: ["id", "firstName", "lastName", "specialization"],
        },
        {
          model: TreatmentPlanProgress,
          as: "progressReports",
          where: { caregiverId },
          required: false,
          separate: true,
          limit: 3,
          order: [["reportDate", "DESC"]],
        },
      ],
      order: [["startDate", "DESC"]],
    });

    res.status(200).json({
      count: treatmentPlans.length,
      treatmentPlans,
    });
  } catch (error) {
    console.error("Error fetching caregiver treatment plans:", error);
    res.status(500).json({
      message: "Error fetching treatment plans",
      error: error.message,
    });
  }
};

// Get single treatment plan by ID
const getTreatmentPlanById = async (req, res) => {
  try {
    const { planId } = req.params;
    const userId = req.user.id;

    const treatmentPlan = await TreatmentPlan.findByPk(planId, {
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
        {
          model: TreatmentPlanProgress,
          as: "progressReports",
          include: [
            {
              model: User,
              as: "caregiver",
              attributes: ["firstName", "lastName"],
            },
          ],
          order: [["reportDate", "DESC"]],
        },
      ],
    });

    if (!treatmentPlan) {
      return res.status(404).json({ message: "Treatment plan not found" });
    }

    res.status(200).json({ treatmentPlan });
  } catch (error) {
    console.error("Error fetching treatment plan:", error);
    res.status(500).json({
      message: "Error fetching treatment plan",
      error: error.message,
    });
  }
};

// Update treatment plan
const updateTreatmentPlan = async (req, res) => {
  try {
    const { planId } = req.params;
    const specialistId = req.user.id;
    const updates = req.body;

    const treatmentPlan = await TreatmentPlan.findOne({
      where: { id: planId, specialistId },
    });

    if (!treatmentPlan) {
      return res.status(404).json({ message: "Treatment plan not found" });
    }

    // Update allowed fields
    const allowedFields = [
      "planTitle",
      "status",
      "priority",
      "endDate",
      "progress",
      "primaryDiagnosis",
      "secondaryDiagnosis",
      "goals",
      "interventions",
      "nextReview",
    ];

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined) {
        treatmentPlan[field] = updates[field];
      }
    });

    treatmentPlan.lastUpdated = new Date();
    await treatmentPlan.save();

    res.status(200).json({
      message: "Treatment plan updated successfully",
      treatmentPlan,
    });
  } catch (error) {
    console.error("Error updating treatment plan:", error);
    res.status(500).json({
      message: "Error updating treatment plan",
      error: error.message,
    });
  }
};

// Caregiver submits progress report
const submitProgressReport = async (req, res) => {
  try {
    const caregiverId = req.user.id;
    const { planId } = req.params;
    const { progressPercentage, notes, attachments } = req.body;

    // Verify treatment plan exists
    const treatmentPlan = await TreatmentPlan.findByPk(planId);

    if (!treatmentPlan) {
      return res.status(404).json({ message: "Treatment plan not found" });
    }

    // Verify caregiver is assigned to this elder
    const { StaffAssignment } = require("../models");
    const assignment = await StaffAssignment.findOne({
      where: {
        elderId: treatmentPlan.elderId,
        staffId: caregiverId,
        isActive: true,
      },
    });

    if (!assignment) {
      return res.status(403).json({
        message: "You are not assigned to this elder",
      });
    }

    // Create progress report
    const progressReport = await TreatmentPlanProgress.create({
      treatmentPlanId: planId,
      caregiverId,
      progressPercentage,
      notes,
      attachments: attachments || [],
      reportDate: new Date(),
    });

    // Update treatment plan progress (cumulative - add to existing progress)
    const currentProgress = treatmentPlan.progress || 0;
    const newProgress = Math.min(currentProgress + progressPercentage, 100); // Cap at 100%

    treatmentPlan.progress = newProgress;
    treatmentPlan.lastUpdated = new Date();
    await treatmentPlan.save();

    res.status(201).json({
      message: "Progress report submitted successfully",
      progressReport,
      updatedProgress: newProgress,
    });
  } catch (error) {
    console.error("Error submitting progress report:", error);
    res.status(500).json({
      message: "Error submitting progress report",
      error: error.message,
    });
  }
};

// Get progress reports for a treatment plan
const getProgressReports = async (req, res) => {
  try {
    const { planId } = req.params;

    const progressReports = await TreatmentPlanProgress.findAll({
      where: { treatmentPlanId: planId },
      include: [
        {
          model: User,
          as: "caregiver",
          attributes: ["id", "firstName", "lastName"],
        },
      ],
      order: [["reportDate", "DESC"]],
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

// Get treatment plan statistics
const getTreatmentPlanStatistics = async (req, res) => {
  try {
    const specialistId = req.user.id;

    const totalPlans = await TreatmentPlan.count({
      where: { specialistId },
    });

    const activePlans = await TreatmentPlan.count({
      where: { specialistId, status: "active" },
    });

    const criticalPlans = await TreatmentPlan.count({
      where: { specialistId, status: "critical" },
    });

    const avgProgress = await TreatmentPlan.findAll({
      where: { specialistId },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("progress")), "avgProgress"],
      ],
    });

    res.status(200).json({
      statistics: {
        totalPlans,
        activePlans,
        criticalPlans,
        averageProgress: Math.round(avgProgress[0].dataValues.avgProgress || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching treatment plan statistics:", error);
    res.status(500).json({
      message: "Error fetching statistics",
      error: error.message,
    });
  }
};

module.exports = {
  createTreatmentPlan,
  getSpecialistTreatmentPlans,
  getCaregiverTreatmentPlans,
  getTreatmentPlanById,
  updateTreatmentPlan,
  submitProgressReport,
  getProgressReports,
  getTreatmentPlanStatistics,
};
