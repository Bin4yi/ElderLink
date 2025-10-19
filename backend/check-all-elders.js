require('dotenv').config();
const { Elder, User, Appointment, Doctor } = require('./models');
const { Op } = require('sequelize');

async function checkAllElders() {
  try {
    console.log('🔍 Checking appointments for ALL elders...\n');
    
    // Find all elders with userId (meaning they can log in)
    const elders = await Elder.findAll({
      where: { 
        userId: { [Op.ne]: null }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'role']
      }]
    });
    
    console.log(`📋 Found ${elders.length} elder(s) with login access:\n`);
    
    for (const elder of elders) {
      console.log(`\n👤 Elder: ${elder.firstName} ${elder.lastName}`);
      console.log(`   Elder ID: ${elder.id}`);
      console.log(`   User ID: ${elder.userId}`);
      if (elder.user) {
        console.log(`   Email: ${elder.user.email}`);
        console.log(`   Role: ${elder.user.role}`);
      }
      
      // Check appointments for this elder
      const appointments = await Appointment.findAll({
        where: { elderId: elder.id },
        include: [{
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName']
          }]
        }]
      });
      
      console.log(`   📅 Appointments: ${appointments.length}`);
      
      if (appointments.length > 0) {
        appointments.forEach(apt => {
          const doctorName = apt.doctor?.user ? `Dr. ${apt.doctor.user.firstName} ${apt.doctor.user.lastName}` : 'Unknown';
          const date = new Date(apt.appointmentDate).toLocaleDateString();
          console.log(`      - ${date} with ${doctorName} (Status: ${apt.status})`);
        });
      } else {
        console.log(`      ℹ️  No appointments found`);
      }
    }
    
    console.log('\n✅ Check completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

checkAllElders();
