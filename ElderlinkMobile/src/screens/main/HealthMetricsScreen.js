import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/colors';
import apiService from '../../services/api';

import Card from '../../components/common/Card';

const HealthMetricsScreen = ({ navigation }) => {
  const { user, elder } = useAuth();
  const [healthVitals, setHealthVitals] = useState(null);
  const [loadingVitals, setLoadingVitals] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (elder) {
      fetchHealthVitals();
    }
  }, [elder]);

  const fetchHealthVitals = async () => {
    try {
      console.log('🏥 Fetching health vitals for elder...');
      setLoadingVitals(true);
      
      // Call the API endpoint that staff use to record health data
      const response = await apiService.get('/api/health-monitoring/today');
      
      console.log('🏥 Health vitals response:', response);
      
      if (response && response.success && response.data) {
        // Handle array response (take the latest record)
        const vitalsData = Array.isArray(response.data) 
          ? (response.data.length > 0 ? response.data[0] : null)
          : response.data;
        
        setHealthVitals(vitalsData);
        console.log('✅ Health vitals loaded:', vitalsData);
      } else {
        setHealthVitals(null);
        console.log('ℹ️ No health vitals found for today');
      }
    } catch (error) {
      console.error('❌ Error fetching health vitals:', error);
      setHealthVitals(null);
    } finally {
      setLoadingVitals(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchHealthVitals();
  };

  // Convert Fahrenheit to Celsius
  const fahrenheitToCelsius = (fahrenheit) => {
    if (!fahrenheit) return null;
    return ((fahrenheit - 32) * 5 / 9).toFixed(1);
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header Card */}
        <Card style={styles.headerCard}>
          <View style={styles.headerContent}>
            <Ionicons name="heart-circle" size={48} color="#FF6B6B" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Today's Health Vitals</Text>
              <Text style={styles.headerSubtitle}>Recorded by your care team</Text>
            </View>
          </View>
        </Card>

        {/* Health Vitals Card */}
        <Card style={styles.vitalsCard}>
          <View style={styles.healthHeader}>
            <Text style={styles.sectionTitle}>Your Health Metrics</Text>
            {loadingVitals && (
              <ActivityIndicator size="small" color="#FF6B6B" />
            )}
          </View>

          {!loadingVitals && healthVitals ? (
            <>
              {/* Heart Rate */}
              {healthVitals.heartRate && (
                <View style={styles.vitalRow}>
                  <View style={styles.vitalIconContainer}>
                    <Ionicons name="heart" size={28} color="#FF6B6B" />
                  </View>
                  <View style={styles.vitalContent}>
                    <Text style={styles.vitalLabel}>Heart Rate</Text>
                    <Text style={styles.vitalValue}>{healthVitals.heartRate} bpm</Text>
                  </View>
                </View>
              )}

              {/* Blood Pressure */}
              {(healthVitals.bloodPressureSystolic || healthVitals.bloodPressureDiastolic) && (
                <View style={styles.vitalRow}>
                  <View style={styles.vitalIconContainer}>
                    <Ionicons name="fitness" size={28} color="#FF6B6B" />
                  </View>
                  <View style={styles.vitalContent}>
                    <Text style={styles.vitalLabel}>Blood Pressure</Text>
                    <Text style={styles.vitalValue}>
                      {healthVitals.bloodPressureSystolic || '--'}/{healthVitals.bloodPressureDiastolic || '--'} mmHg
                    </Text>
                  </View>
                </View>
              )}

              {/* Temperature */}
              {healthVitals.temperature && (
                <View style={styles.vitalRow}>
                  <View style={styles.vitalIconContainer}>
                    <Ionicons name="thermometer" size={28} color="#FF6B6B" />
                  </View>
                  <View style={styles.vitalContent}>
                    <Text style={styles.vitalLabel}>Temperature</Text>
                    <Text style={styles.vitalValue}>
                      {fahrenheitToCelsius(healthVitals.temperature)}°C ({healthVitals.temperature}°F)
                    </Text>
                  </View>
                </View>
              )}

              {/* Weight */}
              {healthVitals.weight && (
                <View style={styles.vitalRow}>
                  <View style={styles.vitalIconContainer}>
                    <Ionicons name="scale-outline" size={28} color="#FF6B6B" />
                  </View>
                  <View style={styles.vitalContent}>
                    <Text style={styles.vitalLabel}>Weight</Text>
                    <Text style={styles.vitalValue}>{healthVitals.weight} kg</Text>
                  </View>
                </View>
              )}

              {/* Oxygen Saturation */}
              {healthVitals.oxygenSaturation && (
                <View style={styles.vitalRow}>
                  <View style={styles.vitalIconContainer}>
                    <Ionicons name="water" size={28} color="#FF6B6B" />
                  </View>
                  <View style={styles.vitalContent}>
                    <Text style={styles.vitalLabel}>Oxygen Saturation</Text>
                    <Text style={styles.vitalValue}>{healthVitals.oxygenSaturation}%</Text>
                  </View>
                </View>
              )}

              {/* Blood Sugar */}
              {healthVitals.bloodSugar && (
                <View style={styles.vitalRow}>
                  <View style={styles.vitalIconContainer}>
                    <Ionicons name="water-outline" size={28} color="#FF6B6B" />
                  </View>
                  <View style={styles.vitalContent}>
                    <Text style={styles.vitalLabel}>Blood Sugar</Text>
                    <Text style={styles.vitalValue}>{healthVitals.bloodSugar} mg/dL</Text>
                  </View>
                </View>
              )}

              {/* Sleep Hours */}
              {healthVitals.sleepHours && (
                <View style={styles.vitalRow}>
                  <View style={styles.vitalIconContainer}>
                    <Ionicons name="moon" size={28} color="#FF6B6B" />
                  </View>
                  <View style={styles.vitalContent}>
                    <Text style={styles.vitalLabel}>Sleep Hours</Text>
                    <Text style={styles.vitalValue}>{healthVitals.sleepHours} hours</Text>
                  </View>
                </View>
              )}

              {/* Notes from Staff */}
              {healthVitals.notes && (
                <View style={styles.notesContainer}>
                  <View style={styles.notesHeader}>
                    <Ionicons name="document-text" size={20} color="#FF6B6B" />
                    <Text style={styles.notesLabel}>Staff Notes</Text>
                  </View>
                  <Text style={styles.notesText}>{healthVitals.notes}</Text>
                </View>
              )}

              {/* Recorded Info */}
              <View style={styles.recordedInfo}>
                <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.recordedText}>
                  Recorded: {new Date(healthVitals.monitoringDate).toLocaleString()}
                </Text>
              </View>
            </>
          ) : !loadingVitals && !healthVitals ? (
            <View style={styles.noDataContainer}>
              <Ionicons name="medical-outline" size={64} color={COLORS.gray300} />
              <Text style={styles.noDataText}>No health vitals recorded today</Text>
              <Text style={styles.noDataSubtext}>
                Your care team will record your vitals during checkups
              </Text>
            </View>
          ) : null}
        </Card>

        {/* Health Tips Card */}
        <Card style={styles.tipsCard}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb" size={24} color="#FFA500" />
            <Text style={styles.tipsTitle}>Health Tips</Text>
          </View>
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>Stay hydrated - drink 6-8 glasses of water daily</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>Take your medications on time</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>Get 7-8 hours of quality sleep</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.tipText}>Regular light exercise helps maintain health</Text>
            </View>
          </View>
        </Card>
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
    paddingBottom: 24,
  },
  headerCard: {
    marginBottom: 16,
    padding: 20,
    backgroundColor: '#FFF5F5',
    borderWidth: 0,
    borderRadius: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 16,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  vitalsCard: {
    marginBottom: 16,
    padding: 20,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#FFE8E8',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  vitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  vitalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vitalContent: {
    flex: 1,
  },
  vitalLabel: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  vitalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  notesContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#FFF5F5',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notesLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
    marginLeft: 8,
  },
  notesText: {
    fontSize: 15,
    color: COLORS.text,
    lineHeight: 22,
  },
  recordedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  recordedText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  noDataContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  noDataText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
  },
  noDataSubtext: {
    fontSize: 14,
    color: COLORS.gray400,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  tipsCard: {
    marginBottom: 16,
    padding: 20,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#FFF5E6',
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 12,
  },
  tipsList: {
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  tipText: {
    fontSize: 15,
    color: COLORS.text,
    marginLeft: 12,
    flex: 1,
    lineHeight: 22,
  },
});

export default HealthMetricsScreen;
