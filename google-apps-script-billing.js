// Google Apps Script to Save Bills to Google Sheets
// Deploy this as a Web App and use the URL in billing-system.js

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const spreadsheetId = '1234567890abcdefghijklmnopqrstuvwxyz'; // Replace with your actual Spreadsheet ID
    const sheetName = 'Bills'; // New sheet name for bills
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    let sheet = ss.getSheetByName(sheetName);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      
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
      
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.getRange(1, 1, 1, headers.length).setBackground('#FEA116');
      sheet.getRange(1, 1, 1, headers.length).setFontColor('#FFFFFF');
      sheet.setFrozenRows(1);
    }
    
    // Prepare row data
    const rowData = [
      data.billNumber,
      data.date,
      data.time,
      data.customerName,
      data.customerPhone || '',
      data.tableNumber || '',
      JSON.stringify(data.items), // Store items as JSON
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
    sheet.appendRow(rowData);
    
    // Auto-resize columns
    sheet.autoResizeColumns(1, 16);
    
    // Return success response
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Bill saved successfully',
      billNumber: data.billNumber
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to get bills from sheet
function doGet(e) {
  try {
    const spreadsheetId = '1234567890abcdefghijklmnopqrstuvwxyz'; // Replace with your actual Spreadsheet ID
    const sheetName = 'Bills';
    
    const ss = SpreadsheetApp.openById(spreadsheetId);
    const sheet = ss.getSheetByName(sheetName);
    
    if (!sheet) {
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        bills: []
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const bills = [];
    
    for (let i = 1; i < data.length; i++) {
      const bill = {};
      for (let j = 0; j < headers.length; j++) {
        const header = headers[j];
        let value = data[i][j];
        
        // Parse JSON items
        if (header === 'Items (JSON)') {
          try {
            value = JSON.parse(value);
          } catch (e) {
            value = [];
          }
        }
        
        bill[header] = value;
      }
      bills.push(bill);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      bills: bills
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Function to create a detailed bill items sheet
function createBillItemsSheet(billNumber, items) {
  const spreadsheetId = '1234567890abcdefghijklmnopqrstuvwxyz'; // Replace with your actual Spreadsheet ID
  const ss = SpreadsheetApp.openById(spreadsheetId);
  const sheetName = 'Bill Items - ' + billNumber;
  
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    
    // Add headers
    const headers = ['Item Name', 'Price', 'Quantity', 'Total'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    sheet.getRange(1, 1, 1, headers.length).setBackground('#FEA116');
    sheet.getRange(1, 1, 1, headers.length).setFontColor('#FFFFFF');
    
    // Add items
    const itemsData = items.map(item => [
      item.name,
      item.price,
      item.quantity,
      item.price * item.quantity
    ]);
    
    sheet.getRange(2, 1, itemsData.length, 4).setValues(itemsData);
    sheet.autoResizeColumns(1, 4);
  }
  
  return sheetName;
}
