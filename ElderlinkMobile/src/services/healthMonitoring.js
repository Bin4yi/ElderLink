import apiService from './api';
import { API_ENDPOINTS } from '../utils/constants';
import { StorageUtils } from '../utils/storage';

/**
 * Health monitoring service for managing elder health data
 * Handles vital signs tracking, health history, and alerts
 */
export const healthMonitoringService = {
  /**
   * Get all health monitoring records
   */
  getAllHealthMonitoring: async () => {
    try {
      console.log('🩺 Getting all health monitoring records...');
      
      const response = await apiService.get(API_ENDPOINTS.HEALTH.ALL);
      
      console.log('✅ All health monitoring response:', response);
      
      if (response.success || response.data) {
        const healthData = response.data?.healthMonitoring || response.data || [];
        
        // Cache health data
        await StorageUtils.health.cacheHealthData(healthData);
        
        return {
          success: true,
          data: {
            healthMonitoring: healthData,
          },
        };
      } else {
        throw new Error(response.message || 'Failed to get health monitoring data');
      }
    } catch (error) {
      console.error('❌ Get all health monitoring error:', error);
      
      // Try to get cached data if available
      const cachedData = await StorageUtils.health.getCachedHealthData();
      
      return {
        success: false,
        data: {
          healthMonitoring: cachedData || [],
        },
        error: error.message || 'Failed to get health monitoring data',
        fromCache: !!cachedData,
      };
    }
  },

  /**
   * Get health monitoring history for an elder
   */
  getElderHealthHistory: async (elderId, days = 7) => {
    try {
      console.log('📊 Getting health history for elder:', elderId, 'for', days, 'days');
      
      const response = await apiService.get(API_ENDPOINTS.HEALTH.HISTORY(elderId, days));
      
      console.log('✅ Elder health history response:', response);
      
      if (response.success) {
        return {
          success: true,
          data: response.data.records || [],
        };
      } else {
        throw new Error(response.message || 'Failed to get health history');
      }
    } catch (error) {
      console.error('❌ Get elder health history error:', error);
      return {
        success: false,
        data: [],
        error: error.message || 'Failed to get health history',
      };
    }
  },

  /**
   * Get today's health monitoring records
   */
  getTodayRecords: async () => {
    try {
      console.log('📅 Getting today\'s health monitoring records...');
      
      const response = await apiService.get(API_ENDPOINTS.HEALTH.TODAY);
      
      console.log('✅ Today\'s health records response:', response);
      
      if (response.success) {
        return {
          success: true,
          data: {
            records: response.data.records || [],
          },
        };
      } else {
        throw new Error(response.message || 'Failed to get today\'s health records');
      }
    } catch (error) {
      console.error('❌ Get today\'s health records error:', error);
      return {
        success: false,
        data: {
          records: [],
        },
        error: error.message || 'Failed to get today\'s health records',
      };
    }
  },

  /**
   * Create new health monitoring record
   */
  createHealthRecord: async (healthData) => {
    try {
      console.log('💾 Creating new health monitoring record:', healthData);
      
      const response = await apiService.post(API_ENDPOINTS.HEALTH.CREATE, healthData);
      
      console.log('✅ Create health record response:', response);
      
      if (response.success) {
        // Clear cached health data to force refresh
        await StorageUtils.health.clearHealthCache();
        
        return {
          success: true,
          record: response.data.record,
          message: response.message || 'Health data saved successfully',
        };
      } else {
        throw new Error(response.message || 'Failed to save health data');
      }
    } catch (error) {
      console.error('❌ Create health record error:', error);
      return {
        success: false,
        error: error.message || 'Failed to save health data',
      };
    }
  },

  /**
   * Update health monitoring record
   */
  updateHealthRecord: async (recordId, updateData) => {
    try {
      console.log('✏️ Updating health monitoring record:', recordId, updateData);
      
      const response = await apiService.put(`${API_ENDPOINTS.HEALTH.BASE}/${recordId}`, updateData);
      
      console.log('✅ Update health record response:', response);
      
      if (response.success) {
        // Clear cached health data to force refresh
        await StorageUtils.health.clearHealthCache();
        
        return {
          success: true,
          record: response.data.record,
          message: response.message || 'Health data updated successfully',
        };
      } else {
        throw new Error(response.message || 'Failed to update health data');
      }
    } catch (error) {
      console.error('❌ Update health record error:', error);
      return {
        success: false,
        error: error.message || 'Failed to update health data',
      };
    }
  },

  /**
   * Delete health monitoring record
   */
  deleteHealthRecord: async (recordId) => {
    try {
      console.log('🗑️ Deleting health monitoring record:', recordId);
      
      const response = await apiService.delete(`${API_ENDPOINTS.HEALTH.BASE}/${recordId}`);
      
      console.log('✅ Delete health record response:', response);
      
      if (response.success) {
        // Clear cached health data to force refresh
        await StorageUtils.health.clearHealthCache();
        
        return {
          success: true,
          message: response.message || 'Health record deleted successfully',
        };
      } else {
        throw new Error(response.message || 'Failed to delete health record');
      }
    } catch (error) {
      console.error('❌ Delete health record error:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete health record',
      };
    }
  },

  /**
   * Get health alerts
   */
  getHealthAlerts: async (elderId) => {
    try {
      console.log('🚨 Getting health alerts for elder:', elderId);
      
      const response = await apiService.get(`${API_ENDPOINTS.HEALTH.BASE}/alerts`, {
        elderId,
      });
      
      console.log('✅ Health alerts response:', response);
      
      if (response.success) {
        return {
          success: true,
          alerts: response.data.alerts || [],
        };
      } else {
        throw new Error(response.message || 'Failed to get health alerts');
      }
    } catch (error) {
      console.error('❌ Get health alerts error:', error);
      return {
        success: false,
        alerts: [],
        error: error.message || 'Failed to get health alerts',
      };
    }
  },

  /**
   * Get health statistics
   */
  getHealthStatistics: async (elderId, period = '7days') => {
    try {
      console.log('📊 Getting health statistics for elder:', elderId, 'period:', period);
      
      const response = await apiService.get(`${API_ENDPOINTS.HEALTH.BASE}/stats`, {
        elderId,
        period,
      });
      
      console.log('✅ Health statistics response:', response);
      
      if (response.success) {
        return {
          success: true,
          statistics: response.data.statistics,
        };
      } else {
        throw new Error(response.message || 'Failed to get health statistics');
      }
    } catch (error) {
      console.error('❌ Get health statistics error:', error);
      return {
        success: false,
        statistics: {},
        error: error.message || 'Failed to get health statistics',
      };
    }
  },

  /**
   * Get vital signs trends
   */
  getVitalSignsTrends: async (elderId, vitalSign, days = 30) => {
    try {
      console.log('📈 Getting vital signs trends for:', vitalSign, 'for elder:', elderId);
      
      const response = await apiService.get(`${API_ENDPOINTS.HEALTH.BASE}/trends`, {
        elderId,
        vitalSign,
        days,
      });
      
      console.log('✅ Vital signs trends response:', response);
      
      if (response.success) {
        return {
          success: true,
          trends: response.data.trends || [],
        };
      } else {
        throw new Error(response.message || 'Failed to get vital signs trends');
      }
    } catch (error) {
      console.error('❌ Get vital signs trends error:', error);
      return {
        success: false,
        trends: [],
        error: error.message || 'Failed to get vital signs trends',
      };
    }
  },

  /**
   * Check if health reading is within normal range
   */
  checkHealthReading: (type, value) => {
    const ranges = {
      heartRate: { min: 60, max: 100, unit: 'bpm' },
      systolic: { min: 90, max: 140, unit: 'mmHg' },
      diastolic: { min: 60, max: 90, unit: 'mmHg' },
      temperature: { min: 36.1, max: 37.2, unit: '°C' },
      oxygenSaturation: { min: 95, max: 100, unit: '%' },
      weight: { min: 30, max: 300, unit: 'kg' },
      sleepHours: { min: 6, max: 9, unit: 'hours' },
    };

    const range = ranges[type];
    if (!range) return { status: 'unknown', message: 'Unknown health metric' };

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return { status: 'invalid', message: 'Invalid value' };

    if (numValue < range.min) {
      return { 
        status: 'low', 
        message: `Below normal range (${range.min}-${range.max} ${range.unit})`,
        severity: 'warning'
      };
    }
    
    if (numValue > range.max) {
      return { 
        status: 'high', 
        message: `Above normal range (${range.min}-${range.max} ${range.unit})`,
        severity: 'warning'
      };
    }

    return { 
      status: 'normal', 
      message: `Within normal range (${range.min}-${range.max} ${range.unit})`,
      severity: 'normal'
    };
  },

  /**
   * Get health summary for dashboard
   */
  getHealthSummary: async (elderId) => {
    try {
      console.log('📋 Getting health summary for elder:', elderId);
      
      // Get latest health records
      const historyResponse = await healthMonitoringService.getElderHealthHistory(elderId, 1);
      
      if (!historyResponse.success) {
        throw new Error('Failed to get health summary');
      }

      const latestRecord = historyResponse.data[0];
      
      if (!latestRecord) {
        return {
          success: true,
          summary: {
            hasData: false,
            message: 'No health data available',
            recommendations: ['Please record your vital signs'],
          },
        };
      }

      // Analyze health metrics
      const analysis = {
        heartRate: latestRecord.heartRate ? 
          healthMonitoringService.checkHealthReading('heartRate', latestRecord.heartRate) : null,
        bloodPressure: (latestRecord.bloodPressureSystolic && latestRecord.bloodPressureDiastolic) ? {
          systolic: healthMonitoringService.checkHealthReading('systolic', latestRecord.bloodPressureSystolic),
          diastolic: healthMonitoringService.checkHealthReading('diastolic', latestRecord.bloodPressureDiastolic),
        } : null,
        temperature: latestRecord.temperature ? 
          healthMonitoringService.checkHealthReading('temperature', latestRecord.temperature) : null,
        oxygenSaturation: latestRecord.oxygenSaturation ? 
          healthMonitoringService.checkHealthReading('oxygenSaturation', latestRecord.oxygenSaturation) : null,
      };

      // Determine overall health status
      let overallStatus = 'normal';
      let alerts = [];
      
      Object.entries(analysis).forEach(([key, result]) => {
        if (result && result.status === 'high' || result?.status === 'low') {
          alerts.push(result.message);
          if (overallStatus === 'normal') overallStatus = 'warning';
        }
      });

      return {
        success: true,
        summary: {
          hasData: true,
          overallStatus,
          latestRecord,
          analysis,
          alerts,
          lastUpdated: latestRecord.monitoringDate,
        },
      };
    } catch (error) {
      console.error('❌ Get health summary error:', error);
      return {
        success: false,
        summary: {
          hasData: false,
          message: 'Failed to get health summary',
        },
        error: error.message || 'Failed to get health summary',
      };
    }
  },
};