// backend/models/Delivery.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Delivery = sequelize.define(
  "Delivery",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    deliveryNumber: {
      type: DataTypes.STRING(50),
      unique: true,
      allowNull: false,
    },
    prescriptionId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "prescriptions",
        key: "id",
      },
    },
    elderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Elders",
        key: "id",
      },
    },
    pharmacistId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    status: {
      type: DataTypes.ENUM(
        "pending",
        "preparing",
        "ready",
        "in_transit",
        "delivered",
        "cancelled"
      ),
      defaultValue: "pending",
      allowNull: false,
    },
    deliveryAddress: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    deliveredDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estimatedValue: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      allowNull: false,
    },
  },
  {
    tableName: "deliveries",
    timestamps: true,
  }
);

module.exports = Delivery;
