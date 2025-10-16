/**
 * Test if mobile app can connect to backend
 * Run this in Expo: import and call testBackendConnection()
 */

import { API_BASE_URL, API_ENDPOINTS } from '../utils/constants';

export const testBackendConnection = async () => {
  console.log('\n🔍 TESTING BACKEND CONNECTION FROM MOBILE APP');
  console.log('=' .repeat(60));
  
  try {
    // Test 1: Check API Base URL
    console.log('\n1️⃣ API Configuration:');
    console.log('   Base URL:', API_BASE_URL);
    console.log('   Emergency Trigger:', API_ENDPOINTS.EMERGENCY.TRIGGER);

    // Test 2: Simple fetch to health endpoint
    console.log('\n2️⃣ Testing Health Endpoint...');
    try {
      const healthUrl = API_BASE_URL.replace('/api', '/health');
      console.log('   Health URL:', healthUrl);
      
      const healthResponse = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('   Health Status:', healthResponse.status);
      
      if (healthResponse.ok) {
        console.log('   ✅ Backend is reachable!');
      } else {
        console.log('   ❌ Backend responded but not OK');
      }
    } catch (healthError) {
      console.log('   ❌ Health check failed:', healthError.message);
      console.log('   🔍 Error type:', healthError.constructor.name);
      
      if (healthError.message.includes('Network request failed')) {
        console.log('\n   ⚠️  NETWORK ERROR DETECTED!');
        console.log('   Possible causes:');
        console.log('   1. Backend server is not running');
        console.log('   2. IP address has changed (check wifi)');
        console.log('   3. Phone is on different network');
        console.log('   4. Firewall blocking connection');
        console.log('\n   💡 Solutions:');
        console.log('   1. Check your computer IP: ipconfig (Windows) or ifconfig (Mac)');
        console.log('   2. Update API_BASE_URL in constants.js');
        console.log('   3. Make sure phone and computer on same WiFi');
      }
    }

    // Test 3: Test Emergency Endpoint
    console.log('\n3️⃣ Testing Emergency Endpoint...');
    try {
      const testPayload = {
        elderId: 'test-id',
        elderName: 'Test Elder',
        elderPhone: '1234567890',
        timestamp: new Date().toISOString(),
        location: {
          available: true,
          latitude: 6.9271,
          longitude: 79.8612,
          address: 'Test Location',
        },
        emergencyContacts: [],
        assignedStaff: [],
      };

      console.log('   Sending test payload to:', API_ENDPOINTS.EMERGENCY.TRIGGER);
      
      const emergencyResponse = await fetch(API_ENDPOINTS.EMERGENCY.TRIGGER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      console.log('   Response Status:', emergencyResponse.status);
      
      const responseText = await emergencyResponse.text();
      console.log('   Response Text:', responseText.substring(0, 200));

      if (emergencyResponse.ok) {
        console.log('   ✅ Emergency endpoint is working!');
        try {
          const responseData = JSON.parse(responseText);
          console.log('   Response Data:', JSON.stringify(responseData, null, 2));
        } catch (e) {
          console.log('   (Response is not JSON)');
        }
      } else {
        console.log('   ❌ Emergency endpoint error:', emergencyResponse.status);
      }
    } catch (emergencyError) {
      console.log('   ❌ Emergency endpoint failed:', emergencyError.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Connection test complete!');
    console.log('\nIf you see network errors:');
    console.log('1. Run this on your computer to get IP:');
    console.log('   ipconfig (Windows) or ifconfig (Mac/Linux)');
    console.log('2. Look for "IPv4 Address" or "inet" (e.g., 192.168.1.100)');
    console.log('3. Update constants.js:');
    console.log('   export const API_BASE_URL = "http://YOUR_IP:5000/api";');

  } catch (error) {
    console.error('\n❌ Connection test failed:', error);
    console.error('Error:', error.message);
  }
};

export default { testBackendConnection };
