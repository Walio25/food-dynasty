# ⚙️ Configuration Checklist

## 🎯 MANDATORY STEPS - DO THESE FIRST!

Your registration and login system is created, but needs these configurations to work:

---

## ✅ Step 1: Create Google Form

### 1. Go to Google Forms
- Visit: https://forms.google.com
- Click: **+ Blank** (create new form)
- Title: **Food Dynasty - User Registration**

### 2. Add These Questions (in exact order):

| # | Question Title | Answer Type | Required | Validation |
|---|----------------|-------------|----------|------------|
| 1 | Full Name | Short answer | ✅ Yes | None |
| 2 | Email Address | Short answer | ✅ Yes | Email |
| 3 | Phone Number | Short answer | ✅ Yes | Regular expression: `[0-9]{10}` |
| 4 | Username | Short answer | ✅ Yes | Regular expression: `[a-z0-9_]{4,}` |
| 5 | Password | Short answer | ✅ Yes | None |
| 6 | Address | Paragraph | ❌ No | None |

### 3. Form Settings
- Click **Settings** (⚙️ gear icon)
- Under **General**:
  - ✅ Check "Limit to 1 response"
- Click **Save**

### 4. Link to Google Sheet
- Click **Responses** tab
- Click **Link to Sheets** (green spreadsheet icon)
- Select **Create a new spreadsheet**
- Name: **Food Dynasty - User Database**
- Click **Create**

✅ **Form created!**

---

## ✅ Step 2: Get Form Field IDs

### 1. Create Pre-filled Link
- In your form, click **⋮** (three dots menu)
- Select **Get pre-filled link**
- Fill in sample data:
  ```
  Full Name: Test User
  Email Address: test@example.com
  Phone Number: 1234567890
  Username: testuser
  Password: test123
  Address: 123 Test Street
  ```
- Click **GET LINK**
- Click **COPY LINK**

### 2. Extract Entry IDs from URL
The copied URL looks like this (one long line):
```
https://docs.google.com/forms/d/e/1FAIpQLSc.../viewform?
usp=pp_url&
entry.933857689=Test+User&
entry.1385602584=test@example.com&
entry.15487817=1234567890&
entry.944656795=testuser&
entry.831866008=test123&
entry.482962501=123+Test+Street
```

**Copy YOUR entry IDs** (they will be different!):
- **Name field:** `entry.________`
- **Email field:** `entry.________`
- **Phone field:** `entry.________`
- **Username field:** `entry.________`
- **Password field:** `entry.________`
- **Address field:** `entry.________`

Also copy the **Form ID** from the URL:
- It's between `/d/e/` and `/viewform`
- Example: `1FAIpQLSc...` (long random string)

✅ **IDs extracted!**

---

## ✅ Step 3: Get Spreadsheet ID

### 1. Open Your Google Sheet
- Go to your **Food Dynasty - User Database** sheet
- Look at the URL in your browser

### 2. Copy Spreadsheet ID
URL format:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

The **Spreadsheet ID** is between `/d/` and `/edit`

Example:
```
https://docs.google.com/spreadsheets/d/1VRjJ9oCmfRoG0SPKA0qGetjTM8osSj1ELzVdl_hUf9o/edit
                                       ↑────────────────────────────────────────────↑
                                              This is your Spreadsheet ID
```

**Copy YOUR Spreadsheet ID:** `________________________`

✅ **Spreadsheet ID copied!**

---

## ✅ Step 4: Make Google Sheet Public

### 1. Share Your Sheet
- In your Google Sheet, click **Share** (top right)
- Click **Change to anyone with the link**
- Set permission dropdown to **Viewer**
- Click **Done**

⚠️ **Important:** This allows the website to read user data for login authentication. Passwords are encoded.

✅ **Sheet is public!**

---

## ✅ Step 5: Update JavaScript Files

### FILE 1: `js/registration-service.js`

**Open:** `c:\Users\parwa\OneDrive\Desktop\food-dynasty 2.6(gold)\js\registration-service.js`

**Find (around line 8):**
```javascript
this.GOOGLE_FORM = {
    url: 'https://docs.google.com/forms/d/e/YOUR_REGISTRATION_FORM_ID/formResponse',
    fields: {
        name: 'entry.YOUR_NAME_FIELD',
        email: 'entry.YOUR_EMAIL_FIELD',
        phone: 'entry.YOUR_PHONE_FIELD',
        username: 'entry.YOUR_USERNAME_FIELD',
        password: 'entry.YOUR_PASSWORD_FIELD',
        address: 'entry.YOUR_ADDRESS_FIELD'
    }
};
```

**Replace with YOUR values:**
```javascript
this.GOOGLE_FORM = {
    url: 'https://docs.google.com/forms/d/e/YOUR_ACTUAL_FORM_ID/formResponse',
    fields: {
        name: 'entry.YOUR_ACTUAL_NAME_ENTRY',
        email: 'entry.YOUR_ACTUAL_EMAIL_ENTRY',
        phone: 'entry.YOUR_ACTUAL_PHONE_ENTRY',
        username: 'entry.YOUR_ACTUAL_USERNAME_ENTRY',
        password: 'entry.YOUR_ACTUAL_PASSWORD_ENTRY',
        address: 'entry.YOUR_ACTUAL_ADDRESS_ENTRY'
    }
};
```

**Example (with actual IDs):**
```javascript
this.GOOGLE_FORM = {
    url: 'https://docs.google.com/forms/d/e/1FAIpQLSc...your-id.../formResponse',
    fields: {
        name: 'entry.933857689',
        email: 'entry.1385602584',
        phone: 'entry.15487817',
        username: 'entry.944656795',
        password: 'entry.831866008',
        address: 'entry.482962501'
    }
};
```

✅ **Save the file!**

---

### FILE 2: `js/auth-service.js`

**Open:** `c:\Users\parwa\OneDrive\Desktop\food-dynasty 2.6(gold)\js\auth-service.js`

**Find (around line 8):**
```javascript
this.SPREADSHEET_ID = 'YOUR_REGISTRATION_SPREADSHEET_ID';
```

**Replace with YOUR Spreadsheet ID:**
```javascript
this.SPREADSHEET_ID = '1VRjJ9oCmfRoG0SPKA0qGetjTM8osSj1ELzVdl_hUf9o';
```
*(Use your actual Spreadsheet ID from Step 3)*

✅ **Save the file!**

---

## ✅ Step 6: Test Everything

### Test 1: Registration
1. Open `register.html` in your browser
2. Fill in the form:
   ```
   Full Name: John Doe
   Email: john@test.com
   Phone: 1234567890
   Username: johndoe
   Password: john123
   Confirm Password: john123
   Address: 123 Main St
   ```
3. Accept terms
4. Click **Create Account**
5. Should see: ✅ "Registration Successful!"

**Verify:**
- Open your Google Sheet
- Should see new row with John Doe's data
- Password column should show encoded text (not "john123")

---

### Test 2: Login
1. Open `login.html` in your browser
2. Enter credentials:
   ```
   Username: johndoe
   Password: john123
   ```
3. Click **Login**
4. Should redirect to `dashboard.html`

**Verify:**
- Dashboard shows your name
- Navbar shows "👤 John Doe" dropdown
- Can access booking and other features

---

### Test 3: Session Persistence
1. Close your browser completely
2. Reopen and visit your website
3. Should still be logged in (if within 24 hours)
4. Navbar should show your name

**Verify:**
- Login persists across browser sessions
- Logout button works
- Can login again after logout

---

## ✅ Step 7: Update Navigation (Optional Enhancement)

All pages already have the updated navigation, but you can customize:

**To add Register link to footer** (all HTML pages):
```html
<div class="col-lg-3 col-md-6">
    <h4 class="section-title ff-secondary text-start text-primary fw-normal mb-4">Account</h4>
    <a class="btn btn-link" href="register.html">Register</a>
    <a class="btn btn-link" href="login.html">Login</a>
    <a class="btn btn-link" href="dashboard.html">Dashboard</a>
    <a class="btn btn-link" href="booking.html">Book Table</a>
</div>
```

---

## 🎯 CONFIGURATION SUMMARY

| Item | File | What to Update | Example |
|------|------|----------------|---------|
| Form URL | `js/registration-service.js` | Line 9: Form ID | `/d/e/1FAIpQLSc.../formResponse` |
| Name Field | `js/registration-service.js` | Line 11 | `entry.933857689` |
| Email Field | `js/registration-service.js` | Line 12 | `entry.1385602584` |
| Phone Field | `js/registration-service.js` | Line 13 | `entry.15487817` |
| Username Field | `js/registration-service.js` | Line 14 | `entry.944656795` |
| Password Field | `js/registration-service.js` | Line 15 | `entry.831866008` |
| Address Field | `js/registration-service.js` | Line 16 | `entry.482962501` |
| Spreadsheet ID | `js/auth-service.js` | Line 8 | `1VRjJ9oCmf...` |

---

## 🔍 Troubleshooting

### Registration not working?
- ✅ Check browser console (F12) for errors
- ✅ Verify form URL and entry IDs are correct
- ✅ Test form submission directly in Google Forms
- ✅ Check that form is linked to Google Sheet

### Login not working?
- ✅ Verify Spreadsheet ID is correct
- ✅ Check that Google Sheet is public (view only)
- ✅ Check browser console for API errors
- ✅ Try "Quick Login" (name + email) as fallback

### Data not appearing in Google Sheet?
- ✅ Verify form response settings
- ✅ Check entry field IDs match exactly
- ✅ Look in "Form Responses 1" sheet tab
- ✅ Test direct form submission in Google Forms

### Session not persisting?
- ✅ Check browser allows localStorage
- ✅ Verify login time stored correctly
- ✅ Use "Remember Me" for persistent login
- ✅ Check for browser privacy/incognito mode

---

## 📋 Quick Reference

### Files You Created:
```
✅ register.html                    - Registration page
✅ login.html                       - Login page
✅ js/registration-service.js       - Registration handler
✅ js/auth-service.js               - Login/authentication handler
✅ REGISTRATION-SETUP-GUIDE.md      - Detailed setup guide
✅ QUICK-START.md                   - Quick overview
✅ SYSTEM-FLOW-DIAGRAM.md           - Visual flow diagrams
✅ CONFIG-CHECKLIST.md              - This file
```

### Files You Updated:
```
✅ js/header-auth.js                - Enhanced for new auth system
✅ index.html                       - Added Account dropdown with links
```

### External Services:
```
✅ Google Form                      - Collects registration data
✅ Google Sheets                    - Stores user database
✅ Google Sheets API                - Reads user data for login
```

---

## 🎉 You're Ready!

After completing all 7 steps:

✅ Users can register with username & password
✅ Registration data stored in Google Sheets (Excel-compatible)
✅ Users can login with credentials
✅ Authentication validates against Google Sheets data
✅ Sessions persist for 24 hours (or permanent with "Remember Me")
✅ Seamless integration with existing website

**Next:** Test thoroughly, then deploy! 🚀

---

## 📞 Need Help?

Refer to these guides:
- **Quick Overview:** `QUICK-START.md`
- **Detailed Setup:** `REGISTRATION-SETUP-GUIDE.md`
- **System Architecture:** `SYSTEM-FLOW-DIAGRAM.md`
- **This Checklist:** `CONFIG-CHECKLIST.md`

All documentation is in your project folder! 📚
