const sequelize = require('../config/database');
const { User } = require('../models');

const addMentalHealthConsultants = async () => {
  try {
    console.log('🧠 Adding Mental Health Consultant role and users...');
    
    // First, sync the database to apply the new ENUM values
    await sequelize.sync({ alter: true });
    console.log('✅ Database schema updated with mental health consultant role');
    
    // Define mental health consultant users to create
    const mentalHealthConsultants = [
      {
        firstName: 'Dr. Sarah',
        lastName: 'Mitchell',
        email: 'dr.mitchell@elderlink.com',
        password: 'Mental@123', // Plain text - model will hash it
        phone: '+1-555-MH-001',
        role: 'mental_health_consultant',
        licenseNumber: 'MH-2024-001',
        specialization: 'Geriatric Psychology',
        isActive: true
      },
      {
        firstName: 'Dr. James',
        lastName: 'Thompson',
        email: 'dr.thompson@elderlink.com',
        password: 'Mental@456', // Plain text - model will hash it
        phone: '+1-555-MH-002',
        role: 'mental_health_consultant',
        licenseNumber: 'MH-2024-002',
        specialization: 'Dementia Care and Support',
        isActive: true
      },
      {
        firstName: 'Dr. Maria',
        lastName: 'Rodriguez',
        email: 'dr.maria.rodriguez@elderlink.com',
        password: 'Mental@789', // Plain text - model will hash it
        phone: '+1-555-MH-003',
        role: 'mental_health_consultant',
        licenseNumber: 'MH-2024-003',
        specialization: 'Anxiety and Depression in Seniors',
        isActive: true
      },
      {
        firstName: 'Dr. Robert',
        lastName: 'Chen',
        email: 'dr.robert.chen@elderlink.com',
        password: 'Mental@012', // Plain text - model will hash it
        phone: '+1-555-MH-004',
        role: 'mental_health_consultant',
        licenseNumber: 'MH-2024-004',
        specialization: 'Cognitive Behavioral Therapy for Elderly',
        isActive: true
      }
    ];

    // Create mental health consultant users
    console.log('🔄 Creating mental health consultant users...');
    let createdCount = 0;
    let existingCount = 0;

    for (const userData of mentalHealthConsultants) {
      try {
        // Check if user already exists
        const existingUser = await User.findOne({ 
          where: { email: userData.email } 
        });

        if (existingUser) {
          console.log(`ℹ️  Mental health consultant ${userData.email} already exists`);
          
          // Update role and additional fields if different
          const updateData = {
            role: 'mental_health_consultant',
            licenseNumber: userData.licenseNumber,
            specialization: userData.specialization
          };
          
          await existingUser.update(updateData);
          console.log(`✅ Updated ${userData.email} with mental health consultant details`);
          existingCount++;
        } else {
          // Create new mental health consultant user
          const newUser = await User.create(userData);
          console.log(`✅ Created mental health consultant: ${newUser.firstName} ${newUser.lastName} (${newUser.email})`);
          createdCount++;
        }
      } catch (userError) {
        console.error(`❌ Error processing user ${userData.email}:`, userError.message);
      }
    }

    // Verify all mental health consultants
    const allMentalHealthConsultants = await User.findAll({ 
      where: { role: 'mental_health_consultant' },
      order: [['firstName', 'ASC']]
    });
    
    console.log(`\n📊 Mental Health Consultant Summary:`);
    console.log(`   • Total mental health consultants: ${allMentalHealthConsultants.length}`);
    console.log(`   • Newly created: ${createdCount}`);
    console.log(`   • Already existed: ${existingCount}`);
    
    // List all mental health consultants
    console.log(`\n🧠 Mental Health Consultants:`);
    allMentalHealthConsultants.forEach(consultant => {
      console.log(`   • ${consultant.firstName} ${consultant.lastName}`);
      console.log(`     📧 ${consultant.email}`);
      console.log(`     🆔 License: ${consultant.licenseNumber}`);
      console.log(`     🎯 Specialization: ${consultant.specialization}`);
      console.log(`     📞 Phone: ${consultant.phone}`);
      console.log('');
    });
    
    console.log('✅ Mental health consultant role update completed!');
    return true;
  } catch (error) {
    console.error('❌ Error adding mental health consultants:', error);
    return false;
  }
};

// Run the update
if (require.main === module) {
  addMentalHealthConsultants().then(success => {
    console.log('\n🏁 Mental health consultant script execution completed');
    process.exit(success ? 0 : 1);
  });
}

module.exports = { addMentalHealthConsultants };