-- Add reminderSent column to Subscriptions table
ALTER TABLE "Subscriptions" 
ADD COLUMN IF NOT EXISTS "reminderSent" BOOLEAN DEFAULT false;

-- Create SubscriptionHistory table
CREATE TABLE IF NOT EXISTS "SubscriptionHistory" (
  "id" SERIAL PRIMARY KEY,
  "subscriptionId" INTEGER NOT NULL REFERENCES "Subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "userId" INTEGER NOT NULL,
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

-- Create indexes
CREATE INDEX IF NOT EXISTS "subscription_history_subscription_id" ON "SubscriptionHistory"("subscriptionId");
CREATE INDEX IF NOT EXISTS "subscription_history_user_id" ON "SubscriptionHistory"("userId");
CREATE INDEX IF NOT EXISTS "subscription_history_action" ON "SubscriptionHistory"("action");

-- Success message
SELECT 'Migration completed successfully!' AS result;
