const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const HealthMonitoring = sequelize.define('HealthMonitoring', {
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
  staffId: {
    type: DataTypes.UUID,
    allowNull: true,
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
  recordedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },
  recordedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
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
    type: DataTypes.DECIMAL(5, 1),
    allowNull: true,
    validate: {
      min: 95.0,
      max: 110.0
    }
  },
  weight: {
    type: DataTypes.DECIMAL(6, 1),
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
  bloodSugar: {
    type: DataTypes.INTEGER,
    allowNull: true,
    validate: {
      min: 50,
      max: 600
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  symptoms: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  medications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  alertLevel: {
    type: DataTypes.ENUM('normal', 'warning', 'critical'),
    allowNull: false,
    defaultValue: 'normal'
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'health_monitoring',
  timestamps: true
});

// Add the associate function
HealthMonitoring.associate = function(models) {
  HealthMonitoring.belongsTo(models.Elder, {
    foreignKey: 'elderId',
    as: 'elder'
  });
  
  if (models.User) {
    HealthMonitoring.belongsTo(models.User, {
      foreignKey: 'recordedBy',
      as: 'recordedByUser'
    });
    
    HealthMonitoring.belongsTo(models.User, {
      foreignKey: 'staffId',
      as: 'staff'
    });
  }
};

module.exports = HealthMonitoring;