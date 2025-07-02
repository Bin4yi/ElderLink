// backend/middleware/subscriptionCheck.js
const { Subscription } = require('../models');

const requireActiveSubscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const activeSubscription = await Subscription.findOne({
      where: { 
        userId, 
        status: 'active',
        endDate: {
          [require('sequelize').Op.gt]: new Date()
        }
      }
    });

    if (!activeSubscription) {
      return res.status(403).json({ 
        message: 'Active subscription required',
        code: 'SUBSCRIPTION_REQUIRED'
      });
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { requireActiveSubscription };