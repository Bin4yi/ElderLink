// backend/scripts/syncDatabase.js
const sequelize = require('../config/database');
const { 
  User, 
  Subscription, 
  Elder, 
  Notification, 
  Doctor,
  Appointment,
  DoctorSchedule,
  ScheduleException,
  ConsultationRecord,
  Prescription,
  AppointmentNotification,
  ElderMedicalHistory
} = require('../models');

const syncDatabase = async () => {
  try {
    console.log('🔄 Syncing database (keeping existing Users, Subscriptions, Elders, Notifications)...');
    
    // Drop ONLY the NEW appointment-related tables (in reverse dependency order)
    await sequelize.query('DROP TABLE IF EXISTS "AppointmentNotifications" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "ElderMedicalHistory" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "Prescriptions" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "ConsultationRecords" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "ScheduleExceptions" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "DoctorSchedules" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "Appointments" CASCADE;');
    await sequelize.query('DROP TABLE IF EXISTS "doctors" CASCADE;');

    // Drop ONLY the NEW enums
    await sequelize.query('DROP TYPE IF EXISTS "enum_AppointmentNotifications_type" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_AppointmentNotifications_method" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_Appointments_type" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_Appointments_priority" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_Appointments_status" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_doctors_verificationStatus" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_DoctorSchedules_dayOfWeek" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_ConsultationRecords_status" CASCADE;');
    await sequelize.query('DROP TYPE IF EXISTS "enum_Prescriptions_status" CASCADE;');
    
    console.log('✅ New appointment tables dropped');
    
    // Sync existing tables WITHOUT force (to preserve data)
    await User.sync({ alter: true });
    console.log('✅ Users table synced (data preserved)');
    
    await Subscription.sync({ alter: true });
    console.log('✅ Subscriptions table synced (data preserved)');
    
    await Elder.sync({ alter: true });
    console.log('✅ Elders table synced (data preserved)');
    
    await Notification.sync({ alter: true });
    console.log('✅ Notifications table synced (data preserved)');
    
    // Create NEW tables with force: true IN CORRECT ORDER
    await Doctor.sync({ force: true });
    console.log('✅ Doctors table created (new)');
    
    await Appointment.sync({ force: true });
    console.log('✅ Appointments table created (new)');
    
    await DoctorSchedule.sync({ force: true });
    console.log('✅ DoctorSchedules table created (new)');
    
    await ScheduleException.sync({ force: true });
    console.log('✅ ScheduleExceptions table created (new)');
    
    await ConsultationRecord.sync({ force: true });
    console.log('✅ ConsultationRecords table created (new)');
    
    await Prescription.sync({ force: true });
    console.log('✅ Prescriptions table created (new)');
    
    // CREATE AppointmentNotifications AFTER Appointments and Users exist
    await AppointmentNotification.sync({ force: true });
    console.log('✅ AppointmentNotifications table created (new)');
    
    await ElderMedicalHistory.sync({ force: true });
    console.log('✅ ElderMedicalHistory table created (new)');
    
    console.log('🎉 Database sync completed successfully!');
    console.log('📊 Existing data in Users, Subscriptions, Elders, Notifications preserved');
    
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    throw error;
  }
};

if (require.main === module) {
  syncDatabase().then(() => {
    console.log('Database sync completed');
    process.exit(0);
  }).catch(error => {
    console.error('Database sync failed:', error);
    process.exit(1);
  });
}

module.exports = syncDatabase;