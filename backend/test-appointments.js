require('dotenv').config();
const { Elder, Appointment, Doctor, User } = require('./models');

async function testQuery() {
  try {
    const userId = '8b4f18ef-da09-43c4-8c57-a6d9af12b5a9';
    console.log('🔍 Testing getAppointments logic for userId:', userId);
    
    // Step 1: Find elder
    const elder = await Elder.findOne({ where: { userId } });
    console.log('\n✅ Found elder:', elder ? `ID=${elder.id}` : 'NULL');
    
    if (!elder) {
      console.log('❌ No elder found - this is why appointments are empty!');
      process.exit(1);
      return;
    }
    
    // Step 2: Build where clause
    const whereClause = { elderId: elder.id };
    console.log('\n📋 Where clause:', whereClause);
    
    // Step 3: Query appointments
    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'phone', 'photo']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['firstName', 'lastName']
            }
          ]
        }
      ],
      order: [['appointmentDate', 'DESC']],
      limit: 10,
      offset: 0
    });
    
    console.log(`\n✅ Query result: ${appointments.count} appointment(s) found`);
    console.log('\nAppointments:');
    appointments.rows.forEach(apt => {
      const doctorName = apt.doctor?.user ? `Dr. ${apt.doctor.user.firstName} ${apt.doctor.user.lastName}` : 'Unknown';
      console.log(`  - ${apt.appointmentDate} with ${doctorName} (Status: ${apt.status})`);
    });
    
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testQuery();
