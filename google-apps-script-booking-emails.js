
/**
 * Food Dynasty Booking Email System - Google Apps Script
 * 
 * ⚠️  DEPLOYMENT INSTRUCTIONS:
 * 1. Create a Google Form for table bookings with these fields:
 *    - Name (Short answer)
 *    - Email (Short answer)
 *    - Phone (Short answer) 
 *    - Date & Time (Date and time)
 *    - Number of People (Dropdown: 1-10)
 *    - Special Requests (Paragraph)
 * 
 * 2. Link form to Google Sheet (Responses tab)
 * 
 * 3. Go to Extensions → Apps Script
 * 4. Copy this ENTIRE file content to Code.gs
 * 5. Click Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL
 * 7. Update js/email-service.js with the Web App URL
 * 
 * 8. Set up form submission trigger:
 *    - Triggers → Add Trigger
 *    - Function: onFormSubmit
 *    - Event source: From spreadsheet
 *    - Event type: On form submit
 * 
 * 9. Test with testBookingEmail() function
 * 
 * 🎯 PRODUCTION READY - Configure emails below
 */

// ==================== CONFIGURATION ====================
const CONFIG = {
  RESTAURANT: {
    name: 'Food Dynasty',
    email: 'w864643@gmail.com',  // ⚠️ UPDATE: Your restaurant email
    phone: '+91 7777777777',
    address: '7th Street, Bagalkot, Karnataka',
    hours: 'Monday-Saturday: 7AM-11PM | Sunday: 8AM-11PM'
  },
  
  EMAIL: {
    fromName: 'Food Dynasty Reservations',
    replyToEmail: 'waliozing@gmail.com'  // ⚠️ UPDATE: Your reply-to email
  },
  
  // Form field column indexes (0-based, after timestamp)
  FORM_FIELDS: {
    name: 1,        // Column B
    email: 2,       // Column C
    phone: 3,       // Column D
    datetime: 4,    // Column E
    people: 5,      // Column F
    message: 6      // Column G (special requests)
  }
};

// ==================== MAIN FUNCTIONS ====================

/**
 * Handle form submission - Auto-send emails
 * This runs automatically when someone books a table via Google Form
 */
function onFormSubmit(e) {
  try {
    if (!e || !e.values || e.values.length < 7) {
      throw new Error('Invalid form submission');
    }
    
    const bookingData = extractBookingData(e);
    
    // Send customer confirmation email
    sendCustomerEmail(bookingData);
    
    // Send restaurant notification email
    sendRestaurantEmail(bookingData);
    
    Logger.log('Booking emails sent successfully for: ' + bookingData.name);
    
  } catch (error) {
    // Send error notification to admin
    MailApp.sendEmail({
      to: CONFIG.RESTAURANT.email,
      subject: '🚨 Booking Email System Error',
      body: `Error occurred:\n\n${error.message}\n\nTime: ${new Date()}\n\nPlease check the system.`
    });
    
    Logger.log('Error in onFormSubmit: ' + error.message);
  }
}

/**
 * Web App endpoint - Handle booking requests from website
 * Called directly from js/email-service.js
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    
    // Handle billing requests
    if (data.action === 'saveBill') {
      return handleSaveBill(data);
    }
    
    // Handle get bills request
    if (data.action === 'getBills') {
      return handleGetBills(data);
    }
    
    // Handle status update requests
    if (data.action === 'updateStatus') {
      return handleStatusUpdate(data);
    }
    
    // Handle get status requests
    if (data.action === 'getStatuses') {
      return handleGetStatuses();
    }
    
    // Validate required fields for booking
    if (!data.name || !data.email || !data.datetime || !data.people) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: 'Missing required fields'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const bookingData = {
      id: generateBookingId(),
      name: data.name,
      email: data.email,
      phone: data.phone || 'Not provided',
      datetime: data.datetime,
      people: data.people,
      message: data.message || 'None',
      timestamp: new Date()
    };
    
    // Send both emails
    const customerResult = sendCustomerEmail(bookingData);
    const restaurantResult = sendRestaurantEmail(bookingData);
    
    // Save to spreadsheet (optional - if you want to track web bookings)
    saveToSpreadsheet(bookingData);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      bookingId: bookingData.id,
      customer: { success: customerResult },
      restaurant: { success: restaurantResult }
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.message);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests - Return bills or statuses as JSONP
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const callback = e.parameter.callback || 'callback';
    
    // Handle getBills action
    if (action === 'getBills') {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const billsSheet = ss.getSheetByName('Bills');
      
      if (!billsSheet) {
        const jsonp = callback + '(' + JSON.stringify({
          success: true,
          bills: [],
          message: 'No bills found'
        }) + ')';
        return ContentService.createTextOutput(jsonp)
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      
      const billsData = billsSheet.getDataRange().getValues();
      
      // Skip header row
      if (billsData.length <= 1) {
        const jsonp = callback + '(' + JSON.stringify({
          success: true,
          bills: [],
          message: 'No bills available'
        }) + ')';
        return ContentService.createTextOutput(jsonp)
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      }
      
      // Convert sheet data to bill objects
      const bills = [];
      for (let i = 1; i < billsData.length; i++) {
        const row = billsData[i];
        
        // Parse items JSON
        let items = [];
        try {
          items = JSON.parse(row[6]); // Items column
        } catch (e) {
          items = [];
        }
        
        bills.push({
          billNumber: row[0],
          date: row[1],
          time: row[2],
          customerName: row[3],
          customerPhone: row[4] || '',
          tableNumber: row[5] || '',
          items: items,
          itemsCount: row[7],
          subtotal: parseFloat(row[8]) || 0,
          gstPercent: parseFloat(row[9]) || 0,
          gstAmount: parseFloat(row[10]) || 0,
          discountPercent: parseFloat(row[11]) || 0,
          discountAmount: parseFloat(row[12]) || 0,
          total: parseFloat(row[13]) || 0,
          paymentMethod: row[14] || 'cash',
          timestamp: row[15]
        });
      }
      
      const jsonp = callback + '(' + JSON.stringify({
        success: true,
        bills: bills,
        count: bills.length
      }) + ')';
      
      return ContentService.createTextOutput(jsonp)
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    }
    
    // Handle getStatuses action (default)
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const statusSheet = ss.getSheetByName('Booking Statuses');
    
    const statuses = {};
    
    if (statusSheet) {
      const data = statusSheet.getDataRange().getValues();
      
      // Skip header row
      for (let i = 1; i < data.length; i++) {
        if (data[i][0]) {  // If booking ID exists
          statuses[data[i][0]] = data[i][1];  // bookingId: status
        }
      }
    }
    
    const jsonp = callback + '(' + JSON.stringify({ success: true, statuses: statuses }) + ')';
    
    return ContentService.createTextOutput(jsonp)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
    
  } catch (error) {
    Logger.log('Error in doGet: ' + error.message);
    const callback = e.parameter.callback || 'callback';
    const jsonp = callback + '(' + JSON.stringify({ success: false, error: error.message }) + ')';
    return ContentService.createTextOutput(jsonp)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

/**
 * Extract booking data from form submission
 */
function extractBookingData(e) {
  const values = e.values;
  
  return {
    id: generateBookingId(),
    timestamp: values[0],
    name: values[CONFIG.FORM_FIELDS.name] || '',
    email: values[CONFIG.FORM_FIELDS.email] || '',
    phone: values[CONFIG.FORM_FIELDS.phone] || 'Not provided',
    datetime: values[CONFIG.FORM_FIELDS.datetime] || '',
    people: values[CONFIG.FORM_FIELDS.people] || '1',
    message: values[CONFIG.FORM_FIELDS.message] || 'None'
  };
}

/**
 * Generate unique booking ID
 */
function generateBookingId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `FD-${timestamp}-${random}`;
}

// ==================== EMAIL FUNCTIONS ====================

/**
 * Send confirmation email to customer
 */
function sendCustomerEmail(bookingData) {
  try {
    const htmlBody = generateCustomerEmailHTML(bookingData);
    
    MailApp.sendEmail({
      to: bookingData.email,
      subject: `✅ Table Booking Confirmed - ${CONFIG.RESTAURANT.name}`,
      htmlBody: htmlBody,
      name: CONFIG.EMAIL.fromName,
      replyTo: CONFIG.EMAIL.replyToEmail
    });
    
    return true;
    
  } catch (error) {
    Logger.log('Customer email error: ' + error.message);
    return false;
  }
}

/**
 * Send notification email to restaurant
 */
function sendRestaurantEmail(bookingData) {
  try {
    const htmlBody = generateRestaurantEmailHTML(bookingData);
    
    MailApp.sendEmail({
      to: CONFIG.RESTAURANT.email,
      subject: `🔔 New Table Booking - ${bookingData.name} - ${bookingData.people} People`,
      htmlBody: htmlBody,
      name: CONFIG.EMAIL.fromName
    });
    
    return true;
    
  } catch (error) {
    Logger.log('Restaurant email error: ' + error.message);
    return false;
  }
}

// ==================== EMAIL TEMPLATES ====================

/**
 * Customer confirmation email template
 */
function generateCustomerEmailHTML(booking) {
  const formattedDateTime = formatDateTime(booking.datetime);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #FEA116; color: white; padding: 30px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .content { padding: 30px 20px; background: #f9f9f9; }
    .booking-card { background: white; padding: 20px; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .booking-details { margin: 15px 0; }
    .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
    .detail-label { font-weight: bold; color: #666; display: inline-block; width: 150px; }
    .detail-value { color: #333; }
    .highlight { color: #FEA116; font-weight: bold; }
    .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
    .button { display: inline-block; padding: 12px 30px; background: #FEA116; color: white; text-decoration: none; border-radius: 5px; margin: 15px 0; }
    .info-box { background: #fff3cd; border-left: 4px solid #FEA116; padding: 15px; margin: 15px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ ${CONFIG.RESTAURANT.name}</h1>
      <p style="margin: 10px 0 0 0; font-size: 18px;">Table Booking Confirmation</p>
    </div>
    
    <div class="content">
      <h2 style="color: #333;">Dear ${booking.name},</h2>
      
      <p style="font-size: 16px;">Thank you for choosing <span class="highlight">${CONFIG.RESTAURANT.name}</span>! 
      We're delighted to confirm your table reservation.</p>
      
      <div class="booking-card">
        <h3 style="margin-top: 0; color: #FEA116;">📋 Your Reservation Details</h3>
        
        <div class="booking-details">
          <div class="detail-row">
            <span class="detail-label">🆔 Booking ID:</span>
            <span class="detail-value">${booking.id}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">👤 Name:</span>
            <span class="detail-value">${booking.name}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">📧 Email:</span>
            <span class="detail-value">${booking.email}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">📱 Phone:</span>
            <span class="detail-value">${booking.phone}</span>
          </div>
          
          <div class="detail-row" style="background: #fff3cd;">
            <span class="detail-label">📅 Date & Time:</span>
            <span class="detail-value" style="font-weight: bold;">${formattedDateTime}</span>
          </div>
          
          <div class="detail-row" style="background: #fff3cd;">
            <span class="detail-label">👥 Number of People:</span>
            <span class="detail-value" style="font-weight: bold;">${booking.people}</span>
          </div>
          
          <div class="detail-row">
            <span class="detail-label">💬 Special Requests:</span>
            <span class="detail-value">${booking.message}</span>
          </div>
        </div>
      </div>
      
      <div class="info-box">
        <h4 style="margin-top: 0;">✅ What's Next?</h4>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>Your table has been reserved and confirmed</li>
          <li>Please arrive 10 minutes before your reservation time</li>
          <li>Bring this confirmation email or reference your Booking ID</li>
          <li>For any changes, contact us at least 2 hours in advance</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 25px 0;">
        <a href="tel:${CONFIG.RESTAURANT.phone}" class="button">📞 Call to Modify</a>
      </div>
      
      <div class="booking-card">
        <h3 style="margin-top: 0; color: #333;">📍 Restaurant Information</h3>
        <p style="margin: 5px 0;"><strong>📌 Address:</strong> ${CONFIG.RESTAURANT.address}</p>
        <p style="margin: 5px 0;"><strong>📞 Phone:</strong> ${CONFIG.RESTAURANT.phone}</p>
        <p style="margin: 5px 0;"><strong>📧 Email:</strong> ${CONFIG.RESTAURANT.email}</p>
        <p style="margin: 5px 0;"><strong>🕒 Opening Hours:</strong> ${CONFIG.RESTAURANT.hours}</p>
      </div>
      
      <p style="font-size: 14px; color: #666; margin-top: 20px;">
        <strong>Cancellation Policy:</strong> Please notify us at least 2 hours in advance if you need to cancel 
        or modify your reservation.
      </p>
      
      <p style="margin-top: 25px;">We look forward to serving you an unforgettable dining experience!</p>
      
      <p>Warm regards,<br>
      <strong>The ${CONFIG.RESTAURANT.name} Team</strong></p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} ${CONFIG.RESTAURANT.name}. All rights reserved.</p>
      <p style="margin: 5px 0;">📧 ${CONFIG.RESTAURANT.email} | 📞 ${CONFIG.RESTAURANT.phone}</p>
      <p style="margin: 15px 0 5px 0; font-size: 12px; opacity: 0.8;">
        Booking Reference: ${booking.id}<br>
        Confirmation sent: ${new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Restaurant notification email template
 */
function generateRestaurantEmailHTML(booking) {
  const formattedDateTime = formatDateTime(booking.datetime);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { background: #dc3545; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9f9f9; }
    .alert-box { background: #fff3cd; border-left: 4px solid #FEA116; padding: 15px; margin: 15px 0; }
    .booking-info { background: white; padding: 20px; margin: 15px 0; border-radius: 5px; }
    .detail-row { padding: 8px 0; border-bottom: 1px solid #eee; }
    .label { font-weight: bold; color: #666; display: inline-block; width: 180px; }
    .value { color: #333; }
    .highlight { background: #fff3cd; padding: 10px; margin: 10px 0; border-radius: 5px; }
    .footer { background: #333; color: white; padding: 15px; text-align: center; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 NEW TABLE BOOKING</h1>
      <p style="margin: 5px 0; font-size: 16px;">Immediate Action Required</p>
    </div>
    
    <div class="content">
      <div class="alert-box">
        <h3 style="margin-top: 0;">⚠️ NEW RESERVATION RECEIVED</h3>
        <p style="margin: 5px 0;"><strong>Booking Time:</strong> ${new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}</p>
        <p style="margin: 5px 0;"><strong>Status:</strong> <span style="color: #dc3545; font-weight: bold;">PENDING CONFIRMATION</span></p>
      </div>
      
      <div class="booking-info">
        <h3 style="margin-top: 0; color: #FEA116;">📋 Booking Details</h3>
        
        <div class="detail-row">
          <span class="label">🆔 Booking ID:</span>
          <span class="value" style="font-weight: bold;">${booking.id}</span>
        </div>
        
        <div class="detail-row">
          <span class="label">👤 Customer Name:</span>
          <span class="value">${booking.name}</span>
        </div>
        
        <div class="detail-row">
          <span class="label">📧 Email:</span>
          <span class="value"><a href="mailto:${booking.email}">${booking.email}</a></span>
        </div>
        
        <div class="detail-row">
          <span class="label">📱 Phone:</span>
          <span class="value"><a href="tel:${booking.phone}">${booking.phone}</a></span>
        </div>
        
        <div class="highlight">
          <div class="detail-row" style="border: none;">
            <span class="label">📅 Date & Time:</span>
            <span class="value" style="font-weight: bold; font-size: 16px;">${formattedDateTime}</span>
          </div>
          
          <div class="detail-row" style="border: none;">
            <span class="label">👥 Number of People:</span>
            <span class="value" style="font-weight: bold; font-size: 16px;">${booking.people}</span>
          </div>
        </div>
        
        <div class="detail-row">
          <span class="label">💬 Special Requests:</span>
          <span class="value">${booking.message}</span>
        </div>
      </div>
      
      <div class="alert-box" style="background: #d1ecf1; border-left-color: #0c5460;">
        <h4 style="margin-top: 0;">📌 Action Items:</h4>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li>✅ Customer confirmation email sent automatically</li>
          <li>📞 Contact customer to reconfirm: <strong>${booking.phone}</strong></li>
          <li>🍽️ Prepare table for ${booking.people} people</li>
          <li>✍️ Note special requests: ${booking.message}</li>
          <li>📅 Add to reservation calendar: ${formattedDateTime}</li>
        </ul>
      </div>
      
      <p style="text-align: center; margin: 20px 0;">
        <a href="tel:${booking.phone}" style="display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">
          📞 Call Customer Now
        </a>
      </p>
    </div>
    
    <div class="footer">
      <p style="margin: 5px 0;">🍽️ ${CONFIG.RESTAURANT.name} Reservation System</p>
      <p style="margin: 5px 0; font-size: 11px; opacity: 0.8;">
        Automated notification - ${new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format date and time for display
 */
function formatDateTime(datetime) {
  try {
    const date = new Date(datetime);
    return date.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    return datetime;
  }
}

/**
 * Save booking to spreadsheet (optional)
 * Only use if you want to track website bookings separately
 */
function saveToSpreadsheet(booking) {
  try {
    // ⚠️ UPDATE: Replace with your spreadsheet ID
    const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
    const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getActiveSheet();
    
    sheet.appendRow([
      booking.timestamp,
      booking.id,
      booking.name,
      booking.email,
      booking.phone,
      booking.datetime,
      booking.people,
      booking.message,
      'Website Booking'
    ]);
    
    return true;
  } catch (error) {
    Logger.log('Spreadsheet save error: ' + error.message);
    return false;
  }
}

// ==================== TEST FUNCTIONS ====================

/**
 * Test function - Run manually to test email system
 */
function testBookingEmail() {
  const testBooking = {
    id: 'FD-TEST-12345',
    name: 'Test Customer',
    email: 'your-test-email@example.com',  // ⚠️ UPDATE: Your test email
    phone: '+91 9876543210',
    datetime: new Date(Date.now() + 86400000), // Tomorrow
    people: '4',
    message: 'Window seat preferred, celebrating anniversary',
    timestamp: new Date()
  };
  
  Logger.log('Sending test emails...');
  
  const customerResult = sendCustomerEmail(testBooking);
  const restaurantResult = sendRestaurantEmail(testBooking);
  
  Logger.log('Customer email: ' + (customerResult ? 'SUCCESS' : 'FAILED'));
  Logger.log('Restaurant email: ' + (restaurantResult ? 'SUCCESS' : 'FAILED'));
  
  return {
    customer: customerResult,
    restaurant: restaurantResult
  };
}

/**
 * System health check
 */
function systemHealthCheck() {
  try {
    MailApp.sendEmail({
      to: CONFIG.RESTAURANT.email,
      subject: '✅ Booking Email System - Health Check',
      body: `System Status: OPERATIONAL\n\nTime: ${new Date().toLocaleString('en-IN', {timeZone: 'Asia/Kolkata'})}\n\nAll systems ready.`
    });
    
    return 'Health check passed';
  } catch (error) {
    throw new Error('Health check failed: ' + error.message);
  }
}

// ==================== BILLING MANAGEMENT ====================

/**
 * Handle save bill to Google Sheets
 */
function handleSaveBill(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let billsSheet = ss.getSheetByName('Bills');
    
    // Create Bills sheet if it doesn't exist
    if (!billsSheet) {
      billsSheet = ss.insertSheet('Bills');
      
      // Add headers
      const headers = [
        'Bill Number',
        'Date',
        'Time',
        'Customer Name',
        'Customer Phone',
        'Table Number',
        'Items (JSON)',
        'Items Count',
        'Subtotal',
        'GST %',
        'GST Amount',
        'Discount %',
        'Discount Amount',
        'Total Amount',
        'Payment Method',
        'Timestamp'
      ];
      
      billsSheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      billsSheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      billsSheet.getRange(1, 1, 1, headers.length).setBackground('#FEA116');
      billsSheet.getRange(1, 1, 1, headers.length).setFontColor('#FFFFFF');
      billsSheet.setFrozenRows(1);
    }
    
    // Prepare row data
    const rowData = [
      data.billNumber,
      data.date,
      data.time,
      data.customerName,
      data.customerPhone || '',
      data.tableNumber || '',
      JSON.stringify(data.items),
      data.items.length,
      data.subtotal,
      data.gstPercent,
      data.gstAmount,
      data.discountPercent,
      data.discountAmount,
      data.total,
      data.paymentMethod,
      new Date().toISOString()
    ];
    
    // Append the data
    billsSheet.appendRow(rowData);
    
    // Auto-resize columns
    billsSheet.autoResizeColumns(1, 16);
    
    Logger.log('Bill saved successfully: ' + data.billNumber);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Bill saved successfully',
      billNumber: data.billNumber
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error saving bill: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== BILLS MANAGEMENT ====================

/**
 * Handle get bills request from frontend
 */
function handleGetBills(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const billsSheet = ss.getSheetByName('Bills');
    
    if (!billsSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        bills: [],
        message: 'No bills found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const billsData = billsSheet.getDataRange().getValues();
    
    // Skip header row
    if (billsData.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        bills: [],
        message: 'No bills available'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Convert sheet data to bill objects
    const bills = [];
    for (let i = 1; i < billsData.length; i++) {
      const row = billsData[i];
      
      // Parse items JSON
      let items = [];
      try {
        items = JSON.parse(row[6]); // Items column
      } catch (e) {
        items = [];
      }
      
      bills.push({
        billNumber: row[0],
        date: row[1],
        time: row[2],
        customerName: row[3],
        customerPhone: row[4] || '',
        tableNumber: row[5] || '',
        items: items,
        itemsCount: row[7],
        subtotal: parseFloat(row[8]) || 0,
        gstPercent: parseFloat(row[9]) || 0,
        gstAmount: parseFloat(row[10]) || 0,
        discountPercent: parseFloat(row[11]) || 0,
        discountAmount: parseFloat(row[12]) || 0,
        total: parseFloat(row[13]) || 0,
        paymentMethod: row[14] || 'cash',
        timestamp: row[15]
      });
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      bills: bills,
      count: bills.length
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in handleGetBills: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message,
      bills: []
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ==================== STATUS MANAGEMENT ====================

/**
 * Handle status update from dashboard
 */
function handleStatusUpdate(data) {
  try {
    const bookingId = data.bookingId;
    const newStatus = data.status;
    const timestamp = new Date().toISOString();
    
    // Get customer info for sending email
    const customerName = data.customerName || 'Valued Customer';
    const customerEmail = data.customerEmail;
    const bookingDate = data.bookingDate || '';
    const bookingPeople = data.bookingPeople || '';
    
    // Get or create status tracking sheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let statusSheet = ss.getSheetByName('Booking Statuses');
    
    if (!statusSheet) {
      statusSheet = ss.insertSheet('Booking Statuses');
      statusSheet.appendRow(['Booking ID', 'Status', 'Updated At']);
    }
    
    // Check if status already exists
    const statusData = statusSheet.getDataRange().getValues();
    let found = false;
    
    for (let i = 1; i < statusData.length; i++) {
      if (statusData[i][0] === bookingId) {
        statusSheet.getRange(i + 1, 2).setValue(newStatus);
        statusSheet.getRange(i + 1, 3).setValue(timestamp);
        found = true;
        break;
      }
    }
    
    // If not found, add new row
    if (!found) {
      statusSheet.appendRow([bookingId, newStatus, timestamp]);
    }
    
    // Send email notification based on status
    if (customerEmail) {
      if (newStatus === 'Accepted') {
        sendAcceptedEmail(customerName, customerEmail, bookingDate, bookingPeople);
      } else if (newStatus === 'Completed') {
        sendCompletedEmail(customerName, customerEmail, bookingDate);
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      bookingId: bookingId,
      status: newStatus
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error updating status: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Send Accepted Booking Email to Customer
 */
function sendAcceptedEmail(customerName, customerEmail, bookingDate, bookingPeople) {
  try {
    const subject = '✅ Your Booking is Confirmed - Food Dynasty';
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FEA116 0%, #FF8C00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .button { display: inline-block; padding: 12px 30px; background: #28a745; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Booking Confirmed!</h1>
    </div>
    <div class="content">
      <h2>Great News, ${customerName}!</h2>
      <p>We're excited to confirm that your table booking at <strong>Food Dynasty</strong> has been <strong>ACCEPTED</strong>!</p>
      
      <div style="background: white; padding: 20px; border-left: 4px solid #28a745; margin: 20px 0;">
        <h3 style="margin-top: 0;">📅 Your Reservation Details:</h3>
        <p><strong>Date & Time:</strong> ${bookingDate}</p>
        <p><strong>Number of Guests:</strong> ${bookingPeople}</p>
        <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">✓ CONFIRMED</span></p>
      </div>
      
      <p><strong>What's Next?</strong></p>
      <ul>
        <li>We're preparing for your arrival</li>
        <li>Your table will be ready for you</li>
        <li>Looking forward to serving you!</li>
      </ul>
      
      <p>If you need to make any changes or have special requests, please contact us immediately.</p>
      
      <div style="text-align: center;">
        <p style="font-size: 18px; color: #FEA116; font-weight: bold;">See you soon! 🍽️</p>
      </div>
    </div>
    <div class="footer">
      <p><strong>Food Dynasty</strong></p>
      <p>📍 ${CONFIG.RESTAURANT.address}</p>
      <p>📞 ${CONFIG.RESTAURANT.phone}</p>
      <p>⏰ ${CONFIG.RESTAURANT.hours}</p>
    </div>
  </div>
</body>
</html>
    `;
    
    MailApp.sendEmail({
      to: customerEmail,
      subject: subject,
      htmlBody: htmlBody,
      name: CONFIG.EMAIL.fromName,
      replyTo: CONFIG.EMAIL.replyToEmail
    });
    
    Logger.log('Accepted email sent to: ' + customerEmail);
    return true;
  } catch (error) {
    Logger.log('Error sending accepted email: ' + error.message);
    return false;
  }
}

/**
 * Send Completed/Thank You Email to Customer
 */
function sendCompletedEmail(customerName, customerEmail, bookingDate) {
  try {
    const subject = '🙏 Thank You for Visiting Food Dynasty!';
    
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #FEA116 0%, #FF8C00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .highlight { background: white; padding: 20px; border-left: 4px solid #FEA116; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🙏 Thank You!</h1>
    </div>
    <div class="content">
      <h2>Dear ${customerName},</h2>
      <p>Thank you for dining with us at <strong>Food Dynasty</strong>! We hope you had a wonderful experience.</p>
      
      <div class="highlight">
        <h3 style="margin-top: 0;">✨ We Hope You Enjoyed:</h3>
        <ul>
          <li>Delicious food prepared with love</li>
          <li>Warm and friendly service</li>
          <li>Memorable dining experience</li>
        </ul>
      </div>
      
      <p><strong>Your feedback matters!</strong></p>
      <p>We would love to hear about your experience. Your feedback helps us serve you better.</p>
      
      <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 0;"><strong>💡 Special Offer:</strong> Get <strong>10% OFF</strong> on your next visit! Just mention this email when booking.</p>
      </div>
      
      <p style="text-align: center; font-size: 24px; color: #FEA116; font-weight: bold;">
        We'd Love to See You Again! 🍽️
      </p>
      
      <p style="text-align: center;">
        Book your next table and create more memories with us!
      </p>
    </div>
    <div class="footer">
      <p><strong>Food Dynasty</strong></p>
      <p>📍 ${CONFIG.RESTAURANT.address}</p>
      <p>📞 ${CONFIG.RESTAURANT.phone}</p>
      <p>⏰ ${CONFIG.RESTAURANT.hours}</p>
      <p style="margin-top: 20px;">Follow us on social media for special offers!</p>
    </div>
  </div>
</body>
</html>
    `;
    
    MailApp.sendEmail({
      to: customerEmail,
      subject: subject,
      htmlBody: htmlBody,
      name: CONFIG.EMAIL.fromName,
      replyTo: CONFIG.EMAIL.replyToEmail
    });
    
    Logger.log('Completed/Thank you email sent to: ' + customerEmail);
    return true;
  } catch (error) {
    Logger.log('Error sending completed email: ' + error.message);
    return false;
  }
}

/**
 * Get all booking statuses
 */
function handleGetStatuses() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const statusSheet = ss.getSheetByName('Booking Statuses');
    
    if (!statusSheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        statuses: {}
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = statusSheet.getDataRange().getValues();
    const statuses = {};
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      if (data[i][0]) {  // If booking ID exists
        statuses[data[i][0]] = data[i][1];  // bookingId: status
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      statuses: statuses
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error getting statuses: ' + error.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/*
 * 🚀 DEPLOYMENT STEPS:
 * 
 * 1. Go to script.google.com
 * 2. Create new project: "Food Dynasty Booking Emails"
 * 3. Copy this entire file to Code.gs
 * 4. Update CONFIG section with your details
 * 5. Click Deploy → New deployment → Web app
 *    - Description: "Food Dynasty Booking API"
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 6. Copy the Web App URL (looks like: https://script.google.com/macros/s/.../exec)
 * 7. Test: Run testBookingEmail() function
 * 8. Update js/email-service.js with the Web App URL
 * 
 * FOR GOOGLE FORM INTEGRATION:
 * 1. Create Google Form for table bookings
 * 2. Link to Google Sheet
 * 3. Open Sheet → Extensions → Apps Script
 * 4. Set up trigger: onFormSubmit → From spreadsheet → On form submit
 * 
 * 📧 Emails will be sent to: waliozing@gmail.com (update in CONFIG)
 * 🎯 System handles both website and Google Form bookings
 */
