// backend/controllers/authController.js (Make sure exports are correct)
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Login attempt for:', email);
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Find user by email
    const user = await User.findOne({ where: { email } });
    
    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Check if user is active
    if (!user.isActive) {
      console.log('❌ User account is inactive:', email);
      return res.status(401).json({
        success: false,
        message: 'Account is inactive. Please contact support.'
      });
    }
    
    // Check password using the correct method name
    const isValidPassword = await user.validatePassword(password);
    
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    // Create token (like a digital ID card)
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful for:', email, '- Role:', user.role);
    
    // Prepare user data for response (exclude sensitive info)
    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      isActive: user.isActive
    };
    
    // Add professional info for mental health consultants
    if (user.role === 'mental_health_consultant') {
      userData.licenseNumber = user.licenseNumber;
      userData.specialization = user.specialization;
    }
    
    res.json({
      success: true,
      message: 'Login successful',
      token: token,
      user: userData
    });
    
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// Register function
const register = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      role = 'family_member',
      licenseNumber,
      specialization
    } = req.body;
    
    console.log('📝 Registration attempt for:', email);
    
    // Validate required fields
    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }
    
    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Prepare user data
    const userData = {
      firstName,
      lastName,
      email,
      password, // Will be hashed by the model hook
      phone,
      role,
      isActive: true
    };
    
    // Add professional fields for mental health consultants
    if (role === 'mental_health_consultant') {
      if (!licenseNumber) {
        return res.status(400).json({
          success: false,
          message: 'License number is required for mental health consultants'
        });
      }
      userData.licenseNumber = licenseNumber;
      userData.specialization = specialization;
    }
    
    // Create user
    const newUser = await User.create(userData);
    
    console.log('✅ User registered successfully:', newUser.email);
    
    // Create token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        role: newUser.role 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
    
    // Prepare response data
    const responseUser = {
      id: newUser.id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      isActive: newUser.isActive
    };
    
    if (newUser.role === 'mental_health_consultant') {
      responseUser.licenseNumber = newUser.licenseNumber;
      responseUser.specialization = newUser.specialization;
    }
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token: token,
      user: responseUser
    });
    
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // From JWT middleware
    
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password'] } // Don't send password
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user: user
    });
    
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user profile'
    });
  }
};

module.exports = {
  login,
  register,
  getProfile
};