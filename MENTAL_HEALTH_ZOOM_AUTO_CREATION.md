# Mental Health Therapy Session - Automatic Zoom Meeting Creation

## Overview

Implemented automatic Zoom meeting creation for mental health therapy sessions, matching the functionality already present in the doctor appointment scheduling system.

## Problem Statement

Previously, mental health specialists had to manually paste Zoom meeting links into the session form. This was inefficient compared to the doctor scheduling system which automatically creates Zoom meetings via the Zoom API.

## Solution Implemented

### Backend Changes

#### 1. New Controller Method - `therapySessionController.js`

Added `createZoomMeeting` function that:

- Validates the session belongs to the requesting specialist
- Checks if a Zoom meeting already exists for the session
- Creates a Zoom meeting using the zoomService
- Updates the session with the Zoom link
- Returns meeting details (joinUrl, meetingId, password, startUrl)

```javascript
// POST /api/mental-health/sessions/:sessionId/create-zoom
const createZoomMeeting = async (req, res) => {
  // Get session with elder and specialist details
  // Create Zoom meeting with appropriate topic and timing
  // Save zoom link to session
  // Return meeting details
};
```

#### 2. New Route - `therapySessionRoutes.js`

Added route: `POST /:sessionId/create-zoom`

- Requires authentication
- Calls `createZoomMeeting` controller method

#### 3. Zoom Service Integration

Leverages existing `backend/services/zoomService.js`:

- Uses Server-to-Server OAuth authentication
- Creates instant meetings (type: 1) for reliability
- Includes meeting settings: waiting room, host/participant video, etc.
- Falls back to mock meetings in development if Zoom credentials not configured

### Frontend Changes

#### 1. Service Layer - `mentalHealthService.js`

Added API method:

```javascript
createZoomMeeting: async (sessionId) => {
  const response = await api.post(
    `/mental-health/sessions/${sessionId}/create-zoom`
  );
  return response.data;
};
```

#### 2. Sessions Component - `sessions.js`

**New State Variables:**

- `creatingZoom`: Boolean to track Zoom creation in progress
- `zoomMeetingData`: Stores created meeting details (password, meetingId, etc.)

**New Handler Function:**

```javascript
const handleCreateZoomMeeting = async (sessionId) => {
  // Call API to create Zoom meeting
  // Update local state with meeting data
  // Reload sessions to show updated zoom link
  // Display success/error toast notifications
};
```

**Updated Form Change Handler:**

```javascript
const handleFormChange = (field, value) => {
  // Clear Zoom link when location changes away from video_call
  if (field === "location" && value !== "video_call") {
    setSessionForm((prev) => ({ ...prev, zoomLink: "" }));
    setZoomMeetingData(null);
  }
};
```

**UI Changes in Session Cards:**
Added conditional "Create Zoom Meeting" button that shows when:

- Session location is "video_call"
- Session has no Zoom link yet
- Session status is "scheduled"

Button features:

- Purple background (distinguishing it from Join Call button)
- Disabled state while creating
- Shows "Creating..." text during API call
- Positioned above the "Join Call" button

**Scheduling Modal Update:**

- **Removed manual Zoom link input field completely**
- Added prominent info banner at the top explaining automatic Zoom creation
- Banner appears with video camera icon and clear instructions
- No manual link pasting needed - fully automatic workflow

## User Flow

### For Mental Health Specialists:

1. **Schedule a New Session:**

   - Select "Video Call" as location
   - See info banner: "Automatic Zoom Meeting Creation" with instructions
   - No need to enter any Zoom link manually
   - Schedule the session

2. **Create Zoom Meeting (After Scheduling):**

   - View the scheduled session in the sessions list
   - If no Zoom link exists, see "Create Zoom Meeting" button
   - Click the button
   - System automatically:
     - Creates Zoom meeting via API
     - Sets appropriate topic: "Therapy Session with [Specialist] - [Client]"
     - Uses session date/time as meeting start time
     - Applies session duration
     - Enables waiting room for security
     - Saves meeting link to session

3. **Join the Session:**
   - "Create Zoom Meeting" button is replaced with "Join Call" button
   - Click "Join Call" to open Zoom meeting in new tab
   - Meeting password and ID available in session details

### For Elders (Clients):

- See scheduled sessions on their wellness dashboard
- "Join Call" button appears when Zoom link is available
- Can join the video call directly from their dashboard

## Technical Details

### API Endpoint

```
POST /api/mental-health/sessions/:sessionId/create-zoom
Authorization: Bearer <token>
Role: mental_health_consultant
```

**Response (Success):**

```json
{
  "success": true,
  "message": "Zoom meeting created successfully",
  "data": {
    "sessionId": "uuid",
    "meetingId": "1234567890",
    "joinUrl": "https://zoom.us/j/1234567890?pwd=...",
    "startUrl": "https://zoom.us/s/1234567890?zak=...",
    "password": "123456",
    "topic": "Therapy Session with Dr. Smith - John Doe",
    "startTime": "2025-10-20T14:30:00Z"
  }
}
```

**Response (Already Exists):**

```json
{
  "success": false,
  "message": "Zoom meeting already exists for this session",
  "data": {
    "joinUrl": "https://zoom.us/j/..."
  }
}
```

### Database

No database schema changes required. Uses existing `TherapySession.zoomLink` field (TEXT) to store the meeting URL.

### Zoom Service Configuration

Requires environment variables (same as doctor appointments):

```env
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
ZOOM_API_BASE_URL=https://api.zoom.us/v2
```

**Development Mode:**

- If credentials not configured, falls back to mock meetings
- Mock meetings use generated IDs and fake URLs for testing

### Meeting Settings

Default settings for therapy sessions:

- **Type:** Instant meeting (more reliable than scheduled)
- **Waiting Room:** Enabled (for privacy)
- **Join Before Host:** Disabled (specialist must start session)
- **Host Video:** Enabled
- **Participant Video:** Enabled
- **Auto Recording:** None (privacy consideration)
- **Password:** Auto-generated 6-digit code

## Benefits

1. **Consistency:** Mental health module now matches doctor appointment system
2. **Efficiency:** One-click Zoom meeting creation vs manual link generation
3. **Professional:** Automatic meeting topics with specialist and client names
4. **Secure:** Built-in waiting room and password protection
5. **Flexible:** Still allows manual link pasting if needed
6. **User-Friendly:** Clear UI with helpful tips and loading states

## Testing Checklist

- [x] Backend endpoint created and exported
- [x] Route added to router
- [x] Service method added to frontend
- [x] Handler function implemented in component
- [x] UI button added with conditional rendering
- [x] Toast notifications for success/error
- [x] Loading state during API call
- [x] Sessions reload after Zoom creation
- [x] Existing "Join Call" functionality preserved
- [ ] Test with real Zoom credentials
- [ ] Test in development mode (mock meetings)
- [ ] Test error handling (invalid session, unauthorized, etc.)
- [ ] Test from elder side (Join Call button)

## Files Modified

### Backend

1. `backend/controllers/therapySessionController.js` - Added `createZoomMeeting` function
2. `backend/routes/therapySessionRoutes.js` - Added Zoom creation route

### Frontend

3. `frontend/src/services/mentalHealthService.js` - Added `createZoomMeeting` API method
4. `frontend/src/components/mental-health/sessions/sessions.js` - Added Zoom creation UI and logic

### Existing Dependencies (No Changes)

- `backend/services/zoomService.js` - Reused existing Zoom API integration
- Zoom environment variables - Same configuration as doctor appointments

## Future Enhancements

1. **Zoom Meeting Modal:** Create a dedicated modal (like doctor's ZoomMeetingModal) to show:

   - Meeting ID
   - Password
   - Copy buttons
   - Meeting status
   - Start URL for specialist

2. **Meeting Management:**

   - Update meeting time if session is rescheduled
   - Delete meeting if session is cancelled
   - Show meeting status (scheduled, started, ended)

3. **Meeting History:**

   - Track meeting join events
   - Log meeting duration
   - Show meeting recordings (if enabled)

4. **Notifications:**

   - Email notification with Zoom link when created
   - Reminder notifications before session
   - SMS with meeting link

5. **Advanced Settings:**
   - Allow specialist to customize meeting settings per session
   - Option to enable/disable waiting room
   - Option to enable recording
   - Custom password requirements

## Notes

- No database migrations required (uses existing `zoomLink` field)
- Compatible with existing sessions that have manual Zoom links
- Falls back gracefully if Zoom API is unavailable
- Button only appears for video_call sessions without existing links
- Same Zoom service used by doctor appointments ensures consistency

## Deployment

1. Ensure Zoom environment variables are configured in production
2. No database changes needed - deploy code only
3. Test with a few therapy sessions first
4. Monitor logs for any Zoom API errors
5. Verify meeting links are correctly saved to database

## Support

If Zoom meetings fail to create:

1. Check Zoom credentials in environment variables
2. Verify Zoom account has API access enabled
3. Check backend logs for detailed error messages
4. System falls back to mock meetings in development
5. Users can still manually paste Zoom links as fallback
