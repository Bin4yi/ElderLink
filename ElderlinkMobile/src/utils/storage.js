import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

/**
 * Storage utility functions for managing app data
 * Handles user data, settings, and emergency contacts
 */
export const StorageUtils = {
  // Basic storage operations
  setItem: async (key, value) => {
    try {
      if (!key || typeof key !== 'string') {
        console.error('❌ Invalid storage key:', key, typeof key);
        return false;
      }
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
      return true;
    } catch (error) {
      console.error('❌ Error storing data with key:', key, error);
      return false;
    }
  },

  getItem: async (key) => {
    try {
      if (!key || typeof key !== 'string') {
        console.error('❌ Invalid storage key:', key, typeof key);
        return null;
      }
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('❌ Error retrieving data with key:', key, error);
      return null;
    }
  },

  removeItem: async (key) => {
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing data:', error);
      return false;
    }
  },

  // Authentication data management
  auth: {
    setUserData: async (userData) => {
      return await StorageUtils.setItem(STORAGE_KEYS.USER_DATA, userData);
    },

    getUserData: async () => {
      return await StorageUtils.getItem(STORAGE_KEYS.USER_DATA);
    },

    setAuthToken: async (token) => {
      return await StorageUtils.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    },

    getAuthToken: async () => {
      return await StorageUtils.getItem(STORAGE_KEYS.AUTH_TOKEN);
    },

    clearAuth: async () => {
      const results = await Promise.all([
        StorageUtils.removeItem(STORAGE_KEYS.USER_DATA),
        StorageUtils.removeItem(STORAGE_KEYS.AUTH_TOKEN),
        StorageUtils.removeItem(STORAGE_KEYS.ELDER_DATA)
      ]);
      return results.every(result => result === true);
    },

    logout: async () => {
      return await StorageUtils.auth.clearAuth();
    }
  },

  // Elder-specific data management
  elder: {
    setData: async (elderData) => {
      return await StorageUtils.setItem(STORAGE_KEYS.ELDER_DATA, elderData);
    },

    getData: async () => {
      return await StorageUtils.getItem(STORAGE_KEYS.ELDER_DATA);
    },

    updateProfile: async (profileData) => {
      const existingData = await StorageUtils.elder.getData();
      const updatedData = { ...existingData, ...profileData };
      return await StorageUtils.elder.setData(updatedData);
    },

    clearData: async () => {
      return await StorageUtils.removeItem(STORAGE_KEYS.ELDER_DATA);
    }
  },

  // App settings management
  settings: {
    setSettings: async (settings) => {
      return await StorageUtils.setItem(STORAGE_KEYS.SETTINGS, settings);
    },

    getSettings: async () => {
      return await StorageUtils.getItem(STORAGE_KEYS.SETTINGS);
    },

    updateSetting: async (key, value) => {
      const currentSettings = await StorageUtils.settings.getSettings() || {};
      const updatedSettings = { ...currentSettings, [key]: value };
      return await StorageUtils.settings.setSettings(updatedSettings);
    },

    resetToDefaults: async () => {
      const defaultSettings = {
        notifications: true,
        healthReminders: true,
        appointmentReminders: true,
        emergencyAlerts: true,
        fontSize: 'large',
        highContrast: false,
        reduceMotion: false,
      };
      return await StorageUtils.settings.setSettings(defaultSettings);
    }
  },

  // Emergency contacts management
  emergencyContacts: {
    setContacts: async (contacts) => {
      return await StorageUtils.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, contacts);
    },

    getContacts: async () => {
      return await StorageUtils.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS) || [];
    },

    addContact: async (contact) => {
      const contacts = await StorageUtils.emergencyContacts.getContacts();
      const updatedContacts = [...contacts, { ...contact, id: Date.now().toString() }];
      return await StorageUtils.emergencyContacts.setContacts(updatedContacts);
    },

    updateContact: async (contactId, updatedContact) => {
      const contacts = await StorageUtils.emergencyContacts.getContacts();
      const updatedContacts = contacts.map(contact => 
        contact.id === contactId ? { ...contact, ...updatedContact } : contact
      );
      return await StorageUtils.emergencyContacts.setContacts(updatedContacts);
    },

    removeContact: async (contactId) => {
      const contacts = await StorageUtils.emergencyContacts.getContacts();
      const updatedContacts = contacts.filter(contact => contact.id !== contactId);
      return await StorageUtils.emergencyContacts.setContacts(updatedContacts);
    }
  },

  // Health data management
  health: {
    setHealthRecords: async (records) => {
      return await StorageUtils.setItem(STORAGE_KEYS.HEALTH_RECORDS, records);
    },

    getHealthRecords: async () => {
      return await StorageUtils.getItem(STORAGE_KEYS.HEALTH_RECORDS) || [];
    },

    addHealthRecord: async (record) => {
      const records = await StorageUtils.health.getHealthRecords();
      const newRecord = { ...record, id: Date.now().toString(), recordedAt: new Date().toISOString() };
      const updatedRecords = [newRecord, ...records];
      return await StorageUtils.health.setHealthRecords(updatedRecords);
    },

    getLatestVitalSigns: async () => {
      const records = await StorageUtils.health.getHealthRecords();
      return records.length > 0 ? records[0] : null;
    },

    getCachedHealthData: async (elderId, days = 30) => {
      try {
        const cacheKey = `${STORAGE_KEYS.HEALTH_CACHE}_${elderId}_${days}`;
        const cachedData = await StorageUtils.getItem(cacheKey);
        
        if (cachedData) {
          const cacheAge = Date.now() - new Date(cachedData.timestamp).getTime();
          // Cache valid for 5 minutes
          if (cacheAge < 5 * 60 * 1000) {
            return cachedData.data;
          }
        }
        
        return null;
      } catch (error) {
        console.error('Error getting cached health data:', error);
        return null;
      }
    },

    setCachedHealthData: async (elderId, days, data) => {
      try {
        const cacheKey = `${STORAGE_KEYS.HEALTH_CACHE}_${elderId}_${days}`;
        const cacheData = {
          data,
          timestamp: new Date().toISOString()
        };
        return await StorageUtils.setItem(cacheKey, cacheData);
      } catch (error) {
        console.error('Error setting cached health data:', error);
        return false;
      }
    },

    clearHealthCache: async (elderId) => {
      try {
        const allKeys = await StorageUtils.getAllKeys();
        const healthCacheKeys = allKeys.filter(key => 
          key.startsWith(`${STORAGE_KEYS.HEALTH_CACHE}_${elderId}`)
        );
        
        const results = await Promise.all(
          healthCacheKeys.map(key => StorageUtils.removeItem(key))
        );
        
        return results.every(result => result === true);
      } catch (error) {
        console.error('Error clearing health cache:', error);
        return false;
      }
    }
  },

  // App state management
  appState: {
    setFirstLaunch: async (isFirstLaunch) => {
      return await StorageUtils.setItem(STORAGE_KEYS.FIRST_LAUNCH, isFirstLaunch);
    },

    isFirstLaunch: async () => {
      const value = await StorageUtils.getItem(STORAGE_KEYS.FIRST_LAUNCH);
      return value !== false; // Default to true if not set
    },

    setLastActiveDate: async () => {
      const currentDate = new Date().toISOString();
      return await StorageUtils.setItem(STORAGE_KEYS.LAST_ACTIVE, currentDate);
    },

    getLastActiveDate: async () => {
      return await StorageUtils.getItem(STORAGE_KEYS.LAST_ACTIVE);
    },

    setAppVersion: async (version) => {
      return await StorageUtils.setItem(STORAGE_KEYS.APP_VERSION, version);
    },

    getAppVersion: async () => {
      return await StorageUtils.getItem(STORAGE_KEYS.APP_VERSION);
    }
  },

  // Emergency records management
  emergencyRecords: {
    getRecords: async () => {
      return await StorageUtils.getItem(STORAGE_KEYS.EMERGENCY_RECORDS) || [];
    },

    addRecord: async (record) => {
      try {
        const records = await StorageUtils.emergencyRecords.getRecords();
        const newRecord = {
          ...record,
          id: record.id || Date.now().toString(),
          timestamp: record.timestamp || new Date().toISOString()
        };
        
        const updatedRecords = [newRecord, ...records].slice(0, 100); // Keep only last 100 records
        await StorageUtils.setItem(STORAGE_KEYS.EMERGENCY_RECORDS, updatedRecords);
        return true;
      } catch (error) {
        console.error('Error adding emergency record:', error);
        return false;
      }
    },

    getRecordById: async (recordId) => {
      try {
        const records = await StorageUtils.emergencyRecords.getRecords();
        return records.find(record => record.id === recordId) || null;
      } catch (error) {
        console.error('Error getting emergency record:', error);
        return null;
      }
    },

    clearRecords: async () => {
      try {
        await StorageUtils.setItem(STORAGE_KEYS.EMERGENCY_RECORDS, []);
        return true;
      } catch (error) {
        console.error('Error clearing emergency records:', error);
        return false;
      }
    }
  },

  // Pending emergencies management (for offline sync)
  pendingEmergencies: {
    getAll: async () => {
      return await StorageUtils.getItem(STORAGE_KEYS.PENDING_EMERGENCIES) || [];
    },

    add: async (emergencyData) => {
      try {
        const pending = await StorageUtils.pendingEmergencies.getAll();
        const newEntry = {
          ...emergencyData,
          pendingSince: new Date().toISOString(),
          syncAttempts: 0,
          id: Date.now().toString()
        };
        
        const updated = [newEntry, ...pending];
        await StorageUtils.setItem(STORAGE_KEYS.PENDING_EMERGENCIES, updated);
        return true;
      } catch (error) {
        console.error('Error adding pending emergency:', error);
        return false;
      }
    },

    remove: async (id) => {
      try {
        const pending = await StorageUtils.pendingEmergencies.getAll();
        const updated = pending.filter(item => item.id !== id);
        await StorageUtils.setItem(STORAGE_KEYS.PENDING_EMERGENCIES, updated);
        return true;
      } catch (error) {
        console.error('Error removing pending emergency:', error);
        return false;
      }
    },

    clear: async () => {
      try {
        await StorageUtils.setItem(STORAGE_KEYS.PENDING_EMERGENCIES, []);
        return true;
      } catch (error) {
        console.error('Error clearing pending emergencies:', error);
        return false;
      }
    }
  },

  // Backup and restore functionality
  createBackup: async () => {
    try {
      const backup = {
        userData: await StorageUtils.auth.getUserData(),
        elderData: await StorageUtils.elder.getData(),
        settings: await StorageUtils.settings.getSettings(),
        emergencyContacts: await StorageUtils.emergencyContacts.getContacts(),
        healthRecords: await StorageUtils.health.getHealthRecords(),
        timestamp: new Date().toISOString()
      };
      
      return backup;
    } catch (error) {
      console.error('Error creating backup:', error);
      return null;
    }
  },

  getAllKeys: async () => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },

  restoreFromBackup: async (backupData) => {
    try {
      if (!backupData || typeof backupData !== 'object') {
        throw new Error('Invalid backup data');
      }

      const results = await Promise.all([
        backupData.userData ? StorageUtils.auth.setUserData(backupData.userData) : true,
        backupData.elderData ? StorageUtils.elder.setData(backupData.elderData) : true,
        backupData.settings ? StorageUtils.settings.setSettings(backupData.settings) : true,
        backupData.emergencyContacts ? StorageUtils.emergencyContacts.setContacts(backupData.emergencyContacts) : true,
        backupData.healthRecords ? StorageUtils.health.setHealthRecords(backupData.healthRecords) : true,
      ]);

      return results.every(result => result === true);
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return false;
    }
  },

  /**
   * Initialize storage with default values
   */
  initialize: async () => {
    try {
      // Set default settings if not exists
      const existingSettings = await StorageUtils.getItem(STORAGE_KEYS.SETTINGS);
      if (!existingSettings) {
        await StorageUtils.settings.resetToDefaults();
      }

      // Initialize emergency contacts array if not exists
      const existingContacts = await StorageUtils.getItem(STORAGE_KEYS.EMERGENCY_CONTACTS);
      if (!existingContacts) {
        await StorageUtils.setItem(STORAGE_KEYS.EMERGENCY_CONTACTS, []);
      }

      // Initialize emergency records array if not exists
      const existingEmergencyRecords = await StorageUtils.getItem(STORAGE_KEYS.EMERGENCY_RECORDS);
      if (!existingEmergencyRecords) {
        await StorageUtils.setItem(STORAGE_KEYS.EMERGENCY_RECORDS, []);
      }

      // Initialize pending emergencies array if not exists
      const existingPendingEmergencies = await StorageUtils.getItem(STORAGE_KEYS.PENDING_EMERGENCIES);
      if (!existingPendingEmergencies) {
        await StorageUtils.setItem(STORAGE_KEYS.PENDING_EMERGENCIES, []);
      }

      // Initialize health records array if not exists
      const existingHealthRecords = await StorageUtils.getItem(STORAGE_KEYS.HEALTH_RECORDS);
      if (!existingHealthRecords) {
        await StorageUtils.setItem(STORAGE_KEYS.HEALTH_RECORDS, []);
      }

      // Set app version and last active date
      await StorageUtils.appState.setAppVersion('1.0.0');
      await StorageUtils.appState.setLastActiveDate();

      return true;
    } catch (error) {
      console.error('Error initializing storage:', error);
      return false;
    }
  },

  /**
   * Clear all app data (useful for logout or reset)
   */
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }
};