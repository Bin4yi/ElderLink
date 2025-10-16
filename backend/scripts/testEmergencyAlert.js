const axios = require('axios');

const testEmergencyAlert = async () => {
  try {
    console.log('🧪 Testing emergency alert system...\n');

    const testPayload = {
      elderId: '9424f358-7df4-4ffc-b361-c4f419388082',
      elderName: 'Test Elder',
      elderPhone: '1234567890',
      location: {
        available: true,
        latitude: 40.7128,
        longitude: -74.0060,
        address: {
          formattedAddress: '123 Main St, New York, NY 10001'
        }
      },
      timestamp: new Date().toISOString(),
      alertType: 'SOS'
    };

    console.log('📤 Sending test emergency alert...');
    console.log('Payload:', JSON.stringify(testPayload, null, 2));

    const response = await axios.post(
      'http://localhost:5000/api/webhook/emergency',
      testPayload,
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('\n✅ Test successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));

  } catch (error) {
    console.error('\n❌ Test failed:');
    
    if (error.response) {
      // Server responded with error
      console.error('Status:', error.response.status);
      console.error('Status Text:', error.response.statusText);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // Request made but no response
      console.error('No response received');
      console.error('Request:', error.request);
    } else {
      // Error setting up request
      console.error('Error:', error.message);
    }
    
    console.error('\nFull error:', error);
  }
};

testEmergencyAlert();