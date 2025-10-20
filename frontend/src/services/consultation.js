// frontend/src/services/consultation.js
import api from './api';

class ConsultationService {
  
  // Get elder's consultation records with latest vitals
  async getElderLastRecordWithVitals(elderId) {
    try {
      const response = await api.get(`/doctor/consultations/elder/${elderId}/last-record-with-vitals`);
      return response.data;
    } catch (error) {
      console.error('Error fetching elder last record with vitals:', error);
      throw error;
    }
  }

  // Get elder's consultation records
  async getElderConsultationRecords(elderId) {
    try {
      const response = await api.get(`/doctor/consultations/elder/${elderId}/records`);
      return response.data;
    } catch (error) {
      console.error('Error fetching elder consultation records:', error);
      throw error;
    }
  }

  // Get latest health monitoring for elder
  async getLatestVitals(elderId) {
    try {
      const response = await api.get(`/health-monitoring/elder/${elderId}/latest`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest vitals:', error);
      throw error;
    }
  }

  // Handle errors
  handleError(error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'An error occurred');
    }
    throw error;
  }
}

export const consultationService = new ConsultationService();
export default consultationService;
