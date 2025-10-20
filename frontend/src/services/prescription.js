// frontend/src/services/prescription.js
import api from './api';

const prescriptionService = {
  /**
   * Get elder's medications (their prescriptions)
   * @returns {Promise} Response with prescriptions array
   */
  getElderMedications: async () => {
    try {
      const response = await api.get('/prescriptions/elder/my-medications');
      return response.data;
    } catch (error) {
      console.error('Error fetching elder medications:', error);
      throw error.response?.data || error;
    }
  },

  /**
   * Get prescription details
   * @param {string} prescriptionId - Prescription ID
   * @returns {Promise} Response with prescription details
   */
  getPrescriptionDetails: async (prescriptionId) => {
    try {
      const response = await api.get(`/prescriptions/${prescriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching prescription details:', error);
      throw error.response?.data || error;
    }
  }
};

export default prescriptionService;
