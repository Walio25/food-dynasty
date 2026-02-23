# Food Dynasty Auto-Reply System - Testing Checklist

## 🚀 Complete Setup Instructions

### Phase 1: Google Form Setup
- [ ] Create Google Form at forms.google.com
- [ ] Add all required fields (Name, Email, Phone, Purpose, Subject, Message)
- [ ] Set all fields as required
- [ ] Link form to Google Sheet for responses
- [ ] Make form publicly accessible

### Phase 2: Google Apps Script Setup
- [ ] Create new Apps Script project at script.google.com
- [ ] Copy code from google-apps-script-auto-reply.js
- [ ] Update CONFIG.FORM_RESPONSE_SHEET_ID with your Sheet ID
- [ ] Update restaurant contact details in CONFIG.RESTAURANT
- [ ] Save the script

### Phase 3: Trigger Configuration
- [ ] In Apps Script, go to Triggers
- [ ] Create trigger: Function=onFormSubmit, Source=Spreadsheet, Event=On form submit
- [ ] Select your Google Sheet
- [ ] Save trigger

### Phase 4: Get Form Field IDs
- [ ] Open your Google Form
- [ ] Create a pre-filled link (Send → Link → Pre-filled link)
- [ ] Fill sample data and get the link
- [ ] Extract entry IDs from the URL
- [ ] Update contact.html with correct entry IDs

### Phase 5: Website Integration
- [ ] Update contact.html with your Form ID and entry IDs
- [ ] Test form submission from your website
- [ ] Verify data appears in Google Sheet
- [ ] Check auto-reply email is sent

## 🧪 Testing Procedure

### Test 1: Basic Functionality
1. Submit test inquiry through your website contact form
2. Check Google Sheet for new response
3. Verify auto-reply email received
4. Check internal notification email

### Test 2: Different Inquiry Types
Test each purpose type:
- [ ] General Connecting
- [ ] Table Reservation  
- [ ] Catering Services
- [ ] Franchise Inquiry
- [ ] Other

### Test 3: Email Content Validation
- [ ] Personalized greeting with correct name
- [ ] Purpose-specific message and action items
- [ ] All contact details included
- [ ] Professional HTML formatting
- [ ] Correct response time mentioned

### Test 4: Error Handling
- [ ] Test with invalid email address
- [ ] Test with missing fields
- [ ] Verify error messages display correctly

## 🔧 Troubleshooting Guide

### Common Issues & Solutions

**Issue: Auto-reply not sending**
- Check trigger is properly set up
- Verify Google Sheet ID is correct
- Check Apps Script execution logs
- Test using testAutoReply() function

**Issue: Form submission fails**
- Verify Google Form is public
- Check entry IDs are correct
- Ensure form URL is correct
- Test direct form submission

**Issue: Wrong email content**
- Check purpose mapping in getPurposeConfiguration()
- Verify form data extraction in extractFormData()
- Test with different inquiry types

## 📊 Success Metrics

Your auto-reply system is working correctly when:
- ✅ Form submissions appear in Google Sheet within 1 minute
- ✅ Auto-reply emails sent within 2 minutes
- ✅ Internal notifications received
- ✅ Personalized content based on inquiry type
- ✅ Professional HTML email formatting
- ✅ All contact information included

## 🎯 Expected Benefits

1. **Immediate Response**: Customers get instant confirmation
2. **Professional Image**: Automated, personalized responses
3. **Better Customer Service**: Clear next steps and expectations
4. **Internal Efficiency**: Team gets organized notifications
5. **Data Tracking**: All inquiries stored in Google Sheet
6. **Cost-Free**: 100% free using Google services

## 📈 Monitoring & Maintenance

### Daily Monitoring
- Check Google Sheet for new inquiries
- Verify auto-reply system is working
- Respond to inquiries based on purpose type

### Weekly Maintenance  
- Review inquiry patterns and response times
- Update email templates if needed
- Check for any system errors

### Monthly Optimization
- Analyze most common inquiry types
- Optimize email templates based on feedback
- Update contact information if changed

---

**Support**: If you need help with any step, refer to the detailed code comments in the Apps Script file or test individual functions using the built-in testing features.