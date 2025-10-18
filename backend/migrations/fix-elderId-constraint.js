// backend/migrations/fix-elderId-constraint.js
const sequelize = require('../config/database');

async function fixElderIdConstraint() {
  try {
    console.log('🔄 Removing NOT NULL constraint from elderId column...');

    // Use raw SQL to alter the column
    await sequelize.query(`
      ALTER TABLE "Appointments" 
      ALTER COLUMN "elderId" DROP NOT NULL;
    `);

    console.log('✅ Successfully removed NOT NULL constraint from elderId');

    // Also make sure familyMemberId is nullable
    await sequelize.query(`
      ALTER TABLE "Appointments" 
      ALTER COLUMN "familyMemberId" DROP NOT NULL;
    `);

    console.log('✅ Successfully removed NOT NULL constraint from familyMemberId');

    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    if (error.message.includes('does not exist')) {
      console.log('ℹ️  Constraint might already be removed');
    } else {
      throw error;
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  fixElderIdConstraint()
    .then(() => {
      console.log('Migration finished');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = fixElderIdConstraint;
