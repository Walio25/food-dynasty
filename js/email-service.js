// Food Dynasty - Email Service with Google Apps Script
class EmailService {
    constructor() {
        // Google Apps Script Web App URL
        this.config = {
            webAppUrl: 'https://script.google.com/macros/s/AKfycby-uU5nRZaNp17qXoLdGIMS8qhlBbovfCKciQh_Y3NKFalZV2MGiw3Qmsc751-WTqayYw/exec'
        };
        
        // Store URL in localStorage for billing system to use
        localStorage.setItem('googleSheetsApiUrl', this.config.webAppUrl);
    }

    async sendBookingEmails(bookingData) {
        try {
            // Check if Web App URL is configured
            if (!this.config.webAppUrl || this.config.webAppUrl.includes('YOUR_GOOGLE')) {
                console.warn('Google Apps Script Web App URL not configured');
                return {
                    customer: { success: false, error: 'Email service not configured' },
                    restaurant: { success: false, error: 'Email service not configured' }
                };
            }

            // Prepare booking data for Google Apps Script
            const payload = {
                name: bookingData.name,
                email: bookingData.email,
                phone: bookingData.phone || '',
                datetime: bookingData.datetime,
                people: bookingData.people,
                message: bookingData.message || 'None'
            };

            // Send to Google Apps Script Web App
            const response = await fetch(this.config.webAppUrl, {
                method: 'POST',
                mode: 'no-cors', // Required for Google Apps Script
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            // Note: With no-cors mode, we can't read the response
            // Assume success if no error is thrown
            console.log('Booking emails sent to Google Apps Script');
            
            return {
                customer: { success: true, message: 'Email sent via Google Apps Script' },
                restaurant: { success: true, message: 'Email sent via Google Apps Script' }
            };

        } catch (error) {
            console.error('Email service error:', error);
            return {
                customer: { success: false, error: error.message },
                restaurant: { success: false, error: error.message }
            };
        }
    }

    formatDateTime(dateTime) {
        if (!dateTime) return 'Not specified';
        try {
            const date = new Date(dateTime);
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
            return dateTime;
        }
    }
}

// Global instance
window.emailService = new EmailService();