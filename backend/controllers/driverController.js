const { User, Ambulance, AmbulanceDispatch, EmergencyAlert, Elder } = require('../models');
const { Op } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * Get all drivers
 */
exports.getAllDrivers = async (req, res) => {
  try {
    const { status, hasAmbulance } = req.query;

    const where = {
      role: 'ambulance_driver',
    };

    if (status !== undefined) {
      where.isActive = status === 'active';
    }

    const drivers = await User.findAll({
      where,
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'isActive', 'createdAt'],
      include: [
        {
          model: Ambulance,
          as: 'assignedAmbulance',
          required: hasAmbulance === 'true',
          attributes: ['id', 'vehicleNumber', 'type', 'status'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    console.error('❌ Error fetching drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch drivers',
      error: error.message,
    });
  }
};

/**
 * Get driver by ID
 */
exports.getDriverById = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await User.findOne({
      where: {
        id,
        role: 'ambulance_driver',
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'isActive', 'createdAt'],
      include: [
        {
          model: Ambulance,
          as: 'assignedAmbulance',
          attributes: ['id', 'vehicleNumber', 'type', 'status', 'hospital'],
        },
      ],
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found',
      });
    }

    res.json({
      success: true,
      data: driver,
    });
  } catch (error) {
    console.error('❌ Error fetching driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver',
      error: error.message,
    });
  }
};

/**
 * Create new driver
 */
exports.createDriver = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firstName, lastName, email, password',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered',
      });
    }

    // Create driver user
    const driver = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password, // Will be hashed by beforeCreate hook in User model
      role: 'ambulance_driver',
      isActive: true,
    });

    // Return without password
    const driverData = driver.toJSON();
    delete driverData.password;

    console.log('✅ Driver created:', driver.email);

    res.status(201).json({
      success: true,
      message: 'Driver created successfully',
      data: driverData,
    });
  } catch (error) {
    console.error('❌ Error creating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create driver',
      error: error.message,
    });
  }
};

/**
 * Update driver
 */
exports.updateDriver = async (req, res) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, phone, password, isActive } = req.body;

    const driver = await User.findOne({
      where: {
        id,
        role: 'ambulance_driver',
      },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found',
      });
    }

    // Check if email is being changed and if it's already taken
    if (email && email !== driver.email) {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use',
        });
      }
    }

    // Update fields
    if (firstName) driver.firstName = firstName;
    if (lastName) driver.lastName = lastName;
    if (email) driver.email = email;
    if (phone) driver.phone = phone;
    if (isActive !== undefined) driver.isActive = isActive;
    
    // Update password if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      driver.password = await bcrypt.hash(password, salt);
    }

    await driver.save();

    // Return without password
    const driverData = driver.toJSON();
    delete driverData.password;

    console.log('✅ Driver updated:', driver.email);

    res.json({
      success: true,
      message: 'Driver updated successfully',
      data: driverData,
    });
  } catch (error) {
    console.error('❌ Error updating driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update driver',
      error: error.message,
    });
  }
};

/**
 * Delete driver (soft delete)
 */
exports.deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;

    const driver = await User.findOne({
      where: {
        id,
        role: 'ambulance_driver',
      },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found',
      });
    }

    // Check if driver is assigned to any ambulance
    const assignedAmbulance = await Ambulance.findOne({
      where: { driverId: id },
    });

    if (assignedAmbulance) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete driver. Driver is assigned to an ambulance. Please unassign first.',
        ambulance: assignedAmbulance.vehicleNumber,
      });
    }

    // Soft delete by setting isActive to false
    driver.isActive = false;
    await driver.save();

    console.log('✅ Driver deactivated:', driver.email);

    res.json({
      success: true,
      message: 'Driver deactivated successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting driver:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete driver',
      error: error.message,
    });
  }
};

/**
 * Get driver statistics
 */
exports.getDriverStats = async (req, res) => {
  try {
    const totalDrivers = await User.count({
      where: {
        role: 'ambulance_driver',
        isActive: true,
      },
    });

    const assignedDrivers = await Ambulance.count({
      where: {
        driverId: { [Op.ne]: null },
        isActive: true,
      },
      distinct: true,
      col: 'driverId',
    });

    const unassignedDrivers = totalDrivers - assignedDrivers;

    const activeDispatches = await AmbulanceDispatch.count({
      where: {
        status: {
          [Op.in]: ['dispatched', 'accepted', 'en_route'],
        },
      },
    });

    res.json({
      success: true,
      data: {
        total: totalDrivers,
        assigned: assignedDrivers,
        unassigned: unassignedDrivers,
        activeDispatches,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching driver stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch driver statistics',
      error: error.message,
    });
  }
};

/**
 * Get driver's active dispatch
 */
exports.getActiveDispatch = async (req, res) => {
  try {
    const driverId = req.user.id; // From auth middleware
    console.log('🚗 Getting active dispatch for driver:', driverId);

    // Find ambulance assigned to this driver
    const ambulance = await Ambulance.findOne({
      where: { driverId },
    });

    if (!ambulance) {
      console.log('⚠️ No ambulance assigned to driver:', driverId);
      return res.json({
        success: true,
        data: null,
        message: 'No ambulance assigned to this driver',
      });
    }

    console.log('✅ Found ambulance:', ambulance.id, ambulance.vehicleNumber);

    // Find active dispatch for this ambulance
    const dispatch = await AmbulanceDispatch.findOne({
      where: {
        ambulanceId: ambulance.id,
        status: {
          [Op.in]: ['dispatched', 'accepted', 'en_route', 'arrived'],
        },
      },
      include: [
        {
          model: EmergencyAlert,
          as: 'emergencyAlert',
          include: [
            {
              model: Elder,
              as: 'elder',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'firstName', 'lastName', 'phone', 'email'],
                },
              ],
            },
          ],
        },
        {
          model: Ambulance,
          as: 'ambulance',
          attributes: ['id', 'vehicleNumber', 'type'],
        },
      ],
      order: [['dispatchedAt', 'DESC']],
    });

    if (dispatch) {
      console.log('✅ Found active dispatch:', dispatch.id, 'Status:', dispatch.status);
    } else {
      console.log('ℹ️ No active dispatch found for ambulance:', ambulance.id);
    }

    res.json({
      success: true,
      data: dispatch,
    });
  } catch (error) {
    console.error('❌ Error fetching active dispatch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active dispatch',
      error: error.message,
    });
  }
};

/**
 * Get driver's dispatch history
 */
exports.getDispatchHistory = async (req, res) => {
  try {
    const driverId = req.user.id;
    const { limit = 20, offset = 0, status } = req.query;
    
    console.log('📋 Getting dispatch history for driver:', driverId, { limit, offset, status });

    // Find ambulance assigned to this driver
    const ambulance = await Ambulance.findOne({
      where: { driverId },
    });

    if (!ambulance) {
      console.log('⚠️ No ambulance assigned to driver:', driverId);
      return res.json({
        success: true,
        data: [],
        message: 'No ambulance assigned to this driver',
      });
    }

    console.log('✅ Found ambulance:', ambulance.id, ambulance.vehicleNumber);

    const where = {
      ambulanceId: ambulance.id,
    };

    if (status) {
      where.status = status;
    }

    const dispatches = await AmbulanceDispatch.findAll({
      where,
      include: [
        {
          model: EmergencyAlert,
          as: 'emergencyAlert',
          include: [
            {
              model: Elder,
              as: 'elder',
              include: [
                {
                  model: User,
                  as: 'user',
                  attributes: ['id', 'firstName', 'lastName', 'phone'],
                },
              ],
            },
          ],
        },
        {
          model: Ambulance,
          as: 'ambulance',
          attributes: ['id', 'vehicleNumber', 'type'],
        },
      ],
      order: [['dispatchedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    console.log(`✅ Found ${dispatches.length} dispatches in history`);

    res.json({
      success: true,
      count: dispatches.length,
      data: dispatches,
    });
  } catch (error) {
    console.error('❌ Error fetching dispatch history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dispatch history',
      error: error.message,
    });
  }
};

/**
 * Mark ambulance as available
 */
exports.markAvailable = async (req, res) => {
  try {
    const driverId = req.user.id;

    // Find ambulance assigned to this driver
    const ambulance = await Ambulance.findOne({
      where: { driverId },
    });

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'No ambulance assigned to this driver',
      });
    }

    // Update ambulance status to available
    await ambulance.update({
      status: 'available',
    });

    console.log('✅ Ambulance marked as available:', ambulance.vehicleNumber);

    res.json({
      success: true,
      message: 'Ambulance marked as available',
      data: {
        id: ambulance.id,
        vehicleNumber: ambulance.vehicleNumber,
        status: ambulance.status,
      },
    });
  } catch (error) {
    console.error('❌ Error marking ambulance as available:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark ambulance as available',
      error: error.message,
    });
  }
};

module.exports = exports;
