// backend/scripts/syncDoctors.js
const DoctorSyncService = require('../services/doctorSyncService');
const sequelize = require('../config/database');
require('dotenv').config();

// Manual script to sync doctors from User table
const runSync = async () => {
  try {
    console.log('🚀 Starting manual doctor sync...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    // Run the sync
    const result = await DoctorSyncService.syncAllDoctorsFromUsers();
    
    console.log('\n📊 Sync Results:');
    console.log(`   • Total doctor users: ${result.total}`);
    console.log(`   • New doctors created: ${result.created}`);
    console.log(`   • Existing doctors updated: ${result.updated}`);
    console.log(`   • Doctors skipped: ${result.skipped}`);
    
    if (result.created > 0) {
      console.log('\n⚠️  Note: New doctors have default values and need admin completion:');
      console.log('   • Specialization: General Medicine (update required)');
      console.log('   • License Number: TEMP-xxxxxxxx (update required)');
      console.log('   • Verification Status: Pending (admin verification needed)');
      console.log('   • Experience: 0 years (update required)');
    }
    
    // Get doctors that still need updates
    const needsUpdate = await DoctorSyncService.getDoctorsNeedingUpdate();
    if (needsUpdate.length > 0) {
      console.log(`\n🔧 ${needsUpdate.length} doctors need profile completion:`);
      needsUpdate.forEach(doctor => {
        console.log(`   • ${doctor.user.firstName} ${doctor.user.lastName} (${doctor.user.email})`);
      });
    }
    
    console.log('\n✅ Sync completed successfully!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Admin should complete doctor profiles via dashboard');
    console.log('   2. Update specializations, license numbers, and experience');
    console.log('   3. Verify and approve doctor profiles');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Sync failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (require.main === module) {
  runSync();
}

module.exports = runSync;

// Usage: node scripts/syncDoctors.js