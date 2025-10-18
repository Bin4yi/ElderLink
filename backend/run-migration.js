// Run this script to add missing database columns
const { sequelize } = require('./models');

async function runMigration() {
  try {
    console.log('🔧 Running database migrations...');

    // Add reminderSent column
    await sequelize.query(`
      ALTER TABLE "Subscriptions" 
      ADD COLUMN IF NOT EXISTS "reminderSent" BOOLEAN DEFAULT false;
    `);
    console.log('✅ Added reminderSent column to Subscriptions table');

    // Create SubscriptionHistory table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "SubscriptionHistory" (
        "id" SERIAL PRIMARY KEY,
        "subscriptionId" UUID NOT NULL REFERENCES "Subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        "userId" UUID NOT NULL,
        "action" VARCHAR(20) NOT NULL CHECK ("action" IN ('created', 'renewed', 'canceled', 'expired')),
        "plan" VARCHAR(255) NOT NULL,
        "duration" VARCHAR(50) NOT NULL,
        "amount" DECIMAL(10, 2) NOT NULL,
        "startDate" TIMESTAMP NOT NULL,
        "endDate" TIMESTAMP NOT NULL,
        "stripePaymentIntentId" VARCHAR(255),
        "metadata" JSONB DEFAULT '{}',
        "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created SubscriptionHistory table');

    // Create indexes
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "subscription_history_subscription_id" ON "SubscriptionHistory"("subscriptionId");
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "subscription_history_user_id" ON "SubscriptionHistory"("userId");
    `);
    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "subscription_history_action" ON "SubscriptionHistory"("action");
    `);
    console.log('✅ Created indexes');

    console.log('✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
