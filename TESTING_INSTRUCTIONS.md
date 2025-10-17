# 🧪 Testing Instructions - Elder Profile Edit Feature

## Quick Test (5 minutes)

### 1. Start Services
```bash
# Terminal 1 - Backend
cd /home/chamikara/Desktop/ElderLink/backend
npm run dev

# Terminal 2 - Mobile App
cd /home/chamikara/Desktop/ElderLink/ElderlinkMobile
npm start
```

### 2. Login as Elder
- Use your elder test account credentials
- Example: `test.elder@elderlink.com` / `Elder@123`

### 3. Navigate to Edit Screen
1. Tap **Profile** tab (bottom navigation)
2. Tap **pencil icon** (✏️) in top-right corner
3. You should see "Edit Profile" screen

### 4. Test Basic Editing
1. Change your **First Name** to something different
2. Tap **"Save Changes"** button
3. Confirm in the dialog
4. Wait for success message
5. You'll return to Profile screen
6. **Verify**: Your new name appears immediately

### 5. Test Validation
1. Go back to Edit Profile
2. Clear the **First Name** field completely
3. Try to save
4. **Expected**: Red error message "First name is required"

### 6. Test Cancel
1. Make some changes
2. Tap **"Cancel"** button
3. **Expected**: Dialog asking "Discard changes?"
4. Tap "Discard"
5. Returns to Profile without saving

---

## Detailed Test Cases

### Test Case 1: Update First Name
**Steps**:
1. Edit Profile
2. Change First Name from "John" to "Johnny"
3. Save changes
4. Confirm dialog

**Expected Result**:
- ✅ Loading indicator appears
- ✅ Success message: "Profile updated successfully"
- ✅ Navigate back to Profile
- ✅ Profile shows "Johnny" immediately
- ✅ Refresh app - still shows "Johnny"

**Database Verification**:
```sql
SELECT firstName FROM Elders WHERE id = 'your-elder-id';
-- Should return: Johnny
```

---

### Test Case 2: Update Multiple Fields
**Steps**:
1. Edit Profile
2. Change:
   - First Name: "John"
   - Last Name: "Smith"
   - Phone: "+1 555 123 4567"
   - Address: "456 Oak Street, Springfield, IL 62701"
3. Save changes

**Expected Result**:
- ✅ All fields save correctly
- ✅ Profile displays all new values
- ✅ No data loss

---

### Test Case 3: Date of Birth Format
**Steps**:
1. Edit Profile
2. Try entering "01/15/1950"
3. Try to save

**Expected Result**:
- ✅ Error: "Date format should be YYYY-MM-DD"
- ✅ Cannot save with invalid format

**Then**:
1. Change to "1950-01-15"
2. Save

**Expected Result**:
- ✅ Saves successfully
- ✅ Profile shows formatted date

---

### Test Case 4: Phone Number Validation
**Steps**:
1. Edit Profile
2. Enter phone: "abc123"
3. Try to save

**Expected Result**:
- ✅ Error: "Please enter a valid phone number"

**Then**:
1. Change to "+1 234 567 8900"
2. Save

**Expected Result**:
- ✅ Saves successfully

---

### Test Case 5: Email Field Locked
**Steps**:
1. Edit Profile
2. Try to tap on Email field

**Expected Result**:
- ✅ Field is disabled (grayed out)
- ✅ Info box says "Email cannot be changed"
- ✅ Cannot type in email field

---

### Test Case 6: Required Fields
**Steps**:
1. Edit Profile
2. Clear First Name
3. Clear Last Name
4. Try to save

**Expected Result**:
- ✅ Red error under First Name: "First name is required"
- ✅ Red error under Last Name: "Last name is required"
- ✅ Cannot save

---

### Test Case 7: No Changes Detection
**Steps**:
1. Edit Profile
2. Don't change anything
3. Look at Save button

**Expected Result**:
- ✅ Save button is disabled/grayed
- ✅ Cannot tap Save button

**Then**:
1. Change First Name
2. Change it back to original

**Expected Result**:
- ✅ Save button disabled again

---

### Test Case 8: Cancel Without Changes
**Steps**:
1. Edit Profile
2. Don't change anything
3. Tap Cancel

**Expected Result**:
- ✅ No confirmation dialog
- ✅ Immediately returns to Profile

---

### Test Case 9: Cancel With Changes
**Steps**:
1. Edit Profile
2. Change First Name
3. Tap Cancel

**Expected Result**:
- ✅ Dialog: "Discard Changes?"
- ✅ Options: "Keep Editing" and "Discard"

**If "Keep Editing"**:
- ✅ Returns to edit screen
- ✅ Changes still there

**If "Discard"**:
- ✅ Returns to Profile
- ✅ No changes saved

---

### Test Case 10: Network Error
**Steps**:
1. Stop backend server
2. Edit Profile
3. Change First Name
4. Try to save

**Expected Result**:
- ✅ Error dialog appears
- ✅ Message: "Network connection error"
- ✅ Can retry after restarting server

---

### Test Case 11: Authorization (Security)
**Steps**:
1. Login as Elder User A
2. Note your elder ID
3. Try to edit (using curl):
```bash
curl -X PUT http://localhost:5000/api/elders/{DIFFERENT_ELDER_ID} \
  -H "Authorization: Bearer {YOUR_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "Hacker"}'
```

**Expected Result**:
- ✅ 403 Forbidden
- ✅ Message: "You can only update your own profile"

---

### Test Case 12: Multiline Address
**Steps**:
1. Edit Profile
2. Enter address across multiple lines:
   ```
   123 Main Street
   Apartment 4B
   Springfield, IL 62701
   USA
   ```
3. Save

**Expected Result**:
- ✅ Saves all lines
- ✅ Profile displays address with line breaks
- ✅ Edit screen shows address with line breaks

---

### Test Case 13: Special Characters
**Steps**:
1. Edit Profile
2. Enter name: "O'Brien-Smith"
3. Enter phone: "+1 (555) 123-4567"
4. Save

**Expected Result**:
- ✅ Special characters accepted
- ✅ Saves correctly
- ✅ Displays correctly

---

### Test Case 14: Long Address
**Steps**:
1. Edit Profile
2. Enter very long address (200+ characters)
3. Save

**Expected Result**:
- ✅ All text saves
- ✅ Scrollable in view mode
- ✅ No truncation

---

### Test Case 15: App Restart Persistence
**Steps**:
1. Edit and save profile changes
2. Close mobile app completely
3. Reopen app
4. Login again
5. Check Profile

**Expected Result**:
- ✅ All changes persist
- ✅ Shows updated data
- ✅ No data loss

---

## Performance Tests

### Test P1: Loading Speed
**Steps**:
1. Tap Edit Profile
2. Time how long until form appears

**Expected Result**:
- ✅ Loads in < 1 second
- ✅ No lag or freezing

---

### Test P2: Save Speed
**Steps**:
1. Make changes
2. Tap Save
3. Time until success message

**Expected Result**:
- ✅ Completes in < 2 seconds
- ✅ Loading indicator shows progress

---

## Accessibility Tests

### Test A1: Touch Targets
**Measure**:
- All buttons ≥ 44pt
- All input fields ≥ 44pt height

**Expected Result**:
- ✅ Easy to tap on phone
- ✅ No mis-taps

---

### Test A2: Font Sizes
**Measure**:
- Headers: 20-24px
- Body: 16-18px
- Inputs: 15-16px

**Expected Result**:
- ✅ Readable without glasses
- ✅ Clear hierarchy

---

### Test A3: Color Contrast
**Check**:
- Text on background
- Error messages
- Disabled states

**Expected Result**:
- ✅ All meet WCAG AA standards
- ✅ Clear differentiation

---

## Edge Cases

### Edge Case 1: Empty Phone
**Steps**:
1. Edit Profile
2. Clear phone number
3. Save

**Expected Result**:
- ✅ Saves successfully (phone is optional)
- ✅ Profile shows "Not provided"

---

### Edge Case 2: Empty Address
**Steps**:
1. Edit Profile
2. Clear address
3. Save

**Expected Result**:
- ✅ Saves successfully (address is optional)
- ✅ Profile shows "Not provided"

---

### Edge Case 3: Very Old Date
**Steps**:
1. Edit Profile
2. Enter DOB: "1900-01-01"
3. Save

**Expected Result**:
- ✅ Accepts old dates
- ✅ Calculates age correctly (124 years old)

---

### Edge Case 4: Future Date
**Steps**:
1. Edit Profile
2. Enter DOB: "2030-01-01"
3. Save

**Expected Result**:
- ⚠️ Should ideally validate (but currently allows)
- ⚠️ May show negative age

---

## Integration Tests

### Integration 1: Profile → Edit → Profile
**Flow**:
Profile Screen → Edit → Save → Back to Profile

**Expected Result**:
- ✅ Smooth transitions
- ✅ Data consistent throughout
- ✅ No crashes

---

### Integration 2: Edit → Logout → Login → Profile
**Flow**:
Edit Profile → Save → Logout → Login → Check Profile

**Expected Result**:
- ✅ Changes persist across sessions
- ✅ No data loss on logout

---

### Integration 3: Edit → Background → Foreground
**Flow**:
Edit Profile → Home button → Return to app

**Expected Result**:
- ✅ Form state preserved
- ✅ Changes not lost
- ✅ Can continue editing

---

## Browser/API Testing

### API Test 1: Valid Update
```bash
curl -X PUT http://localhost:5000/api/elders/{elderId} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+1234567890",
    "dateOfBirth": "1950-01-15",
    "address": "123 Main St"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "elder": { ...updated data... },
  "message": "Elder updated successfully"
}
```

---

### API Test 2: Missing Token
```bash
curl -X PUT http://localhost:5000/api/elders/{elderId} \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John"}'
```

**Expected Response**:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

---

### API Test 3: Wrong Elder ID
```bash
curl -X PUT http://localhost:5000/api/elders/wrong-id \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"firstName": "John"}'
```

**Expected Response**:
```json
{
  "success": false,
  "message": "You can only update your own profile"
}
```

---

## Final Verification Checklist

Before considering testing complete:

- [ ] All 15 detailed test cases pass
- [ ] All performance tests meet criteria
- [ ] All accessibility tests pass
- [ ] All edge cases handled correctly
- [ ] All integration flows work
- [ ] API responds correctly
- [ ] Database updates persist
- [ ] No console errors
- [ ] No app crashes
- [ ] User experience is smooth

---

## Bug Report Template

If you find issues:

```
**Bug Title**: [Short description]

**Severity**: Critical / High / Medium / Low

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Result**:
...

**Actual Result**:
...

**Screenshots**: [If applicable]

**Console Errors**: [Copy from debugger]

**Environment**:
- Device: [iPhone/Android]
- OS Version: [e.g., iOS 16]
- App Version: 1.0.0
- Backend URL: http://...
```

---

## Success Criteria

✅ **All core functionality works**
✅ **All validation behaves correctly**
✅ **Data persists to database**
✅ **UI updates immediately**
✅ **No crashes or errors**
✅ **Elder-friendly and accessible**
✅ **Security prevents unauthorized access**

---

**Happy Testing!** 🎉

If all tests pass, your profile edit feature is **production-ready**! 🚀
