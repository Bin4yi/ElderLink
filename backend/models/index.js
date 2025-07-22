
// backend/models/index.js
const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Elder = require('./Elder');
const Subscription = require('./Subscription');
const HealthMonitoring = require('./HealthMonitoring');
const Notification = require('./Notification');
const StaffAssignment = require('./StaffAssignment');
const DoctorAssignment = require('./DoctorAssignment');
// Additional models from other file
const Inventory = require('./Inventory');
const SimplePrescription = require('./SimplePrescription');

// Clear any existing associations to prevent conflicts
const clearAssociations = (model) => {
  if (model.associations) {
    Object.keys(model.associations).forEach(alias => {
      delete model.associations[alias];
    });
  }
};

// Clear associations for all models
[User, Elder, Subscription, HealthMonitoring, Notification, StaffAssignment, DoctorAssignment, Inventory, SimplePrescription].forEach(clearAssociations);

// User associations
User.hasMany(Elder, { foreignKey: 'userId', as: 'elders' });
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
User.hasMany(HealthMonitoring, { foreignKey: 'staffId', as: 'healthMonitorings' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(StaffAssignment, { foreignKey: 'staffId', as: 'staffAssignments' });
User.hasMany(DoctorAssignment, { foreignKey: 'doctorId', as: 'doctorAssignments' });
User.hasMany(DoctorAssignment, { foreignKey: 'familyMemberId', as: 'familyDoctorAssignments' });

// Elder associations
Elder.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Elder.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
Elder.hasMany(HealthMonitoring, { foreignKey: 'elderId', as: 'healthRecords' });
Elder.hasMany(Notification, { foreignKey: 'elderId', as: 'elderNotifications' });
Elder.hasMany(StaffAssignment, { foreignKey: 'elderId', as: 'staffAssignments' });
Elder.hasMany(DoctorAssignment, { foreignKey: 'elderId', as: 'doctorAssignmentRecords' });

// Subscription associations
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Subscription.hasOne(Elder, { foreignKey: 'subscriptionId', as: 'elder' });

// HealthMonitoring associations
HealthMonitoring.belongsTo(User, { foreignKey: 'staffId', as: 'staff' });
HealthMonitoring.belongsTo(Elder, { foreignKey: 'elderId', as: 'elder' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(Elder, { foreignKey: 'elderId', as: 'elder' });

// StaffAssignment associations
StaffAssignment.belongsTo(User, { foreignKey: 'staffId', as: 'staff' });
StaffAssignment.belongsTo(Elder, { foreignKey: 'elderId', as: 'elder' });
StaffAssignment.belongsTo(User, { foreignKey: 'assignedBy', as: 'assignedByUser' });
StaffAssignment.belongsTo(User, { foreignKey: 'unassignedBy', as: 'unassignedByUser' });

// DoctorAssignment associations
DoctorAssignment.belongsTo(Elder, { foreignKey: 'elderId', as: 'elder' });
DoctorAssignment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
DoctorAssignment.belongsTo(User, { foreignKey: 'familyMemberId', as: 'familyMember' });

module.exports = {
  sequelize,
  User,
  Elder,
  Subscription,
  HealthMonitoring,
  Notification,
  StaffAssignment,
  DoctorAssignment,
  Inventory,
  SimplePrescription
};