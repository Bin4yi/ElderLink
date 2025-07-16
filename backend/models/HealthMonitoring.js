// backend/models/HealthMonitoring.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HealthMonitoring = sequelize.define('HealthMonitoring', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  elderId: {
    type: DataTypes.UUID, // ✅ FIXED: Changed to UUID to match Elder model
    allowNull: false,
    references: {
      model: 'Elders',
      key: 'id'
    }
  },
  staffId: {
    type: DataTypes.UUID, // ✅ FIXED: Changed to UUID to match User model
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  monitoringDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  heartRate: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 40,
      max: 200
    }
  },
  bloodPressureSystolic: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 70,
      max: 250
    }
  },
  bloodPressureDiastolic: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 40,
      max: 150
    }
  },
  temperature: {
    type: DataTypes.DECIMAL(4, 2),
    allowNull: true,
    validate: {
      min: 95.0,
      max: 110.0
    }
  },
  weight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    validate: {
      min: 50.0,
      max: 500.0
    }
  },
  sleepHours: {
    type: DataTypes.DECIMAL(3, 1),
    allowNull: true,
    validate: {
      min: 0.0,
      max: 24.0
    }
  },
  oxygenSaturation: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 70,
      max: 100
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'in-progress', 'completed', 'missed'),
    defaultValue: 'scheduled'
  },
  alertLevel: {
    type: DataTypes.ENUM('normal', 'warning', 'critical'),
    defaultValue: 'normal'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'health_monitoring',
  timestamps: true,
  indexes: [
    {
      fields: ['elderId', 'monitoringDate']
    },
    {
      fields: ['staffId']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = HealthMonitoring;