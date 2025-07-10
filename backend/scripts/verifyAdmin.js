// backend/scripts/verifyAdmin.js
const { User } = require('../models');

const verifyAdmin = async () => {
  try {
    console.log('🔍 Checking admin users...');
    
    // Find all admin users
    const adminUsers = await User.findAll({
      where: { role: 'admin' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive']
    });
    
    console.log(`\n👨‍💼 Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(admin => {
      console.log(`  • ${admin.firstName} ${admin.lastName}`);
      console.log(`    📧 ${admin.email}`);
      console.log(`    🔑 Role: ${admin.role}`);
      console.log(`    ✅ Active: ${admin.isActive}`);
      console.log('');
    });
    
    // Test password for main admin
    const mainAdmin = await User.findOne({ where: { email: 'admin@elderlink.com' } });
    if (mainAdmin) {
      console.log('🔐 Testing admin password...');
      const isValid = await mainAdmin.comparePassword('Admin@123456');
      console.log(`Password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (!isValid) {
        console.log('💡 Try running: node scripts/initializeDatabase.js');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
};

verifyAdmin();