// Script to fix Notification table schema - elderId should reference Elders table
const { Notification } = require('../models');
const sequelize = require('../config/database');

async function fixNotificationSchema() {
  try {
    console.log('🔧 Fixing Notification table schema...');

    // Drop the existing foreign key constraint
    await sequelize.query(`
      ALTER TABLE "Notifications" 
      DROP CONSTRAINT IF EXISTS "Notifications_elderId_fkey";
    `);
    console.log('✅ Dropped old foreign key constraint');

    // Add the correct foreign key constraint
    await sequelize.query(`
      ALTER TABLE "Notifications" 
      ADD CONSTRAINT "Notifications_elderId_fkey" 
      FOREIGN KEY ("elderId") 
      REFERENCES "Elders"("id") 
      ON DELETE SET NULL 
      ON UPDATE CASCADE;
    `);
    console.log('✅ Added new foreign key constraint referencing Elders table');

    console.log('✅ Notification schema fixed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing notification schema:', error);
    process.exit(1);
  }
}

fixNotificationSchema();
