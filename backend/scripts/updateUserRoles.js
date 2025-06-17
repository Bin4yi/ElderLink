// backend/scripts/updateUserRoles.js
const sequelize = require('../config/database');
const { User } = require('../models');

const updateUserRoles = async () => {
  try {
    console.log('🔄 Updating user roles to include pharmacist...');
    
    // First, sync the database to apply the new ENUM values
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema updated');
    
    // Define pharmacist users to create
    const pharmacistUsers = [
      {
        firstName: 'Dr. Kevin',
        lastName: 'Lee',
        email: 'pharmacist.lee@elderlink.com',
        password: 'Pharm@123', // Plain text - model will hash it
        phone: '+1-555-PHARM01',
        role: 'pharmacist',
        isActive: true
      },
      {
        firstName: 'Dr. Maria',
        lastName: 'Santos',
        email: 'pharmacist.santos@elderlink.com',
        password: 'Pharm@456', // Plain text - model will hash it
        phone: '+1-555-PHARM02',
        role: 'pharmacist',
        isActive: true
      }
    ];

    // Create pharmacist users (only if they don't exist)
    console.log('🔄 Creating pharmacist users...');
    let createdCount = 0;
    let existingCount = 0;

    for (const userData of pharmacistUsers) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          where: { email: userData.email } 
        });

        if (existingUser) {
          console.log(`ℹ️  Pharmacist ${userData.email} already exists`);
          
          // Update role if it's different
          if (existingUser.role !== 'pharmacist') {
            await existingUser.update({ role: 'pharmacist' });
            console.log(`✅ Updated role for ${userData.email} to pharmacist`);
          }
          existingCount++;
        } else {
          // Create new pharmacist user
          const newUser = await User.create(userData);
          console.log(`✅ Created pharmacist: ${newUser.firstName} ${newUser.lastName} (${newUser.email})`);
          createdCount++;
        }
      } catch (userError) {
        console.error(`❌ Error processing user ${userData.email}:`, userError.message);
      }
    }

    // Verify that pharmacist role is now available
    const allPharmacists = await User.findAll({ where: { role: 'pharmacist' } });
    console.log(`\n📊 Summary:`);
    console.log(`   • Total pharmacist users: ${allPharmacists.length}`);
    console.log(`   • Newly created: ${createdCount}`);
    console.log(`   • Already existed: ${existingCount}`);
    
    // List all pharmacist users
    console.log(`\n👥 Pharmacist Users:`);
    allPharmacists.forEach(pharmacist => {
      console.log(`   • ${pharmacist.firstName} ${pharmacist.lastName} - ${pharmacist.email}`);
    });
    
    console.log('\n✅ User roles update completed!');
    return true;
  } catch (error) {
    console.error('❌ Error updating user roles:', error);
    return false;
  }
};

// Run the update
if (require.main === module) {
  updateUserRoles().then(success => {
    console.log('\n🏁 Script execution completed');
    process.exit(success ? 0 : 1);
  });
}

module.exports = { updateUserRoles };