const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmergencyLocation = sequelize.define('EmergencyLocation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  emergencyAlertId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'EmergencyAlerts',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  ambulanceDispatchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'AmbulanceDispatches',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false,
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false,
  },
  accuracy: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'GPS accuracy in meters',
  },
  altitude: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  speed: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Speed in m/s',
  },
  heading: {
    type: DataTypes.FLOAT,
    allowNull: true,
    comment: 'Direction in degrees',
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  source: {
    type: DataTypes.ENUM('gps', 'network', 'manual'),
    allowNull: false,
    defaultValue: 'gps',
  },
}, {
  tableName: 'EmergencyLocations',
  timestamps: true,
  indexes: [
    {
      fields: ['emergencyAlertId'],
    },
    {
      fields: ['ambulanceDispatchId'],
    },
    {
      fields: ['timestamp'],
    },
  ],
});

module.exports = EmergencyLocation;
