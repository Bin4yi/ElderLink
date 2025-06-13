// backend/scripts/debugPassword.js
const sequelize = require('../config/database');
const { User } = require('../models');
const bcrypt = require('bcryptjs');

const debugPassword = async () => {
  try {
    console.log('🔍 Debugging password issue...');
    
    // Get the admin user
    const admin = await User.findOne({ where: { email: 'admin@elderlink.com' } });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      return;
    }
    
    console.log('✅ Admin user found:');
    console.log('ID:', admin.id);
    console.log('Email:', admin.email);
    console.log('Role:', admin.role);
    console.log('Stored password hash:', admin.password);
    console.log('Hash length:', admin.password.length);
    
    // Test different passwords
    const testPasswords = [
      'Admin@123456',
      'admin@123456',
      'Admin@123',
      'Manager@123'
    ];
    
    console.log('\n🔐 Testing passwords:');
    for (const testPassword of testPasswords) {
      try {
        const isValid = await admin.comparePassword(testPassword);
        console.log(`"${testPassword}": ${isValid ? '✅ VALID' : '❌ Invalid'}`);
      } catch (error) {
        console.log(`"${testPassword}": ❌ Error - ${error.message}`);
      }
    }
    
    // Test manual bcrypt comparison
    console.log('\n🔧 Manual bcrypt test:');
    try {
      const manualTest = await bcrypt.compare('Admin@123456', admin.password);
      console.log('Manual bcrypt compare result:', manualTest ? '✅ VALID' : '❌ Invalid');
    } catch (error) {
      console.log('Manual bcrypt error:', error.message);
    }
    
    // Test creating a new hash
    console.log('\n🔨 Creating fresh hash:');
    const freshHash = await bcrypt.hash('Admin@123456', 12);
    console.log('Fresh hash:', freshHash);
    const freshTest = await bcrypt.compare('Admin@123456', freshHash);
    console.log('Fresh hash test:', freshTest ? '✅ VALID' : '❌ Invalid');
    
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    process.exit(0);
  }
};

debugPassword();