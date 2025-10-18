// backend/migrations/add-reminderSent-to-subscriptions.js
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Subscriptions', 'reminderSent', {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: true
    });
    
    console.log('✅ Added reminderSent column to Subscriptions table');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Subscriptions', 'reminderSent');
  }
};
