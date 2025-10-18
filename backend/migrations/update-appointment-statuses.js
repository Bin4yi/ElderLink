// Migration to update appointment statuses
// Old: pending, approved, rejected → New: upcoming, today, in-progress, completed
const { Appointment } = require('../models');
const { Op } = require('sequelize');

async function migrateAppointmentStatuses() {
  try {
    console.log('🔄 Starting appointment status migration...');

    // Update 'pending' and 'approved' to 'upcoming'
    const pendingApproved = await Appointment.update(
      { status: 'upcoming' },
      {
        where: {
          status: {
            [Op.in]: ['pending', 'approved']
          }
        }
      }
    );
    console.log(`✅ Updated ${pendingApproved[0]} pending/approved appointments to 'upcoming'`);

    // Update 'rejected' to 'cancelled'
    const rejected = await Appointment.update(
      { status: 'cancelled' },
      {
        where: { status: 'rejected' }
      }
    );
    console.log(`✅ Updated ${rejected[0]} rejected appointments to 'cancelled'`);

    // Check for appointments that are today and not completed
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const todayAppointments = await Appointment.update(
      { status: 'today' },
      {
        where: {
          appointmentDate: {
            [Op.between]: [startOfDay, endOfDay]
          },
          status: 'upcoming'
        }
      }
    );
    console.log(`✅ Updated ${todayAppointments[0]} appointments to 'today' status`);

    console.log('✅ Appointment status migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  migrateAppointmentStatuses();
}

module.exports = migrateAppointmentStatuses;
