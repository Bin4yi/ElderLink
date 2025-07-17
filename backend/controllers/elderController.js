const { Elder, User, Subscription, StaffAssignment } = require('../models');
const ElderAuthService = require('../services/elderAuthService');
const { Op } = require('sequelize');

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

const getElders = async (req, res) => {
  try {
    console.log('🔍 Getting elders for user:', req.user.id);
    
    // Get all subscriptions for this user
    const subscriptions = await Subscription.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Elder,
          as: 'elder',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email', 'isActive'],
              required: false
            }
          ]
        }
      ]
    });

    console.log('Found subscriptions:', subscriptions.length);

    // Extract elders from subscriptions
    const elders = subscriptions
      .filter(sub => sub.elder)
      .map(sub => sub.elder);

    console.log('✅ Found', elders.length, 'elders');

    res.json({ 
      success: true,
      elders,
      count: elders.length,
      message: 'Elders retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get elders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Internal server error' 
    });
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

    // Use the elder auth service to create login
    const result = await ElderAuthService.createElderLogin(elderId, username, password);

    res.json({
      message: 'Login credentials created successfully',
      elder: result.elder,
      loginCreated: true
    });
  } catch (error) {
    console.error('Create elder login error:', error);
    
    if (error.message === 'Username already exists') {
      return res.status(400).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Internal server error' });
  }
};

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

    // Use the elder auth service to toggle access
    const result = await ElderAuthService.toggleElderAccess(elderId, hasAccess);

    res.json({
      message: hasAccess ? 'Access enabled' : 'Access disabled',
      elder: result.elder
    });
  } catch (error) {
    console.error('Toggle elder access error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getElderProfile = async (req, res) => {
  try {
    console.log('🔍 Getting elder profile for user:', req.user.id);
    
    // Find the elder record associated with this user
    const elder = await Elder.findOne({
      where: { userId: req.user.id },
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

    if (!elder) {
      console.log('❌ Elder profile not found for user:', req.user.id);
      return res.status(404).json({
        success: false,
        message: 'Elder profile not found'
      });
    }

    console.log('✅ Found elder profile:', elder.id);

    res.json({
      success: true,
      elder: elder,
      message: 'Elder profile retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get elder profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get elder profile',
      error: error.message
    });
  }
};

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

// ✅ For health monitoring - staff can see all elders for reports
const getAllEldersForHealthMonitoring = async (req, res) => {
  try {
    const staffId = req.user.id;
    console.log('🏥 Staff requesting all elders for health monitoring:', staffId);
    
    // Get all elders (for health monitoring purposes - staff can view all elders for reports)
    const elders = await Elder.findAll({
      attributes: [
        'id', 
        'firstName', 
        'lastName', 
        'dateOfBirth', 
        'gender', 
        'phone', 
        'address',
        'emergencyContact',
        'medicalHistory',        // ✅ Fixed: use medicalHistory instead of medicalConditions
        'currentMedications',    // ✅ Fixed: use currentMedications instead of medications
        'allergies',
        'chronicConditions',     // ✅ Added: chronic conditions
        'bloodType',            // ✅ Added: blood type
        'doctorName',           // ✅ Added: doctor information
        'doctorPhone',
        'insuranceProvider',
        'insuranceNumber',
        'createdAt'
      ],
      include: [
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'plan', 'status', 'startDate', 'endDate'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
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

    console.log(`✅ Found ${elders.length} elders for health monitoring`);
    
    res.json({
      success: true,
      elders: elders,
      total: elders.length,
      message: 'Elders retrieved successfully for health monitoring'
    });
  } catch (error) {
    console.error('❌ Get all elders for health monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ✅ For care management - staff can only see assigned elders
const getAssignedEldersForStaff = async (req, res) => {
  try {
    const staffId = req.user.id;
    console.log('🏥 Staff requesting assigned elders:', staffId);
    
    // Get all active assignments for this staff member
    const assignments = await StaffAssignment.findAll({
      where: {
        staffId: staffId,
        isActive: true
      },
      attributes: ['elderId', 'assignedDate']
    });

    console.log('📋 Found assignments:', assignments.length);

    if (assignments.length === 0) {
      return res.json({
        success: true,
        elders: [],
        total: 0,
        message: 'No elders assigned to this staff member'
      });
    }

    // Get elder IDs from assignments
    const elderIds = assignments.map(assignment => assignment.elderId);
    console.log('👥 Elder IDs to fetch:', elderIds);

    // Get the assigned elders
    const elders = await Elder.findAll({
      where: {
        id: {
          [Op.in]: elderIds
        }
      },
      attributes: [
        'id', 
        'firstName', 
        'lastName', 
        'dateOfBirth', 
        'gender', 
        'phone', 
        'address',
        'emergencyContact',
        'medicalHistory',        // ✅ Fixed: use medicalHistory instead of medicalConditions
        'currentMedications',    // ✅ Fixed: use currentMedications instead of medications
        'allergies',
        'chronicConditions',     // ✅ Added: chronic conditions
        'bloodType',            // ✅ Added: blood type
        'doctorName',           // ✅ Added: doctor information
        'doctorPhone',
        'insuranceProvider',
        'insuranceNumber',
        'createdAt'
      ],
      include: [
        {
          model: Subscription,
          as: 'subscription',
          attributes: ['id', 'plan', 'status', 'startDate', 'endDate'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
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

    // Add assignment date to each elder
    const eldersWithAssignmentInfo = elders.map(elder => {
      const assignment = assignments.find(a => a.elderId === elder.id);
      return {
        ...elder.toJSON(),
        assignedDate: assignment ? assignment.assignedDate : null
      };
    });

    console.log(`✅ Found ${eldersWithAssignmentInfo.length} assigned elders for staff`);
    
    res.json({
      success: true,
      elders: eldersWithAssignmentInfo,
      total: eldersWithAssignmentInfo.length,
      message: 'Assigned elders retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get assigned elders for staff error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// ✅ Alias for backward compatibility - use assigned elders for general staff operations
const getAllEldersForStaff = async (req, res) => {
  // For general staff operations, use assigned elders
  return await getAssignedEldersForStaff(req, res);
};

module.exports = {
  addElder,
  getElders,
  getElderById,
  updateElder,
  createElderLogin,
  toggleElderAccess,
  getElderProfile,
  addElderWithAuth,
  getAllEldersForStaff,
  getAssignedEldersForStaff,
  getAllEldersForHealthMonitoring
};