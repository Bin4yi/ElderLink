// backend/migrations/run-add-consultation-fee.js
const sequelize = require('../config/database');

async function addColumn() {
  try {
    console.log('🔄 Adding consultationFee column to Appointments table...');
    
    await sequelize.query(`
      ALTER TABLE "Appointments" 
      ADD COLUMN IF NOT EXISTS "consultationFee" DECIMAL(10,2) NULL
    `);
    
    console.log('✅ Successfully added consultationFee column');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error.message);
    process.exit(1);
  }
}

addColumn();
