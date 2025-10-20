'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if the column exists before adding it
    const tableDescription = await queryInterface.describeTable('prescription_items');
    
    if (!tableDescription.frequency) {
      await queryInterface.addColumn('prescription_items', 'frequency', {
        type: Sequelize.STRING,
        allowNull: true
      });
      console.log('Added frequency column to prescription_items table');
    } else {
      console.log('frequency column already exists in prescription_items table');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('prescription_items', 'frequency');
  }
};
