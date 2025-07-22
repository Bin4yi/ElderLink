const sequelize = require('../config/database');
const migration = require('../migrations/create-staff-assignments-table');

async function runMigration() {
  try {
    console.log('🔄 Running staff assignments table migration...');
    await migration.up(sequelize.getQueryInterface(), sequelize);
    console.log('✅ Migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await sequelize.close();
  }
}

runMigration();