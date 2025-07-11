// backend/models/index.js - Complete models file
const User = require('./User');
const Subscription = require('./Subscription');
const Elder = require('./Elder');
const Notification = require('./Notification');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');
const Consultation = require('./Consultation');
const PatientReport = require('./PatientReport');
const MedicalRecord = require('./MedicalRecord');

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

// User has one doctor profile (if role is doctor)
User.hasOne(Doctor, {
  foreignKey: 'userId',
  as: 'doctorProfile',
  onDelete: 'CASCADE'
});

// Doctor belongs to user
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


// EXISTING DOCTOR ASSOCIATIONS

// Doctor has many appointments
Doctor.hasMany(Appointment, {
  foreignKey: 'doctorId',
  as: 'appointments',
  onDelete: 'CASCADE'
});

// Doctor has many consultations
Doctor.hasMany(Consultation, {
  foreignKey: 'doctorId',
  as: 'consultations',
  onDelete: 'CASCADE'
});

// Doctor has many patient reports
Doctor.hasMany(PatientReport, {
  foreignKey: 'doctorId',
  as: 'patientReports',
  onDelete: 'CASCADE'
});

// Doctor has many medical records
Doctor.hasMany(MedicalRecord, {
  foreignKey: 'doctorId',
  as: 'medicalRecords',
  onDelete: 'CASCADE'
});

// Doctor can approve medical records
Doctor.hasMany(MedicalRecord, {
  foreignKey: 'approvedBy',
  as: 'approvedRecords',
  onDelete: 'SET NULL'
});

// ======================
// APPOINTMENT ASSOCIATIONS
// ======================

// Appointment belongs to doctor
Appointment.belongsTo(Doctor, {
  foreignKey: 'doctorId',
  as: 'doctor'
});

// Appointment has one consultation (for video/phone appointments)
Appointment.hasOne(Consultation, {
  foreignKey: 'appointmentId',
  as: 'consultation',
  onDelete: 'CASCADE'
});

// Appointment has one patient report
Appointment.hasOne(PatientReport, {
  foreignKey: 'appointmentId',
  as: 'patientReport',
  onDelete: 'CASCADE'
});

// ======================
// CONSULTATION ASSOCIATIONS
// ======================

// Consultation belongs to appointment
Consultation.belongsTo(Appointment, {
  foreignKey: 'appointmentId',
  as: 'appointment'
});

// Consultation belongs to doctor
Consultation.belongsTo(Doctor, {
  foreignKey: 'doctorId',
  as: 'doctor'
});

// Consultation has one patient report
Consultation.hasOne(PatientReport, {
  foreignKey: 'consultationId',
  as: 'patientReport',
  onDelete: 'CASCADE'
});

// ======================
// PATIENT REPORT ASSOCIATIONS
// ======================

// Patient Report belongs to appointment
PatientReport.belongsTo(Appointment, {
  foreignKey: 'appointmentId',
  as: 'appointment'
});

// Patient Report belongs to consultation (optional)
PatientReport.belongsTo(Consultation, {
  foreignKey: 'consultationId',
  as: 'consultation'
});

// Patient Report belongs to doctor
PatientReport.belongsTo(Doctor, {
  foreignKey: 'doctorId',
  as: 'doctor'
});

// Patient Report has many medical records
PatientReport.hasMany(MedicalRecord, {
  foreignKey: 'patientReportId',
  as: 'medicalRecords',
  onDelete: 'CASCADE'
});

// ======================
// MEDICAL RECORD ASSOCIATIONS
// ======================

// Medical Record belongs to patient report
MedicalRecord.belongsTo(PatientReport, {
  foreignKey: 'patientReportId',
  as: 'patientReport'
});

// Medical Record belongs to doctor (creator)
MedicalRecord.belongsTo(Doctor, {
  foreignKey: 'doctorId',
  as: 'doctor'
});

// Medical Record belongs to approving doctor
MedicalRecord.belongsTo(Doctor, {
  foreignKey: 'approvedBy',
  as: 'approver'
});

// ======================
// HELPER FUNCTIONS
// ======================

// Function to get all models
const getAllModels = () => {
  return {
    User,
    Doctor,
    Appointment,
    Consultation,
    PatientReport,
    MedicalRecord
  };
};

// Function to sync all models with database
const syncModels = async (options = {}) => {
  try {
    const models = getAllModels();
    
    // Sync models in order (considering foreign key dependencies)
    await User.sync(options);
    await Doctor.sync(options);
    await Appointment.sync(options);
    await Consultation.sync(options);
    await PatientReport.sync(options);
    await MedicalRecord.sync(options);
    
    console.log('All models synced successfully');
    return true;
  } catch (error) {
    console.error('Error syncing models:', error);
    throw error;
  }
};

// Function to get doctor users (users with role 'doctor')
const getDoctorUsers = async () => {
  try {
    const doctorUsers = await User.findAll({
      where: { role: 'doctor' },
      include: [
        {
          model: Doctor,
          as: 'doctorProfile',
          required: false
        }
      ]
    });
    
    return doctorUsers;
  } catch (error) {
    console.error('Error fetching doctor users:', error);
    throw error;
  }
};

// Function to get complete doctor info (User + Doctor data)
const getCompleteDoctorInfo = async (userId) => {
  try {
    const doctorInfo = await User.findByPk(userId, {
      include: [
        {
          model: Doctor,
          as: 'doctorProfile',
          include: [
            {
              model: Appointment,
              as: 'appointments',
              required: false
            },
            {
              model: Consultation,
              as: 'consultations',
              required: false
            }
          ]
        }
      ]
    });
    
    return doctorInfo;
  } catch (error) {
    console.error('Error fetching complete doctor info:', error);
    throw error;
  }
};

module.exports = {
  User,
  Subscription,
  Elder,
  Notification,
  Doctor,
  Appointment,
  Consultation,
  PatientReport,
  MedicalRecord,
  getAllModels,
  syncModels,
  getDoctorUsers,
  getCompleteDoctorInfo
};