// Reset coordinator password
const { User } = require('../models');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

async function resetPassword() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');
    
    const coordinator = await User.findOne({ 
      where: { role: 'coordinator' } 
    });
    
    if (coordinator) {
      console.log('✅ Coordinator found:', coordinator.email);
      
      // Hash password manually
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('coordinator123', salt);
      
      // Update password directly
      coordinator.password = hashedPassword;
      await coordinator.save({ hooks: false }); // Skip hooks to avoid double hashing
      
      console.log('✅ Password reset to: coordinator123');
      
      // Test the password
      const isMatch = await bcrypt.compare('coordinator123', coordinator.password);
      console.log('✅ Password verification:', isMatch ? 'SUCCESS' : 'FAILED');
    } else {
      console.log('❌ No coordinator found');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

resetPassword();
