const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function testUserMethods() {
  try {
    // Find a user
    const user = await User.findOne({ where: { email: 'pasansanjiiwa2022@gmail.com' } });
    
    if (!user) {
      console.log('❌ User not found');
      return;
    }
    
    console.log('✅ User found:', user.email);
    console.log('🔍 User role:', user.role);
    console.log('🔍 User isActive:', user.isActive);
    console.log('🔍 comparePassword method:', typeof user.comparePassword);
    
    // Debug password info
    console.log('🔐 Stored password hash:', user.password);
    console.log('🔐 Password hash length:', user.password.length);
    console.log('🔐 Password starts with $2:', user.password.startsWith('$2'));
    
    // Test with different passwords
    const testPasswords = ['12345678'];
    
    for (const testPassword of testPasswords) {
      console.log(`\n🔍 Testing password: "${testPassword}"`);
      
      // Test with model method
      let isValidModel = false;
      if (typeof user.comparePassword === 'function') {
        isValidModel = await user.comparePassword(testPassword);
        console.log(`🔐 Model method result: ${isValidModel}`);
      }
      
      // Test with bcrypt directly
      const isValidBcrypt = await bcrypt.compare(testPassword, user.password);
      console.log(`🔐 Bcrypt direct result: ${isValidBcrypt}`);
      
      if (isValidModel || isValidBcrypt) {
        console.log(`✅ CORRECT PASSWORD FOUND: "${testPassword}"`);
        break;
      }
    }
    
  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

testUserMethods();