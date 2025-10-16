const axios = require('axios');

async function testEmergencyFlow() {
  try {
    console.log('🧪 Testing Emergency to Coordinator Flow\n');

    // Step 1: Login as coordinator
    console.log('1️⃣ Logging in as coordinator...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'coordinator@elderlink.com',
      password: 'Coord@123'
    });
    
    const coordinatorToken = loginResponse.data.token;
    console.log('✅ Coordinator logged in');
    console.log('   Token:', coordinatorToken.substring(0, 30) + '...\n');

    // Step 2: Get a test elder (you need to have an elder in the system)
    console.log('2️⃣ Simulating emergency alert...');
    
    const emergencyData = {
      elderId: 'test-elder-id', // Replace with actual elder ID
      elderName: 'Test Elder',
      elderPhone: '+94771234567',
      location: {
        latitude: 6.9271,
        longitude: 79.8612,
        address: 'Colombo, Sri Lanka',
        available: true
      },
      timestamp: new Date().toISOString(),
      alertType: 'SOS',
      vitals: {
        heartRate: 95,
        bloodPressure: '120/80',
        oxygenLevel: 98
      }
    };

    console.log('   Emergency Data:', JSON.stringify(emergencyData, null, 2));

    // Step 3: Trigger emergency
    console.log('\n3️⃣ Triggering emergency alert...');
    const emergencyResponse = await axios.post(
      'http://localhost:5000/api/emergency/trigger',
      emergencyData,
      {
        headers: {
          'Authorization': `Bearer ${coordinatorToken}`
        }
      }
    );

    console.log('✅ Emergency alert sent!');
    console.log('   Response:', emergencyResponse.data);

    // Step 4: Check coordinator dashboard
    console.log('\n4️⃣ Checking coordinator dashboard...');
    const dashboardResponse = await axios.get(
      'http://localhost:5000/api/coordinator/dashboard',
      {
        headers: {
          'Authorization': `Bearer ${coordinatorToken}`
        }
      }
    );

    console.log('✅ Dashboard data retrieved!');
    console.log('   Active Emergencies:', dashboardResponse.data.data.activeEmergencies);
    console.log('   Pending Emergencies:', dashboardResponse.data.data.pendingEmergencies);

    // Step 5: Get emergency queue
    console.log('\n5️⃣ Checking emergency queue...');
    const queueResponse = await axios.get(
      'http://localhost:5000/api/coordinator/queue',
      {
        headers: {
          'Authorization': `Bearer ${coordinatorToken}`
        }
      }
    );

    console.log('✅ Emergency queue retrieved!');
    console.log('   Queue length:', queueResponse.data.data.length);
    if (queueResponse.data.data.length > 0) {
      console.log('   Latest emergency:', queueResponse.data.data[0]);
    }

    console.log('\n✅ All tests passed! Emergency flow is working.');

  } catch (error) {
    console.error('\n❌ Test failed!');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Message:', error.response.data.message || error.response.data);
      console.error('   Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('   Error:', error.message);
    }
    process.exit(1);
  }
}

testEmergencyFlow();
