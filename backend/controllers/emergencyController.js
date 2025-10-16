const { Op } = require('sequelize');
const emailService = require('../services/emailService');

/**
 * Handle emergency alerts from QStash
 * Sends notifications to assigned caregivers and family members
 */
const handleEmergencyAlert = async (req, res) => {
  try {
    // Import models inside function to avoid circular dependency
    const { Elder, User, StaffAssignment, Notification, Subscription, EmergencyAlert } = require('../models');
    const emergencyWebSocketService = require('../services/emergencyWebSocketService');
    
    console.log('\n🚨🚨🚨 EMERGENCY ALERT HANDLER STARTED 🚨🚨🚨');
    console.log('📦 Full request body:', JSON.stringify(req.body, null, 2));
    
    // Extract data from request body
    let emergencyData = req.body;
    
    if (req.body.body) {
      console.log('📦 Found nested body structure');
      try {
        emergencyData = typeof req.body.body === 'string' 
          ? JSON.parse(req.body.body) 
          : req.body.body;
      } catch (e) {
        console.log('⚠️ Could not parse nested body, using original');
      }
    }

    console.log('📦 Processed emergency data:', JSON.stringify(emergencyData, null, 2));

    const { 
      elderId, 
      elderName,
      elderPhone,
      location, 
      timestamp, 
      alertType,
      elderInfo,
      emergency,
      vitals,
      additionalInfo,
      emergencyContacts,
      assignedStaff
    } = emergencyData;

    // Extract elder ID from various possible formats
    const providedId = elderId || elderInfo?.id || emergencyData.id;
    const extractedElderName = elderName || elderInfo?.name || emergencyData.elderName;
    const extractedElderPhone = elderPhone || elderInfo?.phone || emergencyData.elderPhone;
    const extractedLocation = location || emergency?.location || emergencyData.location;
    const extractedTimestamp = timestamp || emergency?.timestamp || new Date().toISOString();
    const extractedAlertType = alertType || emergency?.type || emergencyData.alertType || 'SOS';

    console.log('✅ Extracted values:');
    console.log('   Provided ID:', providedId);
    console.log('   Elder Name:', extractedElderName);
    console.log('   Elder Phone:', extractedElderPhone);
    console.log('   Timestamp:', extractedTimestamp);
    console.log('   Alert Type:', extractedAlertType);

    if (!providedId) {
      console.error('❌ Elder ID missing from request');
      return res.status(400).json({
        success: false,
        message: 'Elder ID is required',
        receivedData: emergencyData
      });
    }

    // IMPORTANT: Find elder by EITHER Elder.id OR Elder.userId (since mobile sends User ID)
    console.log('🔍 Fetching elder from database...');
    console.log('   Trying by Elder.id:', providedId);
    
    let elder = await Elder.findOne({
      where: {
        [Op.or]: [
          { id: providedId },
          { userId: providedId }
        ]
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Subscription,
          as: 'subscription',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role']
            }
          ]
        }
      ]
    });

    // If still not found, check User table
    if (!elder) {
      console.log('⚠️ Not found by Elder ID or userId, checking User table...');
      const elderUser = await User.findOne({
        where: {
          id: providedId,
          role: 'elder'
        }
      });

      if (elderUser) {
        console.log('✅ Found in User table, checking for linked Elder record...');
        elder = await Elder.findOne({
          where: { userId: elderUser.id },
          include: [
            { model: User, as: 'user' },
            {
              model: Subscription,
              as: 'subscription',
              include: [{ model: User, as: 'user' }]
            }
          ]
        });

        if (!elder) {
          console.log('⚠️ No Elder record found, using User data');
          elder = {
            id: null,
            firstName: elderUser.firstName,
            lastName: elderUser.lastName,
            phone: elderUser.phone,
            userId: elderUser.id,
            user: elderUser,
            subscription: null
          };
        }
      } else {
        console.error('❌ Elder not found in any table:', providedId);
        console.log('⚠️ Proceeding with provided data...');
        elder = {
          id: providedId,
          firstName: extractedElderName ? extractedElderName.split(' ')[0] : 'Unknown',
          lastName: extractedElderName ? extractedElderName.split(' ').slice(1).join(' ') : 'Elder',
          phone: extractedElderPhone || 'Not available',
          userId: providedId,
          subscription: null
        };
      }
    }

    const actualElderId = elder.id || elder.userId || providedId;
    const actualUserId = elder.userId || providedId;

    console.log('✅ Elder data resolved:');
    console.log('   Elder ID:', actualElderId);
    console.log('   User ID:', actualUserId);
    console.log('   Name:', `${elder.firstName} ${elder.lastName}`);
    console.log('   Phone:', elder.phone);
    console.log('   Subscription ID:', elder.subscriptionId || 'None');

    // ========================================
    // 🚑 CREATE EMERGENCY ALERT FOR AMBULANCE SYSTEM
    // ========================================
    console.log('\n🚑 Creating Emergency Alert for Ambulance Dispatch...');
    
    // Parse location data
    let locationData = {
      latitude: null,
      longitude: null,
      address: 'Location unavailable'
    };
    
    if (extractedLocation) {
      if (typeof extractedLocation === 'object') {
        locationData.latitude = extractedLocation.latitude;
        locationData.longitude = extractedLocation.longitude;
        if (extractedLocation.address) {
          locationData.address = extractedLocation.address.formattedAddress || 
                                 `${extractedLocation.address.city || ''}, ${extractedLocation.address.region || ''}`.trim();
        }
      }
    }

    // Determine priority based on alert type or vitals
    let priority = 'high'; // default
    if (extractedAlertType === 'heart_attack' || extractedAlertType === 'stroke') {
      priority = 'critical';
    } else if (vitals) {
      // Check vitals for critical conditions
      if (vitals.heartRate > 120 || vitals.heartRate < 50 || vitals.oxygenLevel < 90) {
        priority = 'critical';
      }
    }

    // Create Emergency Alert
    const emergencyAlert = await EmergencyAlert.create({
      elderId: actualElderId,
      userId: actualUserId,
      alertType: extractedAlertType === 'SOS' ? 'sos' : extractedAlertType,
      priority: priority,
      status: 'pending',
      location: locationData,
      medicalInfo: {
        conditions: elder.medicalHistory?.conditions || [],
        allergies: elder.medicalHistory?.allergies || [],
        medications: elder.medicalHistory?.medications || [],
        bloodType: elder.bloodType || null
      },
      vitals: vitals || null
    });

    console.log(`✅ Emergency Alert created (ID: ${emergencyAlert.id})`);
    console.log(`   Priority: ${priority}`);
    console.log(`   Status: pending`);
    console.log(`   Location: ${locationData.address}`);

    // Notify coordinator via WebSocket
    try {
      const io = req.app.get('io');
      if (io) {
        emergencyWebSocketService.broadcastEmergencyAlert(io, {
          id: emergencyAlert.id,
          elderId: actualElderId,
          elderName: `${elder.firstName} ${elder.lastName}`,
          elderPhone: elder.phone,
          alertType: emergencyAlert.alertType,
          priority: priority,
          location: locationData,
          vitals: vitals,
          timestamp: emergencyAlert.createdAt
        });
        console.log('✅ Emergency alert broadcasted to coordinators via WebSocket');
      }
    } catch (wsError) {
      console.error('❌ WebSocket notification failed:', wsError.message);
    }

    // ========================================
    // 🎯 GET ASSIGNED STAFF
    // ========================================
    console.log('\n🔍 Fetching ASSIGNED caregivers...');
    const staffAssignments = await StaffAssignment.findAll({
      where: { 
        [Op.or]: [
          { elderId: actualElderId },
          { elderId: actualUserId }
        ],
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'staff',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role'],
          where: { isActive: true },
          required: true
        }
      ]
    });

    console.log(`✅ Found ${staffAssignments.length} ASSIGNED caregivers`);
    staffAssignments.forEach(assignment => {
      console.log(`   - ${assignment.staff.firstName} ${assignment.staff.lastName} (${assignment.staff.email})`);
    });

    // ========================================
    // 🎯 GET FAMILY MEMBER FROM SUBSCRIPTION
    // ========================================
    console.log('\n🔍 Fetching family member from subscription...');
    
    let familyMember = null;
    if (elder.subscription && elder.subscription.user) {
      familyMember = elder.subscription.user;
      console.log(`✅ Found family member from subscription:`);
      console.log(`   - ${familyMember.firstName} ${familyMember.lastName} (${familyMember.email})`);
      console.log(`   - Subscription ID: ${elder.subscription.id}`);
      console.log(`   - Plan: ${elder.subscription.plan}`);
      console.log(`   - Status: ${elder.subscription.status}`);
    } else if (elder.subscriptionId) {
      // If subscription not loaded, fetch it separately
      console.log('   Subscription not loaded, fetching separately...');
      const subscription = await Subscription.findByPk(elder.subscriptionId, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'role']
          }
        ]
      });
      
      if (subscription && subscription.user) {
        familyMember = subscription.user;
        console.log(`✅ Found family member from subscription:`);
        console.log(`   - ${familyMember.firstName} ${familyMember.lastName} (${familyMember.email})`);
      } else {
        console.log('⚠️ Subscription found but no user linked');
      }
    } else {
      console.log('⚠️ No subscription linked to this elder');
    }

    // ========================================
    // Combine ASSIGNED recipients
    // ========================================
    const recipients = [];
    
    // Add assigned caregivers
    staffAssignments.forEach(assignment => {
      if (assignment.staff) {
        recipients.push({
          id: assignment.staff.id,
          name: `${assignment.staff.firstName} ${assignment.staff.lastName}`,
          email: assignment.staff.email,
          phone: assignment.staff.phone,
          role: assignment.staff.role,
          type: 'caregiver'
        });
      }
    });

    // Add family member from subscription
    if (familyMember) {
      recipients.push({
        id: familyMember.id,
        name: `${familyMember.firstName} ${familyMember.lastName}`,
        email: familyMember.email,
        phone: familyMember.phone,
        role: familyMember.role || 'family_member',
        type: 'family'
      });
    }

    console.log(`\n📢 Total recipients: ${recipients.length}`);
    console.log(`   👨‍⚕️ Assigned staff: ${staffAssignments.length}`);
    console.log(`   👨‍👩‍👧‍👦 Family member (from subscription): ${familyMember ? 1 : 0}`);
    
    if (recipients.length === 0) {
      console.log('⚠️⚠️⚠️ NO RECIPIENTS FOUND! ⚠️⚠️⚠️');
      console.log('📋 To receive emergency alerts:');
      console.log('   1. Assign staff to this elder in StaffAssignment table');
      console.log('   2. Ensure elder has a subscription with a valid family member user');
      
      return res.status(200).json({
        success: true,
        message: 'Emergency alert received but no recipients available',
        warning: 'No assigned staff or subscription family member found',
        recipientCount: 0,
        elderInfo: {
          elderId: actualElderId,
          userId: actualUserId,
          elderName: extractedElderName,
          elderPhone: extractedElderPhone,
          location: extractedLocation,
          hasSubscription: !!elder.subscriptionId
        },
        instructions: [
          'Assign staff to this elder using StaffAssignment table',
          'Ensure this elder has a subscription with a family member user'
        ]
      });
    }

    // Format location
    let locationString = 'Location unavailable';
    if (extractedLocation) {
      if (typeof extractedLocation === 'string') {
        locationString = extractedLocation;
      } else if (extractedLocation.available) {
        const addr = extractedLocation.address;
        locationString = addr?.formattedAddress || 
                        `${addr?.city || ''}, ${addr?.region || ''}, ${addr?.country || ''}`.replace(/^, |, $/g, '') ||
                        `Lat: ${extractedLocation.latitude}, Long: ${extractedLocation.longitude}`;
      }
    }

    const finalElderName = extractedElderName || `${elder.firstName} ${elder.lastName}`;
    const emergencyMessage = {
      title: '🚨 EMERGENCY ALERT',
      body: `Emergency alert for ${finalElderName}`,
      elderName: finalElderName,
      elderId: actualElderId,
      elderPhone: extractedElderPhone || elder.phone || 'Not available',
      location: locationString,
      timestamp: extractedTimestamp,
      alertType: extractedAlertType,
      vitals: vitals || null,
      additionalInfo: additionalInfo || {}
    };

    console.log('\n📋 Emergency message:', JSON.stringify(emergencyMessage, null, 2));

    // Send notifications
    console.log('\n📤 Sending notifications and emails...');
    console.log(`   Sending to ${recipients.length} recipients:`);
    recipients.forEach(r => {
      console.log(`   - ${r.name} (${r.type}) - ${r.email}`);
    });
    
    const notificationPromises = [];
    const emailPromises = [];

    for (const recipient of recipients) {
      console.log(`\n👤 Processing: ${recipient.name} (${recipient.type}) - ${recipient.email}`);

      // In-app notification
      console.log(`   📱 Creating in-app notification...`);
      const notificationPromise = Notification.create({
        userId: recipient.id,
        elderId: actualUserId,
        type: 'emergency',
        title: emergencyMessage.title,
        message: `🚨 ${finalElderName} needs immediate assistance!\n📍 ${emergencyMessage.location}\n📞 ${emergencyMessage.elderPhone}`,
        priority: 'high',
        isRead: false,
        metadata: {
          alertType: emergencyMessage.alertType,
          location: emergencyMessage.location,
          timestamp: emergencyMessage.timestamp,
          elderPhone: emergencyMessage.elderPhone,
          vitals: emergencyMessage.vitals,
          additionalInfo: emergencyMessage.additionalInfo
        }
      })
      .then(notification => {
        console.log(`   ✅ In-app notification created (ID: ${notification.id})`);
        return notification;
      })
      .catch(err => {
        console.error(`   ❌ Notification failed:`, err.message);
        return null;
      });
      notificationPromises.push(notificationPromise);

      // Email
      console.log(`   📧 Sending email...`);
      const emailPromise = emailService.sendEmergencyAlert({
        to: recipient.email,
        recipientName: recipient.name,
        elderName: finalElderName,
        elderPhone: emergencyMessage.elderPhone,
        location: emergencyMessage.location,
        timestamp: emergencyMessage.timestamp,
        alertType: emergencyMessage.alertType,
        recipientRole: recipient.role
      })
      .then(result => {
        if (result.success) {
          console.log(`   ✅ Email sent successfully to ${recipient.email}`);
        } else {
          console.error(`   ❌ Email failed:`, result.error);
        }
        return result;
      })
      .catch(err => {
        console.error(`   ❌ Email error:`, err.message);
        return { success: false, error: err.message };
      });
      emailPromises.push(emailPromise);
    }

    console.log('\n⏳ Waiting for all notifications and emails...');
    const notificationResults = await Promise.allSettled(notificationPromises);
    const emailResults = await Promise.allSettled(emailPromises);

    const successfulNotifications = notificationResults.filter(
      r => r.status === 'fulfilled' && r.value
    ).length;
    
    const successfulEmails = emailResults.filter(
      r => r.status === 'fulfilled' && r.value?.success !== false
    ).length;

    console.log('\n✅✅✅ EMERGENCY ALERTS COMPLETED ✅✅✅');
    console.log(`📱 In-app notifications: ${successfulNotifications}/${recipients.length}`);
    console.log(`📧 Email notifications: ${successfulEmails}/${recipients.length}`);
    console.log(`   👨‍⚕️ Staff notified: ${staffAssignments.length}`);
    console.log(`   👨‍👩‍👧‍👦 Family notified: ${familyMember ? 1 : 0}`);
    console.log(`👥 Total recipients: ${recipients.length}`);

    // Log individual results
    recipients.forEach((recipient, index) => {
      const notifSuccess = notificationResults[index]?.status === 'fulfilled' && notificationResults[index]?.value;
      const emailSuccess = emailResults[index]?.status === 'fulfilled' && emailResults[index]?.value?.success !== false;
      console.log(`   ${recipient.name}: 📱 ${notifSuccess ? '✅' : '❌'} | 📧 ${emailSuccess ? '✅' : '❌'}`);
    });

    res.json({
      success: true,
      message: 'Emergency alerts sent to assigned staff and subscription family member',
      recipientCount: recipients.length,
      notificationsSent: successfulNotifications,
      emailsSent: successfulEmails,
      recipients: recipients.map(r => ({
        name: r.name,
        role: r.role,
        type: r.type,
        email: r.email
      })),
      breakdown: {
        staff: staffAssignments.length,
        family: familyMember ? 1 : 0
      },
      emergencyData: {
        elderName: finalElderName,
        elderPhone: emergencyMessage.elderPhone,
        location: emergencyMessage.location,
        timestamp: emergencyMessage.timestamp,
        alertType: emergencyMessage.alertType
      }
    });

  } catch (error) {
    console.error('\n❌❌❌ EMERGENCY ALERT ERROR ❌❌❌');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Failed to process emergency alert',
      error: error.message
    });
  }
};

module.exports = {
  handleEmergencyAlert
};