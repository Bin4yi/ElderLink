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

  // NEW: Add elder with authentication in one step
  addElderWithAuth: async (elderData) => {
    try {
      console.log('🔵 ElderService: Adding elder with auth data:', elderData);
      
      if (!elderData.subscriptionId) {
        throw new Error('Subscription ID is required');
      }

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
        
        const response = await api.post('/elders/with-auth', formData, {
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
          insuranceNumber: elderData.insuranceNumber || '',
          // Authentication fields
          enableLogin: elderData.enableLogin || false,
          email: elderData.email || null,
          password: elderData.password || null
        };
        
        console.log('📋 JSON data being sent:', jsonData);
        
        const response = await api.post('/elders/with-auth', jsonData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        return response.data;
      }
      
    } catch (error) {
      console.error('❌ ElderService addElderWithAuth error:', error);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  },

  // Get all elders for staff (only assigned elders)
  getAllEldersForStaff: async () => {
    try {
      console.log('🔍 ElderService: Getting assigned elders for staff...');
      const response = await api.get('/elders/staff/assigned');
      console.log('✅ ElderService: Assigned elders response:', response.data);
      
      return {
        success: true,
        elders: response.data.elders || [],
        total: response.data.total || 0
      };
    } catch (error) {
      console.error('❌ ElderService: Failed to get assigned elders:', error);
      throw error;
    }
  },

  // Get all elders with enhanced debugging
  getElders: async () => {
    try {
      console.log('🔍 ElderService: Getting elders...');
      console.log('🔍 ElderService: API base URL:', api.defaults.baseURL);
      
      const response = await api.get('/elders');
      console.log('✅ ElderService: Raw response:', response);
      console.log('✅ ElderService: Response data:', response.data);
      console.log('✅ ElderService: Response status:', response.status);
      
      // Handle different response structures
      if (response.data) {
        if (response.data.success && response.data.elders) {
          console.log('✅ ElderService: Found elders in success response:', response.data.elders.length);
          return {
            success: true,
            elders: response.data.elders,
            count: response.data.count || response.data.elders.length
          };
        } else if (Array.isArray(response.data.elders)) {
          console.log('✅ ElderService: Found elders in array response:', response.data.elders.length);
          return {
            success: true,
            elders: response.data.elders,
            count: response.data.elders.length
          };
        } else if (Array.isArray(response.data)) {
          console.log('✅ ElderService: Found elders in direct array:', response.data.length);
          return {
            success: true,
            elders: response.data,
            count: response.data.length
          };
        } else {
          console.log('⚠️ ElderService: Unexpected response structure:', response.data);
          return {
            success: false,
            elders: [],
            count: 0,
            error: 'Unexpected response structure'
          };
        }
      } else {
        console.log('❌ ElderService: No data in response');
        return {
          success: false,
          elders: [],
          count: 0,
          error: 'No data in response'
        };
      }
    } catch (error) {
      console.error('❌ ElderService: Get elders error:', error);
      console.error('❌ ElderService: Error response:', error.response?.data);
      console.error('❌ ElderService: Error status:', error.response?.status);
      
      return {
        success: false,
        elders: [],
        count: 0,
        error: error.response?.data?.message || error.message
      };
    }
  },

  // Debug function to test the endpoint directly
  debugGetElders: async () => {
    try {
      console.log('🧪 ElderService: Debug - Testing elders endpoint...');
      const response = await api.get('/elders');
      console.log('🧪 ElderService: Debug - Raw response:', response);
      return response.data;
    } catch (error) {
      console.error('🧪 ElderService: Debug - Error:', error);
      throw error;
    }
  },

  // Test API connection
  testConnection: async () => {
    try {
      console.log('🧪 ElderService: Testing API connection...');
      const response = await api.get('/auth/profile');
      console.log('🧪 ElderService: Connection test result:', response.data);
      return response.data;
    } catch (error) {
      console.error('🧪 ElderService: Connection test failed:', error);
      throw error;
    }
  },

  // ✅ Fixed: Get all elders for health monitoring (for staff health reports)
  getAllEldersForHealthMonitoring: async () => {
    try {
      console.log('🔍 Getting all elders for health monitoring...');
      
      const response = await api.get('/elders/for-monitoring');
      console.log('✅ All elders for health monitoring response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get all elders for health monitoring:', error);
      
      // ✅ Better error handling
      if (error.response?.status === 404) {
        // Return empty result for 404 instead of throwing
        return {
          success: true,
          elders: [],
          total: 0,
          message: 'No elders found for health monitoring'
        };
      }
      
      throw error;
    }
  },

  // ✅ Fixed: Get assigned elders for staff (for care management)
  getAssignedEldersForStaff: async () => {
    try {
      console.log('🔍 Getting assigned elders for staff...');
      const response = await api.get('/elders/staff/assigned');
      console.log('✅ Assigned elders for staff response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get assigned elders for staff:', error);
      
      // ✅ Better error handling
      if (error.response?.status === 404) {
        return {
          success: true,
          elders: [],
          total: 0,
          message: 'No assigned elders found'
        };
      }
      
      throw error;
    }
  },

  // ✅ Fixed: Use assigned elders for care management
  getAllEldersForStaff: async () => {
    try {
      console.log('🔍 ElderService: Getting assigned elders for staff...');
      const response = await api.get('/elders/staff/assigned');
      console.log('✅ ElderService: Assigned elders response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ ElderService: Failed to get assigned elders:', error);
      
      // ✅ Better error handling
      if (error.response?.status === 404) {
        return {
          success: true,
          elders: [],
          total: 0,
          message: 'No assigned elders found'
        };
      }
      
      throw error;
    }
  },

  // Get elder profile
  getElderProfile: async () => {
    const response = await api.get('/elder/profile');
    return response.data;
  },

  // Get latest health monitoring data for elder
  getLatestHealthMonitoring: async () => {
    const response = await api.get('/health-monitoring/elder/latest');
    return response.data;
  },

  // Get daily health report
  getDailyHealthReport: async (date) => {
    const response = await api.get('/health-reports/daily', { params: { date } });
    return response.data;
  },

  // Create elder login
  createElderLogin: async (elderId, credentials) => {
    const response = await api.post(`/elders/${elderId}/create-login`, credentials);
    return response.data;
  },

  // Alias for consistency with health reports
  getAssignedElders: async () => {
    return elderService.getAssignedEldersForStaff();
  },
};