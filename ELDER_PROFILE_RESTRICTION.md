# Elder Profile Edit Restriction

## Overview
This document describes the implementation of profile edit restrictions for elder users in the ElderLink mobile app.

## Changes Made

### 1. ProfileScreen.js
**Location:** `/ElderlinkMobile/src/screens/main/ProfileScreen.js`

**Change:** Hide the "Edit Profile" button for elder users
```javascript
{/* Only show edit button for non-elder users */}
{user?.role !== 'elder' && (
  <TouchableOpacity
    style={styles.editButton}
    onPress={handleEditProfile}
  >
    <Ionicons name="create-outline" size={22} color="#FFF" />
  </TouchableOpacity>
)}
```

**Effect:** Elders will not see the edit icon button in their profile screen.

---

### 2. EditProfileScreen.js
**Location:** `/ElderlinkMobile/src/screens/profile/EditProfileScreen.js`

#### 2.1 Initial Access Check
Added a useEffect hook to prevent elders from accessing the edit screen:
```javascript
useEffect(() => {
  if (user?.role === 'elder') {
    Alert.alert(
      'Access Denied',
      'You are not allowed to edit your profile. Please contact your family member or administrator for assistance.',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ],
      { cancelable: false }
    );
  }
}, [user, navigation]);
```

**Effect:** If an elder somehow navigates to the edit screen, they will see an alert and be redirected back.

#### 2.2 Save Button Protection
Added validation in the `handleSave` function:
```javascript
const handleSave = async () => {
  // Block elders from saving
  if (user?.role === 'elder') {
    Alert.alert(
      'Access Denied',
      'You are not allowed to edit your profile. Please contact your family member or administrator.',
      [{ text: 'OK' }]
    );
    return;
  }
  // ... rest of save logic
};
```

**Effect:** Even if an elder bypasses the initial check, they cannot save changes.

---

## Security Layers

### Layer 1: UI Prevention
- Edit button is hidden from elders in the ProfileScreen
- Prevents casual access to the edit functionality

### Layer 2: Navigation Guard
- Alert appears immediately if elder accesses EditProfileScreen
- Automatically redirects elder back to the previous screen

### Layer 3: Save Prevention
- Additional check in the save function
- Prevents any data modification even if UI is bypassed

---

## User Experience

### For Elders:
- ✅ Can view their profile information
- ❌ Cannot see the edit button
- ❌ Cannot modify profile details
- ℹ️ Receives clear message to contact family member if changes needed

### For Family Members:
- ✅ Can view elder's profile
- ✅ Can edit elder's profile
- ✅ Full access to profile modification

### For Admins/Staff:
- ✅ Can view profiles
- ✅ Can edit profiles
- ✅ Full access to profile management

---

## Testing Checklist

- [ ] Login as elder user
- [ ] Verify edit button is NOT visible in ProfileScreen
- [ ] Try to navigate to EditProfileScreen (if possible through deep link)
- [ ] Verify alert appears and redirects back
- [ ] Login as family member
- [ ] Verify edit button IS visible
- [ ] Verify can successfully edit and save profile changes

---

## Backend Consistency

Note: The backend also has authorization checks in place:
- Elder route: `/api/elders/:id` with `authorize('family_member', 'elder')`
- Elders can update their own profile on backend, but mobile app restricts this
- Family members can update elders they own through subscription relationship

To fully prevent elders from updating their profile, you may also need to modify the backend route authorization if desired.

---

## Future Enhancements

If needed, you can add more granular controls:
1. Allow elders to update specific fields (e.g., phone, address) but not others
2. Create a "Request Profile Update" feature for elders
3. Add approval workflow for elder-initiated profile changes
4. Log all profile modification attempts for security auditing

---

## Contact
For questions or issues, contact the development team.
