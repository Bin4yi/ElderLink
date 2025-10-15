import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
import { HEALTH_CONFIG } from '../utils/constants';

import Card from './common/Card';

/**
 * Health Metric Card component for displaying vital signs
 * Shows health data with status indicators optimized for elderly users
 */
const HealthMetricCard = ({
  metric,
  value,
  unit,
  status = 'normal',
  trend,
  lastUpdated,
  icon,
  onPress,
  style
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return COLORS.health.excellent;
      case 'warning':
        return COLORS.warning;
      case 'critical':
        return COLORS.error;
      case 'emergency':
        return COLORS.error;
      default:
        return COLORS.gray500;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'critical':
        return 'alert-circle';
      case 'emergency':
        return 'alert';
      default:
        return 'help-circle';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'increasing':
        return 'trending-up';
      case 'decreasing':
        return 'trending-down';
      case 'stable':
        return 'remove';
      default:
        return 'remove';
    }
  };

  const getTrendColor = (trend, status) => {
    if (status === 'normal') {
      return COLORS.textSecondary;
    }
    
    switch (trend) {
      case 'increasing':
        return COLORS.warning;
      case 'decreasing':
        return COLORS.info;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours === 0) {
      return 'Just now';
    } else if (diffInHours === 1) {
      return '1 hour ago';
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const statusColor = getStatusColor(status);
  const statusIcon = getStatusIcon(status);
  const trendIcon = getTrendIcon(trend);
  const trendColor = getTrendColor(trend, status);

  return (
    <Card
      style={[styles.card, style]}
      onPress={onPress}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.metricInfo}>
          {icon && (
            <Ionicons
              name={icon}
              size={28}
              color={COLORS.primary}
              style={styles.metricIcon}
            />
          )}
          <Text style={styles.metricName}>{metric}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <Ionicons
            name={statusIcon}
            size={24}
            color={statusColor}
          />
        </View>
      </View>

      {/* Value Display */}
      <View style={styles.valueContainer}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.unit}>{unit}</Text>
      </View>

      {/* Status and Trend */}
      <View style={styles.statusRow}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
        
        {trend && (
          <View style={styles.trendContainer}>
            <Ionicons
              name={trendIcon}
              size={16}
              color={trendColor}
            />
            <Text style={[styles.trendText, { color: trendColor }]}>
              {trend}
            </Text>
          </View>
        )}
      </View>

      {/* Last Updated */}
      {lastUpdated && (
        <Text style={styles.lastUpdated}>
          Updated {formatLastUpdated(lastUpdated)}
        </Text>
      )}

      {/* Normal Range Info */}
      <View style={styles.rangeInfo}>
        <Text style={styles.rangeLabel}>Normal Range:</Text>
        <Text style={styles.rangeText}>
          {getMetricRange(metric)}
        </Text>
      </View>
    </Card>
  );
};

// Helper function to get normal ranges
const getMetricRange = (metric) => {
  const ranges = HEALTH_CONFIG.VITAL_RANGES;
  
  switch (metric.toLowerCase()) {
    case 'heart rate':
      return `${ranges.HEART_RATE.min}-${ranges.HEART_RATE.max} ${ranges.HEART_RATE.unit}`;
    case 'blood pressure':
      return `${ranges.BLOOD_PRESSURE.systolic.min}-${ranges.BLOOD_PRESSURE.systolic.max}/${ranges.BLOOD_PRESSURE.diastolic.min}-${ranges.BLOOD_PRESSURE.diastolic.max} ${ranges.BLOOD_PRESSURE.unit}`;
    case 'temperature':
      return `${ranges.TEMPERATURE.min}-${ranges.TEMPERATURE.max} ${ranges.TEMPERATURE.unit}`;
    case 'oxygen saturation':
      return `${ranges.OXYGEN_SATURATION.min}-${ranges.OXYGEN_SATURATION.max} ${ranges.OXYGEN_SATURATION.unit}`;
    case 'sleep hours':
      return `${ranges.SLEEP_HOURS.min}-${ranges.SLEEP_HOURS.max} ${ranges.SLEEP_HOURS.unit}`;
    default:
      return 'See your doctor for guidance';
  }
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 10,
    marginVertical: 8,
    minHeight: 180,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  metricInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  metricIcon: {
    marginRight: 12,
  },
  
  metricName: {
    fontSize: 20,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  
  statusContainer: {
    alignItems: 'center',
  },
  
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  
  value: {
    fontSize: 36,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  
  unit: {
    fontSize: 20,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  
  statusText: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'capitalize',
  },
  
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  trendText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  
  lastUpdated: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  
  rangeInfo: {
    backgroundColor: COLORS.gray50,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.info,
  },
  
  rangeLabel: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  
  rangeText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textPrimary,
  },
});

export default HealthMetricCard;