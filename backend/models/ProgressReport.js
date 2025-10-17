// backend/models/ProgressReport.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ProgressReport = sequelize.define(
  "ProgressReport",
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
    reportType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      // e.g., "Weekly Progress Report", "Monthly Assessment Report"
    },
    period: {
      type: DataTypes.STRING(100),
      allowNull: false,
      // e.g., "Week of Jan 1-7, 2025", "December 2024"
    },
    status: {
      type: DataTypes.ENUM("draft", "completed", "in_progress", "urgent"),
      defaultValue: "draft",
    },
    dateCreated: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
    },
    overallProgress: {
      type: DataTypes.INTEGER, // percentage
      defaultValue: 0,
    },
    mentalHealthScore: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
    },
    previousScore: {
      type: DataTypes.DECIMAL(3, 1),
      allowNull: true,
    },
    keyMetrics: {
      type: DataTypes.JSONB,
      defaultValue: {},
      /* Format: {
      anxietyLevel: { current: 3, previous: 4, trend: "improving" },
      sleepQuality: { current: 8, previous: 6, trend: "improving" }
    } */
    },
    highlights: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    concerns: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    recommendations: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    nextReview: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  },
  {
    tableName: "progress_reports",
    timestamps: true,
  }
);

module.exports = ProgressReport;
