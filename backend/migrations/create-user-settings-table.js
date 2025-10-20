// backend/migrations/create-user-settings-table.js
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface) => {
    await queryInterface.createTable('UserSettings', {
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
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // Add index on userId for faster lookups
    await queryInterface.addIndex('UserSettings', ['userId'], {
      name: 'user_settings_userId_idx'
    });

    console.log('✅ UserSettings table created successfully');
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('UserSettings');
    console.log('✅ UserSettings table dropped successfully');
  }
};
