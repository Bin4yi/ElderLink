const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ElderMedicalHistory = sequelize.define('ElderMedicalHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  elderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  createdBy: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  diagnosis: {
    type: DataTypes.STRING,
    allowNull: false
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  }
}, {
  tableName: 'ElderMedicalHistories',
  timestamps: true
});

module.exports = ElderMedicalHistory;