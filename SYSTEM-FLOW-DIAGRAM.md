# Food Dynasty - Registration & Login Flow Diagram

## 📊 Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FOOD DYNASTY WEBSITE                             │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
              ┌─────▼──────┐                 ┌─────▼──────┐
              │  NEW USER  │                 │   EXISTING │
              │            │                 │    USER    │
              └─────┬──────┘                 └─────┬──────┘
                    │                               │
                    │                               │
         ┌──────────▼──────────┐         ┌─────────▼──────────┐
         │  REGISTRATION FLOW   │         │    LOGIN FLOW      │
         └──────────┬──────────┘         └─────────┬──────────┘
                    │                               │
                    │                               │
```

---

## 1️⃣ REGISTRATION FLOW

```
┌──────────────┐
│ register.html│  User visits registration page
└──────┬───────┘
       │
       │ User fills form:
       │ - Full Name
       │ - Email
       │ - Phone
       │ - Username
       │ - Password (+ confirm)
       │ - Address (optional)
       │
       ▼
┌─────────────────────────┐
│ registration-service.js │  Client-side validation
└─────────┬───────────────┘
          │
          │ ✅ Validation checks:
          │    • Email format valid?
          │    • Phone is 10 digits?
          │    • Username 4+ chars?
          │    • Password 6+ chars with letters & numbers?
          │    • Passwords match?
          │    • Terms accepted?
          │
          ▼
          ❓
      ┌───────┐
      │ Valid?│
      └───┬───┘
          │
    ┌─────┴─────┐
    │           │
   NO          YES
    │           │
    │           ▼
    │   ┌──────────────────┐
    │   │ Encode password  │  password → btoa(password)
    │   │   (base64)       │  Example: "test123" → "dGVzdDEyMw=="
    │   └────────┬─────────┘
    │            │
    │            ▼
    │   ┌──────────────────────────────┐
    │   │   Submit to Google Forms     │
    │   │   (no-cors mode)             │
    │   └────────┬─────────────────────┘
    │            │
    │            │ Data sent via POST with params:
    │            │ • entry.XXX = name
    │            │ • entry.XXX = email
    │            │ • entry.XXX = phone
    │            │ • entry.XXX = username
    │            │ • entry.XXX = encoded_password
    │            │ • entry.XXX = address
    │            │
    │            ▼
    │   ┌──────────────────────────────┐
    │   │      GOOGLE FORMS            │
    │   │  (Auto-saves responses)      │
    │   └────────┬─────────────────────┘
    │            │
    │            │ Automatically stored in
    │            ▼
    │   ┌──────────────────────────────┐
    │   │     GOOGLE SHEETS            │
    │   │  "Form Responses 1"          │
    │   │                              │
    │   │  Columns:                    │
    │   │  A: Timestamp                │
    │   │  B: Full Name                │
    │   │  C: Email                    │
    │   │  D: Phone                    │
    │   │  E: Username                 │
    │   │  F: Password (base64)        │
    │   │  G: Address                  │
    │   └────────┬─────────────────────┘
    │            │
    │            ▼
    │   ┌──────────────────────────────┐
    │   │   ✅ SUCCESS MESSAGE         │
    │   │                              │
    │   │  "Registration Successful!"  │
    │   │   [Go to Login]  [Home]      │
    │   └──────────────────────────────┘
    │
    ▼
┌─────────────────┐
│ ❌ ERROR MESSAGE│
│                 │
│ Show validation │
│    errors       │
└─────────────────┘
```

---

## 2️⃣ LOGIN FLOW

```
┌──────────────┐
│  login.html  │  User visits login page
└──────┬───────┘
       │
       │ User enters:
       │ - Username or Email
       │ - Password
       │ - [✓] Remember Me (optional)
       │
       ▼
┌─────────────────┐
│ auth-service.js │  Login handler
└─────────┬───────┘
          │
          │ Step 1: Fetch user database
          ▼
┌─────────────────────────────────┐
│  Fetch from Google Sheets API   │
│                                 │
│  URL: https://sheets.googleapis │
│       .com/v4/spreadsheets/     │
│       {SPREADSHEET_ID}/values/  │
│       Form Responses 1!A2:G     │
│                                 │
│  With API Key: AIzaSyB2x...     │
└─────────┬───────────────────────┘
          │
          │ Returns all user data (array)
          ▼
┌─────────────────────────────────┐
│  [                              │
│    {                            │
│      timestamp: "11/21/2025",   │
│      name: "John Doe",          │
│      email: "john@email.com",   │
│      phone: "1234567890",       │
│      username: "johndoe",       │
│      password: "dGVzdDEyMw==",  │
│      address: "123 Main St"     │
│    },                           │
│    { ... more users ... }       │
│  ]                              │
└─────────┬───────────────────────┘
          │
          │ Step 2: Authenticate user
          ▼
┌──────────────────────────────────┐
│  Encode input password           │
│  inputPassword → btoa(password)  │
└─────────┬────────────────────────┘
          │
          ▼
┌──────────────────────────────────┐
│  Find matching user where:       │
│  (username === input OR          │
│   email === input)               │
│  AND                             │
│  password === encoded_password   │
└─────────┬────────────────────────┘
          │
          ▼
          ❓
      ┌────────┐
      │ Match? │
      └───┬────┘
          │
    ┌─────┴─────┐
    │           │
   NO          YES
    │           │
    │           ▼
    │   ┌──────────────────────────┐
    │   │  Save to localStorage:   │
    │   │  • userData (JSON)       │
    │   │  • userName              │
    │   │  • userEmail             │
    │   │  • loginTime (ISO)       │
    │   │  • authToken             │
    │   │  • rememberMe (bool)     │
    │   └────────┬─────────────────┘
    │            │
    │            ▼
    │   ┌──────────────────────────┐
    │   │  ✅ LOGIN SUCCESSFUL     │
    │   │                          │
    │   │  Redirecting to          │
    │   │  dashboard...            │
    │   └────────┬─────────────────┘
    │            │
    │            │ After 1 second
    │            ▼
    │   ┌──────────────────────────┐
    │   │    dashboard.html        │
    │   │                          │
    │   │  Shows user info         │
    │   │  Shows bookings          │
    │   │  Allows table booking    │
    │   └──────────────────────────┘
    │
    ▼
┌────────────────────┐
│ ❌ ERROR MESSAGE  │
│                    │
│ "Invalid username/ │
│  email or password"│
└────────────────────┘
```

---

## 3️⃣ SESSION MANAGEMENT

```
┌─────────────────────────────────┐
│      User navigates site        │
└────────┬────────────────────────┘
         │
         │ On every page load
         ▼
┌──────────────────────────────────┐
│     header-auth.js               │
│  checkExistingLogin()            │
└────────┬─────────────────────────┘
         │
         ▼
┌──────────────────────────────────┐
│  Read from localStorage:         │
│  • userData                      │
│  • loginTime                     │
│  • authToken                     │
│  • rememberMe                    │
└────────┬─────────────────────────┘
         │
         ▼
         ❓
    ┌────────┐
    │  Has   │
    │ data?  │
    └───┬────┘
        │
   ┌────┴────┐
   │         │
  NO        YES
   │         │
   │         ▼
   │    ┌────────────────────────┐
   │    │ Calculate time since   │
   │    │ login (hours)          │
   │    └────────┬───────────────┘
   │             │
   │             ▼
   │             ❓
   │        ┌─────────┐
   │        │Remember │
   │        │  Me?    │
   │        └────┬────┘
   │             │
   │        ┌────┴────┐
   │        │         │
   │       YES       NO
   │        │         │
   │        │         ▼
   │        │    ┌──────────┐
   │        │    │ < 24 hrs?│
   │        │    └────┬─────┘
   │        │         │
   │        │    ┌────┴────┐
   │        │    │         │
   │        │   YES       NO
   │        │    │         │
   │        ▼    ▼         │
   │   ┌─────────────┐    │
   │   │ KEEP LOGIN  │    │
   │   │             │    │
   │   │ Show user   │    │
   │   │ in navbar   │    │
   │   └─────────────┘    │
   │                      │
   ▼                      ▼
┌────────────────┐  ┌──────────────┐
│  SHOW LOGIN    │  │  AUTO LOGOUT │
│   BUTTON       │  │              │
│                │  │ Clear storage│
│ User must      │  │ Show login   │
│ login again    │  │ button       │
└────────────────┘  └──────────────┘
```

---

## 4️⃣ NAVBAR STATE MANAGEMENT

```
┌──────────────────────────────────────────────────────┐
│                    NAVBAR                            │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ Checks login state
                 ▼
            ┌─────────┐
            │ Logged  │
            │   in?   │
            └────┬────┘
                 │
          ┌──────┴──────┐
          │             │
         NO            YES
          │             │
          ▼             ▼
┌─────────────────┐  ┌──────────────────────────┐
│ LOGIN SECTION   │  │   USER SECTION           │
│                 │  │                          │
│ ┌─────────────┐ │  │ ┌──────────────────────┐ │
│ │  "Account"  │ │  │ │  👤 John Doe     ▼   │ │
│ │      ▼      │ │  │ │                      │ │
│ └─────────────┘ │  │ └──────────────────────┘ │
│       │         │  │          │               │
│  ┌────┴────┐    │  │    ┌─────┴──────┐        │
│  │Dropdown │    │  │    │  Dropdown  │        │
│  └────┬────┘    │  │    └─────┬──────┘        │
│       │         │  │          │               │
│  ┌────▼─────────────┐  │  ┌───▼────────────┐  │
│  │ 🔐 Login with    │  │  │ John Doe       │  │
│  │    Password      │  │  │ john@email.com │  │
│  │                  │  │  ├────────────────┤  │
│  │ 👤 Create        │  │  │ 📊 Dashboard   │  │
│  │    Account       │  │  │ 📅 Book Table  │  │
│  │                  │  │  ├────────────────┤  │
│  │ ─── OR ───       │  │  │ 🚪 Logout      │  │
│  │                  │  │  └────────────────┘  │
│  │ Quick Login:     │  │                      │
│  │ [Name field]     │  │                      │
│  │ [Email field]    │  │                      │
│  │ [Quick Login]    │  │                      │
│  └──────────────────┘  └──────────────────────┘
└─────────────────┘  └──────────────────────────┘
```

---

## 5️⃣ DATA FLOW SUMMARY

```
┌─────────────────────────────────────────────────────────────┐
│                      DATA FLOW                              │
└─────────────────────────────────────────────────────────────┘

REGISTRATION:
Website (register.html)
    ↓ Form submission
registration-service.js (validation)
    ↓ POST request
Google Forms
    ↓ Auto-save
Google Sheets (User Database)


LOGIN:
Website (login.html)
    ↓ Credentials
auth-service.js
    ↓ Fetch data
Google Sheets API
    ↓ User array
auth-service.js (validation)
    ↓ Match found
localStorage (session)
    ↓ Redirect
Dashboard


SESSION:
Every page load
    ↓ Check
header-auth.js
    ↓ Read
localStorage
    ↓ Validate time
Still valid?
    ├─ YES → Show user info
    └─ NO  → Auto logout


LOGOUT:
User clicks logout
    ↓
Clear localStorage
    ↓
Redirect to home
```

---

## 6️⃣ FILE RELATIONSHIPS

```
┌──────────────────────────────────────────────────────────────┐
│                    FILE STRUCTURE                             │
└──────────────────────────────────────────────────────────────┘

HTML FILES:
├── register.html
│   └── Uses: registration-service.js
│   └── Creates: New user in Google Sheets
│   └── Redirects to: login.html (after success)
│
├── login.html
│   └── Uses: auth-service.js
│   └── Reads from: Google Sheets
│   └── Redirects to: dashboard.html (after success)
│
├── index.html (+ all other pages)
│   └── Uses: header-auth.js
│   └── Shows: Login button or User info
│   └── Links to: register.html, login.html
│
└── dashboard.html
    └── Requires: Active session in localStorage
    └── Shows: User bookings and info


JAVASCRIPT FILES:
├── js/registration-service.js
│   ├── Validates registration form
│   ├── Submits to Google Forms
│   └── Encodes password (base64)
│
├── js/auth-service.js
│   ├── Fetches user data from Google Sheets
│   ├── Validates login credentials
│   ├── Manages user session
│   └── Handles auto-redirect
│
└── js/header-auth.js
    ├── Checks existing login on page load
    ├── Updates navbar UI
    ├── Handles quick login (name + email)
    ├── Manages logout
    └── Compatible with both auth systems


GOOGLE INTEGRATION:
├── Google Form (Registration)
│   └── Entry fields for user data
│   └── Auto-saves to Google Sheets
│
└── Google Sheets (User Database)
    ├── Stores all user registrations
    ├── Public read-only access
    └── Accessed via Sheets API
```

---

## 🔐 SECURITY LAYERS

```
CLIENT-SIDE VALIDATION
    ├── Email format check
    ├── Phone number validation (10 digits)
    ├── Username format (alphanumeric + underscore)
    ├── Password strength (6+ chars, letters + numbers)
    ├── Password confirmation match
    └── Terms acceptance

DATA ENCODING
    ├── Password → base64 encoding
    │   Example: "test123" → "dGVzdDEyMw=="
    └── Stored in Google Sheets

SESSION MANAGEMENT
    ├── 24-hour auto-expiry (default)
    ├── Optional "Remember Me" (persistent)
    ├── Stored in localStorage
    └── Validated on every page load

API ACCESS
    ├── Google Sheets: Public read-only
    ├── Google Forms: POST submission (no-cors)
    └── API Key: Restricted to Sheets API
```

---

## 📱 USER JOURNEY MAP

```
NEW USER:
1. Lands on website
2. Clicks "Account" → "Create Account"
3. Fills registration form
4. Clicks "Create Account"
5. Sees success message
6. Clicks "Go to Login"
7. Enters credentials
8. Redirected to dashboard
9. Can book tables, view history
10. Stays logged in for 24 hours (or permanent if "Remember Me")


RETURNING USER:
1. Lands on website
2. Clicks "Account" → "Login with Password"
3. Enters username/email + password
4. Checks "Remember Me" (optional)
5. Redirected to dashboard
6. Session maintained across visits


QUICK LOGIN USER (No registration):
1. Lands on website
2. Clicks "Account" dropdown
3. Enters name + email in quick form
4. Clicks "Quick Login"
5. Can book tables immediately
6. Session expires in 24 hours
```

---

## 🎯 KEY INTEGRATION POINTS

```
┌────────────────────────────────────────────────────┐
│        SYSTEM INTEGRATION POINTS                   │
└────────────────────────────────────────────────────┘

1. GOOGLE FORMS
   File: js/registration-service.js
   Lines: 8-17 (Configuration)
   Action: Submit registration data
   Format: URLSearchParams with entry.XXX values

2. GOOGLE SHEETS API
   File: js/auth-service.js
   Lines: 8-10 (Configuration)
   Action: Fetch user data for authentication
   Format: Sheets API v4 REST endpoint

3. LOCALSTORAGE
   Files: auth-service.js, header-auth.js
   Keys stored:
   - userData (JSON object)
   - userName (string)
   - userEmail (string)
   - loginTime (ISO string)
   - authToken (string)
   - rememberMe (boolean)

4. NAVBAR UI
   File: index.html (all pages)
   Elements:
   - #login-section (show when logged out)
   - #user-section (show when logged in)
   - Updated by header-auth.js

5. DASHBOARD
   File: dashboard.html
   Reads: localStorage userData
   Shows: User-specific bookings and info
```

This flow diagram shows the complete architecture of your registration and login system! 🎉
