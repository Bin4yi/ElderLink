// check-subscription-schema.js
const sequelize = require('./config/database');

async function checkSchema() {
  try {
    console.log('🔍 Checking Subscriptions table schema...');
    
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Get table description
    const [results] = await sequelize.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'Subscriptions'
      ORDER BY ordinal_position;
    `);

    console.log('\n📋 Subscriptions Table Columns:');
    console.table(results);

    // Check specifically for reminderSent
    const reminderSentColumn = results.find(col => col.column_name === 'reminderSent');
    
    if (reminderSentColumn) {
      console.log('\n✅ reminderSent column EXISTS');
      console.log('Details:', reminderSentColumn);
    } else {
      console.log('\n❌ reminderSent column NOT FOUND');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkSchema();
