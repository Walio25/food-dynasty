# Google Sheets Billing Integration Setup Guide

## Overview
Your billing system will automatically save all bills to a new "Bills" sheet in your existing "Food Dynasty - Table Bookings (Responses)" spreadsheet using your **existing Google Apps Script**.

---

## ✅ Quick Setup (2 Steps Only!)

### Step 1: Update Your Existing Google Apps Script

1. Open your Google Sheet: **"Food Dynasty - Table Bookings (Responses)"**
2. Go to **Extensions** → **Apps Script**
3. You should see your existing booking email script
4. **Copy the new code** from `google-apps-script-booking-emails.js` in your project folder
5. **Replace everything** in the Apps Script editor with the new code
6. Click **Save** (💾 icon)

**What changed?**
- Added `handleSaveBill()` function to save bills to a new "Bills" sheet
- Your existing booking email system remains untouched
- Same Web App URL - no need to redeploy!

---

### Step 2: That's It!

The billing system will automatically use the **same Google Apps Script URL** that your booking system already uses.

No additional configuration needed! ✨

---

## How It Works

When you complete a bill in `billing.html`:

1. Bill is saved to **localStorage** (works offline)
2. Bill is **automatically synced** to Google Sheets "Bills" tab
3. Uses your **existing Web App URL** (already configured in email-service.js)

---

## Testing

1. Open `billing.html`
2. Add items to a bill
3. Click **"Complete & Print Bill"**
4. Check your Google Sheet - you'll see a new **"Bills"** sheet with the bill data!

---

## What Gets Saved

The "Bills" sheet will automatically be created with these columns:

| Column | Data |
|--------|------|
| Bill Number | FD202511270001 |
| Date | 2025-11-27 |
| Time | 14:30:45 |
| Customer Name | Walk-in Customer |
| Customer Phone | +91 9876543210 |
| Table Number | T5 |
| Items (JSON) | Full item details |
| Items Count | 5 |
| Subtotal | ₹850.00 |
| GST % | 5 |
| GST Amount | ₹42.50 |
| Discount % | 0 |
| Discount Amount | ₹0.00 |
| Total Amount | ₹892.50 |
| Payment Method | cash |
| Timestamp | Auto-generated |

---

## Benefits

✅ **Automatic backup** - Every bill saved to cloud
✅ **Single Web App** - Uses your existing booking script
✅ **No extra setup** - Works immediately after updating script
✅ **Real-time sync** - Bills appear in Google Sheets instantly
✅ **Easy reporting** - Export to Excel, create pivot tables
✅ **Secure** - Backed up in Google Cloud

---

## Troubleshooting

### Bills not appearing in Google Sheets?

1. **Check browser console** (Press F12)
   - Look for any errors
   - Should see: "✅ Bill saved to Google Sheets: FD..."

2. **Verify Web App URL**
   - Open browser console
   - Type: `localStorage.getItem('googleSheetsApiUrl')`
   - Should show your Apps Script URL

3. **Re-save Apps Script**
   - Go to Apps Script editor
   - Click Save
   - Wait 10 seconds
   - Try creating a bill again

### "Google Sheets integration not configured" message?

Your email service hasn't set the API URL yet. Temporarily add this line to `billing.html` before `</body>`:

```html
<script>
  // Set your Google Apps Script Web App URL
  localStorage.setItem('googleSheetsApiUrl', 'https://script.google.com/macros/s/YOUR_WEB_APP_URL/exec');
</script>
```

Replace `YOUR_WEB_APP_URL` with your actual Web App URL from Apps Script.

---

## Advanced: View Bills in Google Sheets

Once bills are saved, you can:

### Create Daily Summary
Add this formula in a new sheet:

```
=QUERY(Bills!A2:P, "SELECT B, COUNT(A), SUM(N) WHERE B = '"&TODAY()&"' GROUP BY B")
```

### Sales by Payment Method
```
=QUERY(Bills!A2:P, "SELECT O, COUNT(A), SUM(N) GROUP BY O")
```

### Top Selling Items
This requires parsing JSON, use Apps Script or export to analyze.

---

## That's All! 🎉

Your billing system is now fully integrated with Google Sheets using your existing Apps Script infrastructure.

Every bill is automatically backed up to the cloud! 💾✨
