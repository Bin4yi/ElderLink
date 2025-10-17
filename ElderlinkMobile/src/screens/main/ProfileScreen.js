import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/colors';
import apiService from '../../services/api';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';

const ProfileScreen = ({ navigation }) => {
  const { user, elder, logout } = useAuth();
  const [healthVitals, setHealthVitals] = useState(null);
  const [loadingVitals, setLoadingVitals] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Fetch health vitals when component mounts or elder changes
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
  
  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const userAge = calculateAge(elder?.dateOfBirth || user?.dateOfBirth);
  const displayName = `${elder?.firstName || user?.firstName || ''} ${elder?.lastName || user?.lastName || ''}`.trim();

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Profile Header */}
      <Card style={styles.profileHeader}>
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            {(elder?.profilePicture || user?.profilePicture) ? (
              <Image 
                source={{ uri: elder?.profilePicture || user?.profilePicture }} 
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={COLORS.gray500} />
              </View>
            )}
          </View>
          
          <View style={styles.nameContainer}>
            <Text style={styles.fullName}>{displayName || 'User'}</Text>
            {userAge && (
              <Text style={styles.ageText}>{userAge} years old</Text>
            )}
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
          
          <TouchableOpacity
            style={styles.editButton}
            onPress={handleEditProfile}
          >
            <Ionicons name="pencil" size={20} color={COLORS.gray600} />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Personal Information */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="person" size={20} color={COLORS.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Full Name</Text>
            <Text style={styles.infoValue}>{displayName || 'Not provided'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="mail" size={20} color={COLORS.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Email</Text>
            <Text style={styles.infoValue}>{user?.email || 'Not provided'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="call" size={20} color={COLORS.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Phone</Text>
            <Text style={styles.infoValue}>{elder?.phone || user?.phone || 'Not provided'}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={20} color={COLORS.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Date of Birth</Text>
            <Text style={styles.infoValue}>
              {elder?.dateOfBirth || user?.dateOfBirth 
                ? new Date(elder?.dateOfBirth || user?.dateOfBirth).toLocaleDateString()
                : 'Not provided'
              }
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location" size={20} color={COLORS.textSecondary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Address</Text>
            <Text style={styles.infoValue}>{elder?.address || 'Not provided'}</Text>
          </View>
        </View>
      </Card>

      {/* Health Vitals - Data from Staff Reports */}
      {elder && (
        <Card style={styles.sectionCard}>
          <View style={styles.healthHeader}>
            <Text style={styles.sectionTitle}>Today's Health Vitals</Text>
            {loadingVitals && (
              <ActivityIndicator size="small" color="#FF6B6B" />
            )}
          </View>
          
          <Text style={styles.healthSubtitle}>
            Recorded by your care team
          </Text>

          {!loadingVitals && healthVitals ? (
            <>
              {/* Heart Rate */}
              {healthVitals.heartRate && (
                <View style={styles.vitalRow}>
                  <View style={styles.vitalIconContainer}>
                    <Ionicons name="heart" size={24} color="#FF6B6B" />
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
                    <Ionicons name="fitness" size={24} color="#FF6B6B" />
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
                    <Ionicons name="thermometer" size={24} color="#FF6B6B" />
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
                    <Ionicons name="scale-outline" size={24} color="#FF6B6B" />
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
                    <Ionicons name="water" size={24} color="#FF6B6B" />
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
                    <Ionicons name="water-outline" size={24} color="#FF6B6B" />
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
                    <Ionicons name="moon" size={24} color="#FF6B6B" />
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
                  <Text style={styles.notesLabel}>Staff Notes:</Text>
                  <Text style={styles.notesText}>{healthVitals.notes}</Text>
                </View>
              )}

              {/* Recorded Info */}
              <View style={styles.recordedInfo}>
                <Ionicons name="time-outline" size={14} color={COLORS.textSecondary} />
                <Text style={styles.recordedText}>
                  Recorded: {new Date(healthVitals.monitoringDate).toLocaleString()}
                </Text>
              </View>
            </>
          ) : !loadingVitals && !healthVitals ? (
            <View style={styles.noDataContainer}>
              <Ionicons name="medical-outline" size={48} color={COLORS.gray300} />
              <Text style={styles.noDataText}>No health vitals recorded today</Text>
              <Text style={styles.noDataSubtext}>
                Your care team will record your vitals during checkups
              </Text>
            </View>
          ) : null}
        </Card>
      )}

      {/* App Settings */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Settings</Text>
        
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings" size={20} color={COLORS.textSecondary} />
          <Text style={styles.settingText}>App Settings</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate('NotificationSettings')}
        >
          <Ionicons name="notifications" size={20} color={COLORS.textSecondary} />
          <Text style={styles.settingText}>Notifications</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => navigation.navigate('EmergencyContacts')}
        >
          <Ionicons name="people" size={20} color={COLORS.textSecondary} />
          <Text style={styles.settingText}>Emergency Contacts</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => {
            Alert.alert(
              'Privacy Policy',
              'Your privacy is important to us. Contact your care coordinator for more information about how your data is protected.',
              [{ text: 'OK' }]
            );
          }}
        >
          <Ionicons name="shield-checkmark" size={20} color={COLORS.textSecondary} />
          <Text style={styles.settingText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => {
            Alert.alert(
              'Help & Support',
              'For help with the app:\n\n• Contact your family member\n• Reach out to your care coordinator\n• Call the support number provided by your care team',
              [{ text: 'OK' }]
            );
          }}
        >
          <Ionicons name="help-circle" size={20} color={COLORS.textSecondary} />
          <Text style={styles.settingText}>Help & Support</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.gray400} />
        </TouchableOpacity>
      </Card>

      {/* Sign Out */}
      <Card style={styles.signOutCard}>
        <Button
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          size="large"
          style={styles.signOutButton}
        />
      </Card>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>ElderLink Mobile v1.0.0</Text>
        <Text style={styles.appInfoText}>Your health, our care</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  
  profileHeader: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  avatarContainer: {
    marginRight: 20,
  },
  
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  nameContainer: {
    flex: 1,
  },
  
  fullName: {
    fontSize: 28,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  
  ageText: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  
  userEmail: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
  },
  
  editButton: {
    padding: 12,
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
  },
  
  sectionCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 20,
  },

  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  healthSubtitle: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginBottom: 20,
    fontStyle: 'italic',
  },

  vitalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },

  vitalIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE8E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },

  vitalContent: {
    flex: 1,
  },

  vitalLabel: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },

  vitalValue: {
    fontSize: 20,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },

  notesContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },

  notesLabel: {
    fontSize: 14,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },

  notesText: {
    fontSize: 15,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },

  recordedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },

  recordedText: {
    fontSize: 13,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginLeft: 6,
  },

  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  noDataText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 12,
    marginBottom: 4,
  },

  noDataSubtext: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 4,
  },
  
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  
  infoLabel: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  
  infoValue: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  
  settingText: {
    flex: 1,
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 16,
  },
  
  signOutCard: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  
  signOutButton: {
    borderColor: COLORS.error,
  },
  
  appInfo: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  
  appInfoText: {
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textLight,
    textAlign: 'center',
    marginBottom: 4,
  },
});

export default ProfileScreen;