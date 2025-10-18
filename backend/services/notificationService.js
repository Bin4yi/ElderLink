// backend/services/notificationService.js
const { Notification } = require('../models');

/**
 * Notification service for sending real-time notifications
 * Integrates with existing Notification model and Socket.IO
 * NO Firebase - uses database + Socket.IO only
 */
class NotificationService {
  constructor() {
    this.io = null; // Will be set by server.js
  }

  /**
   * Set Socket.IO instance
   * @param {Object} socketIO - Socket.IO server instance
   */
  setSocketIO(socketIO) {
    this.io = socketIO;
    console.log('✅ Socket.IO configured for NotificationService (No Firebase)');
  }

  /**
   * Send Zoom meeting link notification to mobile app
   * Creates a notification in the database that the mobile app can fetch and display
   * @param {Object} notificationData - Notification details
   */
  async sendZoomLinkNotification(notificationData) {
    try {
      const {
        userId, // Elder's family member user ID
        elderId,
        title,
        message,
        zoomJoinUrl,
        sessionId,
        sessionDate,
        sessionTime
      } = notificationData;

      // Create notification in database
      // Mobile app will fetch this via GET /api/notifications endpoint
      const notification = await Notification.create({
        userId,
        type: 'zoom_link',
        title: title || 'Zoom Meeting Scheduled',
        message: message || 'Your monthly health session is scheduled',
        data: JSON.stringify({
          zoomJoinUrl,
          sessionId,
          elderId,
          sessionDate,
          sessionTime,
          action: 'join_zoom'
        }),
        isRead: false
      });

      console.log('✅ Zoom link notification created in database:', notification.id);
      console.log('📱 Mobile app can fetch this notification from GET /api/notifications');

      // Send real-time notification via Socket.IO (if connected)
      if (this.io) {
        this.io.to(`user-${userId}`).emit('notification', {
          id: notification.id,
          type: 'zoom_link',
          title: notification.title,
          message: notification.message,
          data: {
            zoomJoinUrl,
            sessionId,
            elderId,
            sessionDate,
            sessionTime
          },
          createdAt: notification.createdAt
        });

        console.log('✅ Real-time notification sent via Socket.IO to user:', userId);
      }

      return {
        success: true,
        notificationId: notification.id,
        message: 'Notification saved. Mobile app will display it as an info card.'
      };
    } catch (error) {
      console.error('❌ Error sending Zoom link notification:', error.message);
      throw error;
    }
  }

  /**
   * Send session completion notification
   * @param {Object} notificationData - Notification details
   */
  async sendSessionCompletionNotification(notificationData) {
    try {
      const {
        userId,
        elderId,
        doctorName,
        sessionDate,
        prescriptionAvailable,
        pharmacyName
      } = notificationData;

      const message = prescriptionAvailable
        ? `Session completed. Prescription sent to ${pharmacyName}.`
        : `Session with Dr. ${doctorName} completed successfully.`;

      // Create notification in database
      const notification = await Notification.create({
        userId,
        type: 'session_completed',
        title: 'Health Session Completed',
        message,
        data: JSON.stringify({
          elderId,
          doctorName,
          sessionDate,
          prescriptionAvailable,
          pharmacyName,
          action: 'view_session_summary'
        }),
        isRead: false
      });

      console.log('✅ Session completion notification created:', notification.id);

      // Send real-time notification via Socket.IO
      if (this.io) {
        this.io.to(`user-${userId}`).emit('notification', {
          id: notification.id,
          type: 'session_completed',
          title: notification.title,
          message: notification.message,
          data: {
            elderId,
            doctorName,
            sessionDate,
            prescriptionAvailable
          },
          createdAt: notification.createdAt
        });
      }

      return {
        success: true,
        notificationId: notification.id
      };
    } catch (error) {
      console.error('❌ Error sending session completion notification:', error.message);
      throw error;
    }
  }

  /**
   * Send session reminder notification (24 hours before session)
   * @param {Object} notificationData - Notification details
   */
  async sendSessionReminderNotification(notificationData) {
    try {
      const {
        userId,
        elderId,
        elderName,
        doctorName,
        sessionDate,
        sessionTime,
        sessionId,
        zoomJoinUrl
      } = notificationData;

      const notification = await Notification.create({
        userId,
        type: 'session_reminder',
        title: 'Upcoming Health Session Reminder',
        message: `${elderName}'s session with Dr. ${doctorName} is tomorrow at ${sessionTime}`,
        data: JSON.stringify({
          elderId,
          elderName,
          doctorName,
          sessionDate,
          sessionTime,
          sessionId,
          zoomJoinUrl,
          action: 'view_session'
        }),
        isRead: false
      });

      console.log('✅ Session reminder notification created:', notification.id);

      // Send real-time notification via Socket.IO
      if (this.io) {
        this.io.to(`user-${userId}`).emit('notification', {
          id: notification.id,
          type: 'session_reminder',
          title: notification.title,
          message: notification.message,
          data: {
            elderId,
            sessionDate,
            sessionTime,
            zoomJoinUrl
          },
          createdAt: notification.createdAt
        });
      }

      return {
        success: true,
        notificationId: notification.id
      };
    } catch (error) {
      console.error('❌ Error sending session reminder notification:', error.message);
      throw error;
    }
  }

  /**
   * Send prescription ready notification
   * @param {Object} notificationData - Notification details
   */
  async sendPrescriptionReadyNotification(notificationData) {
    try {
      const {
        userId,
        elderName,
        pharmacyName,
        prescriptionId
      } = notificationData;

      const notification = await Notification.create({
        userId,
        type: 'prescription_ready',
        title: 'Prescription Ready for Pickup',
        message: `${elderName}'s prescription is ready at ${pharmacyName}`,
        data: JSON.stringify({
          prescriptionId,
          pharmacyName,
          action: 'view_prescription'
        }),
        isRead: false
      });

      // Send real-time notification via Socket.IO
      if (this.io) {
        this.io.to(`user-${userId}`).emit('notification', {
          id: notification.id,
          type: 'prescription_ready',
          title: notification.title,
          message: notification.message,
          data: {
            prescriptionId,
            pharmacyName
          },
          createdAt: notification.createdAt
        });
      }

      return {
        success: true,
        notificationId: notification.id
      };
    } catch (error) {
      console.error('❌ Error sending prescription ready notification:', error.message);
      throw error;
    }
  }

  /**
   * Send bulk notifications to multiple users
   * @param {Array} notifications - Array of notification objects
   */
  async sendBulkNotifications(notifications) {
    try {
      const results = [];

      for (const notif of notifications) {
        try {
          let result;
          
          switch (notif.type) {
            case 'zoom_link':
              result = await this.sendZoomLinkNotification(notif);
              break;
            case 'session_completed':
              result = await this.sendSessionCompletionNotification(notif);
              break;
            case 'session_reminder':
              result = await this.sendSessionReminderNotification(notif);
              break;
            default:
              throw new Error(`Unknown notification type: ${notif.type}`);
          }

          results.push({ ...result, userId: notif.userId });
        } catch (error) {
          results.push({
            success: false,
            userId: notif.userId,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('❌ Error sending bulk notifications:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new NotificationService();
