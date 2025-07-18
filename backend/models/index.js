const sequelize = require('../config/database');

// Import models
const User = require('./User');
const Elder = require('./Elder');
const Subscription = require('./Subscription');
// const Elder = require('./Elder');
const Notification = require('./Notification');


const StaffAssignment = require('./StaffAssignment'); // ✅ Changed from StaffAssignmentModel
const DoctorAssignment = require('./DoctorAssignment'); // ✅ Add this


// NEW: Appointment system models
const Appointment = require('./Appointment');
// const DoctorSchedule = require('./DoctorSchedule');
// const ScheduleException = require('./ScheduleException');
const ConsultationRecord = require('./ConsultationRecord');
const Prescription = require('./Prescription');
// const AppointmentNotification = require('./AppointmentNotification');
// const ElderMedicalHistory = require('./ElderMedicalHistory');


// Clear associations for all models
[User, Elder, Subscription, HealthMonitoring, Notification, StaffAssignment, DoctorAssignment].forEach(clearAssociations);


// User associations
User.hasMany(Elder, { foreignKey: 'userId', as: 'elders' });
User.hasMany(Subscription, { foreignKey: 'userId', as: 'subscriptions' });
User.hasMany(HealthMonitoring, { foreignKey: 'staffId', as: 'healthMonitorings' });
User.hasMany(Notification, { foreignKey: 'userId', as: 'notifications' });
User.hasMany(StaffAssignment, { foreignKey: 'staffId', as: 'staffAssignments' });
User.hasMany(DoctorAssignment, { foreignKey: 'doctorId', as: 'doctorAssignments' }); // ✅ Add this
User.hasMany(DoctorAssignment, { foreignKey: 'familyMemberId', as: 'familyDoctorAssignments' }); // ✅ Add this

// Elder associations
Elder.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Elder.belongsTo(Subscription, { foreignKey: 'subscriptionId', as: 'subscription' });
Elder.hasMany(HealthMonitoring, { foreignKey: 'elderId', as: 'healthRecords' });
Elder.hasMany(Notification, { foreignKey: 'elderId', as: 'elderNotifications' });
Elder.hasMany(StaffAssignment, { foreignKey: 'elderId', as: 'staffAssignments' });
Elder.hasMany(DoctorAssignment, { foreignKey: 'elderId', as: 'doctorAssignmentRecords' }); // ✅ Changed from 'doctorAssignments' to 'doctorAssignmentRecords'

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
// DoctorSchedule.belongsTo(Doctor, {
//   foreignKey: 'doctorId',
//   as: 'doctor'
// });

// Doctor.hasMany(DoctorSchedule, {
//   foreignKey: 'doctorId',
//   as: 'schedules'
// });

// Schedule Exception associations
// ScheduleException.belongsTo(Doctor, {
//   foreignKey: 'doctorId',
//   as: 'doctor'
// });

// Doctor.hasMany(ScheduleException, {
//   foreignKey: 'doctorId',
//   as: 'scheduleExceptions'
// });

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
// Prescription.belongsTo(ConsultationRecord, {
//   foreignKey: 'consultationId',
//   as: 'consultation'
// });



// DoctorAssignment associations
DoctorAssignment.belongsTo(Elder, { foreignKey: 'elderId', as: 'elder' });
DoctorAssignment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
DoctorAssignment.belongsTo(User, { foreignKey: 'familyMemberId', as: 'familyMember' });

module.exports = {
  sequelize,
  User,
  Elder,
  Subscription,
  Elder,
  Notification,


  StaffAssignment,
  DoctorAssignment // ✅ Add this

};