// backend/models/ElderMedicalHistory.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ElderMedicalHistory = sequelize.define('ElderMedicalHistory', {
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
  recordType: {
    type: DataTypes.ENUM('consultation', 'lab_result', 'prescription', 'emergency'),
    allowNull: false
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  doctorName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  attachments: {
    type: DataTypes.JSONB,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  }
});

module.exports = ElderMedicalHistory;