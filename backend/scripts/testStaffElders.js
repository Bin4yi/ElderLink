// Test script to check staff assigned elders
const { StaffAssignment, Elder, User, Subscription } = require('../models');
const { Op } = require('sequelize');

async function testStaffElders() {
  try {
    console.log('🧪 Testing Staff Assigned Elders\n');
    
    // Get all staff members
    const allStaff = await User.findAll({
      where: { role: 'staff' },
      attributes: ['id', 'firstName', 'lastName', 'email']
    });
    
    console.log('👥 All Staff Members:');
    allStaff.forEach(staff => {
      console.log(`  - ${staff.firstName} ${staff.lastName} (${staff.email}) - ID: ${staff.id}`);
    });
    
    console.log('\n📋 Testing each staff member:\n');
    
    for (const staff of allStaff) {
      console.log(`\n🔍 Staff: ${staff.firstName} ${staff.lastName} (ID: ${staff.id})`);
      
      // Get assignments
      const assignments = await StaffAssignment.findAll({
        where: {
          staffId: staff.id,
          isActive: true
        },
        attributes: ['elderId', 'assignedDate']
      });
      
      console.log(`  Found ${assignments.length} active assignments`);
      
      if (assignments.length > 0) {
        const elderIds = assignments.map(a => a.elderId);
        console.log(`  Elder IDs:`, elderIds);
        
        // Get elders
        const elders = await Elder.findAll({
          where: {
            id: { [Op.in]: elderIds }
          },
          attributes: ['id', 'firstName', 'lastName', 'photo', 'dateOfBirth'],
          include: [
            {
              model: Subscription,
              as: 'subscription',
              attributes: ['id', 'plan', 'status']
            }
          ]
        });
        
        console.log(`  Fetched ${elders.length} elders:`);
        elders.forEach(elder => {
          console.log(`    - ${elder.firstName} ${elder.lastName} (ID: ${elder.id})`);
          console.log(`      Photo: ${elder.photo || 'No photo'}`);
          console.log(`      DOB: ${elder.dateOfBirth}`);
        });
      }
    }
    
    console.log('\n✅ Test completed\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

testStaffElders();
