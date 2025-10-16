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
import { COLORS } from '../../utils/colors';
import { ROUTES } from '../../utils/constants';

import Card from '../../components/common/Card';
import Alert from '../../components/common/Alert';
import SosButton from '../../components/SosButton';

const { width } = Dimensions.get('window');

/**
 * Home Screen - Main dashboard for elderly users
 * Shows emergency access and system status
 */
const HomeScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);

  const { user, elder } = useAuth();
  const { isSystemReady, hasEmergencyContacts, error: emergencyError } = useEmergency();

  useEffect(() => {
    // Component mounted - no additional data to load
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh any necessary data here
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

      {/* Quick Actions */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={navigateToProfile}
          >
            <Ionicons name="person-circle" size={32} color={COLORS.primary} />
            <Text style={styles.quickActionText}>My Profile</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickActionItem}
            onPress={() => navigation.navigate(ROUTES.SETTINGS)}
          >
            <Ionicons name="settings" size={32} color={COLORS.primary} />
            <Text style={styles.quickActionText}>Settings</Text>
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