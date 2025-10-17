// backend/controllers/mobileNotificationController.js
const { MonthlySession, Elder, User, Doctor, Notification } = require('../models');
const { Op } = require('sequelize');

/**
 * Get Zoom meeting details for family member's upcoming sessions
 * For mobile app to display meeting information cards
 */
const getUpcomingZoomMeetings = async (req, res) => {
  try {
    const userId = req.user.id; // Family member user ID
    const { limit = 10 } = req.query;

    console.log('📱 Getting upcoming Zoom meetings for user:', userId);

    // Find all upcoming sessions for this family member
    const sessions = await MonthlySession.findAll({
      where: {
        familyMemberId: userId,
        status: {
          [Op.in]: ['scheduled', 'in-progress']
        },
        zoomMeetingId: {
          [Op.not]: null // Only sessions with Zoom meetings
        },
        sessionDate: {
          [Op.gte]: new Date() // Only future or today's sessions
        }
      },
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email']
          }]
        }
      ],
      order: [['sessionDate', 'ASC'], ['sessionTime', 'ASC']],
      limit: parseInt(limit)
    });

    console.log(`✅ Found ${sessions.length} upcoming sessions with Zoom meetings`);

    // Format response for mobile app
    const zoomMeetings = sessions.map(session => ({
      id: session.id,
      sessionDate: session.sessionDate,
      sessionTime: session.sessionTime,
      duration: session.duration,
      status: session.status,
      elder: {
        id: session.elder.id,
        name: `${session.elder.firstName} ${session.elder.lastName}`
      },
      doctor: {
        name: `Dr. ${session.doctor.user.firstName} ${session.doctor.user.lastName}`,
        email: session.doctor.user.email
      },
      zoom: {
        meetingId: session.zoomMeetingId,
        joinUrl: session.zoomJoinUrl,
        password: session.zoomPassword
      },
      // Format date/time for display
      displayDate: new Date(session.sessionDate).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      displayTime: session.sessionTime,
      // Check if session is today
      isToday: new Date(session.sessionDate).toDateString() === new Date().toDateString()
    }));

    res.json({
      success: true,
      data: {
        meetings: zoomMeetings,
        count: zoomMeetings.length
      }
    });
  } catch (error) {
    console.error('❌ Error getting Zoom meetings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Zoom meetings',
      error: error.message
    });
  }
};

/**
 * Get single Zoom meeting details
 */
const getZoomMeetingById = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    console.log('📱 Getting Zoom meeting for session:', sessionId);

    const session = await MonthlySession.findOne({
      where: {
        id: sessionId,
        familyMemberId: userId // Ensure user owns this session
      },
      include: [
        {
          model: Elder,
          as: 'elder',
          attributes: ['id', 'firstName', 'lastName']
        },
        {
          model: Doctor,
          as: 'doctor',
          include: [{
            model: User,
            as: 'user',
            attributes: ['firstName', 'lastName', 'email', 'phone']
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

    // Check if Zoom meeting exists
    if (!session.zoomMeetingId) {
      return res.status(404).json({
        success: false,
        message: 'No Zoom meeting scheduled for this session',
        hasZoomMeeting: false
      });
    }

    res.json({
      success: true,
      hasZoomMeeting: true,
      data: {
        id: session.id,
        sessionDate: session.sessionDate,
        sessionTime: session.sessionTime,
        duration: session.duration,
        status: session.status,
        elder: {
          id: session.elder.id,
          name: `${session.elder.firstName} ${session.elder.lastName}`
        },
        doctor: {
          name: `Dr. ${session.doctor.user.firstName} ${session.doctor.user.lastName}`,
          email: session.doctor.user.email,
          phone: session.doctor.user.phone
        },
        zoom: {
          meetingId: session.zoomMeetingId,
          joinUrl: session.zoomJoinUrl,
          password: session.zoomPassword
        },
        notes: session.notes,
        displayDate: new Date(session.sessionDate).toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        displayTime: session.sessionTime,
        isToday: new Date(session.sessionDate).toDateString() === new Date().toDateString()
      }
    });
  } catch (error) {
    console.error('❌ Error getting Zoom meeting:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Zoom meeting',
      error: error.message
    });
  }
};

/**
 * Get all notifications for user (for mobile app notification center)
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20, unreadOnly = false } = req.query;

    console.log('📱 Getting notifications for user:', userId);

    const whereClause = { userId };
    if (unreadOnly === 'true') {
      whereClause.isRead = false;
    }

    const notifications = await Notification.findAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        notifications: notifications.map(n => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          data: n.data ? JSON.parse(n.data) : {},
          isRead: n.isRead,
          createdAt: n.createdAt
        })),
        unreadCount: notifications.filter(n => !n.isRead).length
      }
    });
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get notifications',
      error: error.message
    });
  }
};

/**
 * Mark notification as read
 */
const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.update({ isRead: true });

    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read',
      error: error.message
    });
  }
};

/**
 * Mark all notifications as read
 */
const markAllNotificationsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await Notification.update(
      { isRead: true },
      {
        where: {
          userId,
          isRead: false
        }
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read',
      error: error.message
    });
  }
};

module.exports = {
  getUpcomingZoomMeetings,
  getZoomMeetingById,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
};
