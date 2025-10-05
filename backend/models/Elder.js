const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Elder = sequelize.define('Elder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  subscriptionId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Subscriptions',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: true, // This can be null if elder doesn't have login access
    references: {
      model: 'Users',
      key: 'id'
    },
    unique: true // One user per elder
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other'),
    allowNull: false
  },
  photo: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false
  },
  emergencyContact: {
    type: DataTypes.STRING,
    allowNull: false
  },
  bloodType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  medicalHistory: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  currentMedications: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  allergies: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  chronicConditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  doctorName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  doctorPhone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  insuranceProvider: {
    type: DataTypes.STRING,
    allowNull: true
  },
  insuranceNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  hasLoginAccess: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  doctorAssignmentData: {  // ✅ Changed from doctorAssignments to doctorAssignmentData
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
  }
});

// Add or update the associate function
Elder.associate = function(models) {
  if (models.HealthMonitoring) {
    Elder.hasMany(models.HealthMonitoring, {
      foreignKey: 'elderId',
      as: 'healthRecords'
    });
  }
  
  if (models.User) {
    Elder.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  }
  
  // ...other existing associations...
};

module.exports = Elder;