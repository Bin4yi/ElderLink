import api from './api';

export const elderService = {
  addElder: async (elderData) => {
    try {
      console.log('🔵 ElderService: Starting with data:', elderData);
      
      // CRITICAL: Verify subscriptionId exists
      if (!elderData.subscriptionId) {
        console.error('❌ No subscriptionId in elderData!');
        throw new Error('Subscription ID is required');
      }
      
      console.log('✅ SubscriptionId confirmed:', elderData.subscriptionId);
      
      // Check if there's a photo file
      const hasPhoto = elderData.photo && elderData.photo instanceof File;
      console.log('📸 Has photo file:', hasPhoto);
      
      if (hasPhoto) {
        // Use FormData for file upload
        const formData = new FormData();
        
        // Add subscriptionId FIRST
        formData.append('subscriptionId', elderData.subscriptionId);
        console.log('📝 Added subscriptionId to FormData:', elderData.subscriptionId);
        
        // Add all other fields explicitly
        const fields = [
          'firstName', 'lastName', 'dateOfBirth', 'gender', 
          'address', 'phone', 'emergencyContact', 'bloodType',
          'medicalHistory', 'currentMedications', 'allergies', 
          'chronicConditions', 'doctorName', 'doctorPhone',
          'insuranceProvider', 'insuranceNumber'
        ];
        
        fields.forEach(field => {
          const value = elderData[field];
          if (value !== undefined && value !== null && value !== '') {
            formData.append(field, value);
            console.log(`📝 Added ${field}:`, value);
          }
        });
        
        // Add photo file
        formData.append('photo', elderData.photo);
        console.log('📸 Added photo file:', elderData.photo.name);
        
        // Debug FormData
        console.log('📋 FormData entries:');
        for (let [key, value] of formData.entries()) {
          console.log(`  ${key}: ${value}`);
        }
        
        const response = await api.post('/elders', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        return response.data;
        
      } else {
        // Use JSON for no file upload
        console.log('📄 No photo, using JSON approach');
        
        const jsonData = {
          subscriptionId: elderData.subscriptionId,
          firstName: elderData.firstName,
          lastName: elderData.lastName,
          dateOfBirth: elderData.dateOfBirth,
          gender: elderData.gender,
          address: elderData.address,
          phone: elderData.phone,
          emergencyContact: elderData.emergencyContact,
          bloodType: elderData.bloodType || '',
          medicalHistory: elderData.medicalHistory || '',
          currentMedications: elderData.currentMedications || '',
          allergies: elderData.allergies || '',
          chronicConditions: elderData.chronicConditions || '',
          doctorName: elderData.doctorName || '',
          doctorPhone: elderData.doctorPhone || '',
          insuranceProvider: elderData.insuranceProvider || '',
          insuranceNumber: elderData.insuranceNumber || ''
        };
        
        console.log('📋 JSON data being sent:', jsonData);
        console.log('🔍 SubscriptionId in JSON:', jsonData.subscriptionId);
        
        const response = await api.post('/elders', jsonData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        return response.data;
      }
      
    } catch (error) {
      console.error('❌ ElderService error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  getElders: async () => {
    try {
      const response = await api.get('/elders');
      return response.data;
    } catch (error) {
      console.error('Get elders error:', error);
      return { elders: [] };
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