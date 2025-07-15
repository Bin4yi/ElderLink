// backend/scripts/migrateDoctorsToTable.js
const { User, Doctor } = require('../models');

const migrateDoctorsToTable = async () => {
  try {
    console.log('🔄 Starting doctor migration...');
    
    // Find all users with role='doctor'
    const doctorUsers = await User.findAll({
      where: {
        role: 'doctor'
      }
    });

    console.log(`Found ${doctorUsers.length} doctor users to migrate`);

    if (doctorUsers.length === 0) {
      console.log('⚠️  No doctor users found! Make sure you have users with role="doctor" in your Users table.');
      return;
    }

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of doctorUsers) {
      try {
        // Check if doctor profile already exists
        const existingProfile = await Doctor.findOne({
          where: { userId: user.id }
        });

        if (!existingProfile) {
          // Create doctor profile
          await Doctor.create({
            userId: user.id,
            specialization: 'General Medicine',
            licenseNumber: `LIC${Date.now()}${Math.floor(Math.random() * 10000)}`,
            experience: Math.floor(Math.random() * 20) + 1,
            consultationFee: 100.00,
            availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            timeSlots: ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00'],
            isActive: true,
            verificationStatus: 'Verified',
            verifiedAt: new Date(),
            verifiedBy: user.id,
            medicalSchool: 'Medical University',
            clinicAddress: '123 Medical Street, City',
            phone: user.phone || null,
            email: user.email,
            bio: `Experienced ${user.firstName} ${user.lastName} with expertise in general medicine.`
          });
          
          created++;
          console.log(`✅ Created doctor profile for ${user.firstName} ${user.lastName} (${user.email})`);
        } else {
          skipped++;
          console.log(`⚠️  Doctor profile already exists for ${user.firstName} ${user.lastName}`);
        }
      } catch (error) {
        errors++;
        console.error(`❌ Error creating profile for ${user.firstName} ${user.lastName}:`, error.message);
      }
    }

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Created: ${created} doctor profiles`);
    console.log(`⚠️  Skipped: ${skipped} existing profiles`);
    console.log(`❌ Errors: ${errors} failed profiles`);

    // Verify the results
    const totalDoctors = await Doctor.count();
    console.log(`📊 Total doctors in table: ${totalDoctors}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Run migration if called directly
if (require.main === module) {
  migrateDoctorsToTable().then(() => {
    console.log('Migration script completed');
    process.exit(0);
  }).catch(error => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = migrateDoctorsToTable;