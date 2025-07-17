const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const StaffAssignment = sequelize.define('StaffAssignment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  staffId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  elderId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Elders',
      key: 'id'
    }
  },
  assignedBy: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
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
  unassignedBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'staff_assignments',
  timestamps: true,
  indexes: [
    {
      fields: ['staffId', 'isActive']
    },
    {
      fields: ['elderId', 'isActive']
    },
    {
      fields: ['assignedBy']
    }
  ]
});

module.exports = StaffAssignment;