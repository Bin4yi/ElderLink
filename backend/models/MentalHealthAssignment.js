// backend/models/MentalHealthAssignment.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MentalHealthAssignment = sequelize.define(
  "MentalHealthAssignment",
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
    familyMemberId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    assignmentType: {
      type: DataTypes.ENUM("primary", "secondary", "specialist"),
      defaultValue: "primary",
    },
    status: {
      type: DataTypes.ENUM("active", "pending", "terminated", "completed"),
      defaultValue: "pending",
    },
    assignedDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    terminatedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    sessionFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM("low", "medium", "high", "urgent"),
      defaultValue: "medium",
    },
  },
  {
    tableName: "mental_health_assignments",
    timestamps: true,
  }
);

module.exports = MentalHealthAssignment;
