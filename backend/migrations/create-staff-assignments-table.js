const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('staff_assignments', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      staffId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      elderId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Elders',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assignedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      assignedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      unassignedDate: {
        type: DataTypes.DATE,
        allowNull: true
      },
      unassignedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      notes: {
        type: DataTypes.TEXT,
        allowNull: true
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

    // Add indexes
    await queryInterface.addIndex('staff_assignments', ['staffId', 'isActive']);
    await queryInterface.addIndex('staff_assignments', ['elderId', 'isActive']);
    await queryInterface.addIndex('staff_assignments', ['assignedBy']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('staff_assignments');
  }
};