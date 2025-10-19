// run-subscription-reminder-migration.js
const sequelize = require('./config/database');
const migration = require('./migrations/add-reminderSent-to-subscriptions');

async function runMigration() {
  try {
    console.log('🔄 Starting migration: Add reminderSent to Subscriptions...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Run the migration
    await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
