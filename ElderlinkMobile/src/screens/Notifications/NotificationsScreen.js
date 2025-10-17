// ElderlinkMobile/src/screens/Notifications/NotificationsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'http://YOUR_BACKEND_IP:5000/api'; // Change to your backend IP

const NotificationsScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      if (!token) {
        Alert.alert('Error', 'Please login first');
        return;
      }

      const response = await axios.get(`${API_URL}/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setNotifications(response.data.data.notifications || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      Alert.alert('Error', 'Failed to load notifications');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const handleNotificationPress = async (notification) => {
    try {
      const data = JSON.parse(notification.data);

      // Mark as read
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `${API_URL}/notifications/${notification.id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Handle different notification types
      switch (notification.type) {
        case 'zoom_link':
          handleZoomLink(data);
          break;
        case 'session_completed':
          Alert.alert(
            'Session Completed',
            'Your health session has been completed. Check the app for details.'
          );
          break;
        case 'prescription_ready':
          Alert.alert(
            'Prescription Ready',
            `Your prescription is ready at ${data.pharmacyName}`
          );
          break;
        default:
          Alert.alert('Notification', notification.message);
      }

      // Refresh to update read status
      fetchNotifications();
    } catch (error) {
      console.error('Error handling notification:', error);
      Alert.alert('Error', 'Failed to process notification');
    }
  };

  const handleZoomLink = (data) => {
    Alert.alert(
      '📹 Join Zoom Meeting',
      `Your health session is scheduled for ${data.sessionDate} at ${data.sessionTime}\n\nWould you like to join the meeting?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Join Meeting',
          onPress: () => {
            if (data.zoomJoinUrl) {
              Linking.openURL(data.zoomJoinUrl).catch(err =>
                Alert.alert('Error', 'Failed to open Zoom link')
              );
            }
          }
        }
      ]
    );
  };

  const renderNotificationCard = ({ item }) => {
    const data = item.data ? JSON.parse(item.data) : {};
    const isUnread = !item.isRead;

    return (
      <TouchableOpacity
        style={[styles.card, isUnread && styles.unreadCard]}
        onPress={() => handleNotificationPress(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.typeIcon}>{getTypeIcon(item.type)}</Text>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardTime}>
              {new Date(item.createdAt).toLocaleString()}
            </Text>
          </View>
          {isUnread && <View style={styles.unreadDot} />}
        </View>

        <Text style={styles.cardMessage}>{item.message}</Text>

        {/* Zoom Link Specific Card */}
        {item.type === 'zoom_link' && (
          <View style={styles.zoomInfo}>
            <Text style={styles.zoomLabel}>📅 Session Date:</Text>
            <Text style={styles.zoomValue}>{data.sessionDate}</Text>
            
            <Text style={styles.zoomLabel}>⏰ Time:</Text>
            <Text style={styles.zoomValue}>{data.sessionTime}</Text>
            
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => handleZoomLink(data)}
            >
              <Text style={styles.joinButtonText}>🎥 Join Zoom Meeting</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Session Completed Card */}
        {item.type === 'session_completed' && (
          <View style={styles.completedInfo}>
            <Text style={styles.completedText}>✅ Session completed with {data.doctorName}</Text>
            {data.prescriptionAvailable && (
              <Text style={styles.prescriptionText}>
                💊 Prescription sent to {data.pharmacyName}
              </Text>
            )}
          </View>
        )}

        {/* Prescription Ready Card */}
        {item.type === 'prescription_ready' && (
          <View style={styles.prescriptionInfo}>
            <Text style={styles.pharmacyText}>🏥 {data.pharmacyName}</Text>
            <Text style={styles.readyText}>Your prescription is ready for pickup</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'zoom_link':
        return '📹';
      case 'session_completed':
        return '✅';
      case 'prescription_ready':
        return '💊';
      case 'session_reminder':
        return '⏰';
      default:
        return '📢';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Text style={styles.headerSubtitle}>
          {notifications.filter(n => !n.isRead).length} unread
        </Text>
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔔</Text>
          <Text style={styles.emptyText}>No notifications yet</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotificationCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 40
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white'
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 4
  },
  listContainer: {
    padding: 15
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#667eea'
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  typeIcon: {
    fontSize: 24,
    marginRight: 12
  },
  cardTitleContainer: {
    flex: 1
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3748'
  },
  cardTime: {
    fontSize: 12,
    color: '#718096',
    marginTop: 2
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#667eea'
  },
  cardMessage: {
    fontSize: 14,
    color: '#4a5568',
    lineHeight: 20
  },
  zoomInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#e6f7ff',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2d8cff'
  },
  zoomLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4a5568',
    marginTop: 8
  },
  zoomValue: {
    fontSize: 14,
    color: '#2d3748',
    marginBottom: 4
  },
  joinButton: {
    backgroundColor: '#2d8cff',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center'
  },
  joinButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15
  },
  completedInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#d4edda',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745'
  },
  completedText: {
    fontSize: 14,
    color: '#155724',
    marginBottom: 4
  },
  prescriptionText: {
    fontSize: 13,
    color: '#155724'
  },
  prescriptionInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ffc107'
  },
  pharmacyText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4
  },
  readyText: {
    fontSize: 13,
    color: '#856404'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyText: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center'
  }
});

export default NotificationsScreen;
