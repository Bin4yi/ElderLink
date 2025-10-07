// Check coordinator user
const { User } = require('../models');
const sequelize = require('../config/database');

async function checkCoordinator() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const coordinator = await User.findOne({ 
      where: { role: 'coordinator' } 
    });
    
    if (coordinator) {
      console.log('✅ Coordinator found:', coordinator.email);
    } else {
      console.log('❌ No coordinator found');
      console.log('Creating coordinator...');
      
      const newCoordinator = await User.create({
        email: 'coordinator@elderlink.com',
        password: 'coordinator123',
        firstName: 'Emergency',
        lastName: 'Coordinator',
        role: 'coordinator',
        isActive: true
      });
      
      console.log('✅ Coordinator created:', newCoordinator.email);
    }
    
    // Check for drivers
    const drivers = await User.findAll({
      where: { role: 'ambulance_driver' }
    });
    
    console.log(`\n📋 Found ${drivers.length} driver(s):`);
    drivers.forEach(d => {
      console.log(`  - ${d.firstName} ${d.lastName} (${d.email})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkCoordinator();
