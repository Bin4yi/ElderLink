// backend/models/AppointmentNotification.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentNotification = sequelize.define('AppointmentNotification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Appointments',
      key: 'id'
    }
  },
  recipientId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('booking_confirmation', 'approval', 'rejection', 'cancellation', 'reminder', 'completion', 'prescription'),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  method: {
    type: DataTypes.ENUM('in_app', 'email', 'sms', 'push'),
    defaultValue: 'in_app'
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'AppointmentNotifications',
  timestamps: true,
  indexes: [
    {
      fields: ['recipientId', 'isRead']
    },
    {
      fields: ['appointmentId']
    },
    {
      fields: ['type']
    },
    {
      fields: ['sentAt']
    }
  ]
});

module.exports = AppointmentNotification;