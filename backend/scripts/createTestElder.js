const { User, Elder, Subscription } = require('../models');

async function createTestElder() {
  try {
    console.log('🧪 Creating test elder for emergency testing...\n');

    // Create a family member user first
    console.log('1️⃣ Creating family member...');
    const familyMember = await User.create({
      firstName: 'Test',
      lastName: 'Family',
      email: 'test.family@elderlink.com',
      password: 'Test@123',
      phone: '+94771111111',
      role: 'family_member',
      isActive: true
    });
    console.log(`✅ Family member created: ${familyMember.email}`);

    // Create subscription
    console.log('\n2️⃣ Creating subscription...');
    const subscription = await Subscription.create({
      userId: familyMember.id,
      plan: 'premium',
      amount: 99.99,
      duration: 'yearly',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      autoRenewal: true
    });
    console.log(`✅ Subscription created: ID ${subscription.id}`);

    // Create elder user
    console.log('\n3️⃣ Creating elder user...');
    const elderUser = await User.create({
      firstName: 'Test',
      lastName: 'Elder',
      email: 'test.elder@elderlink.com',
      password: 'Elder@123',
      phone: '+94772222222',
      role: 'elder',
      isActive: true
    });
    console.log(`✅ Elder user created: ${elderUser.email}`);

    // Create elder profile
    console.log('\n4️⃣ Creating elder profile...');
    const elder = await Elder.create({
      userId: elderUser.id,
      subscriptionId: subscription.id,
      dateOfBirth: new Date('1950-01-01'),
      address: 'Test Address, Colombo',
      emergencyContact: '+94773333333',
      medicalHistory: {
        conditions: ['Hypertension', 'Diabetes'],
        allergies: ['Penicillin'],
        medications: ['Metformin', 'Lisinopril']
      },
      bloodType: 'O+',
      height: 170,
      weight: 70
    });
    console.log(`✅ Elder profile created: ID ${elder.id}`);

    console.log('\n✅ Test elder setup complete!');
    console.log('\n📋 Use this data for testing:');
    console.log('─────────────────────────────────────');
    console.log('Family Member Login:');
    console.log(`  Email: test.family@elderlink.com`);
    console.log(`  Password: Test@123`);
    console.log('');
    console.log('Elder Login (for mobile app):');
    console.log(`  Email: test.elder@elderlink.com`);
    console.log(`  Password: Elder@123`);
    console.log('');
    console.log('Elder Details:');
    console.log(`  Elder ID: ${elder.id}`);
    console.log(`  Elder User ID: ${elderUser.id}`);
    console.log(`  Subscription ID: ${subscription.id}`);
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('\n⚠️ Test user already exists. You can use existing credentials.');
    }
    process.exit(1);
  }
}

createTestElder();
