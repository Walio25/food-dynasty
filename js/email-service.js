// Food Dynasty - Email Service with EmailJS Integration
class EmailService {
    constructor() {
        this.config = {
            serviceId: 'service_f6epl8n',
            customerTemplateId: 'template_c6qkor4',
            restaurantTemplateId: 'template_s4rimim',
            publicKey: 'nboFDWIKItWjcnWKx'
        };
        this.initEmailJS();
    }

    initEmailJS() {
        if (typeof emailjs !== 'undefined') {
            emailjs.init(this.config.publicKey);
        }
    }

    async sendBookingEmails(bookingData) {
        try {
            const results = {
                customer: { success: false },
                restaurant: { success: false }
            };

            // Send customer email
            if (bookingData.email) {
                const customerParams = {
                    to_name: bookingData.name,
                    to_email: bookingData.email,
                    booking_id: bookingData.id,
                    customer_name: bookingData.name,
                    booking_date: this.formatDateTime(bookingData.datetime),
                    number_of_people: bookingData.people,
                    special_request: bookingData.message || 'None',
                    restaurant_name: 'Food Dynasty',
                    restaurant_phone: '+91 7777777777',
                    restaurant_address: '7th Street, Bagalkot, Karnataka',
                    booking_status: 'Confirmed'
                };

                try {
                    const response = await emailjs.send(this.config.serviceId, this.config.customerTemplateId, customerParams);
                    results.customer = { success: true, message: 'Customer email sent', response: response };
                } catch (error) {
                    results.customer = { success: false, error: error.message };
                }
            }

            // Send restaurant email
            const restaurantParams = {
                to_email: 'waliozing@gmail.com', // Restaurant email
                booking_id: bookingData.id,
                customer_name: bookingData.name,
                customer_email: bookingData.email,
                booking_date: this.formatDateTime(bookingData.datetime),
                number_of_people: bookingData.people,
                special_request: bookingData.message || 'None',
                booking_status: 'New Booking - Pending Review',
                booking_time: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
            };

            try {
                const response = await emailjs.send(this.config.serviceId, this.config.restaurantTemplateId, restaurantParams);
                results.restaurant = { success: true, message: 'Restaurant email sent', response: response };
            } catch (error) {
                results.restaurant = { success: false, error: error.message };
            }

            return results;

        } catch (error) {
            return {
                customer: { success: false, error: 'Service unavailable' },
                restaurant: { success: false, error: 'Service unavailable' }
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
