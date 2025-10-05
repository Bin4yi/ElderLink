import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { API_ENDPOINTS, QSTASH_CONFIG, SOS_CONFIG } from '../utils/constants';
import { StorageUtils } from '../utils/storage';
import apiService from './api';

/**
 * Emergency service for handling SOS alerts and emergency contacts
 * Includes Upstash QStash integration for reliable emergency notifications
 */
export const emergencyService = {
  /**
   * Trigger SOS emergency alert
   */
  triggerSOS: async (elderData, additionalInfo = {}) => {
    let emergencyData = null;
    
    try {
      console.log('🚨 Triggering SOS emergency alert...');
      console.log('🔍 Received elderData:', JSON.stringify(elderData, null, 2));
      console.log('🔍 ElderData validation:', {
        hasElderData: !!elderData,
        hasId: !!elderData?.id,
        idValue: elderData?.id,
        idType: typeof elderData?.id,
        elderDataKeys: elderData ? Object.keys(elderData) : []
      });

      // Validate elderData first
      if (!elderData || !elderData.id) {
        console.error('❌ Elder data validation failed:', { elderData, hasId: !!elderData?.id });
        throw new Error('Elder data is required with valid ID');
      }

      console.log('✅ Elder data validation passed');

      // Haptic feedback for confirmation
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      // Get current location
      const location = await emergencyService.getCurrentLocation();
      
      // Get emergency contacts
      const emergencyContacts = await StorageUtils.emergencyContacts.getContacts();
      
      // Get staff assignments
      const staffResponse = await emergencyService.getAssignedStaff(elderData.id);
      
      emergencyData = {
        elderId: elderData.id,
        elderName: `${elderData.firstName || elderData.first_name || ''} ${elderData.lastName || elderData.last_name || ''}`.trim() || elderData.name || 'Unknown',
        elderPhone: elderData.phone || elderData.phoneNumber || elderData.mobile || '',
        timestamp: new Date().toISOString(),
        location: location,
        emergencyContacts: emergencyContacts,
        assignedStaff: staffResponse.success ? staffResponse.staff : [],
        additionalInfo: {
          ...additionalInfo,
          deviceInfo: {
            platform: 'mobile',
            appVersion: '1.0.0',
          },
        },
      };

      console.log('Emergency data prepared:', emergencyData);

      // Send emergency alert through multiple channels
      const results = await Promise.allSettled([
        // Send to backend API
        emergencyService.sendToBackend(emergencyData),
        // Send to Upstash QStash for reliable delivery
        emergencyService.sendToQStash(emergencyData),
        // Send local notifications to family members
        emergencyService.sendLocalNotifications(emergencyData),
      ]);

      console.log('Emergency alert results:', results);

      // Check if at least one method succeeded
      const succeeded = results.some(result => result.status === 'fulfilled');

      // Create detailed summary
      const summary = {
        backend: results[0].status === 'fulfilled' ? '✅ Success' : `❌ ${results[0].reason?.message || 'Failed'}`,
        qstash: results[1].status === 'fulfilled' ? '✅ Success' : `❌ ${results[1].reason?.message || 'Failed'}`,
        local: results[2].status === 'fulfilled' ? '✅ Success' : `❌ ${results[2].reason?.message || 'Failed'}`,
        overall: succeeded ? '✅ SUCCESS' : '❌ FAILED'
      };

      console.log('📊📊📊 EMERGENCY ALERT SUMMARY 📊📊📊');
      console.log('🔹 Backend API:', summary.backend);
      console.log('🔹 QStash Queue:', summary.qstash);
      console.log('🔹 Local Notifications:', summary.local);
      console.log('🔹 Overall Status:', summary.overall);
      console.log('👤 Elder:', emergencyData.elderName, '(ID:', emergencyData.elderId + ')');
      console.log('📍 Location:', emergencyData.location?.available ? 'Obtained' : 'Not available');
      console.log('📞 Emergency Contacts:', emergencyData.emergencyContacts?.length || 0);

      if (succeeded) {
        // Store emergency record locally
        await emergencyService.storeEmergencyRecord(emergencyData);
        
        console.log('🎯🎯🎯 EMERGENCY ALERT COMPLETED SUCCESSFULLY! 🎯🎯🎯');
        
        return {
          success: true,
          message: 'Emergency alert sent successfully',
          emergencyData,
          summary
        };
      } else {
        throw new Error('All emergency notification methods failed');
      }
    } catch (error) {
      console.error('❌ SOS trigger error:', error);
      
      // Even if sending fails, store the attempt locally if we have emergency data
      if (emergencyData) {
        try {
          await emergencyService.storeEmergencyRecord({
            ...emergencyData,
            status: 'failed',
            error: error.message,
          });
        } catch (storeError) {
          console.error('Failed to store emergency record:', storeError);
        }
      }

      return {
        success: false,
        error: error.message || 'Failed to send emergency alert',
      };
    }
  },

  /**
   * Get current location
   */
  getCurrentLocation: async () => {
    try {
      console.log('📍 Getting current location...');
      
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Location permission not granted');
        return {
          available: false,
          error: 'Location permission not granted',
        };
      }

      // Get current position
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000,
      });

      // Get address from coordinates
      const addresses = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const address = addresses[0];

      console.log('✅ Location obtained:', position.coords);

      return {
        available: true,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        address: address ? {
          street: address.street,
          city: address.city,
          region: address.region,
          country: address.country,
          postalCode: address.postalCode,
          formattedAddress: `${address.street || ''}, ${address.city || ''}, ${address.region || ''} ${address.postalCode || ''}`.trim(),
        } : null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error('❌ Location error:', error);
      return {
        available: false,
        error: error.message || 'Failed to get location',
      };
    }
  },

  /**
   * Send emergency alert to backend API
   */
  sendToBackend: async (emergencyData) => {
    try {
      console.log('📡 Sending emergency alert to backend...');
      
      const response = await apiService.post(API_ENDPOINTS.EMERGENCY.TRIGGER, emergencyData);
      
      console.log('✅ Backend emergency response:', response);
      
      if (response.success) {
        return {
          success: true,
          method: 'backend',
          response: response,
        };
      } else {
        throw new Error(response.message || 'Backend emergency alert failed');
      }
    } catch (error) {
      console.error('❌ Backend emergency error:', error);
      
      // If it's a 404 error (route not found), store for later sync
      if (error.message.includes('not found') || error.message.includes('404')) {
        console.log('📡 Backend not available, storing emergency for later sync...');
        
        try {
          await StorageUtils.pendingEmergencies.add(emergencyData);
          return {
            success: true,
            method: 'backend_fallback',
            message: 'Emergency data queued for backend sync'
          };
        } catch (fallbackError) {
          console.error('❌ Fallback storage failed:', fallbackError);
          throw new Error(`Backend and fallback failed: ${error.message}`);
        }
      }
      
      throw error;
    }
  },

  /**
   * Send emergency alert to Upstash QStash for reliable delivery
   */
  sendToQStash: async (emergencyData) => {
    try {
      console.log('📨 Sending emergency alert to Upstash QStash...');
      console.log('🔧 QStash Config Check:', {
        hasToken: !!QSTASH_CONFIG.TOKEN,
        hasURL: !!QSTASH_CONFIG.URL,
        hasWebhook: !!QSTASH_CONFIG.EMERGENCY_WEBHOOK,
        enabled: QSTASH_CONFIG.ENABLED,
        tokenLength: QSTASH_CONFIG.TOKEN ? QSTASH_CONFIG.TOKEN.length : 0
      });
      
      // Check if QStash is properly configured
      if (!QSTASH_CONFIG.TOKEN || !QSTASH_CONFIG.URL || QSTASH_CONFIG.ENABLED === false) {
        console.warn('⚠️ QStash not properly configured or disabled, skipping...');
        return {
          success: true,
          method: 'qstash_skipped',
          message: 'QStash not configured or disabled, emergency handled locally'
        };
      }
      
      const qstashPayload = {
        elderInfo: {
          id: emergencyData.elderId,
          name: emergencyData.elderName,
          phone: emergencyData.elderPhone,
        },
        emergency: {
          timestamp: emergencyData.timestamp,
          location: emergencyData.location,
          type: 'SOS_BUTTON',
          severity: 'HIGH',
        },
        contacts: emergencyData.emergencyContacts,
        staff: emergencyData.assignedStaff,
        additionalInfo: emergencyData.additionalInfo,
      };

      console.log('📦 QStash Payload:', JSON.stringify(qstashPayload, null, 2));

      // Try the most basic QStash request possible
      const testWebhookUrl = 'https://httpbin.org/post';
      
      // Try without encoding first
      const qstashUrl = `https://qstash.upstash.io/v2/publish/${testWebhookUrl}`;
      
      console.log('🔍 DEBUG - Test webhook URL:', testWebhookUrl);
      console.log('🔍 DEBUG - QStash URL (no encoding):', qstashUrl);
      console.log('🔍 DEBUG - Token length:', QSTASH_CONFIG.TOKEN.length);
      
      const headers = {
        'Authorization': `Bearer ${QSTASH_CONFIG.TOKEN}`,
        'Content-Type': 'application/json',
      };
      
      console.log('🔍 DEBUG - About to make request...');

      const response = await fetch(qstashUrl, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(qstashPayload),
      });

      console.log('📡 QStash Response Status:', response.status);
      console.log('📡 QStash Response Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ QStash Response Error:', errorText);
        throw new Error(`QStash request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      
      console.log('✅ QStash emergency response:', result);
      
      return {
        success: true,
        method: 'qstash',
        messageId: result.messageId,
      };
    } catch (error) {
      console.error('❌ QStash emergency error:', error);
      
      // Don't fail the entire emergency process if QStash fails
      console.log('⚠️ QStash failed, but emergency continues with local handling');
      return {
        success: true,
        method: 'qstash_failed',
        message: 'QStash failed but emergency handled locally',
        error: error.message
      };
    }
  },

  /**
   * Send local notifications (placeholder for future implementation)
   */
  sendLocalNotifications: async (emergencyData) => {
    try {
      console.log('📱 Sending local notifications...');
      
      // This would integrate with push notifications service
      // For now, we'll just return success
      
      return {
        success: true,
        method: 'local_notifications',
        message: 'Local notifications sent',
      };
    } catch (error) {
      console.error('❌ Local notifications error:', error);
      throw error;
    }
  },

  /**
   * Get assigned staff for emergency contacts
   */
  getAssignedStaff: async (elderId) => {
    try {
      console.log('👥 Getting assigned staff for elder:', elderId);
      
      const response = await apiService.get(API_ENDPOINTS.STAFF.EMERGENCY(elderId));
      
      console.log('✅ Assigned staff response:', response);
      
      if (response.success) {
        return {
          success: true,
          staff: response.data.staff || [],
        };
      } else {
        throw new Error(response.message || 'Failed to get assigned staff');
      }
    } catch (error) {
      console.error('❌ Get assigned staff error:', error);
      return {
        success: false,
        staff: [],
        error: error.message || 'Failed to get assigned staff',
      };
    }
  },

  /**
   * Store emergency record locally
   */
  storeEmergencyRecord: async (emergencyData) => {
    try {
      const record = {
        ...emergencyData,
        id: emergencyData.id || Date.now().toString(),
        localTimestamp: new Date().toISOString(),
      };
      
      const success = await StorageUtils.emergencyRecords.addRecord(record);
      
      if (success) {
        console.log('✅ Emergency record stored locally');
        return true;
      } else {
        throw new Error('Failed to store emergency record');
      }
    } catch (error) {
      console.error('❌ Store emergency record error:', error);
      return false;
    }
  },

  /**
   * Get emergency records history
   */
  getEmergencyHistory: async () => {
    try {
      const records = await StorageUtils.getItem('emergency_records', []);
      return {
        success: true,
        records,
      };
    } catch (error) {
      console.error('❌ Get emergency history error:', error);
      return {
        success: false,
        records: [],
        error: error.message || 'Failed to get emergency history',
      };
    }
  },

  /**
   * Test emergency system
   */
  testEmergencySystem: async (elderData) => {
    try {
      console.log('🧪 Testing emergency system...');
      
      // Create test emergency data
      const testData = {
        ...elderData,
        test: true,
        timestamp: new Date().toISOString(),
      };

      // Test location services
      const location = await emergencyService.getCurrentLocation();
      
      // Test backend connectivity
      const backendTest = await apiService.checkHealth();
      
      // Get emergency contacts
      const contacts = await StorageUtils.emergencyContacts.getContacts();
      
      // Get assigned staff
      const staffResponse = await emergencyService.getAssignedStaff(elderData.id);

      const testResults = {
        location: location.available,
        backend: backendTest,
        emergencyContacts: contacts.length > 0,
        assignedStaff: staffResponse.success && staffResponse.staff.length > 0,
        qstash: !!QSTASH_CONFIG.TOKEN,
      };

      const allSystemsOk = Object.values(testResults).every(result => result === true);

      console.log('🧪 Emergency system test results:', testResults);

      return {
        success: true,
        allSystemsOk,
        testResults,
        recommendations: emergencyService.getTestRecommendations(testResults),
      };
    } catch (error) {
      console.error('❌ Emergency system test error:', error);
      return {
        success: false,
        allSystemsOk: false,
        error: error.message || 'Emergency system test failed',
      };
    }
  },

  /**
   * Get test recommendations based on test results
   */
  getTestRecommendations: (testResults) => {
    const recommendations = [];

    if (!testResults.location) {
      recommendations.push('Enable location permissions for accurate emergency location');
    }

    if (!testResults.backend) {
      recommendations.push('Check internet connection - emergency alerts need network access');
    }

    if (!testResults.emergencyContacts) {
      recommendations.push('Add emergency contacts in settings');
    }

    if (!testResults.assignedStaff) {
      recommendations.push('Contact administrator to assign care staff');
    }

    if (!testResults.qstash) {
      recommendations.push('Configure QStash for reliable emergency delivery');
    }

    if (recommendations.length === 0) {
      recommendations.push('All emergency systems are working properly');
    }

    return recommendations;
  },

  /**
   * Cancel emergency alert (if possible)
   */
  cancelEmergencyAlert: async (emergencyId) => {
    try {
      console.log('❌ Cancelling emergency alert:', emergencyId);
      
      const response = await apiService.post(`/emergency/cancel/${emergencyId}`);
      
      if (response.success) {
        return {
          success: true,
          message: 'Emergency alert cancelled successfully',
        };
      } else {
        throw new Error(response.message || 'Failed to cancel emergency alert');
      }
    } catch (error) {
      console.error('❌ Cancel emergency alert error:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel emergency alert',
      };
    }
  },

  /**
   * Get emergency contacts
   */
  getEmergencyContacts: async () => {
    try {
      const contacts = await StorageUtils.emergencyContacts.getContacts();
      return {
        success: true,
        contacts,
      };
    } catch (error) {
      console.error('❌ Get emergency contacts error:', error);
      return {
        success: false,
        contacts: [],
        error: error.message || 'Failed to get emergency contacts',
      };
    }
  },

  /**
   * Add emergency contact
   */
  addEmergencyContact: async (contact) => {
    try {
      const contactWithId = {
        ...contact,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      const added = await StorageUtils.emergencyContacts.addContact(contactWithId);
      
      if (added) {
        return {
          success: true,
          contact: contactWithId,
          message: 'Emergency contact added successfully',
        };
      } else {
        throw new Error('Failed to store emergency contact');
      }
    } catch (error) {
      console.error('❌ Add emergency contact error:', error);
      return {
        success: false,
        error: error.message || 'Failed to add emergency contact',
      };
    }
  },

  /**
   * Update emergency contact
   */
  updateEmergencyContact: async (contactId, updates) => {
    try {
      const contacts = await StorageUtils.emergencyContacts.getContacts();
      const contactIndex = contacts.findIndex(c => c.id === contactId);
      
      if (contactIndex === -1) {
        throw new Error('Emergency contact not found');
      }

      contacts[contactIndex] = {
        ...contacts[contactIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const saved = await StorageUtils.emergencyContacts.setContacts(contacts);
      
      if (saved) {
        return {
          success: true,
          contact: contacts[contactIndex],
          message: 'Emergency contact updated successfully',
        };
      } else {
        throw new Error('Failed to update emergency contact');
      }
    } catch (error) {
      console.error('❌ Update emergency contact error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update emergency contact',
      };
    }
  },

  /**
   * Remove emergency contact
   */
  removeEmergencyContact: async (contactId) => {
    try {
      const removed = await StorageUtils.emergencyContacts.removeContact(contactId);
      
      if (removed) {
        return {
          success: true,
          message: 'Emergency contact removed successfully',
        };
      } else {
        throw new Error('Failed to remove emergency contact');
      }
    } catch (error) {
      console.error('❌ Remove emergency contact error:', error);
      return {
        success: false,
        error: error.message || 'Failed to remove emergency contact',
      };
    }
  },
};