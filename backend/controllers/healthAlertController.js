// backend/controllers/healthAlertController.js
const { HealthAlert, Elder, User, StaffAssignment, HealthMonitoring, Notification } = require('../models');
const { Op } = require('sequelize');
const emailService = require('../services/emailService');

// Health thresholds for alerts
const HEALTH_THRESHOLDS = {
  BLOOD_PRESSURE_HIGH_SYSTOLIC: 140,
  BLOOD_PRESSURE_HIGH_DIASTOLIC: 90,
  BLOOD_PRESSURE_CRITICAL_SYSTOLIC: 180,
  BLOOD_PRESSURE_CRITICAL_DIASTOLIC: 120,
  BLOOD_PRESSURE_LOW_SYSTOLIC: 90,
  BLOOD_PRESSURE_LOW_DIASTOLIC: 60,
  HEART_RATE_HIGH: 100,
  HEART_RATE_CRITICAL: 120,
  HEART_RATE_LOW: 60,
  HEART_RATE_CRITICAL_LOW: 40,
  TEMPERATURE_HIGH: 100.4,
  TEMPERATURE_CRITICAL: 103,
  TEMPERATURE_LOW: 96.8,
  TEMPERATURE_CRITICAL_LOW: 95,
  OXYGEN_LOW: 95,
  OXYGEN_CRITICAL: 90
};

// Check health vitals and create alerts
const checkHealthVitals = async (healthRecord, io) => {
  try {
    console.log('🔍 Checking health vitals for record:', healthRecord.id);
    console.log('📊 Vital signs:', {
      bloodPressure: `${healthRecord.bloodPressureSystolic}/${healthRecord.bloodPressureDiastolic}`,
      heartRate: healthRecord.heartRate,
      temperature: healthRecord.temperature,
      oxygenSaturation: healthRecord.oxygenSaturation
    });
    
    const alerts = [];
    const elder = await Elder.findByPk(healthRecord.elderId, {
      include: [{ model: User, as: 'user' }]
    });

    if (!elder) {
      console.log('❌ Elder not found for health record');
      return alerts;
    }
    
    console.log('👤 Elder:', `${elder.firstName} ${elder.lastName}`);

    // Check Blood Pressure
    if (healthRecord.bloodPressureSystolic && healthRecord.bloodPressureDiastolic) {
      let severity = 'low';
      let alertType = null;
      
      if (healthRecord.bloodPressureSystolic >= HEALTH_THRESHOLDS.BLOOD_PRESSURE_CRITICAL_SYSTOLIC ||
          healthRecord.bloodPressureDiastolic >= HEALTH_THRESHOLDS.BLOOD_PRESSURE_CRITICAL_DIASTOLIC) {
        severity = 'critical';
        alertType = 'HIGH_BLOOD_PRESSURE';
      } else if (healthRecord.bloodPressureSystolic >= HEALTH_THRESHOLDS.BLOOD_PRESSURE_HIGH_SYSTOLIC ||
                 healthRecord.bloodPressureDiastolic >= HEALTH_THRESHOLDS.BLOOD_PRESSURE_HIGH_DIASTOLIC) {
        severity = 'high';
        alertType = 'HIGH_BLOOD_PRESSURE';
      } else if (healthRecord.bloodPressureSystolic <= HEALTH_THRESHOLDS.BLOOD_PRESSURE_LOW_SYSTOLIC ||
                 healthRecord.bloodPressureDiastolic <= HEALTH_THRESHOLDS.BLOOD_PRESSURE_LOW_DIASTOLIC) {
        severity = 'medium';
        alertType = 'LOW_BLOOD_PRESSURE';
      }

      if (alertType) {
        alerts.push({
          elderId: elder.id,
          healthMonitoringId: healthRecord.id,
          alertType,
          severity,
          message: `Blood pressure reading ${severity === 'critical' ? 'critically ' : ''}${alertType === 'HIGH_BLOOD_PRESSURE' ? 'high' : 'low'} (${healthRecord.bloodPressureSystolic}/${healthRecord.bloodPressureDiastolic} mmHg)`,
          triggerValue: `${healthRecord.bloodPressureSystolic}/${healthRecord.bloodPressureDiastolic}`,
          normalRange: '90-140 / 60-90 mmHg'
        });
      }
    }

    // Check Heart Rate
    if (healthRecord.heartRate) {
      console.log(`💓 Checking heart rate: ${healthRecord.heartRate} bpm (threshold: high ≥${HEALTH_THRESHOLDS.HEART_RATE_HIGH}, critical ≥${HEALTH_THRESHOLDS.HEART_RATE_CRITICAL})`);
      
      let severity = 'low';
      let alertType = null;
      
      if (healthRecord.heartRate >= HEALTH_THRESHOLDS.HEART_RATE_CRITICAL) {
        severity = 'critical';
        alertType = 'HIGH_HEART_RATE';
        console.log(`⚠️ Heart rate CRITICAL: ${healthRecord.heartRate} >= ${HEALTH_THRESHOLDS.HEART_RATE_CRITICAL}`);
      } else if (healthRecord.heartRate >= HEALTH_THRESHOLDS.HEART_RATE_HIGH) {
        severity = 'high';
        alertType = 'HIGH_HEART_RATE';
        console.log(`⚠️ Heart rate HIGH: ${healthRecord.heartRate} >= ${HEALTH_THRESHOLDS.HEART_RATE_HIGH}`);
      } else if (healthRecord.heartRate <= HEALTH_THRESHOLDS.HEART_RATE_CRITICAL_LOW) {
        severity = 'critical';
        alertType = 'LOW_HEART_RATE';
        console.log(`⚠️ Heart rate CRITICAL LOW: ${healthRecord.heartRate} <= ${HEALTH_THRESHOLDS.HEART_RATE_CRITICAL_LOW}`);
      } else if (healthRecord.heartRate <= HEALTH_THRESHOLDS.HEART_RATE_LOW) {
        severity = 'medium';
        alertType = 'LOW_HEART_RATE';
        console.log(`⚠️ Heart rate LOW: ${healthRecord.heartRate} <= ${HEALTH_THRESHOLDS.HEART_RATE_LOW}`);
      } else {
        console.log(`✅ Heart rate normal: ${healthRecord.heartRate} is within 60-100 bpm range`);
      }

      if (alertType) {
        alerts.push({
          elderId: elder.id,
          healthMonitoringId: healthRecord.id,
          alertType,
          severity,
          message: `Heart rate ${severity === 'critical' ? 'critically ' : ''}${alertType === 'HIGH_HEART_RATE' ? 'elevated' : 'low'} (${healthRecord.heartRate} bpm)`,
          triggerValue: healthRecord.heartRate.toString(),
          normalRange: '60-100 bpm'
        });
      }
    }

    // Check Temperature
    if (healthRecord.temperature) {
      let severity = 'low';
      let alertType = null;
      
      if (healthRecord.temperature >= HEALTH_THRESHOLDS.TEMPERATURE_CRITICAL) {
        severity = 'critical';
        alertType = 'HIGH_TEMPERATURE';
      } else if (healthRecord.temperature >= HEALTH_THRESHOLDS.TEMPERATURE_HIGH) {
        severity = 'high';
        alertType = 'HIGH_TEMPERATURE';
      } else if (healthRecord.temperature <= HEALTH_THRESHOLDS.TEMPERATURE_CRITICAL_LOW) {
        severity = 'critical';
        alertType = 'LOW_TEMPERATURE';
      } else if (healthRecord.temperature <= HEALTH_THRESHOLDS.TEMPERATURE_LOW) {
        severity = 'medium';
        alertType = 'LOW_TEMPERATURE';
      }

      if (alertType) {
        alerts.push({
          elderId: elder.id,
          healthMonitoringId: healthRecord.id,
          alertType,
          severity,
          message: `Temperature ${severity === 'critical' ? 'critically ' : ''}${alertType === 'HIGH_TEMPERATURE' ? 'elevated' : 'low'} (${healthRecord.temperature}°F)`,
          triggerValue: healthRecord.temperature.toString(),
          normalRange: '96.8-100.4°F'
        });
      }
    }

    // Check Oxygen Saturation
    if (healthRecord.oxygenSaturation) {
      let severity = 'low';
      let alertType = null;
      
      if (healthRecord.oxygenSaturation <= HEALTH_THRESHOLDS.OXYGEN_CRITICAL) {
        severity = 'critical';
        alertType = 'LOW_OXYGEN';
      } else if (healthRecord.oxygenSaturation <= HEALTH_THRESHOLDS.OXYGEN_LOW) {
        severity = 'high';
        alertType = 'LOW_OXYGEN';
      }

      if (alertType) {
        alerts.push({
          elderId: elder.id,
          healthMonitoringId: healthRecord.id,
          alertType,
          severity,
          message: `Oxygen saturation ${severity === 'critical' ? 'critically ' : ''}low (${healthRecord.oxygenSaturation}%)`,
          triggerValue: healthRecord.oxygenSaturation.toString(),
          normalRange: '95-100%'
        });
      }
    }

    // Create alert records
    if (alerts.length > 0) {
      console.log(`⚠️ ${alerts.length} alert(s) detected:`, alerts.map(a => `${a.alertType} (${a.severity})`));
      
      const createdAlerts = await HealthAlert.bulkCreate(alerts);
      
      // Update the health monitoring record's alertLevel based on highest severity
      const highestSeverity = alerts.reduce((max, alert) => {
        const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
        const currentLevel = severityLevels[alert.severity] || 0;
        const maxLevel = severityLevels[max] || 0;
        return currentLevel > maxLevel ? alert.severity : max;
      }, 'low');
      
      // Map severity to alertLevel enum (normal, warning, critical)
      let alertLevel = 'normal';
      if (highestSeverity === 'critical') {
        alertLevel = 'critical';
      } else if (highestSeverity === 'high' || highestSeverity === 'medium') {
        alertLevel = 'warning';
      }
      
      await healthRecord.update({ alertLevel });
      console.log(`📊 Updated health record alertLevel to: ${alertLevel} (based on severity: ${highestSeverity})`);
      
      // Send notifications for each alert
      for (const alert of createdAlerts) {
        console.log(`📤 Sending notifications for alert ${alert.id}...`);
        await sendAlertNotifications(alert, io);
      }
      
      return createdAlerts;
    } else {
      console.log('✅ No alerts - all vitals are within normal range');
      // Ensure alertLevel is set to normal if no alerts
      await healthRecord.update({ alertLevel: 'normal' });
    }

    return alerts;
  } catch (error) {
    console.error('Error checking health vitals:', error);
    throw error;
  }
};

// Send alert notifications to family and staff
const sendAlertNotifications = async (alert, io) => {
  try {
    const { Subscription } = require('../models');
    
    console.log(`🔔 sendAlertNotifications called for alert ${alert.id}`);
    
    const elder = await Elder.findByPk(alert.elderId, {
      include: [
        { model: User, as: 'user' },
        { 
          model: Subscription, 
          as: 'subscription',
          include: [{ 
            model: User, 
            as: 'user'
          }]
        }
      ]
    });

    if (!elder) {
      console.log('❌ Elder not found for alert');
      return;
    }
    
    console.log(`👤 Elder found: ${elder.firstName} ${elder.lastName}`);
    console.log(`📋 Subscription:`, elder.subscription ? `ID: ${elder.subscription.id}` : 'Not found');
    if (elder.subscription) {
      console.log(`👨‍👩‍👧 Subscription User:`, elder.subscription.user ? `${elder.subscription.user.firstName} ${elder.subscription.user.lastName} (${elder.subscription.user.email}) - Role: ${elder.subscription.user.role}` : 'Not found');
    }

    // Get assigned staff
    const staffAssignments = await StaffAssignment.findAll({
      where: {
        elderId: elder.id,
        isActive: true
      },
      include: [{ model: User, as: 'staff' }]
    });

    // Get family member from subscription - only if they are actually a family member
    const familyMembers = [];
    if (elder.subscription && elder.subscription.user) {
      if (elder.subscription.user.role === 'family_member') {
        familyMembers.push(elder.subscription.user);
        console.log(`✅ Family member identified: ${elder.subscription.user.email}`);
      } else {
        console.log(`⚠️ Subscription user is not a family member. Role: ${elder.subscription.user.role}`);
      }
    } else {
      console.log(`❌ No subscription or subscription user found for elder`);
    }

    // Prepare notification data
    const notificationData = {
      alertId: alert.id,
      elderId: elder.id,
      elderName: `${elder.firstName} ${elder.lastName}`,
      alertType: alert.alertType,
      severity: alert.severity,
      message: alert.message,
      triggerValue: alert.triggerValue,
      normalRange: alert.normalRange,
      timestamp: alert.createdAt,
      playSound: alert.severity === 'critical' || alert.severity === 'high'
    };

    console.log('🚨 Sending health alert notifications:', notificationData);

    // Send to assigned staff with emergency sound for critical/high alerts
    for (const assignment of staffAssignments) {
      if (assignment.staff) {
        // Create database notification
        await Notification.create({
          userId: assignment.staffId,
          elderId: elder.id,
          type: 'health_alert',
          title: `Health Alert: ${elder.firstName} ${elder.lastName}`,
          message: alert.message,
          priority: alert.severity === 'critical' ? 'urgent' : alert.severity === 'high' ? 'high' : 'medium',
          metadata: {
            alertId: alert.id,
            alertType: alert.alertType,
            severity: alert.severity,
            triggerValue: alert.triggerValue,
            normalRange: alert.normalRange
          }
        });

        // Send real-time notification via socket.io
        if (io) {
          io.to(`user_${assignment.staffId}`).emit('health_alert', {
            ...notificationData,
            recipient: 'staff',
            staffId: assignment.staffId
          });
          
          console.log(`📤 Alert sent to staff user_${assignment.staffId}`);
        }
      }
    }

    // Send to family members via EMAIL (no socket notifications)
    console.log(`📧 Attempting to send emails to ${familyMembers.length} family member(s)`);
    
    for (const family of familyMembers) {
      console.log(`📧 Family member found: ${family.firstName} ${family.lastName} (${family.email})`);
      
      // Create database notification
      await Notification.create({
        userId: family.id,
        elderId: elder.id,
        type: 'health_alert',
        title: `Health Alert: ${elder.firstName} ${elder.lastName}`,
        message: alert.message,
        priority: alert.severity === 'critical' ? 'urgent' : alert.severity === 'high' ? 'high' : 'medium',
        metadata: {
          alertId: alert.id,
          alertType: alert.alertType,
          severity: alert.severity,
          triggerValue: alert.triggerValue,
          normalRange: alert.normalRange
        }
      });

      // Send email notification to family member
      try {
        await emailService.sendHealthAlertEmail({
          to: family.email,
          recipientName: `${family.firstName} ${family.lastName}`,
          elderName: `${elder.firstName} ${elder.lastName}`,
          alertType: alert.alertType,
          severity: alert.severity,
          message: alert.message,
          triggerValue: alert.triggerValue,
          normalRange: alert.normalRange,
          timestamp: alert.createdAt
        });
        console.log(`✅ Health alert email sent successfully to family member: ${family.email}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${family.email}:`, emailError.message);
      }
    }

    console.log(`✅ Alert notifications sent to ${staffAssignments.length} staff (real-time) and ${familyMembers.length} family members (email)`);
  } catch (error) {
    console.error('Error sending alert notifications:', error);
    throw error;
  }
};

// Get all alerts (admin only)
const getAllAlerts = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, severity, elderId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (severity) whereClause.severity = severity;
    if (elderId) whereClause.elderId = elderId;

    const alerts = await HealthAlert.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'photo']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: alerts.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(alerts.count / limit),
        totalRecords: alerts.count
      }
    });
  } catch (error) {
    console.error('Error getting all alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch alerts',
      error: error.message
    });
  }
};

// Get alerts for specific staff member
const getStaffAlerts = async (req, res) => {
  try {
    const staffId = req.user.id;

    // Get elders assigned to this staff
    const assignments = await StaffAssignment.findAll({
      where: { staffId, isActive: true },
      attributes: ['elderId']
    });

    const elderIds = assignments.map(a => a.elderId);

    const alerts = await HealthAlert.findAll({
      where: {
        elderId: { [Op.in]: elderIds },
        status: { [Op.in]: ['active', 'acknowledged'] }
      },
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'photo']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: alerts,
      total: alerts.length
    });
  } catch (error) {
    console.error('Error getting staff alerts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch staff alerts',
      error: error.message
    });
  }
};

// Acknowledge alert
const acknowledgeAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const alert = await HealthAlert.findByPk(id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.status = 'acknowledged';
    alert.acknowledgedAt = new Date();
    alert.acknowledgedBy = userId;
    await alert.save();

    res.json({
      success: true,
      data: alert,
      message: 'Alert acknowledged successfully'
    });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to acknowledge alert',
      error: error.message
    });
  }
};

// Resolve alert
const resolveAlert = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const alert = await HealthAlert.findByPk(id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.status = 'resolved';
    alert.resolvedAt = new Date();
    alert.resolvedBy = userId;
    await alert.save();

    res.json({
      success: true,
      data: alert,
      message: 'Alert resolved successfully'
    });
  } catch (error) {
    console.error('Error resolving alert:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resolve alert',
      error: error.message
    });
  }
};

// Mark emergency contacted
const markEmergencyContacted = async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = await HealthAlert.findByPk(id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.emergencyContacted = true;
    await alert.save();

    res.json({
      success: true,
      data: { alert }
    });
  } catch (error) {
    console.error('Error marking emergency contacted:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert',
      error: error.message
    });
  }
};

// Mark next of kin notified
const markNextOfKinNotified = async (req, res) => {
  try {
    const { id } = req.params;
    
    const alert = await HealthAlert.findByPk(id);
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }

    alert.nextOfKinNotified = true;
    if (alert.status === 'active') {
      alert.status = 'acknowledged';
    }
    await alert.save();

    res.json({
      success: true,
      data: { alert }
    });
  } catch (error) {
    console.error('Error marking next of kin notified:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update alert',
      error: error.message
    });
  }
};

module.exports = {
  checkHealthVitals,
  sendAlertNotifications,
  getAllAlerts,
  getStaffAlerts,
  acknowledgeAlert,
  resolveAlert,
  markEmergencyContacted,
  markNextOfKinNotified
};
