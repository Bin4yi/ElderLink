// ElderlinkMobile/src/services/zoomService.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://YOUR_SERVER_IP:5000/api'; // Update with your server IP

/**
 * Get authorization headers with JWT token
 */
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  
  if (!token) {
    throw new Error('No authentication token found');
  }
  
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Get all upcoming Zoom meetings for the logged-in family member
 * @returns {Promise<Array>} Array of meeting objects
 */
export const getUpcomingZoomMeetings = async () => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await axios.get(
      `${API_URL}/mobile/zoom-meetings/upcoming`,
      { headers }
    );
    
    if (response.data.success) {
      return response.data.data.meetings;
    } else {
      throw new Error(response.data.message || 'Failed to fetch meetings');
    }
  } catch (error) {
    console.error('Error fetching upcoming Zoom meetings:', error);
    throw error;
  }
};

/**
 * Get a specific Zoom meeting by session ID
 * @param {string} sessionId - The monthly session ID
 * @returns {Promise<Object>} Meeting object
 */
export const getZoomMeetingById = async (sessionId) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await axios.get(
      `${API_URL}/mobile/zoom-meetings/${sessionId}`,
      { headers }
    );
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch meeting');
    }
  } catch (error) {
    console.error('Error fetching Zoom meeting:', error);
    throw error;
  }
};

/**
 * Get all notifications for the logged-in user
 * @param {boolean} unreadOnly - If true, only return unread notifications
 * @returns {Promise<Object>} Object with notifications array and unreadCount
 */
export const getNotifications = async (unreadOnly = false) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await axios.get(
      `${API_URL}/mobile/notifications`,
      {
        headers,
        params: { unreadOnly }
      }
    );
    
    if (response.data.success) {
      return {
        notifications: response.data.data.notifications,
        unreadCount: response.data.data.unreadCount
      };
    } else {
      throw new Error(response.data.message || 'Failed to fetch notifications');
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - The notification ID
 * @returns {Promise<Object>} Updated notification
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await axios.put(
      `${API_URL}/mobile/notifications/${notificationId}/read`,
      {},
      { headers }
    );
    
    if (response.data.success) {
      return response.data.data.notification;
    } else {
      throw new Error(response.data.message || 'Failed to mark notification as read');
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise<number>} Number of notifications updated
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const headers = await getAuthHeaders();
    
    const response = await axios.put(
      `${API_URL}/mobile/notifications/read-all`,
      {},
      { headers }
    );
    
    if (response.data.success) {
      return response.data.data.updatedCount;
    } else {
      throw new Error(response.data.message || 'Failed to mark all notifications as read');
    }
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

/**
 * Configure API base URL (call this on app startup with your server IP)
 * @param {string} baseUrl - Your backend server URL
 */
export const configureApiUrl = (baseUrl) => {
  // This allows you to dynamically set the API URL
  axios.defaults.baseURL = baseUrl;
};

export default {
  getUpcomingZoomMeetings,
  getZoomMeetingById,
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  configureApiUrl
};
