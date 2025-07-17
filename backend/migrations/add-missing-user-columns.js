const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Check if columns exist before adding them
      const tableDescription = await queryInterface.describeTable('Users');
      
      const columnsToAdd = [
        {
          name: 'resetToken',
          definition: {
            type: DataTypes.STRING,
            allowNull: true
          }
        },
        {
          name: 'resetTokenExpiry',
          definition: {
            type: DataTypes.DATE,
            allowNull: true
          }
        },
        {
          name: 'mustChangePassword',
          definition: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
          }
        },
        {
          name: 'lastPasswordChange',
          definition: {
            type: DataTypes.DATE,
            allowNull: true
          }
        },
        {
          name: 'tempPasswordExpiry',
          definition: {
            type: DataTypes.DATE,
            allowNull: true
          }
        },
        {
          name: 'experience',
          definition: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0
          }
        },
        {
          name: 'photo',
          definition: {
            type: DataTypes.STRING,
            allowNull: true
          }
        }
      ];

      for (const column of columnsToAdd) {
        if (!tableDescription[column.name]) {
          console.log(`Adding column: ${column.name}`);
          await queryInterface.addColumn('Users', column.name, column.definition, { transaction });
        } else {
          console.log(`Column ${column.name} already exists, skipping...`);
        }
      }

      await transaction.commit();
      console.log('✅ Successfully added missing User columns');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error adding User columns:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      const columnsToRemove = [
        'resetToken',
        'resetTokenExpiry',
        'mustChangePassword',
        'lastPasswordChange',
        'tempPasswordExpiry',
        'experience',
        'photo'
      ];

      for (const columnName of columnsToRemove) {
        try {
          await queryInterface.removeColumn('Users', columnName, { transaction });
          console.log(`Removed column: ${columnName}`);
        } catch (error) {
          console.log(`Column ${columnName} doesn't exist or couldn't be removed:`, error.message);
        }
      }

      await transaction.commit();
      console.log('✅ Successfully removed User columns');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Error removing User columns:', error);
      throw error;
    }
  }
};