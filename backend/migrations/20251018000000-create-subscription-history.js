// backend/migrations/create-subscription-history.js
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SubscriptionHistory', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      subscriptionId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Subscriptions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      action: {
        type: Sequelize.ENUM('created', 'renewed', 'canceled', 'expired'),
        allowNull: false
      },
      plan: {
        type: Sequelize.STRING,
        allowNull: false
      },
      duration: {
        type: Sequelize.STRING,
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      stripePaymentIntentId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {}
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Add index for faster queries
    await queryInterface.addIndex('SubscriptionHistory', ['subscriptionId']);
    await queryInterface.addIndex('SubscriptionHistory', ['userId']);
    await queryInterface.addIndex('SubscriptionHistory', ['action']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('SubscriptionHistory');
  }
};
