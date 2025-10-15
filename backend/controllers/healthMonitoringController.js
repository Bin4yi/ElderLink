// backend/controllers/healthMonitoringController.js
const { HealthMonitoring, Elder, User } = require('../models');
const { Op } = require('sequelize');
const { checkHealthVitals } = require('./healthAlertController');

// Get all health monitoring records (for staff) or user's own records (for elder)
const getAllHealthMonitoring = async (req, res) => {
  try {
    const { page = 1, limit = 10, elderId, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = {};
    
    // If user is an elder, only show their own records
    if (req.user.role === 'elder') {
      // Find the elder record associated with this user by userId
      const elder = await Elder.findOne({ where: { userId: req.user.id } });
      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Elder profile not found'
        });
      }
      whereClause.elderId = elder.id;
    } else if (req.user.role === 'staff' && elderId) {
      // Staff can filter by specific elder
      whereClause.elderId = elderId;
    }
    
    // Add date filtering if provided
    if (startDate && endDate) {
      whereClause.monitoringDate = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const healthRecords = await HealthMonitoring.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ],
      order: [['monitoringDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: healthRecords.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(healthRecords.count / limit),
        totalRecords: healthRecords.count,
        hasNext: page * limit < healthRecords.count,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ Get all health monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health monitoring records',
      error: error.message
    });
  }
};

// Get today's health monitoring records
const getTodayHealthMonitoring = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let whereClause = {
      monitoringDate: {
        [Op.gte]: today,
        [Op.lt]: tomorrow
      }
    };

    // If user is an elder, only show their own records
    if (req.user.role === 'elder') {
      const elder = await Elder.findOne({ where: { userId: req.user.id } });
      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Elder profile not found'
        });
      }
      whereClause.elderId = elder.id;
    }

    const healthRecords = await HealthMonitoring.findAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });

    res.json({
      success: true,
      data: healthRecords
    });

  } catch (error) {
    console.error('❌ Get today\'s health monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s health monitoring records',
      error: error.message
    });
  }
};

// Get health monitoring record by ID
const getHealthMonitoringById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let whereClause = { id };

    // If user is an elder, only allow access to their own records
    if (req.user.role === 'elder') {
      const elder = await Elder.findOne({ where: { userId: req.user.id } });
      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Elder profile not found'
        });
      }
      whereClause.elderId = elder.id;
    }

    const healthRecord = await HealthMonitoring.findOne({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ]
    });

    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health monitoring record not found'
      });
    }

    res.json({
      success: true,
      data: healthRecord
    });

  } catch (error) {
    console.error('❌ Get health monitoring by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health monitoring record',
      error: error.message
    });
  }
};

// Helper function to convert empty strings to null for numeric fields
const sanitizeNumericField = (value) => {
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
};

// Create health monitoring record (staff only)
const createHealthMonitoring = async (req, res) => {
  try {
    const {
      elderId,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      heartRate,
      temperature,
      weight,
      bloodSugar,
      oxygenSaturation,
      sleepHours,
      notes,
      symptoms,
      medications
    } = req.body;

    // Validate required fields
    if (!elderId) {
      return res.status(400).json({
        success: false,
        message: 'Elder ID is required'
      });
    }

    // Check if elder exists
    const elder = await Elder.findByPk(elderId);
    if (!elder) {
      return res.status(404).json({
        success: false,
        message: 'Elder not found'
      });
    }

    // Sanitize numeric fields
    const healthRecord = await HealthMonitoring.create({
      elderId,
      bloodPressureSystolic: sanitizeNumericField(bloodPressureSystolic),
      bloodPressureDiastolic: sanitizeNumericField(bloodPressureDiastolic),
      heartRate: sanitizeNumericField(heartRate),
      temperature: sanitizeNumericField(temperature),
      weight: sanitizeNumericField(weight),
      bloodSugar: sanitizeNumericField(bloodSugar),
      oxygenSaturation: sanitizeNumericField(oxygenSaturation),
      sleepHours: sanitizeNumericField(sleepHours),
      notes,
      symptoms,
      medications,
      recordedBy: req.user.id,
      monitoringDate: new Date()
    });

    const createdRecord = await HealthMonitoring.findByPk(healthRecord.id, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ]
    });

    // Check for health alerts after creating the record
    const io = req.app.get('io');
    if (io) {
      await checkHealthVitals(createdRecord, io);
    }

    res.status(201).json({
      success: true,
      message: 'Health monitoring record created successfully',
      data: createdRecord
    });

  } catch (error) {
    console.error('❌ Create health monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create health monitoring record',
      error: error.message
    });
  }
};

// Update health monitoring record (staff only)
const updateHealthMonitoring = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const healthRecord = await HealthMonitoring.findByPk(id);
    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health monitoring record not found'
      });
    }

    // Sanitize numeric fields in update data
    const sanitizedData = {
      ...updateData,
      bloodPressureSystolic: updateData.bloodPressureSystolic !== undefined 
        ? sanitizeNumericField(updateData.bloodPressureSystolic) 
        : updateData.bloodPressureSystolic,
      bloodPressureDiastolic: updateData.bloodPressureDiastolic !== undefined 
        ? sanitizeNumericField(updateData.bloodPressureDiastolic) 
        : updateData.bloodPressureDiastolic,
      heartRate: updateData.heartRate !== undefined 
        ? sanitizeNumericField(updateData.heartRate) 
        : updateData.heartRate,
      temperature: updateData.temperature !== undefined 
        ? sanitizeNumericField(updateData.temperature) 
        : updateData.temperature,
      weight: updateData.weight !== undefined 
        ? sanitizeNumericField(updateData.weight) 
        : updateData.weight,
      bloodSugar: updateData.bloodSugar !== undefined 
        ? sanitizeNumericField(updateData.bloodSugar) 
        : updateData.bloodSugar,
      oxygenSaturation: updateData.oxygenSaturation !== undefined 
        ? sanitizeNumericField(updateData.oxygenSaturation) 
        : updateData.oxygenSaturation,
      sleepHours: updateData.sleepHours !== undefined 
        ? sanitizeNumericField(updateData.sleepHours) 
        : updateData.sleepHours
    };

    await healthRecord.update(sanitizedData);

    const updatedRecord = await HealthMonitoring.findByPk(id, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'userId'],
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'email']
            }
          ]
        }
      ]
    });

    // Check for health alerts after updating the record
    const io = req.app.get('io');
    if (io) {
      await checkHealthVitals(updatedRecord, io);
    }

    res.json({
      success: true,
      message: 'Health monitoring record updated successfully',
      data: updatedRecord
    });

  } catch (error) {
    console.error('❌ Update health monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update health monitoring record',
      error: error.message
    });
  }
};

// Delete health monitoring record (staff only)
const deleteHealthMonitoring = async (req, res) => {
  try {
    const { id } = req.params;

    const healthRecord = await HealthMonitoring.findByPk(id);
    if (!healthRecord) {
      return res.status(404).json({
        success: false,
        message: 'Health monitoring record not found'
      });
    }

    await healthRecord.destroy();

    res.json({
      success: true,
      message: 'Health monitoring record deleted successfully'
    });

  } catch (error) {
    console.error('❌ Delete health monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete health monitoring record',
      error: error.message
    });
  }
};

// Get health monitoring statistics
const getHealthMonitoringStats = async (req, res) => {
  try {
    const { elderId, period = '7' } = req.query;
    const days = parseInt(period);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    let whereClause = {
      monitoringDate: {
        [Op.gte]: startDate
      }
    };

    // If user is an elder, only show their own stats
    if (req.user.role === 'elder') {
      const elder = await Elder.findOne({ where: { userId: req.user.id } });
      if (!elder) {
        return res.status(404).json({
          success: false,
          message: 'Elder profile not found'
        });
      }
      whereClause.elderId = elder.id;
    } else if (elderId) {
      whereClause.elderId = elderId;
    }

    const healthRecords = await HealthMonitoring.findAll({
      where: whereClause,
      order: [['monitoringDate', 'DESC']]
    });

    // Calculate statistics
    const stats = {
      totalRecords: healthRecords.length,
      averages: {},
      trends: {},
      latest: healthRecords[0] || null
    };

    if (healthRecords.length > 0) {
      // Calculate averages
      const totals = healthRecords.reduce((acc, record) => {
        if (record.bloodPressureSystolic) acc.systolic += record.bloodPressureSystolic;
        if (record.bloodPressureDiastolic) acc.diastolic += record.bloodPressureDiastolic;
        if (record.heartRate) acc.heartRate += record.heartRate;
        if (record.temperature) acc.temperature += record.temperature;
        if (record.weight) acc.weight += record.weight;
        if (record.bloodSugar) acc.bloodSugar += record.bloodSugar;
        if (record.oxygenSaturation) acc.oxygenSaturation += record.oxygenSaturation;
        return acc;
      }, {
        systolic: 0,
        diastolic: 0,
        heartRate: 0,
        temperature: 0,
        weight: 0,
        bloodSugar: 0,
        oxygenSaturation: 0
      });

      const count = healthRecords.length;
      stats.averages = {
        bloodPressure: `${Math.round(totals.systolic / count)}/${Math.round(totals.diastolic / count)}`,
        heartRate: Math.round(totals.heartRate / count),
        temperature: (totals.temperature / count).toFixed(1),
        weight: (totals.weight / count).toFixed(1),
        bloodSugar: Math.round(totals.bloodSugar / count),
        oxygenSaturation: Math.round(totals.oxygenSaturation / count)
      };
    }

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Get health monitoring stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch health monitoring statistics',
      error: error.message
    });
  }
};

module.exports = {
  getAllHealthMonitoring,
  getTodayHealthMonitoring,
  getHealthMonitoringById,
  createHealthMonitoring,
  updateHealthMonitoring,
  deleteHealthMonitoring,
  getHealthMonitoringStats
};