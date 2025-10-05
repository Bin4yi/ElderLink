import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useEmergency } from '../../context/EmergencyContext';
import { useHealthData } from '../../hooks/useHealthData';
import { appointmentsService } from '../../services/appointments';
import { COLORS } from '../../utils/colors';
import { ROUTES } from '../../utils/constants';

import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import SosButton from '../../components/SosButton';
import AppointmentCard from '../../components/AppointmentCard';
import HealthMetricCard from '../../components/HealthMetricCard';

const { width } = Dimensions.get('window');

/**
 * Home Screen - Main dashboard for elderly users
 * Shows health summary, upcoming appointments, and emergency access
 */
const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [healthSummary, setHealthSummary] = useState(null);

  const { user, elder } = useAuth();
  const { isSystemReady, hasEmergencyContacts, error: emergencyError } = useEmergency();
  const { 
    latestVitalSigns, 
    recordedToday, 
    alertsCount,
    loadElderHealthData 
  } = useHealthData();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Use elder data if available, otherwise use user data
    const currentUser = elder || user;
    const userId = currentUser?.id || currentUser?.userId || currentUser?._id;
    
    console.log('🏠 Loading dashboard data for user:', { 
      hasElder: !!elder, 
      hasUser: !!user, 
      userId,
      userKeys: currentUser ? Object.keys(currentUser) : []
    });
    
    if (!userId) {
      console.warn('⚠️ No user ID available for dashboard');
      return;
    }

    try {
      // Load upcoming appointments
      const appointmentsResult = await appointmentsService.getUpcomingAppointments(userId);
      if (appointmentsResult.success) {
        setUpcomingAppointments(appointmentsResult.appointments.slice(0, 2)); // Show only next 2
      }

      // Load health data
      await loadElderHealthData(userId, 7);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleEmergencyTriggered = (result) => {
    console.log('🏠 HomeScreen: Emergency triggered result:', result);
    
    if (result.success) {
      console.log('🏠 ✅ Emergency successful - navigating to emergency screen');
      console.log('🎉🎉🎉 EMERGENCY HELP IS ON THE WAY! 🎉🎉🎉');
      console.log('📱 Emergency services and family have been notified');
      
      // Navigate to emergency screen to show details
      navigation.navigate(ROUTES.EMERGENCY, { 
        emergencyData: result.emergencyData 
      });
    } else {
      console.log('🏠 ❌ Emergency failed:', result.error);
      console.error('💔💔💔 EMERGENCY ALERT FAILED! Please call 911 directly! 💔💔💔');
    }
  };

  const navigateToAppointments = () => {
    navigation.navigate(ROUTES.APPOINTMENTS);
  };

  const navigateToHealthMetrics = () => {
    navigation.navigate(ROUTES.HEALTH_METRICS);
  };

  const navigateToProfile = () => {
    navigation.navigate(ROUTES.PROFILE);
  };

  const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getUserName = () => {
    if (elder?.firstName) {
      return elder.firstName;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return 'there';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header Greeting */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getTimeOfDayGreeting()},</Text>
        <Text style={styles.userName}>{getUserName()}</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          })}
        </Text>
      </View>

      {/* Emergency System Status */}
      {!isSystemReady && (
        <Alert
          type="warning"
          title="Emergency System Setup"
          message={
            !hasEmergencyContacts 
              ? "Please add emergency contacts in Settings for full protection."
              : "Emergency system is being configured."
          }
          style={styles.systemAlert}
        />
      )}

      {emergencyError && (
        <Alert
          type="error"
          title="Emergency System Error"
          message={emergencyError}
          style={styles.systemAlert}
        />
      )}

      {/* SOS Emergency Button */}
      <Card style={styles.emergencyCard} variant="emergency">
        <View style={styles.emergencyHeader}>
          <Ionicons name="shield-checkmark" size={32} color={COLORS.error} />
          <Text style={styles.emergencyTitle}>Emergency Support</Text>
        </View>
        <Text style={styles.emergencyDescription}>
          Press and hold the SOS button for 3 seconds to immediately alert your family and care team.
        </Text>
        <SosButton 
          elderData={elder || user}
          onEmergencyTriggered={handleEmergencyTriggered}
        />
      </Card>

      {/* Health Summary */}
      <Card style={styles.sectionCard}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={navigateToHealthMetrics}
        >
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="heart" size={28} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Health Summary</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray400} />
        </TouchableOpacity>

        {recordedToday ? (
          <View style={styles.healthStatus}>
            <View style={styles.healthStatusGood}>
              <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
              <Text style={styles.healthStatusText}>Health data recorded today</Text>
            </View>
            
            {latestVitalSigns && (
              <View style={styles.vitalSignsPreview}>
                {latestVitalSigns.heartRate && (
                  <View style={styles.vitalItem}>
                    <Text style={styles.vitalLabel}>Heart Rate</Text>
                    <Text style={styles.vitalValue}>
                      {latestVitalSigns.heartRate} bpm
                    </Text>
                  </View>
                )}
                
                {latestVitalSigns.bloodPressure?.systolic && (
                  <View style={styles.vitalItem}>
                    <Text style={styles.vitalLabel}>Blood Pressure</Text>
                    <Text style={styles.vitalValue}>
                      {latestVitalSigns.bloodPressure.systolic}/{latestVitalSigns.bloodPressure.diastolic}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ) : (
          <View style={styles.healthStatus}>
            <View style={styles.healthStatusReminder}>
              <Ionicons name="information-circle" size={24} color={COLORS.warning} />
              <Text style={styles.healthReminderText}>
                Don't forget to record your vital signs today
              </Text>
            </View>
          </View>
        )}

        {alertsCount > 0 && (
          <View style={styles.alertsContainer}>
            <Ionicons name="warning" size={20} color={COLORS.warning} />
            <Text style={styles.alertsText}>
              {alertsCount} health alert{alertsCount > 1 ? 's' : ''} need attention
            </Text>
          </View>
        )}
      </Card>

      {/* Upcoming Appointments */}
      <Card style={styles.sectionCard}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={navigateToAppointments}
        >
          <View style={styles.sectionTitleContainer}>
            <Ionicons name="calendar" size={28} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Upcoming Appointments</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gray400} />
        </TouchableOpacity>

        {upcomingAppointments.length > 0 ? (
          <View style={styles.appointmentsContainer}>
            {upcomingAppointments.map((appointment, index) => (
              <AppointmentCard
                key={appointment.id || index}
                appointment={appointment}
                onPress={() => navigateToAppointments()}
                style={styles.appointmentPreview}
              />
            ))}
          </View>
        ) : (
          <View style={styles.noAppointments}>
            <Ionicons name="calendar-outline" size={48} color={COLORS.gray300} />
            <Text style={styles.noAppointmentsText}>
              No upcoming appointments
            </Text>
            <Text style={styles.noAppointmentsSubtext}>
              Your schedule is clear for now
            </Text>
          </View>
        )}
      </Card>

      {/* Quick Actions */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={navigateToHealthMetrics}
          >
            <Ionicons name="add-circle" size={32} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Record Vitals</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={navigateToAppointments}
          >
            <Ionicons name="calendar-outline" size={32} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Book Appointment</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={navigateToProfile}
          >
            <Ionicons name="person-circle" size={32} color={COLORS.primary} />
            <Text style={styles.quickActionText}>My Profile</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  
  scrollContent: {
    paddingBottom: 30,
  },
  
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  
  greeting: {
    fontSize: 24,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.white,
  },
  
  userName: {
    fontSize: 32,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 8,
  },
  
  dateText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.white,
    opacity: 0.9,
  },
  
  systemAlert: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  
  emergencyCard: {
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 30,
  },
  
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    justifyContent: 'center',
  },
  
  emergencyTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.emergency?.text || COLORS.textPrimary,
    marginLeft: 12,
  },
  
  emergencyDescription: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.emergency?.text || COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  
  sectionCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  
  healthStatus: {
    marginBottom: 16,
  },
  
  healthStatusGood: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.gray50,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
  },
  
  healthStatusReminder: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  
  healthStatusText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  
  healthReminderText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 12,
  },
  
  vitalSignsPreview: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 20,
  },
  
  vitalItem: {
    flex: 1,
  },
  
  vitalLabel: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  
  vitalValue: {
    fontSize: 18,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  
  alertsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  
  alertsText: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  
  appointmentsContainer: {
    gap: 16,
  },
  
  appointmentPreview: {
    marginHorizontal: 0,
    marginVertical: 0,
  },
  
  noAppointments: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  
  noAppointmentsText: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 4,
  },
  
  noAppointmentsSubtext: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
  },
  
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  
  quickActionItem: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.gray50,
    borderRadius: 16,
    flex: 1,
    marginHorizontal: 4,
    minHeight: 100,
    justifyContent: 'center',
  },
  
  quickActionText: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default HomeScreen;