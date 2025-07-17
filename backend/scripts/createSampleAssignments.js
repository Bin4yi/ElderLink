const { User, Elder, StaffAssignment } = require('../models');

async function createSampleAssignments() {
  try {
    console.log('🔄 Creating sample staff assignments...');
    
    // Get a staff member
    const staffMember = await User.findOne({
      where: { role: 'staff' }
    });
    
    if (!staffMember) {
      console.log('❌ No staff member found. Please create a staff member first.');
      return;
    }
    
    // Get some elders
    const elders = await Elder.findAll({ limit: 3 });
    
    if (elders.length === 0) {
      console.log('❌ No elders found. Please create some elders first.');
      return;
    }
    
    // Get an admin user to be the assignedBy
    const adminUser = await User.findOne({
      where: { role: 'admin' }
    });
    
    if (!adminUser) {
      console.log('❌ No admin user found. Please create an admin user first.');
      return;
    }
    
    // Create assignments
    for (const elder of elders) {
      const existingAssignment = await StaffAssignment.findOne({
        where: {
          staffId: staffMember.id,
          elderId: elder.id,
          isActive: true
        }
      });
      
      if (!existingAssignment) {
        await StaffAssignment.create({
          staffId: staffMember.id,
          elderId: elder.id,
          assignedBy: adminUser.id,
          assignedDate: new Date(),
          isActive: true,
          notes: 'Sample assignment for testing'
        });
        
        console.log(`✅ Assigned elder ${elder.firstName} ${elder.lastName} to staff ${staffMember.firstName} ${staffMember.lastName}`);
      } else {
        console.log(`ℹ️ Elder ${elder.firstName} ${elder.lastName} already assigned to staff ${staffMember.firstName} ${staffMember.lastName}`);
      }
    }
    
    console.log('🎉 Sample assignments created successfully!');
    
  } catch (error) {
    console.error('❌ Error creating sample assignments:', error);
  }
}

createSampleAssignments();