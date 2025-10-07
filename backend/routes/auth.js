// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Test route to verify the router is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Auth route is working',
    timestamp: new Date().toISOString()
  });
});

// Debug route to test request body parsing
router.post('/test-body', (req, res) => {
  console.log('🧪 Test endpoint received:');
  console.log('  - Headers:', req.headers);
  console.log('  - Body:', req.body);
  console.log('  - Body type:', typeof req.body);
  console.log('  - Body keys:', Object.keys(req.body));
  
  res.json({
    success: true,
    message: 'Body test endpoint',
    received: {
      headers: req.headers,
      body: req.body,
      bodyType: typeof req.body,
      bodyKeys: Object.keys(req.body)
    }
  });
});

// Make sure all these functions are properly exported from authController
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticate, getProfile);

module.exports = router;