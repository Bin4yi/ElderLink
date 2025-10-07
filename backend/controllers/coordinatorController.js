const {
  EmergencyAlert,
  Ambulance,
  AmbulanceDispatch,
  EmergencyLocation,
  Elder,
  User,
  Subscription,
} = require('../models');
const { Op } = require('sequelize');
const geoLocationService = require('../services/geoLocationService');
const emailService = require('../services/emailService');

/**
 * Get emergency dashboard overview
 */
exports.getDashboardOverview = async (req, res) => {
  try {
    const now = new Date();
    const last24Hours = new Date(now - 24 * 60 * 60 * 1000);

    // Active emergencies
    const activeEmergencies = await EmergencyAlert.count({
      where: {
        status: {
          [Op.in]: ['pending', 'acknowledged', 'dispatched', 'en_route'],
        },
      },
    });

    // Pending emergencies (not yet dispatched)
    const pendingEmergencies = await EmergencyAlert.count({
      where: {
        status: {
          [Op.in]: ['pending', 'acknowledged'],
        },
      },
    });

    // Available ambulances
    const availableAmbulances = await Ambulance.count({
      where: {
        status: 'available',
        isActive: true,
      },
    });

    // En route ambulances
    const enRouteAmbulances = await Ambulance.count({
      where: {
        status: 'en_route',
        isActive: true,
      },
    });

    // Completed emergencies in last 24 hours
    const completedToday = await EmergencyAlert.count({
      where: {
        status: 'completed',
        updatedAt: {
          [Op.gte]: last24Hours,
        },
      },
    });

    // Average response time (last 24 hours)
    const completedDispatches = await AmbulanceDispatch.findAll({
      where: {
        status: 'completed',
        completedAt: {
          [Op.gte]: last24Hours,
        },
      },
      attributes: ['responseTime'],
    });

    const avgResponseTime =
      completedDispatches.length > 0
        ? completedDispatches.reduce((sum, d) => sum + (d.responseTime || 0), 0) /
          completedDispatches.length
        : 0;

    res.json({
      success: true,
      data: {
        activeEmergencies,
        pendingEmergencies,
        availableAmbulances,
        enRouteAmbulances,
        completedToday,
        averageResponseTime: Math.round(avgResponseTime),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard overview',
      error: error.message,
    });
  }
};

/**
 * Get emergency queue (pending and active emergencies)
 */
exports.getEmergencyQueue = async (req, res) => {
  try {
    const { status, priority, limit = 50 } = req.query;

    const where = {
      status: {
        [Op.in]: status
          ? status.split(',')
          : ['pending', 'acknowledged', 'dispatched', 'en_route'],
      },
    };

    if (priority) {
      where.priority = priority;
    }

    const emergencies = await EmergencyAlert.findAll({
      where,
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
        {
          model: User,
          as: 'acknowledgedByUser',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      order: [
        ['priority', 'ASC'], // critical first
        ['timestamp', 'ASC'], // oldest first
      ],
      limit: parseInt(limit),
    });

    // Get dispatch info for each emergency
    const emergenciesWithDispatch = await Promise.all(
      emergencies.map(async (emergency) => {
        const dispatch = await AmbulanceDispatch.findOne({
          where: { emergencyAlertId: emergency.id },
          include: [
            {
              model: Ambulance,
              as: 'ambulance',
              include: [
                {
                  model: User,
                  as: 'driver',
                  attributes: ['id', 'firstName', 'lastName', 'phone'],
                },
              ],
            },
          ],
          order: [['createdAt', 'DESC']],
        });

        return {
          ...emergency.toJSON(),
          dispatch: dispatch || null,
        };
      })
    );

    res.json({
      success: true,
      count: emergenciesWithDispatch.length,
      data: emergenciesWithDispatch,
    });
  } catch (error) {
    console.error('❌ Error fetching emergency queue:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch emergency queue',
      error: error.message,
    });
  }
};

/**
 * Acknowledge emergency (coordinator sees it)
 */
exports.acknowledgeEmergency = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const coordinatorId = req.user.id;

    const emergency = await EmergencyAlert.findByPk(emergencyId);

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency not found',
      });
    }

    if (emergency.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Emergency has already been acknowledged',
      });
    }

    await emergency.update({
      status: 'acknowledged',
      acknowledgedBy: coordinatorId,
      acknowledgedAt: new Date(),
    });

    // Broadcast to coordinator room
    const emergencyWebSocketService = require('../services/emergencyWebSocketService');
    const io = req.app.get('io');
    
    if (io) {
      emergencyWebSocketService.broadcastEmergencyAlert(io, {
        type: 'emergency_acknowledged',
        emergencyId: emergency.id,
        coordinatorId,
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: 'Emergency acknowledged successfully',
      data: emergency,
    });
  } catch (error) {
    console.error('❌ Error acknowledging emergency:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge emergency',
      error: error.message,
    });
  }
};

/**
 * Dispatch ambulance to emergency (intelligent dispatch)
 */
exports.dispatchAmbulance = async (req, res) => {
  try {
    const { emergencyId } = req.params;
    const { ambulanceId, hospitalDestination } = req.body;
    const coordinatorId = req.user.id;

    // Get emergency
    const emergency = await EmergencyAlert.findByPk(emergencyId, {
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
    });

    if (!emergency) {
      return res.status(404).json({
        success: false,
        message: 'Emergency not found',
      });
    }

    if (!['pending', 'acknowledged'].includes(emergency.status)) {
      return res.status(400).json({
        success: false,
        message: 'Emergency cannot be dispatched in current status',
      });
    }

    // Get ambulance
    const ambulance = await Ambulance.findByPk(ambulanceId, {
      include: [
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName', 'phone', 'email'],
        },
      ],
    });

    if (!ambulance) {
      return res.status(404).json({
        success: false,
        message: 'Ambulance not found',
      });
    }

    if (ambulance.status !== 'available') {
      return res.status(400).json({
        success: false,
        message: 'Ambulance is not available',
      });
    }

    // Calculate distance and ETA
    let distance = null;
    let estimatedArrivalTime = null;

    if (
      emergency.location?.latitude &&
      emergency.location?.longitude &&
      ambulance.currentLocation?.latitude &&
      ambulance.currentLocation?.longitude
    ) {
      distance = geoLocationService.calculateDistance(
        ambulance.currentLocation.latitude,
        ambulance.currentLocation.longitude,
        emergency.location.latitude,
        emergency.location.longitude
      );
      const eta = geoLocationService.estimateArrivalTime(distance);
      estimatedArrivalTime = new Date(Date.now() + eta * 60 * 1000);
    }

    // Create dispatch record
    const dispatch = await AmbulanceDispatch.create({
      emergencyAlertId: emergencyId,
      ambulanceId: ambulance.id,
      driverId: ambulance.driverId,
      coordinatorId,
      status: 'dispatched',
      dispatchedAt: new Date(),
      distance,
      estimatedArrivalTime,
      hospitalDestination,
      route: {
        origin: ambulance.currentLocation,
        destination: emergency.location,
      },
    });

    // Update emergency status
    await emergency.update({
      status: 'dispatched',
    });

    // Update ambulance status
    await ambulance.update({
      status: 'en_route',
    });

    // Save initial location
    if (ambulance.currentLocation?.latitude && ambulance.currentLocation?.longitude) {
      await EmergencyLocation.create({
        emergencyAlertId: emergencyId,
        ambulanceDispatchId: dispatch.id,
        latitude: ambulance.currentLocation.latitude,
        longitude: ambulance.currentLocation.longitude,
        accuracy: ambulance.currentLocation.accuracy,
        source: 'gps',
        timestamp: new Date(),
      });
    }

    // Notify driver via WebSocket
    const emergencyWebSocketService = require('../services/emergencyWebSocketService');
    const io = req.app.get('io');
    
    if (io) {
      emergencyWebSocketService.notifyDriver(io, ambulance.driverId, {
        type: 'dispatch_assigned',
        dispatchId: dispatch.id,
        emergencyId: emergency.id,
        elderId: emergency.elderId,
        elderName: emergency.elder?.user
          ? `${emergency.elder.user.firstName} ${emergency.elder.user.lastName}`
          : 'Unknown',
        location: emergency.location,
        priority: emergency.priority,
        alertType: emergency.alertType,
        estimatedArrivalTime,
        distance,
      });

      // Notify family
      if (emergency.elder?.subscriptionId) {
        const subscription = await Subscription.findByPk(emergency.elder.subscriptionId);
        if (subscription?.userId) {
          emergencyWebSocketService.notifyFamily(io, emergency.elderId, {
            type: 'ambulance_dispatched',
            emergencyId: emergency.id,
            ambulance: {
              vehicleNumber: ambulance.vehicleNumber,
              type: ambulance.type,
              driver: ambulance.driver,
            },
            estimatedArrivalTime,
            distance,
          });
        }
      }

      // Broadcast to coordinators
      emergencyWebSocketService.broadcastEmergencyAlert(io, {
        type: 'ambulance_dispatched',
        emergencyId: emergency.id,
        ambulanceId: ambulance.id,
        dispatchId: dispatch.id,
        coordinatorId,
      });
    }

    // Send email to driver
    if (ambulance.driver?.email) {
      await emailService.sendEmail({
        to: ambulance.driver.email,
        subject: '🚨 Emergency Dispatch Assignment',
        html: `
          <h2>Emergency Dispatch Assignment</h2>
          <p>You have been assigned to respond to an emergency:</p>
          <ul>
            <li><strong>Priority:</strong> ${emergency.priority.toUpperCase()}</li>
            <li><strong>Type:</strong> ${emergency.alertType}</li>
            <li><strong>Elder:</strong> ${emergency.elder?.user?.firstName || 'Unknown'} ${emergency.elder?.user?.lastName || ''}</li>
            <li><strong>Location:</strong> ${geoLocationService.formatLocation(emergency.location)}</li>
            <li><strong>Distance:</strong> ${distance ? distance.toFixed(2) + ' km' : 'Unknown'}</li>
            <li><strong>ETA:</strong> ${estimatedArrivalTime ? new Date(estimatedArrivalTime).toLocaleTimeString() : 'Unknown'}</li>
          </ul>
          <p><strong>Contact:</strong> ${emergency.elder?.user?.phone || 'N/A'}</p>
          <p>Please accept this dispatch in your mobile app and proceed to the location immediately.</p>
        `,
      });
    }

    res.json({
      success: true,
      message: 'Ambulance dispatched successfully',
      data: {
        dispatch,
        emergency,
        ambulance,
      },
    });
  } catch (error) {
    console.error('❌ Error dispatching ambulance:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dispatch ambulance',
      error: error.message,
    });
  }
};

/**
 * Get dispatch history
 */
exports.getDispatchHistory = async (req, res) => {
  try {
    const { status, startDate, endDate, limit = 100 } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.dispatchedAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
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
        {
          model: User,
          as: 'driver',
          attributes: ['id', 'firstName', 'lastName'],
        },
        {
          model: User,
          as: 'coordinator',
          attributes: ['id', 'firstName', 'lastName'],
        },
      ],
      order: [['dispatchedAt', 'DESC']],
      limit: parseInt(limit),
    });

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
 * Get analytics and statistics
 */
exports.getAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;

    // Calculate date range
    const now = new Date();
    let startDate;

    switch (period) {
      case '24h':
        startDate = new Date(now - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
    }

    // Total emergencies
    const totalEmergencies = await EmergencyAlert.count({
      where: {
        timestamp: {
          [Op.gte]: startDate,
        },
      },
    });

    // Completed emergencies
    const completedEmergencies = await EmergencyAlert.count({
      where: {
        status: 'completed',
        timestamp: {
          [Op.gte]: startDate,
        },
      },
    });

    // Average response time
    const completedDispatches = await AmbulanceDispatch.findAll({
      where: {
        status: 'completed',
        dispatchedAt: {
          [Op.gte]: startDate,
        },
      },
      attributes: ['responseTime', 'distance'],
    });

    const avgResponseTime =
      completedDispatches.length > 0
        ? completedDispatches.reduce((sum, d) => sum + (d.responseTime || 0), 0) /
          completedDispatches.length
        : 0;

    const avgDistance =
      completedDispatches.length > 0
        ? completedDispatches.reduce((sum, d) => sum + (d.distance || 0), 0) /
          completedDispatches.length
        : 0;

    // Emergencies by type
    const emergenciesByType = await EmergencyAlert.findAll({
      where: {
        timestamp: {
          [Op.gte]: startDate,
        },
      },
      attributes: [
        'alertType',
        [require('sequelize').fn('COUNT', 'id'), 'count'],
      ],
      group: ['alertType'],
    });

    // Emergencies by priority
    const emergenciesByPriority = await EmergencyAlert.findAll({
      where: {
        timestamp: {
          [Op.gte]: startDate,
        },
      },
      attributes: [
        'priority',
        [require('sequelize').fn('COUNT', 'id'), 'count'],
      ],
      group: ['priority'],
    });

    // Top performing ambulances
    const topAmbulances = await AmbulanceDispatch.findAll({
      where: {
        status: 'completed',
        dispatchedAt: {
          [Op.gte]: startDate,
        },
      },
      attributes: [
        'ambulanceId',
        [require('sequelize').fn('COUNT', 'id'), 'completedDispatch'],
        [require('sequelize').fn('AVG', require('sequelize').col('responseTime')), 'avgResponseTime'],
      ],
      include: [
        {
          model: Ambulance,
          as: 'ambulance',
          attributes: ['vehicleNumber', 'type'],
        },
      ],
      group: ['ambulanceId', 'ambulance.id', 'ambulance.vehicleNumber', 'ambulance.type'],
      order: [[require('sequelize').fn('COUNT', 'id'), 'DESC']],
      limit: 5,
    });

    res.json({
      success: true,
      data: {
        period,
        totalEmergencies,
        completedEmergencies,
        completionRate: totalEmergencies > 0 ? (completedEmergencies / totalEmergencies) * 100 : 0,
        averageResponseTime: Math.round(avgResponseTime),
        averageDistance: Math.round(avgDistance * 100) / 100,
        emergenciesByType,
        emergenciesByPriority,
        topAmbulances,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics',
      error: error.message,
    });
  }
};
