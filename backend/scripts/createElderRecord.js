const { sequelize, User, Elder, Subscription } = require('../models');

async function createElderRecord() {
  try {
    console.log('🔍 Starting Elder record creation...\n');

    // Find the user
    const userId = '9f77f8e9-a5c1-4518-ba0b-f04ef70f3888';
    const user = await User.findByPk(userId);

    if (!user) {
      console.error('❌ User not found:', userId);
      return;
    }

    console.log('✅ Found user:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    });

    // Check if Elder record already exists
    const existingElder = await Elder.findOne({
      where: { userId: user.id }
    });

    if (existingElder) {
      console.log('✅ Elder record already exists:', existingElder.id);
      return;
    }

    // Find or create a subscription for this user
    let subscription = await Subscription.findOne({
      where: { userId: user.id, status: 'active' }
    });

    if (!subscription) {
      console.log('📝 Creating subscription for user...');
      subscription = await Subscription.create({
        userId: user.id,
        planType: 'premium',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        paymentStatus: 'paid',
        autoRenew: true
      });
      console.log('✅ Subscription created:', subscription.id);
    } else {
      console.log('✅ Found existing subscription:', subscription.id);
    }

    // Create Elder record
    console.log('📝 Creating Elder record...');
    const elder = await Elder.create({
      userId: user.id,
      subscriptionId: subscription.id,
      firstName: user.firstName || 'Unknown',
      lastName: user.lastName || 'Unknown',
      dateOfBirth: new Date('1950-01-01'), // Default DOB
      gender: 'other',
      phone: user.phone || '0000000000',
      emergencyContact: user.phone || '0000000000',
      address: user.address || 'Not provided',
      medicalHistory: 'None',
      medications: 'None',
      allergies: 'None',
      bloodType: 'Unknown',
      chronicConditions: 'None'
    });

    console.log('\n✅✅✅ SUCCESS! Elder record created ✅✅✅');
    console.log('Elder ID:', elder.id);
    console.log('User ID:', elder.userId);
    console.log('Subscription ID:', elder.subscriptionId);
    console.log('\n🎉 You can now trigger SOS alerts from the mobile app!');

  } catch (error) {
    console.error('❌ Error creating Elder record:', error);
  } finally {
    await sequelize.close();
  }
}

createElderRecord();
