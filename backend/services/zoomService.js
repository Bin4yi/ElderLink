// backend/services/zoomService.js
const axios = require('axios');

class ZoomService {
  constructor() {
    this.accountId = process.env.ZOOM_ACCOUNT_ID;
    this.clientId = process.env.ZOOM_CLIENT_ID;
    this.clientSecret = process.env.ZOOM_CLIENT_SECRET;
    this.apiBaseUrl = process.env.ZOOM_API_BASE_URL || 'https://api.zoom.us/v2';
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  /**
   * Get OAuth access token using Server-to-Server OAuth
   */
  async getAccessToken() {
    try {
      // Return cached token if still valid
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      console.log('🔑 Fetching new Zoom access token...');

      const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

      const response = await axios.post(
        `https://zoom.us/oauth/token`,
        new URLSearchParams({
          grant_type: 'account_credentials',
          account_id: this.accountId
        }),
        {
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Set expiry 5 minutes before actual expiry for safety
      this.tokenExpiry = Date.now() + ((response.data.expires_in - 300) * 1000);

      console.log('✅ Zoom access token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Error getting Zoom access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Zoom API');
    }
  }

  /**
   * Create a Zoom meeting
   * @param {Object} meetingData - Meeting configuration
   * @returns {Object} Meeting details including join URL and password
   */
  async createMeeting(meetingData) {
    try {
      // Check if in development/test mode (skip actual Zoom API)
      const isDevelopment = process.env.NODE_ENV === 'development' || process.env.ZOOM_TEST_MODE === 'true';
      
      if (isDevelopment && (!this.accountId || !this.clientId || !this.clientSecret)) {
        console.log('⚠️  Zoom API not configured - using mock data for development');
        return this.createMockMeeting(meetingData);
      }

      const token = await this.getAccessToken();

      const {
        topic,
        startTime, // ISO 8601 format: 2024-10-17T14:30:00Z
        duration = 45, // minutes
        timezone = 'America/New_York',
        agenda = '',
        password = this.generatePassword(),
        waitingRoom = true,
        joinBeforeHost = false,
        autoRecording = 'none' // 'local', 'cloud', or 'none'
      } = meetingData;

      console.log('📅 Creating Zoom meeting:', topic);

      // Create instant meeting (type: 1) to avoid Zoom database issues
      // Instant meetings don't require start_time
      const meetingPayload = {
        topic,
        type: 1, // Instant meeting (more reliable than scheduled)
        duration,
        agenda,
        password,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: joinBeforeHost,
          mute_upon_entry: false,
          watermark: false,
          use_pmi: false,
          approval_type: 0, // Automatically approve
          audio: 'both', // Both telephony and VoIP
          auto_recording: autoRecording,
          enforce_login: false,
          waiting_room: waitingRoom,
          meeting_authentication: false
        }
      };

      const response = await axios.post(
        `${this.apiBaseUrl}/users/me/meetings`,
        meetingPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const meeting = response.data;

      console.log('✅ Zoom meeting created successfully:', meeting.id);

      return {
        meetingId: meeting.id.toString(),
        joinUrl: meeting.join_url,
        startUrl: meeting.start_url,
        password: meeting.password || password,
        topic: meeting.topic,
        startTime: startTime || new Date().toISOString(),
        duration: meeting.duration,
        timezone: timezone
      };
    } catch (error) {
      console.error('❌ Error creating Zoom meeting:', error.response?.data || error.message);
      
      // Log full error details for debugging
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      
      // Fallback to mock meeting if Zoom API fails
      console.log('⚠️  Zoom API failed - using mock meeting for development');
      return this.createMockMeeting(meetingData);
    }
  }

  /**
   * Create a mock Zoom meeting for development/testing
   * @param {Object} meetingData - Meeting configuration
   * @returns {Object} Mock meeting details
   */
  createMockMeeting(meetingData) {
    const mockMeetingId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const mockPassword = this.generatePassword();
    
    console.log('🧪 Creating MOCK Zoom meeting (for development only)');
    
    return {
      meetingId: mockMeetingId,
      joinUrl: `https://zoom.us/j/${mockMeetingId}?pwd=${mockPassword}`,
      startUrl: `https://zoom.us/s/${mockMeetingId}?zak=mock_host_key`,
      password: mockPassword,
      topic: meetingData.topic || 'Development Meeting',
      startTime: meetingData.startTime || new Date().toISOString(),
      duration: meetingData.duration || 45,
      timezone: meetingData.timezone || 'America/New_York'
    };
  }

  /**
   * Get meeting details
   * @param {String} meetingId - Zoom meeting ID
   * @returns {Object} Meeting details
   */
  async getMeetingDetails(meetingId) {
    try {
      const token = await this.getAccessToken();

      console.log('📋 Fetching Zoom meeting details:', meetingId);

      const response = await axios.get(
        `${this.apiBaseUrl}/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const meeting = response.data;

      return {
        meetingId: meeting.id.toString(),
        topic: meeting.topic,
        startTime: meeting.start_time,
        duration: meeting.duration,
        joinUrl: meeting.join_url,
        status: meeting.status,
        createdAt: meeting.created_at
      };
    } catch (error) {
      console.error('❌ Error getting Zoom meeting details:', error.response?.data || error.message);
      throw new Error('Failed to get meeting details');
    }
  }

  /**
   * Update a Zoom meeting
   * @param {String} meetingId - Zoom meeting ID
   * @param {Object} updateData - Fields to update
   * @returns {Object} Updated meeting details
   */
  async updateMeeting(meetingId, updateData) {
    try {
      const token = await this.getAccessToken();

      console.log('📝 Updating Zoom meeting:', meetingId);

      await axios.patch(
        `${this.apiBaseUrl}/meetings/${meetingId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Zoom meeting updated successfully');

      return await this.getMeetingDetails(meetingId);
    } catch (error) {
      console.error('❌ Error updating Zoom meeting:', error.response?.data || error.message);
      throw new Error('Failed to update meeting');
    }
  }

  /**
   * Delete a Zoom meeting
   * @param {String} meetingId - Zoom meeting ID
   */
  async deleteMeeting(meetingId) {
    try {
      const token = await this.getAccessToken();

      console.log('🗑️ Deleting Zoom meeting:', meetingId);

      await axios.delete(
        `${this.apiBaseUrl}/meetings/${meetingId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      console.log('✅ Zoom meeting deleted successfully');

      return { success: true, message: 'Meeting deleted' };
    } catch (error) {
      console.error('❌ Error deleting Zoom meeting:', error.response?.data || error.message);
      throw new Error('Failed to delete meeting');
    }
  }

  /**
   * Generate a random meeting password
   * @returns {String} 6-digit password
   */
  generatePassword() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Format date for Zoom API (ISO 8601)
   * @param {Date} date - JavaScript Date object
   * @returns {String} ISO 8601 formatted string
   */
  formatDateForZoom(date) {
    return date.toISOString().replace('.000Z', 'Z');
  }

  /**
   * Create meeting from monthly session data
   * @param {Object} session - MonthlySession instance
   * @param {Object} doctor - Doctor user details
   * @param {Object} elder - Elder details
   * @returns {Object} Meeting details
   */
  async createMeetingForSession(session, doctor, elder) {
    try {
      // Combine session date and time
      const sessionDateTime = new Date(`${session.sessionDate}T${session.sessionTime}`);

      const meetingData = {
        topic: `Monthly Health Session - ${elder.firstName} ${elder.lastName}`,
        startTime: this.formatDateForZoom(sessionDateTime),
        duration: session.duration || 45,
        timezone: process.env.ZOOM_DEFAULT_TIMEZONE || 'America/New_York',
        agenda: `Monthly health monitoring session with Dr. ${doctor.firstName} ${doctor.lastName}`,
        waitingRoom: process.env.ZOOM_ENABLE_WAITING_ROOM === 'true',
        joinBeforeHost: process.env.ZOOM_ENABLE_JOIN_BEFORE_HOST === 'true',
        autoRecording: process.env.ZOOM_AUTO_RECORDING || 'none'
      };

      const meeting = await this.createMeeting(meetingData);

      return meeting;
    } catch (error) {
      console.error('❌ Error creating meeting for session:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new ZoomService();
