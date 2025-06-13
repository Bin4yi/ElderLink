const { Elder, Subscription } = require('../models');
const multer = require('multer');
const path = require('path');

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

const getElders = async (req, res) => {
  try {
    const elders = await Elder.findAll({
      include: [
        {
          model: Subscription,
          as: 'subscription',
          where: { userId: req.user.id },
          attributes: ['id', 'plan', 'status', 'startDate', 'endDate']
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

module.exports = { 
  addElder, 
  getElders, 
  getElderById, 
  updateElder, 
  upload 
};