// backend/run-user-settings-migration.js
const { sequelize } = require('./models');
const migration = require('./migrations/create-user-settings-table');

async function runMigration() {
  try {
    console.log('🔧 Running UserSettings table migration...');
    
    await migration.up(sequelize.getQueryInterface());
    
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
