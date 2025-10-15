# How to Run ElderLink Mobile App with Expo

## Quick Start Guide

### Step 1: Start Backend Server

```bash
# Open Terminal 1
cd D:\ElderLink\backend

# Start the backend
npm run dev
```

**Expected output:**
```
✅ Server running on http://localhost:5000
✅ Database connected successfully
```

If you get database errors, make sure you have:
1. PostgreSQL installed and running
2. Created `.env` file in backend folder with database credentials

---

### Step 2: Start Expo Development Server

```bash
# Open Terminal 2 (NEW terminal window)
cd D:\ElderLink\ElderlinkMobile

# Clear cache and start Expo
npm start -- --clear
```

**Alternative commands:**
```bash
# If npm start doesn't work, try:
npx expo start --clear

# Or with reset cache:
npx expo start -c
```

**Expected output:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator  
› Press w │ open web
```

---

### Step 3: Run on Your Phone

#### For Android:
1. **Install Expo Go** from Google Play Store
2. **Open Expo Go app**
3. **Tap "Scan QR code"**
4. **Scan the QR code** shown in the terminal
5. Wait for the app to load

#### For iOS:
1. **Install Expo Go** from App Store
2. **Open Camera app** (not Expo Go)
3. **Point camera at QR code**
4. **Tap the notification** that appears
5. App will open in Expo Go

---

### Step 4: Verify Configuration

Make sure your `ElderlinkMobile/src/utils/constants.js` has correct IP:

```javascript
// Find your computer's IP address first:
// Windows: Open Command Prompt → type: ipconfig
// Look for IPv4 Address under your WiFi adapter

export const API_BASE_URL = 'http://192.168.8.168:5000';
// Replace 192.168.8.168 with YOUR computer's IP
```

**Important:**
- Your phone and computer MUST be on the same WiFi network
- Don't use `localhost` or `127.0.0.1` - use your actual IP address

---

## Troubleshooting

### Issue: "Metro Bundler failed to start"

```bash
# Kill any process using port 8081
# Windows:
netstat -ano | findstr :8081
taskkill /PID <process_id> /F

# Then try again:
npm start -- --clear
```

### Issue: "Network request failed" in app

1. **Check backend is running** in Terminal 1
2. **Verify your IP address** with `ipconfig`
3. **Update constants.js** with correct IP
4. **Restart Expo**: Press `r` in terminal or shake device → Reload

### Issue: "Unable to resolve module"

```bash
# Clean install
cd ElderlinkMobile
rm -rf node_modules
npm install
npm start -- --clear
```

---

## Useful Expo Commands

While Expo is running, you can press:

- **`r`** - Reload the app
- **`m`** - Toggle menu
- **`d`** - Open DevTools
- **`a`** - Open on Android emulator
- **`i`** - Open on iOS simulator
- **`c`** - Clear cache and reload
- **`?`** - Show all commands

---

## Test Login Credentials

**Elder Account:**
```
Email: elder10@gmail.com
Password: Elder@123
```

**Driver Account:**
```
Email: driver1@elderlink.com
Password: Driver@123
```

---

## Common Expo Issues

### Expo Go app shows "Something went wrong"

```bash
# Clear cache completely
cd ElderlinkMobile
npx expo start -c

# If still not working:
rm -rf node_modules
npm install
npx expo start -c
```

### App loads but shows blank screen

1. Check browser console (shake device → Debug Remote JS)
2. Look for error messages
3. Check if API_BASE_URL is correct in constants.js

### QR Code doesn't appear

```bash
# Make sure Expo CLI is installed
npm install -g expo-cli

# Or use npx instead:
npx expo start --clear
```

---

## Daily Development Workflow

```bash
# Every time you develop:

# Terminal 1: Backend
cd D:\ElderLink\backend
npm run dev

# Terminal 2: Mobile App  
cd D:\ElderLink\ElderlinkMobile
npm start

# Scan QR code with Expo Go app
# Start developing!
```

---

## Building for Production

### Create APK/IPA:

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

---

## Need More Help?

See the full documentation:
- `MOBILE_APP_SETUP.md` - Complete setup guide
- `QUICK_START.md` - Quick reference
- `TROUBLESHOOTING_FLOWCHART.md` - Problem solving guide

---

## Summary

**3 Simple Steps:**

1. **Backend**: `cd backend && npm run dev`
2. **Mobile**: `cd ElderlinkMobile && npm start`
3. **Scan QR** code with Expo Go app

That's it! 🚀
