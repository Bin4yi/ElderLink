const { Elder, Subscription, User } = require('../models');
const multer = require('multer');
const path = require('path');
const ElderAuthService = require('../services/elderAuthService');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/elders/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

const addElder = async (req, res) => {
  try {
    console.log('=== BACKEND addElder DEBUG ===');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('User:', req.user?.id);
    
    const { subscriptionId, ...elderData } = req.body;

    console.log('Extracted subscriptionId:', subscriptionId);
    console.log('Extracted elderData:', elderData);

    // Check if subscriptionId is provided
    if (!subscriptionId) {
      console.log('❌ Missing subscriptionId');
      return res.status(400).json({ 
        message: 'Subscription ID is required. Please select a subscription plan first.' 
      });
    }

    console.log('✅ subscriptionId provided:', subscriptionId);

    // Verify subscription belongs to user and is active
    const subscription = await Subscription.findOne({
      where: { 
        id: subscriptionId, 
        userId: req.user.id, 
        status: 'active' 
      }
    });

    console.log('Subscription lookup result:', subscription);

    if (!subscription) {
      console.log('❌ Subscription not found or not active');
      return res.status(404).json({ 
        message: 'Active subscription not found. Please check your subscription status.' 
      });
    }

    console.log('✅ Valid subscription found');

    // Check if subscription already has an elder
    const existingElder = await Elder.findOne({
      where: { subscriptionId }
    });

    console.log('Existing elder check:', existingElder);

    if (existingElder) {
      console.log('❌ Subscription already has an elder');
      return res.status(400).json({ 
        message: 'This subscription already has an elder assigned. Each subscription can only have one elder.' 
      });
    }

    console.log('✅ No existing elder, proceeding to create');

    const elderDataWithPhoto = {
      ...elderData,
      subscriptionId,
      photo: req.file ? req.file.filename : null
    };

    console.log('Final elder data to create:', elderDataWithPhoto);

    const elder = await Elder.create(elderDataWithPhoto);

    console.log('✅ Elder created successfully:', elder);

    res.status(201).json({
      message: 'Elder added successfully',
      elder
    });
  } catch (error) {
    console.error('❌ Add elder error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    
    // Check for specific Sequelize errors
    if (error.name === 'SequelizeValidationError') {
      console.error('Validation errors:', error.errors);
      return res.status(400).json({ 
        message: 'Validation error: ' + error.errors.map(e => e.message).join(', ')
      });
    }
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      console.error('Foreign key constraint error');
      return res.status(400).json({ 
        message: 'Invalid subscription ID provided'
      });
    }
    
    res.status(500).json({ message: 'Internal server error: ' + error.message });
  }
};

// NEW: Create elder login credentials
const createElderLogin = async (req, res) => {
  try {
    const { elderId } = req.params;
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        message: 'Username and password are required' 
      });
    }

    // Verify elder belongs to the requesting user
    const elder = await Elder.findOne({
      where: { id: elderId },
      include: [{
        model: Subscription,
        as: 'subscription',
        where: { userId: req.user.id }
      }]
    });

    if (!elder) {
      return res.status(404).json({ message: 'Elder not found' });
    }

    if (elder.hasLoginAccess) {
      return res.status(400).json({ 
        message: 'Elder already has login access' 
      });
    }

    const result = await ElderAuthService.createElderLogin(elderId, username, password);

    res.json({
      message: 'Elder login created successfully',
      elder: result.elder,
      credentials: {
        username: username,
        loginUrl: '/elder/login'
      }
    });
  } catch (error) {
    console.error('Create elder login error:', error);
    res.status(500).json({ 
      message: error.message || 'Internal server error' 
    });
  }
};

// NEW: Toggle elder access
const toggleElderAccess = async (req, res) => {
  try {
    const { elderId } = req.params;
    const { hasAccess } = req.body;

    // Verify elder belongs to the requesting user
    const elder = await Elder.findOne({
      where: { id: elderId },
      include: [{
        model: Subscription,
        as: 'subscription',
        where: { userId: req.user.id }
      }]
    });

    if (!elder) {
      return res.status(404).json({ message: 'Elder not found' });
    }

    const updatedElder = await ElderAuthService.toggleElderAccess(elderId, hasAccess);

    res.json({
      message: `Elder access ${hasAccess ? 'enabled' : 'disabled'} successfully`,
      elder: updatedElder
    });
  } catch (error) {
    console.error('Toggle elder access error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// NEW: Get elder profile (for elder dashboard)
const getElderProfile = async (req, res) => {
  try {
    // Get elder associated with the logged-in user
    const elder = await ElderAuthService.getElderByUserId(req.user.id);

    if (!elder) {
      return res.status(404).json({ message: 'Elder profile not found' });
    }

    res.json({ elder });
  } catch (error) {
    console.error('Get elder profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getElders = async (req, res) => {
  try {
    const elders = await Elder.findAll({
      include: [
        {
          model: Subscription,
          as: 'subscription',
          where: { userId: req.user.id },
          attributes: ['id', 'plan', 'status', 'startDate', 'endDate']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'isActive'],
          required: false
        }
      ]
    });

    res.json({ elders });
  } catch (error) {
    console.error('Get elders error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getElderById = async (req, res) => {
  try {
    const { elderId } = req.params;

    const elder = await Elder.findOne({
      where: { id: elderId },
      include: [
        {
          model: Subscription,
          as: 'subscription',
          where: { userId: req.user.id }
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'isActive'],
          required: false
        }
      ]
    });

    if (!elder) {
      return res.status(404).json({ message: 'Elder not found' });
    }

    res.json({ elder });
  } catch (error) {
    console.error('Get elder error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const updateElder = async (req, res) => {
  try {
    const { elderId } = req.params;
    const updateData = req.body;

    const elder = await Elder.findOne({
      where: { id: elderId },
      include: [
        {
          model: Subscription,
          as: 'subscription',
          where: { userId: req.user.id }
        }
      ]
    });

    if (!elder) {
      return res.status(404).json({ message: 'Elder not found' });
    }

    if (req.file) {
      updateData.photo = req.file.filename;
    }

    await elder.update(updateData);

    res.json({
      message: 'Elder updated successfully',
      elder
    });
  } catch (error) {
    console.error('Update elder error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// NEW: Add elder with authentication
const addElderWithAuth = async (req, res) => {
  try {
    console.log('=== ADD ELDER WITH AUTH CONTROLLER ===');
    console.log('📋 Request body:', req.body);
    console.log('📷 Request file:', req.file);
    console.log('🔑 Content-Type:', req.headers['content-type']);
    
    const elderData = { ...req.body };
    
    // CRITICAL: Ensure subscriptionId is present
    if (!elderData.subscriptionId) {
      console.error('❌ Missing subscriptionId in request');
      return res.status(400).json({ 
        message: 'Subscription ID is required',
        received: elderData 
      });
    }
    
    console.log('✅ SubscriptionId found:', elderData.subscriptionId);
    
    // Verify subscription belongs to user
    const subscription = await Subscription.findOne({
      where: { 
        id: elderData.subscriptionId,
        userId: req.user.id 
      }
    });
    
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found or access denied' });
    }
    
    // Handle photo upload if present
    if (req.file) {
      elderData.photo = req.file.filename;
      console.log('📸 Photo saved as:', req.file.filename);
    }
    
    // Extract authentication data
    const enableLogin = elderData.enableLogin === 'true' || elderData.enableLogin === true;
    const email = elderData.email;
    const password = elderData.password;
    
    // Remove auth fields from elder data
    delete elderData.enableLogin;
    delete elderData.email;
    delete elderData.password;
    delete elderData.confirmPassword;
    
    console.log('🚀 Creating elder with data:', elderData);
    console.log('🔐 Login enabled:', enableLogin);
    
    // Create elder first
    const elder = await Elder.create(elderData);
    console.log('✅ Elder created successfully:', elder.id);
    
    let user = null;
    
    // Create user account if login is enabled
    if (enableLogin && email && password) {
      console.log('🔐 Creating user account for elder...');
      
      try {
        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          // If user creation fails, we should rollback the elder creation
          await elder.destroy();
          return res.status(400).json({ 
            message: 'Email already exists. Please choose a different email.' 
          });
        }
        
        // Create user account
        user = await User.create({
          firstName: elder.firstName,
          lastName: elder.lastName,
          email: email,
          password: password,
          phone: elder.phone,
          role: 'elder',
          isActive: true
        });
        
        // Link elder to user
        await elder.update({
          userId: user.id,
          username: email,
          hasLoginAccess: true
        });
        
        console.log('✅ User account created and linked:', user.id);
        
      } catch (userError) {
        console.error('❌ User creation failed:', userError);
        // Rollback elder creation
        await elder.destroy();
        
        const message = userError.name === 'SequelizeUniqueConstraintError' 
          ? 'Email already exists' 
          : 'Failed to create login credentials';
          
        return res.status(400).json({ message });
      }
    }
    
    // Fetch complete elder data with associations
    const completeElder = await Elder.findByPk(elder.id, {
      include: [
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'plan', 'status', 'startDate', 'endDate']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'role', 'isActive'],
          required: false
        }
      ]
    });
    
    res.status(201).json({
      message: enableLogin 
        ? 'Elder added successfully with login access' 
        : 'Elder added successfully',
      elder: completeElder,
      loginCreated: enableLogin,
      credentials: enableLogin ? {
        email: email,
        loginUrl: '/elder/login'
      } : null
    });
    
  } catch (error) {
    console.error('❌ Add elder with auth error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// NEW: Get all elders for staff (health monitoring, care management, etc.)
const getAllEldersForStaff = async (req, res) => {
  try {
    console.log('🏥 Staff user requesting all elders:', req.user.id);
    
    const elders = await Elder.findAll({
      include: [
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'plan', 'status', 'startDate', 'endDate'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email']
            }
          ]
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'email', 'isActive'],
          required: false
        }
      ],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    console.log(`✅ Found ${elders.length} elders for staff`);
    
    res.json({ 
      success: true,
      elders,
      total: elders.length,
      message: 'Elders retrieved successfully for staff'
    });
  } catch (error) {
    console.error('❌ Get all elders for staff error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
  }
};

module.exports = { 
  addElder, 
  getElders, 
  getElderById, 
  updateElder, 
  upload,
  createElderLogin,
  toggleElderAccess,
  getElderProfile,
  addElderWithAuth,
  getAllEldersForStaff // NEW: Export this
};