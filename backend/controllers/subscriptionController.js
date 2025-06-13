// backend/controllers/subscriptionController.js (FIXED)
const { Subscription, User, Elder } = require('../models');
const stripe = require('../config/stripe');

const PACKAGE_PRICES = {
  basic: { 1: 99, 6: 534, 12: 1068 },
  premium: { 1: 199, 6: 1074, 12: 2148 },
  comprehensive: { 1: 299, 6: 1614, 12: 3228 }
};

const createSubscription = async (req, res) => {
  try {
    const { plan, duration, paymentMethodId } = req.body;
    const userId = req.user.id;

    console.log('🔵 Creating subscription for user:', userId);
    console.log('🔵 Plan:', plan, 'Duration:', duration);

    // REMOVED: The blocking check for existing active subscriptions
    // Users should be able to have multiple active subscriptions
    // Each subscription can have one elder, so multiple subscriptions = multiple elders

    const durationMonths = duration === '1_month' ? 1 : duration === '6_months' ? 6 : 12;
    const amount = PACKAGE_PRICES[plan][durationMonths];

    console.log('🔵 Duration months:', durationMonths, 'Amount:', amount);

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
      endDate.setMonth(endDate.getMonth() + durationMonths);

      const subscription = await Subscription.create({
        userId,
        stripeCustomerId: customer.id,
        plan,
        status: 'active',
        startDate,
        endDate,
        amount,
        duration,
        autoRenew: true
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

module.exports = { 
  createSubscription, 
  getSubscriptions, 
  getAvailableSubscriptions,
  cancelSubscription 
};