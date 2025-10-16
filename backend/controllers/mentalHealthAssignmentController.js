// backend/controllers/mentalHealthAssignmentController.js
const { MentalHealthAssignment, User, Elder } = require("../models");
const { Op } = require("sequelize");

// Family member assigns a specialist to an elder
const createAssignment = async (req, res) => {
  try {
    const familyMemberId = req.user.id;
    const { elderId, specialistId, sessionFee, priority, notes } = req.body;

    const elder = await Elder.findOne({
      where: { id: elderId, userId: familyMemberId },
    });

    if (!elder) {
      return res.status(404).json({
        message: "Elder not found or does not belong to you",
      });
    }

    const specialist = await User.findOne({
      where: {
        id: specialistId,
        role: "mental_health_consultant",
        isActive: true,
      },
    });

    if (!specialist) {
      return res.status(404).json({
        message: "Mental health specialist not found",
      });
    }

    const existingAssignment = await MentalHealthAssignment.findOne({
      where: { elderId, specialistId, status: "active" },
    });

    if (existingAssignment) {
      return res.status(400).json({
        message: "This specialist is already assigned to this elder",
      });
    }

    const assignment = await MentalHealthAssignment.create({
      elderId,
      specialistId,
      familyMemberId,
      assignmentType: "primary",
      status: "active",
      sessionFee,
      priority: priority || "medium",
      notes,
      assignedDate: new Date(),
    });

    const completeAssignment = await MentalHealthAssignment.findByPk(
      assignment.id,
      {
        include: [
          {
            model: Elder,
            as: "elder",
            attributes: ["id", "firstName", "lastName", "dateOfBirth"],
          },
          {
            model: User,
            as: "specialist",
            attributes: [
              "id",
              "firstName",
              "lastName",
              "email",
              "phone",
              "specialization",
            ],
          },
        ],
      }
    );

    res.status(201).json({
      message: "Mental health specialist assigned successfully",
      assignment: completeAssignment,
    });
  } catch (error) {
    console.error("Error creating mental health assignment:", error);
    res.status(500).json({
      message: "Error assigning mental health specialist",
      error: error.message,
    });
  }
};

// Get all assignments for a family member
const getFamilyAssignments = async (req, res) => {
  try {
    const familyMemberId = req.user.id;

    const assignments = await MentalHealthAssignment.findAll({
      where: { familyMemberId },
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: ["id", "firstName", "lastName", "dateOfBirth", "photo"],
        },
        {
          model: User,
          as: "specialist",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "email",
            "phone",
            "specialization",
            "experience",
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("Error fetching family assignments:", error);
    res.status(500).json({
      message: "Error fetching assignments",
      error: error.message,
    });
  }
};

// Get all clients for a specialist
const getSpecialistClients = async (req, res) => {
  try {
    const specialistId = req.user.id;
    const { status } = req.query;

    const whereClause = { specialistId };
    if (status) {
      whereClause.status = status;
    }

    const assignments = await MentalHealthAssignment.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: "elder",
          attributes: [
            "id",
            "firstName",
            "lastName",
            "dateOfBirth",
            "gender",
            "photo",
          ],
        },
        {
          model: User,
          as: "familyMember",
          attributes: ["id", "firstName", "lastName", "email", "phone"],
        },
      ],
      order: [["assignedDate", "DESC"]],
    });

    const clientsWithAge = assignments.map((assignment) => {
      const elder = assignment.elder;
      const age =
        new Date().getFullYear() - new Date(elder.dateOfBirth).getFullYear();

      return {
        ...assignment.toJSON(),
        elder: {
          ...elder.toJSON(),
          age,
        },
      };
    });

    res.status(200).json({
      count: clientsWithAge.length,
      clients: clientsWithAge,
    });
  } catch (error) {
    console.error("Error fetching specialist clients:", error);
    res.status(500).json({
      message: "Error fetching clients",
      error: error.message,
    });
  }
};

// Terminate an assignment
const terminateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const assignment = await MentalHealthAssignment.findByPk(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (userRole !== "family_member" || assignment.familyMemberId !== userId) {
      return res.status(403).json({
        message: "Not authorized to terminate this assignment",
      });
    }

    assignment.status = "terminated";
    assignment.terminatedDate = new Date();
    await assignment.save();

    res.status(200).json({
      message: "Assignment terminated successfully",
      assignment,
    });
  } catch (error) {
    console.error("Error terminating assignment:", error);
    res.status(500).json({
      message: "Error terminating assignment",
      error: error.message,
    });
  }
};

// Update assignment details
const updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { sessionFee, priority, notes, status } = req.body;
    const userId = req.user.id;

    const assignment = await MentalHealthAssignment.findByPk(assignmentId);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    if (
      assignment.familyMemberId !== userId &&
      assignment.specialistId !== userId
    ) {
      return res.status(403).json({
        message: "Not authorized to update this assignment",
      });
    }

    if (sessionFee !== undefined) assignment.sessionFee = sessionFee;
    if (priority) assignment.priority = priority;
    if (notes !== undefined) assignment.notes = notes;
    if (status) assignment.status = status;

    await assignment.save();

    const updatedAssignment = await MentalHealthAssignment.findByPk(
      assignmentId,
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

    res.status(200).json({
      message: "Assignment updated successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    console.error("Error updating assignment:", error);
    res.status(500).json({
      message: "Error updating assignment",
      error: error.message,
    });
  }
};

// Get available specialists
const getAvailableSpecialists = async (req, res) => {
  try {
    const specialists = await User.findAll({
      where: {
        role: "mental_health_consultant",
        isActive: true,
      },
      attributes: [
        "id",
        "firstName",
        "lastName",
        "email",
        "phone",
        "specialization",
        "experience",
        "licenseNumber",
      ],
      order: [["firstName", "ASC"]],
    });

    res.status(200).json({
      count: specialists.length,
      specialists,
    });
  } catch (error) {
    console.error("Error fetching specialists:", error);
    res.status(500).json({
      message: "Error fetching specialists",
      error: error.message,
    });
  }
};

// ✅ Export all functions in your preferred style
module.exports = {
  createAssignment,
  getFamilyAssignments,
  getSpecialistClients,
  terminateAssignment,
  updateAssignment,
  getAvailableSpecialists,
};
