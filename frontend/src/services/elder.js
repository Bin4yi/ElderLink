import api from './api';

export const elderService = {
  addElder: async (elderData) => {
    try {
      // DEBUG: Log the data being sent
      console.log('=== DEBUGGING ELDER DATA ===');
      console.log('Raw elderData:', elderData);
      console.log('subscriptionId:', elderData.subscriptionId);
      console.log('subscriptionId type:', typeof elderData.subscriptionId);
      
      const formData = new FormData();
      
      // Append all elder data to FormData
      Object.keys(elderData).forEach(key => {
        if (elderData[key] !== null && elderData[key] !== undefined && elderData[key] !== '') {
          formData.append(key, elderData[key]);
          console.log(`Appending ${key}:`, elderData[key]);
        }
      });

      // DEBUG: Log what's in FormData
      console.log('=== FormData Contents ===');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}`);
      }

      const response = await api.post('/elders', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Elder created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Add elder error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  getElders: async () => {
    try {
      const response = await api.get('/elders');
      return response.data;
    } catch (error) {
      console.error('Get elders error:', error);
      return { elders: [] }; // Return empty array on error
    }
  },

  getElderById: async (elderId) => {
    try {
      const response = await api.get(`/elders/${elderId}`);
      return response.data;
    } catch (error) {
      console.error('Get elder error:', error);
      throw error;
    }
  },

  updateElder: async (elderId, elderData) => {
    try {
      const formData = new FormData();
      
      Object.keys(elderData).forEach(key => {
        if (elderData[key] !== null && elderData[key] !== undefined && elderData[key] !== '') {
          formData.append(key, elderData[key]);
        }
      });

      const response = await api.put(`/elders/${elderId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Update elder error:', error);
      throw error;
    }
  }

  
};