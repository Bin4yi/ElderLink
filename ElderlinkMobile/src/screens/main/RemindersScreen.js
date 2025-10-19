import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../utils/colors';
import apiService from '../../services/api';
import Card from '../../components/common/Card';

const RemindersScreen = ({ navigation }) => {
  const { user, elder } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'all', 'past'

  useEffect(() => {
    fetchAppointments();
  }, [filter]);

  const fetchAppointments = async () => {
    try {
      console.log('📅 Fetching appointments...');
      setLoading(true);

      // Fetch appointments from backend
      const response = await apiService.get('/api/appointments');
      
      console.log('📅 Appointments response:', response);

      if (response && response.success) {
        let appointmentsList = response.appointments || [];
        
        // Filter based on selected filter
        const now = new Date();
        if (filter === 'upcoming') {
          appointmentsList = appointmentsList.filter(apt => 
            new Date(apt.appointmentDate) >= now && 
            ['pending', 'approved'].includes(apt.status)
          );
        } else if (filter === 'past') {
          appointmentsList = appointmentsList.filter(apt => 
            new Date(apt.appointmentDate) < now || 
            ['completed', 'cancelled'].includes(apt.status)
          );
        }

        // Sort by date (upcoming first for upcoming, latest first for past)
        appointmentsList.sort((a, b) => {
          const dateA = new Date(a.appointmentDate);
          const dateB = new Date(b.appointmentDate);
          return filter === 'past' ? dateB - dateA : dateA - dateB;
        });

        setAppointments(appointmentsList);
        console.log(`✅ Loaded ${appointmentsList.length} appointments`);
      } else {
        setAppointments([]);
        console.log('ℹ️ No appointments found');
      }
    } catch (error) {
      console.error('❌ Error fetching appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Reset time for comparison
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const tomorrowOnly = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate());

    if (dateOnly.getTime() === todayOnly.getTime()) {
      return 'Today';
    } else if (dateOnly.getTime() === tomorrowOnly.getTime()) {
      return 'Tomorrow';
    } else {
      const options = { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      };
      return date.toLocaleDateString('en-US', options);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return '#4CAF50';
      case 'completed':
        return '#2196F3';
      case 'pending':
        return '#FFA500';
      case 'cancelled':
        return '#F44336';
      default:
        return COLORS.gray400;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'close-circle';
      case 'completed':
        return 'checkmark-done-circle';
      default:
        return 'help-circle';
    }
  };

  const getStatusText = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isUpcoming = (appointmentDate) => {
    return new Date(appointmentDate) >= new Date();
  };

  const renderAppointmentCard = (appointment) => {
    const doctorName = appointment.doctor?.user 
      ? `Dr. ${appointment.doctor.user.firstName} ${appointment.doctor.user.lastName}`
      : 'Doctor';
    
    const upcoming = isUpcoming(appointment.appointmentDate);
    const elderName = appointment.elder 
      ? `${appointment.elder.firstName} ${appointment.elder.lastName}`
      : 'Elder';

    return (
      <Card key={appointment.id} style={styles.appointmentCard}>
        <View style={styles.appointmentHeader}>
          <View style={styles.dateContainer}>
            <View style={styles.dateIconContainer}>
              <Ionicons 
                name="calendar" 
                size={20} 
                color={upcoming ? '#FF6B6B' : COLORS.gray400} 
              />
            </View>
            <View style={styles.dateText}>
              <Text style={styles.dateDay}>{formatDate(appointment.appointmentDate)}</Text>
              <Text style={styles.dateTime}>{formatTime(appointment.appointmentDate)}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(appointment.status) + '20' }]}>
            <Ionicons 
              name={getStatusIcon(appointment.status)} 
              size={14} 
              color={getStatusColor(appointment.status)} 
            />
            <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
              {getStatusText(appointment.status)}
            </Text>
          </View>
        </View>

        <View style={styles.appointmentBody}>
          {/* Doctor Info */}
          <View style={styles.infoSection}>
            <View style={styles.doctorInfo}>
              <View style={styles.doctorAvatar}>
                <Ionicons name="medkit" size={24} color="#FF6B6B" />
              </View>
              <View style={styles.doctorDetails}>
                <Text style={styles.doctorName}>{doctorName}</Text>
                {appointment.doctor?.specialization && (
                  <Text style={styles.doctorSpecialization}>
                    {appointment.doctor.specialization}
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* Patient Info (for family members) */}
          {user?.role === 'family_member' && appointment.elder && (
            <View style={styles.patientInfo}>
              <Ionicons name="person" size={16} color={COLORS.textSecondary} />
              <Text style={styles.patientText}>For: {elderName}</Text>
            </View>
          )}

          {/* Appointment Type */}
          {appointment.appointmentType && (
            <View style={styles.infoRow}>
              <Ionicons name="videocam" size={16} color={COLORS.textSecondary} />
              <Text style={styles.infoText}>
                {appointment.appointmentType === 'video' ? 'Video Consultation' : 'In-Person Visit'}
              </Text>
            </View>
          )}

          {/* Notes */}
          {appointment.notes && (
            <View style={styles.notesContainer}>
              <Ionicons name="document-text" size={16} color={COLORS.textSecondary} />
              <Text style={styles.notesText} numberOfLines={2}>
                {appointment.notes}
              </Text>
            </View>
          )}

          {/* Fee */}
          {appointment.consultationFee && (
            <View style={styles.feeContainer}>
              <Ionicons name="cash" size={16} color="#4CAF50" />
              <Text style={styles.feeText}>LKR {appointment.consultationFee}</Text>
            </View>
          )}
        </View>

        {/* Action Buttons for Upcoming Appointments */}
        {upcoming && appointment.status === 'approved' && (
          <View style={styles.appointmentFooter}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => console.log('Join appointment:', appointment.id)}
            >
              <Ionicons name="videocam" size={18} color="#FFF" />
              <Text style={styles.actionButtonText}>Join</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButtonOutline}
              onPress={() => console.log('View details:', appointment.id)}
            >
              <Ionicons name="information-circle-outline" size={18} color="#FF6B6B" />
              <Text style={styles.actionButtonOutlineText}>Details</Text>
            </TouchableOpacity>
          </View>
        )}
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header with Filters */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>My Appointments</Text>
            <Text style={styles.headerSubtitle}>
              {appointments.length} {filter === 'upcoming' ? 'upcoming' : filter === 'past' ? 'past' : 'total'}
            </Text>
          </View>
        </View>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'upcoming' && styles.filterButtonActive]}
            onPress={() => setFilter('upcoming')}
          >
            <Text style={[styles.filterText, filter === 'upcoming' && styles.filterTextActive]}>
              Upcoming
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
            onPress={() => setFilter('all')}
          >
            <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filter === 'past' && styles.filterButtonActive]}
            onPress={() => setFilter('past')}
          >
            <Text style={[styles.filterText, filter === 'past' && styles.filterTextActive]}>
              Past
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF6B6B" />
            <Text style={styles.loadingText}>Loading appointments...</Text>
          </View>
        ) : appointments.length > 0 ? (
          <>
            {appointments.map(appointment => renderAppointmentCard(appointment))}
          </>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={80} color={COLORS.gray300} />
            <Text style={styles.emptyText}>No appointments found</Text>
            <Text style={styles.emptySubtext}>
              {filter === 'upcoming' 
                ? 'You have no upcoming appointments scheduled'
                : filter === 'past'
                ? 'You have no past appointments'
                : 'You have no appointments in your history'}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  headerTop: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: COLORS.gray50,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  filterButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  filterText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  appointmentCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray100,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  dateIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateText: {
    flex: 1,
  },
  dateDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dateTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  appointmentBody: {
    gap: 12,
  },
  infoSection: {
    marginBottom: 4,
  },
  doctorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  doctorDetails: {
    marginLeft: 12,
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  doctorSpecialization: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  patientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
  },
  patientText: {
    fontSize: 14,
    color: '#1E88E5',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.text,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF6B6B',
  },
  notesText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  feeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  appointmentFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray100,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  actionButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#FF6B6B',
    gap: 6,
  },
  actionButtonOutlineText: {
    color: '#FF6B6B',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray400,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});

export default RemindersScreen;
