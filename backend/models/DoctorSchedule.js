// backend/models/DoctorSchedule.js
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
      model: 'doctors', // ✅ Change from 'Doctors' to 'doctors'
      key: 'id'
    }
  },
  dayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0,
      max: 6
    }
  },
  startTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  endTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  slotDuration: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  maxAppointments: {
    type: DataTypes.INTEGER,
    defaultValue: 10
  }
}, {
  indexes: [
    { 
      unique: true, 
      fields: ['doctorId', 'dayOfWeek', 'startTime'] 
    }
  ]
});

module.exports = DoctorSchedule;

