// backend/models/HealthAlert.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HealthAlert = sequelize.define('HealthAlert', {
  id: {
    type: DataTypes.UUID,
    primaryKey: true,
    defaultValue: DataTypes.UUIDV4
  },
  elderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Elders',
      key: 'id'
    }
  },
  healthMonitoringId: {
    type: DataTypes.UUID, // Changed from INTEGER to UUID
    allowNull: true,
    references: {
      model: 'health_monitoring',
      key: 'id'
    }
  },
  alertType: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  severity: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'medium'
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  triggerValue: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  normalRange: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'acknowledged', 'resolved'),
    allowNull: false,
    defaultValue: 'active'
  },
  acknowledgedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  resolvedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
}, {
  tableName: 'health_alerts',
  timestamps: true
});

module.exports = HealthAlert;