// backend/models/MentalHealthResource.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const MentalHealthResource = sequelize.define(
  "MentalHealthResource",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(300),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        "workbook",
        "video",
        "guideline",
        "program",
        "toolkit",
        "clinical"
      ),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    resourceType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      // e.g., "PDF Document", "Video Series"
    },
    fileUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    fileSize: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    downloadCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    targetAudience: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    difficulty: {
      type: DataTypes.ENUM("Beginner", "Intermediate", "Advanced"),
      defaultValue: "Beginner",
    },
    estimatedTime: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    author: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    rating: {
      type: DataTypes.DECIMAL(2, 1),
      defaultValue: 0.0,
    },
    featured: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    uploadedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    tableName: "mental_health_resources",
    timestamps: true,
  }
);

module.exports = MentalHealthResource;
