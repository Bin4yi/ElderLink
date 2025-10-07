const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const EmergencyAlert = sequelize.define('EmergencyAlert', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  elderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Elders',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    comment: 'Elder user ID for easier queries',
  },
  alertType: {
    type: DataTypes.ENUM('sos', 'fall_detection', 'health_critical'),
    allowNull: false,
    defaultValue: 'sos',
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
    allowNull: false,
    defaultValue: 'high',
  },
  status: {
    type: DataTypes.ENUM(
      'pending',
      'acknowledged',
      'dispatched',
      'en_route',
      'arrived',
      'completed',
      'cancelled'
    ),
    allowNull: false,
    defaultValue: 'pending',
  },
  location: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Emergency location: { latitude, longitude, address }',
  },
  medicalInfo: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Medical conditions, medications, allergies',
  },
  vitals: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Heart rate, blood pressure, oxygen saturation, etc.',
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  acknowledgedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id',
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    comment: 'Coordinator who acknowledged the emergency',
  },
  acknowledgedAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  notes: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
  },
}, {
  tableName: 'EmergencyAlerts',
  timestamps: true,
  indexes: [
    {
      fields: ['status'],
    },
    {
      fields: ['elderId'],
    },
    {
      fields: ['userId'],
    },
    {
      fields: ['timestamp'],
    },
    {
      fields: ['priority'],
    },
  ],
});

module.exports = EmergencyAlert;
