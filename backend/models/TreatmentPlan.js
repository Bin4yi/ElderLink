// backend/models/TreatmentPlan.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TreatmentPlan = sequelize.define(
  "TreatmentPlan",
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
    planTitle: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("active", "completed", "critical", "on_hold"),
      defaultValue: "active",
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "critical"),
      defaultValue: "medium",
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    progress: {
      type: DataTypes.INTEGER, // percentage 0-100
      defaultValue: 0,
    },
    primaryDiagnosis: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    secondaryDiagnosis: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    goals: {
      type: DataTypes.JSONB,
      defaultValue: [],
      /* Format: [{
      id: 1,
      description: "Reduce anxiety symptoms by 50%",
      status: "in_progress",
      targetDate: "2025-02-01",
      progress: 70
    }] */
    },
    interventions: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    nextReview: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    lastUpdated: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "treatment_plans",
    timestamps: true,
  }
);

module.exports = TreatmentPlan;
