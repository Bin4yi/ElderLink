const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FamilyDoctorAssignment = sequelize.define('FamilyDoctorAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  familyMemberId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  elderId: {
    type: DataTypes.UUID,
    allowNull: true, // Can be null for general family doctor
    references: {
      model: 'elders',
      key: 'id'
    }
  },
  assignmentType: {
    type: DataTypes.ENUM('primary', 'specialist', 'emergency'),
    allowNull: false,
    defaultValue: 'primary'
  },
  assignedDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  unassignedDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high'),
    allowNull: false,
    defaultValue: 'medium'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  assignedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'inactive'),
    allowNull: false,
    defaultValue: 'pending'
  }
}, {
  tableName: 'family_doctor_assignments',
  timestamps: true,
  indexes: [
    {
      fields: ['familyMemberId']
    },
    {
      fields: ['doctorId']
    },
    {
      fields: ['elderId']
    },
    {
      fields: ['isActive']
    },
    {
      fields: ['assignmentType']
    },
    {
      unique: true,
      fields: ['familyMemberId', 'doctorId', 'elderId', 'assignmentType'],
      where: {
        isActive: true
      }
    }
  ]
});

module.exports = FamilyDoctorAssignment;