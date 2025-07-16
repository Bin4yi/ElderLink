// backend/controllers/healthMonitoringController.js
const { HealthMonitoring, HealthAlert, Elder, User } = require('../models');
const { Op } = require('sequelize');

// Get all health monitoring records for staff
const getHealthMonitorings = async (req, res) => {
  try {
    const { 
      status, 
      elderId, 
      date, 
      page = 1, 
      limit = 10 
    } = req.query;

    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (elderId) {
      where.elderId = elderId;
    }
    
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      
      where.monitoringDate = {
        [Op.gte]: startDate,
        [Op.lt]: endDate
      };
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await HealthMonitoring.findAndCountAll({
      where,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'photo', 'dateOfBirth', 'gender']
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['monitoringDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      message: 'Health monitoring records retrieved successfully',
      data: {
        healthMonitorings: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          pages: Math.ceil(count / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get health monitorings error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get today's health monitoring schedule
const getTodaysSchedule = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const healthMonitorings = await HealthMonitoring.findAll({
      where: {
        monitoringDate: {
          [Op.gte]: startOfDay,
          [Op.lte]: endOfDay
        }
      },
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'photo', 'dateOfBirth', 'gender']
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      order: [['monitoringDate', 'ASC']]
    });

    res.json({
      success: true,
      message: 'Today\'s health monitoring schedule retrieved successfully',
      data: {
        schedule: healthMonitorings
      }
    });
  } catch (error) {
    console.error('Get today\'s schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create health monitoring record
const createHealthMonitoring = async (req, res) => {
  try {
    const {
      elderId,
      monitoringDate,
      heartRate,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      temperature,
      weight,
      sleepHours,
      oxygenSaturation,
      notes
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

    // Determine alert level based on vitals
    let alertLevel = 'normal';
    if (heartRate && (heartRate < 60 || heartRate > 100)) {
      alertLevel = 'warning';
    }
    if (bloodPressureSystolic && (bloodPressureSystolic > 140 || bloodPressureSystolic < 90)) {
      alertLevel = 'warning';
    }
    if (heartRate && (heartRate < 50 || heartRate > 120)) {
      alertLevel = 'critical';
    }
    if (bloodPressureSystolic && (bloodPressureSystolic > 160 || bloodPressureSystolic < 80)) {
      alertLevel = 'critical';
    }

    const healthMonitoring = await HealthMonitoring.create({
      elderId,
      staffId: req.user.id,
      monitoringDate: monitoringDate || new Date(),
      heartRate,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      temperature,
      weight,
      sleepHours,
      oxygenSaturation,
      notes,
      alertLevel,
      status: 'scheduled'
    });

    // Create alert if vitals are abnormal
    if (alertLevel !== 'normal') {
      await HealthAlert.create({
        elderId,
        healthMonitoringId: healthMonitoring.id,
        alertType: 'vital_abnormal',
        severity: alertLevel === 'critical' ? 'critical' : 'medium',
        title: 'Abnormal Vital Signs Detected',
        description: `Abnormal vital signs detected for ${elder.firstName} ${elder.lastName}`,
        vitals: {
          heartRate,
          bloodPressureSystolic,
          bloodPressureDiastolic,
          temperature,
          oxygenSaturation
        }
      });
    }

    const createdRecord = await HealthMonitoring.findByPk(healthMonitoring.id, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'photo']
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Health monitoring record created successfully',
      data: {
        healthMonitoring: createdRecord
      }
    });
  } catch (error) {
    console.error('Create health monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update health monitoring record
const updateHealthMonitoring = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      heartRate,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      temperature,
      weight,
      sleepHours,
      oxygenSaturation,
      notes,
      status
    } = req.body;

    const healthMonitoring = await HealthMonitoring.findByPk(id);
    if (!healthMonitoring) {
      return res.status(404).json({
        success: false,
        message: 'Health monitoring record not found'
      });
    }

    // Determine alert level based on vitals
    let alertLevel = 'normal';
    if (heartRate && (heartRate < 60 || heartRate > 100)) {
      alertLevel = 'warning';
    }
    if (bloodPressureSystolic && (bloodPressureSystolic > 140 || bloodPressureSystolic < 90)) {
      alertLevel = 'warning';
    }
    if (heartRate && (heartRate < 50 || heartRate > 120)) {
      alertLevel = 'critical';
    }
    if (bloodPressureSystolic && (bloodPressureSystolic > 160 || bloodPressureSystolic < 80)) {
      alertLevel = 'critical';
    }

    const updateData = {
      heartRate,
      bloodPressureSystolic,
      bloodPressureDiastolic,
      temperature,
      weight,
      sleepHours,
      oxygenSaturation,
      notes,
      alertLevel,
      status
    };

    // Set completion time if status is completed
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await healthMonitoring.update(updateData);

    const updatedRecord = await HealthMonitoring.findByPk(id, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'photo']
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Health monitoring record updated successfully',
      data: {
        healthMonitoring: updatedRecord
      }
    });
  } catch (error) {
    console.error('Update health monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get health monitoring by ID
const getHealthMonitoringById = async (req, res) => {
  try {
    const { id } = req.params;

    const healthMonitoring = await HealthMonitoring.findByPk(id, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'photo', 'dateOfBirth', 'gender']
        },
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ]
    });

    if (!healthMonitoring) {
      return res.status(404).json({
        success: false,
        message: 'Health monitoring record not found'
      });
    }

    res.json({
      success: true,
      message: 'Health monitoring record retrieved successfully',
      data: {
        healthMonitoring
      }
    });
  } catch (error) {
    console.error('Get health monitoring by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Delete health monitoring record
const deleteHealthMonitoring = async (req, res) => {
  try {
    const { id } = req.params;

    const healthMonitoring = await HealthMonitoring.findByPk(id);
    if (!healthMonitoring) {
      return res.status(404).json({
        success: false,
        message: 'Health monitoring record not found'
      });
    }

    await healthMonitoring.destroy();

    res.json({
      success: true,
      message: 'Health monitoring record deleted successfully'
    });
  } catch (error) {
    console.error('Delete health monitoring error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get elder's health history
const getElderHealthHistory = async (req, res) => {
  try {
    const { elderId } = req.params;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const healthHistory = await HealthMonitoring.findAll({
      where: {
        elderId,
        monitoringDate: {
          [Op.gte]: startDate
        }
      },
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName']
        }
      ],
      order: [['monitoringDate', 'DESC']]
    });

    res.json({
      success: true,
      message: 'Elder health history retrieved successfully',
      data: {
        healthHistory
      }
    });
  } catch (error) {
    console.error('Get elder health history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getHealthMonitorings,
  getTodaysSchedule,
  createHealthMonitoring,
  updateHealthMonitoring,
  getHealthMonitoringById,
  deleteHealthMonitoring,
  getElderHealthHistory
};