// Dashboard Manager for Food Dynasty
class DashboardManager {
    constructor() {
        this.bookings = [];
        this.init();
    }

    init() {
        this.loadBookings();
        this.updateAuthUI();
        this.startAutoConfirmation();
    }

    // Load bookings from localStorage
    loadBookings() {
        const userName = localStorage.getItem('userName');
        const userEmail = localStorage.getItem('userEmail');
        const authToken = localStorage.getItem('authToken');
        
        if (userName && userEmail && authToken) {
            const userBookings = localStorage.getItem(`bookings_${userEmail}`);
            this.bookings = userBookings ? JSON.parse(userBookings) : [];
        } else {
            this.bookings = [];
        }
    }

    // Save bookings to localStorage
    saveBookings() {
        const userName = localStorage.getItem('userName');
        const userEmail = localStorage.getItem('userEmail');
        const authToken = localStorage.getItem('authToken');
        
        if (userName && userEmail && authToken) {
            localStorage.setItem(`bookings_${userEmail}`, JSON.stringify(this.bookings));
        }
    }

    // Add new booking
    addBooking(bookingData) {
        const booking = {
            id: 'FD_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...bookingData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.bookings.unshift(booking); // Add to beginning of array
        this.saveBookings();
        return booking;
    }

    // Update booking status
    updateBookingStatus(bookingId, status) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
            booking.status = status;
            booking.updatedAt = new Date().toISOString();
            this.saveBookings();
            return true;
        }
        return false;
    }

    // Cancel booking
    cancelBooking(bookingId) {
        return this.updateBookingStatus(bookingId, 'cancelled');
    }

    // Auto-confirmation functionality
    startAutoConfirmation() {
        // Check immediately
        this.checkPendingBookings();
        
        // Set up interval to check every 10 seconds
        this.autoConfirmInterval = setInterval(() => {
            this.checkPendingBookings();
        }, 10000); // Check every 10 seconds
    }

    // Check and auto-confirm pending bookings after 1 minute
    checkPendingBookings() {
        let updated = false;
        const currentTime = new Date().getTime();
        
        this.bookings.forEach(booking => {
            if (booking.status === 'pending') {
                const createdTime = new Date(booking.createdAt).getTime();
                const timeDiff = currentTime - createdTime;
                
                // If booking is pending for more than 1 minute (60000 ms), auto-confirm
                if (timeDiff >= 60000) {
                    booking.status = 'confirmed';
                    booking.updatedAt = new Date().toISOString();
                    booking.autoConfirmed = true;
                    updated = true;
                }
            }
        });
        
        // Save changes and update UI if any bookings were confirmed
        if (updated) {
            this.saveBookings();
            this.renderDashboard();
        }
    }

    // Stop auto-confirmation (cleanup)
    stopAutoConfirmation() {
        if (this.autoConfirmInterval) {
            clearInterval(this.autoConfirmInterval);
            this.autoConfirmInterval = null;
        }
    }

    // Get booking statistics
    getBookingStats() {
        const stats = {
            total: this.bookings.length,
            pending: 0,
            confirmed: 0,
            cancelled: 0,
            services: {
                connecting: 0,    // General Connecting
                reservation: 0,   // Table Reservation
                catering: 0,     // Catering Services
                franchises: 0,    // Franchise Inquiry
                other: 0         // Other
            }
        };

        this.bookings.forEach(booking => {
            stats[booking.status]++;
            // Count by service type if available
            if (booking.service) {
                stats.services[booking.service] = (stats.services[booking.service] || 0) + 1;
            }
        });

        return stats;
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Format booking date/time
    formatBookingDateTime(dateTime) {
        if (!dateTime) return 'Not specified';
        
        try {
            // Handle different date formats
            let date;
            if (dateTime.includes('/')) {
                // MM/DD/YYYY format
                const [datePart, timePart] = dateTime.split(' ');
                const [month, day, year] = datePart.split('/');
                date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${timePart || '12:00'}:00`);
            } else {
                date = new Date(dateTime);
            }
            
            return date.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return dateTime;
        }
    }

    // Update authentication UI
    updateAuthUI() {
        const userName = localStorage.getItem('userName');
        const userEmail = localStorage.getItem('userEmail');
        const authToken = localStorage.getItem('authToken');
        const loginRequired = document.getElementById('login-required');
        const dashboardContent = document.getElementById('dashboard-content');

        if (userName && userEmail && authToken) {
            // User is logged in - show dashboard
            if (loginRequired) loginRequired.classList.add('d-none');
            if (dashboardContent) dashboardContent.classList.remove('d-none');
            
            // Update user display elements if they exist
            const navUserPhone = document.getElementById('navUserPhone');
            const dropdownUserName = document.getElementById('dropdownUserName');
            const dropdownUserPhone = document.getElementById('dropdownUserPhone');
            
            if (navUserPhone) navUserPhone.textContent = userEmail;
            if (dropdownUserName) dropdownUserName.textContent = userName;
            if (dropdownUserPhone) dropdownUserPhone.textContent = userEmail;
            
            this.loadBookings();
            this.renderDashboard();
        } else {
            // User not logged in - show login message
            if (loginRequired) loginRequired.classList.remove('d-none');
            if (dashboardContent) dashboardContent.classList.add('d-none');
        }
    }

    // Render complete dashboard
    renderDashboard() {
        this.renderStats();
        this.renderBookingsList();
    }

    // Refresh dashboard data and UI
    refreshDashboard() {
        this.loadBookings();
        this.renderDashboard();
    }

    // Render statistics cards
    renderStats() {
        const stats = this.getBookingStats();
        
        // Update booking statistics
        const totalBookingsEl = document.getElementById('total-bookings');
        const pendingBookingsEl = document.getElementById('pending-bookings');
        const confirmedBookingsEl = document.getElementById('confirmed-bookings');
        const servicesCountEl = document.getElementById('services-count');

        if (totalBookingsEl) totalBookingsEl.textContent = stats.total;
        if (pendingBookingsEl) pendingBookingsEl.textContent = stats.pending;
        if (confirmedBookingsEl) confirmedBookingsEl.textContent = stats.confirmed;
        
        // Count total active services (not cancelled bookings)
        const activeServices = this.bookings.filter(b => b.status !== 'cancelled').length;
        if (servicesCountEl) servicesCountEl.textContent = activeServices;
    }

    // Render bookings list
    renderBookingsList() {
        const bookingsListEl = document.getElementById('bookings-list');
        const noBookingsEl = document.getElementById('no-bookings');

        if (!bookingsListEl || !noBookingsEl) return;

        if (this.bookings.length === 0) {
            bookingsListEl.classList.add('d-none');
            noBookingsEl.classList.remove('d-none');
            return;
        }

        noBookingsEl.classList.add('d-none');
        bookingsListEl.classList.remove('d-none');

        const bookingsHTML = this.bookings.map(booking => this.renderBookingCard(booking)).join('');
        bookingsListEl.innerHTML = bookingsHTML;
    }

    // Render individual booking card
    renderBookingCard(booking) {
        const statusClass = `status-${booking.status}`;
        const statusIcon = {
            pending: 'fas fa-clock',
            confirmed: 'fas fa-check-circle',
            cancelled: 'fas fa-times-circle'
        }[booking.status] || 'fas fa-question-circle';

        // Calculate time remaining for auto-confirmation
        let timeRemainingHTML = '';
        if (booking.status === 'pending') {
            const currentTime = new Date().getTime();
            const createdTime = new Date(booking.createdAt).getTime();
            const elapsedTime = currentTime - createdTime;
            const remainingTime = Math.max(0, 60000 - elapsedTime); // 60 seconds
            
            if (remainingTime > 0) {
                const secondsRemaining = Math.ceil(remainingTime / 1000);
                timeRemainingHTML = `
                    <div class="alert alert-info alert-sm mt-2 mb-0">
                        <i class="fas fa-hourglass-half me-1"></i>
                        <small>Auto-confirms in ${secondsRemaining} seconds</small>
                    </div>
                `;
            }
        }

        // Auto-confirm message removed - functionality still works in background

        return `
            <div class="booking-card card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="card-title mb-0">
                                    <i class="fas fa-calendar-alt me-2 text-primary"></i>
                                    Booking #${booking.id}
                                </h6>
                                <span class="badge ${statusClass} status-badge">
                                    <i class="${statusIcon} me-1"></i>
                                    ${booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                            </div>
                            
                            <div class="booking-details">
                                <div class="row g-2">
                                    <div class="col-sm-6">
                                        <small class="text-muted">
                                            <i class="fas fa-user me-1"></i>
                                            <strong>Name:</strong> ${booking.name || 'Not specified'}
                                        </small>
                                    </div>
                                    <div class="col-sm-6">
                                        <small class="text-muted">
                                            <i class="fas fa-envelope me-1"></i>
                                            <strong>Email:</strong> ${booking.email || 'Not specified'}
                                        </small>
                                    </div>
                                    <div class="col-sm-6">
                                        <small class="text-muted">
                                            <i class="fas fa-users me-1"></i>
                                            <strong>People:</strong> ${booking.people || 'Not specified'}
                                        </small>
                                    </div>
                                    <div class="col-sm-6">
                                        <small class="text-muted">
                                            <i class="fas fa-clock me-1"></i>
                                            <strong>Date & Time:</strong> ${this.formatBookingDateTime(booking.datetime)}
                                        </small>
                                    </div>
                                    ${booking.message ? `
                                        <div class="col-12">
                                            <small class="text-muted">
                                                <i class="fas fa-comment me-1"></i>
                                                <strong>Special Request:</strong> ${booking.message}
                                            </small>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            
            <small class="text-muted mt-2 d-block">
                <i class="fas fa-info-circle me-1"></i>
                Booked on ${this.formatDate(booking.createdAt)}
            </small>
            
            ${timeRemainingHTML}
        </div>                        <div class="col-md-4 text-end">
                            <div class="btn-group-vertical" role="group">
                                ${booking.status === 'pending' ? `
                                    <button class="btn btn-sm btn-outline-success mb-2" 
                                            onclick="dashboardManager.updateBookingStatus('${booking.id}', 'confirmed'); dashboardManager.renderDashboard();">
                                        <i class="fas fa-check me-1"></i>Confirm
                                    </button>
                                ` : ''}
                                
                                ${booking.status !== 'cancelled' ? `
                                    <button class="btn btn-sm btn-outline-danger" 
                                            onclick="if(confirm('Are you sure you want to cancel this booking?')) { dashboardManager.cancelBooking('${booking.id}'); dashboardManager.renderDashboard(); }">
                                        <i class="fas fa-times me-1"></i>Cancel
                                    </button>
                                ` : ''}
                                
                                <button class="btn btn-sm btn-outline-primary mt-2" 
                                        onclick="dashboardManager.showBookingDetails('${booking.id}')">
                                    <i class="fas fa-eye me-1"></i>Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Show booking details in modal (if needed)
    showBookingDetails(bookingId) {
        const booking = this.bookings.find(b => b.id === bookingId);
        if (booking) {
            const details = `
                Booking ID: ${booking.id}
                Name: ${booking.name}
                Email: ${booking.email}
                Phone: ${booking.phone || 'Not provided'}
                Date & Time: ${this.formatBookingDateTime(booking.datetime)}
                Number of People: ${booking.people}
                Special Requests: ${booking.message || 'None'}
                Status: ${booking.status}
                Booked on: ${this.formatDate(booking.createdAt)}
                Last Updated: ${this.formatDate(booking.updatedAt)}
            `;
            alert(details);
        }
    }

    // Refresh dashboard
    refresh() {
        this.loadBookings();
        this.renderDashboard();
    }
}

// Initialize dashboard manager
let dashboardManager;

function initializeDashboard() {
    dashboardManager = new DashboardManager();
    
    // Update auth UI as well
    if (typeof updateAuthUI === 'function') {
        updateAuthUI();
    }
}

// Export for global use
window.DashboardManager = DashboardManager;
window.initializeDashboard = initializeDashboard;

// Refresh dashboard when page becomes visible (user navigates back)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && dashboardManager) {
        const userName = localStorage.getItem('userName');
        const userEmail = localStorage.getItem('userEmail');
        const authToken = localStorage.getItem('authToken');
        
        if (userName && userEmail && authToken) {
            setTimeout(() => {
                dashboardManager.refreshDashboard();
            }, 100);
        }
    }
});

// Listen for authentication and booking changes
window.addEventListener('storage', function(e) {
    if (!dashboardManager) return;
    
    // Handle authentication changes
    if (e.key === 'userName' || e.key === 'userEmail' || e.key === 'authToken') {
        setTimeout(() => {
            dashboardManager.updateAuthUI();
        }, 100);
    }
    
    // Handle booking changes - refresh dashboard if user is logged in
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail && e.key === `bookings_${userEmail}`) {
        setTimeout(() => {
            dashboardManager.loadBookings();
            dashboardManager.renderDashboard();
        }, 100);
    }
});