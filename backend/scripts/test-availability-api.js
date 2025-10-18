// backend/scripts/test-availability-api.js
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

async function testAvailabilityAPIs() {
  try {
    console.log('\n🧪 Testing Doctor Availability APIs\n');

    // 1. Get available doctors
    console.log('1️⃣ Testing GET /appointments/doctors');
    const doctorsResponse = await axios.get(`${API_BASE}/appointments/doctors`);
    console.log(`✅ Found ${doctorsResponse.data.doctors.length} doctors`);
    
    if (doctorsResponse.data.doctors.length === 0) {
      console.log('❌ No doctors found!');
      return;
    }

    const doctor = doctorsResponse.data.doctors[0];
    console.log(`📋 Testing with Doctor ID: ${doctor.id}`);

    // 2. Get available dates for doctor
    console.log('\n2️⃣ Testing GET /appointments/doctor/:doctorId/available-dates');
    const datesResponse = await axios.get(`${API_BASE}/appointments/doctor/${doctor.id}/available-dates`);
    console.log(`✅ Available dates:`, datesResponse.data.dates);

    if (datesResponse.data.dates.length === 0) {
      console.log('❌ No available dates found!');
      return;
    }

    const testDate = datesResponse.data.dates[0];
    console.log(`📅 Testing with date: ${testDate}`);

    // 3. Get time slots for specific date
    console.log('\n3️⃣ Testing GET /appointments/doctor/:doctorId/availability?date=:date');
    const slotsResponse = await axios.get(`${API_BASE}/appointments/doctor/${doctor.id}/availability`, {
      params: { date: testDate }
    });
    console.log(`✅ Available slots:`, slotsResponse.data.availableSlots);

    if (slotsResponse.data.availableSlots && slotsResponse.data.availableSlots.length > 0) {
      console.log(`\n✅ SUCCESS! Found ${slotsResponse.data.availableSlots.length} time slots`);
      console.log('Sample slots:', slotsResponse.data.availableSlots.slice(0, 5));
    } else {
      console.log('\n❌ No time slots generated!');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.response?.data || error.message);
  }
}

testAvailabilityAPIs();
