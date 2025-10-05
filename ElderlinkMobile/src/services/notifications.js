import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import apiService from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { StorageUtils } from '../utils/storage';

/**
 * Notifications service for handling push notifications and local notifications
 * Optimized for elderly users with clear, simple messaging
 */

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationsService = {
  /**
   * Initialize notification system
   */
  initialize: async () => {
    try {
      console.log('🔔 Initializing notifications...');
      
      // Request permissions
      const permissions = await notificationsService.requestPermissions();
      
      if (!permissions.granted) {
        console.warn('Notification permissions not granted');
        return {
          success: false,
          error: 'Notification permissions not granted',
        };
      }

      // Get push token if on physical device
      let pushToken = null;
      if (Device.isDevice) {
        pushToken = await notificationsService.getPushToken();
      }

      // Register push token with backend
      if (pushToken) {
        await notificationsService.registerPushToken(pushToken);
      }

      console.log('✅ Notifications initialized successfully');
      
      return {
        success: true,
        permissions,
        pushToken,
      };
    } catch (error) {
      console.error('❌ Notification initialization error:', error);
      return {
        success: false,
        error: error.message || 'Failed to initialize notifications',
      };
    }
  },

  /**
   * Request notification permissions
   */
  requestPermissions: async () => {
    try {
      console.log('📱 Requesting notification permissions...');
      
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      console.log('✅ Notification permissions status:', finalStatus);
      
      return {
        granted: finalStatus === 'granted',
        status: finalStatus,
      };
    } catch (error) {
      console.error('❌ Request permissions error:', error);
      return {
        granted: false,
        status: 'error',
        error: error.message,
      };
    }
  },

  /**
   * Get push notification token
   */
  getPushToken: async () => {
    try {
      console.log('🎯 Getting push notification token...');
      
      if (!Device.isDevice) {
        console.warn('Push notifications don\'t work on simulator');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      console.log('✅ Push token obtained:', token.data);
      
      return token.data;
    } catch (error) {
      console.error('❌ Get push token error:', error);
      return null;
    }
  },

  /**
   * Register push token with backend
   */
  registerPushToken: async (pushToken) => {
    try {
      console.log('📝 Registering push token with backend...');
      
      const userData = await StorageUtils.auth.getUserData();
      
      if (!userData) {
        console.warn('No user data found, cannot register push token');
        return false;
      }

      const response = await apiService.post('/notifications/register-token', {
        userId: userData.id,
        pushToken,
        platform: Platform.OS,
        deviceInfo: {
          deviceName: Device.deviceName,
          deviceType: Device.deviceType,
          osName: Device.osName,
          osVersion: Device.osVersion,
        },
      });

      if (response.success) {
        console.log('✅ Push token registered successfully');
        return true;
      } else {
        throw new Error(response.message || 'Failed to register push token');
      }
    } catch (error) {
      console.error('❌ Register push token error:', error);
      return false;
    }
  },

  /**
   * Schedule local notification
   */
  scheduleLocalNotification: async (title, body, trigger = null, data = {}) => {
    try {
      console.log('⏰ Scheduling local notification:', title);
      
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
          data,
        },
        trigger,
      });

      console.log('✅ Local notification scheduled:', identifier);
      
      return {
        success: true,
        identifier,
      };
    } catch (error) {
      console.error('❌ Schedule local notification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to schedule notification',
      };
    }
  },

  /**
   * Send immediate local notification
   */
  sendLocalNotification: async (title, body, data = {}) => {
    try {
      console.log('📢 Sending immediate local notification:', title);
      
      await Notifications.presentNotificationAsync({
        title,
        body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        vibrate: [0, 250, 250, 250],
        data,
      });

      console.log('✅ Local notification sent');
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Send local notification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send notification',
      };
    }
  },

  /**
   * Schedule appointment reminder
   */
  scheduleAppointmentReminder: async (appointment) => {
    try {
      console.log('📅 Scheduling appointment reminder for:', appointment.id);
      
      const appointmentDate = new Date(appointment.appointmentDate);
      
      // Schedule reminder 1 hour before appointment
      const reminderTime = new Date(appointmentDate.getTime() - 60 * 60 * 1000);
      
      // Only schedule if reminder time is in the future
      if (reminderTime > new Date()) {
        const result = await notificationsService.scheduleLocalNotification(
          'Appointment Reminder',
          `You have an appointment with Dr. ${appointment.doctorName} in 1 hour`,
          { date: reminderTime },
          {
            type: 'appointment_reminder',
            appointmentId: appointment.id,
          }
        );

        return result;
      } else {
        console.log('Appointment is too soon to schedule reminder');
        return { success: false, error: 'Appointment is too soon' };
      }
    } catch (error) {
      console.error('❌ Schedule appointment reminder error:', error);
      return {
        success: false,
        error: error.message || 'Failed to schedule appointment reminder',
      };
    }
  },

  /**
   * Schedule medication reminder
   */
  scheduleMedicationReminder: async (medication) => {
    try {
      console.log('💊 Scheduling medication reminder for:', medication.name);
      
      const reminders = [];
      
      // Schedule for each time in the medication schedule
      for (const time of medication.times) {
        const [hours, minutes] = time.split(':');
        
        const identifier = await notificationsService.scheduleLocalNotification(
          'Medication Reminder',
          `Time to take your ${medication.name}`,
          {
            hour: parseInt(hours),
            minute: parseInt(minutes),
            repeats: true,
          },
          {
            type: 'medication_reminder',
            medicationId: medication.id,
            medicationName: medication.name,
          }
        );

        reminders.push(identifier);
      }

      console.log('✅ Medication reminders scheduled:', reminders.length);
      
      return {
        success: true,
        identifiers: reminders,
      };
    } catch (error) {
      console.error('❌ Schedule medication reminder error:', error);
      return {
        success: false,
        error: error.message || 'Failed to schedule medication reminder',
      };
    }
  },

  /**
   * Schedule health check reminder
   */
  scheduleHealthCheckReminder: async () => {
    try {
      console.log('🩺 Scheduling daily health check reminder...');
      
      const result = await notificationsService.scheduleLocalNotification(
        'Daily Health Check',
        'Don\'t forget to record your vital signs today',
        {
          hour: 9, // 9 AM
          minute: 0,
          repeats: true,
        },
        {
          type: 'health_check_reminder',
        }
      );

      return result;
    } catch (error) {
      console.error('❌ Schedule health check reminder error:', error);
      return {
        success: false,
        error: error.message || 'Failed to schedule health check reminder',
      };
    }
  },

  /**
   * Cancel notification
   */
  cancelNotification: async (identifier) => {
    try {
      console.log('❌ Cancelling notification:', identifier);
      
      await Notifications.cancelScheduledNotificationAsync(identifier);
      
      console.log('✅ Notification cancelled');
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Cancel notification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel notification',
      };
    }
  },

  /**
   * Cancel all notifications
   */
  cancelAllNotifications: async () => {
    try {
      console.log('🧹 Cancelling all notifications...');
      
      await Notifications.cancelAllScheduledNotificationsAsync();
      
      console.log('✅ All notifications cancelled');
      
      return {
        success: true,
      };
    } catch (error) {
      console.error('❌ Cancel all notifications error:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel all notifications',
      };
    }
  },

  /**
   * Get all scheduled notifications
   */
  getScheduledNotifications: async () => {
    try {
      console.log('📋 Getting scheduled notifications...');
      
      const notifications = await Notifications.getAllScheduledNotificationsAsync();
      
      console.log('✅ Scheduled notifications:', notifications.length);
      
      return {
        success: true,
        notifications,
      };
    } catch (error) {
      console.error('❌ Get scheduled notifications error:', error);
      return {
        success: false,
        notifications: [],
        error: error.message || 'Failed to get scheduled notifications',
      };
    }
  },

  /**
   * Handle notification response (when user taps notification)
   */
  handleNotificationResponse: (response) => {
    try {
      console.log('👆 Notification tapped:', response);
      
      const { notification } = response;
      const data = notification.request.content.data;

      // Handle different notification types
      switch (data.type) {
        case 'appointment_reminder':
          // Navigate to appointments screen
          console.log('Navigate to appointment:', data.appointmentId);
          break;
          
        case 'medication_reminder':
          // Navigate to medications screen
          console.log('Navigate to medication:', data.medicationId);
          break;
          
        case 'health_check_reminder':
          // Navigate to health metrics screen
          console.log('Navigate to health metrics');
          break;
          
        case 'emergency_alert':
          // Navigate to emergency screen
          console.log('Navigate to emergency');
          break;
          
        default:
          console.log('Unknown notification type:', data.type);
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('❌ Handle notification response error:', error);
      return {
        success: false,
        error: error.message || 'Failed to handle notification response',
      };
    }
  },

  /**
   * Send emergency notification to family members
   */
  sendEmergencyNotification: async (elderData, location) => {
    try {
      console.log('🚨 Sending emergency notification...');
      
      const response = await apiService.post(API_ENDPOINTS.NOTIFICATIONS.SEND, {
        type: 'emergency',
        elderId: elderData.id,
        elderName: `${elderData.firstName} ${elderData.lastName}`,
        location,
        timestamp: new Date().toISOString(),
        priority: 'high',
      });

      if (response.success) {
        console.log('✅ Emergency notification sent');
        return {
          success: true,
          message: 'Emergency notification sent to family members',
        };
      } else {
        throw new Error(response.message || 'Failed to send emergency notification');
      }
    } catch (error) {
      console.error('❌ Send emergency notification error:', error);
      return {
        success: false,
        error: error.message || 'Failed to send emergency notification',
      };
    }
  },

  /**
   * Get notification settings
   */
  getNotificationSettings: async () => {
    try {
      const settings = await StorageUtils.getItem('notification_settings', {
        enabled: true,
        appointments: true,
        medications: true,
        healthChecks: true,
        emergencies: true,
        sound: true,
        vibration: true,
      });

      return {
        success: true,
        settings,
      };
    } catch (error) {
      console.error('❌ Get notification settings error:', error);
      return {
        success: false,
        settings: {},
        error: error.message || 'Failed to get notification settings',
      };
    }
  },

  /**
   * Update notification settings
   */
  updateNotificationSettings: async (newSettings) => {
    try {
      const currentSettings = await StorageUtils.getItem('notification_settings', {});
      const updatedSettings = { ...currentSettings, ...newSettings };
      
      await StorageUtils.setItem('notification_settings', updatedSettings);
      
      console.log('✅ Notification settings updated');
      
      return {
        success: true,
        settings: updatedSettings,
      };
    } catch (error) {
      console.error('❌ Update notification settings error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update notification settings',
      };
    }
  },
};