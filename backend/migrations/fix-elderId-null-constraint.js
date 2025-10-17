// Migration to allow NULL values for elderId in Appointments table
// This is needed because during reservation, elderId is not yet known

const { sequelize } = require('../models');

async function migrate() {
  try {
    console.log('🔧 Starting migration: Allow NULL for elderId...');
    
    // Remove NOT NULL constraint from elderId
    await sequelize.query(`
      ALTER TABLE "Appointments" 
      ALTER COLUMN "elderId" DROP NOT NULL;
    `);
    
    console.log('✅ Migration complete: elderId now allows NULL values');
    console.log('   This allows appointments to be reserved without an elderId,');
    console.log('   which will be added when the reservation is completed.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('   Full error:', error);
    process.exit(1);
  }
}

migrate();
