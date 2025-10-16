import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../utils/colors';

import Card from './common/Card';

/**
 * Appointment Card component for displaying appointment information
 * Optimized for elderly users with large text and clear layout
 */
const AppointmentCard = ({
  appointment,
  onPress,
  onJoinMeeting,
  style
}) => {
  if (!appointment) return null;

  const {
    doctorName,
    appointmentDate,
    type,
    status,
    priority,
    zoomJoinUrl,
    notes
  } = appointment;

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
    return { dateStr, timeStr };
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'cancelled':
        return COLORS.error;
      case 'completed':
        return COLORS.gray500;
      default:
        return COLORS.info;
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'alert-circle';
      case 'high':
        return 'arrow-up-circle';
      case 'medium':
        return 'remove-circle';
      case 'low':
        return 'arrow-down-circle';
      default:
        return 'ellipse';
    }
  };

  const { dateStr, timeStr } = formatDateTime(appointmentDate);
  const statusColor = getStatusColor(status);
  const priorityIcon = getPriorityIcon(priority);

  const isUpcoming = new Date(appointmentDate) > new Date();
  const canJoinMeeting = zoomJoinUrl && isUpcoming && status === 'confirmed';

  return (
    <Card
      style={[styles.card, style]}
      onPress={onPress}
    >
      {/* Header with doctor and status */}
      <View style={styles.header}>
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>Dr. {doctorName}</Text>
          <Text style={styles.appointmentType}>{type}</Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
          
          {priority !== 'medium' && (
            <Ionicons
              name={priorityIcon}
              size={20}
              color={statusColor}
              style={styles.priorityIcon}
            />
          )}
        </View>
      </View>

      {/* Date and Time */}
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeItem}>
          <Ionicons name="calendar" size={24} color={COLORS.primary} />
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
        
        <View style={styles.dateTimeItem}>
          <Ionicons name="time" size={24} color={COLORS.primary} />
          <Text style={styles.timeText}>{timeStr}</Text>
        </View>
      </View>

      {/* Notes */}
      {notes && (
        <View style={styles.notesContainer}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{notes}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {canJoinMeeting && (
          <TouchableOpacity
            style={styles.joinButton}
            onPress={() => onJoinMeeting && onJoinMeeting(appointment)}
          >
            <Ionicons name="videocam" size={20} color={COLORS.white} />
            <Text style={styles.joinButtonText}>Join Meeting</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.detailsButton}
          onPress={onPress}
        >
          <Text style={styles.detailsButtonText}>View Details</Text>
          <Ionicons name="chevron-forward" size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  
  doctorInfo: {
    flex: 1,
  },
  
  doctorName: {
    fontSize: 22,
    fontFamily: 'OpenSans-Bold',
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  
  appointmentType: {
    fontSize: 18,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  
  statusContainer: {
    alignItems: 'flex-end',
  },
  
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 4,
  },
  
  statusText: {
    fontSize: 14,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.white,
    textTransform: 'capitalize',
  },
  
  priorityIcon: {
    marginTop: 4,
  },
  
  dateTimeContainer: {
    backgroundColor: COLORS.gray50,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  
  dateTimeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  dateText: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  
  timeText: {
    fontSize: 18,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginLeft: 12,
  },
  
  notesContainer: {
    marginBottom: 16,
  },
  
  notesLabel: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  
  notesText: {
    fontSize: 16,
    fontFamily: 'OpenSans-Regular',
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  
  joinButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.success,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  
  joinButtonText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.primary,
    flex: 1,
    justifyContent: 'center',
  },
  
  detailsButtonText: {
    fontSize: 16,
    fontFamily: 'OpenSans-SemiBold',
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 8,
  },
});


export default AppointmentCard;