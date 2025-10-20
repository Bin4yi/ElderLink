import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import driverService from '../services/driverService';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';
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

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading rides...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Active Ride Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="car-sport" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Active Ride</Text>
          </View>
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
              <Ionicons name="car-sport-outline" size={64} color={COLORS.gray300} />
              <Text style={styles.noActiveRideText}>No active rides</Text>
              <Text style={styles.noActiveRideSubtext}>
                You'll be notified when a new ride is assigned
              </Text>
            </View>
          )}
        </View>

        {/* Recent Rides Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="time" size={24} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Recent Rides</Text>
          </View>
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
    backgroundColor: COLORS.backgroundLight,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
    fontFamily: 'OpenSans-Regular',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 6,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    fontFamily: 'OpenSans-Bold',
    letterSpacing: 0.5,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontFamily: 'OpenSans-Bold',
  },
  activeRideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    elevation: 6,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  elderName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    fontFamily: 'OpenSans-Bold',
    letterSpacing: 0.3,
  },
  emergencyType: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontFamily: 'OpenSans-SemiBold',
  },
  priorityBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  priorityText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'OpenSans-Bold',
    letterSpacing: 0.5,
  },
  rideDetails: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  detailLabel: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 6,
    fontFamily: 'OpenSans-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: 16,
    color: COLORS.textPrimary,
    fontFamily: 'OpenSans-SemiBold',
    lineHeight: 22,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  statusText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'OpenSans-SemiBold',
  },
  viewDetailsButton: {
    marginTop: 4,
    paddingVertical: 16,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  viewDetailsButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: 'bold',
    fontFamily: 'OpenSans-Bold',
    letterSpacing: 0.5,
  },
  noActiveRide: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 48,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  noActiveRideText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'OpenSans-SemiBold',
  },
  noActiveRideSubtext: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
    fontFamily: 'OpenSans-Regular',
  },
  recentRideCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gray300,
  },
  recentRideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  recentElderName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.textPrimary,
    flex: 1,
    fontFamily: 'OpenSans-Bold',
  },
  recentStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    elevation: 1,
  },
  recentStatusText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'OpenSans-Bold',
    letterSpacing: 0.3,
  },
  recentRideType: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 6,
    fontFamily: 'OpenSans-SemiBold',
  },
  recentRideTime: {
    fontSize: 12,
    color: COLORS.textLight,
    fontFamily: 'OpenSans-Regular',
  },
  noRecentRides: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  noRecentRidesText: {
    fontSize: 14,
    color: COLORS.textLight,
    fontFamily: 'OpenSans-Regular',
  },
});

export default DriverDashboard;
