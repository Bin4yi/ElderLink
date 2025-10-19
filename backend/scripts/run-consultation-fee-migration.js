// backend/scripts/run-consultation-fee-migration.js
const sequelize = require('../config/database');
const migration = require('../migrations/add-consultation-fee-to-appointments');

async function runMigration() {
  try {
    console.log('🚀 Starting migration: Add consultationFee to Appointments...');
    
    await migration.up(sequelize.getQueryInterface());
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
