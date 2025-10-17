// backend/controllers/authController.js (Make sure exports are correct)
const { User, Elder, Subscription } = require('../models');
const { generateToken } = require('../config/jwt');

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    console.log('🔄 Register attempt for:', email);

    // Validate input
    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({ 
        success: false,
        message: 'All fields are required' 
      });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'User already exists with this email' 
      });
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      role: 'family_member'
    });

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    console.log('✅ User registered:', user.email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('❌ Registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

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

    const user = await User.findOne({ 
      where: { email, isActive: true }
    });

    if (!user) {
      console.log('❌ User not found:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    console.log('🔍 User found, checking password...');
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      console.log('❌ Invalid password for:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });

    console.log('✅ Login successful for:', user.email, '- Role:', user.role);

    // Prepare response data
    const responseData = {
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      token
    };

    // If user is an elder, fetch their elder profile
    if (user.role === 'elder') {
      console.log('👴 User is an elder, fetching elder profile...');
      
      const elder = await Elder.findOne({
        where: { userId: user.id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'isActive']
          },
          {
            model: Subscription,
            as: 'subscription',
            attributes: ['id', 'plan', 'status', 'startDate', 'endDate']
          }
        ]
      });

      if (elder) {
        console.log('✅ Elder profile found:', elder.id);
        responseData.elder = elder;
      } else {
        console.log('⚠️ No elder profile found for elder user');
      }
    }

    res.json(responseData);
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({ 
      success: true,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

module.exports = { register, login, getProfile };