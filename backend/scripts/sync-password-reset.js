// backend/scripts/sync-password-reset.js
const sequelize = require('../config/database');
const { PasswordResetOTP } = require('../models');

async function syncPasswordResetTable() {
  try {
    console.log('🔄 Syncing PasswordResetOTP table...');
    
    await PasswordResetOTP.sync({ alter: true });
    
    console.log('✅ PasswordResetOTP table synced successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing table:', error);
    process.exit(1);
  }
}

syncPasswordResetTable();
