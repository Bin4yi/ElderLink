// Script to create a test monthly session for Dr. Michael Johnson
const { MonthlySession, Elder, Doctor, User } = require('../models');
const sequelize = require('../config/database');

async function createTestSession() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Find Dr. Michael Johnson
    const drJohnson = await Doctor.findOne({
      where: { id: 'e1c1d208-4940-473b-a0a8-970984ed63d3' },
      include: [
        {
          model: User,
          as: 'user'
        }
      ]
    });

    if (!drJohnson) {
      console.log('❌ Dr. Johnson not found!');
      process.exit(1);
    }

    console.log(`✅ Found ${drJohnson.user.firstName} ${drJohnson.user.lastName}`);
    console.log(`   Doctor ID: ${drJohnson.id}`);
    console.log(`   User ID: ${drJohnson.userId}\n`);

    // Find an elder (any elder)
    const elder = await Elder.findOne();
    if (!elder) {
      console.log('❌ No elders found in database!');
      process.exit(1);
    }

    console.log(`✅ Found Elder: ${elder.firstName} ${elder.lastName}`);
    console.log(`   Elder ID: ${elder.id}\n`);

    // Find a family member
    const familyMember = await User.findOne({
      where: { role: 'family_member' }
    });

    if (!familyMember) {
      console.log('❌ No family members found!');
      process.exit(1);
    }

    console.log(`✅ Found Family Member: ${familyMember.firstName} ${familyMember.lastName}`);
    console.log(`   Family Member ID: ${familyMember.id}\n`);

    // Create session for today
    const today = new Date();
    const sessionDate = today.toISOString().split('T')[0];
    const sessionTime = '10:00:00';

    console.log(`📝 Creating monthly session...`);
    console.log(`   Elder: ${elder.firstName} ${elder.lastName}`);
    console.log(`   Doctor: ${drJohnson.user.firstName} ${drJohnson.user.lastName}`);
    console.log(`   Date: ${sessionDate}`);
    console.log(`   Time: ${sessionTime}\n`);

    const session = await MonthlySession.create({
      elderId: elder.id,
      familyMemberId: familyMember.id,
      doctorId: drJohnson.id, // Doctor table ID
      scheduleId: null,
      sessionDate: sessionDate,
      sessionTime: sessionTime,
      duration: 45,
      status: 'scheduled',
      sessionType: 'initial',
      isAutoScheduled: false,
      notes: `Monthly health check-up scheduled for ${today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
    });

    console.log('✅ Monthly session created successfully!');
    console.log(`   Session ID: ${session.id}`);
    console.log(`   Status: ${session.status}`);
    console.log(`   Created: ${session.createdAt}\n`);

    // Verify by fetching
    const verifySession = await MonthlySession.findByPk(session.id, {
      include: [
        {
          model: Elder,
          as: 'elder'
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [
            {
              model: User,
              as: 'user'
            }
          ]
        }
      ]
    });

    console.log('🔍 Verification:');
    console.log(`   Elder: ${verifySession.elder.firstName} ${verifySession.elder.lastName}`);
    console.log(`   Doctor: ${verifySession.doctor.user.firstName} ${verifySession.doctor.user.lastName}`);
    console.log(`   Date: ${verifySession.sessionDate}`);
    console.log(`   Time: ${verifySession.sessionTime}`);
    console.log(`   Status: ${verifySession.status}\n`);

    console.log('✅ All done! Now refresh the doctor page to see the session.');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestSession();
