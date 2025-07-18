const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ScheduleException = sequelize.define('ScheduleException', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  doctorId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: true
  },
  isUnavailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'schedule_exceptions',
  timestamps: true
});

module.exports = ScheduleException;