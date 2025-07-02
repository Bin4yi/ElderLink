// backend/models/index.js - Complete models file
const User = require('./User');
const Subscription = require('./Subscription');
const Elder = require('./Elder');
const Notification = require('./Notification');

// Existing associations
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

Subscription.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

Subscription.hasOne(Elder, { 
  foreignKey: 'subscriptionId', 
  as: 'elder',
  onDelete: 'CASCADE'
});

Elder.belongsTo(Subscription, { 
  foreignKey: 'subscriptionId', 
  as: 'subscription' 
});

// NEW: Elder-User associations
User.hasOne(Elder, {
  foreignKey: 'userId',
  as: 'elderProfile',
  onDelete: 'SET NULL'
});

Elder.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

Notification.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

module.exports = {
  User,
  Subscription,
  Elder,
  Notification
};