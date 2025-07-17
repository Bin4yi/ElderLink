const sequelize = require('../config/database');

const cleanAssociations = async () => {
  try {
    console.log('🔄 Cleaning up associations...');
    
    // Drop and recreate the staff_assignments table
    await sequelize.query('DROP TABLE IF EXISTS "staff_assignments" CASCADE;');
    console.log('✅ Dropped staff_assignments table');
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log('✅ Models synchronized');
    
    console.log('🎉 Associations cleaned successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning associations:', error);
    process.exit(1);
  }
};

cleanAssociations();