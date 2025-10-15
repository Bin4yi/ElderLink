import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { sosResponseService } from '../../services/ambulance';

const DispatchHistoryScreen = ({ navigation }) => {
  const [dispatches, setDispatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, completed, cancelled

  useEffect(() => {
    loadHistory();
  }, [filter]);

  const loadHistory = async () => {
    try {
      const params = filter === 'all' ? {} : { status: filter };
      const response = await sosResponseService.getDispatchHistory(params);
      setDispatches(response.data);
      setLoading(false);
      setRefreshing(false);
    } catch (error) {
      console.error('Error loading history:', error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const renderDispatchItem = ({ item }) => (
    <TouchableOpacity
      style={styles.dispatchCard}
      onPress={() => navigation.navigate('DispatchDetail', { dispatchId: item.id })}
    >
      <View style={styles.dispatchHeader}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.dispatchBody}>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Emergency:</Text>
          <Text
            style={[
              styles.value,
              { color: getPriorityColor(item.emergencyAlert?.priority) },
            ]}
          >
            {item.emergencyAlert?.alertType?.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Patient:</Text>
          <Text style={styles.value}>
            {item.emergencyAlert?.elder?.user?.firstName}{' '}
            {item.emergencyAlert?.elder?.user?.lastName}
          </Text>
        </View>

        {item.distance && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Distance:</Text>
            <Text style={styles.value}>{item.distance.toFixed(2)} km</Text>
          </View>
        )}

        {item.responseTime && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Response Time:</Text>
            <Text style={styles.value}>{Math.floor(item.responseTime / 60)} min</Text>
          </View>
        )}

        {item.completedAt && (
          <View style={styles.infoRow}>
            <Text style={styles.label}>Completed:</Text>
            <Text style={styles.value}>
              {new Date(item.completedAt).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.dispatchFooter}>
        <Text style={styles.footerText}>
          Dispatched: {new Date(item.dispatchedAt).toLocaleTimeString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterTab, filter === 'all' && styles.activeFilter]}
          onPress={() => setFilter('all')}
        >
          <Text style={[styles.filterText, filter === 'all' && styles.activeFilterText]}>
            All
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'completed' && styles.activeFilter]}
          onPress={() => setFilter('completed')}
        >
          <Text style={[styles.filterText, filter === 'completed' && styles.activeFilterText]}>
            Completed
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterTab, filter === 'cancelled' && styles.activeFilter]}
          onPress={() => setFilter('cancelled')}
        >
          <Text style={[styles.filterText, filter === 'cancelled' && styles.activeFilterText]}>
            Cancelled
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dispatch List */}
      {dispatches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyText}>No dispatch history</Text>
          <Text style={styles.emptySubtext}>Your completed dispatches will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={dispatches}
          renderItem={renderDispatchItem}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return '#10b981';
    case 'cancelled':
      return '#ef4444';
    case 'dispatched':
      return '#f59e0b';
    case 'accepted':
      return '#3b82f6';
    case 'en_route':
      return '#8b5cf6';
    case 'arrived':
      return '#06b6d4';
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
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterTab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  activeFilter: {
    backgroundColor: '#3b82f6',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  activeFilterText: {
    color: 'white',
  },
  listContainer: {
    padding: 15,
  },
  dispatchCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
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
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
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
  dateText: {
    fontSize: 13,
    color: '#6b7280',
  },
  dispatchBody: {
    padding: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
  },
  value: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  dispatchFooter: {
    padding: 15,
    backgroundColor: '#f9fafb',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});

export default DispatchHistoryScreen;
