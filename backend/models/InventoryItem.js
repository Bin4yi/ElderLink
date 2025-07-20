// models/InventoryItem.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InventoryItem = sequelize.define('InventoryItem', {
    name: { type: DataTypes.STRING, allowNull: false },
    quantity: { type: DataTypes.INTEGER, allowNull: false },
    location: { type: DataTypes.STRING },
    expirationDate: { type: DataTypes.DATE, allowNull: false },
    usage: { type: DataTypes.STRING },
    prescriptionRequired: { type: DataTypes.BOOLEAN, defaultValue: false },
    reorderTriggered: { type: DataTypes.BOOLEAN, defaultValue: false },
    lastUpdated: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    notes: { type: DataTypes.TEXT }
  }, {
    timestamps: true});
module.exports = InventoryItem;
