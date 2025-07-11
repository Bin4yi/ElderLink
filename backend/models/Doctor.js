// backend/models/Doctor.js (Updated with User relationship)
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'users', // Reference to your existing User table
      key: 'id'
    }
  },
  // Basic info will come from User table, but we can override if needed
  specialization: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 50
    }
  },
  availableDays: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  },
  timeSlots: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: ['09:00-10:00', '10:00-11:00', '14:00-15:00', '15:00-16:00']
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Medical specific fields
  medicalSchool: {
    type: DataTypes.STRING,
    allowNull: true
  },
  residency: {
    type: DataTypes.STRING,
    allowNull: true
  },
  boardCertifications: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  qualifications: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true,
    defaultValue: []
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: 100.00
  },
  clinicAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  // Professional details
  npiNumber: {
    type: DataTypes.STRING,
    allowNull: true // National Provider Identifier
  },
  deaNumber: {
    type: DataTypes.STRING,
    allowNull: true // Drug Enforcement Administration number
  },
  // Status tracking
  verificationStatus: {
    type: DataTypes.ENUM('Pending', 'Verified', 'Rejected'),
    defaultValue: 'Pending'
  },
  verifiedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  verifiedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  // Sync tracking
  syncedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  lastSyncedFromUser: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'doctors',
  timestamps: true,
  indexes: [
    {
      fields: ['userId']
    },
    {
      fields: ['licenseNumber']
    },
    {
      fields: ['specialization']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['verificationStatus']
    }
  ]
});

module.exports = Doctor;