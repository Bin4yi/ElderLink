const { Ambulance, User, AmbulanceDispatch, EmergencyAlert } = require('../models');
const { Op } = require('sequelize');
const geoLocationService = require('../services/geoLocationService');

/**
 * Get all ambulances with optional filtering
 */
exports.getAllAmbulances = async (req, res) => {
  try {
    const { status, type, isActive, hospitalId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (isActive !== undefined) where.isActive = isActive === 'true';
    if (hospitalId) where.hospital = hospitalId;

    const ambulances = await Ambulance.findAll({
      where,
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({
      success: true,
      count: ambulances.length,
      data: ambulances,
    });
  } catch (error) {
    console.error('❌ Error fetching ambulances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulances',
      error: error.message,
    });
  }
};

/**
 * Get available ambulances (for dispatch)
 */
exports.getAvailableAmbulances = async (req, res) => {
  try {
    const { latitude, longitude, limit = 10 } = req.query;

    const ambulances = await Ambulance.findAll({
      where: {
        status: 'available',
        isActive: true,
      },
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'phone'],
        },
      ],
    });

    // If location provided, sort by distance
    if (latitude && longitude) {
      const location = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
      };

      const ambulancesWithDistance = ambulances.map((ambulance) => {
        const ambulanceData = ambulance.toJSON();
        if (ambulanceData.currentLocation?.latitude && ambulanceData.currentLocation?.longitude) {
          const distance = geoLocationService.calculateDistance(
            location.latitude,
            location.longitude,
            ambulanceData.currentLocation.latitude,
            ambulanceData.currentLocation.longitude
          );
          ambulanceData.distance = distance;
          ambulanceData.estimatedArrival = geoLocationService.estimateArrivalTime(distance);
        }
        return ambulanceData;
      });

      // Sort by distance
      ambulancesWithDistance.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));

      res.json({
        success: true,
        count: ambulancesWithDistance.length,
        data: ambulancesWithDistance.slice(0, parseInt(limit)),
      });
    } else {
      res.json({
        success: true,
        count: ambulances.length,
        data: ambulances,
      });
    }
  } catch (error) {
    console.error('❌ Error fetching available ambulances:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available ambulances',
      error: error.message,
    });
  }
};

/**
 * Get single ambulance by ID
 */
exports.getAmbulanceById = async (req, res) => {
  try {
    const { id } = req.params;

    const ambulance = await Ambulance.findByPk(id, {
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'profilePicture'],
        },
      ],
    });

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance not found',
      });
    }

    // Get active dispatch if any
    const activeDispatch = await AmbulanceDispatch.findOne({
      where: {
        ambulanceId: id,
        status: {
          [Op.in]: ['dispatched', 'accepted', 'en_route'],
        },
      },
      include: [
        {
          model: EmergencyAlert,
          as: 'emergencyAlert',
        },
      ],
    });

    res.json({
      success: true,
      data: {
        ...ambulance.toJSON(),
        activeDispatch,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching ambulance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulance',
      error: error.message,
    });
  }
};

/**
 * Create new ambulance
 */
exports.createAmbulance = async (req, res) => {
  try {
    const {
      vehicleNumber,
      licensePlate,
      type,
      driverId,
      hospital,
      contactNumber,
      equipment,
      capacity,
      currentLocation,
    } = req.body;

    // Validate required fields
    if (!vehicleNumber || !licensePlate || !type) {
      return res.status(400).json({
        success: false,
        message: 'Vehicle number, license plate, and type are required',
      });
    }

    // Check if driver exists if provided
    if (driverId) {
      const driver = await User.findByPk(driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found',
        });
      }
    }

    // Check for duplicate vehicle number or license plate
    const existing = await Ambulance.findOne({
      where: {
        [Op.or]: [{ vehicleNumber }, { licensePlate }],
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Ambulance with this vehicle number or license plate already exists',
      });
    }

    const ambulance = await Ambulance.create({
      vehicleNumber,
      licensePlate,
      type,
      driverId,
      hospital,
      contactNumber,
      equipment,
      capacity: capacity || 2,
      currentLocation,
      status: 'available',
    });

    const ambulanceWithDriver = await Ambulance.findByPk(ambulance.id, {
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: 'Ambulance created successfully',
      data: ambulanceWithDriver,
    });
  } catch (error) {
    console.error('❌ Error creating ambulance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create ambulance',
      error: error.message,
    });
  }
};

/**
 * Update ambulance
 */
exports.updateAmbulance = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      vehicleNumber,
      licensePlate,
      type,
      status,
      driverId,
      hospital,
      contactNumber,
      equipment,
      capacity,
      currentLocation,
      isActive,
    } = req.body;

    const ambulance = await Ambulance.findByPk(id);

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance not found',
      });
    }

    // Check if driver exists if provided
    if (driverId) {
      const driver = await User.findByPk(driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver not found',
        });
      }
    }

    // Check for duplicate vehicle number or license plate (excluding current)
    if (vehicleNumber || licensePlate) {
      const existing = await Ambulance.findOne({
        where: {
          id: { [Op.ne]: id },
          [Op.or]: [
            vehicleNumber ? { vehicleNumber } : {},
            licensePlate ? { licensePlate } : {},
          ].filter(obj => Object.keys(obj).length > 0),
        },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Another ambulance with this vehicle number or license plate already exists',
        });
      }
    }

    await ambulance.update({
      vehicleNumber: vehicleNumber || ambulance.vehicleNumber,
      licensePlate: licensePlate || ambulance.licensePlate,
      type: type || ambulance.type,
      status: status || ambulance.status,
      driverId: driverId !== undefined ? driverId : ambulance.driverId,
      hospital: hospital || ambulance.hospital,
      contactNumber: contactNumber || ambulance.contactNumber,
      equipment: equipment || ambulance.equipment,
      capacity: capacity || ambulance.capacity,
      currentLocation: currentLocation || ambulance.currentLocation,
      isActive: isActive !== undefined ? isActive : ambulance.isActive,
    });

    const updatedAmbulance = await Ambulance.findByPk(id, {
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
        },
      ],
    });

    res.json({
      success: true,
      message: 'Ambulance updated successfully',
      data: updatedAmbulance,
    });
  } catch (error) {
    console.error('❌ Error updating ambulance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ambulance',
      error: error.message,
    });
  }
};

/**
 * Update ambulance location
 */
exports.updateAmbulanceLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, accuracy, altitude, speed, heading } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const ambulance = await Ambulance.findByPk(id);

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance not found',
      });
    }

    await ambulance.update({
      currentLocation: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: accuracy || null,
        altitude: altitude || null,
        speed: speed || null,
        heading: heading || null,
        timestamp: new Date(),
      },
    });

    // If ambulance is en_route, broadcast location to coordinator and family
    if (ambulance.status === 'en_route') {
      const emergencyWebSocketService = require('../services/emergencyWebSocketService');
      const io = req.app.get('io');
      
      if (io) {
        emergencyWebSocketService.broadcastAmbulanceLocation(io, ambulance.id, {
          ambulanceId: ambulance.id,
          location: ambulance.currentLocation,
          status: ambulance.status,
        });
      }
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: ambulance,
    });
  } catch (error) {
    console.error('❌ Error updating ambulance location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ambulance location',
      error: error.message,
    });
  }
};

/**
 * Update ambulance status
 */
exports.updateAmbulanceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['available', 'en_route', 'busy', 'maintenance', 'offline'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const ambulance = await Ambulance.findByPk(id);

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance not found',
      });
    }

    await ambulance.update({ status });

    res.json({
      success: true,
      message: 'Status updated successfully',
      data: ambulance,
    });
  } catch (error) {
    console.error('❌ Error updating ambulance status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update ambulance status',
      error: error.message,
    });
  }
};

/**
 * Delete ambulance (soft delete)
 */
exports.deleteAmbulance = async (req, res) => {
  try {
    const { id } = req.params;

    const ambulance = await Ambulance.findByPk(id);

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance not found',
      });
    }

    // Check if ambulance has active dispatches
    const activeDispatch = await AmbulanceDispatch.findOne({
      where: {
        ambulanceId: id,
        status: {
          [Op.in]: ['dispatched', 'accepted', 'en_route'],
        },
      },
    });

    if (activeDispatch) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete ambulance with active dispatches',
      });
    }

    await ambulance.update({ isActive: false, status: 'offline' });

    res.json({
      success: true,
      message: 'Ambulance deleted successfully',
    });
  } catch (error) {
    console.error('❌ Error deleting ambulance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete ambulance',
      error: error.message,
    });
  }
};

/**
 * Get ambulance statistics
 */
exports.getAmbulanceStats = async (req, res) => {
  try {
    const totalAmbulances = await Ambulance.count({ where: { isActive: true } });
    const availableAmbulances = await Ambulance.count({
      where: { status: 'available', isActive: true },
    });
    const enRouteAmbulances = await Ambulance.count({
      where: { status: 'en_route', isActive: true },
    });
    const busyAmbulances = await Ambulance.count({
      where: { status: 'busy', isActive: true },
    });
    const maintenanceAmbulances = await Ambulance.count({
      where: { status: 'maintenance', isActive: true },
    });

    // Get ambulances by type
    const ambulancesByType = await Ambulance.findAll({
      where: { isActive: true },
      attributes: ['type', [require('sequelize').fn('COUNT', 'id'), 'count']],
      group: ['type'],
    });

    res.json({
      success: true,
      data: {
        total: totalAmbulances,
        available: availableAmbulances,
        enRoute: enRouteAmbulances,
        busy: busyAmbulances,
        maintenance: maintenanceAmbulances,
        byType: ambulancesByType,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching ambulance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch ambulance statistics',
      error: error.message,
    });
  }
};

/**
 * Get available drivers (users with ambulance_driver role)
 */
exports.getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await User.findAll({
      where: {
        role: 'ambulance_driver',
        isActive: true,
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
      order: [['firstName', 'ASC']],
    });

    res.json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (error) {
    console.error('❌ Error fetching available drivers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available drivers',
      error: error.message,
    });
  }
};
