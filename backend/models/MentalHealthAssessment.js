// backend/models/MentalHealthAssessment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MentalHealthAssessment = sequelize.define(
  "MentalHealthAssessment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    elderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Elders",
        key: "id",
      },
    },
    specialistId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    assessmentType: {
      type: DataTypes.STRING(200),
      allowNull: false,
      // e.g., "Initial Mental Health Evaluation", "Depression Screening (PHQ-9)"
    },
    status: {
      type: DataTypes.ENUM("scheduled", "in_progress", "completed", "urgent"),
      defaultValue: "scheduled",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      defaultValue: "medium",
    },
    scheduledDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    completedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 45,
    },
    score: {
      type: DataTypes.STRING(100),
      allowNull: true,
      // e.g., "PHQ-9: 8/27 (Mild Depression)"
    },
    findings: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    recommendations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    nextAssessment: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    riskLevel: {
      type: DataTypes.ENUM("low", "medium", "high"),
      defaultValue: "low",
    },
  },
  {
    tableName: "mental_health_assessments",
    timestamps: true,
  }
);

module.exports = MentalHealthAssessment;
