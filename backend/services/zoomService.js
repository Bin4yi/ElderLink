// backend/services/zoomService.js
const axios = require('axios');
const jwt = require('jsonwebtoken');

class ZoomService {
  constructor() {
    this.apiKey = process.env.ZOOM_API_KEY;
    this.apiSecret = process.env.ZOOM_API_SECRET;
    this.baseURL = 'https://api.zoom.us/v2';
  }

  // Generate JWT token for Zoom API
  generateJWT() {
    const payload = {
      iss: this.apiKey,
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiry
    };
    return jwt.sign(payload, this.apiSecret);
  }

  // Create Zoom meeting
  async createMeeting(appointmentData) {
    try {
      const token = this.generateJWT();
      
      const meetingConfig = {
        topic: `Medical Consultation - ${appointmentData.elder.firstName} ${appointmentData.elder.lastName}`,
        type: 2, // Scheduled meeting
        start_time: new Date(appointmentData.appointmentDate).toISOString(),
        duration: appointmentData.duration || 60,
        timezone: 'UTC',
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          use_pmi: false,
          approval_type: 2, // Manual approval
          audio: 'both',
          auto_recording: 'none',
          waiting_room: true,
          meeting_authentication: false
        }
      };

      const response = await axios.post(
        `${this.baseURL}/users/me/meetings`,
        meetingConfig,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        meetingId: response.data.id,
        joinUrl: response.data.join_url,
        password: response.data.password,
        startUrl: response.data.start_url
      };
    } catch (error) {
      console.error('Zoom meeting creation error:', error.response?.data || error.message);
      throw new Error('Failed to create Zoom meeting');
    }
  }

  // Delete Zoom meeting
  async deleteMeeting(meetingId) {
    try {
      const token = this.generateJWT();
      
      await axios.delete(`${this.baseURL}/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return true;
    } catch (error) {
      console.error('Zoom meeting deletion error:', error.response?.data || error.message);
      throw new Error('Failed to delete Zoom meeting');
    }
  }

  // Update Zoom meeting
  async updateMeeting(meetingId, updateData) {
    try {
      const token = this.generateJWT();
      
      const response = await axios.patch(
        `${this.baseURL}/meetings/${meetingId}`,
        updateData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Zoom meeting update error:', error.response?.data || error.message);
      throw new Error('Failed to update Zoom meeting');
    }
  }
}

module.exports = new ZoomService();