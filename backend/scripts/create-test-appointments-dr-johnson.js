// Script to create test appointments for Dr. Michael Johnson
const { Appointment, Elder, Doctor, User } = require('../models');
const sequelize = require('../config/database');

async function createTestAppointments() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected successfully\n');

    // Find Dr. Michael Johnson
    const drJohnson = await Doctor.findOne({
      where: { id: 'e1c1d208-4940-473b-a0a8-970984ed63d3' },
      include: [{ model: User, as: 'user' }]
    });

    if (!drJohnson) {
      console.log('❌ Dr. Johnson not found!');
      process.exit(1);
    }

    console.log(`✅ Found ${drJohnson.user.firstName} ${drJohnson.user.lastName}\n`);

    // Find elders
    const elders = await Elder.findAll({ limit: 3 });
    if (elders.length === 0) {
      console.log('❌ No elders found!');
      process.exit(1);
    }

    console.log(`✅ Found ${elders.length} elders\n`);

    // Create appointments for current month and next 2 months
    const today = new Date();
    const appointments = [];

    // Current month appointments
    appointments.push({
      elder: elders[0],
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2),
      time: '09:00:00',
      reason: 'Regular check-up'
    });

    appointments.push({
      elder: elders[1] || elders[0],
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
      time: '14:00:00',
      reason: 'Follow-up consultation'
    });

    // Next month appointments
    appointments.push({
      elder: elders[2] || elders[0],
      date: new Date(today.getFullYear(), today.getMonth() + 1, 15),
      time: '10:30:00',
      reason: 'Health monitoring'
    });

    // Month after next
    appointments.push({
      elder: elders[0],
      date: new Date(today.getFullYear(), today.getMonth() + 2, 10),
      time: '11:00:00',
      reason: 'Medication review'
    });

    console.log('📝 Creating appointments...\n');

    for (const apt of appointments) {
      // Get family member for this elder's subscription
      const familyMember = await User.findOne({
        where: { role: 'family_member' }
      });

      const created = await Appointment.create({
        elderId: apt.elder.id,
        familyMemberId: familyMember.id,
        doctorId: drJohnson.id,
        appointmentDate: apt.date.toISOString().split('T')[0],
        appointmentTime: apt.time,
        reason: apt.reason,
        symptoms: 'General wellness check',
        status: 'approved',
        type: 'consultation',
        priority: 'medium',
        duration: 30
      });

      console.log(`✅ Created appointment for ${apt.elder.firstName} ${apt.elder.lastName}`);
      console.log(`   Date: ${created.appointmentDate}`);
      console.log(`   Time: ${created.appointmentTime}`);
      console.log(`   Reason: ${created.reason}`);
      console.log(`   Status: ${created.status}\n`);
    }

    // Verify total appointments for Dr. Johnson
    const totalAppointments = await Appointment.count({
      where: { 
        doctorId: drJohnson.id,
        status: 'approved'
      }
    });

    console.log(`\n✅ Total approved appointments for Dr. Johnson: ${totalAppointments}`);
    console.log('✅ All done! Now refresh the doctor page to see the appointments.');

    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestAppointments();
