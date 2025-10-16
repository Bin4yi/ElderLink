const { EmergencyAlert, Elder, User, Subscription } = require('../models');
const io = require('socket.io-client');

async function diagnoseSOS() {
  console.log('🔍 COMPREHENSIVE SOS DIAGNOSTIC\n');
  console.log('=' .repeat(60));

  // Step 1: Check if there are any elders in the database
  console.log('\n1️⃣ Checking Elders in Database...');
  const elders = await Elder.findAll({
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email', 'role']
      },
      {
        model: Subscription,
        as: 'subscription'
      }
    ],
    limit: 5
  });

  if (elders.length === 0) {
    console.log('❌ NO ELDERS FOUND IN DATABASE!');
    console.log('   You need to create an elder first.');
    console.log('   Run: node scripts/createTestElder.js');
    return;
  }

  console.log(`✅ Found ${elders.length} elder(s):`);
  elders.forEach((elder, idx) => {
    console.log(`   ${idx + 1}. ${elder.user?.firstName} ${elder.user?.lastName}`);
    console.log(`      Elder ID: ${elder.id}`);
    console.log(`      User ID: ${elder.userId}`);
    console.log(`      Email: ${elder.user?.email}`);
    console.log(`      Has Subscription: ${elder.subscriptionId ? 'Yes' : 'No'}`);
  });

  // Find an elder with a valid user
  const testElder = elders.find(e => e.userId && e.user);
  if (!testElder) {
    console.log('\n❌ No valid elders found with user association!');
    console.log('   All elders must have a userId and user relation.');
    process.exit(1);
  }
  console.log(`\n   Using elder: ${testElder.user.firstName} ${testElder.user.lastName}`);

  // Step 2: Check Emergency Alerts
  console.log('\n2️⃣ Checking Existing Emergency Alerts...');
  const existingAlerts = await EmergencyAlert.findAll({
    limit: 5,
    order: [['createdAt', 'DESC']],
    include: [
      {
        model: Elder,
        as: 'elder',
        include: [{
          model: User,
          as: 'user',
          attributes: ['firstName', 'lastName']
        }]
      }
    ]
  });

  if (existingAlerts.length === 0) {
    console.log('⚠️ No emergency alerts found in database');
  } else {
    console.log(`✅ Found ${existingAlerts.length} recent alert(s):`);
    existingAlerts.forEach((alert, idx) => {
      console.log(`   ${idx + 1}. ${alert.alertType} - ${alert.status} - ${alert.priority}`);
      console.log(`      Elder: ${alert.elder?.user?.firstName} ${alert.elder?.user?.lastName}`);
      console.log(`      Created: ${alert.createdAt}`);
    });
  }

  // Step 3: Test WebSocket Connection
  console.log('\n3️⃣ Testing WebSocket Connection...');
  const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket.id);
    
    // Join coordinator room
    socket.emit('join_coordinator_room');
    console.log('✅ Joined coordinator room');
    
    // Listen for emergency alerts
    socket.on('emergency_alert', (data) => {
      console.log('\n🚨 EMERGENCY ALERT RECEIVED!');
      console.log('   Data:', JSON.stringify(data, null, 2));
    });

    console.log('✅ Listening for emergency alerts...');
  });

  socket.on('connect_error', (error) => {
    console.log('❌ Socket connection error:', error.message);
    console.log('   Make sure the backend server is running!');
  });

  socket.on('disconnect', () => {
    console.log('❌ Socket disconnected');
  });

  // Step 4: Create a test emergency
  console.log('\n4️⃣ Creating Test Emergency Alert...');
  
  try {
    const testEmergency = await EmergencyAlert.create({
      elderId: testElder.id,
      userId: testElder.userId,
      alertType: 'sos',
      priority: 'critical',
      status: 'pending',
      location: {
        latitude: 6.9271,
        longitude: 79.8612,
        address: 'Test Location, Colombo, Sri Lanka'
      },
      medicalInfo: {
        conditions: ['Test Condition'],
        allergies: [],
        medications: []
      },
      vitals: {
        heartRate: 95,
        bloodPressure: '120/80',
        oxygenLevel: 98
      }
    });

    console.log('✅ Test emergency created!');
    console.log(`   ID: ${testEmergency.id}`);
    console.log(`   Status: ${testEmergency.status}`);
    console.log(`   Priority: ${testEmergency.priority}`);

    // Step 5: Broadcast via WebSocket (simulate)
    console.log('\n5️⃣ Simulating WebSocket Broadcast...');
    const emergencyWebSocketService = require('../services/emergencyWebSocketService');
    
    // Get io instance from server (this won't work in standalone script)
    console.log('⚠️ Cannot test WebSocket broadcast from script');
    console.log('   WebSocket broadcast requires the server to be running');
    console.log('   The broadcast happens in emergencyController.js');

  } catch (error) {
    console.log('❌ Error creating test emergency:', error.message);
  }

  // Step 6: Query coordinator dashboard
  console.log('\n6️⃣ Testing Coordinator Dashboard Endpoints...');
  console.log('   Run these curl commands to test:');
  console.log('');
  console.log('   # Login as coordinator');
  console.log('   curl -X POST http://localhost:5000/api/auth/login \\');
  console.log('     -H "Content-Type: application/json" \\');
  console.log('     -d \'{"email":"coordinator@elderlink.com","password":"Coord@123"}\'');
  console.log('');
  console.log('   # Get dashboard (use token from login)');
  console.log('   curl http://localhost:5000/api/coordinator/dashboard \\');
  console.log('     -H "Authorization: Bearer YOUR_TOKEN"');
  console.log('');
  console.log('   # Get emergency queue');
  console.log('   curl http://localhost:5000/api/coordinator/queue \\');
  console.log('     -H "Authorization: Bearer YOUR_TOKEN"');

  // Step 7: Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 DIAGNOSTIC SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Elders in database: ${elders.length}`);
  console.log(`${existingAlerts.length > 0 ? '✅' : '⚠️'} Emergency alerts: ${existingAlerts.length}`);
  console.log(`⏳ WebSocket: Check console for connection status`);
  console.log('');
  console.log('📝 NEXT STEPS:');
  console.log('1. Make sure backend server is running: npm start');
  console.log('2. Make sure frontend is running: cd frontend && npm start');
  console.log('3. Login as coordinator: coordinator@elderlink.com / Coord@123');
  console.log('4. Open browser dev tools and check Socket.io connection');
  console.log('5. Trigger SOS from mobile app');
  console.log('6. Watch backend logs for "🚑 Creating Emergency Alert..."');
  console.log('7. Check coordinator dashboard for new emergency');
  console.log('');

  // Keep socket alive for 10 seconds to receive any messages
  console.log('⏳ Keeping socket alive for 10 seconds...');
  setTimeout(() => {
    socket.disconnect();
    console.log('\n✅ Diagnostic complete!');
    process.exit(0);
  }, 10000);
}

diagnoseSOS().catch(error => {
  console.error('\n❌ Diagnostic failed:', error);
  process.exit(1);
});
