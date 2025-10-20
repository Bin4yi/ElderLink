// backend/controllers/monthlySessionZoomController.js
const { MonthlySession, Elder, User, Doctor, Prescription, PrescriptionItem } = require('../models');
const zoomService = require('../services/zoomService');
const emailService = require('../services/emailService');
const notificationService = require('../services/notificationService');
const sequelize = require('../config/database');

/**
 * Create Zoom meeting for a monthly session
 */
const createZoomMeeting = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const doctorUserId = req.user.id;

    console.log('📹 Creating Zoom meeting for session:', sessionId);

    // Find the session with all related data
    const session = await MonthlySession.findByPk(sessionId, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth', 'photo']
        },
        {
          model: User,
          as: 'familyMember',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify doctor owns this session
    if (session.doctor.userId !== doctorUserId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to create a meeting for this session'
      });
    }

    // Check if Zoom meeting already exists
    if (session.zoomMeetingId) {
      return res.status(400).json({
        success: false,
        message: 'Zoom meeting already exists for this session',
        data: {
          meetingId: session.zoomMeetingId,
          joinUrl: session.zoomJoinUrl
        }
      });
    }

    // Create Zoom meeting
    const meeting = await zoomService.createMeetingForSession(
      session,
      session.doctor.user,
      session.elder
    );

    // Update session with Zoom details
    await session.update({
      zoomMeetingId: meeting.meetingId,
      zoomJoinUrl: meeting.joinUrl,
      zoomPassword: meeting.password,
      zoomStartUrl: meeting.startUrl
    });

    console.log('✅ Zoom meeting created and saved:', meeting.meetingId);

    res.json({
      success: true,
      message: 'Zoom meeting created successfully',
      data: {
        sessionId: session.id,
        meetingId: meeting.meetingId,
        joinUrl: meeting.joinUrl,
        startUrl: meeting.startUrl,
        password: meeting.password,
        topic: meeting.topic,
        startTime: meeting.startTime
      }
    });
  } catch (error) {
    console.error('❌ Error creating Zoom meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create Zoom meeting',
      error: error.message
    });
  }
};

/**
 * Send Zoom meeting links to family member and elder
 */
const sendMeetingLinks = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const doctorUserId = req.user.id;

    console.log('📧 Sending meeting links for session:', sessionId);

    // Find the session with all related data
    const session = await MonthlySession.findByPk(sessionId, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName', 'dateOfBirth']
        },
        {
          model: User,
          as: 'familyMember',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email']
          }]
        }
      ]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify doctor owns this session
    if (session.doctor.userId !== doctorUserId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to send links for this session'
      });
    }

    // Check if Zoom meeting exists
    if (!session.zoomMeetingId || !session.zoomJoinUrl) {
      return res.status(400).json({
        success: false,
        message: 'No Zoom meeting found for this session. Create a meeting first.'
      });
    }

    const results = {
      email: null,
      notification: null
    };

    // Send email to family member
    if (session.familyMember && session.familyMember.email) {
      try {
        await emailService.sendZoomLinkToFamily({
          to: session.familyMember.email,
          familyMemberName: session.familyMember.firstName,
          elderName: `${session.elder.firstName} ${session.elder.lastName}`,
          doctorName: `${session.doctor.user.firstName} ${session.doctor.user.lastName}`,
          sessionDate: session.sessionDate,
          sessionTime: session.sessionTime,
          zoomJoinUrl: session.zoomJoinUrl,
          zoomPassword: session.zoomPassword,
          duration: session.duration
        });

        results.email = {
          success: true,
          recipient: session.familyMember.email
        };

        console.log('✅ Email sent to family member');
      } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        results.email = {
          success: false,
          error: error.message
        };
      }
    }

    // Send push notification to mobile app
    try {
      await notificationService.sendZoomLinkNotification({
        userId: session.familyMemberId,
        elderId: session.elderId,
        title: 'Monthly Health Session Scheduled',
        message: `Zoom meeting link for ${session.elder.firstName}'s session is ready`,
        zoomJoinUrl: session.zoomJoinUrl,
        sessionId: session.id,
        sessionDate: session.sessionDate,
        sessionTime: session.sessionTime
      });

      results.notification = { success: true };
      console.log('✅ Push notification sent');
    } catch (error) {
      console.error('❌ Failed to send notification:', error.message);
      results.notification = {
        success: false,
        error: error.message
      };
    }

    res.json({
      success: true,
      message: 'Meeting links sent successfully',
      data: results
    });
  } catch (error) {
    console.error('❌ Error sending meeting links:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send meeting links',
      error: error.message
    });
  }
};

/**
 * Complete a monthly session and optionally upload prescription
 */
const completeSession = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { sessionId } = req.params;
    const {
      doctorNotes,
      sessionSummary,
      vitalSigns,
      nextSessionDate,
      prescription, // { pharmacyId, items: [...] }
    } = req.body;
    const doctorUserId = req.user.id;

    console.log('✅ Completing session:', sessionId);

    // Find the session
    const session = await MonthlySession.findByPk(sessionId, {
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: User,
          as: 'familyMember',
          attributes: ['id', 'firstName', 'lastName', 'email']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'firstName', 'lastName']
          }]
        }
      ],
      transaction
    });

    if (!session) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    // Verify doctor owns this session
    if (session.doctor.userId !== doctorUserId) {
      await transaction.rollback();
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to complete this session'
      });
    }

    // Update session
    await session.update({
      status: 'completed',
      doctorNotes,
      sessionSummary,
      vitalSigns: vitalSigns ? JSON.stringify(vitalSigns) : null,
      nextSessionDate,
      completedAt: new Date()
    }, { transaction });

    let prescriptionData = null;

    // Create prescription if provided
    if (prescription && prescription.items && prescription.items.length > 0) {
      console.log('💊 Creating prescription...');

      // Generate prescription number
      const prescriptionNumber = `RX-${Date.now()}-${session.elder.id.substring(0, 8)}`;

      // Calculate valid until date (30 days from now)
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + 30);

      // Create prescription
      const newPrescription = await Prescription.create({
        prescriptionNumber,
        doctorId: doctorUserId,
        elderId: session.elderId,
        pharmacyId: prescription.pharmacyId,
        status: 'pending',
        issuedDate: new Date(),
        validUntil,
        notes: prescription.notes || '',
        priority: prescription.priority || 'normal',
        deliveryRequired: prescription.deliveryRequired || false,
        deliveryAddress: prescription.deliveryAddress || null
      }, { transaction });

      // Create prescription items
      const prescriptionItems = await Promise.all(
        prescription.items.map(item =>
          PrescriptionItem.create({
            prescriptionId: newPrescription.id,
            medicationName: item.medicationName,
            dosage: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            quantityPrescribed: item.quantity,
            instructions: item.instructions || '',
            status: 'pending'
          }, { transaction })
        )
      );

      prescriptionData = {
        id: newPrescription.id,
        prescriptionNumber: newPrescription.prescriptionNumber,
        itemsCount: prescriptionItems.length
      };

      console.log('✅ Prescription created:', prescriptionData.prescriptionNumber);
    }

    await transaction.commit();

    // Send completion email asynchronously (don't wait)
    if (session.familyMember && session.familyMember.email) {
      emailService.sendSessionCompletionEmail({
        to: session.familyMember.email,
        familyMemberName: session.familyMember.firstName,
        elderName: `${session.elder.firstName} ${session.elder.lastName}`,
        doctorName: `${session.doctor.user.firstName} ${session.doctor.user.lastName}`,
        sessionDate: session.sessionDate,
        doctorNotes,
        prescriptionDetails: prescriptionData ? `Prescription ${prescriptionData.prescriptionNumber} created` : null,
        pharmacyName: prescription?.pharmacyName || 'Selected Pharmacy',
        nextSessionDate
      }).catch(err => console.error('❌ Failed to send completion email:', err));
    }

    // Send push notification
    notificationService.sendSessionCompletionNotification({
      userId: session.familyMemberId,
      elderId: session.elderId,
      doctorName: `${session.doctor.user.firstName} ${session.doctor.user.lastName}`,
      sessionDate: session.sessionDate,
      prescriptionAvailable: !!prescriptionData,
      pharmacyName: prescription?.pharmacyName || null
    }).catch(err => console.error('❌ Failed to send completion notification:', err));

    res.json({
      success: true,
      message: 'Session completed successfully',
      data: {
        sessionId: session.id,
        status: session.status,
        completedAt: session.completedAt,
        prescription: prescriptionData
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Error completing session:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete session',
      error: error.message
    });
  }
};

/**
 * Get pharmacies list for prescription upload
 */
const getPharmacies = async (req, res) => {
  try {
    console.log('🏥 Fetching pharmacies...');

    const pharmacies = await User.findAll({
      where: {
        role: 'pharmacist',
        isActive: true
      },
      attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'address'],
      order: [['firstName', 'ASC']]
    });

    console.log(`✅ Found ${pharmacies.length} pharmacies`);

    res.json({
      success: true,
      data: {
        pharmacies: pharmacies.map(p => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
          email: p.email,
          phone: p.phone,
          address: p.address
        }))
      }
    });
  } catch (error) {
    console.error('❌ Error fetching pharmacies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pharmacies',
      error: error.message
    });
  }
};

/**
 * Start a Zoom meeting (get start URL)
 */
const startMeeting = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const doctorUserId = req.user.id;

    const session = await MonthlySession.findByPk(sessionId, {
      include: [{
        model: Doctor,
        as: 'doctor'
      }]
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.doctor.userId !== doctorUserId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!session.zoomMeetingId) {
      return res.status(400).json({
        success: false,
        message: 'No Zoom meeting found for this session'
      });
    }

    // Update session status
    await session.update({
      status: 'in-progress'
    });

    res.json({
      success: true,
      data: {
        startUrl: session.zoomStartUrl,
        joinUrl: session.zoomJoinUrl,
        meetingId: session.zoomMeetingId
      }
    });
  } catch (error) {
    console.error('❌ Error starting meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start meeting',
      error: error.message
    });
  }
};

module.exports = {
  createZoomMeeting,
  sendMeetingLinks,
  completeSession,
  getPharmacies,
  startMeeting
};
