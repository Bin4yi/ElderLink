// frontend/src/services/profileService.js
import api from './api';

/**
 * Profile Service
 * Handles all profile-related API calls
 */

/**
 * Get staff profile information
 * @returns {Promise} Profile data
 */
export const getStaffProfile = async () => {
  try {
    console.log('📡 Fetching staff profile...');
    const response = await api.get('/profile/staff');
    console.log('✅ Profile fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching profile:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Update staff profile information
 * @param {Object} profileData - Updated profile data
 * @returns {Promise} Updated profile data
 */
export const updateStaffProfile = async (profileData) => {
  try {
    console.log('📡 Updating staff profile:', profileData);
    const response = await api.put('/profile/staff', profileData);
    console.log('✅ Profile updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error updating profile:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Upload profile image
 * @param {File} imageFile - Image file to upload
 * @returns {Promise} Upload result with image URL
 */
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    console.log('📡 Uploading profile image...');
    const response = await api.post('/profile/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('✅ Image uploaded successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error uploading image:', error.response?.data || error.message);
    throw error;
  }
};

export default {
  getStaffProfile,
  updateStaffProfile,
  uploadProfileImage,
};
