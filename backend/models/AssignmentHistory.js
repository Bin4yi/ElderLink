const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AssignmentHistory = sequelize.define('AssignmentHistory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  assignmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'family_doctor_assignments',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM('assigned', 'unassigned', 'updated', 'accepted', 'rejected'),
    allowNull: false
  },
  previousStatus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  newStatus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  actionBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  actionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true
  }
}, {
  tableName: 'assignment_histories',
  timestamps: true
});

module.exports = AssignmentHistory;