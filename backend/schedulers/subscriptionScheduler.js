// backend/schedulers/subscriptionScheduler.js
const cron = require('node-cron');
const { checkExpiringSubscriptions, expireSubscriptions } = require('../services/subscriptionService');

/**
 * Initialize subscription-related cron jobs
 */
const initSubscriptionScheduler = () => {
  // Check for expiring subscriptions daily at 9:00 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('🕐 Running scheduled task: Check expiring subscriptions');
    try {
      const result = await checkExpiringSubscriptions();
      console.log(`✅ Expiring subscription check completed: ${result.count} reminders sent`);
    } catch (error) {
      console.error('❌ Error in expiring subscription check:', error);
    }
  });

  // Expire old subscriptions daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log('🕐 Running scheduled task: Expire old subscriptions');
    try {
      const result = await expireSubscriptions();
      console.log(`✅ Subscription expiration completed: ${result.count} subscriptions expired`);
    } catch (error) {
      console.error('❌ Error in subscription expiration:', error);
    }
  });

  console.log('✅ Subscription scheduler initialized');
  console.log('   - Expiring subscription check: Daily at 9:00 AM');
  console.log('   - Subscription expiration: Daily at midnight');
};

module.exports = { initSubscriptionScheduler };
