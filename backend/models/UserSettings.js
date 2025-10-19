// backend/models/UserSettings.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserSettings = sequelize.define('UserSettings', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  // Notification Settings
  emailNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  smsNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  pushNotifications: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  emergencyAlerts: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  healthReminders: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  appointmentReminders: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // Privacy Settings
  profileVisibility: {
    type: DataTypes.ENUM('public', 'family', 'private'),
    defaultValue: 'family'
  },
  shareHealthData: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  allowDataAnalytics: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // App Preferences
  darkMode: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  language: {
    type: DataTypes.STRING,
    defaultValue: 'english'
  },
  timezone: {
    type: DataTypes.STRING,
    defaultValue: 'EST'
  },
  soundEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'UserSettings',
  timestamps: true
});

module.exports = UserSettings;
