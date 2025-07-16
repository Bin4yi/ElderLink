const express = require('express');
const router = express.Router();
const { 
  addElder, 
  getElders, 
  getElderById, 
  updateElder, 
  upload,
  createElderLogin,
  toggleElderAccess,
  getElderProfile,
  addElderWithAuth, // NEW: Import this
  getAllEldersForStaff // NEW: Import staff route
} = require('../controllers/elderController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateElder, validateElderWithAuth } = require('../middleware/validation');
const { Elder, User, Subscription } = require('../models');

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Elder routes working',
    timestamp: new Date().toISOString()
  });
});

// Family member routes
router.post('/', authenticate, authorize('family_member'), upload.single('photo'), validateElder, addElder);
router.post('/with-auth', authenticate, authorize('family_member'), upload.single('photo'), validateElderWithAuth, addElderWithAuth);
router.get('/', authenticate, authorize('family_member'), getElders);
router.get('/:elderId', authenticate, authorize('family_member'), getElderById);
router.put('/:elderId', authenticate, authorize('family_member'), upload.single('photo'), updateElder);

// Elder authentication management routes
router.post('/:elderId/create-login', authenticate, authorize('family_member'), createElderLogin);
router.put('/:elderId/toggle-access', authenticate, authorize('family_member'), toggleElderAccess);

// Get elder's own profile (for elder dashboard)
router.get('/profile/me', authenticate, authorize('elder'), async (req, res) => {
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
});

// Staff routes - Get all elders for health monitoring and care management
router.get('/staff/all', authenticate, authorize('staff'), getAllEldersForStaff);

module.exports = router;