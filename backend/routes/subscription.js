// backend/routes/subscription.js
const express = require('express');
const router = express.Router();
const { 
  createSubscription, 
  getSubscriptions,
  getAvailableSubscriptions,
  cancelSubscription,
  getSubscriptionStatistics,
  checkExpiring,
  expireOldSubscriptions,
  renewSubscription,
  getSubscriptionHistory
} = require('../controllers/subscriptionController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('family_member'), createSubscription);
router.get('/', authenticate, getSubscriptions);
router.get('/stats', authenticate, getSubscriptionStatistics);
router.get('/history', authenticate, getSubscriptionHistory);
router.get('/available', authenticate, getAvailableSubscriptions);
router.delete('/:subscriptionId', authenticate, cancelSubscription);

// Renewal route - keeps all data including elder assignment
router.post('/:subscriptionId/renew', authenticate, authorize('family_member'), renewSubscription);

// Admin routes for manual triggers
router.post('/check-expiring', authenticate, authorize('admin'), checkExpiring);
router.post('/expire-old', authenticate, authorize('admin'), expireOldSubscriptions);

module.exports = router;