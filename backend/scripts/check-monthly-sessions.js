// Script to check monthly sessions in the database
const { MonthlySession, Elder, Doctor, User } = require('../models');
const sequelize = require('../config/database');

async function checkMonthlySessions() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Get all monthly sessions
    console.log('\n📊 Checking all monthly sessions in database...\n');
    
    const sessions = await MonthlySession.findAll({
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'userId', 'specialization'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'familyMember',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log(`Total sessions found: ${sessions.length}\n`);

    if (sessions.length === 0) {
      console.log('❌ No monthly sessions found in database!');
      console.log('\n📝 This could mean:');
      console.log('   1. No sessions have been created yet');
      console.log('   2. Sessions were created but with wrong doctorId');
      console.log('   3. Database connection issue');
    } else {
      sessions.forEach((session, index) => {
        console.log(`\n${index + 1}. Session ID: ${session.id}`);
        console.log(`   Elder: ${session.elder?.firstName} ${session.elder?.lastName} (ID: ${session.elderId})`);
        console.log(`   Doctor: ${session.doctor?.user?.firstName} ${session.doctor?.user?.lastName} (Doctor ID: ${session.doctorId})`);
        console.log(`   Doctor User ID: ${session.doctor?.userId}`);
        console.log(`   Family Member: ${session.familyMember?.firstName} ${session.familyMember?.lastName}`);
        console.log(`   Session Date: ${session.sessionDate}`);
        console.log(`   Session Time: ${session.sessionTime}`);
        console.log(`   Status: ${session.status}`);
        console.log(`   Created: ${session.createdAt}`);
      });
    }

    // Check all doctors
    console.log('\n\n👨‍⚕️ Checking all doctors in database...\n');
    const doctors = await Doctor.findAll({
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }
      ]
    });

    console.log(`Total doctors found: ${doctors.length}\n`);
    doctors.forEach((doctor, index) => {
      console.log(`${index + 1}. ${doctor.user?.firstName} ${doctor.user?.lastName}`);
      console.log(`   Doctor ID: ${doctor.id}`);
      console.log(`   User ID: ${doctor.userId}`);
      console.log(`   Email: ${doctor.user?.email}`);
      console.log(`   Specialization: ${doctor.specialization || 'N/A'}`);
      console.log('');
    });

    // Check for Dr. Michael Johnson specifically (by email)
    console.log('\n🔍 Searching for Dr. Michael Johnson (by email)...\n');
    const michaelJohnson = await User.findOne({
      where: {
        email: 'dr.johnson@elderlink.com',
        role: 'doctor'
      },
      include: [
        {
          model: Doctor,
          as: 'doctorProfile',
          required: false
        }
      ]
    });

    if (michaelJohnson) {
      console.log('✅ Found Dr. Michael Johnson:');
      console.log(`   User ID: ${michaelJohnson.id}`);
      console.log(`   Name: ${michaelJohnson.firstName} ${michaelJohnson.lastName}`);
      console.log(`   Email: ${michaelJohnson.email}`);
      console.log(`   Doctor Profile ID: ${michaelJohnson.doctorProfile?.id || 'NO DOCTOR PROFILE!'}`);
      
      if (michaelJohnson.doctorProfile) {
        // Check sessions for this doctor
        const doctorSessions = await MonthlySession.findAll({
          where: { doctorId: michaelJohnson.doctorProfile.id },
          include: [
            {
              model: Elder,
              as: 'elder',
              attributes: ['firstName', 'lastName']
            }
          ]
        });
        console.log(`   \n   📅 Monthly Sessions for Dr. Johnson: ${doctorSessions.length}`);
        if (doctorSessions.length > 0) {
          doctorSessions.forEach((s, i) => {
            console.log(`      ${i + 1}. ${s.elder?.firstName} ${s.elder?.lastName} - ${s.sessionDate} ${s.sessionTime} (${s.status})`);
          });
        }
      }
    } else {
      console.log('❌ Dr. Michael Johnson not found in database!');
    }

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkMonthlySessions();
