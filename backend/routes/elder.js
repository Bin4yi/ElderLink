const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { 
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
  getAllEldersForHealthMonitoring // ✅ Add this import
} = require('../controllers/elderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateElder, validateElderWithAuth } = require('../middleware/validation');
const { Elder, User, Subscription } = require('../models');

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
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Elder routes are working',
    timestamp: new Date().toISOString()
  });
});

// Elder profile route (for elder users)
router.get('/profile', authenticate, authorize('elder'), async (req, res) => {
  try {
    console.log('🔍 Getting elder profile for user:', req.user.id);
    
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
});

// ✅ Add route for health monitoring (staff can see all elders for reports)
router.get('/for-monitoring', authenticate, authorize('staff'), getAllEldersForHealthMonitoring);

// Staff routes - Get all elders for health monitoring and care management
router.get('/staff/all', authenticate, authorize('staff'), getAllEldersForStaff);

// Staff routes - Get only assigned elders for care management
router.get('/staff/assigned', authenticate, authorize('staff'), getAssignedEldersForStaff);

// Update the GET /elders route
router.get('/', authenticate, authorize('family_member'), async (req, res) => {
  try {
    console.log('🔍 Getting elders for family member:', req.user.id);
    
    const elders = await Elder.findAll({
      include: [{
        model: Subscription,
        as: 'subscription',
        where: {
          userId: req.user.id,
          status: 'active'
        },
        attributes: [
          'id', 
          'status'
          // ✅ Removed planType - it doesn't exist in database
        ]
      }],
      attributes: [
        'id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 
        'address', 'phone', 'emergencyContact', 'photo', 'createdAt', 'updatedAt'
      ],
      order: [['createdAt', 'DESC']]
    });

    console.log('✅ Found elders:', elders.length);

    res.json({
      success: true,
      elders: elders,
      count: elders.length
    });
  } catch (error) {
    console.error('❌ Get elders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving elders',
      error: error.message
    });
  }
});

// Get elder by ID
router.get('/:id', authenticate, authorize('family_member'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 Getting elder by ID:', id, 'for user:', req.user.id);

    const elder = await Elder.findOne({
      where: { 
        id: id,
        userId: req.user.id
      },
      attributes: [
        'id', 'firstName', 'lastName', 'dateOfBirth', 'gender', 
        'address', 'phone', 'emergencyContact', 'medicalConditions', 
        'medications', 'allergies', 'photo', 'createdAt', 'updatedAt'
      ]
    });

    if (!elder) {
      return res.status(404).json({
        success: false,
        message: 'Elder not found or you do not have permission to view this elder'
      });
    }

    console.log('✅ Found elder:', elder.firstName, elder.lastName);

    res.json({
      success: true,
      elder: elder,
      message: 'Elder retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get elder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve elder',
      error: error.message
    });
  }
});

// Create new elder
router.post('/', authenticate, authorize('family_member'), upload.single('photo'), async (req, res) => {
  try {
    console.log('🔄 Creating new elder...');
    
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      address,
      phone,
      emergencyContact,
      medicalConditions,
      medications,
      allergies,
      subscriptionId
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !subscriptionId) {
      return res.status(400).json({
        success: false,
        message: 'First name, last name, and subscription ID are required'
      });
    }

    // Verify subscription belongs to user
    const subscription = await Subscription.findOne({
      where: {
        id: subscriptionId,
        userId: req.user.id
      }
    });

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found or you do not have permission to use this subscription'
      });
    }

    // Create elder
    const elderData = {
      firstName,
      lastName,
      dateOfBirth: dateOfBirth || null,
      gender: gender || null,
      address: address || null,
      phone: phone || null,
      emergencyContact: emergencyContact || null,
      medicalConditions: medicalConditions || null,
      medications: medications || null,
      allergies: allergies || null,
      photo: req.file ? req.file.filename : null,
      userId: req.user.id,
      subscriptionId: subscriptionId
    };

    const elder = await Elder.create(elderData);

    console.log('✅ Elder created:', elder.id);

    res.status(201).json({
      success: true,
      elder: elder,
      message: 'Elder created successfully'
    });
  } catch (error) {
    console.error('❌ Create elder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create elder',
      error: error.message
    });
  }
});

// Update elder
router.put('/:id', authenticate, authorize('family_member'), upload.single('photo'), async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔄 Updating elder:', id);

    const elder = await Elder.findOne({
      where: { 
        id: id,
        userId: req.user.id
      }
    });

    if (!elder) {
      return res.status(404).json({
        success: false,
        message: 'Elder not found or you do not have permission to update this elder'
      });
    }

    // Update data
    const updateData = { ...req.body };
    if (req.file) {
      updateData.photo = req.file.filename;
    }

    await elder.update(updateData);

    console.log('✅ Elder updated:', elder.id);

    res.json({
      success: true,
      elder: elder,
      message: 'Elder updated successfully'
    });
  } catch (error) {
    console.error('❌ Update elder error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update elder',
      error: error.message
    });
  }
});

// Create elder with authentication
router.post(
  '/with-auth',
  authenticate,
  authorize('family_member'),
  upload.single('photo'),        // <-- MUST come BEFORE validateElderWithAuth
  validateElderWithAuth,
  addElderWithAuth
);

// Create elder login
router.post('/:id/create-login', authenticate, authorize('family_member'), createElderLogin);

// Toggle elder access
router.post('/:id/toggle-access', authenticate, authorize('family_member'), toggleElderAccess);

module.exports = router;