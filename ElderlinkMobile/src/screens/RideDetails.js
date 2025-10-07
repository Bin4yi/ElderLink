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
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ride Details</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView style={styles.content}>
        {/* Map Section - Temporarily disabled, requires native build */}
        {hasLocation && (
          <View style={styles.mapContainer}>
            <View style={styles.mapPlaceholder}>
              <Text style={styles.mapPlaceholderText}>📍 Map View</Text>
              <Text style={styles.mapPlaceholderSubtext}>
                Emergency Location:{'\n'}
                {elderLocation.address}
              </Text>
              <Text style={styles.mapPlaceholderCoords}>
                Coordinates: {elderLocation.latitude.toFixed(6)}, {elderLocation.longitude.toFixed(6)}
              </Text>
              {currentLocation && (
                <Text style={styles.mapPlaceholderCoords}>
                  Your Location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                </Text>
              )}
            </View>

            <TouchableOpacity style={styles.openMapsButton} onPress={openInMaps}>
              <Text style={styles.openMapsButtonText}>📍 Open in Google Maps</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Emergency Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Information</Text>
          <View style={styles.infoCard}>
            <InfoRow
              label="Patient"
              value={`${dispatch.emergencyAlert?.elder?.user?.firstName} ${dispatch.emergencyAlert?.elder?.user?.lastName}`}
            />
            <InfoRow label="Alert Type" value={dispatch.emergencyAlert?.alertType || 'Emergency'} />
            <InfoRow
              label="Priority"
              value={dispatch.emergencyAlert?.priority?.toUpperCase() || 'MEDIUM'}
              valueColor={getPriorityColor(dispatch.emergencyAlert?.priority)}
            />
            <InfoRow
              label="Phone"
              value={dispatch.emergencyAlert?.elder?.user?.phone || 'Not available'}
            />
            <InfoRow
              label="Status"
              value={getStatusText(dispatch.status)}
              valueColor={getStatusColor(dispatch.status)}
            />
          </View>
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.infoCard}>
            <InfoRow label="Address" value={elderLocation?.address || 'Address not available'} />
            {hasLocation && (
              <>
                <InfoRow label="Latitude" value={elderLocation.latitude.toFixed(6)} />
                <InfoRow label="Longitude" value={elderLocation.longitude.toFixed(6)} />
              </>
            )}
          </View>
        </View>

        {/* Medical Information */}
        {dispatch.emergencyAlert?.medicalInfo && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Medical Information</Text>
            <View style={styles.infoCard}>
              {dispatch.emergencyAlert.medicalInfo.conditions && (
                <InfoRow
                  label="Conditions"
                  value={dispatch.emergencyAlert.medicalInfo.conditions.join(', ')}
                />
              )}
              {dispatch.emergencyAlert.medicalInfo.allergies && (
                <InfoRow
                  label="Allergies"
                  value={dispatch.emergencyAlert.medicalInfo.allergies.join(', ')}
                />
              )}
              {dispatch.emergencyAlert.medicalInfo.medications && (
                <InfoRow
                  label="Medications"
                  value={dispatch.emergencyAlert.medicalInfo.medications.join(', ')}
                />
              )}
            </View>
          </View>
        )}

        {/* Vitals */}
        {dispatch.emergencyAlert?.vitals && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vitals</Text>
            <View style={styles.infoCard}>
              {dispatch.emergencyAlert.vitals.heartRate && (
                <InfoRow label="Heart Rate" value={`${dispatch.emergencyAlert.vitals.heartRate} bpm`} />
              )}
              {dispatch.emergencyAlert.vitals.bloodPressure && (
                <InfoRow
                  label="Blood Pressure"
                  value={`${dispatch.emergencyAlert.vitals.bloodPressure.systolic}/${dispatch.emergencyAlert.vitals.bloodPressure.diastolic} mmHg`}
                />
              )}
              {dispatch.emergencyAlert.vitals.oxygenSaturation && (
                <InfoRow
                  label="Oxygen"
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
                <Text style={styles.actionButtonText}>✓ Accept Dispatch</Text>
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
                <Text style={styles.actionButtonText}>🚗 En Route</Text>
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
                <Text style={styles.actionButtonText}>📍 Mark as Arrived</Text>
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
                <Text style={styles.actionButtonText}>✓ Complete Ride</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const InfoRow = ({ label, value, valueColor }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={[styles.infoValue, valueColor && { color: valueColor }]}>{value}</Text>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
    minWidth: 60,
  },
  backButtonText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  mapContainer: {
    height: 300,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 8,
  },
  mapPlaceholderText: {
    fontSize: 32,
    marginBottom: 12,
  },
  mapPlaceholderSubtext: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 24,
  },
  mapPlaceholderCoords: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 4,
  },
  openMapsButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  openMapsButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 16,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
  },
  acceptButton: {
    backgroundColor: '#42A5F5',
  },
  enRouteButton: {
    backgroundColor: '#AB47BC',
  },
  arrivedButton: {
    backgroundColor: '#66BB6A',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default RideDetails;
