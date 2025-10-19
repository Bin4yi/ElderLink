// backend/models/PasswordResetOTP.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PasswordResetOTP = sequelize.define('PasswordResetOTP', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  otp: {
    type: DataTypes.STRING(6),
    allowNull: false
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isUsed: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'password_reset_otps',
  timestamps: true,
  indexes: [
    {
      fields: ['email']
    },
    {
      fields: ['otp']
    },
    {
      fields: ['expiresAt']
    }
  ]
});

module.exports = PasswordResetOTP;
