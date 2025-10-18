// backend/controllers/subscriptionController.js (FIXED)
const { Subscription, User, Elder, SubscriptionHistory } = require('../models');
const stripe = require('../config/stripe');
const { 
  getSubscriptionStats, 
  expireSubscriptions,
  checkExpiringSubscriptions 
} = require('../services/subscriptionService');

const PACKAGE_PRICES = {
  '1_month': 99,
  '6_months': 534,
  '1_year': 1068
};

const createSubscription = async (req, res) => {
  try {
    const { duration, paymentMethodId } = req.body;
    const userId = req.user.id;

    const amount = PACKAGE_PRICES[duration];
    if (!amount) {
      return res.status(400).json({ message: 'Invalid duration' });
    }

    console.log('🔵 Creating subscription for user:', userId);
    console.log('🔵 Duration:', duration);

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email: req.user.email,
      name: `${req.user.firstName} ${req.user.lastName}`,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    console.log('🔵 Stripe customer created:', customer.id);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      customer: customer.id,
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/dashboard`
    });

    console.log('🔵 Payment intent status:', paymentIntent.status);

    if (paymentIntent.status === 'succeeded') {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + (duration === '1_month' ? 1 : duration === '6_months' ? 6 : 12));

      const subscription = await Subscription.create({
        userId,
        stripeCustomerId: customer.id,
        plan: 'premium', // or 'basic', or whatever your default is
        status: 'active',
        startDate,
        endDate,
        amount,
        duration, // <-- this is '1_month', '6_months', or '1_year'
        autoRenew: true,
        stripePaymentIntentId: paymentIntent.id
      });

      // Log to history
      await SubscriptionHistory.create({
        subscriptionId: subscription.id,
        userId,
        action: 'created',
        plan: subscription.plan,
        duration: subscription.duration,
        amount: subscription.amount,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        stripePaymentIntentId: paymentIntent.id,
        metadata: {
          stripeCustomerId: customer.id,
          paymentStatus: paymentIntent.status
        }
      });

      console.log('✅ Subscription created successfully:', subscription.id);

      res.json({
        message: 'Subscription created successfully',
        subscription,
        clientSecret: paymentIntent.client_secret
      });
    } else {
      console.log('❌ Payment failed:', paymentIntent.status);
      res.status(400).json({ message: 'Payment failed' });
    }
  } catch (error) {
    console.error('❌ Subscription creation error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getSubscriptions = async (req, res) => {
  try {
    console.log('🔍 Getting subscriptions for user:', req.user.id);
    
    const subscriptions = await Subscription.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Elder,
          as: 'elder',
          required: false // LEFT JOIN to include subscriptions without elders
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('🔍 Found subscriptions:', subscriptions.length);
    subscriptions.forEach(sub => {
      console.log(`  - ${sub.plan} (${sub.status}) - Elder: ${sub.elder ? 'Yes' : 'No'}`);
    });

    res.json({ subscriptions });
  } catch (error) {
    console.error('Get subscriptions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// NEW: Get available subscriptions (active subscriptions without elders)
const getAvailableSubscriptions = async (req, res) => {
  try {
    console.log('🔍 Getting available subscriptions for user:', req.user.id);
    
    const availableSubscriptions = await Subscription.findAll({
      where: { 
        userId: req.user.id,
        status: 'active'
      },
      include: [
        {
          model: Elder,
          as: 'elder',
          required: false
        }
      ]
    });

    // Filter out subscriptions that already have elders
    const subscriptionsWithoutElders = availableSubscriptions.filter(sub => !sub.elder);

    console.log('🔍 Available subscriptions (without elders):', subscriptionsWithoutElders.length);

    res.json({ 
      availableSubscriptions: subscriptionsWithoutElders,
      totalSubscriptions: availableSubscriptions.length 
    });
  } catch (error) {
    console.error('Get available subscriptions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;

    const subscription = await Subscription.findOne({
      where: { id: subscriptionId, userId: req.user.id }
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    // Cancel in Stripe if exists
    if (subscription.stripeSubscriptionId) {
      await stripe.subscriptions.cancel(subscription.stripeSubscriptionId);
    }

    await subscription.update({
      status: 'canceled',
      autoRenew: false
    });

    console.log('✅ Subscription canceled:', subscriptionId);
    res.json({ message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get subscription statistics with expiration info
const getSubscriptionStatistics = async (req, res) => {
  try {
    const stats = await getSubscriptionStats(req.user.id);
    res.json({ success: true, stats });
  } catch (error) {
    console.error('Get subscription statistics error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Manual trigger to check expiring subscriptions (admin only)
const checkExpiring = async (req, res) => {
  try {
    const result = await checkExpiringSubscriptions();
    res.json({ success: true, result });
  } catch (error) {
    console.error('Check expiring subscriptions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Manual trigger to expire subscriptions (admin only)
const expireOldSubscriptions = async (req, res) => {
  try {
    const result = await expireSubscriptions();
    res.json({ success: true, result });
  } catch (error) {
    console.error('Expire subscriptions error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Renew an expired subscription - keeps all data (elder assignment, history)
const renewSubscription = async (req, res) => {
  try {
    const { subscriptionId } = req.params;
    const { duration, paymentMethodId } = req.body;
    const userId = req.user.id;

    // Find the subscription
    const subscription = await Subscription.findOne({
      where: { id: subscriptionId, userId },
      include: [{ model: Elder, as: 'elder' }]
    });

    if (!subscription) {
      return res.status(404).json({ 
        success: false,
        message: 'Subscription not found' 
      });
    }

    // Check if subscription is expired or canceled
    if (!['expired', 'canceled'].includes(subscription.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only expired or canceled subscriptions can be renewed'
      });
    }

    const amount = PACKAGE_PRICES[duration];
    if (!amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid duration' 
      });
    }

    console.log('🔄 Renewing subscription:', subscriptionId);
    console.log('🔄 Previous elder assignment:', subscription.elderId);

    // Process payment with Stripe
    const customer = await stripe.customers.create({
      email: req.user.email,
      name: `${req.user.firstName} ${req.user.lastName}`,
      payment_method: paymentMethodId,
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'usd',
      customer: customer.id,
      payment_method: paymentMethodId,
      confirmation_method: 'manual',
      confirm: true,
      return_url: `${process.env.FRONTEND_URL}/dashboard`,
      metadata: {
        subscriptionId: subscription.id,
        renewal: 'true'
      }
    });

    console.log('🔄 Payment processed:', paymentIntent.status);

    // Calculate new dates
    const startDate = new Date();
    let endDate = new Date(startDate);
    
    switch(duration) {
      case '1_month':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case '6_months':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case '1_year':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
    }

    // Update the subscription - KEEP elderId to preserve assignment
    // IMPORTANT: Subscription ID stays the same!
    await subscription.update({
      status: 'active',
      startDate,
      endDate,
      duration,
      amount,
      stripeCustomerId: customer.id,
      stripePaymentIntentId: paymentIntent.id,
      reminderSent: false // Reset reminder flag
    });

    // Log renewal to history
    await SubscriptionHistory.create({
      subscriptionId: subscription.id, // Same ID - not creating new subscription
      userId,
      action: 'renewed',
      plan: subscription.plan,
      duration: subscription.duration,
      amount: subscription.amount,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      stripePaymentIntentId: paymentIntent.id,
      metadata: {
        previousEndDate: subscription.endDate, // Store when it expired
        elderIdPreserved: subscription.elderId ? true : false,
        stripeCustomerId: customer.id,
        paymentStatus: paymentIntent.status
      }
    });

    // Reload to get updated data
    await subscription.reload({
      include: [{ model: Elder, as: 'elder' }]
    });

    console.log('✅ Subscription renewed successfully');
    console.log('✅ Subscription ID unchanged:', subscription.id);
    console.log('✅ Elder assignment preserved:', subscription.elderId);

    res.json({
      success: true,
      message: 'Subscription renewed successfully',
      subscription,
      dataPreserved: {
        elderAssignment: subscription.elderId ? true : false,
        elderName: subscription.elder ? 
          `${subscription.elder.firstName} ${subscription.elder.lastName}` : null
      }
    });
  } catch (error) {
    console.error('❌ Renewal error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to renew subscription',
      error: error.message 
    });
  }
};

// Get subscription history for a user
const getSubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { subscriptionId } = req.query;

    let whereClause = { userId };
    if (subscriptionId) {
      whereClause.subscriptionId = subscriptionId;
    }

    const history = await SubscriptionHistory.findAll({
      where: whereClause,
      include: [
        {
          model: Subscription,
          as: 'subscription',
          include: [{ model: Elder, as: 'elder' }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      history,
      total: history.length
    });
  } catch (error) {
    console.error('❌ Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription history',
      error: error.message
    });
  }
};

module.exports = { 
  createSubscription, 
  getSubscriptions, 
  getAvailableSubscriptions,
  cancelSubscription,
  getSubscriptionStatistics,
  checkExpiring,
  expireOldSubscriptions,
  renewSubscription,
  getSubscriptionHistory
};