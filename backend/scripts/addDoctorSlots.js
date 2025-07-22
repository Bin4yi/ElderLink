const { v4: uuidv4 } = require('uuid');
const DoctorSchedule = require('../models/DoctorSchedule');
const Doctor = require('../models/Doctor');
const sequelize = require('../config/database');

async function addTimeSlots() {
  try {
    // Find the doctorId for the given userId
    const doctor = await Doctor.findOne({ where: { userId: '51d4f86f-7d2b-448d-b151-aaf54b485b62' } });
    if (!doctor) {
      console.error('Doctor not found for userId');
      return;
    }
    const doctorId = doctor.id;

    // Define 10 time slots
    const slots = [
      { start: '09:00', end: '09:30' },
      { start: '09:30', end: '10:00' },
      { start: '10:00', end: '10:30' },
      { start: '10:30', end: '11:00' },
      { start: '11:00', end: '11:30' },
      { start: '11:30', end: '12:00' },
      { start: '14:00', end: '14:30' },
      { start: '14:30', end: '15:00' },
      { start: '15:00', end: '15:30' },
      { start: '15:30', end: '16:00' }
    ];

    // Dates: today and tomorrow
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const dates = [
      today.toISOString().slice(0, 10),
      tomorrow.toISOString().slice(0, 10)
    ];

    await sequelize.sync();

    for (const date of dates) {
      for (const slot of slots) {
        await DoctorSchedule.create({
          id: uuidv4(),
          doctorId,
          date,
          startTime: slot.start,
          endTime: slot.end,
          isAvailable: true
        });
      }
    }

    console.log('✅ 10 time slots added for today and tomorrow for doctor:', doctorId);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

addTimeSlots();