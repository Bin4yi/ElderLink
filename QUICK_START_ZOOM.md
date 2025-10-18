# 🚀 Quick Start Guide - Zoom Integration

## Overview
This guide will help you quickly set up and test the Zoom integration for monthly health sessions.

---

## ⚡ Quick Setup (5 minutes)

### 1. Configure Zoom (REQUIRED)

Add to `backend/.env`:
```env
ZOOM_ACCOUNT_ID=your_account_id
ZOOM_CLIENT_ID=your_client_id
ZOOM_CLIENT_SECRET=your_client_secret
```

**Get these credentials:** Follow `ZOOM_SETUP_GUIDE.md` steps 1-4

### 2. Configure Email (REQUIRED)

Add to `backend/.env`:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

**Get Gmail app password:** `ZOOM_SETUP_GUIDE.md` step 6

### 3. Configure Mobile App (Optional)

Update API URL in mobile app:

**File:** `ElderlinkMobile/src/screens/Notifications/NotificationsScreen.js`

```javascript
const API_URL = 'http://YOUR_LOCAL_IP:5000/api';
```

Replace `YOUR_LOCAL_IP` with your computer's IP (e.g., `192.168.1.100`)

### 4. Restart Server

```powershell
cd c:\Users\HP\Desktop\Elderlink1\ElderLink\backend
npm start
```

---

## 🧪 Quick Test (2 minutes)

### Test 1: Create Zoom Meeting

1. Login as **doctor**
2. Navigate to: `http://localhost:3000/doctor/zoom-meetings`
3. Find a scheduled session
4. Click **"Create Zoom Meeting"**

**Expected:** Meeting ID, password, and join URL appear

### Test 2: Send Links

1. Click **"Send Links"** button
2. Check the family member's email

**Expected:** Beautiful email with Zoom link received

### Test 3: Start Meeting

1. Click **"Start Meeting"** button
2. Zoom opens in new tab

**Expected:** Zoom opens with host controls

### Test 4: Complete Session

1. After meeting, find the session
2. Click **"Complete Session"** (if available, or add button to UI)
3. Fill in notes and vital signs
4. Add prescription (optional)
5. Submit

**Expected:** Session marked complete, prescription created

---

## 📝 Important Files

### Backend
- `backend/services/zoomService.js` - Zoom API integration
- `backend/services/emailService.js` - Email notifications
- `backend/services/notificationService.js` - Mobile notifications
- `backend/controllers/monthlySessionZoomController.js` - API endpoints
- `backend/routes/monthlySessions.js` - API routes

### Frontend
- `frontend/src/services/monthlySessionService.js` - API calls
- `frontend/src/components/doctor/sessions/ZoomMeetingManager.js` - Main UI
- `frontend/src/components/doctor/sessions/CompleteSessionModal.js` - Completion workflow

### Documentation
- `ZOOM_SETUP_GUIDE.md` - Complete setup instructions
- `ZOOM_IMPLEMENTATION_SUMMARY.md` - Full implementation details

---

## 🔍 Troubleshooting

### "Failed to create Zoom meeting"
→ Check `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, `ZOOM_CLIENT_SECRET` in `.env`

### "Email not sending"
→ Use Gmail **App Password**, not regular password

### "Pharmacy list empty"
→ Ensure users with role `pharmacist` exist in database

---

## 📚 API Endpoints

### Create Meeting
```
POST /api/monthly-sessions/:sessionId/create-zoom
Authorization: Bearer <doctor_token>
```

### Send Links
```
POST /api/monthly-sessions/:sessionId/send-links
Authorization: Bearer <doctor_token>
```

### Complete Session
```
POST /api/monthly-sessions/:sessionId/complete-with-prescription
Authorization: Bearer <doctor_token>

Body: {
  doctorNotes: "...",
  vitalSigns: {...},
  prescription: {
    pharmacyId: "...",
    items: [...]
  }
}
```

### Get Pharmacies
```
GET /api/monthly-sessions/pharmacies/list
Authorization: Bearer <doctor_token>
```

---

## ✅ Environment Variables Checklist

Required:
- [x] `ZOOM_ACCOUNT_ID`
- [x] `ZOOM_CLIENT_ID`
- [x] `ZOOM_CLIENT_SECRET`
- [x] `EMAIL_USER`
- [x] `EMAIL_PASSWORD`

Optional:
- [ ] `FIREBASE_PROJECT_ID` (for mobile push)
- [ ] `FIREBASE_CLIENT_EMAIL`
- [ ] `FIREBASE_PRIVATE_KEY`

---

## 🎯 Next Steps

1. ✅ Follow setup instructions above
2. ✅ Test Zoom meeting creation
3. ✅ Test email notifications
4. ✅ Test session completion
5. ✅ Add "Complete Session" button to UI (if needed)
6. ✅ Deploy to production

---

## 📞 Need Help?

- Full setup guide: `ZOOM_SETUP_GUIDE.md`
- Implementation details: `ZOOM_IMPLEMENTATION_SUMMARY.md`
- Check backend logs for errors
- Verify all environment variables are set

---

**That's it! You're ready to use Zoom integration! 🎉**
