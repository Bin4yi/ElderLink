const {
  EmergencyAlert,
  Ambulance,
  AmbulanceDispatch,
  EmergencyLocation,
  Elder,
  User,
} = require('../models');
const { Op } = require('sequelize');
const geoLocationService = require('../services/geoLocationService');

/**
 * Driver accepts dispatch assignment
 */
exports.acceptDispatch = async (req, res) => {
  try {
    const { dispatchId } = req.params;
    const driverId = req.user.id;

    const dispatch = await AmbulanceDispatch.findByPk(dispatchId, {
      include: [
        {
          model: EmergencyAlert,
          as: 'emergencyAlert',
        },
        {
          model: Ambulance,
          as: 'ambulance',
        },
      ],
    });

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch not found',
      });
    }

    if (dispatch.driverId !== driverId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this dispatch',
      });
    }

    if (dispatch.status !== 'dispatched') {
      return res.status(400).json({
        success: false,
        message: 'Dispatch has already been accepted or completed',
      });
    }

    const now = new Date();
    const responseTime = Math.round((now - dispatch.dispatchedAt) / 1000); // seconds

    await dispatch.update({
      status: 'accepted',
      acceptedAt: now,
      responseTime,
    });

    await dispatch.emergencyAlert.update({
      status: 'en_route',
    });

    // Notify coordinator and family
    const emergencyWebSocketService = require('../services/emergencyWebSocketService');
    const io = req.app.get('io');
    
    if (io) {
      emergencyWebSocketService.broadcastEmergencyAlert(io, {
        type: 'dispatch_accepted',
        dispatchId: dispatch.id,
        emergencyId: dispatch.emergencyAlertId,
        driverId,
        acceptedAt: now,
        responseTime,
      });

      emergencyWebSocketService.notifyFamily(io, dispatch.emergencyAlert.elderId, {
        type: 'ambulance_on_the_way',
        dispatchId: dispatch.id,
        ambulance: dispatch.ambulance,
        acceptedAt: now,
      });
    }

    res.json({
      success: true,
      message: 'Dispatch accepted successfully',
      data: dispatch,
    });
  } catch (error) {
    console.error('❌ Error accepting dispatch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept dispatch',
      error: error.message,
    });
  }
};

/**
 * Driver updates dispatch status
 */
exports.updateDispatchStatus = async (req, res) => {
  try {
    const { dispatchId } = req.params;
    const { status } = req.body;
    const driverId = req.user.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const validStatuses = ['accepted', 'en_route', 'arrived', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const dispatch = await AmbulanceDispatch.findByPk(dispatchId, {
      include: [
        {
          model: EmergencyAlert,
          as: 'emergencyAlert',
        },
        {
          model: Ambulance,
          as: 'ambulance',
        },
      ],
    });

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch not found',
      });
    }

    if (dispatch.driverId !== driverId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this dispatch',
      });
    }

    await dispatch.update({ status });

    // Update emergency alert status based on dispatch status
    if (status === 'en_route') {
      await dispatch.emergencyAlert.update({ status: 'en_route' });
    } else if (status === 'arrived') {
      await dispatch.emergencyAlert.update({ status: 'assistance_provided' });
    } else if (status === 'completed') {
      await dispatch.emergencyAlert.update({ status: 'resolved' });
    }

    res.json({
      success: true,
      message: `Dispatch status updated to ${status}`,
      data: dispatch,
    });
  } catch (error) {
    console.error('❌ Error updating dispatch status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update dispatch status',
      error: error.message,
    });
  }
};

/**
 * Driver updates location during dispatch
 */
exports.updateDispatchLocation = async (req, res) => {
  try {
    const { dispatchId } = req.params;
    const { latitude, longitude, accuracy, altitude, speed, heading } = req.body;
    const driverId = req.user.id;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required',
      });
    }

    const dispatch = await AmbulanceDispatch.findByPk(dispatchId);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch not found',
      });
    }

    if (dispatch.driverId !== driverId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this dispatch',
      });
    }

    if (!['accepted', 'en_route'].includes(dispatch.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update location for dispatch in current status',
      });
    }

    // Save location to history
    await EmergencyLocation.create({
      emergencyAlertId: dispatch.emergencyAlertId,
      ambulanceDispatchId: dispatch.id,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      accuracy: accuracy || null,
      altitude: altitude || null,
      speed: speed || null,
      heading: heading || null,
      source: 'gps',
      timestamp: new Date(),
    });

    // Update ambulance location
    await Ambulance.update(
      {
        currentLocation: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy,
          altitude,
          speed,
          heading,
          timestamp: new Date(),
        },
      },
      {
        where: { id: dispatch.ambulanceId },
      }
    );

    // Broadcast location to coordinator and family
    const emergencyWebSocketService = require('../services/emergencyWebSocketService');
    const io = req.app.get('io');
    
    if (io) {
      const emergency = await EmergencyAlert.findByPk(dispatch.emergencyAlertId);
      
      emergencyWebSocketService.broadcastAmbulanceLocation(io, dispatch.ambulanceId, {
        dispatchId: dispatch.id,
        ambulanceId: dispatch.ambulanceId,
        location: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          accuracy,
          speed,
          heading,
        },
        timestamp: new Date(),
      });

      if (emergency) {
        emergencyWebSocketService.notifyFamily(io, emergency.elderId, {
          type: 'ambulance_location_update',
          location: {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
          },
        });
      }
    }

    res.json({
      success: true,
      message: 'Location updated successfully',
    });
  } catch (error) {
    console.error('❌ Error updating dispatch location:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update location',
      error: error.message,
    });
  }
};

/**
 * Driver marks arrival at emergency location
 */
exports.markArrived = async (req, res) => {
  try {
    const { dispatchId } = req.params;
    const driverId = req.user.id;

    const dispatch = await AmbulanceDispatch.findByPk(dispatchId, {
      include: [
        {
          model: EmergencyAlert,
          as: 'emergencyAlert',
        },
      ],
    });

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch not found',
      });
    }

    if (dispatch.driverId !== driverId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this dispatch',
      });
    }

    if (dispatch.status !== 'accepted' && dispatch.status !== 'en_route') {
      return res.status(400).json({
        success: false,
        message: 'Invalid dispatch status',
      });
    }

    const now = new Date();
    const totalTime = Math.round((now - dispatch.dispatchedAt) / 1000); // seconds

    await dispatch.update({
      status: 'arrived',
      arrivedAt: now,
      responseTime: totalTime,
    });

    await dispatch.emergencyAlert.update({
      status: 'arrived',
    });

    // Notify coordinator and family
    const emergencyWebSocketService = require('../services/emergencyWebSocketService');
    const io = req.app.get('io');
    
    if (io) {
      emergencyWebSocketService.notifyArrival(io, dispatch.emergencyAlert.elderId, {
        dispatchId: dispatch.id,
        emergencyId: dispatch.emergencyAlertId,
        arrivedAt: now,
        totalResponseTime: totalTime,
      });

      emergencyWebSocketService.broadcastEmergencyAlert(io, {
        type: 'ambulance_arrived',
        dispatchId: dispatch.id,
        emergencyId: dispatch.emergencyAlertId,
        arrivedAt: now,
      });
    }

    res.json({
      success: true,
      message: 'Arrival confirmed',
      data: dispatch,
    });
  } catch (error) {
    console.error('❌ Error marking arrival:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark arrival',
      error: error.message,
    });
  }
};

/**
 * Driver completes dispatch (transported to hospital or resolved on-site)
 */
exports.completeDispatch = async (req, res) => {
  try {
    const { dispatchId } = req.params;
    const { notes, patientCondition, hospitalArrived } = req.body;
    const driverId = req.user.id;

    const dispatch = await AmbulanceDispatch.findByPk(dispatchId, {
      include: [
        {
          model: EmergencyAlert,
          as: 'emergencyAlert',
        },
      ],
    });

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Dispatch not found',
      });
    }

    if (dispatch.driverId !== driverId) {
      return res.status(403).json({
        success: false,
        message: 'You are not assigned to this dispatch',
      });
    }

    if (dispatch.status !== 'arrived') {
      return res.status(400).json({
        success: false,
        message: 'Must arrive before completing dispatch',
      });
    }

    const now = new Date();

    await dispatch.update({
      status: 'completed',
      completedAt: now,
      notes: notes || dispatch.notes,
    });

    await dispatch.emergencyAlert.update({
      status: 'completed',
      notes: {
        ...dispatch.emergencyAlert.notes,
        patientCondition,
        hospitalArrived,
        completedBy: driverId,
        completedAt: now,
      },
    });

    // Update ambulance status to available
    await Ambulance.update(
      { status: 'available' },
      { where: { id: dispatch.ambulanceId } }
    );

    // Notify coordinator and family
    const emergencyWebSocketService = require('../services/emergencyWebSocketService');
    const io = req.app.get('io');
    
    if (io) {
      emergencyWebSocketService.broadcastEmergencyAlert(io, {
        type: 'emergency_completed',
        dispatchId: dispatch.id,
        emergencyId: dispatch.emergencyAlertId,
        completedAt: now,
      });

      emergencyWebSocketService.notifyFamily(io, dispatch.emergencyAlert.elderId, {
        type: 'emergency_resolved',
        dispatchId: dispatch.id,
        completedAt: now,
        patientCondition,
      });
    }

    res.json({
      success: true,
      message: 'Dispatch completed successfully',
      data: dispatch,
    });
  } catch (error) {
    console.error('❌ Error completing dispatch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete dispatch',
      error: error.message,
    });
  }
};

/**
 * Get driver's active dispatch
 */
exports.getActiveDispatch = async (req, res) => {
  try {
    const driverId = req.user.id;

    const dispatch = await AmbulanceDispatch.findOne({
      where: {
        driverId,
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
                  attributes: ['id', 'firstName', 'lastName', 'phone', 'email', 'profilePicture'],
                },
              ],
            },
          ],
        },
        {
          model: Ambulance,
          as: 'ambulance',
        },
        {
          model: User,
          as: 'coordinator',
          attributes: ['id', 'firstName', 'lastName', 'phone'],
        },
      ],
      order: [['dispatchedAt', 'DESC']],
    });

    if (!dispatch) {
      return res.json({
        success: true,
        data: null,
        message: 'No active dispatch',
      });
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
    const { limit = 20, offset = 0 } = req.query;

    const dispatches = await AmbulanceDispatch.findAll({
      where: { driverId },
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
                  attributes: ['id', 'firstName', 'lastName'],
                },
              ],
            },
          ],
        },
        {
          model: Ambulance,
          as: 'ambulance',
        },
      ],
      order: [['dispatchedAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    const total = await AmbulanceDispatch.count({
      where: { driverId },
    });

    res.json({
      success: true,
      count: dispatches.length,
      total,
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
 * Get driver statistics
 */
exports.getDriverStats = async (req, res) => {
  try {
    const driverId = req.user.id;

    const totalDispatches = await AmbulanceDispatch.count({
      where: { driverId },
    });

    const completedDispatches = await AmbulanceDispatch.count({
      where: {
        driverId,
        status: 'completed',
      },
    });

    const dispatches = await AmbulanceDispatch.findAll({
      where: {
        driverId,
        status: 'completed',
      },
      attributes: ['responseTime', 'distance'],
    });

    const avgResponseTime =
      dispatches.length > 0
        ? dispatches.reduce((sum, d) => sum + (d.responseTime || 0), 0) / dispatches.length
        : 0;

    const totalDistance =
      dispatches.length > 0
        ? dispatches.reduce((sum, d) => sum + (d.distance || 0), 0)
        : 0;

    res.json({
      success: true,
      data: {
        totalDispatches,
        completedDispatches,
        averageResponseTime: Math.round(avgResponseTime),
        totalDistanceCovered: Math.round(totalDistance * 100) / 100,
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
