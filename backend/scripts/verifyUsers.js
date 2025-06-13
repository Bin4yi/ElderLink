// backend/scripts/verifyUsers.js
const sequelize = require('../config/database');
const { User } = require('../models');

const verifyUsers = async () => {
  try {
    console.log('🔍 Checking database users...');
    
    // Get all users
    const users = await User.findAll({
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'isActive'],
      order: [['role', 'ASC'], ['createdAt', 'ASC']]
    });
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
      console.log('💡 Run: node scripts/initializeDatabase.js');
      return;
    }
    
    console.log(`✅ Found ${users.length} users in database:\n`);
    
    // Group by role
    const usersByRole = users.reduce((acc, user) => {
      if (!acc[user.role]) acc[user.role] = [];
      acc[user.role].push(user);
      return acc;
    }, {});
    
    // Display users by role
    Object.entries(usersByRole).forEach(([role, roleUsers]) => {
      console.log(`📋 ${role.toUpperCase().replace('_', ' ')} (${roleUsers.length}):`);
      roleUsers.forEach(user => {
        const status = user.isActive ? '🟢' : '🔴';
        console.log(`  ${status} ${user.firstName} ${user.lastName} - ${user.email}`);
      });
      console.log('');
    });
    
    // Test admin login specifically
    const admin = await User.findOne({ where: { email: 'admin@elderlink.com' } });
    if (admin) {
      console.log('🔐 Testing admin password...');
      const isValid = await admin.comparePassword('Admin@123456');
      console.log(`Admin password test: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    }
    
  } catch (error) {
    console.error('❌ Error verifying users:', error);
  } finally {
    process.exit(0);
  }
};

verifyUsers();