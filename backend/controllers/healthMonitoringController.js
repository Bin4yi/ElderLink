// backend/controllers/healthMonitoringController.js
const { HealthMonitoring, Elder, User } = require('../models');

const createHealthMonitoring = async (req, res) => {
  try {
    console.log('📝 Creating health monitoring record:', req.body);
    
    const {
      elderId,
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

    // Validate numeric ranges
    const validationErrors = [];
    
    if (heartRate && (heartRate < 40 || heartRate > 200)) {
      validationErrors.push('Heart rate must be between 40 and 200 bpm');
    }
    
    if (bloodPressureSystolic && (bloodPressureSystolic < 70 || bloodPressureSystolic > 250)) {
      validationErrors.push('Systolic blood pressure must be between 70 and 250 mmHg');
    }
    
    if (bloodPressureDiastolic && (bloodPressureDiastolic < 40 || bloodPressureDiastolic > 150)) {
      validationErrors.push('Diastolic blood pressure must be between 40 and 150 mmHg');
    }
    
    if (temperature && (temperature < 95.0 || temperature > 110.0)) {
      validationErrors.push('Temperature must be between 95.0 and 110.0°F');
    }
    
    if (weight && (weight < 50.0 || weight > 500.0)) {
      validationErrors.push('Weight must be between 50.0 and 500.0 lbs');
    }
    
    if (sleepHours && (sleepHours < 0.0 || sleepHours > 24.0)) {
      validationErrors.push('Sleep hours must be between 0.0 and 24.0 hours');
    }
    
    if (oxygenSaturation && (oxygenSaturation < 70 || oxygenSaturation > 100)) {
      validationErrors.push('Oxygen saturation must be between 70 and 100%');
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
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

    // Create health monitoring record
    const healthMonitoring = await HealthMonitoring.create({
      elderId,
      monitoringDate: new Date(),
      heartRate: heartRate ? parseInt(heartRate) : null,
      bloodPressureSystolic: bloodPressureSystolic ? parseInt(bloodPressureSystolic) : null,
      bloodPressureDiastolic: bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : null,
      temperature: temperature ? parseFloat(temperature) : null,
      weight: weight ? parseFloat(weight) : null,
      sleepHours: sleepHours ? parseFloat(sleepHours) : null,
      oxygenSaturation: oxygenSaturation ? parseInt(oxygenSaturation) : null,
      notes,
      alertLevel: calculateAlertLevel({
        heartRate: heartRate ? parseInt(heartRate) : null,
        bloodPressureSystolic: bloodPressureSystolic ? parseInt(bloodPressureSystolic) : null,
        bloodPressureDiastolic: bloodPressureDiastolic ? parseInt(bloodPressureDiastolic) : null,
        temperature: temperature ? parseFloat(temperature) : null,
        oxygenSaturation: oxygenSaturation ? parseInt(oxygenSaturation) : null
      }),
      completedAt: new Date(),
      staffId: req.user.id
    });

    // Fetch the created record with elder details
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

    console.log('✅ Health monitoring record created:', createdRecord.id);

    res.status(201).json({
      success: true,
      message: 'Health monitoring record created successfully',
      data: {
        healthMonitoring: createdRecord
      }
    });

  } catch (error) {
    console.error('❌ Error creating health monitoring record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create health monitoring record',
      error: error.message
    });
  }
};

// Helper function to calculate alert level
const calculateAlertLevel = (vitals) => {
  const {
    heartRate,
    bloodPressureSystolic,
    bloodPressureDiastolic,
    temperature,
    oxygenSaturation
  } = vitals;

  // Critical conditions
  if (
    (heartRate && (heartRate < 50 || heartRate > 120)) ||
    (bloodPressureSystolic && (bloodPressureSystolic < 90 || bloodPressureSystolic > 180)) ||
    (bloodPressureDiastolic && (bloodPressureDiastolic < 60 || bloodPressureDiastolic > 110)) ||
    (temperature && (temperature < 96 || temperature > 101)) ||
    (oxygenSaturation && oxygenSaturation < 90)
  ) {
    return 'critical';
  }

  // Warning conditions
  if (
    (heartRate && (heartRate < 60 || heartRate > 100)) ||
    (bloodPressureSystolic && (bloodPressureSystolic < 100 || bloodPressureSystolic > 140)) ||
    (bloodPressureDiastolic && (bloodPressureDiastolic < 70 || bloodPressureDiastolic > 90)) ||
    (temperature && (temperature < 97 || temperature > 99.5)) ||
    (oxygenSaturation && oxygenSaturation < 95)
  ) {
    return 'warning';
  }

  return 'normal';
};

const getAllHealthMonitoring = async (req, res) => {
  try {
    console.log('🔍 Getting all health monitoring records');
    
    const healthMonitoring = await HealthMonitoring.findAll({
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
      ],
      order: [['monitoringDate', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        healthMonitoring
      }
    });

  } catch (error) {
    console.error('❌ Error getting health monitoring records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health monitoring records',
      error: error.message
    });
  }
};

const getTodaysSchedule = async (req, res) => {
  try {
    console.log('🔍 Getting today\'s health monitoring schedule');
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const schedule = await HealthMonitoring.findAll({
      where: {
        monitoringDate: {
          [require('sequelize').Op.gte]: startOfDay,
          [require('sequelize').Op.lt]: endOfDay
        }
      },
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
      ],
      order: [['monitoringDate', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        schedule
      }
    });

  } catch (error) {
    console.error('❌ Error getting today\'s schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get today\'s schedule',
      error: error.message
    });
  }
};

const getTodaysRecords = async (req, res) => {
  try {
    console.log('🔍 Getting today\'s health monitoring records');
    
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const records = await HealthMonitoring.findAll({
      where: {
        monitoringDate: {
          [require('sequelize').Op.gte]: startOfDay,
          [require('sequelize').Op.lt]: endOfDay
        }
      },
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
      ],
      order: [['monitoringDate', 'DESC']]
    });

    console.log(`✅ Found ${records.length} records for today`);

    res.json({
      success: true,
      data: {
        records,
        count: records.length
      }
    });

  } catch (error) {
    console.error('❌ Error getting today\'s records:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get today\'s records',
      error: error.message
    });
  }
};

const getHealthMonitoringById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const healthMonitoring = await HealthMonitoring.findByPk(id, {
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

    if (!healthMonitoring) {
      return res.status(404).json({
        success: false,
        message: 'Health monitoring record not found'
      });
    }

    res.json({
      success: true,
      data: {
        healthMonitoring
      }
    });

  } catch (error) {
    console.error('❌ Error getting health monitoring record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get health monitoring record',
      error: error.message
    });
  }
};

const updateHealthMonitoring = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const healthMonitoring = await HealthMonitoring.findByPk(id);
    
    if (!healthMonitoring) {
      return res.status(404).json({
        success: false,
        message: 'Health monitoring record not found'
      });
    }

    // Calculate new alert level if vitals are being updated
    if (updateData.heartRate || updateData.bloodPressureSystolic || updateData.temperature || updateData.oxygenSaturation) {
      updateData.alertLevel = calculateAlertLevel({
        heartRate: updateData.heartRate ? parseInt(updateData.heartRate) : healthMonitoring.heartRate,
        bloodPressureSystolic: updateData.bloodPressureSystolic ? parseInt(updateData.bloodPressureSystolic) : healthMonitoring.bloodPressureSystolic,
        bloodPressureDiastolic: updateData.bloodPressureDiastolic ? parseInt(updateData.bloodPressureDiastolic) : healthMonitoring.bloodPressureDiastolic,
        temperature: updateData.temperature ? parseFloat(updateData.temperature) : healthMonitoring.temperature,
        oxygenSaturation: updateData.oxygenSaturation ? parseInt(updateData.oxygenSaturation) : healthMonitoring.oxygenSaturation
      });
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
    console.error('❌ Error updating health monitoring record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update health monitoring record',
      error: error.message
    });
  }
};

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
    console.error('❌ Error deleting health monitoring record:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete health monitoring record',
      error: error.message
    });
  }
};

module.exports = {
  createHealthMonitoring,
  getAllHealthMonitoring,
  getTodaysSchedule,
  getTodaysRecords,
  getHealthMonitoringById,
  updateHealthMonitoring,
  deleteHealthMonitoring
};