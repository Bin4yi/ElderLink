// backend/models/DoctorAssignment.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorAssignment = sequelize.define('DoctorAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  elderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Elders',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users', // Assuming doctors are users with role 'doctor'
      key: 'id'
    }
  },
  familyMemberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  assignmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  assignmentType: {
    type: DataTypes.ENUM('primary', 'secondary', 'specialist'),
    allowNull: false,
    defaultValue: 'primary'
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true
  },
  consultationFee: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'terminated'),
    allowNull: false,
    defaultValue: 'active'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  terminationDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  terminationReason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'doctor_assignments',
  timestamps: true,
  indexes: [
    {
      fields: ['elderId']
    },
    {
      fields: ['doctorId']
    },
    {
      fields: ['familyMemberId']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = DoctorAssignment;