// backend/routes/subscription.js

// backend/routes/subscription.js
const express = require('express');
const router = express.Router();
const { 
  createSubscription, 
  getSubscriptions,
  getAvailableSubscriptions,
  cancelSubscription 
} = require('../controllers/subscriptionController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('family_member'), createSubscription);
router.get('/', authenticate, getSubscriptions);
router.get('/available', authenticate, getAvailableSubscriptions); // NEW ROUTE
router.delete('/:subscriptionId', authenticate, cancelSubscription);

module.exports = router;