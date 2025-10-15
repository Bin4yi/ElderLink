const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorSchedule = sequelize.define('DoctorSchedule', {
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
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  slotDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 30,
    comment: 'Duration of each appointment slot in minutes'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'doctor_schedules',
  timestamps: true
});

module.exports = DoctorSchedule;