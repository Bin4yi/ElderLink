const sequelize = require('../config/database');

const quickFix = async () => {
  try {
    console.log('🔄 Running quick fix...');
    
    // Sync models without force
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized');
    
    console.log('🎉 Quick fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Quick fix failed:', error);
    process.exit(1);
  }
};

quickFix();