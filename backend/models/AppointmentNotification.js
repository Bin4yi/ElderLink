const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentNotification = sequelize.define('AppointmentNotification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  appointmentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  read: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'AppointmentNotifications',
  timestamps: true
});

module.exports = AppointmentNotification;