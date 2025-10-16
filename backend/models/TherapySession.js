// backend/models/TherapySession.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const TherapySession = sequelize.define(
  "TherapySession",
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
    sessionType: {
      type: DataTypes.ENUM(
        "individual",
        "group",
        "family",
        "crisis",
        "assessment"
      ),
      allowNull: false,
    },
    therapyType: {
      type: DataTypes.STRING(200),
      allowNull: true, // e.g., "Cognitive Behavioral Therapy"
    },
    status: {
      type: DataTypes.ENUM(
        "scheduled",
        "completed",
        "cancelled",
        "no-show",
        "overdue"
      ),
      defaultValue: "scheduled",
    },
    sessionNumber: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    isFirstSession: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isMonthlySession: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    autoScheduled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    scheduledDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    scheduledTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 60,
    },
    location: {
      type: DataTypes.ENUM("video_call", "in_person", "phone_call"),
      defaultValue: "video_call",
    },
    zoomLink: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    completedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextSessionDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    sessionGoals: {
      type: DataTypes.ARRAY(DataTypes.TEXT),
      defaultValue: [],
    },
    sessionNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    homework: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    emergencyContact: {
      type: DataTypes.JSONB,
      allowNull: true,
      // Format: { name: 'John Doe', phone: '+1234567890', relationship: 'Son' }
    },
    groupSessionId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "group_therapy_sessions",
        key: "id",
      },
    },
  },
  {
    tableName: "therapy_sessions",
    timestamps: true,
  }
);

module.exports = TherapySession;
