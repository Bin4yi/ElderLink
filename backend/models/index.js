const sequelize = require('../config/database');

// Import models - make sure they're properly defined
const User = require('./User');
const Subscription = require('./Subscription');
const Elder = require('./Elder');
const Notification = require('./Notification');
const HealthMonitoring = require('./HealthMonitoring');
const HealthAlert = require('./HealthAlert');

// Initialize all models with sequelize
const models = {
  User,
  Subscription,
  Elder,
  Notification,
  HealthMonitoring,
  HealthAlert
};

// User associations
User.hasMany(Subscription, { 
  foreignKey: 'userId', 
  as: 'subscriptions',
  onDelete: 'CASCADE'
});

User.hasMany(Notification, { 
  foreignKey: 'userId', 
  as: 'notifications',
  onDelete: 'CASCADE'
});

User.hasMany(HealthMonitoring, { 
  foreignKey: 'staffId', 
  as: 'healthMonitorings',
  onDelete: 'SET NULL' // Changed from CASCADE to SET NULL
});

User.hasOne(Elder, {
  foreignKey: 'userId',
  as: 'elderProfile',
  onDelete: 'SET NULL'
});

User.hasMany(HealthAlert, { 
  foreignKey: 'resolvedBy', 
  as: 'resolvedAlerts',
  onDelete: 'SET NULL'
});

// Subscription associations
Subscription.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

Subscription.hasOne(Elder, { 
  foreignKey: 'subscriptionId', 
  as: 'elder',
  onDelete: 'CASCADE'
});

// Elder associations
Elder.belongsTo(Subscription, { 
  foreignKey: 'subscriptionId', 
  as: 'subscription' 
});

Elder.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Elder.hasMany(HealthMonitoring, { 
  foreignKey: 'elderId', 
  as: 'healthMonitorings',
  onDelete: 'CASCADE'
});

Elder.hasMany(HealthAlert, { 
  foreignKey: 'elderId', 
  as: 'healthAlerts',
  onDelete: 'CASCADE'
});

// HealthMonitoring associations
HealthMonitoring.belongsTo(Elder, { 
  foreignKey: 'elderId', 
  as: 'elder' 
});

HealthMonitoring.belongsTo(User, { 
  foreignKey: 'staffId', 
  as: 'staff' 
});

HealthMonitoring.hasMany(HealthAlert, { 
  foreignKey: 'healthMonitoringId', 
  as: 'alerts',
  onDelete: 'CASCADE'
});

// HealthAlert associations
HealthAlert.belongsTo(Elder, { 
  foreignKey: 'elderId', 
  as: 'elder' 
});

HealthAlert.belongsTo(HealthMonitoring, { 
  foreignKey: 'healthMonitoringId', 
  as: 'healthMonitoring' 
});

HealthAlert.belongsTo(User, { 
  foreignKey: 'resolvedBy', 
  as: 'resolver' 
});

// Notification associations
Notification.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

module.exports = {
  sequelize,
  ...models
};