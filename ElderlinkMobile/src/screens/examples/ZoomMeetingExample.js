// ElderlinkMobile/src/screens/examples/ZoomMeetingExample.js
// This is an example showing how to use ZoomMeetingCard in any screen

import React, { useState, useEffect } from 'react';
import { View, ScrollView, Text, StyleSheet, ActivityIndicator } from 'react-native';
import ZoomMeetingCard from '../components/ZoomMeetingCard';
import zoomService from '../services/zoomService';

/**
 * EXAMPLE 1: Display Zoom Meetings in Any Screen
 * 
 * This example shows how to fetch and display Zoom meetings
 * in any screen of your app (Dashboard, Notifications, etc.)
 */
const ZoomMeetingExample = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const data = await zoomService.getUpcomingZoomMeetings();
      setMeetings(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Upcoming Zoom Meetings</Text>
      
      {meetings.length === 0 ? (
        <Text style={styles.emptyText}>No upcoming meetings</Text>
      ) : (
        meetings.map((meeting) => (
          <ZoomMeetingCard key={meeting.id} meeting={meeting} />
        ))
      )}
    </ScrollView>
  );
};

/**
 * EXAMPLE 2: Display Single Zoom Meeting
 * 
 * This example shows how to display a single meeting
 * (e.g., on a session details screen)
 */
const SingleMeetingExample = ({ sessionId }) => {
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeeting();
  }, [sessionId]);

  const fetchMeeting = async () => {
    try {
      setLoading(true);
      const data = await zoomService.getZoomMeetingById(sessionId);
      
      if (data.hasZoomMeeting) {
        setMeeting(data.session);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <ActivityIndicator />;
  if (!meeting) return <Text>No Zoom meeting for this session</Text>;

  return <ZoomMeetingCard meeting={meeting} />;
};

/**
 * EXAMPLE 3: Display Only Today's Meetings
 * 
 * Filter to show only meetings happening today
 */
const TodaysMeetingsExample = () => {
  const [todayMeetings, setTodayMeetings] = useState([]);

  useEffect(() => {
    fetchTodaysMeetings();
  }, []);

  const fetchTodaysMeetings = async () => {
    try {
      const allMeetings = await zoomService.getUpcomingZoomMeetings();
      
      // Filter for today's meetings
      const today = allMeetings.filter(meeting => meeting.isToday);
      
      setTodayMeetings(today);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today's Sessions</Text>
      
      {todayMeetings.length === 0 ? (
        <Text style={styles.emptyText}>No meetings today</Text>
      ) : (
        todayMeetings.map(meeting => (
          <ZoomMeetingCard key={meeting.id} meeting={meeting} />
        ))
      )}
    </View>
  );
};

/**
 * EXAMPLE 4: Dashboard Widget - Next Meeting
 * 
 * Display the next upcoming meeting as a widget
 */
const NextMeetingWidget = () => {
  const [nextMeeting, setNextMeeting] = useState(null);

  useEffect(() => {
    fetchNextMeeting();
  }, []);

  const fetchNextMeeting = async () => {
    try {
      const meetings = await zoomService.getUpcomingZoomMeetings();
      
      if (meetings.length > 0) {
        // First meeting is the next one (backend sorts by date)
        setNextMeeting(meetings[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (!nextMeeting) {
    return (
      <View style={styles.widgetContainer}>
        <Text style={styles.widgetTitle}>Next Meeting</Text>
        <Text style={styles.widgetEmpty}>No upcoming meetings</Text>
      </View>
    );
  }

  return (
    <View style={styles.widgetContainer}>
      <Text style={styles.widgetTitle}>Next Meeting</Text>
      <ZoomMeetingCard meeting={nextMeeting} />
    </View>
  );
};

/**
 * EXAMPLE 5: With Real-Time Updates
 * 
 * Automatically refresh when new meetings are created
 */
const RealTimeMeetingsExample = () => {
  const [meetings, setMeetings] = useState([]);
  
  useEffect(() => {
    fetchMeetings();

    // Listen for Socket.IO events
    const socketService = require('../services/socketService').default;
    
    const unsubscribe = socketService.on('zoom-meeting-created', (data) => {
      console.log('New meeting created:', data);
      // Refresh meetings list
      fetchMeetings();
    });

    return () => unsubscribe();
  }, []);

  const fetchMeetings = async () => {
    try {
      const data = await zoomService.getUpcomingZoomMeetings();
      setMeetings(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {meetings.map(meeting => (
        <ZoomMeetingCard key={meeting.id} meeting={meeting} />
      ))}
    </ScrollView>
  );
};

/**
 * EXAMPLE 6: Custom Card with Additional Actions
 * 
 * Extend the ZoomMeetingCard with custom actions
 */
const CustomMeetingCard = ({ meeting, onViewDetails, onSetReminder }) => {
  return (
    <View>
      <ZoomMeetingCard meeting={meeting} />
      
      {/* Add custom buttons below the card */}
      <View style={styles.customActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onViewDetails(meeting)}
        >
          <Text>View Full Details</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onSetReminder(meeting)}
        >
          <Text>Set Reminder</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 32,
  },
  widgetContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  widgetEmpty: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  customActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    marginTop: -8,
    marginBottom: 16,
  },
  actionButton: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
});

// Export all examples
export default ZoomMeetingExample;
export {
  SingleMeetingExample,
  TodaysMeetingsExample,
  NextMeetingWidget,
  RealTimeMeetingsExample,
  CustomMeetingCard,
};

/**
 * HOW TO USE IN YOUR APP:
 * 
 * 1. Import the component:
 *    import ZoomMeetingCard from './src/components/ZoomMeetingCard';
 *    import zoomService from './src/services/zoomService';
 * 
 * 2. Fetch meetings:
 *    const meetings = await zoomService.getUpcomingZoomMeetings();
 * 
 * 3. Render cards:
 *    {meetings.map(meeting => (
 *      <ZoomMeetingCard key={meeting.id} meeting={meeting} />
 *    ))}
 * 
 * 4. Or use one of the examples above!
 */
