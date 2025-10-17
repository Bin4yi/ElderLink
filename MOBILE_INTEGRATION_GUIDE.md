# Mobile App Integration Guide - Zoom Meetings

This guide shows you how to integrate the Zoom meeting functionality into your React Native mobile app.

## 📱 Overview

The mobile app displays Zoom meeting information WITHOUT Firebase, using:
- **REST API** - Fetch meeting data from backend
- **Socket.IO** - Real-time updates when meetings are created/started
- **React Native Cards** - Beautiful UI components to display meetings

## 🗂️ Files Created

### Backend Files (Already Created)
1. `backend/controllers/mobileNotificationController.js` - Mobile API endpoints
2. `backend/routes/mobileNotifications.js` - Mobile routes
3. `backend/services/notificationService.js` - Database notifications (NO Firebase)

### Mobile Files (Already Created)
1. `ElderlinkMobile/src/components/ZoomMeetingCard.js` - Card component
2. `ElderlinkMobile/src/screens/ZoomMeetingsScreen.js` - Full screen to list meetings
3. `ElderlinkMobile/src/services/zoomService.js` - API service layer

## 🚀 Step 1: Update Server IP

Update the API URL in your mobile app files:

### In `zoomService.js`:
```javascript
const API_URL = 'http://YOUR_SERVER_IP:5000/api';
// Example: const API_URL = 'http://192.168.1.100:5000/api';
```

### In `ZoomMeetingsScreen.js`:
```javascript
const API_URL = 'http://YOUR_SERVER_IP:5000/api';
// Example: const API_URL = 'http://192.168.1.100:5000/api';
```

### In `socketService.js` (existing file):
```javascript
const SOCKET_URL = 'http://YOUR_SERVER_IP:5000';
// Example: const SOCKET_URL = 'http://192.168.1.100:5000';
```

**How to find your server IP:**
- Windows: Open Command Prompt and run `ipconfig`, look for IPv4 Address
- Mac/Linux: Open Terminal and run `ifconfig` or `ip addr`

## 🚀 Step 2: Add Navigation Route

Add the ZoomMeetingsScreen to your app navigation.

### If using React Navigation (Stack Navigator):

```javascript
// ElderlinkMobile/App.js or navigation file
import ZoomMeetingsScreen from './src/screens/ZoomMeetingsScreen';

// In your Stack.Navigator
<Stack.Screen 
  name="ZoomMeetings" 
  component={ZoomMeetingsScreen}
  options={{
    headerShown: false // We use custom header
  }}
/>
```

### If using Drawer/Tab Navigator:

```javascript
import ZoomMeetingsScreen from './src/screens/ZoomMeetingsScreen';
import Icon from 'react-native-vector-icons/MaterialIcons';

// In your Drawer/Tab Navigator
<Drawer.Screen
  name="ZoomMeetings"
  component={ZoomMeetingsScreen}
  options={{
    title: 'Zoom Meetings',
    drawerIcon: ({ color, size }) => (
      <Icon name="videocam" size={size} color={color} />
    ),
  }}
/>
```

## 🚀 Step 3: Add Button to Navigate to Zoom Meetings

### Example 1: From Home/Dashboard Screen

```javascript
// ElderlinkMobile/src/screens/HomeScreen.js
import { TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Your existing home screen content */}
      
      {/* Add this button */}
      <TouchableOpacity
        style={styles.zoomButton}
        onPress={() => navigation.navigate('ZoomMeetings')}
      >
        <Icon name="videocam" size={24} color="#FFFFFF" />
        <Text style={styles.zoomButtonText}>View Zoom Meetings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  zoomButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667EEA',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  zoomButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
});
```

### Example 2: From Notifications Screen

```javascript
// When user taps a Zoom notification
const handleNotificationPress = (notification) => {
  if (notification.type === 'zoom_meeting_created') {
    navigation.navigate('ZoomMeetings');
  }
};
```

## 🚀 Step 4: Enable Real-Time Updates with Socket.IO

### Option A: Connect Socket.IO on App Startup

```javascript
// ElderlinkMobile/App.js
import { useEffect } from 'react';
import socketService from './src/services/socketService';

function App() {
  useEffect(() => {
    // Connect to Socket.IO when app starts
    socketService.connect();

    // Disconnect when app closes
    return () => {
      socketService.disconnect();
    };
  }, []);

  return (
    // Your app navigation
  );
}
```

### Option B: Listen for Zoom Meeting Events in Screen

```javascript
// ElderlinkMobile/src/screens/ZoomMeetingsScreen.js
import { useEffect } from 'react';
import socketService from '../services/socketService';

const ZoomMeetingsScreen = ({ navigation }) => {
  // ... existing state ...

  useEffect(() => {
    // Connect if not already connected
    if (!socketService.getConnectionStatus()) {
      socketService.connect();
    }

    // Listen for new Zoom meetings
    const unsubscribeCreated = socketService.on('zoom-meeting-created', (data) => {
      console.log('🎉 New Zoom meeting created!', data);
      // Refresh the meetings list
      fetchZoomMeetings();
      
      // Show alert
      Alert.alert(
        'New Zoom Meeting',
        `A new meeting has been scheduled for ${data.sessionDate}`,
        [{ text: 'View', onPress: () => fetchZoomMeetings() }]
      );
    });

    // Listen for meeting started
    const unsubscribeStarted = socketService.on('zoom-meeting-started', (data) => {
      console.log('▶️ Zoom meeting started!', data);
      fetchZoomMeetings();
    });

    // Listen for meeting completed
    const unsubscribeCompleted = socketService.on('zoom-meeting-completed', (data) => {
      console.log('✅ Zoom meeting completed!', data);
      fetchZoomMeetings();
    });

    // Cleanup
    return () => {
      unsubscribeCreated();
      unsubscribeStarted();
      unsubscribeCompleted();
    };
  }, []);

  // ... rest of component ...
};
```

## 🚀 Step 5: Install Required Dependencies

Make sure you have these dependencies installed:

```bash
cd ElderlinkMobile

# Install dependencies if not already installed
npm install socket.io-client
npm install @react-native-async-storage/async-storage
npm install axios
npm install react-native-vector-icons
```

### Link vector icons (if not already done):

```bash
# For iOS
cd ios && pod install && cd ..

# For Android - add to android/app/build.gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

## 🚀 Step 6: Test the Integration

### Test Workflow:

1. **Start Backend Server**:
   ```bash
   cd backend
   npm start
   ```

2. **Start Mobile App**:
   ```bash
   cd ElderlinkMobile
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

3. **Login as Family Member** in mobile app

4. **Login as Doctor** in web frontend (http://localhost:3000)

5. **Create Zoom Meeting** (Doctor):
   - Go to `/doctor/zoom-meetings`
   - Find a session
   - Click "Create Zoom Meeting"
   - Click "Send Links"

6. **Check Mobile App**:
   - Navigate to Zoom Meetings screen
   - You should see the meeting card
   - If Socket.IO is working, it appears instantly
   - Otherwise, pull-to-refresh

7. **Join Meeting** (Mobile):
   - Tap "Join Zoom Meeting" button
   - Zoom app should open (or browser if Zoom not installed)

## 🎨 UI Components

### ZoomMeetingCard Features:
- ✅ Meeting date and time display
- ✅ Elder and doctor information
- ✅ Zoom meeting ID (tap to copy)
- ✅ Zoom password (tap to copy)
- ✅ Join button that opens Zoom URL
- ✅ Status badges (scheduled, in-progress, completed)
- ✅ "Today's Session" badge
- ✅ Beautiful Material Design styling

### ZoomMeetingsScreen Features:
- ✅ Pull-to-refresh
- ✅ Empty state with helpful message
- ✅ Meeting count banner
- ✅ Manual refresh button
- ✅ Loading indicator
- ✅ Error handling
- ✅ Navigation header

## 🔧 Customization

### Change Card Styling:

Edit `ElderlinkMobile/src/components/ZoomMeetingCard.js`:

```javascript
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF', // Change card background
    borderRadius: 16, // Change corner radius
    // ... modify other styles
  },
});
```

### Add More Meeting Actions:

```javascript
// In ZoomMeetingCard.js, add more buttons:
<TouchableOpacity
  style={styles.reminderButton}
  onPress={() => scheduleReminder(meeting)}
>
  <Icon name="alarm" size={20} color="#667EEA" />
  <Text>Set Reminder</Text>
</TouchableOpacity>
```

### Filter Meetings by Date:

```javascript
// In ZoomMeetingsScreen.js, add filter tabs:
const [filter, setFilter] = useState('all'); // all, today, upcoming

const filteredMeetings = meetings.filter(meeting => {
  if (filter === 'today') return meeting.isToday;
  if (filter === 'upcoming') return !meeting.isToday;
  return true;
});
```

## 🐛 Troubleshooting

### Issue: "No Zoom Meeting Scheduled" appears even though meeting exists

**Solution:**
1. Check if backend is running: `curl http://YOUR_SERVER_IP:5000/api/health`
2. Check token in AsyncStorage: Console should show token on app load
3. Check API response: Look for errors in Metro bundler logs
4. Verify family member is linked to elder with monthly session

### Issue: Can't join Zoom meeting

**Solution:**
1. Install Zoom app on device/emulator
2. Check if Zoom URL is valid (should start with https://zoom.us/)
3. Check console logs when tapping "Join Zoom Meeting"

### Issue: Real-time updates not working

**Solution:**
1. Check Socket.IO connection status: `socketService.getConnectionStatus()`
2. Verify Socket.IO is running on backend (should see "Socket.IO configured" message)
3. Check if token is being sent in Socket.IO auth
4. Look for Socket.IO error messages in Metro bundler

### Issue: Cards not displaying correctly

**Solution:**
1. Make sure react-native-vector-icons is installed and linked
2. Check if AsyncStorage has valid token
3. Pull-to-refresh to fetch latest data
4. Check backend logs for API errors

## 📊 API Endpoints Used

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/mobile/zoom-meetings/upcoming` | GET | Get all upcoming meetings |
| `/api/mobile/zoom-meetings/:sessionId` | GET | Get single meeting |
| `/api/mobile/notifications` | GET | Get notifications |
| `/api/mobile/notifications/:id/read` | PUT | Mark notification as read |
| `/api/mobile/notifications/read-all` | PUT | Mark all as read |

## 🎯 Next Steps

1. **Add Push Notifications** (Optional):
   - If you want notifications when app is closed
   - Consider using Expo Notifications or Firebase Cloud Messaging
   - Backend already stores notifications in database

2. **Add Calendar Integration**:
   - Export meeting to device calendar
   - Use `react-native-calendar-events`

3. **Add Reminders**:
   - 24 hours before meeting
   - 1 hour before meeting
   - Use `react-native-push-notification`

4. **Add Meeting History**:
   - Show completed meetings
   - View session notes and prescriptions

5. **Add Video Recording** (if needed):
   - Zoom API supports cloud recordings
   - Display recording links after meeting

## ✅ Checklist

- [ ] Update server IP in all files
- [ ] Add ZoomMeetingsScreen to navigation
- [ ] Add button to navigate to screen
- [ ] Install dependencies
- [ ] Configure Socket.IO connection
- [ ] Test on device/emulator
- [ ] Verify real-time updates work
- [ ] Test joining Zoom meeting
- [ ] Test pull-to-refresh
- [ ] Test empty state

## 📚 Related Documentation

- `ZOOM_SETUP_GUIDE.md` - Backend Zoom configuration
- `ZOOM_IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `QUICK_START_ZOOM.md` - Quick reference guide

---

**Need Help?**
- Check backend logs: `npm start` in backend folder
- Check mobile logs: Metro bundler console
- Test API manually: Use Postman or curl
- Check Socket.IO: Look for "Socket.IO connected" message
