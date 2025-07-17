const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Elder = require('./Elder');
const Subscription = require('./Subscription');
const Elder = require('./Elder');
const Notification = require('./Notification');
const Doctor = require('./Doctor');

// NEW: Appointment system models
const Appointment = require('./Appointment');
const DoctorSchedule = require('./DoctorSchedule');
const ScheduleException = require('./ScheduleException');
const ConsultationRecord = require('./ConsultationRecord');
const Prescription = require('./Prescription');
const AppointmentNotification = require('./AppointmentNotification');
const ElderMedicalHistory = require('./ElderMedicalHistory');

// ========== EXISTING ASSOCIATIONS ==========

// User associations
User.hasMany(Elder, { foreignKey: 'userId', as: 'elders' });
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
User.hasMany(HealthMonitoring, { foreignKey: 'staffId', as: 'healthMonitorings' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(StaffAssignment, { foreignKey: 'staffId', as: 'staffAssignments' });
User.hasMany(StaffAssignment, { foreignKey: 'assignedBy', as: 'assignedStaffAssignments' });

// Elder associations
Elder.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Elder.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
Elder.hasMany(HealthMonitoring, { foreignKey: 'elderId', as: 'healthRecords' });
Elder.hasMany(Notification, { foreignKey: 'elderId', as: 'elderNotifications' });
Elder.hasMany(StaffAssignment, { foreignKey: 'elderId', as: 'staffAssignments' });

// Subscription associations
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Subscription.hasOne(Elder, { foreignKey: 'subscriptionId', as: 'elder' });

// HealthMonitoring associations
HealthMonitoring.belongsTo(User, { foreignKey: 'staffId', as: 'staff' });
HealthMonitoring.belongsTo(Elder, { foreignKey: 'elderId', as: 'elder' });

// Notification associations
Notification.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Notification.belongsTo(Elder, { foreignKey: 'elderId', as: 'elder' });

// Reverse associations for Appointments
User.hasMany(Appointment, {
  foreignKey: 'familyMemberId',
  as: 'bookedAppointments'
});

Elder.hasMany(Appointment, {
  foreignKey: 'elderId',
  as: 'appointments'
});

Doctor.hasMany(Appointment, {
  foreignKey: 'doctorId',
  as: 'doctorAppointments'
});

// Doctor Schedule associations
DoctorSchedule.belongsTo(Doctor, {
  foreignKey: 'doctorId',
  as: 'doctor'
});

Doctor.hasMany(DoctorSchedule, {
  foreignKey: 'doctorId',
  as: 'schedules'
});

// Schedule Exception associations
ScheduleException.belongsTo(Doctor, {
  foreignKey: 'doctorId',
  as: 'doctor'
});

Doctor.hasMany(ScheduleException, {
  foreignKey: 'doctorId',
  as: 'scheduleExceptions'
});

// Consultation Record associations
ConsultationRecord.belongsTo(Appointment, {
  foreignKey: 'appointmentId',
  as: 'appointment'
});

ConsultationRecord.belongsTo(Doctor, {
  foreignKey: 'doctorId',
  as: 'doctor'
});

ConsultationRecord.belongsTo(Elder, {
  foreignKey: 'elderId',
  as: 'elder'
});

// Reverse associations for Consultation Records
Appointment.hasOne(ConsultationRecord, {
  foreignKey: 'appointmentId',
  as: 'consultationRecord'
});

Doctor.hasMany(ConsultationRecord, {
  foreignKey: 'doctorId',
  as: 'consultationRecords'
});

Elder.hasMany(ConsultationRecord, {
  foreignKey: 'elderId',
  as: 'consultationRecords'
});

// Prescription associations
Prescription.belongsTo(ConsultationRecord, {
  foreignKey: 'consultationId',
  as: 'consultation'
});

Prescription.belongsTo(Doctor, {
  foreignKey: 'doctorId',
  as: 'doctor'
});

Prescription.belongsTo(Elder, {
  foreignKey: 'elderId',
  as: 'elder'
});

// Reverse associations for Prescriptions
ConsultationRecord.hasMany(Prescription, {
  foreignKey: 'consultationId',
  as: 'prescriptions'
});

Doctor.hasMany(Prescription, {
  foreignKey: 'doctorId',
  as: 'prescriptions'
});

Elder.hasMany(Prescription, {
  foreignKey: 'elderId',
  as: 'prescriptions'
});

// Appointment Notification associations
AppointmentNotification.belongsTo(Appointment, {
  foreignKey: 'appointmentId',
  as: 'appointment'
});

AppointmentNotification.belongsTo(User, {
  foreignKey: 'recipientId',
  as: 'recipient'
});

// Reverse associations for Appointment Notifications
Appointment.hasMany(AppointmentNotification, {
  foreignKey: 'appointmentId',
  as: 'notifications'
});

User.hasMany(AppointmentNotification, {
  foreignKey: 'recipientId',
  as: 'appointmentNotifications'
});

// Elder Medical History associations
ElderMedicalHistory.belongsTo(Elder, {
  foreignKey: 'elderId',
  as: 'elder'
});

ElderMedicalHistory.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator'
});

// Reverse associations for Elder Medical History
Elder.hasMany(ElderMedicalHistory, {
  foreignKey: 'elderId',
  as: 'medicalHistoryRecords' // Changed alias to avoid conflict
});

User.hasMany(ElderMedicalHistory, {
  foreignKey: 'createdBy',
  as: 'createdMedicalRecords'
});

// Export all models including new ones
module.exports = {
  sequelize,
  User,
  Elder,
  Subscription,
  Elder,
  Notification,
  Doctor,
  // NEW: Appointment system models
  Appointment,
  DoctorSchedule,
  ScheduleException,
  ConsultationRecord,
  Prescription,
  AppointmentNotification,
  ElderMedicalHistory
};