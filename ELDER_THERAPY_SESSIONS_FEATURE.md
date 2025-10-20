# Elder Therapy Sessions Feature

## Overview

Implemented a complete feature for elders to view their assigned therapy sessions on the Mental Wellness page. This allows elders to see their scheduled, completed, and upcoming therapy sessions with their mental health specialists.

## Backend Implementation

### 1. Controller Function

**File**: `backend/controllers/therapySessionController.js`

Added `getElderSessions` function:

```javascript
const getElderSessions = async (req, res) => {
  // Fetches all therapy sessions for an elder
  // Returns sessions with specialist information
  // Includes statistics (total, scheduled, completed, upcoming)
};
```

**Features**:

- Fetches sessions by `elderId` from authenticated user token
- Includes specialist details (name, email, phone, photo)
- Supports optional status filtering via query parameter
- Calculates session statistics
- Orders sessions by date (most recent first)

**Response Format**:

```json
{
  "count": 5,
  "sessions": [
    {
      "id": "uuid",
      "sessionType": "individual",
      "therapyType": "Cognitive Behavioral Therapy",
      "status": "scheduled",
      "scheduledDate": "2025-10-25",
      "scheduledTime": "14:00:00",
      "duration": 60,
      "location": "video_call",
      "zoomLink": "https://zoom.us/j/...",
      "sessionGoals": ["Goal 1", "Goal 2"],
      "sessionNotes": "Notes...",
      "specialist": {
        "id": "uuid",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com"
      }
    }
  ],
  "statistics": {
    "total": 5,
    "scheduled": 2,
    "completed": 3,
    "upcoming": 2
  }
}
```

### 2. Route Configuration

**File**: `backend/routes/therapySessionRoutes.js`

Added new route:

```javascript
router.get("/elder", authenticate, getElderSessions);
```

**Endpoint**: `GET /api/mental-health/sessions/elder`

**Query Parameters**:

- `status` (optional): Filter by session status (scheduled, completed, cancelled)

### 3. Database Requirements

Uses existing `TherapySession` model with associations:

- `TherapySession` belongs to `User` (specialist)
- `TherapySession` belongs to `Elder`

## Frontend Implementation

### 1. Service Method

**File**: `frontend/src/services/mentalHealthService.js`

Added `getElderSessions` method:

```javascript
getElderSessions: async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const response = await api.get(`/mental-health/sessions/elder?${params}`);
  return response.data;
};
```

### 2. Component Updates

**File**: `frontend/src/components/Elder/dashboard/ElderMentalWellness.js`

#### New State Variables:

```javascript
const [therapySessions, setTherapySessions] = useState([]);
const [sessionStats, setSessionStats] = useState(null);
const [loading, setLoading] = useState(true);
```

#### New Functions:

1. **`loadTherapySessions()`**: Fetches sessions from API
2. **`getSessionStatusColor(status)`**: Returns color classes for status badges
3. **`getLocationIcon(location)`**: Returns appropriate icon for session location
4. **`formatDate(dateStr)`**: Formats date for display
5. **`formatTime(timeStr)`**: Converts 24h time to 12h format with AM/PM

#### New UI Section:

- **My Therapy Sessions** card displaying:
  - Session statistics (upcoming, completed)
  - List of therapy sessions with:
    - Specialist information
    - Session date, time, and duration
    - Session location (video call, in-person, phone)
    - Therapy type
    - Session goals (tags)
    - Session notes
    - Status badge
    - "Join Call" button for video sessions
  - "View All Sessions" button if more than 5 sessions
  - Empty state when no sessions exist

## UI Features

### Session Card Layout:

- **Specialist Info**: Avatar, name, and title
- **Schedule Details**: Date, time, duration with icons
- **Location**: Video/in-person/phone with appropriate icons
- **Therapy Type**: Display therapy modality
- **Session Goals**: Up to 2 goals shown as tags, with "+X more" indicator
- **Status Badge**: Color-coded status (scheduled, completed, cancelled)
- **Join Call Button**: For scheduled video sessions with Zoom links

### Visual Design:

- Gradient backgrounds (purple to indigo)
- Color-coded status badges:
  - Scheduled: Blue
  - Completed: Green
  - Cancelled: Gray
- Hover effects on session cards
- Responsive layout
- Loading state with animated icon
- Empty state with call-to-action

## Status Colors:

- **Scheduled**: Blue background (`bg-blue-100 text-blue-800 border-blue-200`)
- **Completed**: Green background (`bg-green-100 text-green-800 border-green-200`)
- **Cancelled**: Gray background (`bg-gray-100 text-gray-800 border-gray-200`)
- **Default**: Yellow background (`bg-yellow-100 text-yellow-800 border-yellow-200`)

## Security & Authentication

- All endpoints protected with JWT authentication
- Elder role verification required (`req.user.role === 'elder'`)
- Elder ID fetched from Elder table using `userId` from JWT token
- Query: `Elder.findOne({ where: { userId: req.user.id } })`
- Only shows sessions assigned to the logged-in elder
- No direct elder ID manipulation possible

## Implementation Notes

### Elder User Identification

Unlike other roles, elders don't have a direct `elderId` in the User table. Instead:

1. User logs in with role='elder'
2. JWT token contains user ID
3. Backend queries Elder table: `Elder.findOne({ where: { userId: req.user.id } })`
4. Uses the Elder's `id` field to fetch therapy sessions

This pattern is consistent with other elder-related controllers in the system.

## Testing Checklist

### Backend:

- ✅ Controller function created
- ✅ Route registered
- ✅ Authentication middleware applied
- ✅ Includes specialist associations
- ✅ Calculates statistics correctly
- ⏳ Test with real elder account
- ⏳ Verify query parameter filtering

### Frontend:

- ✅ Service method created
- ✅ Component updated with new state
- ✅ UI section implemented
- ✅ Loading state handled
- ✅ Empty state handled
- ✅ Session cards display all information
- ⏳ Test with real data
- ⏳ Test Zoom link functionality
- ⏳ Test responsive design

## Integration Points

### Related Features:

1. **Mental Health Specialist Dashboard**: Creates sessions visible to elders
2. **Schedule Session Modal**: Specialists schedule sessions that appear here
3. **Zoom Integration**: Video call links work with existing infrastructure
4. **Assignment System**: Only shows sessions from assigned specialists

### Data Flow:

```
Mental Health Specialist
    ↓
Creates Therapy Session
    ↓
Session saved to database
    ↓
Elder logs in
    ↓
Fetches their sessions via API
    ↓
Displays on Mental Wellness page
```

## Future Enhancements

- [ ] Add session notes from elder's perspective
- [ ] Allow elders to request reschedule
- [ ] Add pre-session questionnaire
- [ ] Calendar view of sessions
- [ ] Session reminders/notifications
- [ ] Post-session feedback form
- [ ] Download session summary/notes
- [ ] Track session attendance history

## Files Modified

1. `backend/controllers/therapySessionController.js`
2. `backend/routes/therapySessionRoutes.js`
3. `frontend/src/services/mentalHealthService.js`
4. `frontend/src/components/Elder/dashboard/ElderMentalWellness.js`

## API Endpoints Summary

- `GET /api/mental-health/sessions/elder` - Get elder's therapy sessions (with optional status filter)

## Notes

- Elder ID must be present in the JWT token's user object as `elderId`
- Sessions are ordered by most recent date first
- Only active/assigned sessions are shown
- Zoom links only visible for scheduled video call sessions
