// backend/scripts/seed-doctor-schedules.js
const { Doctor, DoctorSchedule } = require('../models');
const sequelize = require('../config/database');

async function seedDoctorSchedules() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get all doctors
    const doctors = await Doctor.findAll();
    console.log(`📋 Found ${doctors.length} doctors`);

    if (doctors.length === 0) {
      console.log('⚠️ No doctors found. Please add doctors first.');
      process.exit(0);
    }

    // Clear existing schedules
    await DoctorSchedule.destroy({ where: {} });
    console.log('🗑️ Cleared existing schedules');

    // Create schedules for the next 30 days
    const today = new Date();
    const schedules = [];

    for (const doctor of doctors) {
      console.log(`\n👨‍⚕️ Creating schedules for Doctor ID: ${doctor.id}`);

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        
        const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Skip Sundays (0)
        if (dayOfWeek === 0) continue;

        // Create morning and afternoon sessions
        const sessions = [];

        // Morning session: 9:00 AM - 12:00 PM (Monday to Saturday)
        sessions.push({
          doctorId: doctor.id,
          date: date.toISOString().split('T')[0],
          startTime: '09:00:00',
          endTime: '12:00:00',
          isAvailable: true
        });

        // Afternoon session: 2:00 PM - 5:00 PM (Monday to Friday)
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
          sessions.push({
            doctorId: doctor.id,
            date: date.toISOString().split('T')[0],
            startTime: '14:00:00',
            endTime: '17:00:00',
            isAvailable: true
          });
        }

        // Evening session: 6:00 PM - 8:00 PM (Monday, Wednesday, Friday)
        if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
          sessions.push({
            doctorId: doctor.id,
            date: date.toISOString().split('T')[0],
            startTime: '18:00:00',
            endTime: '20:00:00',
            isAvailable: true
          });
        }

        schedules.push(...sessions);
      }
    }

    // Bulk insert schedules
    await DoctorSchedule.bulkCreate(schedules);
    console.log(`\n✅ Created ${schedules.length} schedule entries for ${doctors.length} doctor(s)`);

    // Show sample schedule
    const sampleSchedule = await DoctorSchedule.findAll({
      limit: 5,
      include: [{
        model: Doctor,
        as: 'doctor'
      }]
    });

    console.log('\n📅 Sample schedules created:');
    sampleSchedule.forEach(schedule => {
      console.log(`  - ${schedule.date}: ${schedule.startTime} - ${schedule.endTime}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding schedules:', error);
    process.exit(1);
  }
}

seedDoctorSchedules();
