const sequelize = require('../config/database');

const cleanOrphanedData = async () => {
  try {
    console.log('🔍 Checking for orphaned data...');
    
    // First, clean ALL doctor_schedules that reference orphaned doctors
    try {
      console.log('🔄 Cleaning doctor_schedules that reference orphaned doctors...');
      
      // Get orphaned doctors first
      const [orphanedDoctors] = await sequelize.query(`
        SELECT d.id 
        FROM "doctors" d 
        LEFT JOIN "Users" u ON d."userId" = u.id 
        WHERE u.id IS NULL;
      `);
      
      if (orphanedDoctors.length > 0) {
        const orphanedDoctorIds = orphanedDoctors.map(d => `'${d.id}'`).join(',');
        console.log(`Found ${orphanedDoctors.length} orphaned doctors, cleaning their schedules...`);
        
        // Delete schedules that reference orphaned doctors
        const [deletedSchedules] = await sequelize.query(`
          DELETE FROM "doctor_schedules" 
          WHERE "doctorId" IN (${orphanedDoctorIds});
        `);
        console.log('✅ Doctor schedules for orphaned doctors removed');
        
        // Delete assignments that reference orphaned doctors
        try {
          const [deletedAssignments] = await sequelize.query(`
            DELETE FROM "doctor_assignments" 
            WHERE "doctorId" IN (${orphanedDoctorIds});
          `);
          console.log('✅ Doctor assignments for orphaned doctors removed');
        } catch (err) {
          console.log('⚠️ Could not clean doctor assignments:', err.message);
        }
        
        // Delete appointments that reference orphaned doctors
        try {
          const [deletedAppointments] = await sequelize.query(`
            DELETE FROM "appointments" 
            WHERE "doctorId" IN (${orphanedDoctorIds});
          `);
          console.log('✅ Appointments for orphaned doctors removed');
        } catch (err) {
          console.log('⚠️ Could not clean appointments:', err.message);
        }
        
        // Delete prescriptions that reference orphaned doctors
        try {
          const [deletedPrescriptions] = await sequelize.query(`
            DELETE FROM "prescriptions" 
            WHERE "doctorId" IN (${orphanedDoctorIds});
          `);
          console.log('✅ Prescriptions for orphaned doctors removed');
        } catch (err) {
          console.log('⚠️ Could not clean prescriptions:', err.message);
        }
        
        // Now try to delete the orphaned doctors
        console.log('🗑️ Removing orphaned doctors...');
        await sequelize.query(`
          DELETE FROM "doctors" 
          WHERE "userId" NOT IN (SELECT id FROM "Users");
        `);
        console.log('✅ Orphaned doctors removed');
      } else {
        console.log('ℹ️ No orphaned doctors found');
      }
    } catch (err) {
      console.log('⚠️ Could not clean orphaned doctors and dependencies:', err.message);
    }
    
    // Clean orphaned inventories
    try {
      console.log('🔄 Cleaning orphaned inventories...');
      
      // First clean inventory_transactions that reference orphaned inventories
      const [orphanedInventoryTransactions] = await sequelize.query(`
        SELECT it.id, it."inventoryId" 
        FROM "inventory_transactions" it 
        LEFT JOIN "inventories" i ON it."inventoryId" = i.id 
        WHERE i.id IS NULL;
      `);
      
      console.log(`Found ${orphanedInventoryTransactions.length} orphaned inventory transactions`);
      
      if (orphanedInventoryTransactions.length > 0) {
        await sequelize.query(`
          DELETE FROM "inventory_transactions" 
          WHERE "inventoryId" NOT IN (SELECT id FROM "inventories");
        `);
        console.log('✅ Orphaned inventory transactions removed');
      }
      
      // Now clean inventories that reference non-existent pharmacies (Users)
      const [orphanedInventories] = await sequelize.query(`
        SELECT i.id, i."pharmacyId" 
        FROM "inventories" i 
        LEFT JOIN "Users" u ON i."pharmacyId" = u.id 
        WHERE u.id IS NULL;
      `);
      
      console.log(`Found ${orphanedInventories.length} orphaned inventories`);
      
      if (orphanedInventories.length > 0) {
        console.log('🗑️ Removing orphaned inventories...');
        await sequelize.query(`
          DELETE FROM "inventories" 
          WHERE "pharmacyId" NOT IN (SELECT id FROM "Users");
        `);
        console.log('✅ Orphaned inventories removed');
      }
    } catch (err) {
      console.log('⚠️ Could not clean inventories:', err.message);
    }
    
    // Clean other orphaned data
    try {
      const [orphanedNotifications] = await sequelize.query(`
        SELECT n.id, n."userId" 
        FROM "Notifications" n 
        LEFT JOIN "Users" u ON n."userId" = u.id 
        WHERE u.id IS NULL;
      `);
      
      console.log(`Found ${orphanedNotifications.length} orphaned notifications`);
      
      if (orphanedNotifications.length > 0) {
        console.log('🗑️ Removing orphaned notifications...');
        await sequelize.query(`
          DELETE FROM "Notifications" 
          WHERE "userId" NOT IN (SELECT id FROM "Users");
        `);
        console.log('✅ Orphaned notifications removed');
      }
    } catch (err) {
      console.log('⚠️ Could not check notifications:', err.message);
    }
    
    // Check orphaned notifications by elderId
    try {
      const [orphanedNotificationsByElder] = await sequelize.query(`
        SELECT n.id, n."elderId" 
        FROM "Notifications" n 
        LEFT JOIN "Elders" e ON n."elderId" = e.id 
        WHERE n."elderId" IS NOT NULL AND e.id IS NULL;
      `);
      
      console.log(`Found ${orphanedNotificationsByElder.length} orphaned notifications by elderId`);
      
      if (orphanedNotificationsByElder.length > 0) {
        console.log('🗑️ Removing orphaned notifications by elderId...');
        await sequelize.query(`
          DELETE FROM "Notifications" 
          WHERE "elderId" IS NOT NULL 
          AND "elderId" NOT IN (SELECT id FROM "Elders");
        `);
        console.log('✅ Orphaned notifications by elderId removed');
      }
    } catch (err) {
      console.log('⚠️ Could not check notifications by elderId:', err.message);
    }
    
    // Check staff_assignments table specifically
    try {
      const [orphanedStaffAssignments] = await sequelize.query(`
        SELECT sa.id, sa."staffId" 
        FROM "staff_assignments" sa 
        LEFT JOIN "Users" u ON sa."staffId" = u.id 
        WHERE u.id IS NULL;
      `);
      
      console.log(`Found ${orphanedStaffAssignments.length} orphaned staff assignments`);
      
      if (orphanedStaffAssignments.length > 0) {
        console.log('🗑️ Removing orphaned staff assignments...');
        await sequelize.query(`
          DELETE FROM "staff_assignments" 
          WHERE "staffId" NOT IN (SELECT id FROM "Users");
        `);
        console.log('✅ Orphaned staff assignments removed');
      }
      
      // Also check elderId in staff_assignments
      const [orphanedStaffAssignmentsByElder] = await sequelize.query(`
        SELECT sa.id, sa."elderId" 
        FROM "staff_assignments" sa 
        LEFT JOIN "Elders" e ON sa."elderId" = e.id 
        WHERE sa."elderId" IS NOT NULL AND e.id IS NULL;
      `);
      
      console.log(`Found ${orphanedStaffAssignmentsByElder.length} orphaned staff assignments by elderId`);
      
      if (orphanedStaffAssignmentsByElder.length > 0) {
        console.log('🗑️ Removing orphaned staff assignments by elderId...');
        await sequelize.query(`
          DELETE FROM "staff_assignments" 
          WHERE "elderId" IS NOT NULL 
          AND "elderId" NOT IN (SELECT id FROM "Elders");
        `);
        console.log('✅ Orphaned staff assignments by elderId removed');
      }
    } catch (err) {
      console.log('⚠️ Could not check staff_assignments:', err.message);
    }
    
    console.log('🎉 Database cleanup completed!');
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    process.exit(0);
  }
};


cleanOrphanedData();