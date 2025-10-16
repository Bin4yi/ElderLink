const sequelize = require('../config/database');
const { Elder, User } = require('../models');

async function checkElder() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    const elderId = '8b4f18ef-da09-43c4-8c57-a6d9af12b5a9';
    
    console.log('\n🔍 Searching for elder with ID:', elderId);
    
    // Check in Elder table
    const elder = await Elder.findByPk(elderId);
    console.log('\n📋 Elder found in Elder table:', elder ? 'YES' : 'NO');
    if (elder) {
      console.log('Elder data:', {
        id: elder.id,
        firstName: elder.firstName,
        lastName: elder.lastName,
        userId: elder.userId,
        phone: elder.phone
      });
    }
    
    // Check all elders
    const allElders = await Elder.findAll({
      attributes: ['id', 'firstName', 'lastName', 'userId'],
      limit: 10
    });
    
    console.log('\n📋 All elders in database:');
    allElders.forEach(e => {
      console.log(`   - ${e.id} | ${e.firstName} ${e.lastName} | User ID: ${e.userId}`);
    });
    
    // Check in User table with elder role
    const elderUsers = await User.findAll({
      where: { role: 'elder' },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role']
    });
    
    console.log('\n📋 Users with elder role:');
    elderUsers.forEach(u => {
      console.log(`   - ${u.id} | ${u.firstName} ${u.lastName} | ${u.email}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkElder();