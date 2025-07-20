// backend/models/index.js

require('dotenv').config();
const { Sequelize, DataTypes } = require('sequelize');

// ✅ Set up Sequelize instance with Neon PostgreSQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Required for Neon
      }
    },
    logging: false
  }
);

// ✅ Import model factory functions
const User = require('./User');
const Subscription = require('./Subscription');
const Elder = require('./Elder');
const Notification = require('./Notification');
const Inventory = require('./Inventory');
const SimplePrescription = require('./SimplePrescription');

// ✅ Initialize models

// ✅ Define Associations

// User → Subscription (One-to-Many)
User.hasMany(Subscription, {
  foreignKey: 'userId',
  as: 'subscriptions',
  onDelete: 'CASCADE'
});
Subscription.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// User → Notification (One-to-Many)
User.hasMany(Notification, {
  foreignKey: 'userId',
  as: 'notifications',
  onDelete: 'CASCADE'
});
Notification.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Subscription → Elder (One-to-One)
Subscription.hasOne(Elder, {
  foreignKey: 'subscriptionId',
  as: 'elder',
  onDelete: 'CASCADE'
});
Elder.belongsTo(Subscription, {
  foreignKey: 'subscriptionId',
  as: 'subscription'
});

// User → Elder (One-to-One)
User.hasOne(Elder, {
  foreignKey: 'userId',
  as: 'elderProfile',
  onDelete: 'SET NULL'
});
Elder.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// ✅ Export all models and sequelize
module.exports = {
  sequelize,
  Sequelize,
  User,
  Subscription,
  Elder,
  Notification,
  Inventory,
  SimplePrescription
};
