import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { sosResponseService } from '../../services/ambulance';
import * as Location from 'expo-location';

const ActiveDispatchScreen = ({ route, navigation }) => {
  const { dispatchId } = route.params;
  const [dispatch, setDispatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingLocation, setUpdatingLocation] = useState(false);
  const [notes, setNotes] = useState('');
  const [locationInterval, setLocationInterval] = useState(null);

  useEffect(() => {
    loadDispatchDetails();
    startLocationTracking();

    return () => {
      if (locationInterval) {
        clearInterval(locationInterval);
      }
    };
  }, []);

  const loadDispatchDetails = async () => {
    try {
      const response = await sosResponseService.getActiveDispatch();
      setDispatch(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading dispatch:', error);
      Alert.alert('Error', 'Failed to load dispatch details');
      setLoading(false);
    }
  };

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required for tracking');
        return;
      }

      // Update location every 10 seconds
      const interval = setInterval(async () => {
        try {
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });

          await sosResponseService.updateLocation(dispatchId, {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } catch (error) {
          console.error('Error updating location:', error);
        }
      }, 10000);

      setLocationInterval(interval);
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  };

  const handleUpdateLocation = async () => {
    setUpdatingLocation(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      await sosResponseService.updateLocation(dispatchId, {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      Alert.alert('Success', 'Location updated successfully');
      loadDispatchDetails();
    } catch (error) {
      console.error('Error updating location:', error);
      Alert.alert('Error', 'Failed to update location');
    } finally {
      setUpdatingLocation(false);
    }
  };

  const handleMarkArrived = async () => {
    Alert.alert(
      'Mark Arrived',
      'Have you arrived at the emergency location?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Arrived',
          onPress: async () => {
            try {
              await sosResponseService.markArrived(dispatchId);
              Alert.alert('Success', 'Marked as arrived at scene');
              loadDispatchDetails();
            } catch (error) {
              console.error('Error marking arrived:', error);
              Alert.alert('Error', 'Failed to mark arrival');
            }
          },
        },
      ]
    );
  };

  const handleComplete = async () => {
    if (!notes.trim()) {
      Alert.alert('Notes Required', 'Please add notes before completing the dispatch');
      return;
    }

    Alert.alert(
      'Complete Dispatch',
      'Are you sure you want to complete this dispatch?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          style: 'destructive',
          onPress: async () => {
            try {
              await sosResponseService.completeDispatch(dispatchId, {
                notes: notes.trim(),
              });

              if (locationInterval) {
                clearInterval(locationInterval);
              }

              Alert.alert('Success', 'Dispatch completed successfully', [
                {
                  text: 'OK',
                  onPress: () => navigation.navigate('DriverDashboard'),
                },
              ]);
            } catch (error) {
              console.error('Error completing dispatch:', error);
              Alert.alert('Error', 'Failed to complete dispatch');
            }
          },
        },
      ]
    );
  };

  const handleNavigate = () => {
    if (!dispatch?.emergencyAlert?.location) return;

    const { latitude, longitude } = dispatch.emergencyAlert.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const handleCallPatient = () => {
    if (dispatch?.emergencyAlert?.elder?.user?.phone) {
      Linking.openURL(`tel:${dispatch.emergencyAlert.elder.user.phone}`);
    }
  };

  const handleCallCoordinator = () => {
    if (dispatch?.coordinator?.phone) {
      Linking.openURL(`tel:${dispatch.coordinator.phone}`);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading dispatch details...</Text>
      </View>
    );
  }

  if (!dispatch) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No dispatch found</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('DriverDashboard')}
        >
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Status Banner */}
      <View style={[styles.statusBanner, { backgroundColor: getStatusColor(dispatch.status) }]}>
        <Text style={styles.statusText}>{dispatch.status.toUpperCase()}</Text>
        {dispatch.estimatedArrivalTime && (
          <Text style={styles.etaText}>
            ETA: {new Date(dispatch.estimatedArrivalTime).toLocaleTimeString()}
          </Text>
        )}
      </View>

      {/* Emergency Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🚨 Emergency Information</Text>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Priority:</Text>
          <Text
            style={[
              styles.value,
              { color: getPriorityColor(dispatch.emergencyAlert.priority), fontWeight: 'bold' },
            ]}
          >
            {dispatch.emergencyAlert.priority.toUpperCase()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>
            {dispatch.emergencyAlert.alertType.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Time:</Text>
          <Text style={styles.value}>
            {new Date(dispatch.emergencyAlert.createdAt).toLocaleString()}
          </Text>
        </View>

        {dispatch.distance && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Distance:</Text>
            <Text style={styles.value}>{dispatch.distance.toFixed(2)} km</Text>
          </View>
        )}
      </View>

      {/* Patient Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>👤 Patient Information</Text>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.label}>Name:</Text>
          <Text style={styles.value}>
            {dispatch.emergencyAlert.elder.user.firstName}{' '}
            {dispatch.emergencyAlert.elder.user.lastName}
          </Text>
        </View>

        {dispatch.emergencyAlert.elder.user.phone && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Phone:</Text>
            <TouchableOpacity onPress={handleCallPatient}>
              <Text style={styles.phoneLink}>📞 {dispatch.emergencyAlert.elder.user.phone}</Text>
            </TouchableOpacity>
          </View>
        )}

        {dispatch.emergencyAlert.medicalInfo && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Medical Conditions:</Text>
              <Text style={styles.value}>
                {dispatch.emergencyAlert.medicalInfo.conditions?.join(', ') || 'None'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Allergies:</Text>
              <Text style={styles.value}>
                {dispatch.emergencyAlert.medicalInfo.allergies?.join(', ') || 'None'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.label}>Medications:</Text>
              <Text style={styles.value}>
                {dispatch.emergencyAlert.medicalInfo.medications?.join(', ') || 'None'}
              </Text>
            </View>
          </>
        )}

        {dispatch.emergencyAlert.vitals && (
          <View style={styles.vitalsSection}>
            <Text style={styles.vitalsTitle}>Vital Signs:</Text>
            {dispatch.emergencyAlert.vitals.heartRate && (
              <Text style={styles.vitalText}>
                ❤️ Heart Rate: {dispatch.emergencyAlert.vitals.heartRate} bpm
              </Text>
            )}
            {dispatch.emergencyAlert.vitals.bloodPressure && (
              <Text style={styles.vitalText}>
                🩺 BP: {dispatch.emergencyAlert.vitals.bloodPressure}
              </Text>
            )}
            {dispatch.emergencyAlert.vitals.oxygenLevel && (
              <Text style={styles.vitalText}>
                🫁 O2: {dispatch.emergencyAlert.vitals.oxygenLevel}%
              </Text>
            )}
          </View>
        )}
      </View>

      {/* Location */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📍 Location</Text>
        <View style={styles.divider} />

        <Text style={styles.address}>
          {dispatch.emergencyAlert.location.address || 'Address not available'}
        </Text>

        {dispatch.emergencyAlert.location.latitude &&
          dispatch.emergencyAlert.location.longitude && (
            <Text style={styles.coordinates}>
              {dispatch.emergencyAlert.location.latitude.toFixed(6)},{' '}
              {dispatch.emergencyAlert.location.longitude.toFixed(6)}
            </Text>
          )}

        <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
          <Text style={styles.buttonText}>🗺️ Navigate to Location</Text>
        </TouchableOpacity>
      </View>

      {/* Coordinator Contact */}
      {dispatch.coordinator && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👨‍💼 Coordinator</Text>
          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.label}>Name:</Text>
            <Text style={styles.value}>
              {dispatch.coordinator.firstName} {dispatch.coordinator.lastName}
            </Text>
          </View>

          {dispatch.coordinator.phone && (
            <TouchableOpacity style={styles.callButton} onPress={handleCallCoordinator}>
              <Text style={styles.buttonText}>📞 Call Coordinator</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Notes Section */}
      {(dispatch.status === 'arrived' || dispatch.status === 'en_route') && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📝 Completion Notes</Text>
          <View style={styles.divider} />

          <TextInput
            style={styles.notesInput}
            multiline
            numberOfLines={4}
            placeholder="Enter dispatch notes, patient condition, treatments provided, etc."
            value={notes}
            onChangeText={setNotes}
          />
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {dispatch.status === 'accepted' || dispatch.status === 'en_route' ? (
          <>
            <TouchableOpacity
              style={[styles.actionButton, styles.updateButton]}
              onPress={handleUpdateLocation}
              disabled={updatingLocation}
            >
              {updatingLocation ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>📍 Update Location</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.arrivedButton]}
              onPress={handleMarkArrived}
            >
              <Text style={styles.buttonText}>✅ Mark Arrived</Text>
            </TouchableOpacity>
          </>
        ) : null}

        {dispatch.status === 'arrived' && (
          <TouchableOpacity
            style={[styles.actionButton, styles.completeButton]}
            onPress={handleComplete}
          >
            <Text style={styles.buttonText}>🏁 Complete Dispatch</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'dispatched':
      return '#f59e0b';
    case 'accepted':
      return '#3b82f6';
    case 'en_route':
      return '#8b5cf6';
    case 'arrived':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

const getPriorityColor = (priority) => {
  switch (priority) {
    case 'critical':
      return '#dc2626';
    case 'high':
      return '#ea580c';
    case 'medium':
      return '#f59e0b';
    case 'low':
      return '#10b981';
    default:
      return '#6b7280';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  statusBanner: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  etaText: {
    color: 'white',
    fontSize: 14,
    marginTop: 5,
  },
  card: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 10,
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 15,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    color: '#1f2937',
    fontWeight: '500',
  },
  phoneLink: {
    fontSize: 15,
    color: '#3b82f6',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  vitalsSection: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  vitalsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  vitalText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  address: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 15,
  },
  navigateButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  callButton: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  notesInput: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    fontSize: 15,
    color: '#1f2937',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  actionsContainer: {
    padding: 15,
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateButton: {
    backgroundColor: '#6b7280',
  },
  arrivedButton: {
    backgroundColor: '#10b981',
  },
  completeButton: {
    backgroundColor: '#8b5cf6',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ActiveDispatchScreen;
