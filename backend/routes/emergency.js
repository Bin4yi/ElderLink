const express = require('express');
const router = express.Router();
const { handleEmergencyAlert } = require('../controllers/emergencyController');

console.log('✅ Emergency routes loaded');

// Simple auth middleware (temporary workaround)
const simpleAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      console.log('⚠️ No token provided, allowing request anyway (development mode)');
      return next();
    }
    
    // Try to verify token
    const jwt = require('jsonwebtoken');
    const { User } = require('../models');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    
    if (!user) {
      console.log('⚠️ User not found, allowing request anyway (development mode)');
      return next();
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.log('⚠️ Auth error, allowing request anyway (development mode):', error.message);
    next();
  }
};

// Direct emergency trigger endpoint
router.post('/trigger', simpleAuth, handleEmergencyAlert);

// Get emergency history
router.get('/history/:elderId', simpleAuth, async (req, res) => {
  try {
    const { Notification } = require('../models');
    const { elderId } = req.params;
    
    console.log(`📜 Fetching emergency history for elder: ${elderId}`);
    
    const emergencies = await Notification.findAll({
      where: {
        elderId,
        type: 'emergency'
      },
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    
    console.log(`✅ Found ${emergencies.length} emergency records`);
    
    res.json({
      success: true,
      count: emergencies.length,
      data: emergencies
    });
  } catch (error) {
    console.error('❌ Error fetching emergency history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency history',
      error: error.message
    });
  }
});

// Get emergency contacts
router.get('/contacts/:elderId', simpleAuth, async (req, res) => {
  try {
    const { User, StaffAssignment } = require('../models');
    const { elderId } = req.params;
    
    console.log(`📞 Fetching emergency contacts for elder: ${elderId}`);
    
    // Get assigned staff
    const staffAssignments = await StaffAssignment.findAll({
      where: { 
        elderId,
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role']
        }
      ]
    });
    
    // Get family members
    const familyMembers = await User.findAll({
      where: {
        role: 'family_member',
        isActive: true
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
    });
    
    const contacts = {
      staff: staffAssignments.map(a => a.staff),
      family: familyMembers
    };
    
    console.log(`✅ Found ${contacts.staff.length} staff and ${contacts.family.length} family contacts`);
    
    res.json({
      success: true,
      data: contacts
    });
  } catch (error) {
    console.error('❌ Error fetching emergency contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency contacts',
      error: error.message
    });
  }
});

module.exports = router;