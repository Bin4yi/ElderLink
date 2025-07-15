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

// Make sure all these functions are properly exported from authController
router.post('/register', validateRegistration, register);
router.post('/login', validateLogin, login);
router.get('/profile', authenticate, getProfile);

module.exports = router;