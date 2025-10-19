# Port Configuration Fix - Summary

## Issue
Several components were hardcoded to use port **5002** instead of **5000**, causing connection errors:
- Prescription Management
- Delivery Schedule  
- Health Alerts Socket
- Staff Components (images)

## Error Messages
```
GET http://localhost:5002/api/prescriptions net::ERR_CONNECTION_REFUSED
GET http://localhost:5002/api/prescriptions/stats net::ERR_CONNECTION_REFUSED
Network Error - AxiosError
```

## Root Cause
Components had hardcoded fallback URLs using `http://localhost:5002` when `process.env.REACT_APP_API_URL` was not set.

## Files Fixed

### 1. Pharmacist Components
- ✅ `frontend/src/components/pharmacist/prescriptions/PrescriptionManagement.js` (line 12)
  - Changed: `'http://localhost:5002/api'` → `'http://localhost:5000/api'`
  
- ✅ `frontend/src/components/pharmacist/delivery/DeliverySchedule.js` (line 11)
  - Changed: `'http://localhost:5002/api'` → `'http://localhost:5000/api'`

### 2. Health Alerts Hook
- ✅ `frontend/src/hooks/useHealthAlerts.js` (line 6)
  - Changed: `'http://localhost:5002'` → `'http://localhost:5000'`
  - Affects Socket.IO connection for real-time alerts

### 3. Staff Components (Image URLs)
- ✅ `frontend/src/components/staff/monitoring/HealthMonitoring.js` (line 436)
  - Elder photo URL in health monitoring view
  
- ✅ `frontend/src/components/staff/care/CareManagement.js` (lines 294, 334)
  - Elder photo URLs in care management (2 locations)
  
- ✅ `frontend/src/components/staff/alerts/AlertsManagement_backup.js` (line 259)
  - Elder photo URL in alerts backup component
  
- ✅ `frontend/src/components/staff/alerts/AlertsManagement.js` (line 305)
  - Elder photo URL in alerts component

## Changes Made

### Before:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5002/api';
const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5002';
src={`${process.env.REACT_APP_API_URL || 'http://localhost:5002'}/uploads/...`}
```

### After:
```javascript
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
src={`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/uploads/...`}
```

## Testing

### Prescription Management
1. Navigate to Pharmacist Dashboard
2. Click "Prescription Management"
3. Should load prescriptions list without errors
4. Stats should display correctly

### Delivery Schedule
1. Navigate to Pharmacist Dashboard
2. Click "Delivery Schedule"
3. Should load delivery orders without errors

### Health Alerts
1. Login as staff member
2. Real-time health alerts should connect via Socket.IO
3. Check browser console - no connection errors

### Elder Photos
1. View any elder profile in staff components
2. Photos should load from correct server (port 5000)
3. No broken image links

## Environment Variables

These components now correctly use:
- `REACT_APP_API_BASE_URL` for API endpoints (defaults to `http://localhost:5000/api`)
- `REACT_APP_API_URL` for base URL and Socket.IO (defaults to `http://localhost:5000`)

### Production Setup
Set these in your `.env` file:
```env
REACT_APP_API_BASE_URL=https://your-api.com/api
REACT_APP_API_URL=https://your-api.com
```

## Impact

### Components Affected
- ✅ Pharmacist Prescription Management
- ✅ Pharmacist Delivery Schedule
- ✅ Staff Health Monitoring
- ✅ Staff Care Management
- ✅ Staff Alerts Management
- ✅ Health Alerts Real-time Updates

### Issues Resolved
- ✅ "Connection Refused" errors
- ✅ Network errors in pharmacist components
- ✅ Broken elder photo links
- ✅ Socket.IO connection failures

## Notes

1. **Backend Port**: Make sure backend is running on port **5000**
2. **Frontend Dev Server**: Usually runs on port **3000**
3. **Socket.IO**: Uses same port as backend (5000)
4. **Image Uploads**: Served from `backend/uploads/` directory

## Related Files

### Not Changed (Already Correct)
Most components already use the centralized `api.js` service which correctly uses port 5000:
- `frontend/src/services/api.js`
- Most family/doctor/elder components
- Authentication components

### Only Fixed Hardcoded Values
Only components with hardcoded fallback URLs needed fixing.

---

**Status**: ✅ All port misconfigurations fixed
**Last Updated**: October 19, 2025
