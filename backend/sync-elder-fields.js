const db = require('./models');

async function syncElderFields() {
  try {
    console.log('🔄 Syncing Elder model fields...');
    
    // Force sync just the Elder table with alter option
    await db.Elder.sync({ alter: true });
    
    console.log('✅ Elder table synced successfully!');
    console.log('📋 Checking if hasLoginAccess column exists...');
    
    // Test query to verify the column exists
    const testElder = await db.Elder.findOne();
    if (testElder) {
      console.log('🔍 Sample elder data:', {
        id: testElder.id,
        firstName: testElder.firstName,
        hasLoginAccess: testElder.hasLoginAccess,
        userId: testElder.userId,
        username: testElder.username
      });
    }
    
    console.log('✅ All done! hasLoginAccess, userId, and username columns should now exist.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error syncing Elder fields:', error);
    process.exit(1);
  }
}

syncElderFields();
