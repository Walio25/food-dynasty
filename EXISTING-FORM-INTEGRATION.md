# Food Dynasty Auto-Reply Setup - Existing Google Form Integration

## 🎯 Quick Setup for Your Existing Form

You already have a working Google Form! Let's just add the auto-reply functionality to it.

### Your Current Form Details:
- **Form ID**: `1du6VVzTu_kTcn-01kDTjgaZuLJm7Uf4A6ymtffPVdUA`
- **Form URL**: https://docs.google.com/forms/d/1du6VVzTu_kTcn-01kDTjgaZuLJm7Uf4A6ymtffPVdUA
- **Status**: ✅ Already integrated with your website contact form

### Entry Fields (Already Configured):
- Name: `entry.933857689` ✅
- Email: `entry.1385602584` ✅  
- Phone: `entry.15487817` ✅
- Purpose: `entry.944656795` ✅
- Subject: `entry.831866008` ✅
- Message: `entry.482962501` ✅

---

## 🚀 Simple 3-Step Setup

### STEP 1: Find Your Google Sheet
1. Go to your Google Form: https://docs.google.com/forms/d/1du6VVzTu_kTcn-01kDTjgaZuLJm7Uf4A6ymtffPVdUA
2. Click **"Responses"** tab
3. If you don't see a Google Sheet, click the **Google Sheets icon** to create one
4. Open the Google Sheet and copy its ID from the URL

### STEP 2: Add Apps Script to Your Sheet  
1. In your Google Sheet, go to **Extensions** → **Apps Script**
2. Delete the default `myFunction()` code
3. Copy and paste the entire code from `google-apps-script-auto-reply.js`
4. **Replace** `YOUR_GOOGLE_SHEET_ID_HERE` with your actual Sheet ID
5. **Save** the project (Ctrl+S)

### STEP 3: Set Up Auto-Trigger
1. In Apps Script, click **Triggers** (clock icon on left)
2. Click **+ Add Trigger**
3. Configure:
   - **Function**: `onFormSubmit`
   - **Event source**: `From spreadsheet`  
   - **Event type**: `On form submit`
   - **Failure notification**: Daily
4. Click **Save**

---

## 🧪 Test Your Setup

### Option 1: Test via Website
1. Go to your website contact form
2. Fill out with your email address
3. Submit the form
4. Check your email for auto-reply

### Option 2: Test via Apps Script
1. In Apps Script, find the `testAutoReply()` function
2. Update the test email to your email
3. Click **Run** button
4. Check your email for test auto-reply

---

## ✅ What Happens When Someone Submits Your Form

1. **Form Submitted** → Data goes to your Google Sheet
2. **Trigger Activates** → Apps Script runs automatically  
3. **Auto-Reply Sent** → Customer gets personalized email
4. **Internal Notification** → You get notified of new inquiry
5. **Data Stored** → Everything saved in your sheet

---

## 📧 Auto-Reply Email Features

### Personalized Content:
- **General Inquiry**: "We'll respond within 24 hours"
- **Table Reservation**: "Confirmation call within 4 hours"  
- **Catering Services**: "Custom quote within 24-48 hours"
- **Franchise Inquiry**: "Consultant will call within 48 hours"

### Each Email Includes:
- ✅ Personal greeting with customer name
- ✅ Inquiry-specific response message
- ✅ Expected response timeframe  
- ✅ Complete restaurant contact details
- ✅ Professional HTML formatting
- ✅ Food Dynasty branding

---

## 🔧 Customization Options

### Update Restaurant Details:
Edit the `CONFIG.RESTAURANT` section in Apps Script:
```javascript
RESTAURANT: {
  name: 'Food Dynasty',
  email: 'fooddynasty@gmail.com', 
  phone: '+91 7777777777',
  address: '7th Street, Bagalkot, Karnataka, India',
  hours: 'Monday-Saturday: 7AM-11PM | Sunday: 8AM-11PM',
  website: 'https://your-actual-website.com'
}
```

### Modify Email Templates:
- Find `getPurposeConfiguration()` function
- Update messages for different inquiry types
- Change response timeframes
- Add custom actions

---

## 🎯 Success Checklist

- [ ] Google Sheet connected to your form
- [ ] Apps Script code added and saved
- [ ] Sheet ID updated in CONFIG
- [ ] Trigger created and active
- [ ] Test email received successfully
- [ ] Restaurant details updated
- [ ] Auto-reply working for all inquiry types

---

## 🆘 Need Help?

**Common Issues:**
- **No auto-reply received**: Check trigger setup and Sheet ID
- **Script error**: Check execution logs in Apps Script  
- **Wrong email content**: Verify field mapping in `extractFormData()`

**Support**: All the code is commented and includes error handling. Check the Apps Script logs for any issues.

---

**🎉 Congratulations!** Your existing Google Form now has professional auto-reply functionality!

All customer inquiries will receive immediate, personalized responses while you maintain complete control and data tracking through your Google Sheet.