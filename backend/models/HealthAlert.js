// backend/models/HealthAlert.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HealthAlert = sequelize.define('HealthAlert', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  elderId: {
    type: DataTypes.UUID, // FIXED: Changed to UUID to match Elder model
    allowNull: false,
    references: {
      model: 'Elders',
      key: 'id'
    }
  },
  healthMonitoringId: {
    type: DataTypes.INTEGER, // This stays INTEGER as HealthMonitoring uses INTEGER for its ID
    allowNull: true,
    references: {
      model: 'health_monitoring',
      key: 'id'
    }
  },
  alertType: {
    type: DataTypes.ENUM('vital_abnormal', 'medication_missed', 'emergency', 'routine_check'),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  vitals: {
    type: DataTypes.JSON,
    allowNull: true
  },
  isResolved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.UUID, // FIXED: Changed to UUID to match User model
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  resolutionNotes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'health_alerts',
  timestamps: true,
  indexes: [
    {
      fields: ['elderId', 'isResolved']
    },
    {
      fields: ['severity']
    },
    {
      fields: ['alertType']
    }
  ]
});

module.exports = HealthAlert;