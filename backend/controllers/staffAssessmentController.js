// backend/controllers/staffAssessmentController.js
const {
  MentalHealthAssessment,
  Elder,
  User,
  StaffAssignment,
} = require("../models");
const { Op } = require("sequelize");

/**
 * Get all mental health assessments for elders assigned to the staff member
 */
const getStaffAssessments = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { elderId, status } = req.query;

    // Get all elders assigned to this staff member
    const assignments = await StaffAssignment.findAll({
      where: {
        staffId: staffId,
        isActive: true,
      },
      attributes: ["elderId"],
    });

    const assignedElderIds = assignments.map((a) => a.elderId);

    if (assignedElderIds.length === 0) {
      return res.json({
        success: true,
        message: "No elders assigned to you yet",
        assessments: [],
      });
    }

    // Build where clause for assessments
    const whereClause = {
      elderId: {
        [Op.in]: assignedElderIds,
      },
    };

    // Filter by specific elder if provided
    if (elderId) {
      whereClause.elderId = elderId;
    }

    // Filter by status if provided
    if (status) {
      whereClause.status = status;
    }

    // Get assessments
    const assessments = await MentalHealthAssessment.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "dateOfBirth"],
        },
        {
          model: User,
          as: "specialist",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [
        ["priority", "DESC"],
        ["scheduledDate", "ASC"],
      ],
    });

    res.json({
      success: true,
      assessments: assessments,
    });
  } catch (error) {
    console.error("Error fetching staff assessments:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch assessments",
      error: error.message,
    });
  }
};

/**
 * Update assessment status by staff
 */
const updateAssessmentStatus = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const staffId = req.user.id;
    const { status, notes } = req.body;

    // Validate status
    const validStatuses = [
      "scheduled",
      "not_started",
      "started",
      "in_progress",
      "completed",
      "urgent",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    // Find the assessment
    const assessment = await MentalHealthAssessment.findByPk(assessmentId, {
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

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found",
      });
    }

    // Check if staff member is assigned to this elder
    const assignment = await StaffAssignment.findOne({
      where: {
        staffId: staffId,
        elderId: assessment.elderId,
        isActive: true,
      },
    });

    if (!assignment) {
      return res.status(403).json({
        success: false,
        message: "You are not assigned to this elder",
      });
    }

    // Update the assessment status
    const updateData = {
      status: status,
    };

    // If completing, set completed date
    if (status === "completed") {
      updateData.completedDate = new Date();
    }

    // If notes provided, append to findings
    if (notes) {
      const staffNote = `\n[Staff Update - ${new Date().toISOString()}]: ${notes}`;
      updateData.findings = assessment.findings
        ? assessment.findings + staffNote
        : staffNote;
    }

    await assessment.update(updateData);

    // Fetch updated assessment with associations
    const updatedAssessment = await MentalHealthAssessment.findByPk(
      assessment.id,
      {
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
      }
    );

    res.json({
      success: true,
      message: "Assessment status updated successfully",
      assessment: updatedAssessment,
    });
  } catch (error) {
    console.error("Error updating assessment status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update assessment status",
      error: error.message,
    });
  }
};

/**
 * Get statistics of assessment statuses for the staff member
 */
const getStaffAssessmentStats = async (req, res) => {
  try {
    const staffId = req.user.id;

    // Get all elders assigned to this staff member
    const assignments = await StaffAssignment.findAll({
      where: {
        staffId: staffId,
        isActive: true,
      },
      attributes: ["elderId"],
    });

    const assignedElderIds = assignments.map((a) => a.elderId);

    if (assignedElderIds.length === 0) {
      return res.json({
        success: true,
        stats: {
          totalAssessments: 0,
          scheduled: 0,
          notStarted: 0,
          started: 0,
          inProgress: 0,
          completed: 0,
          urgent: 0,
        },
      });
    }

    // Get all assessments for assigned elders
    const assessments = await MentalHealthAssessment.findAll({
      where: {
        elderId: {
          [Op.in]: assignedElderIds,
        },
      },
      attributes: ["status"],
    });

    // Count by status
    const statusCounts = {
      scheduled: 0,
      not_started: 0,
      started: 0,
      in_progress: 0,
      completed: 0,
      urgent: 0,
    };

    assessments.forEach((assessment) => {
      statusCounts[assessment.status]++;
    });

    res.json({
      success: true,
      stats: {
        totalAssessments: assessments.length,
        scheduled: statusCounts.scheduled,
        notStarted: statusCounts.not_started,
        started: statusCounts.started,
        inProgress: statusCounts.in_progress,
        completed: statusCounts.completed,
        urgent: statusCounts.urgent,
      },
    });
  } catch (error) {
    console.error("Error fetching staff assessment stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};

module.exports = {
  getStaffAssessments,
  updateAssessmentStatus,
  getStaffAssessmentStats,
};
