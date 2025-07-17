// backend/controllers/healthMonitoringController.js
const { HealthMonitoring, Elder, User, Subscription, StaffAssignment } = require('../models');
const { Op } = require('sequelize');

// Helper function to check if elder is assigned to staff
const isElderAssignedToStaff = async (elderId, staffId) => {
  try {
    const assignment = await StaffAssignment.findOne({
      where: {
        elderId: elderId,
        staffId: staffId,
        isActive: true
      }
    });
    return !!assignment;
  } catch (error) {
    console.error('Error checking elder assignment:', error);
    return false;
  }
};

// Get all health monitoring records - only for assigned elders
const getAllHealthRecords = async (req, res) => {
  try {
    const staffId = req.user.id;
    console.log('🔍 Getting all health monitoring records for staff:', staffId);
    
    // Get all elder IDs assigned to this staff member
    const assignments = await StaffAssignment.findAll({
      where: {
        staffId: staffId,
        isActive: true
      },
      attributes: ['elderId']
    });

    if (assignments.length === 0) {
      return res.json({
        success: true,
        data: [],
        total: 0,
        message: 'No elders assigned to this staff member'
      });
    }

    const elderIds = assignments.map(assignment => assignment.elderId);
    
    const allRecords = await HealthMonitoring.findAll({
      where: {
        elderId: elderIds
      },
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });

    console.log('✅ Found', allRecords.length, 'health monitoring records for assigned elders');

    res.json({
      success: true,
      data: allRecords,
      total: allRecords.length,
      message: 'Health monitoring records retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get all health monitoring records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health monitoring records',
      error: error.message
    });
  }
};

// Get today's health monitoring records - only for assigned elders
const getTodayRecords = async (req, res) => {
  try {
    const staffId = req.user.id;
    console.log('🔍 Getting today\'s health monitoring records for staff:', staffId);
    
    // Get all elder IDs assigned to this staff member
    const assignments = await StaffAssignment.findAll({
      where: {
        staffId: staffId,
        isActive: true
      },
      attributes: ['elderId']
    });

    if (assignments.length === 0) {
      return res.json({
        success: true,
        data: [],
        total: 0,
        message: 'No elders assigned to this staff member'
      });
    }

    const elderIds = assignments.map(assignment => assignment.elderId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayRecords = await HealthMonitoring.findAll({
      where: {
        elderId: elderIds,
        monitoringDate: {
          [Op.gte]: today,
          [Op.lt]: tomorrow
        }
      },
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });

    console.log('✅ Found', todayRecords.length, 'today\'s health monitoring records for assigned elders');

    res.json({
      success: true,
      data: todayRecords,
      total: todayRecords.length,
      message: 'Today\'s health monitoring records retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get today\'s health monitoring records error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get today\'s health monitoring records',
      error: error.message
    });
  }
};

// Get elder health history - only for assigned elders
const getElderHealthHistory = async (req, res) => {
  try {
    const { elderId } = req.params;
    const { days = 7 } = req.query;
    const staffId = req.user.id;
    
    console.log('🔍 Getting health history for elder:', elderId, 'for last', days, 'days');
    console.log('🔍 Request from staff:', staffId);
    
    // Check if elder is assigned to this staff member
    const isAssigned = await isElderAssignedToStaff(elderId, staffId);
    
    if (!isAssigned) {
      console.log('❌ Elder not assigned to this staff member');
      return res.status(403).json({
        success: false,
        message: 'You can only access health records for elders assigned to you'
      });
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    
    console.log('🔍 Start date for query:', startDate);
    
    const healthHistory = await HealthMonitoring.findAll({
      where: {
        elderId: elderId,
        monitoringDate: {
          [Op.gte]: startDate
        }
      },
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName'],
          required: false
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });

    console.log('✅ Found', healthHistory.length, 'health records for assigned elder');

    res.json({
      success: true,
      data: healthHistory,
      total: healthHistory.length,
      message: 'Elder health history retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Get elder health history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get elder health history',
      error: error.message
    });
  }
};

// Create health monitoring record - only for assigned elders
const createHealthRecord = async (req, res) => {
  try {
    console.log('🔍 Creating health monitoring record');
    console.log('📋 Request body:', req.body);
    
    const { elderId, ...healthData } = req.body;
    const staffId = req.user.id;
    
    if (!elderId) {
      return res.status(400).json({
        success: false,
        message: 'Elder ID is required'
      });
    }
    
    // Check if elder is assigned to this staff member
    const isAssigned = await isElderAssignedToStaff(elderId, staffId);
    
    if (!isAssigned) {
      console.log('❌ Elder not assigned to this staff member');
      return res.status(403).json({
        success: false,
        message: 'You can only create health records for elders assigned to you'
      });
    }
    
    const recordData = {
      ...healthData,
      elderId: elderId,
      staffId: staffId
    };
    
    const healthRecord = await HealthMonitoring.create(recordData);
    
    // Fetch the complete record with associations
    const completeRecord = await HealthMonitoring.findByPk(healthRecord.id, {
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    console.log('✅ Health monitoring record created:', healthRecord.id);
    
    res.status(201).json({
      success: true,
      data: completeRecord,
      message: 'Health monitoring record created successfully'
    });
  } catch (error) {
    console.error('❌ Create health monitoring record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create health monitoring record',
      error: error.message
    });
  }
};

// Update health monitoring record - only for assigned elders
const updateHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user.id;
    
    console.log('🔍 Updating health monitoring record:', id);
    
    const healthRecord = await HealthMonitoring.findByPk(id);
    
    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health monitoring record not found'
      });
    }
    
    // Check if elder is assigned to this staff member
    const isAssigned = await isElderAssignedToStaff(healthRecord.elderId, staffId);
    
    if (!isAssigned) {
      console.log('❌ Elder not assigned to this staff member');
      return res.status(403).json({
        success: false,
        message: 'You can only update health records for elders assigned to you'
      });
    }
    
    await healthRecord.update(req.body);
    
    // Fetch the updated record with associations
    const updatedRecord = await HealthMonitoring.findByPk(id, {
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });
    
    console.log('✅ Health monitoring record updated:', id);
    
    res.json({
      success: true,
      data: updatedRecord,
      message: 'Health monitoring record updated successfully'
    });
  } catch (error) {
    console.error('❌ Update health monitoring record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update health monitoring record',
      error: error.message
    });
  }
};

// Delete health monitoring record - only for assigned elders
const deleteHealthRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const staffId = req.user.id;
    
    console.log('🔍 Deleting health monitoring record:', id);
    
    const healthRecord = await HealthMonitoring.findByPk(id);
    
    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health monitoring record not found'
      });
    }
    
    // Check if elder is assigned to this staff member
    const isAssigned = await isElderAssignedToStaff(healthRecord.elderId, staffId);
    
    if (!isAssigned) {
      console.log('❌ Elder not assigned to this staff member');
      return res.status(403).json({
        success: false,
        message: 'You can only delete health records for elders assigned to you'
      });
    }
    
    await healthRecord.destroy();
    
    console.log('✅ Health monitoring record deleted:', id);
    
    res.json({
      success: true,
      message: 'Health monitoring record deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete health monitoring record error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete health monitoring record',
      error: error.message
    });
  }
};

module.exports = {
  getAllHealthRecords,
  getTodayRecords,
  getElderHealthHistory,
  createHealthRecord,
  updateHealthRecord,
  deleteHealthRecord
};