// backend/models/Doctor.js
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
      model: 'Users', // Use capital 'Users' (the actual table name)
      key: 'id'
    }
  },
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
  npiNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deaNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
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
      model: 'Users', // Use capital 'Users'
      key: 'id'
    }
  },
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