import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { healthMonitoringService } from '../services/healthMonitoring';
import { HEALTH_CONFIG } from '../utils/constants';

/**
 * Health Context for managing health monitoring data and state
 * Handles vital signs, health history, and health analytics
 */

// Initial state
const initialState = {
  isLoading: false,
  healthRecords: [],
  todayRecords: [],
  healthSummary: null,
  healthAlerts: [],
  healthStatistics: {},
  vitalSignsTrends: {},
  lastSyncTime: null,
  error: null,
};

// Health actions
const HEALTH_ACTIONS = {
  LOADING: 'LOADING',
  SET_HEALTH_RECORDS: 'SET_HEALTH_RECORDS',
  ADD_HEALTH_RECORD: 'ADD_HEALTH_RECORD',
  UPDATE_HEALTH_RECORD: 'UPDATE_HEALTH_RECORD',
  REMOVE_HEALTH_RECORD: 'REMOVE_HEALTH_RECORD',
  SET_TODAY_RECORDS: 'SET_TODAY_RECORDS',
  SET_HEALTH_SUMMARY: 'SET_HEALTH_SUMMARY',
  SET_HEALTH_ALERTS: 'SET_HEALTH_ALERTS',
  SET_HEALTH_STATISTICS: 'SET_HEALTH_STATISTICS',
  SET_VITAL_SIGNS_TRENDS: 'SET_VITAL_SIGNS_TRENDS',
  UPDATE_LAST_SYNC: 'UPDATE_LAST_SYNC',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Health reducer
const healthReducer = (state, action) => {
  switch (action.type) {
    case HEALTH_ACTIONS.LOADING:
      return {
        ...state,
        isLoading: true,
        error: null,
      };

    case HEALTH_ACTIONS.SET_HEALTH_RECORDS:
      return {
        ...state,
        isLoading: false,
        healthRecords: action.payload.records,
        lastSyncTime: new Date().toISOString(),
        error: null,
      };

    case HEALTH_ACTIONS.ADD_HEALTH_RECORD:
      return {
        ...state,
        healthRecords: [action.payload.record, ...state.healthRecords],
        todayRecords: [...state.todayRecords, action.payload.record],
        lastSyncTime: new Date().toISOString(),
        error: null,
      };

    case HEALTH_ACTIONS.UPDATE_HEALTH_RECORD:
      return {
        ...state,
        healthRecords: state.healthRecords.map(record =>
          record.id === action.payload.recordId
            ? { ...record, ...action.payload.updates }
            : record
        ),
        todayRecords: state.todayRecords.map(record =>
          record.id === action.payload.recordId
            ? { ...record, ...action.payload.updates }
            : record
        ),
        lastSyncTime: new Date().toISOString(),
        error: null,
      };

    case HEALTH_ACTIONS.REMOVE_HEALTH_RECORD:
      return {
        ...state,
        healthRecords: state.healthRecords.filter(
          record => record.id !== action.payload.recordId
        ),
        todayRecords: state.todayRecords.filter(
          record => record.id !== action.payload.recordId
        ),
        lastSyncTime: new Date().toISOString(),
        error: null,
      };

    case HEALTH_ACTIONS.SET_TODAY_RECORDS:
      return {
        ...state,
        isLoading: false,
        todayRecords: action.payload.records,
        error: null,
      };

    case HEALTH_ACTIONS.SET_HEALTH_SUMMARY:
      return {
        ...state,
        isLoading: false,
        healthSummary: action.payload.summary,
        error: null,
      };

    case HEALTH_ACTIONS.SET_HEALTH_ALERTS:
      return {
        ...state,
        healthAlerts: action.payload.alerts,
        error: null,
      };

    case HEALTH_ACTIONS.SET_HEALTH_STATISTICS:
      return {
        ...state,
        healthStatistics: action.payload.statistics,
        error: null,
      };

    case HEALTH_ACTIONS.SET_VITAL_SIGNS_TRENDS:
      return {
        ...state,
        vitalSignsTrends: {
          ...state.vitalSignsTrends,
          [action.payload.vitalSign]: action.payload.trends,
        },
        error: null,
      };

    case HEALTH_ACTIONS.UPDATE_LAST_SYNC:
      return {
        ...state,
        lastSyncTime: new Date().toISOString(),
      };

    case HEALTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
      };

    case HEALTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    default:
      return state;
  }
};

// Create context
const HealthContext = createContext(undefined);

// Health provider component
export const HealthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(healthReducer, initialState);

  // Load initial health data
  useEffect(() => {
    loadHealthData();
  }, []);

  /**
   * Load all health monitoring data
   */
  const loadHealthData = async () => {
    try {
      dispatch({ type: HEALTH_ACTIONS.LOADING });

      console.log('🩺 Loading health data...');

      // Load all health records
      const healthResult = await healthMonitoringService.getAllHealthMonitoring();
      
      if (healthResult.success) {
        dispatch({
          type: HEALTH_ACTIONS.SET_HEALTH_RECORDS,
          payload: { records: healthResult.data.healthMonitoring },
        });
      }

      // Load today's records
      const todayResult = await healthMonitoringService.getTodayRecords();
      
      if (todayResult.success) {
        dispatch({
          type: HEALTH_ACTIONS.SET_TODAY_RECORDS,
          payload: { records: todayResult.data.records },
        });
      }

      console.log('✅ Health data loaded');
    } catch (error) {
      console.error('❌ Failed to load health data:', error);
      dispatch({
        type: HEALTH_ACTIONS.SET_ERROR,
        payload: { error: error.message || 'Failed to load health data' },
      });
    }
  };

  /**
   * Load health data for specific elder
   */
  const loadElderHealthData = async (elderId, days = 7) => {
    try {
      dispatch({ type: HEALTH_ACTIONS.LOADING });

      console.log('🩺 Loading elder health data for:', elderId);

      const result = await healthMonitoringService.getElderHealthHistory(elderId, days);

      if (result.success) {
        dispatch({
          type: HEALTH_ACTIONS.SET_HEALTH_RECORDS,
          payload: { records: result.data },
        });

        // Load health summary
        const summaryResult = await healthMonitoringService.getHealthSummary(elderId);
        if (summaryResult.success) {
          dispatch({
            type: HEALTH_ACTIONS.SET_HEALTH_SUMMARY,
            payload: { summary: summaryResult.summary },
          });
        }

        console.log('✅ Elder health data loaded');
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to load elder health data:', error);
      dispatch({
        type: HEALTH_ACTIONS.SET_ERROR,
        payload: { error: error.message || 'Failed to load elder health data' },
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Create new health record
   */
  const createHealthRecord = async (healthData) => {
    try {
      dispatch({ type: HEALTH_ACTIONS.LOADING });

      console.log('💾 Creating health record...');

      const result = await healthMonitoringService.createHealthRecord(healthData);

      if (result.success) {
        dispatch({
          type: HEALTH_ACTIONS.ADD_HEALTH_RECORD,
          payload: { record: result.record },
        });

        console.log('✅ Health record created');
        return { success: true, message: result.message };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to create health record:', error);
      dispatch({
        type: HEALTH_ACTIONS.SET_ERROR,
        payload: { error: error.message || 'Failed to create health record' },
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Update health record
   */
  const updateHealthRecord = async (recordId, updateData) => {
    try {
      console.log('✏️ Updating health record:', recordId);

      const result = await healthMonitoringService.updateHealthRecord(recordId, updateData);

      if (result.success) {
        dispatch({
          type: HEALTH_ACTIONS.UPDATE_HEALTH_RECORD,
          payload: { recordId, updates: result.record },
        });

        console.log('✅ Health record updated');
        return { success: true, message: result.message };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to update health record:', error);
      dispatch({
        type: HEALTH_ACTIONS.SET_ERROR,
        payload: { error: error.message || 'Failed to update health record' },
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Delete health record
   */
  const deleteHealthRecord = async (recordId) => {
    try {
      console.log('🗑️ Deleting health record:', recordId);

      const result = await healthMonitoringService.deleteHealthRecord(recordId);

      if (result.success) {
        dispatch({
          type: HEALTH_ACTIONS.REMOVE_HEALTH_RECORD,
          payload: { recordId },
        });

        console.log('✅ Health record deleted');
        return { success: true, message: result.message };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to delete health record:', error);
      dispatch({
        type: HEALTH_ACTIONS.SET_ERROR,
        payload: { error: error.message || 'Failed to delete health record' },
      });
      return { success: false, error: error.message };
    }
  };

  /**
   * Load health alerts
   */
  const loadHealthAlerts = async (elderId) => {
    try {
      console.log('🚨 Loading health alerts...');

      const result = await healthMonitoringService.getHealthAlerts(elderId);

      if (result.success) {
        dispatch({
          type: HEALTH_ACTIONS.SET_HEALTH_ALERTS,
          payload: { alerts: result.alerts },
        });

        console.log('✅ Health alerts loaded');
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to load health alerts:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Load health statistics
   */
  const loadHealthStatistics = async (elderId, period = '7days') => {
    try {
      console.log('📊 Loading health statistics...');

      const result = await healthMonitoringService.getHealthStatistics(elderId, period);

      if (result.success) {
        dispatch({
          type: HEALTH_ACTIONS.SET_HEALTH_STATISTICS,
          payload: { statistics: result.statistics },
        });

        console.log('✅ Health statistics loaded');
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to load health statistics:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Load vital signs trends
   */
  const loadVitalSignsTrends = async (elderId, vitalSign, days = 30) => {
    try {
      console.log('📈 Loading vital signs trends for:', vitalSign);

      const result = await healthMonitoringService.getVitalSignsTrends(elderId, vitalSign, days);

      if (result.success) {
        dispatch({
          type: HEALTH_ACTIONS.SET_VITAL_SIGNS_TRENDS,
          payload: { vitalSign, trends: result.trends },
        });

        console.log('✅ Vital signs trends loaded');
        return { success: true };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Failed to load vital signs trends:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Refresh health data
   */
  const refreshHealthData = async (elderId = null) => {
    try {
      console.log('🔄 Refreshing health data...');

      if (elderId) {
        await loadElderHealthData(elderId);
      } else {
        await loadHealthData();
      }

      dispatch({ type: HEALTH_ACTIONS.UPDATE_LAST_SYNC });

      console.log('✅ Health data refreshed');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to refresh health data:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Validate health reading
   */
  const validateHealthReading = (type, value) => {
    return healthMonitoringService.checkHealthReading(type, value);
  };

  /**
   * Get health status color
   */
  const getHealthStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return HEALTH_CONFIG.ALERT_LEVELS.NORMAL;
      case 'warning':
        return HEALTH_CONFIG.ALERT_LEVELS.WARNING;
      case 'critical':
        return HEALTH_CONFIG.ALERT_LEVELS.CRITICAL;
      case 'emergency':
        return HEALTH_CONFIG.ALERT_LEVELS.EMERGENCY;
      default:
        return HEALTH_CONFIG.ALERT_LEVELS.NORMAL;
    }
  };

  /**
   * Get latest vital signs
   */
  const getLatestVitalSigns = () => {
    if (state.healthRecords.length === 0) return null;

    const latestRecord = state.healthRecords[0];
    return {
      heartRate: latestRecord.heartRate,
      bloodPressure: {
        systolic: latestRecord.bloodPressureSystolic,
        diastolic: latestRecord.bloodPressureDiastolic,
      },
      temperature: latestRecord.temperature,
      oxygenSaturation: latestRecord.oxygenSaturation,
      weight: latestRecord.weight,
      sleepHours: latestRecord.sleepHours,
      recordedAt: latestRecord.monitoringDate,
    };
  };

  /**
   * Check if health data was recorded today
   */
  const hasRecordedToday = () => {
    const today = new Date().toDateString();
    return state.todayRecords.some(record => {
      const recordDate = new Date(record.monitoringDate).toDateString();
      return recordDate === today;
    });
  };

  /**
   * Get health trends
   */
  const getHealthTrends = (vitalSign) => {
    const trends = state.vitalSignsTrends[vitalSign];
    if (!trends || trends.length < 2) return 'stable';

    const recent = trends.slice(-7); // Last 7 days
    const average = recent.reduce((sum, item) => sum + item.value, 0) / recent.length;
    const previousAverage = trends.slice(-14, -7).reduce((sum, item) => sum + item.value, 0) / 7;

    if (average > previousAverage * 1.1) return 'increasing';
    if (average < previousAverage * 0.9) return 'decreasing';
    return 'stable';
  };

  /**
   * Clear error
   */
  const clearError = () => {
    dispatch({ type: HEALTH_ACTIONS.CLEAR_ERROR });
  };

  // Context value
  const value = {
    // State
    isLoading: state.isLoading,
    healthRecords: state.healthRecords,
    todayRecords: state.todayRecords,
    healthSummary: state.healthSummary,
    healthAlerts: state.healthAlerts,
    healthStatistics: state.healthStatistics,
    vitalSignsTrends: state.vitalSignsTrends,
    lastSyncTime: state.lastSyncTime,
    error: state.error,

    // Actions
    loadHealthData,
    loadElderHealthData,
    createHealthRecord,
    addHealthRecord: createHealthRecord, // Alias for backward compatibility
    updateHealthRecord,
    deleteHealthRecord,
    loadHealthAlerts,
    loadHealthStatistics,
    loadVitalSignsTrends,
    refreshHealthData,
    clearError,

    // Utility functions
    validateHealthReading,
    getHealthStatusColor,
    getLatestVitalSigns,
    hasRecordedToday,
    getHealthTrends,

    // Computed values
    latestVitalSigns: getLatestVitalSigns(),
    recordedToday: hasRecordedToday(),
    totalRecords: state.healthRecords.length,
    todayRecordsCount: state.todayRecords.length,
    hasHealthData: state.healthRecords.length > 0,
    alertsCount: state.healthAlerts.length,
  };

  return (
    <HealthContext.Provider value={value}>
      {children}
    </HealthContext.Provider>
  );
};

// Custom hook to use health context
export const useHealth = () => {
  const context = useContext(HealthContext);
  
  if (context === undefined) {
    throw new Error('useHealth must be used within a HealthProvider');
  }
  
  return context;
};