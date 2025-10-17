// backend/models/GroupTherapySession.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GroupTherapySession = sequelize.define(
  "GroupTherapySession",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    specialistId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    sessionName: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    maxParticipants: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
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
      defaultValue: 90,
    },
    location: {
      type: DataTypes.ENUM("video_call", "in_person"),
      defaultValue: "in_person",
    },
    meetingLink: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("scheduled", "completed", "cancelled"),
      defaultValue: "scheduled",
    },
    participants: {
      type: DataTypes.ARRAY(DataTypes.UUID),
      defaultValue: [],
      // Array of elder IDs
    },
  },
  {
    tableName: "group_therapy_sessions",
    timestamps: true,
  }
);

module.exports = GroupTherapySession;
