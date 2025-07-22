const sequelize = require('../config/database');

const addMissingUserColumns = async () => {
  try {
    console.log('🔄 Adding missing User columns...');
    
    // Add missing columns using raw SQL
    const queries = [
      `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "experience" INTEGER DEFAULT 0;`,
      `ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "photo" VARCHAR(255);`,
      `COMMENT ON COLUMN "Users"."experience" IS 'Years of experience for staff members';`,
      `COMMENT ON COLUMN "Users"."photo" IS 'Profile photo filename for users';`
    ];
    
    for (const query of queries) {
      try {
        await sequelize.query(query);
        console.log(`✅ Executed: ${query}`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️  Column already exists, skipping...`);
        } else {
          console.error(`❌ Error executing query: ${query}`, error.message);
        }
      }
    }
    
    console.log('✅ Missing User columns added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding User columns:', error);
    process.exit(1);
  }
};

addMissingUserColumns();