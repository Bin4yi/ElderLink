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
      model: 'Users',
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
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 100.00
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
      model: 'Users',
      key: 'id'
    }
  },
  // Additional fields for professional info
  medicalSchool: {
    type: DataTypes.STRING,
    allowNull: true
  },
  clinicAddress: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isEmail: true
    }
  },
  profileImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
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
      fields: ['verificationStatus']
    },
    {
      fields: ['isActive']
    }
  ]
});

module.exports = Doctor;