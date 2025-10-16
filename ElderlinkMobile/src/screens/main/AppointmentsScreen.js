import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  FlatList,
  Linking
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { appointmentsService } from '../../services/appointments';
import { COLORS } from '../../utils/colors';

import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import Loading from '../../components/common/Loading';
import AppointmentCard from '../../components/AppointmentCard';

const AppointmentsScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filterOptions = [
    { key: 'all', label: 'All', icon: 'calendar' },
    { key: 'upcoming', label: 'Upcoming', icon: 'time' },
    { key: 'today', label: 'Today', icon: 'today' },
    { key: 'completed', label: 'Completed', icon: 'checkmark-circle' },
  ];

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, activeFilter]);

  const loadAppointments = async () => {
    try {
      setError('');
      const response = await appointmentsService.getElderAppointments(user.id);
      setAppointments(response.data || []);
    } catch (error) {
      setError('Failed to load appointments. Please try again.');
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAppointments();
    setRefreshing(false);
  };

  const filterAppointments = () => {
    let filtered = [...appointments];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (activeFilter) {
      case 'upcoming':
        filtered = filtered.filter(apt => new Date(apt.appointmentDate) >= now);
        break;
      case 'today':
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.appointmentDate);
          return aptDate >= today && aptDate < tomorrow;
        });
        break;
      case 'completed':
        filtered = filtered.filter(apt => apt.status === 'completed');
        break;
      default:
        break;
    }

    // Sort by date (upcoming first)
    filtered.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
    setFilteredAppointments(filtered);
  };

  const handleAppointmentPress = (appointment) => {
    navigation.navigate('AppointmentDetails', { appointmentId: appointment.id });
  };

  const handleJoinMeeting = (appointment) => {
    if (appointment.zoomJoinUrl) {
      Linking.openURL(appointment.zoomJoinUrl);
    }
  };

  const renderFilterButton = (option) => (
    <TouchableOpacity
      key={option.key}
      style={[
        styles.filterButton,
        activeFilter === option.key && styles.activeFilterButton
      ]}
      onPress={() => setActiveFilter(option.key)}
    >
      <Ionicons 
        name={option.icon} 
        size={16} 
        color={activeFilter === option.key ? COLORS.white : COLORS.primary} 
      />
      <Text style={[
        styles.filterButtonText,
        activeFilter === option.key && styles.activeFilterButtonText
      ]}>
        {option.label}
      </Text>
    </TouchableOpacity>
  );

  const renderAppointmentItem = ({ item }) => (
    <AppointmentCard
      appointment={item}
      onPress={() => handleAppointmentPress(item)}
      onJoinMeeting={() => handleJoinMeeting(item)}
    />
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="calendar-outline" size={80} color={COLORS.gray300} />
      <Text style={styles.emptyStateTitle}>
        {activeFilter === 'today' ? 'No appointments today' : 
         activeFilter === 'upcoming' ? 'No upcoming appointments' :
         activeFilter === 'completed' ? 'No completed appointments' :
         'No appointments found'}
      </Text>
      <Text style={styles.emptyStateMessage}>
        {activeFilter === 'today' ? 'You have no appointments scheduled for today.' :
         activeFilter === 'upcoming' ? 'You have no upcoming appointments.' :
         activeFilter === 'completed' ? 'You have no completed appointments.' :
         'You have no appointments scheduled. Book your first appointment to get started.'}
      </Text>
      <Button
        title="Book Appointment"
        onPress={() => {/* Navigate to booking screen */}}
        variant="primary"
        size="large"
        style={styles.bookButton}
      />
    </View>
  );

  if (loading) {
    return <Loading message="Loading appointments..." />;
  }

  return (
    <View style={styles.container}>
      {error && (
        <Alert
          type="error"
          message={error}
          closable
          onClose={() => setError('')}
          style={styles.errorAlert}
        />
      )}

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {filterOptions.map(renderFilterButton)}
        </ScrollView>
      </View>

      {/* Appointments Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>
          {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
        </Text>
      </View>

      {/* Appointments List */}
      <FlatList
        data={filteredAppointments}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
      />

      {/* Quick Book Button */}
      <View style={styles.quickActionContainer}>
        <Button
          title="Book New Appointment"
          onPress={() => {/* Navigate to booking screen */}}
          variant="primary"
          size="large"
          style={styles.quickBookButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  
  errorAlert: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  
  filterContainer: {
    backgroundColor: COLORS.white,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  
  filterScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: COLORS.primary,
    minWidth: 100,
  },
  
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  
  filterButtonText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  
  activeFilterButtonText: {
    color: COLORS.white,
  },
  
  countContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.white,
  },
  
  countText: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  
  listContent: {
    paddingBottom: 100, // Space for quick action button
  },
  
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  
  emptyStateTitle: {
    fontSize: 24,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 24,
    marginBottom: 12,
    textAlign: 'center',
  },
  
  emptyStateMessage: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 32,
  },
  
  bookButton: {
    minWidth: 200,
  },
  
  quickActionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  
  quickBookButton: {
    marginBottom: 0,
  },
});

export default AppointmentsScreen;