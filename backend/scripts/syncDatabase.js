const sequelize = require('../config/database');
const { User, Elder, Subscription, HealthMonitoring, Notification, StaffAssignment } = require('../models');

async function syncDatabase() {
  try {
    console.log('🔄 Syncing database...');
    
    // Sync models in the correct order
    await User.sync({ alter: true });
    console.log('✅ User table synced');
    
    await Subscription.sync({ alter: true });
    console.log('✅ Subscription table synced');
    
    await Elder.sync({ alter: true });
    console.log('✅ Elder table synced');
    
    await HealthMonitoring.sync({ alter: true });
    console.log('✅ HealthMonitoring table synced');
    
    await Notification.sync({ alter: true });
    console.log('✅ Notification table synced');
    
    await StaffAssignment.sync({ alter: true });
    console.log('✅ StaffAssignment table synced');
    
    console.log('🎉 Database sync completed successfully!');
  } catch (error) {
    console.error('❌ Database sync failed:', error);
  } finally {
    await sequelize.close();
  }
}

syncDatabase();