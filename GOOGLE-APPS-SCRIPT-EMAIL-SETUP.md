# 📧 Google Apps Script Email System Setup Guide

## Overview
This guide will help you set up email notifications using Google Apps Script instead of EmailJS. This solution is **100% free** and more reliable for production use.

---

## 🎯 What You'll Get

✅ **Customer Confirmation Emails** - Beautiful HTML emails sent to customers
✅ **Restaurant Notifications** - Instant alerts for new bookings
✅ **No Cost** - Completely free using Google Apps Script
✅ **Reliable** - Uses Gmail infrastructure
✅ **Professional** - Custom branded email templates
✅ **Automatic** - Works 24/7 without maintenance

---

## 📋 Setup Steps

### Step 1: Create Google Apps Script Project

1. **Go to Google Apps Script**
   - Visit: https://script.google.com
   - Sign in with your Google account

2. **Create New Project**
   - Click **"New Project"**
   - Name it: **"Food Dynasty Booking Emails"**

3. **Copy the Code**
   - Open the file: `google-apps-script-booking-emails.js` in your project folder
   - Copy **ALL** the code
   - Paste it into the Code.gs editor (replace default code)
   - Click **Save** (disk icon)

---

### Step 2: Configure Email Settings

1. **Update Configuration** (in Code.gs)
   
   Find the `CONFIG` section at the top and update:

   ```javascript
   const CONFIG = {
     RESTAURANT: {
       name: 'Food Dynasty',
       email: 'YOUR-RESTAURANT-EMAIL@gmail.com',  // ⚠️ CHANGE THIS
       phone: '+91 7777777777',
       address: '7th Street, Bagalkot, Karnataka',
       hours: 'Monday-Saturday: 7AM-11PM | Sunday: 8AM-11PM'
     },
     
     EMAIL: {
       fromName: 'Food Dynasty Reservations',
       replyToEmail: 'YOUR-REPLY-EMAIL@gmail.com'  // ⚠️ CHANGE THIS
     }
   };
   ```

2. **Save Changes**
   - Click **Save** (Ctrl+S)

---

### Step 3: Test the System

1. **Run Health Check**
   - In the function dropdown, select: **`systemHealthCheck`**
   - Click **Run** (▶️ button)
   - First time: Click **Review permissions** → Allow access
   - Check your email for health check confirmation

2. **Run Test Booking**
   - Select function: **`testBookingEmail`**
   - Update test email in the function (line 460):
     ```javascript
     email: 'your-test-email@example.com',  // ⚠️ CHANGE THIS
     ```
   - Click **Run**
   - Check your inbox for 2 test emails

---

### Step 4: Deploy as Web App

1. **Click Deploy**
   - Click **Deploy** → **New deployment**

2. **Configure Deployment**
   - Click gear icon ⚙️ → Select type: **Web app**
   - Description: `Food Dynasty Booking API`
   - Execute as: **Me (your-email@gmail.com)**
   - Who has access: **Anyone**
   - Click **Deploy**

3. **Copy Web App URL**
   - You'll get a URL like:
     ```
     https://script.google.com/macros/s/AKfycbx.../exec
     ```
   - **COPY THIS URL** - You'll need it in the next step

---

### Step 5: Update Your Website

1. **Open** `js/email-service.js`

2. **Find this line** (near the top):
   ```javascript
   webAppUrl: 'YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE'
   ```

3. **Replace with your Web App URL**:
   ```javascript
   webAppUrl: 'https://script.google.com/macros/s/AKfycbx.../exec'
   ```

4. **Save the file**

---

### Step 6: Test Live Booking

1. **Open your website**
   - Navigate to the booking page

2. **Fill out the booking form**
   - Use a real email address you can check

3. **Submit the booking**
   - You should see success message

4. **Check Emails**
   - Customer email should arrive within 30 seconds
   - Restaurant notification should arrive within 30 seconds

---

## 🔧 Optional: Google Form Integration

If you want bookings to also work through Google Forms:

### Create Booking Form

1. **Create Google Form**
   - Go to: https://forms.google.com
   - Create new form: "Table Bookings"

2. **Add Questions**
   - Name (Short answer - Required)
   - Email (Short answer - Required)
   - Phone (Short answer - Required)
   - Date & Time (Date and time - Required)
   - Number of People (Dropdown: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 - Required)
   - Special Requests (Paragraph - Optional)

3. **Link to Spreadsheet**
   - Click **Responses** tab
   - Click spreadsheet icon
   - Create new spreadsheet: "Table Bookings"

### Set Up Trigger

1. **Open Spreadsheet**
   - Click the green spreadsheet icon in Form responses

2. **Open Apps Script**
   - Extensions → Apps Script

3. **Paste Same Code**
   - Copy code from `google-apps-script-booking-emails.js`
   - Paste into Code.gs
   - Update CONFIG section

4. **Create Trigger**
   - Click **Triggers** (clock icon) in left sidebar
   - Click **Add Trigger**
   - Function: `onFormSubmit`
   - Event source: **From spreadsheet**
   - Event type: **On form submit**
   - Click **Save**

5. **Test Form**
   - Fill out your Google Form
   - Submit it
   - Check emails arrive

---

## 📊 Monitoring & Logs

### View Execution Logs

1. **In Apps Script Editor**
   - Click **Executions** (list icon) in left sidebar
   - See all email sending events
   - Check for errors

2. **Check Logs**
   - Select an execution to see detailed logs
   - Verify emails were sent successfully

---

## ⚠️ Troubleshooting

### Emails Not Sending

**Problem:** No emails arrive after booking

**Solutions:**
1. Check spam/junk folder
2. Verify Web App URL is correct in `js/email-service.js`
3. Check Apps Script Executions for errors
4. Run `systemHealthCheck()` function manually
5. Verify email addresses in CONFIG are correct

---

### Permission Errors

**Problem:** "Authorization required" or "Permission denied"

**Solutions:**
1. Run any function manually (like `systemHealthCheck`)
2. Click **Review permissions**
3. Click your Google account
4. Click **Advanced** → **Go to Food Dynasty Booking Emails (unsafe)**
5. Click **Allow**

---

### CORS Errors in Browser Console

**Problem:** Browser shows CORS errors

**Solution:**
- This is **NORMAL** with `mode: 'no-cors'`
- Emails are still sent successfully
- You can't read the response, but the script executes
- Check your inbox to verify emails arrive

---

### Gmail Quota Limits

**Problem:** Emails stop sending after many bookings

**Solution:**
- Free Gmail accounts: 100 emails/day
- Google Workspace: 1,500 emails/day
- Each booking = 2 emails (customer + restaurant)
- Monitor usage in Apps Script dashboard

---

## 🎨 Customizing Email Templates

### Edit Customer Email

1. **Find function:** `generateCustomerEmailHTML`
2. **Modify HTML:**
   - Change colors: Update `#FEA116` to your brand color
   - Add logo: Insert `<img>` tag in header
   - Edit text: Update welcome messages
3. **Save and test**

### Edit Restaurant Email

1. **Find function:** `generateRestaurantEmailHTML`
2. **Customize alert level**
3. **Add custom fields**

---

## 📈 Advanced Features

### Save Bookings to Spreadsheet

1. **Create Spreadsheet**
   - Go to: https://sheets.google.com
   - Create: "Website Bookings Log"
   - Get Spreadsheet ID from URL

2. **Enable in Code**
   - Find `saveToSpreadsheet` function (line 415)
   - Replace: `YOUR_SPREADSHEET_ID_HERE`
   - Uncomment the function call in `doPost`

---

## 🔐 Security Best Practices

1. **Use Google Workspace email** for better deliverability
2. **Enable 2-factor authentication** on Google account
3. **Review permissions** regularly in Apps Script
4. **Monitor execution logs** for suspicious activity
5. **Keep Web App URL private** (don't share publicly)

---

## 📞 Support

### Need Help?

1. **Check Logs:**
   - Apps Script → Executions
   - Browser Console (F12)

2. **Test Functions:**
   - Run `systemHealthCheck()`
   - Run `testBookingEmail()`

3. **Verify Setup:**
   - CONFIG section updated
   - Web App deployed
   - Permissions granted
   - URL added to email-service.js

---

## ✅ Checklist

Before going live, verify:

- [ ] Apps Script project created
- [ ] Code pasted and saved
- [ ] CONFIG section updated with your emails
- [ ] `systemHealthCheck()` runs successfully
- [ ] `testBookingEmail()` sends emails
- [ ] Web App deployed
- [ ] Web App URL copied
- [ ] `js/email-service.js` updated with URL
- [ ] Test booking from website works
- [ ] Both customer and restaurant emails arrive
- [ ] Emails not in spam folder
- [ ] EmailJS script removed from booking.html

---

## 🚀 Going Live

Once all tests pass:

1. ✅ Remove EmailJS references completely
2. ✅ Test 3 bookings from different devices
3. ✅ Verify all emails arrive within 1 minute
4. ✅ Check formatting on mobile devices
5. ✅ Monitor for first 24 hours
6. ✅ Set up email forwarding rules if needed

---

## 📝 Maintenance

**Regular Tasks:**
- Check execution logs weekly
- Monitor email delivery rates
- Update templates as needed
- Review quota usage monthly

**No Maintenance Needed:**
- System runs 24/7 automatically
- Google handles all infrastructure
- No server costs or management
- Auto-scales with traffic

---

## 🎉 Success!

Your email system is now running on Google Apps Script!

**Benefits:**
- ✅ No monthly costs
- ✅ Reliable Gmail infrastructure  
- ✅ Professional email templates
- ✅ Automatic notifications
- ✅ Full control over templates
- ✅ Better deliverability than EmailJS

Enjoy your free, reliable email system! 🍽️
