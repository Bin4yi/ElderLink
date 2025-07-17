const sequelize = require('../config/database');
const { StaffAssignment } = require('../models');

const fixStaffAssignments = async () => {
  try {
    console.log('🔧 Fixing StaffAssignment table...');
    
    // Drop the existing table with foreign key constraints
    await sequelize.query('DROP TABLE IF EXISTS "staff_assignments" CASCADE;');
    console.log('✅ Dropped existing staff_assignments table');
    
    // Recreate the table with correct schema
    await StaffAssignment.sync({ force: true });
    console.log('✅ Recreated staff_assignments table with correct schema');
    
    console.log('🎉 StaffAssignment table fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing StaffAssignment table:', error);
    throw error;
  }
};

// Run the fix
if (require.main === module) {
  fixStaffAssignments().then(() => {
    console.log('✅ Fix completed');
    process.exit(0);
  }).catch(error => {
    console.error('❌ Fix failed:', error);
    process.exit(1);
  });
}

module.exports = { fixStaffAssignments };