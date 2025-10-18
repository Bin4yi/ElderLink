// ElderlinkMobile/src/components/ZoomMeetingCard.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ZoomMeetingCard = ({ meeting }) => {
  const handleJoinMeeting = () => {
    if (meeting?.zoom?.joinUrl) {
      Linking.openURL(meeting.zoom.joinUrl).catch(err => {
        Alert.alert('Error', 'Failed to open Zoom meeting link');
        console.error('Failed to open URL:', err);
      });
    } else {
      Alert.alert('No Zoom Link', 'No Zoom meeting link available for this session');
    }
  };

  const copyToClipboard = (text, label) => {
    // Note: For React Native, you'll need @react-native-clipboard/clipboard
    // import Clipboard from '@react-native-clipboard/clipboard';
    // Clipboard.setString(text);
    Alert.alert('Copied', `${label} copied to clipboard`);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return '#3B82F6'; // Blue
      case 'in-progress':
        return '#F59E0B'; // Orange
      case 'completed':
        return '#10B981'; // Green
      default:
        return '#6B7280'; // Gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
        return 'schedule';
      case 'in-progress':
        return 'videocam';
      case 'completed':
        return 'check-circle';
      default:
        return 'info';
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="video-call" size={24} color="#667EEA" />
          <Text style={styles.headerTitle}>Zoom Health Session</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(meeting.status) }]}>
          <Icon name={getStatusIcon(meeting.status)} size={14} color="#FFFFFF" />
          <Text style={styles.statusText}>{meeting.status?.toUpperCase()}</Text>
        </View>
      </View>

      {/* Date & Time */}
      <View style={styles.dateTimeContainer}>
        <View style={styles.dateTimeRow}>
          <Icon name="calendar-today" size={18} color="#6B7280" />
          <Text style={styles.dateTimeText}>{meeting.displayDate}</Text>
        </View>
        <View style={styles.dateTimeRow}>
          <Icon name="access-time" size={18} color="#6B7280" />
          <Text style={styles.dateTimeText}>{meeting.displayTime} ({meeting.duration} min)</Text>
        </View>
      </View>

      {/* Elder & Doctor Info */}
      <View style={styles.infoSection}>
        <View style={styles.infoRow}>
          <Icon name="person" size={18} color="#667EEA" />
          <Text style={styles.infoLabel}>Patient:</Text>
          <Text style={styles.infoValue}>{meeting.elder?.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Icon name="local-hospital" size={18} color="#667EEA" />
          <Text style={styles.infoLabel}>Doctor:</Text>
          <Text style={styles.infoValue}>{meeting.doctor?.name}</Text>
        </View>
      </View>

      {/* Zoom Details */}
      {meeting.zoom && (
        <View style={styles.zoomDetails}>
          <Text style={styles.zoomTitle}>Meeting Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Meeting ID:</Text>
            <TouchableOpacity onPress={() => copyToClipboard(meeting.zoom.meetingId, 'Meeting ID')}>
              <View style={styles.detailValueContainer}>
                <Text style={styles.detailValue}>{meeting.zoom.meetingId}</Text>
                <Icon name="content-copy" size={16} color="#667EEA" />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Password:</Text>
            <TouchableOpacity onPress={() => copyToClipboard(meeting.zoom.password, 'Password')}>
              <View style={styles.detailValueContainer}>
                <Text style={styles.detailValue}>{meeting.zoom.password}</Text>
                <Icon name="content-copy" size={16} color="#667EEA" />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Today Badge */}
      {meeting.isToday && (
        <View style={styles.todayBadge}>
          <Icon name="today" size={16} color="#FFFFFF" />
          <Text style={styles.todayText}>Today's Session</Text>
        </View>
      )}

      {/* Join Button */}
      <TouchableOpacity 
        style={[
          styles.joinButton,
          meeting.status === 'completed' && styles.joinButtonDisabled
        ]}
        onPress={handleJoinMeeting}
        disabled={meeting.status === 'completed'}
      >
        <Icon name="videocam" size={20} color="#FFFFFF" />
        <Text style={styles.joinButtonText}>
          {meeting.status === 'completed' ? 'Session Completed' : 'Join Zoom Meeting'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  dateTimeContainer: {
    marginBottom: 16,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  dateTimeText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  infoSection: {
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginLeft: 8,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
  },
  zoomDetails: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#667EEA',
  },
  zoomTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  detailLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailValue: {
    fontSize: 13,
    color: '#1F2937',
    fontWeight: '600',
    marginRight: 8,
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  todayText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  joinButton: {
    backgroundColor: '#667EEA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  joinButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0,
    elevation: 0,
  },
  joinButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default ZoomMeetingCard;
