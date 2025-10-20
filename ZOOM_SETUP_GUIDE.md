# Zoom Integration Setup Guide

This guide will help you set up Zoom integration for ElderLink monthly video sessions.

---

## Prerequisites

- A Zoom account (Free or Pro)
- Access to Zoom App Marketplace
- Node.js backend with environment variables configured

---

## Step 1: Create a Zoom Account

1. Go to [https://zoom.us/signup](https://zoom.us/signup)
2. Sign up for a free Zoom account or use an existing account
3. Verify your email address
4. (Optional) Upgrade to Pro plan for longer meetings (>40 minutes with 3+ participants)

---

## Step 2: Create a Server-to-Server OAuth App

### 2.1 Access Zoom App Marketplace

1. Go to [https://marketplace.zoom.us/](https://marketplace.zoom.us/)
2. Click **Sign In** (top right) and log in with your Zoom account
3. Click **Develop** dropdown → **Build App**

### 2.2 Create Server-to-Server OAuth App

1. On the "Choose your app type" page, select **Server-to-Server OAuth**
2. Click **Create**
3. Enter App Details:
   - **App Name**: `ElderLink Meeting Manager` (or your preferred name)
   - **Company Name**: Your organization name
   - **Developer Name**: Your name
   - **Developer Email**: Your email
4. Click **Continue**

### 2.3 Configure App Information

1. **Short Description**: `Video meeting management for ElderLink monthly sessions`
2. **Long Description**: Add a detailed description of your app
3. Click **Continue**

### 2.4 Get Your Credentials

You'll see three important credentials:
- **Account ID** (looks like: `abc123XYZ-defghIJKL`)
- **Client ID** (looks like: `aBcD1234EfGh5678`)
- **Client Secret** (looks like: `xYzAbC123456789dEfGhIjKlMnOpQrSt`)

⚠️ **IMPORTANT**: Copy these immediately! The Client Secret is only shown once.

**Save these values - you'll need them in Step 4**

---

## Step 3: Configure Scopes (Permissions)

1. On the same page, scroll to **Scopes** section
2. Click **+ Add Scopes**
3. Add the following scopes:

   **Required Scopes:**
   - ✅ `meeting:write:admin` - Create meetings
   - ✅ `meeting:read:admin` - Read meeting details
   - ✅ `meeting:update:admin` - Update meetings
   - ✅ `meeting:delete:admin` - Delete meetings
   - ✅ `user:read:admin` - Read user information

4. Click **Done**
5. Click **Continue**

---

## Step 4: Activate Your App

1. On the **Activation** page, toggle **Activate your app** to ON
2. Copy the information and provide the necessary consent
3. Click **Continue**

Your app is now activated! ✅

---

## Step 5: Configure ElderLink Backend

### 5.1 Update `.env` File

Add the following to your `backend/.env` file:

```env
# ==================== ZOOM CONFIGURATION ====================

# Zoom OAuth Server-to-Server Credentials
ZOOM_ACCOUNT_ID=your_account_id_here
ZOOM_CLIENT_ID=your_client_id_here
ZOOM_CLIENT_SECRET=your_client_secret_here

# Zoom API Base URL (don't change unless using Zoom Gov)
ZOOM_API_BASE_URL=https://api.zoom.us/v2

# Default meeting settings
ZOOM_DEFAULT_MEETING_DURATION=45
ZOOM_DEFAULT_TIMEZONE=America/New_York
ZOOM_ENABLE_WAITING_ROOM=true
ZOOM_ENABLE_JOIN_BEFORE_HOST=false
ZOOM_AUTO_RECORDING=none

# ==================== EMAIL CONFIGURATION ====================

# Email service for sending Zoom links
EMAIL_SERVICE=gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_FROM_NAME=ElderLink Health
EMAIL_FROM_ADDRESS=your-email@gmail.com

# ==================== NOTIFICATION CONFIGURATION ====================

# No additional configuration needed!
# Notifications are stored in the database and fetched by the mobile app
# Socket.IO is used for real-time updates (already configured in server.js)
```

### 5.2 Replace Placeholder Values

Replace the following placeholders with your actual values:

1. **ZOOM_ACCOUNT_ID**: Paste your Account ID from Step 2.4
2. **ZOOM_CLIENT_ID**: Paste your Client ID from Step 2.4
3. **ZOOM_CLIENT_SECRET**: Paste your Client Secret from Step 2.4
4. **EMAIL_USER**: Your email address (see Step 6)
5. **EMAIL_PASSWORD**: Your app-specific password (see Step 6)

---

## Step 6: Configure Email Service (for Zoom Link Notifications)

### Option A: Gmail Setup (Recommended for Testing)

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification if not already enabled
4. Scroll to **App passwords** → Click **Generate**
5. Select **App**: Mail, **Device**: Other (custom name)
6. Enter: `ElderLink Backend`
7. Click **Generate**
8. Copy the 16-character password
9. Use this password for `EMAIL_PASSWORD` in `.env`

### Option B: Other Email Services

**SendGrid:**
```env
EMAIL_SERVICE=sendgrid
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
```

**Mailgun:**
```env
EMAIL_SERVICE=mailgun
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your_mailgun_password
```

---

## Step 7: Mobile App Notifications (Database + Socket.IO)

### 7.1 How It Works

Mobile app notifications work by:
1. **Backend creates notification in database** when events occur
2. **Mobile app fetches notifications** via `GET /api/notifications`
3. **Real-time updates** via Socket.IO (optional, for instant notifications)

### 7.2 No Additional Setup Needed!

✅ **No Firebase required!**
✅ **No push notification service needed!**
✅ Notifications are stored in the database and displayed as info cards in the mobile app

### 7.3 Mobile App Setup

The mobile app already includes:
- `NotificationsScreen.js` - Displays notification cards
- Auto-refresh on app open
- Pull-to-refresh support
- Different card styles for different notification types:
  - 📹 Zoom links (with Join button)
  - ✅ Session completed
  - 💊 Prescription ready
  - ⏰ Session reminders

---

## Step 8: Mobile App Configuration (Optional)

Update the API URL in the mobile app to point to your backend:

**File:** `ElderlinkMobile/src/screens/Notifications/NotificationsScreen.js`

```javascript
const API_URL = 'http://YOUR_BACKEND_IP:5000/api';
```

Change `YOUR_BACKEND_IP` to:
- **Local testing:** `http://192.168.1.X:5000/api` (your computer's IP)
- **Production:** `https://your-domain.com/api`

---

## Step 9: Test Your Configuration

### 8.1 Restart Backend Server

```bash
cd backend
npm start
```

### 9.2 Check Logs

Look for success messages:
```
✅ Zoom service initialized
✅ Email service configured
✅ Notification service ready
```

### 9.3 Test Zoom Meeting Creation

Use the API endpoint:
```bash
POST http://localhost:5000/api/monthly-sessions/:sessionId/create-zoom
```

You should receive a response with:
- `zoomMeetingId`
- `zoomJoinUrl`
- `zoomStartUrl`
- `zoomPassword`

### 9.4 Test Mobile App Notifications

1. Open mobile app
2. Create a Zoom meeting from doctor dashboard
3. Click "Send Links"
4. Open mobile app → Notifications screen
5. Should see Zoom meeting card with "Join Meeting" button

---

## Troubleshooting

### Issue: "Invalid access token"

**Solution**: Check that your `ZOOM_ACCOUNT_ID`, `ZOOM_CLIENT_ID`, and `ZOOM_CLIENT_SECRET` are correct. The access token is generated automatically.

### Issue: "Email not sending"

**Solution**: 
1. Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
2. For Gmail, make sure you're using an App Password, not your regular password
3. Check that "Less secure app access" is enabled (if not using 2FA)

### Issue: "Meeting created but participants not notified"

**Solution**: Check email service logs. Ensure `EMAIL_FROM_ADDRESS` is verified.

### Issue: "Notifications not showing on mobile"

**Solution**:
1. Verify mobile app API_URL is set correctly
2. Check internet connection on mobile device
3. Pull down to refresh notifications screen
4. Verify notifications exist in database (check backend logs)

---

## Security Best Practices

1. ✅ **Never commit `.env` file** to version control
2. ✅ Keep `ZOOM_CLIENT_SECRET` secure
3. ✅ Rotate secrets regularly
4. ✅ Use environment-specific credentials (dev, staging, production)
5. ✅ Monitor API usage in Zoom Dashboard
6. ✅ Set up rate limiting on your API endpoints

---

## API Rate Limits

Zoom Server-to-Server OAuth apps have the following limits:

- **Meeting Creation**: 100 requests/day (Free), 300/day (Pro)
- **Meeting Updates**: Unlimited
- **User Queries**: 600 requests/minute

💡 **Tip**: Cache meeting data and avoid unnecessary API calls.

---

## Additional Resources

- [Zoom Server-to-Server OAuth Guide](https://marketplace.zoom.us/docs/guides/build/server-to-server-oauth-app/)
- [Zoom API Reference](https://marketplace.zoom.us/docs/api-reference/zoom-api)
- [Nodemailer Documentation](https://nodemailer.com/about/)
- [Socket.IO Documentation](https://socket.io/docs/v4/)

---

## Support

If you encounter issues:

1. Check Zoom App Marketplace → Your App → Logs
2. Review backend logs: `backend/logs/`
3. Test API endpoints with Postman
4. Contact Zoom support: [https://support.zoom.us/](https://support.zoom.us/)

---

**Setup Complete!** 🎉

Your ElderLink application is now ready to create and manage Zoom meetings for monthly sessions.
