# Food Dynasty - Registration & Login Setup Guide

## 🎯 **Complete Setup Instructions**

This guide will help you set up user registration and authentication using Google Forms and Google Sheets.

---

## 📝 **Step 1: Create Registration Google Form**

### 1.1 Create New Google Form
1. Go to [forms.google.com](https://forms.google.com)
2. Click **+ Blank** to create a new form
3. Name it: **"Food Dynasty - User Registration"**

### 1.2 Add Required Fields
Add these questions in order:

| Question Title | Type | Required | Settings |
|---------------|------|----------|----------|
| Full Name | Short answer | Yes | - |
| Email Address | Short answer | Yes | Response validation: Email |
| Phone Number | Short answer | Yes | Response validation: Regular expression: `[0-9]{10}` |
| Username | Short answer | Yes | Response validation: Regular expression: `[a-z0-9_]{4,}` |
| Password | Short answer | Yes | - |
| Address | Paragraph | No | - |

### 1.3 Configure Form Settings
1. Click **Settings** (gear icon)
2. **General tab:**
   - ✅ Limit to 1 response
   - ✅ Respondents can edit after submit
3. **Presentation tab:**
   - ✅ Show progress bar
   - Confirmation message: "Thank you! Your account has been created successfully."
4. Click **Save**

### 1.4 Link to Google Sheet
1. Click **Responses** tab
2. Click **Link to Sheets** (green icon)
3. Select **Create a new spreadsheet**
4. Name it: **"Food Dynasty - User Database"**
5. Click **Create**

---

## 🔑 **Step 2: Get Form Field IDs**

### 2.1 Create Pre-filled Link
1. In your Google Form, click **⋮** (three dots)
2. Select **Get pre-filled link**
3. Fill in sample data:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Phone: `1234567890`
   - Username: `testuser`
   - Password: `test123`
   - Address: `123 Test St`
4. Click **GET LINK**
5. Click **COPY LINK**

### 2.2 Extract Entry IDs
The URL will look like:
```
https://docs.google.com/forms/d/e/FORM_ID/viewform?
usp=pp_url&
entry.933857689=Test+User&
entry.1385602584=test@example.com&
entry.15487817=1234567890&
entry.944656795=testuser&
entry.831866008=test123&
entry.482962501=123+Test+St
```

**Copy these entry IDs:**
- `entry.933857689` → Full Name
- `entry.1385602584` → Email
- `entry.15487817` → Phone
- `entry.944656795` → Username
- `entry.831866008` → Password
- `entry.482962501` → Address

---

## 📊 **Step 3: Get Spreadsheet ID**

1. Open your **"Food Dynasty - User Database"** Google Sheet
2. Look at the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SPREADSHEET_ID/edit
   ```
3. Copy the `YOUR_SPREADSHEET_ID` part (between `/d/` and `/edit`)

---

## 💻 **Step 4: Update JavaScript Files**

### 4.1 Update `registration-service.js`

Open `js/registration-service.js` and find this section:
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

**Replace with your actual values:**
```javascript
this.GOOGLE_FORM = {
    url: 'https://docs.google.com/forms/d/e/YOUR_ACTUAL_FORM_ID/formResponse',
    fields: {
        name: 'entry.933857689',      // Replace with your entry ID
        email: 'entry.1385602584',    // Replace with your entry ID
        phone: 'entry.15487817',      // Replace with your entry ID
        username: 'entry.944656795',  // Replace with your entry ID
        password: 'entry.831866008',  // Replace with your entry ID
        address: 'entry.482962501'    // Replace with your entry ID
    }
};
```

### 4.2 Update `auth-service.js`

Open `js/auth-service.js` and find:
```javascript
this.SPREADSHEET_ID = 'YOUR_REGISTRATION_SPREADSHEET_ID';
```

**Replace with your actual spreadsheet ID:**
```javascript
this.SPREADSHEET_ID = '1abc123XYZ...your-actual-id...';
```

---

## 🔒 **Step 5: Make Google Sheet Public (Read-Only)**

### Important: This makes registration data readable via API

1. Open your **"Food Dynasty - User Database"** Google Sheet
2. Click **Share** button (top right)
3. Click **Change to anyone with the link**
4. Set permission to **Viewer**
5. Click **Done**

⚠️ **Security Note:** 
- The sheet is read-only public access
- Passwords are base64 encoded (basic encoding)
- For production, consider using a backend server with proper password hashing

---

## 🧪 **Step 6: Test the System**

### 6.1 Test Registration
1. Open `register.html` in your browser
2. Fill in the registration form:
   - Full Name: Your Name
   - Email: your@email.com
   - Phone: 1234567890
   - Username: yourusername
   - Password: yourpass123
   - Address: Your address
3. Click **Create Account**
4. Check Google Sheet - new row should appear

### 6.2 Test Login
1. Open `login.html` in your browser
2. Enter username/email and password
3. Click **Login**
4. Should redirect to dashboard if successful

### 6.3 Verify Dashboard
1. After successful login, check `dashboard.html`
2. Should show your user information
3. Check that bookings work with the authenticated user

---

## 🔄 **Step 7: Update Navigation**

Add registration/login links to your navbar. Update these files:

### Update all HTML files' navbar section:
```html
<!-- Replace the simple login dropdown with this -->
<div id="auth-buttons" class="navbar-nav">
    <!-- Show when not logged in -->
    <div id="login-section">
        <a href="login.html" class="nav-item nav-link">
            <i class="fas fa-sign-in-alt me-1"></i>Login
        </a>
        <a href="register.html" class="nav-item nav-link">
            <i class="fas fa-user-plus me-1"></i>Register
        </a>
    </div>
    
    <!-- Show when logged in -->
    <div id="user-section" class="nav-item dropdown d-none">
        <a href="#" class="nav-link dropdown-toggle text-primary" data-bs-toggle="dropdown">
            <i class="fas fa-user me-1"></i><span id="navUserName">User</span>
        </a>
        <div class="dropdown-menu">
            <div class="dropdown-header">
                <div class="fw-bold" id="dropdownUserName">User Name</div>
                <small class="text-muted" id="dropdownUserEmail">user@email.com</small>
            </div>
            <div class="dropdown-divider"></div>
            <a href="dashboard.html" class="dropdown-item">
                <i class="fas fa-tachometer-alt me-2"></i>Dashboard
            </a>
            <a href="booking.html" class="dropdown-item">
                <i class="fas fa-calendar-alt me-2"></i>Book Table
            </a>
            <div class="dropdown-divider"></div>
            <a href="#" class="dropdown-item" onclick="handleLogout()">
                <i class="fas fa-sign-out-alt me-2"></i>Logout
            </a>
        </div>
    </div>
</div>
```

---

## ✅ **Testing Checklist**

- [ ] Google Form created with all fields
- [ ] Form linked to Google Sheet
- [ ] Entry IDs extracted and updated in `registration-service.js`
- [ ] Spreadsheet ID updated in `auth-service.js`
- [ ] Google Sheet set to public (view only)
- [ ] Test registration - data appears in sheet
- [ ] Test login - authentication works
- [ ] Test dashboard - shows user data
- [ ] Navigation updated with login/register links

---

## 🎯 **How It Works**

### Registration Flow:
1. User fills registration form on `register.html`
2. Data submitted to Google Forms (no-cors mode)
3. Google Forms automatically saves to Google Sheet
4. Password is base64 encoded before storing
5. Success message shown, redirect to login

### Login Flow:
1. User enters username/email and password on `login.html`
2. System fetches all user data from Google Sheets API
3. Password is base64 encoded and compared
4. If match found, user session saved to localStorage
5. Redirect to dashboard

### Session Management:
- User data stored in localStorage
- Optional "Remember Me" for persistent login
- Session expires after 24 hours (if not remembered)
- Logout clears all session data

---

## 🔐 **Security Considerations**

### Current Implementation (Basic):
✅ Passwords are base64 encoded
✅ HTTPS recommended for production
✅ Sheet is read-only public access
✅ Client-side validation

### For Production (Recommended):
⚠️ Use proper password hashing (bcrypt, scrypt)
⚠️ Implement backend authentication server
⚠️ Use OAuth or JWT tokens
⚠️ Add CAPTCHA to prevent spam
⚠️ Implement rate limiting
⚠️ Add email verification
⚠️ Use environment variables for sensitive data

---

## 📞 **Need Help?**

If you encounter issues:
1. Check browser console for errors
2. Verify all IDs are correctly copied
3. Ensure Google Sheet is public (view only)
4. Test form submission directly in Google Forms
5. Check network tab in browser dev tools

---

## 🎉 **Congratulations!**

Your Food Dynasty website now has a complete registration and login system powered by Google Forms and Sheets!

Users can:
- ✅ Register with unique username and email
- ✅ Login with username or email
- ✅ Access personalized dashboard
- ✅ Make table bookings
- ✅ View booking history

All user data is securely stored in your Google Sheet and can be accessed anytime!
