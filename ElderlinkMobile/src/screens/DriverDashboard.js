import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import driverService from '../services/driverService';
import { USER_ROLES } from '../utils/constants';

const DriverDashboard = () => {
  const navigation = useNavigation();
  const { logout, user } = useAuth();
  const [activeDispatch, setActiveDispatch] = useState(null);
  const [recentDispatches, setRecentDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadActiveDispatch(),
        loadRecentDispatches(),
      ]);
    } catch (error) {
      console.error('Error loading driver data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveDispatch = async () => {
    try {
      console.log('🚗 Loading active dispatch...');
      const response = await driverService.getActiveDispatch();
      console.log('✅ Active dispatch response:', JSON.stringify(response, null, 2));
      setActiveDispatch(response.data);
      if (response.data) {
        console.log('✅ Active dispatch set:', response.data.id);
      } else {
        console.log('ℹ️ No active dispatch data in response');
      }
    } catch (error) {
      console.log('ℹ️ No active dispatch:', error.message);
      setActiveDispatch(null);
    }
  };

  const loadRecentDispatches = async () => {
    try {
      console.log('📋 Loading recent dispatches...');
      const response = await driverService.getDispatchHistory({ limit: 5 });
      console.log('✅ Recent dispatches response:', JSON.stringify(response, null, 2));
      setRecentDispatches(response.data || []);
      console.log(`✅ Loaded ${response.data?.length || 0} recent dispatches`);
    } catch (error) {
      console.error('❌ Error loading recent dispatches:', error);
      console.error('Error details:', error.response || error.message);
      setRecentDispatches([]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const handleViewRide = (dispatch) => {
    navigation.navigate('RideDetails', { dispatch });
  };

  const getStatusColor = (status) => {
    const colors = {
      dispatched: '#FFA726',
      accepted: '#42A5F5',
      en_route: '#AB47BC',
      arrived: '#66BB6A',
      completed: '#78909C',
      cancelled: '#EF5350',
    };
    return colors[status] || '#9E9E9E';
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

  const getPriorityColor = (priority) => {
    const colors = {
      critical: '#D32F2F',
      high: '#F57C00',
      medium: '#FBC02D',
      low: '#388E3C',
    };
    return colors[priority?.toLowerCase()] || '#757575';
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  const handleMarkAvailable = async () => {
    Alert.alert(
      'Mark Ambulance Available',
      'Mark your ambulance as available for new dispatches?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Available',
          onPress: async () => {
            try {
              await driverService.markAvailable();
              Alert.alert('Success', 'Ambulance marked as available');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to mark ambulance as available');
            }
          },
        },
      ]
    );
  };

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading rides...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Driver Dashboard</Text>
          <Text style={styles.headerSubtitle}>Ambulance Dispatch</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.availableButton}
            onPress={handleMarkAvailable}
          >
            <Text style={styles.availableButtonText}>✓ Available</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Active Ride Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Ride</Text>
          {activeDispatch ? (
            <TouchableOpacity
              style={styles.activeRideCard}
              onPress={() => handleViewRide(activeDispatch)}
            >
              <View style={styles.rideHeader}>
                <View>
                  <Text style={styles.elderName}>
                    {activeDispatch.emergency?.elder?.user?.firstName}{' '}
                    {activeDispatch.emergency?.elder?.user?.lastName}
                  </Text>
                  <Text style={styles.emergencyType}>
                    {activeDispatch.emergency?.alertType || 'Emergency'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(activeDispatch.emergency?.priority) },
                  ]}
                >
                  <Text style={styles.priorityText}>
                    {activeDispatch.emergency?.priority?.toUpperCase() || 'MEDIUM'}
                  </Text>
                </View>
              </View>

              <View style={styles.rideDetails}>
                <Text style={styles.detailLabel}>Location</Text>
                <Text style={styles.detailValue} numberOfLines={2}>
                  {activeDispatch.emergency?.location?.address || 'Address not available'}
                </Text>
              </View>

              <View style={styles.rideDetails}>
                <Text style={styles.detailLabel}>Status</Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(activeDispatch.status) },
                  ]}
                >
                  <Text style={styles.statusText}>{getStatusText(activeDispatch.status)}</Text>
                </View>
              </View>

              <View style={styles.rideDetails}>
                <Text style={styles.detailLabel}>Time</Text>
                <Text style={styles.detailValue}>
                  {new Date(activeDispatch.dispatchedAt).toLocaleTimeString()}
                </Text>
              </View>

              <View style={styles.viewDetailsButton}>
                <Text style={styles.viewDetailsButtonText}>View Details & Map →</Text>
              </View>
            </TouchableOpacity>
          ) : (
            <View style={styles.noActiveRide}>
              <Text style={styles.noActiveRideIcon}>🚗</Text>
              <Text style={styles.noActiveRideText}>No active rides</Text>
              <Text style={styles.noActiveRideSubtext}>
                You'll be notified when a new ride is assigned
              </Text>
            </View>
          )}
        </View>

        {/* Recent Rides Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Rides</Text>
          {recentDispatches.length > 0 ? (
            recentDispatches.map((dispatch) => (
              <TouchableOpacity
                key={dispatch.id}
                style={styles.recentRideCard}
                onPress={() => handleViewRide(dispatch)}
              >
                <View style={styles.recentRideHeader}>
                  <Text style={styles.recentElderName}>
                    {dispatch.emergency?.elder?.user?.firstName}{' '}
                    {dispatch.emergency?.elder?.user?.lastName}
                  </Text>
                  <View
                    style={[
                      styles.recentStatusBadge,
                      { backgroundColor: getStatusColor(dispatch.status) },
                    ]}
                  >
                    <Text style={styles.recentStatusText}>{getStatusText(dispatch.status)}</Text>
                  </View>
                </View>
                <Text style={styles.recentRideType}>
                  {dispatch.emergency?.alertType || 'Emergency'}
                </Text>
                <Text style={styles.recentRideTime}>
                  {new Date(dispatch.dispatchedAt).toLocaleDateString()} •{' '}
                  {new Date(dispatch.dispatchedAt).toLocaleTimeString()}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noRecentRides}>
              <Text style={styles.noRecentRidesText}>No recent rides</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  logoutButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  availableButton: {
    backgroundColor: '#2E7D32',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  availableButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  activeRideCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  elderName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  emergencyType: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  rideDetails: {
    marginBottom: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  viewDetailsButton: {
    marginTop: 8,
    paddingVertical: 12,
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewDetailsButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  noActiveRide: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    elevation: 2,
  },
  noActiveRideIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  noActiveRideText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  noActiveRideSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  recentRideCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    elevation: 1,
  },
  recentRideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  recentElderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  recentStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  recentStatusText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  recentRideType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  recentRideTime: {
    fontSize: 12,
    color: '#999',
  },
  noRecentRides: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 24,
    alignItems: 'center',
  },
  noRecentRidesText: {
    fontSize: 14,
    color: '#999',
  },
});

export default DriverDashboard;
