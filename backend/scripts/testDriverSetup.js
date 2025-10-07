/**
 * Test script to check driver and ambulance assignments
 * Run with: node scripts/testDriverSetup.js
 */

const { User, Ambulance, AmbulanceDispatch, EmergencyAlert } = require('../models');

async function testDriverSetup() {
  try {
    console.log('\n🔍 Testing Driver Setup...\n');

    // 1. Check for drivers
    console.log('1️⃣ Checking for ambulance drivers...');
    const drivers = await User.findAll({
      where: {
        role: 'ambulance_driver',
        isActive: true,
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
    });

    console.log(`   ✅ Found ${drivers.length} active drivers:`);
    drivers.forEach((driver, index) => {
      console.log(`      ${index + 1}. ${driver.firstName} ${driver.lastName} (${driver.email})`);
      console.log(`         ID: ${driver.id}`);
    });

    if (drivers.length === 0) {
      console.log('   ❌ No drivers found! Create drivers first.');
      return;
    }

    // 2. Check for ambulances
    console.log('\n2️⃣ Checking for ambulances...');
    const ambulances = await Ambulance.findAll({
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    console.log(`   ✅ Found ${ambulances.length} ambulances:`);
    ambulances.forEach((ambulance, index) => {
      console.log(`      ${index + 1}. ${ambulance.vehicleNumber} (${ambulance.type}) - Status: ${ambulance.status}`);
      if (ambulance.driver) {
        console.log(`         Assigned to: ${ambulance.driver.firstName} ${ambulance.driver.lastName}`);
      } else {
        console.log(`         ⚠️  No driver assigned`);
      }
    });

    if (ambulances.length === 0) {
      console.log('   ❌ No ambulances found! Create ambulances first.');
      return;
    }

    // 3. Check driver-ambulance assignments
    console.log('\n3️⃣ Checking driver-ambulance assignments...');
    let assignedCount = 0;
    for (const driver of drivers) {
      const ambulance = await Ambulance.findOne({
        where: { driverId: driver.id },
      });
      if (ambulance) {
        console.log(`   ✅ ${driver.firstName} ${driver.lastName} → ${ambulance.vehicleNumber}`);
        assignedCount++;
      } else {
        console.log(`   ⚠️  ${driver.firstName} ${driver.lastName} → Not assigned to any ambulance`);
      }
    }
    console.log(`   Total: ${assignedCount}/${drivers.length} drivers assigned`);

    // 4. Check for active dispatches
    console.log('\n4️⃣ Checking for active dispatches...');
    const activeDispatches = await AmbulanceDispatch.findAll({
      where: {
        status: ['dispatched', 'accepted', 'en_route', 'arrived'],
      },
      include: [
        {
          model: Ambulance,
          as: 'ambulance',
          include: [
            {
              model: User,
              as: 'driver',
              attributes: ['firstName', 'lastName', 'email'],
            },
          ],
        },
        {
          model: EmergencyAlert,
          as: 'emergency',
          attributes: ['alertType', 'priority'],
        },
      ],
    });

    console.log(`   ✅ Found ${activeDispatches.length} active dispatches:`);
    if (activeDispatches.length > 0) {
      activeDispatches.forEach((dispatch, index) => {
        console.log(`      ${index + 1}. Dispatch ID: ${dispatch.id}`);
        console.log(`         Status: ${dispatch.status}`);
        console.log(`         Ambulance: ${dispatch.ambulance.vehicleNumber}`);
        if (dispatch.ambulance.driver) {
          console.log(`         Driver: ${dispatch.ambulance.driver.firstName} ${dispatch.ambulance.driver.lastName}`);
        }
        console.log(`         Emergency: ${dispatch.emergency.alertType} (${dispatch.emergency.priority})`);
      });
    } else {
      console.log('   ℹ️  No active dispatches (this is normal if no emergencies are ongoing)');
    }

    // 5. Check dispatch history
    console.log('\n5️⃣ Checking dispatch history...');
    const allDispatches = await AmbulanceDispatch.findAll({
      include: [
        {
          model: Ambulance,
          as: 'ambulance',
          include: [
            {
              model: User,
              as: 'driver',
              attributes: ['firstName', 'lastName'],
            },
          ],
        },
      ],
      order: [['dispatchedAt', 'DESC']],
      limit: 10,
    });

    console.log(`   ✅ Found ${allDispatches.length} total dispatches (showing last 10):`);
    if (allDispatches.length > 0) {
      allDispatches.forEach((dispatch, index) => {
        console.log(`      ${index + 1}. ${dispatch.ambulance.vehicleNumber} - Status: ${dispatch.status}`);
        console.log(`         Dispatched: ${dispatch.dispatchedAt.toLocaleString()}`);
        if (dispatch.ambulance.driver) {
          console.log(`         Driver: ${dispatch.ambulance.driver.firstName} ${dispatch.ambulance.driver.lastName}`);
        }
      });
    } else {
      console.log('   ℹ️  No dispatches in history yet');
    }

    // Summary
    console.log('\n📊 Summary:');
    console.log(`   Drivers: ${drivers.length}`);
    console.log(`   Ambulances: ${ambulances.length}`);
    console.log(`   Assigned: ${assignedCount}`);
    console.log(`   Active Dispatches: ${activeDispatches.length}`);
    console.log(`   Total Dispatches: ${allDispatches.length}`);

    // Recommendations
    console.log('\n💡 Recommendations:');
    if (assignedCount < drivers.length) {
      console.log(`   ⚠️  ${drivers.length - assignedCount} driver(s) need ambulance assignment`);
    }
    if (ambulances.length === 0) {
      console.log('   ⚠️  Create ambulances in coordinator dashboard');
    }
    if (assignedCount === 0) {
      console.log('   ⚠️  Assign drivers to ambulances in coordinator dashboard');
    }
    if (assignedCount > 0 && activeDispatches.length === 0) {
      console.log('   ℹ️  Everything is set up! Create an emergency to test dispatch flow.');
    }

    console.log('\n✅ Test complete!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error testing driver setup:', error);
    process.exit(1);
  }
}

// Run the test
testDriverSetup();
