// backend/models/index.js
const User = require('./User');
const Subscription = require('./Subscription');
const Elder = require('./Elder');
const Notification = require('./Notification');
const Doctor = require('./Doctor');

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

// User has one doctor profile (if role is doctor)
User.hasOne(Doctor, {
  foreignKey: 'userId',
  as: 'doctorProfile',
  onDelete: 'CASCADE'
});

// User has one elder profile (if role is elder)
User.hasOne(Elder, {
  foreignKey: 'userId',
  as: 'elderProfile',
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

// Notification associations
Notification.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

// Doctor associations
Doctor.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
});

// Doctor verification (admin verifies doctors)
User.hasMany(Doctor, {
  foreignKey: 'verifiedBy',
  as: 'verifiedDoctors',
  onDelete: 'SET NULL'
});

Doctor.belongsTo(User, {
  foreignKey: 'verifiedBy',
  as: 'verifier'
});

// Export only the models that exist
module.exports = {
  User,
  Subscription,
  Elder,
  Notification,
  Doctor
};