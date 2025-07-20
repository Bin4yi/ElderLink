const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AppointmentPayment = sequelize.define('AppointmentPayment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  appointmentId: {
    type: DataTypes.UUID,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  paymentMethodId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  paymentIntentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'completed',
  },
}, {
  tableName: 'appointment_payments',
  timestamps: true,
});

module.exports = AppointmentPayment;