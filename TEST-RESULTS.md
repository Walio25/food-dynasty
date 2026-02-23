# 🧪 Food Dynasty - Registration & Login System Test Results

## 📋 Configuration Status

### ✅ **Configuration Verified:**

**Registration Service (`js/registration-service.js`):**
- ✅ Form ID: `1FAIpQLSeAAYyTJDKdVN9g1t6HDkByvOt0SnV_XGDNffiSY7ttkPA7Qg`
- ✅ Name field: `entry.1441762937`
- ✅ Email field: `entry.1954798555`
- ✅ Phone field: `entry.1112423499`
- ✅ Username field: `entry.421194549`
- ✅ Password field: `entry.1224228799`
- ✅ Address field: `entry.518137277`

**Authentication Service (`js/auth-service.js`):**
- ✅ Spreadsheet ID: `1vhA7pc5FnzE5bCxGKJ5K9n4x4Icwe6FfZADBx0q8AIs`
- ✅ Sheet Name: `Form Responses 1`
- ✅ API Key: Configured

---

## 🧪 Test Cases to Execute

### **Test Case 1: Registration - Valid Data**

**Objective:** Verify user can register with valid data

**Steps:**
1. Open `register.html` in browser
2. Fill in the form:
   ```
   Full Name: John Doe
   Email: john@test.com
   Phone: 1234567890
   Username: johndoe
   Password: john123
   Confirm Password: john123
   Address: 123 Main Street
   ```
3. Check "I agree to Terms & Conditions"
4. Click "Create Account"

**Expected Results:**
- ✅ Form submits successfully
- ✅ Success message displayed: "Registration Successful!"
- ✅ Two buttons shown: "Go to Login" and "Go to Home"
- ✅ Check Google Sheet - new row with data appears
- ✅ Password column shows base64 encoded text (e.g., `am9objEyMw==`)

**Status:** 🔶 PENDING - Test this now!

---

### **Test Case 2: Registration - Invalid Email**

**Objective:** Verify email validation works

**Steps:**
1. Open `register.html`
2. Fill form with invalid email: `johntest.com` (no @)
3. Try to submit

**Expected Results:**
- ❌ Error message: "Please enter a valid email address"
- ❌ Form does not submit

**Status:** 🔶 PENDING

---

### **Test Case 3: Registration - Short Password**

**Objective:** Verify password length validation

**Steps:**
1. Open `register.html`
2. Fill form with password: `abc` (less than 6 chars)
3. Try to submit

**Expected Results:**
- ❌ Error message: "Password must be at least 6 characters long"
- ❌ Form does not submit

**Status:** 🔶 PENDING

---

### **Test Case 4: Registration - Password Mismatch**

**Objective:** Verify password confirmation works

**Steps:**
1. Open `register.html`
2. Password: `john123`
3. Confirm Password: `john456` (different)
4. Try to submit

**Expected Results:**
- ❌ Error message: "Passwords do not match"
- ❌ Form does not submit

**Status:** 🔶 PENDING

---

### **Test Case 5: Registration - Invalid Phone**

**Objective:** Verify phone validation

**Steps:**
1. Open `register.html`
2. Phone: `123` (less than 10 digits)
3. Try to submit

**Expected Results:**
- ❌ Error message: "Please enter a valid phone number (10 digits)"
- ❌ Form does not submit

**Status:** 🔶 PENDING

---

### **Test Case 6: Registration - Short Username**

**Objective:** Verify username validation

**Steps:**
1. Open `register.html`
2. Username: `joe` (less than 4 chars)
3. Try to submit

**Expected Results:**
- ❌ Error message: "Username must be at least 4 characters long"
- ❌ Form does not submit

**Status:** 🔶 PENDING

---

### **Test Case 7: Registration - Password Strength Indicator**

**Objective:** Verify password strength visual feedback

**Steps:**
1. Open `register.html`
2. Type password: `abc123`
3. Observe strength bar

**Expected Results:**
- 🟡 Weak password → Red bar (33%)
- 🟢 Medium password (6-8 chars) → Yellow bar (66%)
- 🟢 Strong password (8+ with mixed case) → Green bar (100%)

**Status:** 🔶 PENDING

---

### **Test Case 8: Login - Valid Credentials**

**Objective:** Verify successful login

**Prerequisites:** 
- Complete Test Case 1 first (user must be registered)
- Google Sheet must be public (view-only)

**Steps:**
1. Open `login.html`
2. Username: `johndoe`
3. Password: `john123`
4. Click "Login"

**Expected Results:**
- ✅ Success message: "Login successful! Redirecting..."
- ✅ Redirects to `dashboard.html` after 1 second
- ✅ Dashboard shows user name: "John Doe"
- ✅ Navbar shows "👤 John Doe" dropdown

**Status:** 🔶 PENDING - **Requires Google Sheet to be public!**

---

### **Test Case 9: Login - Email Instead of Username**

**Objective:** Verify login works with email

**Steps:**
1. Open `login.html`
2. Username: `john@test.com` (email instead)
3. Password: `john123`
4. Click "Login"

**Expected Results:**
- ✅ Login successful
- ✅ Redirects to dashboard

**Status:** 🔶 PENDING

---

### **Test Case 10: Login - Wrong Password**

**Objective:** Verify wrong password is rejected

**Steps:**
1. Open `login.html`
2. Username: `johndoe`
3. Password: `wrongpass`
4. Click "Login"

**Expected Results:**
- ❌ Error message: "Invalid username/email or password. Please check your credentials."
- ❌ Does not redirect
- ❌ Stays on login page

**Status:** 🔶 PENDING

---

### **Test Case 11: Login - Non-existent User**

**Objective:** Verify non-existent user is rejected

**Steps:**
1. Open `login.html`
2. Username: `fakeuser`
3. Password: `anything`
4. Click "Login"

**Expected Results:**
- ❌ Error message: "Invalid username/email or password"
- ❌ Does not redirect

**Status:** 🔶 PENDING

---

### **Test Case 12: Login - Remember Me**

**Objective:** Verify persistent login

**Steps:**
1. Open `login.html`
2. Username: `johndoe`
3. Password: `john123`
4. ✅ Check "Remember me"
5. Click "Login"
6. Close browser completely
7. Reopen and visit any page

**Expected Results:**
- ✅ User still logged in
- ✅ Navbar shows user name
- ✅ No need to login again

**Status:** 🔶 PENDING

---

### **Test Case 13: Session Timeout**

**Objective:** Verify 24-hour session expiry

**Steps:**
1. Login without "Remember me"
2. Check localStorage `loginTime`
3. Manually change to 25 hours ago
4. Refresh page

**Expected Results:**
- ❌ User logged out automatically
- ❌ Navbar shows "Account" dropdown (login option)

**Status:** 🔶 PENDING

---

### **Test Case 14: Navigation - Account Dropdown (Logged Out)**

**Objective:** Verify navigation for logged-out users

**Steps:**
1. Make sure logged out
2. Visit `index.html`
3. Click "Account" dropdown

**Expected Results:**
- ✅ Shows "Login with Password" button
- ✅ Shows "Create Account" button
- ✅ Shows "Quick Login" form

**Status:** 🔶 PENDING

---

### **Test Case 15: Navigation - User Dropdown (Logged In)**

**Objective:** Verify navigation for logged-in users

**Steps:**
1. Login as `johndoe`
2. Visit `index.html`
3. Click user dropdown

**Expected Results:**
- ✅ Shows "👤 John Doe"
- ✅ Dropdown shows:
  - User name and email
  - Dashboard link
  - Book Table link
  - Logout button

**Status:** 🔶 PENDING

---

### **Test Case 16: Logout**

**Objective:** Verify logout functionality

**Steps:**
1. Login as `johndoe`
2. Click user dropdown
3. Click "Logout"

**Expected Results:**
- ✅ Redirects to `index.html`
- ✅ User logged out
- ✅ Navbar shows "Account" dropdown
- ✅ localStorage cleared

**Status:** 🔶 PENDING

---

### **Test Case 17: Dashboard Access (Logged In)**

**Objective:** Verify authenticated dashboard access

**Steps:**
1. Login as `johndoe`
2. Navigate to `dashboard.html`

**Expected Results:**
- ✅ Dashboard loads
- ✅ Shows user name: "Welcome, John Doe"
- ✅ Shows user email
- ✅ Shows bookings (if any)

**Status:** 🔶 PENDING

---

### **Test Case 18: Dashboard Access (Logged Out)**

**Objective:** Verify dashboard requires login

**Steps:**
1. Logout completely
2. Clear localStorage
3. Try to access `dashboard.html` directly

**Expected Results:**
- ⚠️ Dashboard should check for login
- ⚠️ May show empty or redirect

**Note:** Current dashboard may not enforce login - this is expected behavior

**Status:** 🔶 PENDING

---

### **Test Case 19: Quick Login (Header)**

**Objective:** Verify quick login still works

**Steps:**
1. Make sure logged out
2. Click "Account" dropdown
3. Fill quick login:
   - Name: `Jane Smith`
   - Email: `jane@test.com`
4. Click "Quick Login"

**Expected Results:**
- ✅ Login successful (24-hour session)
- ✅ Navbar shows "👤 Jane Smith"
- ✅ Can access dashboard

**Status:** 🔶 PENDING

---

### **Test Case 20: Google Sheet Data Verification**

**Objective:** Verify data stored correctly

**Steps:**
1. Complete registration for test user
2. Open Google Sheet
3. Check data

**Expected Results:**
- ✅ Row contains: Timestamp, Name, Email, Phone, Username, Password (base64), Address
- ✅ Password is encoded (not plain text)
- ✅ All fields populated correctly

**Status:** 🔶 PENDING

---

## 🔧 Pre-Test Checklist

Before running tests, ensure:

- [ ] Google Form is created and linked to Google Sheet
- [ ] Google Sheet is **PUBLIC** (Anyone with link → Viewer)
- [ ] Form field IDs are configured in `registration-service.js`
- [ ] Spreadsheet ID is configured in `auth-service.js`
- [ ] All JavaScript files are loaded correctly
- [ ] Browser console is open (F12) to check for errors

---

## 📊 Test Summary Template

After running all tests, fill this out:

| Test # | Test Case | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Valid Registration | 🔶 | |
| 2 | Invalid Email | 🔶 | |
| 3 | Short Password | 🔶 | |
| 4 | Password Mismatch | 🔶 | |
| 5 | Invalid Phone | 🔶 | |
| 6 | Short Username | 🔶 | |
| 7 | Password Strength | 🔶 | |
| 8 | Valid Login | 🔶 | |
| 9 | Email Login | 🔶 | |
| 10 | Wrong Password | 🔶 | |
| 11 | Non-existent User | 🔶 | |
| 12 | Remember Me | 🔶 | |
| 13 | Session Timeout | 🔶 | |
| 14 | Nav - Logged Out | 🔶 | |
| 15 | Nav - Logged In | 🔶 | |
| 16 | Logout | 🔶 | |
| 17 | Dashboard - Logged In | 🔶 | |
| 18 | Dashboard - Logged Out | 🔶 | |
| 19 | Quick Login | 🔶 | |
| 20 | Sheet Data | 🔶 | |

**Legend:**
- ✅ PASS
- ❌ FAIL
- 🔶 PENDING
- ⚠️ SKIP

---

## 🚨 Critical Issues to Check

### Issue 1: Google Sheet Not Public
**Symptom:** Login fails with 403 error
**Solution:** Share sheet → Anyone with link → Viewer

### Issue 2: Form Submission Fails
**Symptom:** Registration doesn't save to sheet
**Solution:** Check form settings, verify entry IDs

### Issue 3: No User Data in Sheet
**Symptom:** Login says "no users found"
**Solution:** Register at least one user first

---

## 🎯 Quick Test Commands

Open browser console (F12) and test:

```javascript
// Check if user is logged in
console.log('User Data:', localStorage.getItem('userData'));
console.log('Login Time:', localStorage.getItem('loginTime'));

// Check session validity
const loginTime = new Date(localStorage.getItem('loginTime'));
const now = new Date();
const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
console.log('Hours since login:', hoursDiff);

// Manually logout
localStorage.clear();
window.location.reload();
```

---

## 📞 Test Results

**Date Tested:** _________________

**Tester:** _________________

**Browser:** _________________

**Overall Status:** 🔶 PENDING

**Critical Bugs Found:** None yet

**Recommendations:** 
1. Make Google Sheet public before testing login
2. Test registration first to create test users
3. Use browser console to debug issues

---

## ✅ Sign-off

Once all tests pass:

- [ ] All 20 test cases executed
- [ ] Registration working correctly
- [ ] Login authentication working
- [ ] Session management working
- [ ] Navigation updated properly
- [ ] Data stored in Google Sheet correctly
- [ ] No critical bugs found

**System Ready for Production:** ⬜ YES  ⬜ NO

**Notes:** ________________________________________________________

