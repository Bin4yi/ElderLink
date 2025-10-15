import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { emergencyService } from '../services/emergency';
import { SOS_CONFIG } from '../utils/constants';

/**
 * Emergency Context for managing SOS functionality and emergency state
 * Handles SOS button state, emergency contacts, and alert management
 */

// Initial state
const initialState = {
  isSOSActive: false,
  isSOSLoading: false,
  sosCountdown: 0,
  emergencyContacts: [],
  assignedStaff: [],
  lastEmergencyAlert: null,
  emergencyHistory: [],
  systemStatus: {
    location: false,
    backend: false,
    contacts: false,
    staff: false,
  },
  error: null,
};

// Emergency actions
const EMERGENCY_ACTIONS = {
  SOS_START: 'SOS_START',
  SOS_CANCEL: 'SOS_CANCEL',
  SOS_TRIGGERED: 'SOS_TRIGGERED',
  SOS_LOADING: 'SOS_LOADING',
  SOS_ERROR: 'SOS_ERROR',
  SOS_RESET: 'SOS_RESET',
  UPDATE_COUNTDOWN: 'UPDATE_COUNTDOWN',
  SET_EMERGENCY_CONTACTS: 'SET_EMERGENCY_CONTACTS',
  ADD_EMERGENCY_CONTACT: 'ADD_EMERGENCY_CONTACT',
  UPDATE_EMERGENCY_CONTACT: 'UPDATE_EMERGENCY_CONTACT',
  REMOVE_EMERGENCY_CONTACT: 'REMOVE_EMERGENCY_CONTACT',
  SET_ASSIGNED_STAFF: 'SET_ASSIGNED_STAFF',
  SET_EMERGENCY_HISTORY: 'SET_EMERGENCY_HISTORY',
  ADD_EMERGENCY_RECORD: 'ADD_EMERGENCY_RECORD',
  UPDATE_SYSTEM_STATUS: 'UPDATE_SYSTEM_STATUS',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Emergency reducer
const emergencyReducer = (state, action) => {
  switch (action.type) {
    case EMERGENCY_ACTIONS.SOS_START:
      return {
        ...state,
        isSOSActive: true,
        sosCountdown: SOS_CONFIG.HOLD_DURATION,
        error: null,
      };

    case EMERGENCY_ACTIONS.SOS_CANCEL:
      return {
        ...state,
        isSOSActive: false,
        isSOSLoading: false,
        sosCountdown: 0,
        error: null,
      };

    case EMERGENCY_ACTIONS.SOS_TRIGGERED:
      return {
        ...state,
        isSOSActive: false,
        isSOSLoading: false,
        sosCountdown: 0,
        lastEmergencyAlert: action.payload.emergencyData,
        error: null,
      };

    case EMERGENCY_ACTIONS.SOS_LOADING:
      return {
        ...state,
        isSOSLoading: true,
        error: null,
      };

    case EMERGENCY_ACTIONS.SOS_ERROR:
      return {
        ...state,
        isSOSActive: false,
        isSOSLoading: false,
        sosCountdown: 0,
        error: action.payload.error,
      };

    case EMERGENCY_ACTIONS.SOS_RESET:
      return {
        ...state,
        isSOSActive: false,
        isSOSLoading: false,
        sosCountdown: 0,
        sosProgress: 0,
        error: null,
      };

    case EMERGENCY_ACTIONS.UPDATE_COUNTDOWN:
      return {
        ...state,
        sosCountdown: Math.max(0, action.payload.countdown),
      };

    case EMERGENCY_ACTIONS.SET_EMERGENCY_CONTACTS:
      return {
        ...state,
        emergencyContacts: action.payload.contacts,
      };

    case EMERGENCY_ACTIONS.ADD_EMERGENCY_CONTACT:
      return {
        ...state,
        emergencyContacts: [...state.emergencyContacts, action.payload.contact],
      };

    case EMERGENCY_ACTIONS.UPDATE_EMERGENCY_CONTACT:
      return {
        ...state,
        emergencyContacts: state.emergencyContacts.map(contact =>
          contact.id === action.payload.contactId
            ? { ...contact, ...action.payload.updates }
            : contact
        ),
      };

    case EMERGENCY_ACTIONS.REMOVE_EMERGENCY_CONTACT:
      return {
        ...state,
        emergencyContacts: state.emergencyContacts.filter(
          contact => contact.id !== action.payload.contactId
        ),
      };

    case EMERGENCY_ACTIONS.SET_ASSIGNED_STAFF:
      return {
        ...state,
        assignedStaff: action.payload.staff,
      };

    case EMERGENCY_ACTIONS.SET_EMERGENCY_HISTORY:
      return {
        ...state,
        emergencyHistory: action.payload.history,
      };

    case EMERGENCY_ACTIONS.ADD_EMERGENCY_RECORD:
      return {
        ...state,
        emergencyHistory: [action.payload.record, ...state.emergencyHistory],
      };

    case EMERGENCY_ACTIONS.UPDATE_SYSTEM_STATUS:
      return {
        ...state,
        systemStatus: { ...state.systemStatus, ...action.payload.status },
      };

    case EMERGENCY_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
export const EmergencyContext = createContext(undefined);

// Emergency provider component
export const EmergencyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(emergencyReducer, initialState);

  // Load initial data
  useEffect(() => {
    loadEmergencyData();
  }, []);

  // SOS countdown timer
  useEffect(() => {
    let interval = null;
    
    if (state.isSOSActive && state.sosCountdown > 0) {
      interval = setInterval(() => {
        dispatch({
          type: EMERGENCY_ACTIONS.UPDATE_COUNTDOWN,
          payload: { countdown: state.sosCountdown - SOS_CONFIG.COUNTDOWN_INTERVAL },
        });
      }, SOS_CONFIG.COUNTDOWN_INTERVAL);
    } else if (state.isSOSActive && state.sosCountdown <= 0) {
      // SOS countdown reached zero, trigger emergency
      triggerEmergencyAlert();
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isSOSActive, state.sosCountdown]);

  /**
   * Load emergency data on initialization
   */
  const loadEmergencyData = async () => {
    try {
      // Load emergency contacts
      const contactsResult = await emergencyService.getEmergencyContacts();
      if (contactsResult.success) {
        dispatch({
          type: EMERGENCY_ACTIONS.SET_EMERGENCY_CONTACTS,
          payload: { contacts: contactsResult.contacts },
        });
      }

      // Load emergency history
      const historyResult = await emergencyService.getEmergencyHistory();
      if (historyResult.success) {
        dispatch({
          type: EMERGENCY_ACTIONS.SET_EMERGENCY_HISTORY,
          payload: { history: historyResult.records },
        });
      }

      console.log('✅ Emergency data loaded');
    } catch (error) {
      console.error('❌ Failed to load emergency data:', error);
    }
  };

  /**
   * Start SOS countdown
   */
  const startSOS = () => {
    console.log('🚨 Starting SOS countdown...');
    
    dispatch({ type: EMERGENCY_ACTIONS.SOS_START });
  };

  /**
   * Cancel SOS
   */
  const cancelSOS = () => {
    console.log('❌ SOS cancelled');
    
    dispatch({ type: EMERGENCY_ACTIONS.SOS_CANCEL });
  };

  /**
   * Trigger emergency alert
   */
  const triggerEmergencyAlert = async (elderData, additionalInfo = {}) => {
    try {
      dispatch({ type: EMERGENCY_ACTIONS.SOS_LOADING });

      console.log('🚨🚨🚨 EMERGENCY ALERT TRIGGERED 🚨🚨🚨');
      console.log('📋 Elder Data:', elderData?.firstName, elderData?.lastName, 'ID:', elderData?.id);

      const result = await emergencyService.triggerSOS(elderData, additionalInfo);

      console.log('📊 Emergency Alert Result:', {
        success: result.success,
        message: result.message,
        hasEmergencyData: !!result.emergencyData,
        error: result.error
      });

      if (result.success) {
        dispatch({
          type: EMERGENCY_ACTIONS.SOS_TRIGGERED,
          payload: { emergencyData: result.emergencyData },
        });

        dispatch({
          type: EMERGENCY_ACTIONS.ADD_EMERGENCY_RECORD,
          payload: { record: result.emergencyData },
        });

        console.log('🎉🎉🎉 EMERGENCY ALERT SENT SUCCESSFULLY! 🎉🎉🎉');
        console.log('✅ Emergency services have been notified');
        console.log('✅ Family members have been alerted');
        console.log('✅ Emergency record saved locally');
        
        // Reset SOS state after 2 seconds to allow button to be pressed again
        setTimeout(() => {
          dispatch({ type: EMERGENCY_ACTIONS.SOS_RESET });
          console.log('🔄 SOS button reset - ready for next emergency');
        }, 2000);
        
        return { success: true, message: 'Emergency alert sent successfully' };
      } else {
        dispatch({
          type: EMERGENCY_ACTIONS.SOS_ERROR,
          payload: { error: result.error },
        });

        console.log('❌❌❌ EMERGENCY ALERT FAILED! ❌❌❌');
        console.log('💔 Error:', result.error);
        
        // Reset SOS state after 3 seconds to allow retry
        setTimeout(() => {
          dispatch({ type: EMERGENCY_ACTIONS.SOS_RESET });
          console.log('🔄 SOS button reset - ready for retry');
        }, 3000);
        
        return { success: false, error: result.error };
      }
    } catch (error) {
      dispatch({
        type: EMERGENCY_ACTIONS.SOS_ERROR,
        payload: { error: error.message || 'Emergency alert failed' },
      });

      console.error('❌ Emergency alert error:', error);
      
      // Reset SOS state after 3 seconds to allow retry
      setTimeout(() => {
        dispatch({ type: EMERGENCY_ACTIONS.SOS_RESET });
        console.log('🔄 SOS button reset - ready for retry');
      }, 3000);
      
      return { success: false, error: error.message || 'Emergency alert failed' };
    }
  };

  /**
   * Test emergency system
   */
  const testEmergencySystem = async (elderData) => {
    try {
      console.log('🧪 Testing emergency system...');

      const result = await emergencyService.testEmergencySystem(elderData);

      if (result.success) {
        dispatch({
          type: EMERGENCY_ACTIONS.UPDATE_SYSTEM_STATUS,
          payload: { status: result.testResults },
        });

        console.log('✅ Emergency system test completed');
        return result;
      } else {
        console.log('❌ Emergency system test failed:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Emergency system test error:', error);
      return { success: false, error: error.message || 'Emergency system test failed' };
    }
  };

  /**
   * Load assigned staff
   */
  const loadAssignedStaff = async (elderId) => {
    try {
      console.log('👥 Loading assigned staff...');

      const result = await emergencyService.getAssignedStaff(elderId);

      if (result.success) {
        dispatch({
          type: EMERGENCY_ACTIONS.SET_ASSIGNED_STAFF,
          payload: { staff: result.staff },
        });

        console.log('✅ Assigned staff loaded');
        return result;
      } else {
        console.log('❌ Failed to load assigned staff:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Load assigned staff error:', error);
      return { success: false, error: error.message || 'Failed to load assigned staff' };
    }
  };

  /**
   * Add emergency contact
   */
  const addEmergencyContact = async (contact) => {
    try {
      console.log('➕ Adding emergency contact...');

      const result = await emergencyService.addEmergencyContact(contact);

      if (result.success) {
        dispatch({
          type: EMERGENCY_ACTIONS.ADD_EMERGENCY_CONTACT,
          payload: { contact: result.contact },
        });

        console.log('✅ Emergency contact added');
        return result;
      } else {
        console.log('❌ Failed to add emergency contact:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Add emergency contact error:', error);
      return { success: false, error: error.message || 'Failed to add emergency contact' };
    }
  };

  /**
   * Update emergency contact
   */
  const updateEmergencyContact = async (contactId, updates) => {
    try {
      console.log('✏️ Updating emergency contact...');

      const result = await emergencyService.updateEmergencyContact(contactId, updates);

      if (result.success) {
        dispatch({
          type: EMERGENCY_ACTIONS.UPDATE_EMERGENCY_CONTACT,
          payload: { contactId, updates },
        });

        console.log('✅ Emergency contact updated');
        return result;
      } else {
        console.log('❌ Failed to update emergency contact:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Update emergency contact error:', error);
      return { success: false, error: error.message || 'Failed to update emergency contact' };
    }
  };

  /**
   * Remove emergency contact
   */
  const removeEmergencyContact = async (contactId) => {
    try {
      console.log('🗑️ Removing emergency contact...');

      const result = await emergencyService.removeEmergencyContact(contactId);

      if (result.success) {
        dispatch({
          type: EMERGENCY_ACTIONS.REMOVE_EMERGENCY_CONTACT,
          payload: { contactId },
        });

        console.log('✅ Emergency contact removed');
        return result;
      } else {
        console.log('❌ Failed to remove emergency contact:', result.error);
        return result;
      }
    } catch (error) {
      console.error('❌ Remove emergency contact error:', error);
      return { success: false, error: error.message || 'Failed to remove emergency contact' };
    }
  };

  /**
   * Clear error
   */
  const clearError = () => {
    dispatch({ type: EMERGENCY_ACTIONS.CLEAR_ERROR });
  };

  /**
   * Get SOS progress percentage
   */
  const getSOSProgress = () => {
    if (!state.isSOSActive) return 0;
    const progress = ((SOS_CONFIG.HOLD_DURATION - state.sosCountdown) / SOS_CONFIG.HOLD_DURATION) * 100;
    return Math.min(100, Math.max(0, progress));
  };

  // Context value
  const value = {
    // State
    isSOSActive: state.isSOSActive,
    isSOSLoading: state.isSOSLoading,
    sosCountdown: state.sosCountdown,
    emergencyContacts: state.emergencyContacts,
    assignedStaff: state.assignedStaff,
    lastEmergencyAlert: state.lastEmergencyAlert,
    emergencyHistory: state.emergencyHistory,
    systemStatus: state.systemStatus,
    error: state.error,

    // Actions
    startSOS,
    cancelSOS,
    triggerEmergencyAlert,
    testEmergencySystem,
    loadAssignedStaff,
    addEmergencyContact,
    updateEmergencyContact,
    removeEmergencyContact,
    clearError,
    getSOSProgress,
    loadEmergencyData,

    // Computed values
    sosProgress: getSOSProgress(),
    hasEmergencyContacts: state.emergencyContacts.length > 0,
    hasAssignedStaff: state.assignedStaff.length > 0,
    isSystemReady: state.systemStatus.location && state.systemStatus.backend && state.systemStatus.contacts,
  };

  return (
    <EmergencyContext.Provider value={value}>
      {children}
    </EmergencyContext.Provider>
  );
};

// Custom hook to use emergency context
export const useEmergency = () => {
  const context = useContext(EmergencyContext);
  
  if (context === undefined) {
    throw new Error('useEmergency must be used within an EmergencyProvider');
  }
  
  return context;
};