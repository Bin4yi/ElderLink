const bcrypt = require('bcryptjs');
const { User } = require('../models');

async function testPassword() {
  try {
    console.log('🔍 Testing coordinator password...\n');

    // Find the coordinator
    const coordinator = await User.findOne({ 
      where: { email: 'coordinator@elderlink.com' } 
    });

    if (!coordinator) {
      console.log('❌ Coordinator not found');
      process.exit(1);
    }

    console.log('✅ Coordinator found:');
    console.log('   Email:', coordinator.email);
    console.log('   Role:', coordinator.role);
    console.log('   IsActive:', coordinator.isActive);
    console.log('   Password Hash:', coordinator.password.substring(0, 20) + '...');
    console.log('');

    // Test password directly with bcrypt
    const testPassword = 'Coord@123';
    console.log('🔐 Testing password:', testPassword);
    
    const bcryptResult = await bcrypt.compare(testPassword, coordinator.password);
    console.log('   Bcrypt compare result:', bcryptResult);

    // Test with User method
    const methodResult = await coordinator.comparePassword(testPassword);
    console.log('   comparePassword method result:', methodResult);

    // Test creating a new hash and comparing
    console.log('\n🔧 Creating fresh hash for comparison:');
    const freshHash = await bcrypt.hash(testPassword, 12);
    console.log('   Fresh hash:', freshHash.substring(0, 20) + '...');
    const freshCompare = await bcrypt.compare(testPassword, freshHash);
    console.log('   Fresh compare result:', freshCompare);

    // Test with wrong password
    console.log('\n❌ Testing with wrong password:');
    const wrongResult = await coordinator.comparePassword('WrongPassword');
    console.log('   Wrong password result:', wrongResult);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testPassword();
