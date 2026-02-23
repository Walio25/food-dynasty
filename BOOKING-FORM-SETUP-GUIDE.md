# 📅 Table Booking - Google Forms Setup Guide

## Overview
This guide will help you set up Google Forms to store table bookings and display them in the restaurant dashboard.

---

## 🎯 What You'll Get

✅ **Table bookings stored in Google Forms/Sheets**
✅ **Restaurant dashboard shows all bookings**
✅ **Real-time data from Google Sheets**
✅ **Email notifications via Google Apps Script**
✅ **Same system as contact form**

---

## 📋 Step 1: Create Google Form for Table Bookings

### 1.1 Create New Form

1. Go to https://forms.google.com
2. Click **"+ Blank"** to create new form
3. Title: **"Food Dynasty - Table Bookings"**
4. Description: *"Reserve your table at Food Dynasty"*

### 1.2 Add Form Fields

Add these questions **in this exact order**:

#### Question 1: Name
- **Type:** Short answer
- **Question:** Name
- **Required:** Yes

#### Question 2: Email
- **Type:** Short answer
- **Question:** Email
- **Required:** Yes
- **Validation:** Text → Email

#### Question 3: Phone
- **Type:** Short answer
- **Question:** Phone Number
- **Required:** Yes
- **Validation:** Regular expression → Matches → `^[0-9]{10,12}$`

#### Question 4: Date & Time
- **Type:** Date and time
- **Question:** Booking Date & Time
- **Required:** Yes
- **Include time:** Yes

#### Question 5: Number of People
- **Type:** Dropdown
- **Question:** Number of People
- **Required:** Yes
- **Options:**
  - 1 Person
  - 2 People
  - 3 People
  - 4 People
  - 5 People
  - 6 People
  - 7 People
  - 8 People
  - 9 People
  - 10 People

#### Question 6: Special Requests
- **Type:** Paragraph
- **Question:** Special Requests (Optional)
- **Required:** No

---

## 📊 Step 2: Link Form to Google Sheet

1. In your form, click **"Responses"** tab
2. Click the **Google Sheets icon** (green spreadsheet)
3. Select **"Create a new spreadsheet"**
4. Name it: **"Food Dynasty - Table Bookings"**
5. Click **Create**

The spreadsheet will open automatically with columns:
- A: Timestamp
- B: Name
- C: Email
- D: Phone Number
- E: Booking Date & Time
- F: Number of People
- G: Special Requests

---

## 🔗 Step 3: Get Form Entry IDs

### 3.1 Get Pre-filled Link

1. In your form, click the **three dots** (⋮) in top right
2. Select **"Get pre-filled link"**
3. Fill in sample data:
   - Name: Test User
   - Email: test@example.com
   - Phone: 9876543210
   - Date & Time: (select any date/time)
   - Number of People: 2 People
   - Special Requests: Window seat
4. Click **"Get link"** at the bottom
5. Click **"Copy link"**

### 3.2 Extract Entry IDs

The URL will look like:
```
https://docs.google.com/forms/d/e/FORM_ID/viewform?usp=pp_url&entry.1234567890=Test+User&entry.9876543210=test@example.com&...
```

**Copy the FORM_ID and all entry.XXXXXXX numbers!**

Example extraction:
- Form ID: `1FAIpQLSe...`
- Name: `entry.1234567890`
- Email: `entry.9876543210`
- Phone: `entry.1112223333`
- DateTime: `entry.4445556666`
- People: `entry.7778889999`
- Message: `entry.1110001111`

---

## 📊 Step 4: Get Spreadsheet ID

1. Open your **Google Sheet** (Table Bookings)
2. Look at the URL in your browser:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```
3. Copy the **SPREADSHEET_ID** (the long string between `/d/` and `/edit`)

---

## 🔐 Step 5: Make Spreadsheet Public

1. In Google Sheet, click **"Share"** button (top right)
2. Click **"Change to anyone with the link"**
3. Set permission to **"Viewer"**
4. Click **"Done"**

⚠️ **Important:** This allows the website to read booking data!

---

## 🔑 Step 6: Get Google Sheets API Key

### 6.1 Enable API

1. Go to https://console.cloud.google.com
2. Create new project: **"Food Dynasty Website"**
3. Go to **"APIs & Services"** → **"Library"**
4. Search for **"Google Sheets API"**
5. Click **"Enable"**

### 6.2 Create API Key

1. Go to **"APIs & Services"** → **"Credentials"**
2. Click **"Create Credentials"** → **"API Key"**
3. Copy the API key
4. Click **"Edit API Key"**
5. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Enable only: **Google Sheets API**
6. Click **"Save"**

---

## 💻 Step 7: Update Website Code

I've already created the file `js/booking-forms-service.js` with the integration code.

### Update Configuration

Open `js/booking-forms-service.js` and update:

```javascript
const CONFIG = {
    GOOGLE_FORM: {
        id: 'YOUR_FORM_ID_HERE',  // ⚠️ Paste from Step 3
        baseUrl: 'https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/formResponse',
        fields: {
            name: 'entry.XXXXXXX',      // ⚠️ Update from Step 3
            email: 'entry.XXXXXXX',     // ⚠️ Update from Step 3
            phone: 'entry.XXXXXXX',     // ⚠️ Update from Step 3
            datetime: 'entry.XXXXXXX',  // ⚠️ Update from Step 3
            people: 'entry.XXXXXXX',    // ⚠️ Update from Step 3
            message: 'entry.XXXXXXX'    // ⚠️ Update from Step 3
        }
    },
    
    GOOGLE_SHEETS: {
        spreadsheetId: 'YOUR_SPREADSHEET_ID',  // ⚠️ Paste from Step 4
        apiKey: 'YOUR_API_KEY',                // ⚠️ Paste from Step 6
        range: 'Form Responses 1!A2:G'
    }
};
```

---

## 📧 Step 8: Set Up Email Notifications

### Option 1: Use Existing Booking Email System

If you've already deployed `google-apps-script-booking-emails.js`:
- Emails will be sent via the Web App
- Works alongside Form submission
- Dual data storage (Form + Email logs)

### Option 2: Add Form Trigger for Emails

1. Open your **Table Bookings Sheet**
2. Go to **Extensions** → **Apps Script**
3. Copy code from `google-apps-script-booking-emails.js`
4. Update CONFIG section
5. Set up trigger:
   - Triggers → Add Trigger
   - Function: `onFormSubmit`
   - Event: On form submit
6. Save

Now emails send automatically when form is submitted!

---

## 🎨 Step 9: Test Everything

### Test Form Submission

1. Open your website booking page
2. Fill out the booking form
3. Submit

### Verify Data

1. **Check Google Form responses:**
   - Open Form → Responses tab
   - See new submission

2. **Check Google Sheet:**
   - Open Sheet
   - See new row with data

3. **Check Restaurant Dashboard:**
   - Go to restaurant-login.html
   - Login
   - See bookings in dashboard

4. **Check Emails:**
   - Customer should receive confirmation
   - Restaurant should receive notification

---

## ⚙️ Customization Options

### Modify Form Fields

To add/remove fields:
1. Update Google Form questions
2. Get new pre-filled link
3. Update entry IDs in `booking-forms-service.js`
4. Update `GOOGLE_SHEETS.range` if columns change

### Change Dashboard Display

Edit `js/dashboard.js` or `restaurant-dashboard.html` to:
- Change table columns
- Add filters (by date, status, etc.)
- Add search functionality
- Export to Excel

---

## 🔧 Troubleshooting

### Issue: Form submission fails

**Check:**
- Form ID correct in config
- Entry IDs match your form
- Form is accepting responses

**Solution:**
- Get fresh pre-filled link
- Verify all entry IDs
- Check browser console for errors

---

### Issue: Dashboard shows "No bookings"

**Check:**
- Spreadsheet ID correct
- Spreadsheet is public (Anyone with link)
- API key enabled for Sheets API
- Range is correct (`Form Responses 1!A2:G`)

**Solution:**
- Make sheet public
- Verify API key restrictions
- Check network tab for 403 errors

---

### Issue: Emails not sending

**Check:**
- Apps Script deployed
- Trigger set up (on form submit)
- Email addresses in CONFIG

**Solution:**
- See `GOOGLE-APPS-SCRIPT-EMAIL-SETUP.md`
- Check Apps Script execution logs
- Verify permissions granted

---

## 📊 Data Flow Diagram

```
Website Booking Form
        ↓
   Submit Form
        ↓
    ┌───────────────────┐
    │                   │
    ↓                   ↓
Google Form      Email Service
    ↓              (Apps Script)
Google Sheet           ↓
    ↓            Send Emails
    ↓                   ↓
Restaurant      Customer + Restaurant
Dashboard       Notifications
```

---

## ✅ Setup Checklist

- [ ] Google Form created with 6 fields
- [ ] Form linked to Google Sheet
- [ ] Pre-filled link generated
- [ ] Entry IDs extracted
- [ ] Spreadsheet ID copied
- [ ] Spreadsheet made public
- [ ] Google Sheets API enabled
- [ ] API Key created and restricted
- [ ] `booking-forms-service.js` updated with:
  - [ ] Form ID
  - [ ] Entry IDs (all 6)
  - [ ] Spreadsheet ID
  - [ ] API Key
- [ ] `booking.html` includes new script
- [ ] Test form submission successful
- [ ] Data appears in Google Sheet
- [ ] Dashboard displays bookings
- [ ] Emails being sent (optional)

---

## 🎯 Expected Results

After setup:

1. **Customer books table on website**
2. **Data saves to Google Form/Sheet**
3. **Customer receives email confirmation**
4. **Restaurant receives email notification**
5. **Booking appears in restaurant dashboard**
6. **Real-time data sync from Google Sheets**

---

## 💡 Tips

1. **Test with your own email first**
2. **Keep Form ID and API Key secure**
3. **Monitor Google Sheets quota** (100 reads/min)
4. **Back up Sheet regularly**
5. **Add data validation in Form** (phone, email)
6. **Consider booking status field** (Confirmed, Cancelled)

---

## 📞 Support

### Need Help?

1. **Form not submitting:**
   - Check browser console (F12)
   - Verify entry IDs match

2. **Dashboard not loading:**
   - Check API key
   - Verify sheet is public
   - Check spreadsheet ID

3. **Emails not working:**
   - See `GOOGLE-APPS-SCRIPT-EMAIL-SETUP.md`
   - Check Apps Script logs

---

## 🎉 Success!

Once complete, you'll have:

✅ Google Form collecting bookings
✅ Google Sheet storing all data
✅ Restaurant dashboard showing bookings
✅ Email notifications working
✅ Real-time data synchronization
✅ 100% free solution!

Enjoy your integrated booking system! 🍽️
