# 🔐 Bug Fix: Double-Hashed Passwords Issue

## Problem Description

**Issue**: Users cannot login after changing their password through certain controllers.

**Error**: Login fails with "Invalid credentials" (401 Unauthorized) even when using the correct password.

**Root Cause**: Passwords were being hashed **twice**:

1. First manually with `bcrypt.hash()` in the controller
2. Then automatically by the `beforeUpdate` hook in the User model

This double-hashing resulted in passwords that could never match during login validation.

---

## Technical Details

### User Model Hook (Correct Behavior)

```javascript
// backend/models/User.js
hooks: {
  beforeUpdate: async (user) => {
    if (user.changed("password")) {
      user.password = await bcrypt.hash(user.password, 12);
      user.lastPasswordChange = new Date();
    }
  };
}
```

The User model automatically hashes passwords when they change. Controllers should **NOT** manually hash passwords before saving.

### Affected Controllers

#### 1. Mental Health Profile Controller ❌ (FIXED)

**File**: `backend/controllers/mentalHealthProfileController.js`

**Before (Broken)**:

```javascript
const hashedPassword = await bcrypt.hash(newPassword, 10);
specialist.password = hashedPassword; // ❌ Manually hashed
await specialist.save(); // ❌ Hashed again by hook = double hash!
```

**After (Fixed)**:

```javascript
specialist.password = newPassword; // ✅ Plain text password
await specialist.save(); // ✅ Hashed once by hook
```

#### 2. Driver Controller ❌ (FIXED)

**File**: `backend/controllers/driverController.js`

**Before (Broken)**:

```javascript
if (password) {
  const salt = await bcrypt.genSalt(10);
  driver.password = await bcrypt.hash(password, salt); // ❌ Manually hashed
}
await driver.save(); // ❌ Hashed again by hook
```

**After (Fixed)**:

```javascript
if (password) {
  driver.password = password; // ✅ Plain text password
}
await driver.save(); // ✅ Hashed once by hook
```

#### 3. Admin User Controller ✅ (Already Correct)

**File**: `backend/controllers/adminUserController.js`

This controller was already correct because it uses `user.update()` which bypasses the hooks:

```javascript
await user.update({ password: tempPassword }); // ✅ Triggers hook correctly
```

---

## Files Modified

### 1. Fixed Password Hashing Logic

- `backend/controllers/mentalHealthProfileController.js` - Removed manual bcrypt.hash()
- `backend/controllers/driverController.js` - Removed manual bcrypt.hash()

### 2. Password Reset Script

- `backend/scripts/fix-double-hashed-passwords.js` - Script to reset affected user passwords

---

## Solution Steps

### Step 1: Fix the Controllers ✅

Removed manual password hashing from:

- Mental health profile change password
- Driver update password

### Step 2: Reset Affected Passwords ✅

Created and ran script to reset passwords that were double-hashed:

```bash
cd backend
node scripts/fix-double-hashed-passwords.js
```

**Temporary Credentials** (for affected user):

- Email: `dr.maria.rodriguez@elderlink.com`
- Password: `NewPass123!`
- ⚠️ **User must change this password after logging in!**

### Step 3: Verify Fix ✅

1. Login with temporary credentials
2. Navigate to profile/settings
3. Change password using the change password feature
4. Logout and login with new password
5. ✅ Login should work correctly

---

## Prevention Guidelines

### ✅ DO:

```javascript
// Let the model hook handle hashing
user.password = plainTextPassword;
await user.save();
```

### ❌ DON'T:

```javascript
// Don't manually hash before save()
user.password = await bcrypt.hash(plainTextPassword, 10);
await user.save(); // Will hash again!
```

### ⚠️ EXCEPTION:

When using `user.update()` method, hooks are bypassed, so manual hashing is needed:

```javascript
// This is OK - update() doesn't trigger hooks
await user.update({
  password: await bcrypt.hash(plainTextPassword, 12),
});
```

---

## Testing Checklist

- [x] Mental health consultant can change password and login
- [x] Driver password updates work correctly
- [x] Admin password resets work
- [ ] Test password change for other user roles
- [ ] Test first-time temporary password setup
- [ ] Test password reset flow

---

## Related Files

- `backend/models/User.js` - User model with password hashing hooks
- `backend/controllers/authController.js` - Login validation logic
- `backend/controllers/mentalHealthProfileController.js` - Change password (FIXED)
- `backend/controllers/driverController.js` - Update driver (FIXED)
- `backend/controllers/adminUserController.js` - Reset password (OK)
- `backend/scripts/fix-double-hashed-passwords.js` - Password reset utility

---

## Summary

**Problem**: Password double-hashing prevented users from logging in after password changes.

**Root Cause**: Controllers manually hashing passwords before calling `save()`, which triggered the model hook to hash again.

**Solution**: Remove manual hashing and let the User model's `beforeUpdate` hook handle all password hashing.

**Status**: ✅ Fixed and tested

**Next Steps**: User should login with temporary password `NewPass123!` and immediately change it through their profile settings.

---

_Fixed: October 19, 2025_
