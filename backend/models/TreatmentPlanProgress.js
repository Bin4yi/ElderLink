// backend/models/TreatmentPlanProgress.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TreatmentPlanProgress = sequelize.define(
  "TreatmentPlanProgress",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    treatmentPlanId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "treatment_plans",
        key: "id",
      },
    },
    caregiverId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    progressPercentage: {
      type: DataTypes.INTEGER, // 0-100
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    reportDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    attachments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
  },
  {
    tableName: "treatment_plan_progress",
    timestamps: true,
  }
);

module.exports = TreatmentPlanProgress;
