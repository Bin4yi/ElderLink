// backend/routes/webhook.js
const express = require('express');
const router = express.Router();

// Import controller
const { handleEmergencyAlert } = require('../controllers/emergencyController');

console.log('✅ Webhook routes loaded');

// QStash webhook endpoint for emergency alerts
router.post('/emergency', (req, res, next) => {
  console.log('\n🚨🚨🚨 EMERGENCY WEBHOOK ENDPOINT HIT 🚨🚨🚨');
  console.log('⏰ Timestamp:', new Date().toISOString());
  console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('📦 Body:', JSON.stringify(req.body, null, 2));
  console.log('🔍 Content-Type:', req.get('content-type'));
  console.log('🔍 Request Method:', req.method);
  console.log('🔍 Request URL:', req.originalUrl);
  
  handleEmergencyAlert(req, res, next);
});

// Health check endpoint
router.get('/health', (req, res) => {
  console.log('✅ Webhook health check');
  res.json({
    success: true,
    message: 'Webhook service is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      emergency: '/api/webhook/emergency',
      test: '/api/webhook/test'
    }
  });
});

// Test endpoint
router.get('/test', (req, res) => {
  console.log('🧪 Webhook test endpoint hit');
  res.json({
    success: true,
    message: 'Webhook test endpoint working',
    timestamp: new Date().toISOString()
  });
});

// QStash verification endpoint
router.post('/verify', (req, res) => {
  console.log('✅ QStash verification endpoint hit');
  res.json({
    success: true,
    message: 'QStash webhook verified'
  });
});

module.exports = router;