// backend/services/notificationService.js
const { AppointmentNotification, User } = require('../models');

class NotificationService {
  
  // Create appointment notification
  static async createAppointmentNotification({ 
    appointmentId, 
    recipientId, 
    type, 
    title, 
    message, 
    method = 'in_app' 
  }) {
    try {
      const notification = await AppointmentNotification.create({
        appointmentId,
        recipientId,
        type,
        title,
        message,
        method,
        isRead: false,
        sentAt: new Date()
      });

      // TODO: Implement real-time notification (Socket.IO)
      // this.sendRealTimeNotification(recipientId, notification);

      // TODO: Send email/SMS if method requires it
      if (method === 'email' || method === 'sms') {
        // await this.sendExternalNotification(notification);
      }

      return notification;
    } catch (error) {
      console.error('Create notification error:', error);
      throw error;
    }
  }

  // Get user notifications
  static async getUserNotifications(userId, { page = 1, limit = 20, isRead } = {}) {
    try {
      const offset = (page - 1) * limit;
      const whereClause = { recipientId: userId };
      
      if (typeof isRead === 'boolean') {
        whereClause.isRead = isRead;
      }

      const notifications = await AppointmentNotification.findAndCountAll({
        where: whereClause,
        order: [['sentAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      return {
        notifications: notifications.rows,
        pagination: {
          total: notifications.count,
          page: parseInt(page),
          pages: Math.ceil(notifications.count / limit)
        }
      };
    } catch (error) {
      console.error('Get user notifications error:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markAsRead(notificationId, userId) {
    try {
      const notification = await AppointmentNotification.findOne({
        where: { 
          id: notificationId,
          recipientId: userId 
        }
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      await notification.update({
        isRead: true,
        readAt: new Date()
      });

      return notification;
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }

  // Mark all notifications as read
  static async markAllAsRead(userId) {
    try {
      await AppointmentNotification.update(
        { 
          isRead: true,
          readAt: new Date()
        },
        {
          where: { 
            recipientId: userId,
            isRead: false
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }

  // Send appointment reminders (to be called by cron job)
  static async sendAppointmentReminders() {
    try {
      const { Appointment, Elder, Doctor } = require('../models');
      const { Op } = require('sequelize');
      
      // Get appointments that are 24 hours away and haven't sent reminders
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const startOfTomorrow = new Date(tomorrow.setHours(0, 0, 0, 0));
      const endOfTomorrow = new Date(tomorrow.setHours(23, 59, 59, 999));

      const appointments = await Appointment.findAll({
        where: {
          appointmentDate: {
            [Op.between]: [startOfTomorrow, endOfTomorrow]
          },
          status: 'approved',
          reminderSent: false
        },
        include: [
          {
            model: Elder,
            as: 'elder'
          },
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user'
              }
            ]
          },
          {
            model: User,
            as: 'familyMember'
          }
        ]
      });

      for (const appointment of appointments) {
        // Send reminder to family member
        await this.createAppointmentNotification({
          appointmentId: appointment.id,
          recipientId: appointment.familyMemberId,
          type: 'reminder',
          title: 'Appointment Reminder',
          message: `Reminder: ${appointment.elder.firstName} ${appointment.elder.lastName} has an appointment tomorrow at ${appointment.appointmentDate.toLocaleTimeString()}`
        });

        // Send reminder to doctor
        await this.createAppointmentNotification({
          appointmentId: appointment.id,
          recipientId: appointment.doctor.userId,
          type: 'reminder',
          title: 'Appointment Reminder',
          message: `Reminder: Appointment with ${appointment.elder.firstName} ${appointment.elder.lastName} tomorrow at ${appointment.appointmentDate.toLocaleTimeString()}`
        });

        // Mark reminder as sent
        await appointment.update({ reminderSent: true });
      }

      console.log(`✅ Sent reminders for ${appointments.length} appointments`);
      return appointments.length;
    } catch (error) {
      console.error('Send appointment reminders error:', error);
      throw error;
    }
  }

  // TODO: Implement real-time notifications
  static sendRealTimeNotification(userId, notification) {
    // Implement Socket.IO integration
    // const io = require('../socket');
    // io.to(`user_${userId}`).emit('new_notification', notification);
  }

  // TODO: Implement external notifications (email/SMS)
  static async sendExternalNotification(notification) {
    // Implement email/SMS service integration
    // if (notification.method === 'email') {
    //   await EmailService.sendNotificationEmail(notification);
    // } else if (notification.method === 'sms') {
    //   await SMSService.sendNotificationSMS(notification);
    // }
  }
}

module.exports = NotificationService;

// backend/services/zoomService.js
const axios = require('axios');

class ZoomService {
  constructor() {
    this.baseURL = 'https://api.zoom.us/v2';
    this.accountId = process.env.ZOOM_ACCOUNT_ID;
    this.clientId = process.env.ZOOM_CLIENT_ID;
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET;
  }

  // Get OAuth token
  async getAccessToken() {
    try {
      const response = await axios.post(
        'https://zoom.us/oauth/token',
        `grant_type=account_credentials&account_id=${this.accountId}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      return response.data.access_token;
    } catch (error) {
      console.error('Zoom OAuth error:', error.response?.data || error.message);
      throw new Error('Failed to get Zoom access token');
    }
  }

  // Create Zoom meeting
  async createMeeting({ topic, start_time, duration, agenda }) {
    try {
      const accessToken = await this.getAccessToken();

      const meetingData = {
        topic,
        type: 2, // Scheduled meeting
        start_time: new Date(start_time).toISOString(),
        duration, // Duration in minutes
        timezone: 'UTC',
        agenda,
        settings: {
          host_video: true,
          participant_video: true,
          cn_meeting: false,
          in_meeting: false,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 0,
          audio: 'both',
          auto_recording: 'none',
          enforce_login: false,
          registrants_email_notification: false,
          waiting_room: true,
          allow_multiple_devices: false
        }
      };

      const response = await axios.post(
        `${this.baseURL}/users/me/meetings`,
        meetingData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.id,
        join_url: response.data.join_url,
        password: response.data.password,
        host_url: response.data.start_url
      };
    } catch (error) {
      console.error('Create Zoom meeting error:', error.response?.data || error.message);
      throw new Error('Failed to create Zoom meeting');
    }
  }

  // Update Zoom meeting
  async updateMeeting(meetingId, updateData) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.patch(
        `${this.baseURL}/meetings/${meetingId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Update Zoom meeting error:', error.response?.data || error.message);
      throw new Error('Failed to update Zoom meeting');
    }
  }

  // Delete Zoom meeting
  async deleteMeeting(meetingId) {
    try {
      const accessToken = await this.getAccessToken();

      await axios.delete(
        `${this.baseURL}/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return true;
    } catch (error) {
      console.error('Delete Zoom meeting error:', error.response?.data || error.message);
      throw new Error('Failed to delete Zoom meeting');
    }
  }

  // Get meeting details
  async getMeetingDetails(meetingId) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${this.baseURL}/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Get Zoom meeting details error:', error.response?.data || error.message);
      throw new Error('Failed to get Zoom meeting details');
    }
  }
}

module.exports = new ZoomService();

// backend/services/appointmentReminderService.js
const cron = require('node-cron');
const NotificationService = require('./notificationService');

class AppointmentReminderService {
  
  // Initialize reminder cron jobs
  static initializeReminders() {
    // Run daily at 9:00 AM to send 24-hour reminders
    cron.schedule('0 9 * * *', async () => {
      console.log('🔔 Running daily appointment reminders...');
      try {
        const count = await NotificationService.sendAppointmentReminders();
        console.log(`✅ Sent ${count} appointment reminders`);
      } catch (error) {
        console.error('❌ Failed to send appointment reminders:', error);
      }
    }, {
      timezone: "UTC"
    });

    // Run every 2 hours to send immediate reminders (30 minutes before)
    cron.schedule('0 */2 * * *', async () => {
      console.log('🔔 Running immediate appointment reminders...');
      try {
        await this.sendImmediateReminders();
      } catch (error) {
        console.error('❌ Failed to send immediate reminders:', error);
      }
    }, {
      timezone: "UTC"
    });

    console.log('✅ Appointment reminder service initialized');
  }

  // Send reminders 30 minutes before appointment
  static async sendImmediateReminders() {
    try {
      const { Appointment, Elder, Doctor, User } = require('../models');
      const { Op } = require('sequelize');
      
      const now = new Date();
      const thirtyMinutesLater = new Date(now.getTime() + (30 * 60 * 1000));
      const fortyMinutesLater = new Date(now.getTime() + (40 * 60 * 1000));

      const appointments = await Appointment.findAll({
        where: {
          appointmentDate: {
            [Op.between]: [thirtyMinutesLater, fortyMinutesLater]
          },
          status: 'approved'
        },
        include: [
          {
            model: Elder,
            as: 'elder'
          },
          {
            model: Doctor,
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user'
              }
            ]
          },
          {
            model: User,
            as: 'familyMember'
          }
        ]
      });

      for (const appointment of appointments) {
        // Send immediate reminder to family member
        await NotificationService.createAppointmentNotification({
          appointmentId: appointment.id,
          recipientId: appointment.familyMemberId,
          type: 'reminder',
          title: 'Appointment Starting Soon',
          message: `${appointment.elder.firstName} ${appointment.elder.lastName}'s appointment starts in 30 minutes. Join URL: ${appointment.zoomJoinUrl}`
        });

        // Send immediate reminder to doctor
        await NotificationService.createAppointmentNotification({
          appointmentId: appointment.id,
          recipientId: appointment.doctor.userId,
          type: 'reminder',
          title: 'Appointment Starting Soon',
          message: `Appointment with ${appointment.elder.firstName} ${appointment.elder.lastName} starts in 30 minutes`
        });
      }

      console.log(`✅ Sent immediate reminders for ${appointments.length} appointments`);
      return appointments.length;
    } catch (error) {
      console.error('Send immediate reminders error:', error);
      throw error;
    }
  }
}

module.exports = AppointmentReminderService;

// backend/config/env.example
/*
Add these environment variables to your .env file:

# Zoom Integration
ZOOM_ACCOUNT_ID=your_zoom_account_id
ZOOM_CLIENT_ID=your_zoom_client_id
ZOOM_CLIENT_SECRET=your_zoom_client_secret

# Email Service (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# SMS Service (Optional)
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_phone
*/