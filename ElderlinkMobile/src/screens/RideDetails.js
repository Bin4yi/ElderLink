import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// MapView temporarily disabled - requires native build
// import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import driverService from '../services/driverService';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';

const RideDetails = ({ route, navigation }) => {
  const { dispatch: initialDispatch } = route.params;
  const [dispatch, setDispatch] = useState(initialDispatch);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('🚗 RideDetails - Initial dispatch:', JSON.stringify(initialDispatch, null, 2));
    console.log('🔍 Has emergencyAlert?', !!initialDispatch?.emergencyAlert);
    console.log('🔍 Has emergency (old)?', !!initialDispatch?.emergency);
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to show your position');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const handleAccept = async () => {
    try {
      setUpdating(true);
      const response = await driverService.acceptDispatch(dispatch.id);
      setDispatch(response.data);
      Alert.alert('Success', 'Dispatch accepted');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to accept dispatch');
    } finally {
      setUpdating(false);
    }
  };

  const handleEnRoute = async () => {
    try {
      setUpdating(true);
      const response = await driverService.updateToEnRoute(dispatch.id);
      setDispatch(response.data);
      Alert.alert('Success', 'Status updated to en route');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleArrived = async () => {
    try {
      setUpdating(true);
      const response = await driverService.markArrived(dispatch.id);
      setDispatch(response.data);
      Alert.alert('Success', 'Marked as arrived');
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to mark as arrived');
    } finally {
      setUpdating(false);
    }
  };

  const handleComplete = async () => {
    Alert.alert(
      'Complete Ride',
      'Are you sure you want to complete this ride?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              setUpdating(true);
              await driverService.completeDispatch(dispatch.id);
              Alert.alert('Success', 'Ride completed', [
                {
                  text: 'OK',
                  onPress: () => navigation.goBack(),
                },
              ]);
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to complete ride');
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const openInMaps = () => {
    const location = dispatch.emergencyAlert?.location;
    if (!location?.latitude || !location?.longitude) {
      Alert.alert('Error', 'Location not available');
      return;
    }

    const scheme = Platform.select({
      ios: 'maps:',
      android: 'geo:',
    });
    const url = Platform.select({
      ios: `${scheme}?q=${location.latitude},${location.longitude}`,
      android: `${scheme}${location.latitude},${location.longitude}?q=${location.latitude},${location.longitude}`,
    });

    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open maps application');
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      dispatched: '#FFA726',
      accepted: '#42A5F5',
      en_route: '#AB47BC',
      arrived: '#66BB6A',
      completed: '#78909C',
    };
    return colors[status] || '#9E9E9E';
  };

  const elderLocation = dispatch.emergencyAlert?.location;
  const hasLocation = elderLocation?.latitude && elderLocation?.longitude;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Details</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        {/* Map Section - Temporarily disabled, requires native build */}
        {hasLocation && (
          <>
            <View style={styles.mapContainer}>
              <View style={styles.mapPlaceholder}>
                <Ionicons name="location" size={48} color={COLORS.primary} />
                <Text style={styles.mapPlaceholderText}>Emergency Location</Text>
                <Text style={styles.mapPlaceholderSubtext}>
                  {elderLocation.address}
                </Text>
                <View style={styles.coordsContainer}>
                  <Text style={styles.mapPlaceholderCoords}>
                    📍 {elderLocation.latitude.toFixed(6)}, {elderLocation.longitude.toFixed(6)}
                  </Text>
                  {currentLocation && (
                    <Text style={styles.mapPlaceholderCoords}>
                      🚗 {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                    </Text>
                  )}
                </View>
              </View>
            </View>
            
            <View style={styles.mapButtonContainer}>
              <TouchableOpacity style={styles.openMapsButton} onPress={openInMaps}>
                <Ionicons name="map" size={20} color={COLORS.white} />
                <Text style={styles.openMapsButtonText}>Open in Maps</Text>
              </TouchableOpacity>
            </View>
          </>
        )}

        {/* Emergency Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="alert-circle" size={26} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Emergency Details</Text>
          </View>
          <View style={styles.infoCard}>
            <InfoRow
              icon="person"
              label="Patient"
              value={`${dispatch.emergencyAlert?.elder?.user?.firstName} ${dispatch.emergencyAlert?.elder?.user?.lastName}`}
            />
            <InfoRow 
              icon="medical"
              label="Alert Type" 
              value={dispatch.emergencyAlert?.alertType || 'Emergency'} 
            />
            <InfoRow
              icon="warning"
              label="Priority"
              value={dispatch.emergencyAlert?.priority?.toUpperCase() || 'MEDIUM'}
              valueColor={getPriorityColor(dispatch.emergencyAlert?.priority)}
            />
            <InfoRow
              icon="call"
              label="Phone"
              value={dispatch.emergencyAlert?.elder?.user?.phone || 'Not available'}
            />
            <InfoRow
              icon="information-circle"
              label="Status"
              value={getStatusText(dispatch.status)}
              valueColor={getStatusColor(dispatch.status)}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="location" size={26} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Location Details</Text>
          </View>
          <View style={styles.infoCard}>
            <InfoRow 
              icon="navigate"
              label="Address" 
              value={elderLocation?.address || 'Address not available'} 
            />
            {hasLocation && (
              <>
                <InfoRow 
                  icon="compass"
                  label="Coordinates" 
                  value={`${elderLocation.latitude.toFixed(6)}, ${elderLocation.longitude.toFixed(6)}`} 
                />
              </>
            )}
          </View>
        </View>

        {/* Vitals */}
        {dispatch.emergencyAlert?.vitals && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="heart" size={26} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Vital Signs</Text>
            </View>
            <View style={styles.infoCard}>
              {dispatch.emergencyAlert.vitals.heartRate && (
                <InfoRow 
                  icon="heart-outline"
                  label="Heart Rate" 
                  value={`${dispatch.emergencyAlert.vitals.heartRate} bpm`} 
                />
              )}
              {dispatch.emergencyAlert.vitals.bloodPressure && (
                <InfoRow
                  icon="fitness"
                  label="Blood Pressure"
                  value={`${dispatch.emergencyAlert.vitals.bloodPressure.systolic}/${dispatch.emergencyAlert.vitals.bloodPressure.diastolic} mmHg`}
                />
              )}
              {dispatch.emergencyAlert.vitals.oxygenSaturation && (
                <InfoRow
                  icon="water"
                  label="Oxygen Saturation"
                  value={`${dispatch.emergencyAlert.vitals.oxygenSaturation}%`}
                />
              )}
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.section}>
          {dispatch.status === 'dispatched' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={handleAccept}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>Accept Dispatch</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {dispatch.status === 'accepted' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.enRouteButton]}
              onPress={handleEnRoute}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="car-sport" size={22} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>En Route</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {dispatch.status === 'en_route' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.arrivedButton]}
              onPress={handleArrived}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="location" size={22} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>Mark as Arrived</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {dispatch.status === 'arrived' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={handleComplete}
              disabled={updating}
            >
              {updating ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-done-circle" size={22} color={COLORS.white} />
                  <Text style={styles.actionButtonText}>Complete Ride</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ icon, label, value, valueColor }) => (
  <View style={styles.infoRow}>
    {icon && (
      <View style={styles.infoIcon}>
        <Ionicons name={icon} size={20} color={COLORS.primary} />
      </View>
    )}
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  </View>
);

const getPriorityColor = (priority) => {
  const colors = {
    critical: '#D32F2F',
    high: '#F57C00',
    medium: '#FBC02D',
    low: '#388E3C',
  };
  return colors[priority?.toLowerCase()] || '#757575';
};

const getStatusText = (status) => {
  const texts = {
    dispatched: 'New Dispatch',
    accepted: 'Accepted',
    en_route: 'En Route',
    arrived: 'Arrived',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return texts[status] || status;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: COLORS.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  backButton: {
    padding: 8,
    minWidth: 80,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 17,
    color: COLORS.white,
    fontWeight: '600',
    fontFamily: 'OpenSans-SemiBold',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: 'OpenSans-Bold',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 0,
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
  },
  mapPlaceholderText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 12,
    fontFamily: 'OpenSans-Bold',
    letterSpacing: 0.3,
  },
  mapPlaceholderSubtext: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
    fontFamily: 'OpenSans-SemiBold',
  },
  coordsContainer: {
    width: '100%',
    gap: 8,
  },
  mapPlaceholderCoords: {
    fontSize: 13,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontFamily: 'OpenSans-SemiBold',
    backgroundColor: COLORS.gray100,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  mapButtonContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  openMapsButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  openMapsButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'OpenSans-Bold',
    letterSpacing: 0.5,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontFamily: 'OpenSans-Bold',
    letterSpacing: 0.3,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    fontFamily: 'OpenSans-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontFamily: 'OpenSans-SemiBold',
    lineHeight: 22,
  },
  actionButton: {
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    flexDirection: 'row',
    gap: 10,
  },
  acceptButton: {
    backgroundColor: COLORS.info,
    shadowColor: COLORS.info,
  },
  enRouteButton: {
    backgroundColor: COLORS.warning,
    shadowColor: COLORS.warning,
  },
  arrivedButton: {
    backgroundColor: COLORS.success,
    shadowColor: COLORS.success,
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: 'bold',
    fontFamily: 'OpenSans-Bold',
    letterSpacing: 0.5,
  },
});

export default RideDetails;
