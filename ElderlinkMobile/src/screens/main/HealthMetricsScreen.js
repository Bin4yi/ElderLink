import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useHealthData } from '../../hooks/useHealthData';
import { ValidationUtils } from '../../utils/validation';
import { COLORS } from '../../utils/colors';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import HealthMetricCard from '../../components/HealthMetricCard';

const HealthMetricsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const {
    healthRecords,
    latestVitalSigns,
    loading,
    error,
    loadHealthData,
    addHealthRecord
  } = useHealthData();

  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [healthData, setHealthData] = useState({
    heartRate: '',
    systolic: '',
    diastolic: '',
    temperature: '',
    weight: '',
    oxygenSaturation: '',
    sleepHours: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadHealthData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadHealthData();
    setRefreshing(false);
  };

  const validateHealthData = () => {
    const newErrors = {};

    if (healthData.heartRate && !ValidationUtils.validateHeartRate(parseFloat(healthData.heartRate))) {
      newErrors.heartRate = 'Please enter a valid heart rate (40-200 bpm)';
    }

    if (healthData.systolic && !ValidationUtils.validateBloodPressure(parseFloat(healthData.systolic), 'systolic')) {
      newErrors.systolic = 'Please enter a valid systolic pressure (70-250 mmHg)';
    }

    if (healthData.diastolic && !ValidationUtils.validateBloodPressure(parseFloat(healthData.diastolic), 'diastolic')) {
      newErrors.diastolic = 'Please enter a valid diastolic pressure (40-150 mmHg)';
    }

    if (healthData.temperature && !ValidationUtils.validateTemperature(parseFloat(healthData.temperature))) {
      newErrors.temperature = 'Please enter a valid temperature (30-45°C)';
    }

    if (healthData.weight && !ValidationUtils.validateWeight(parseFloat(healthData.weight))) {
      newErrors.weight = 'Please enter a valid weight (20-300 kg)';
    }

    if (healthData.oxygenSaturation && !ValidationUtils.validateOxygenSaturation(parseFloat(healthData.oxygenSaturation))) {
      newErrors.oxygenSaturation = 'Please enter a valid oxygen saturation (70-100%)';
    }

    if (healthData.sleepHours && !ValidationUtils.validateSleepHours(parseFloat(healthData.sleepHours))) {
      newErrors.sleepHours = 'Please enter valid sleep hours (0-24)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateHealthData()) return;

    // Check if at least one field is filled
    const hasData = Object.values(healthData).some(value => value.trim() !== '');
    if (!hasData) {
      setErrors({ general: 'Please enter at least one health measurement' });
      return;
    }

    setIsSubmitting(true);

    try {
      const recordData = {
        elderId: user.id,
        heartRate: healthData.heartRate ? parseFloat(healthData.heartRate) : null,
        bloodPressureSystolic: healthData.systolic ? parseFloat(healthData.systolic) : null,
        bloodPressureDiastolic: healthData.diastolic ? parseFloat(healthData.diastolic) : null,
        temperature: healthData.temperature ? parseFloat(healthData.temperature) : null,
        weight: healthData.weight ? parseFloat(healthData.weight) : null,
        oxygenSaturation: healthData.oxygenSaturation ? parseFloat(healthData.oxygenSaturation) : null,
        sleepHours: healthData.sleepHours ? parseFloat(healthData.sleepHours) : null,
        notes: healthData.notes.trim() || null,
        monitoringDate: new Date().toISOString()
      };

      await addHealthRecord(recordData);
      
      // Reset form and close modal
      setHealthData({
        heartRate: '',
        systolic: '',
        diastolic: '',
        temperature: '',
        weight: '',
        oxygenSaturation: '',
        sleepHours: '',
        notes: ''
      });
      setErrors({});
      setShowAddModal(false);
      
      // Refresh data
      await loadHealthData();
    } catch (error) {
      setErrors({ general: error.message || 'Failed to save health data' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMetricCard = (metricName) => {
    if (!latestVitalSigns) return null;

    let value, unit, status, icon;

    switch (metricName) {
      case 'Heart Rate':
        value = latestVitalSigns.heartRate;
        unit = 'bpm';
        icon = 'heart';
        status = ValidationUtils.validateHeartRate(value) ? 'normal' : 'warning';
        break;
      case 'Blood Pressure':
        if (latestVitalSigns.bloodPressureSystolic && latestVitalSigns.bloodPressureDiastolic) {
          value = `${latestVitalSigns.bloodPressureSystolic}/${latestVitalSigns.bloodPressureDiastolic}`;
          unit = 'mmHg';
          icon = 'fitness';
          status = 'normal'; // You can implement BP validation logic
        }
        break;
      case 'Temperature':
        value = latestVitalSigns.temperature;
        unit = '°C';
        icon = 'thermometer';
        status = ValidationUtils.validateTemperature(value) ? 'normal' : 'warning';
        break;
      case 'Weight':
        value = latestVitalSigns.weight;
        unit = 'kg';
        icon = 'scale';
        status = ValidationUtils.validateWeight(value) ? 'normal' : 'warning';
        break;
      case 'Oxygen Saturation':
        value = latestVitalSigns.oxygenSaturation;
        unit = '%';
        icon = 'water';
        status = ValidationUtils.validateOxygenSaturation(value) ? 'normal' : 'warning';
        break;
      case 'Sleep Hours':
        value = latestVitalSigns.sleepHours;
        unit = 'hours';
        icon = 'moon';
        status = ValidationUtils.validateSleepHours(value) ? 'normal' : 'warning';
        break;
      default:
        return null;
    }

    if (!value) return null;

    return (
      <HealthMetricCard
        key={metricName}
        metric={metricName}
        value={value}
        unit={unit}
        status={status}
        icon={icon}
        lastUpdated={latestVitalSigns.recordedAt}
        style={styles.metricCard}
      />
    );
  };

  if (loading) {
    return <Loading message="Loading health data..." />;
  }

  // Check if today's data was recorded
  const today = new Date().toDateString();
  const recordedToday = latestVitalSigns && 
    new Date(latestVitalSigns.recordedAt).toDateString() === today;

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {error && (
          <Alert
            type="error"
            message={error}
            closable
            onClose={() => {/* Clear error */}}
            style={styles.errorAlert}
          />
        )}

        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={recordedToday ? "checkmark-circle" : "time"} 
              size={32} 
              color={recordedToday ? COLORS.success : COLORS.warning} 
            />
            <View style={styles.statusTextContainer}>
              <Text style={styles.statusTitle}>
                {recordedToday ? "Today's Data Recorded" : "No Data Today"}
              </Text>
              <Text style={styles.statusSubtitle}>
                {recordedToday 
                  ? "Great job! Your health data has been recorded."
                  : "Don't forget to record your vital signs today."
                }
              </Text>
            </View>
          </View>
          
          <Button
            title={recordedToday ? "Add More Data" : "Record Vitals"}
            onPress={() => setShowAddModal(true)}
            variant="primary"
            size="large"
            style={styles.recordButton}
          />
        </Card>

        {/* Latest Metrics */}
        {latestVitalSigns && (
          <View style={styles.metricsSection}>
            <Text style={styles.sectionTitle}>Latest Measurements</Text>
            
            <View style={styles.metricsGrid}>
              {['Heart Rate', 'Blood Pressure', 'Temperature', 'Weight', 'Oxygen Saturation', 'Sleep Hours']
                .map(metric => renderMetricCard(metric))
                .filter(Boolean)}
            </View>

            {latestVitalSigns.recordedAt && (
              <Text style={styles.lastUpdated}>
                Last updated: {new Date(latestVitalSigns.recordedAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            )}
          </View>
        )}

        {/* Recent History */}
        {healthRecords.length > 0 && (
          <Card style={styles.historyCard}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Recent History</Text>
              <TouchableOpacity
                style={styles.viewAllButton}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.historyList}>
              {healthRecords.slice(0, 5).map((record, index) => (
                <View key={record.id || index} style={styles.historyItem}>
                  <View style={styles.historyDate}>
                    <Text style={styles.historyDateText}>
                      {new Date(record.monitoringDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </Text>
                  </View>
                  
                  <View style={styles.historyMetrics}>
                    {record.heartRate && (
                      <Text style={styles.historyMetric}>HR: {record.heartRate} bpm</Text>
                    )}
                    {record.bloodPressureSystolic && record.bloodPressureDiastolic && (
                      <Text style={styles.historyMetric}>
                        BP: {record.bloodPressureSystolic}/{record.bloodPressureDiastolic}
                      </Text>
                    )}
                    {record.temperature && (
                      <Text style={styles.historyMetric}>Temp: {record.temperature}°C</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Add Health Data Modal */}
        <Modal
          visible={showAddModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Record Vital Signs</Text>
              <ScrollView contentContainerStyle={styles.modalForm}>
                <Input
                  label="Heart Rate (bpm)"
                  value={healthData.heartRate}
                  onChangeText={text => setHealthData({ ...healthData, heartRate: text })}
                  keyboardType="numeric"
                  error={errors.heartRate}
                />
                <Input
                  label="Systolic BP (mmHg)"
                  value={healthData.systolic}
                  onChangeText={text => setHealthData({ ...healthData, systolic: text })}
                  keyboardType="numeric"
                  error={errors.systolic}
                />
                <Input
                  label="Diastolic BP (mmHg)"
                  value={healthData.diastolic}
                  onChangeText={text => setHealthData({ ...healthData, diastolic: text })}
                  keyboardType="numeric"
                  error={errors.diastolic}
                />
                <Input
                  label="Temperature (°C)"
                  value={healthData.temperature}
                  onChangeText={text => setHealthData({ ...healthData, temperature: text })}
                  keyboardType="numeric"
                  error={errors.temperature}
                />
                <Input
                  label="Weight (kg)"
                  value={healthData.weight}
                  onChangeText={text => setHealthData({ ...healthData, weight: text })}
                  keyboardType="numeric"
                  error={errors.weight}
                />
                <Input
                  label="Oxygen Saturation (%)"
                  value={healthData.oxygenSaturation}
                  onChangeText={text => setHealthData({ ...healthData, oxygenSaturation: text })}
                  keyboardType="numeric"
                  error={errors.oxygenSaturation}
                />
                <Input
                  label="Sleep Hours"
                  value={healthData.sleepHours}
                  onChangeText={text => setHealthData({ ...healthData, sleepHours: text })}
                  keyboardType="numeric"
                  error={errors.sleepHours}
                />
                <Input
                  label="Notes"
                  value={healthData.notes}
                  onChangeText={text => setHealthData({ ...healthData, notes: text })}
                  multiline
                  error={errors.notes}
                />
                {errors.general && (
                  <Alert
                    type="error"
                    message={errors.general}
                    style={styles.errorAlert}
                  />
                )}
                <View style={styles.modalButtons}>
                  <Button
                    title="Cancel"
                    onPress={() => setShowAddModal(false)}
                    variant="secondary"
                    style={styles.cancelButton}
                  />
                  <Button
                    title={isSubmitting ? "Saving..." : "Save"}
                    onPress={handleSubmit}
                    variant="primary"
                    disabled={isSubmitting}
                    style={styles.saveButton}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  
  statusCard: {
    marginBottom: 16,
    padding: 16,
  },
  
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  
  statusTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  
  statusTitle: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  
  statusSubtitle: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
  },
  
  recordButton: {
    marginTop: 12,
  },
  
  metricsSection: {
    marginBottom: 16,
  },
  
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    marginBottom: 16,
    color: COLORS.textPrimary,
  },
  
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  
  metricCard: {
    marginBottom: 12,
    width: '48%',
  },
  
  lastUpdated: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'right',
  },
  
  historyCard: {
    marginBottom: 16,
    padding: 16,
  },
  
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  viewAllText: {
    color: COLORS.primary,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: 'bold',
    marginRight: 4,
  },
  
  historyList: {
    marginTop: 8,
  },
  
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  
  historyDate: {
    width: 60,
    alignItems: 'center',
  },
  
  historyDateText: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    color: COLORS.textSecondary,
  },
  
  historyMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 12,
  },
  
  historyMetric: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textPrimary,
    marginRight: 12,
    marginBottom: 4,
  },
  
  errorAlert: {
    marginBottom: 16,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxHeight: '90%',
  },
  
  modalTitle: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
    textAlign: 'center',
  },
  
  modalForm: {
    paddingBottom: 16,
  },
  
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  
  cancelButton: {
    flex: 1,
  },
  
  saveButton: {
    flex: 1,
  },
});

export default HealthMetricsScreen;