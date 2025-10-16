// Test script to debug time slots not showing
// Run this: node backend/scripts/test-availability-flow.js

const { Doctor, DoctorSchedule, User, Appointment } = require('../models');

async function testAvailabilityFlow() {
  try {
    console.log('🔍 Testing Availability Flow...\n');

    // 1. Get a doctor
    const doctor = await Doctor.findOne({
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }]
    });

    if (!doctor) {
      console.log('❌ No doctor found in database');
      return;
    }

    console.log('✅ Found Doctor:');
    console.log(`   ID: ${doctor.id}`);
    console.log(`   Name: Dr. ${doctor.user.firstName} ${doctor.user.lastName}`);
    console.log(`   Specialization: ${doctor.specialization}\n`);

    // 2. Check doctor schedules
    const schedules = await DoctorSchedule.findAll({
      where: { doctorId: doctor.id },
      limit: 10,
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });

    console.log(`📅 Found ${schedules.length} schedule(s) for this doctor\n`);

    if (schedules.length === 0) {
      console.log('❌ No schedules found! Doctor needs to add schedules first.');
      console.log('   Action: Login as doctor and use DoctorScheduleManager to add schedules');
      return;
    }

    // Show first few schedules
    console.log('Sample schedules:');
    schedules.slice(0, 5).forEach(s => {
      console.log(`   ${s.date} ${s.startTime} - ${s.endTime} (${s.slotDuration}min slots)`);
    });
    console.log('');

    // 3. Test getDoctorAvailableDates logic
    console.log('🗓️  Testing available dates (next 30 days)...\n');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const availableDates = [];
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() + i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const count = await DoctorSchedule.count({
        where: {
          doctorId: doctor.id,
          date: dateStr,
          isAvailable: true
        }
      });
      
      if (count > 0) {
        availableDates.push(dateStr);
      }
    }

    console.log(`✅ Found ${availableDates.length} available dates in next 30 days`);
    console.log('   Dates:', availableDates.slice(0, 10).join(', '));
    console.log('');

    if (availableDates.length === 0) {
      console.log('❌ No future dates available!');
      console.log('   Action: Doctor needs to add schedules for future dates');
      return;
    }

    // 4. Test getDoctorAvailability for first available date
    const testDate = availableDates.find(d => new Date(d) >= today) || availableDates[0];
    console.log(`⏰ Testing time slots for ${testDate}...\n`);

    const dateSchedules = await DoctorSchedule.findAll({
      where: {
        doctorId: doctor.id,
        date: testDate,
        isAvailable: true
      }
    });

    console.log(`   Found ${dateSchedules.length} schedule(s) for this date:`);
    dateSchedules.forEach(s => {
      console.log(`      ${s.startTime} - ${s.endTime} (${s.slotDuration}min slots)`);
    });
    console.log('');

    // 5. Generate slots
    const { Op } = require('sequelize');
    const startOfDay = new Date(testDate + 'T00:00:00');
    const endOfDay = new Date(testDate + 'T23:59:59');

    const existingAppointments = await Appointment.findAll({
      where: {
        doctorId: doctor.id,
        appointmentDate: {
          [Op.between]: [startOfDay, endOfDay]
        },
        status: {
          [Op.in]: ['pending', 'approved', 'reserved']
        }
      }
    });

    console.log(`   Existing appointments: ${existingAppointments.length}`);
    console.log('');

    // Generate slots
    let allSlots = [];
    for (const schedule of dateSchedules) {
      const slots = generateSlots(schedule, existingAppointments, new Date(testDate));
      allSlots = allSlots.concat(slots);
    }

    allSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

    console.log(`✅ Generated ${allSlots.length} time slots:`);
    allSlots.forEach(slot => {
      console.log(`      ${slot.startTime} - ${slot.endTime} [${slot.status}]`);
    });
    console.log('');

    // Summary
    console.log('📊 SUMMARY:');
    console.log(`   Doctor ID: ${doctor.id}`);
    console.log(`   Total schedules: ${schedules.length}`);
    console.log(`   Available dates (next 30 days): ${availableDates.length}`);
    console.log(`   Time slots for ${testDate}: ${allSlots.length}`);
    console.log('');

    if (allSlots.length > 0) {
      console.log('✅ Everything working! Time slots should appear in frontend.');
      console.log('');
      console.log('🔗 Test in frontend:');
      console.log(`   1. Login as family member`);
      console.log(`   2. Go to Book Appointment`);
      console.log(`   3. Select doctor: Dr. ${doctor.user.firstName} ${doctor.user.lastName}`);
      console.log(`   4. Click date: ${testDate}`);
      console.log(`   5. Should see ${allSlots.length} time slot(s)`);
    } else {
      console.log('⚠️  No time slots generated!');
      console.log('   Possible reasons:');
      console.log('   - All slots are in the past');
      console.log('   - All slots are booked');
      console.log('   - Schedule time range is invalid');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

function generateSlots(schedule, existingAppointments, date) {
  const dateStr = date.toISOString().split('T')[0];
  const startTime = new Date(`${dateStr}T${schedule.startTime}`);
  const endTime = new Date(`${dateStr}T${schedule.endTime}`);
  const slotDuration = schedule.slotDuration || 30;

  const slots = [];
  let currentSlot = new Date(startTime);
  const now = new Date();

  while (currentSlot < endTime) {
    const slotEnd = new Date(currentSlot.getTime() + (slotDuration * 60000));
    
    if (currentSlot > now) {
      const conflictingAppointment = existingAppointments.find(appointment => {
        const appointmentStart = new Date(appointment.appointmentDate);
        const appointmentEnd = new Date(appointmentStart.getTime() + ((appointment.duration || 30) * 60000));
        return (currentSlot < appointmentEnd && slotEnd > appointmentStart);
      });

      let status = 'available';
      
      if (conflictingAppointment) {
        if (conflictingAppointment.status === 'reserved') {
          const reservedAt = new Date(conflictingAppointment.reservedAt);
          const expiresAt = new Date(reservedAt.getTime() + (10 * 60000));
          if (new Date() < expiresAt) {
            status = 'reserved';
          }
        } else {
          status = 'booked';
        }
      }
      
      slots.push({
        startTime: currentSlot.toTimeString().slice(0, 5),
        endTime: slotEnd.toTimeString().slice(0, 5),
        status
      });
    }

    currentSlot = new Date(currentSlot.getTime() + (slotDuration * 60000));
  }

  return slots;
}

testAvailabilityFlow();
