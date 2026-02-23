/**
 * Food Dynasty - Booking Forms Service
 * Integrates table bookings with Google Forms and displays in restaurant dashboard
 */

class BookingFormsService {
    constructor() {
        // ⚠️ CONFIGURATION - Update these values after creating your Google Form
        this.config = {
            GOOGLE_FORM: {
                id: '1FAIpQLSefl6ACPQFXgSoX_DlzdVstoh7mnXYBSJ3YgumjHYEicsfleQ',
                baseUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSefl6ACPQFXgSoX_DlzdVstoh7mnXYBSJ3YgumjHYEicsfleQ/formResponse',
                fields: {
                    name: 'entry.877453666',
                    email: 'entry.1288012457',
                    phone: 'entry.1064725674',
                    date: 'entry.1785409737',      // Date field
                    time: 'entry.117730179',        // Time field
                    people: 'entry.412746977',
                    message: 'entry.1700531839'
                }
            },
            
            GOOGLE_SHEETS: {
                spreadsheetId: '1xyw8YtRHgoMSs48hpQB9tAEcnohJ0CHBfdEmGcFJcb0',  // Actual linked spreadsheet
                apiKey: 'AIzaSyB2xOKhNnhRZmyskbbpHHzmZ4l5WcneQ2A',                // Google Sheets API key
                range: 'Form Responses 1!A2:H',        // A2:H = All data rows (8 columns including time)
                sheetName: 'Form Responses 1'
            }
        };
    }

    /**
     * Submit booking to Google Form
     */
    async submitBooking(bookingData) {
        try {
            // Validate configuration
            if (this.config.GOOGLE_FORM.id === 'YOUR_FORM_ID_HERE') {
                console.error('Google Form not configured. See BOOKING-FORM-SETUP-GUIDE.md');
                return {
                    success: false,
                    error: 'Booking system not configured'
                };
            }

            // Prepare form data
            const formData = new FormData();
            
            formData.append(this.config.GOOGLE_FORM.fields.name, bookingData.name || '');
            formData.append(this.config.GOOGLE_FORM.fields.email, bookingData.email || '');
            formData.append(this.config.GOOGLE_FORM.fields.phone, bookingData.phone || '');
            
            // Format date - Google Form expects DATE in ISO format: YYYY-MM-DD
            let formattedDate = '';
            if (bookingData.date || bookingData.datetime) {
                try {
                    const dateStr = bookingData.date || bookingData.datetime.split('T')[0];
                    const date = new Date(dateStr);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    formattedDate = `${year}-${month}-${day}`; // ISO format: 2025-11-27
                } catch (e) {
                    console.warn('Date formatting error:', e);
                    formattedDate = bookingData.date || bookingData.datetime;
                }
            }
            
            // Format time - Google Form expects TIME in 24-hour format: HH:MM (no seconds, no AM/PM)
            let formattedTime = '';
            if (bookingData.time) {
                // Input is already in HH:MM format (e.g., "14:30")
                formattedTime = bookingData.time;
            } else if (bookingData.datetime) {
                // Extract time from datetime
                try {
                    const date = new Date(bookingData.datetime);
                    const hours = String(date.getHours()).padStart(2, '0');
                    const minutes = String(date.getMinutes()).padStart(2, '0');
                    formattedTime = `${hours}:${minutes}`; // 24-hour format: 14:30
                } catch (e) {
                    console.warn('Time formatting error:', e);
                }
            }
            
            formData.append(this.config.GOOGLE_FORM.fields.date, formattedDate);
            formData.append(this.config.GOOGLE_FORM.fields.time, formattedTime);
            formData.append(this.config.GOOGLE_FORM.fields.people, String(bookingData.people || ''));
            formData.append(this.config.GOOGLE_FORM.fields.message, bookingData.message || '');

            // Build URL with query parameters
            const params = new URLSearchParams();
            params.append(this.config.GOOGLE_FORM.fields.name, bookingData.name || '');
            params.append(this.config.GOOGLE_FORM.fields.email, bookingData.email || '');
            params.append(this.config.GOOGLE_FORM.fields.phone, bookingData.phone || '');
            params.append(this.config.GOOGLE_FORM.fields.date, formattedDate);
            params.append(this.config.GOOGLE_FORM.fields.time, formattedTime);
            params.append(this.config.GOOGLE_FORM.fields.people, String(bookingData.people || ''));
            params.append(this.config.GOOGLE_FORM.fields.message, bookingData.message || '');
            params.append('submit', 'Submit');
            
            const submitUrl = `${this.config.GOOGLE_FORM.baseUrl}?${params.toString()}`;

            // Submit to Google Form using iframe
            const iframe = document.createElement('iframe');
            iframe.name = 'google-form-submit';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            iframe.src = submitUrl;
            
            // Remove iframe after submission
            setTimeout(() => {
                if (iframe.parentNode) {
                    document.body.removeChild(iframe);
                }
            }, 2000);

            return {
                success: true,
                message: 'Booking saved to Google Form'
            };

        } catch (error) {
            console.error('Form submission error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Fetch all bookings from Google Sheets
     */
    async fetchBookings() {
        try {
            // Validate configuration
            if (this.config.GOOGLE_SHEETS.spreadsheetId === 'YOUR_SPREADSHEET_ID') {
                console.error('Google Sheets not configured');
                return {
                    success: false,
                    error: 'Dashboard not configured',
                    bookings: []
                };
            }

            // Build API URL
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.config.GOOGLE_SHEETS.spreadsheetId}/values/${this.config.GOOGLE_SHEETS.range}?key=${this.config.GOOGLE_SHEETS.apiKey}`;

            // Fetch data
            const response = await fetch(url);

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error('Permission denied. Make sure the spreadsheet is public (Anyone with link can view)');
                } else if (response.status === 400) {
                    throw new Error('Invalid spreadsheet ID or range');
                } else {
                    throw new Error(`API error: ${response.status}`);
                }
            }

            const data = await response.json();

            // Parse bookings
            const bookings = this.parseBookingsFromSheet(data.values || []);

            return {
                success: true,
                bookings: bookings,
                count: bookings.length
            };

        } catch (error) {
            console.error('Fetch bookings error:', error);
            return {
                success: false,
                error: error.message,
                bookings: []
            };
        }
    }

    /**
     * Parse raw sheet data into booking objects
     */
    parseBookingsFromSheet(rows) {
        const bookings = [];

        rows.forEach((row, index) => {
            try {
                // Row format: [Timestamp, Name, Email, Phone, Date, Time, People, Message]
                // Note: Date and Time are separate fields in the form
                if (row.length >= 6) {
                    // Combine date and time fields
                    const date = row[4] || '';
                    const time = row[5] || '';
                    const datetime = date && time ? `${date} ${time}` : (date || time || '');
                    
                    // Generate stable booking ID from timestamp
                    const timestampMs = new Date(row[0] || new Date()).getTime();
                    const bookingId = `BK-${timestampMs}-${index}`;
                    
                    bookings.push({
                        id: bookingId,
                        timestamp: row[0] || '',
                        name: row[1] || '',
                        email: row[2] || '',
                        phone: row[3] || '',
                        datetime: datetime,
                        people: row[6] || '',
                        message: row[7] || 'None',
                        status: 'Pending', // Can be updated manually in sheet
                        submittedAt: row[0] || new Date().toISOString()
                    });
                }
            } catch (error) {
                console.error('Error parsing row:', error);
            }
        });

        // Sort by timestamp (newest first)
        bookings.sort((a, b) => {
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            return dateB - dateA;
        });

        return bookings;
    }

    /**
     * Format datetime for Google Form submission
     */
    formatDateTimeForForm(datetime) {
        try {
            // If datetime is already in ISO format from datetime-local input
            // Just return it as-is or in a simple readable format
            // Google Forms datetime field accepts: "YYYY-MM-DD HH:MM" or "MM/DD/YYYY HH:MM"
            
            const date = new Date(datetime);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            
            // Try format: MM/DD/YYYY HH:MM (24-hour format)
            return `${month}/${day}/${year} ${hours}:${minutes}`;
        } catch (error) {
            return datetime;
        }
    }

    /**
     * Format datetime for display
     */
    formatDateTimeForDisplay(datetime) {
        try {
            const date = new Date(datetime);
            return date.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                weekday: 'short',
                year: 'numeric',
                month: 'short',
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
     * Get booking statistics
     */
    async getBookingStats() {
        try {
            const result = await this.fetchBookings();
            
            if (!result.success) {
                return {
                    total: 0,
                    today: 0,
                    thisWeek: 0,
                    thisMonth: 0
                };
            }

            const bookings = result.bookings;
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

            return {
                total: bookings.length,
                today: bookings.filter(b => new Date(b.timestamp) >= today).length,
                thisWeek: bookings.filter(b => new Date(b.timestamp) >= weekStart).length,
                thisMonth: bookings.filter(b => new Date(b.timestamp) >= monthStart).length
            };

        } catch (error) {
            console.error('Stats error:', error);
            return {
                total: 0,
                today: 0,
                thisWeek: 0,
                thisMonth: 0
            };
        }
    }

    /**
     * Search/filter bookings
     */
    filterBookings(bookings, filters) {
        let filtered = [...bookings];

        // Filter by name
        if (filters.name) {
            filtered = filtered.filter(b => 
                b.name.toLowerCase().includes(filters.name.toLowerCase())
            );
        }

        // Filter by email
        if (filters.email) {
            filtered = filtered.filter(b => 
                b.email.toLowerCase().includes(filters.email.toLowerCase())
            );
        }

        // Filter by phone
        if (filters.phone) {
            filtered = filtered.filter(b => 
                b.phone.includes(filters.phone)
            );
        }

        // Filter by date range
        if (filters.startDate) {
            const start = new Date(filters.startDate);
            filtered = filtered.filter(b => new Date(b.datetime) >= start);
        }

        if (filters.endDate) {
            const end = new Date(filters.endDate);
            filtered = filtered.filter(b => new Date(b.datetime) <= end);
        }

        // Filter by people count
        if (filters.people) {
            filtered = filtered.filter(b => b.people === filters.people);
        }

        return filtered;
    }
}

// Global instance
window.bookingFormsService = new BookingFormsService();
