// ElderlinkMobile/src/screens/ZoomMeetingsScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ZoomMeetingCard from '../components/ZoomMeetingCard';

const API_URL = 'http://YOUR_SERVER_IP:5000/api'; // Update with your server IP

const ZoomMeetingsScreen = ({ navigation }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchZoomMeetings();
  }, []);

  const fetchZoomMeetings = async () => {
    try {
      setError(null);
      
      // Get token from AsyncStorage
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        Alert.alert('Error', 'Please login to view Zoom meetings');
        navigation.navigate('Login');
        return;
      }

      console.log('📱 Fetching Zoom meetings...');

      const response = await axios.get(
        `${API_URL}/mobile/zoom-meetings/upcoming`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setMeetings(response.data.data.meetings || []);
        console.log(`✅ Loaded ${response.data.data.meetings.length} meetings`);
      } else {
        setError(response.data.message || 'Failed to load meetings');
      }
    } catch (err) {
      console.error('❌ Error fetching meetings:', err);
      setError(err.response?.data?.message || 'Failed to load Zoom meetings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchZoomMeetings();
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="video-library" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No Upcoming Meetings</Text>
      <Text style={styles.emptyText}>
        {error 
          ? error
          : 'You don\'t have any upcoming Zoom meetings scheduled.\nWhen a doctor creates a meeting for your elder\'s health session, it will appear here.'
        }
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={fetchZoomMeetings}>
        <Icon name="refresh" size={20} color="#FFFFFF" />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  const renderMeeting = ({ item }) => (
    <ZoomMeetingCard meeting={item} />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>Loading Zoom meetings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Icon name="videocam" size={28} color="#667EEA" />
          <Text style={styles.headerTitle}>Zoom Meetings</Text>
        </View>
        <TouchableOpacity onPress={fetchZoomMeetings}>
          <Icon name="refresh" size={24} color="#667EEA" />
        </TouchableOpacity>
      </View>

      {/* Meeting Count */}
      {meetings.length > 0 && (
        <View style={styles.countBanner}>
          <Icon name="info-outline" size={18} color="#667EEA" />
          <Text style={styles.countText}>
            You have {meetings.length} upcoming {meetings.length === 1 ? 'meeting' : 'meetings'}
          </Text>
        </View>
      )}

      {/* Meetings List */}
      <FlatList
        data={meetings}
        renderItem={renderMeeting}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#667EEA']}
            tintColor="#667EEA"
          />
        }
        contentContainerStyle={
          meetings.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  countBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 8,
  },
  countText: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
    marginLeft: 8,
  },
  listContainer: {
    paddingVertical: 8,
  },
  emptyListContainer: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667EEA',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 24,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  refreshButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
});

export default ZoomMeetingsScreen;
