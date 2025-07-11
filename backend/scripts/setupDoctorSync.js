// backend/scripts/setupDoctorSync.js
const { User } = require('../models');
const UserHooks = require('../middleware/userHooks');
const DoctorSyncService = require('../services/doctorSyncService');

// Setup function to initialize doctor sync system
const setupDoctorSync = async () => {
  try {
    console.log('🔧 Setting up doctor sync system...');
    
    // 1. Setup database hooks for automatic syncing
    UserHooks.setupHooks(User);
    
    // 2. Run initial sync to catch any existing doctors
    console.log('🔄 Running initial doctor sync...');
    const result = await DoctorSyncService.syncAllDoctorsFromUsers();
    
    if (result.total > 0) {
      console.log(`📊 Initial sync results:`);
      console.log(`   • Found ${result.total} doctor users`);
      console.log(`   • Created ${result.created} new doctor profiles`);
      console.log(`   • Updated ${result.updated} existing profiles`);
      console.log(`   • Skipped ${result.skipped} up-to-date profiles`);
    } else {
      console.log('📋 No doctor users found in system');
    }
    
    console.log('✅ Doctor sync system setup complete');
    return result;
    
  } catch (error) {
    console.error('❌ Error setting up doctor sync:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  setupDoctorSync()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = setupDoctorSync;

// Add this to your main app.js or server.js:
/*
const setupDoctorSync = require('./scripts/setupDoctorSync');

// During app initialization:
setupDoctorSync().catch(console.error);
*/