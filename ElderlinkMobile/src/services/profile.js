import apiService from './api';
import { API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../utils/constants';

/**
 * Profile Service
 * Handles all profile-related API operations for elder users
 */

class ProfileService {
  /**
   * Get elder profile information
   * Uses the /api/elders/profile endpoint for authenticated elder users
   */
  async getElderProfile() {
    try {
      console.log('📡 Fetching elder profile...');
      
      const response = await apiService.get('/api/elders/profile');
      
      console.log('✅ Elder profile fetched:', response);
      return response;
    } catch (error) {
      console.error('❌ Get elder profile error:', error);
      throw error;
    }
  }

  /**
   * Update elder profile information
   * @param {string} elderId - The ID of the elder to update
   * @param {object} profileData - The profile data to update
   * @returns {Promise} Updated elder data
   */
  async updateElderProfile(elderId, profileData) {
    try {
      console.log('📡 Updating elder profile:', elderId);
      console.log('📋 Profile data:', profileData);
      
      const response = await apiService.put(
        API_ENDPOINTS.ELDERS.UPDATE(elderId),
        profileData
      );
      
      console.log('✅ Elder profile updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Update elder profile error:', error);
      throw error;
    }
  }

  /**
   * Update elder profile with photo
   * @param {string} elderId - The ID of the elder to update
   * @param {object} profileData - The profile data to update
   * @param {string} photoUri - The URI of the photo to upload
   * @returns {Promise} Updated elder data
   */
  async updateElderProfileWithPhoto(elderId, profileData, photoUri) {
    try {
      console.log('📡 Updating elder profile with photo:', elderId);
      
      const formData = new FormData();
      
      // Add photo file
      if (photoUri) {
        const filename = photoUri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append('photo', {
          uri: photoUri,
          name: filename,
          type,
        });
      }
      
      // Add other profile data
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          formData.append(key, profileData[key]);
        }
      });
      
      const response = await apiService.uploadFile(
        API_ENDPOINTS.ELDERS.UPDATE(elderId),
        formData
      );
      
      console.log('✅ Elder profile with photo updated:', response);
      return response;
    } catch (error) {
      console.error('❌ Update elder profile with photo error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const profileService = new ProfileService();
export default profileService;
