import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { sosResponseService } from '../../services/ambulance';

const DriverDashboard = ({ navigation }) => {
  const [activeDispatch, setActiveDispatch] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dispatchResponse, statsResponse] = await Promise.all([
        sosResponseService.getActiveDispatch(),
        sosResponseService.getDriverStats(),
      ]);

      setActiveDispatch(dispatchResponse.data);
      setStats(statsResponse.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAcceptDispatch = async () => {
    if (!activeDispatch) return;

    Alert.alert(
      'Accept Dispatch',
      'Do you want to accept this emergency dispatch?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              await sosResponseService.acceptDispatch(activeDispatch.id);
              Alert.alert('Success', 'Dispatch accepted! Please proceed to location.');
              navigation.navigate('ActiveDispatch', { dispatchId: activeDispatch.id });
            } catch (error) {
              Alert.alert('Error', 'Failed to accept dispatch');
            }
          },
        },
      ]
    );
  };

  const handleNavigate = () => {
    if (!activeDispatch?.emergencyAlert?.location) return;

    const { latitude, longitude } = activeDispatch.emergencyAlert.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
    Linking.openURL(url);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚑 Ambulance Driver</Text>
        <Text style={styles.headerSubtitle}>Emergency Response Dashboard</Text>
      </View>

      {/* Active Dispatch */}
      {activeDispatch ? (
        <View style={styles.dispatchCard}>
          <View style={styles.dispatchHeader}>
            <Text style={styles.dispatchTitle}>🚨 Active Dispatch</Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(activeDispatch.status) },
              ]}
            >
              <Text style={styles.statusText}>{activeDispatch.status.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Patient Info */}
          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Patient:</Text>
            <Text style={styles.infoValue}>
              {activeDispatch.emergencyAlert?.elder?.user?.firstName}{' '}
              {activeDispatch.emergencyAlert?.elder?.user?.lastName}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Priority:</Text>
            <Text
              style={[
                styles.infoValue,
                { color: getPriorityColor(activeDispatch.emergencyAlert?.priority) },
              ]}
            >
              {activeDispatch.emergencyAlert?.priority?.toUpperCase()}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Type:</Text>
            <Text style={styles.infoValue}>
              {activeDispatch.emergencyAlert?.alertType?.replace('_', ' ')}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>
              {activeDispatch.emergencyAlert?.location?.address || 'Unknown'}
            </Text>
          </View>

          {activeDispatch.distance && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Distance:</Text>
              <Text style={styles.infoValue}>{activeDispatch.distance.toFixed(2)} km</Text>
            </View>
          )}

          {activeDispatch.estimatedArrivalTime && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>ETA:</Text>
              <Text style={styles.infoValue}>
                {new Date(activeDispatch.estimatedArrivalTime).toLocaleTimeString()}
              </Text>
            </View>
          )}

          {/* Contact */}
          {activeDispatch.emergencyAlert?.elder?.user?.phone && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Contact:</Text>
              <TouchableOpacity
                onPress={() =>
                  Linking.openURL(`tel:${activeDispatch.emergencyAlert.elder.user.phone}`)
                }
              >
                <Text style={styles.phoneLink}>
                  📞 {activeDispatch.emergencyAlert.elder.user.phone}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Coordinator */}
          {activeDispatch.coordinator && (
            <View style={styles.infoSection}>
              <Text style={styles.infoLabel}>Coordinator:</Text>
              <Text style={styles.infoValue}>
                {activeDispatch.coordinator.firstName} {activeDispatch.coordinator.lastName}
              </Text>
              {activeDispatch.coordinator.phone && (
                <TouchableOpacity
                  onPress={() => Linking.openURL(`tel:${activeDispatch.coordinator.phone}`)}
                >
                  <Text style={styles.phoneLink}>📞 {activeDispatch.coordinator.phone}</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Actions */}
          <View style={styles.actions}>
            {activeDispatch.status === 'dispatched' && (
              <TouchableOpacity style={styles.acceptButton} onPress={handleAcceptDispatch}>
                <Text style={styles.buttonText}>✅ Accept Dispatch</Text>
              </TouchableOpacity>
            )}

            {(activeDispatch.status === 'accepted' || activeDispatch.status === 'en_route') && (
              <>
                <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
                  <Text style={styles.buttonText}>🗺️ Navigate</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewButton}
                  onPress={() =>
                    navigation.navigate('ActiveDispatch', { dispatchId: activeDispatch.id })
                  }
                >
                  <Text style={styles.buttonText}>📋 View Details</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      ) : (
        <View style={styles.noDispatchCard}>
          <Text style={styles.noDispatchIcon}>✅</Text>
          <Text style={styles.noDispatchText}>No Active Dispatch</Text>
          <Text style={styles.noDispatchSubtext}>Waiting for emergency assignments...</Text>
        </View>
      )}

      {/* Statistics */}
      {stats && (
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 Your Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalDispatches}</Text>
              <Text style={styles.statLabel}>Total Dispatches</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.completedDispatches}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.averageResponseTime}s</Text>
              <Text style={styles.statLabel}>Avg Response</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.totalDistanceCovered.toFixed(1)} km</Text>
              <Text style={styles.statLabel}>Total Distance</Text>
            </View>
          </View>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('DispatchHistory')}
        >
          <Text style={styles.quickActionIcon}>📜</Text>
          <Text style={styles.quickActionText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.quickActionIcon}>👤</Text>
          <Text style={styles.quickActionText}>Profile</Text>
        </TouchableOpacity>
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
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    backgroundColor: '#3b82f6',
    padding: 20,
    paddingTop: 60,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#dbeafe',
    marginTop: 5,
  },
  dispatchCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dispatchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dispatchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginBottom: 15,
  },
  infoSection: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  infoValue: {
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
  actions: {
    marginTop: 20,
    gap: 10,
  },
  acceptButton: {
    backgroundColor: '#10b981',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  navigateButton: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButton: {
    backgroundColor: '#6b7280',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  noDispatchCard: {
    backgroundColor: 'white',
    margin: 15,
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noDispatchIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  noDispatchText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  noDispatchSubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  statsCard: {
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
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#f9fafb',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    margin: 15,
    gap: 15,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
});

export default DriverDashboard;
