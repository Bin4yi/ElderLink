// backend/migrations/add-slotDuration-to-schedule.js
const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');

async function addSlotDurationColumn() {
  const queryInterface = sequelize.getQueryInterface();

  try {
    console.log('🔄 Adding slotDuration column to doctor_schedules table...');

    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('doctor_schedules');

    // Add slotDuration column if it doesn't exist
    if (!tableDescription.slotDuration) {
      await queryInterface.addColumn('doctor_schedules', 'slotDuration', {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        allowNull: true
      });
      console.log('✅ Added slotDuration column');
    } else {
      console.log('ℹ️ slotDuration column already exists');
    }

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  addSlotDurationColumn()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = addSlotDurationColumn;
