const axios = require('axios');
const { Elder, User, EmergencyAlert } = require('../models');

async function testMobileSOSTrigger() {
  console.log('\n🔍 TESTING MOBILE SOS TRIGGER\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Get an elder from the database
    console.log('\n1️⃣ Finding valid elder...');
    const { Op } = require('sequelize');
    const elder = await Elder.findOne({
      where: { 
        userId: { 
          [Op.ne]: null 
        } 
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
      }]
    });

    if (!elder) {
      console.log('❌ No valid elder found!');
      return;
    }

    console.log('✅ Found elder:');
    console.log('   Elder ID:', elder.id);
    console.log('   User ID:', elder.userId);
    console.log('   Name:', `${elder.user.firstName} ${elder.user.lastName}`);
    console.log('   Email:', elder.user.email);

    // Step 2: Check emergency alerts before
    console.log('\n2️⃣ Checking existing emergency alerts...');
    const alertsBefore = await EmergencyAlert.count();
    console.log(`   Alerts before: ${alertsBefore}`);

    // Step 3: Simulate mobile app SOS trigger
    console.log('\n3️⃣ Simulating Mobile App SOS Trigger...');
    
    // This is the EXACT structure the mobile app sends
    const mobilePayload = {
      elderId: elder.id,
      elderName: `${elder.user.firstName} ${elder.user.lastName}`,
      elderPhone: elder.user.phone || '',
      timestamp: new Date().toISOString(),
      location: {
        available: true,
        latitude: 6.9271,
        longitude: 79.8612,
        address: 'Colombo, Sri Lanka',
        accuracy: 10
      },
      emergencyContacts: [],
      assignedStaff: [],
      additionalInfo: {
        deviceInfo: {
          platform: 'mobile',
          appVersion: '1.0.0'
        }
      }
    };

    console.log('📦 Mobile Payload:');
    console.log(JSON.stringify(mobilePayload, null, 2));

    // Step 4: Send POST request to backend
    console.log('\n4️⃣ Sending POST request to /api/emergency/trigger...');
    
    try {
      const response = await axios.post('http://localhost:5000/api/emergency/trigger', mobilePayload, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      console.log('✅ Response received:');
      console.log('   Status:', response.status);
      console.log('   Data:', JSON.stringify(response.data, null, 2));

    } catch (axiosError) {
      if (axiosError.code === 'ECONNREFUSED') {
        console.log('❌ ERROR: Backend server is not running!');
        console.log('   Please start the backend: cd backend && npm start');
        return;
      }
      
      console.log('❌ Request failed:');
      console.log('   Status:', axiosError.response?.status);
      console.log('   Data:', JSON.stringify(axiosError.response?.data, null, 2));
      
      if (axiosError.response?.status === 404) {
        console.log('\n⚠️  Route not found! Check that /api/emergency/trigger exists');
      }
    }

    // Step 5: Check emergency alerts after
    console.log('\n5️⃣ Checking emergency alerts after trigger...');
    const alertsAfter = await EmergencyAlert.count();
    console.log(`   Alerts after: ${alertsAfter}`);
    console.log(`   New alerts created: ${alertsAfter - alertsBefore}`);

    if (alertsAfter > alertsBefore) {
      console.log('\n✅ SUCCESS! Emergency alert was created!');
      
      const latestAlert = await EmergencyAlert.findOne({
        order: [['createdAt', 'DESC']],
        include: [{
          model: Elder,
          as: 'elder',
          include: [{
            model: User,
            as: 'user'
          }]
        }]
      });

      console.log('\n📋 Latest Alert Details:');
      console.log('   ID:', latestAlert.id);
      console.log('   Type:', latestAlert.alertType);
      console.log('   Status:', latestAlert.status);
      console.log('   Priority:', latestAlert.priority);
      console.log('   Elder:', `${latestAlert.elder.user.firstName} ${latestAlert.elder.user.lastName}`);
      console.log('   Location:', latestAlert.location?.address || 'N/A');
      console.log('   Created:', latestAlert.createdAt);

    } else {
      console.log('\n❌ FAILED! No emergency alert was created!');
      console.log('   Check backend logs for errors');
    }

    // Step 6: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(60));
    console.log('Elder found:', !!elder ? '✅' : '❌');
    console.log('Request sent:', '✅');
    console.log('Alert created:', alertsAfter > alertsBefore ? '✅' : '❌');
    console.log('');
    console.log('💡 TROUBLESHOOTING TIPS:');
    console.log('1. Make sure backend is running: cd backend && npm start');
    console.log('2. Check backend console logs for errors');
    console.log('3. Verify /api/emergency/trigger route exists');
    console.log('4. Check if EmergencyAlert model is imported correctly');
    console.log('5. Verify Socket.io is broadcasting to coordinator room');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    process.exit(0);
  }
}

testMobileSOSTrigger();
