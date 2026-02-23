/**
 * Food Dynasty - Restaurant Dashboard Booking Viewer
 * Displays table bookings from Google Sheets in the restaurant dashboard
 */

class DashboardBookingViewer {
    constructor() {
        this.bookings = [];
        this.filteredBookings = [];
        this.currentTab = 'bookings'; // 'bookings' or 'contacts'
        this.currentPage = 1;
        this.itemsPerPage = 10;
    }

    /**
     * Initialize the booking viewer
     */
    async init() {
        try {
            // Load bookings from Google Sheets
            await this.loadBookings();
            
            // Render bookings table
            this.renderBookingsTable();
            
            // Update stats
            this.updateBookingStats();
            
            // Set up event listeners
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Booking viewer init error:', error);
            this.showError('Failed to load bookings. Please check configuration.');
        }
    }

    /**
     * Load bookings from Google Sheets
     */
    async loadBookings() {
        try {
            if (typeof window.bookingFormsService === 'undefined') {
                throw new Error('Booking service not loaded');
            }

            const result = await window.bookingFormsService.fetchBookings();
            
            if (result.success) {
                this.bookings = result.bookings;
                // Load saved statuses from Google Apps Script
                await this.loadAllStatuses();
                this.filteredBookings = [...this.bookings];
                return true;
            } else {
                throw new Error(result.error || 'Failed to fetch bookings');
            }
        } catch (error) {
            console.error('Load bookings error:', error);
            // Fallback to localStorage if Google Sheets fails
            this.loadFromLocalStorage();
            return false;
        }
    }

    /**
     * Fallback: Load from localStorage
     */
    loadFromLocalStorage() {
        try {
            const allBookings = JSON.parse(localStorage.getItem('all_bookings') || '[]');
            this.bookings = allBookings.map((b, index) => ({
                id: b.id || `LOCAL-${index}`,
                timestamp: b.createdAt || b.timestamp || new Date().toISOString(),
                name: b.name || b.userName || '',
                email: b.email || '',
                phone: b.phone || 'N/A',
                datetime: b.datetime || '',
                people: b.people || '',
                message: b.message || 'None',
                status: b.status || 'Pending'
            }));
            this.filteredBookings = [...this.bookings];
        } catch (error) {
            console.error('LocalStorage load error:', error);
            this.bookings = [];
            this.filteredBookings = [];
        }
    }

    /**
     * Render bookings table
     */
    renderBookingsTable() {
        // Hide loading, show content
        const loadingEl = document.getElementById('bookings-loading');
        const noBookingsEl = document.getElementById('no-bookings');
        const tableContainer = document.getElementById('bookings-table-container');
        
        if (loadingEl) {
            loadingEl.style.display = 'none';
        }
        
        const tableBody = document.getElementById('bookings-table-body');
        if (!tableBody) {
            console.error('[Booking Viewer] Table body not found!');
            return;
        }

        if (this.filteredBookings.length === 0) {
            if (noBookingsEl) {
                noBookingsEl.style.display = 'block';
                noBookingsEl.classList.remove('d-none');
            }
            if (tableContainer) {
                tableContainer.style.display = 'none';
                tableContainer.classList.add('d-none');
            }
            return;
        }

        if (noBookingsEl) {
            noBookingsEl.style.display = 'none';
            noBookingsEl.classList.add('d-none');
        }
        if (tableContainer) {
            tableContainer.style.display = 'block';
            tableContainer.classList.remove('d-none');
        }

        // Calculate pagination
        const totalPages = Math.ceil(this.filteredBookings.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageBookings = this.filteredBookings.slice(startIndex, endIndex);

        tableBody.innerHTML = pageBookings.map((booking, index) => {
            const status = booking.status || 'Pending';
            const statusBadge = this.getStatusBadge(status);
            const manageButtons = this.getManageButtons(booking.id, status);
            
            return `
            <tr class="booking-row">
                <td>${startIndex + index + 1}</td>
                <td>
                    <strong>${this.escapeHtml(booking.name)}</strong><br>
                    <small class="text-muted">${this.escapeHtml(booking.email)}</small>
                </td>
                <td>${this.escapeHtml(booking.phone)}</td>
                <td>${this.formatDateTime(booking.datetime)}</td>
                <td><span class="badge bg-primary">${this.escapeHtml(booking.people)}</span></td>
                <td>${statusBadge}</td>
                <td><small>${this.escapeHtml(booking.message)}</small></td>
                <td>${manageButtons}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="bookingViewer.callCustomer('${this.escapeHtml(booking.phone)}')">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="bookingViewer.emailCustomer('${this.escapeHtml(booking.email)}')">
                        <i class="fas fa-envelope"></i>
                    </button>
                </td>
            </tr>
        `;
        }).join('');

        // Render pagination controls
        this.renderPagination(totalPages);
    }

    /**
     * Render pagination controls
     */
    renderPagination(totalPages) {
        const paginationContainer = document.getElementById('bookings-pagination');
        if (!paginationContainer) return;

        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <div class="d-flex justify-content-between align-items-center mt-3">
                <div>
                    <small class="text-muted">
                        Showing ${(this.currentPage - 1) * this.itemsPerPage + 1} to 
                        ${Math.min(this.currentPage * this.itemsPerPage, this.filteredBookings.length)} of 
                        ${this.filteredBookings.length} bookings
                    </small>
                </div>
                <nav>
                    <ul class="pagination pagination-sm mb-0">
        `;

        // Previous button
        paginationHTML += `
            <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="bookingViewer.changePage(${this.currentPage - 1}); return false;">Previous</a>
            </li>
        `;

        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 1 && i <= this.currentPage + 1)) {
                paginationHTML += `
                    <li class="page-item ${i === this.currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" onclick="bookingViewer.changePage(${i}); return false;">${i}</a>
                    </li>
                `;
            } else if (i === this.currentPage - 2 || i === this.currentPage + 2) {
                paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
            }
        }

        // Next button
        paginationHTML += `
            <li class="page-item ${this.currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="bookingViewer.changePage(${this.currentPage + 1}); return false;">Next</a>
            </li>
        `;

        paginationHTML += `
                    </ul>
                </nav>
            </div>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    /**
     * Change page
     */
    changePage(page) {
        const totalPages = Math.ceil(this.filteredBookings.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderBookingsTable();
    }

    /**
     * Update booking statistics
     */
    updateBookingStats() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        const stats = {
            total: this.bookings.length,
            today: this.bookings.filter(b => new Date(b.timestamp) >= today).length,
            thisWeek: this.bookings.filter(b => new Date(b.timestamp) >= weekStart).length,
            thisMonth: this.bookings.filter(b => new Date(b.timestamp) >= monthStart).length
        };

        // Update stat elements with correct IDs
        const totalEl = document.getElementById('bookings-total');
        const todayEl = document.getElementById('bookings-today');
        const weekEl = document.getElementById('bookings-week');
        const monthEl = document.getElementById('bookings-month');

        if (totalEl) totalEl.textContent = stats.total;
        if (todayEl) todayEl.textContent = stats.today;
        if (weekEl) weekEl.textContent = stats.thisWeek;
        if (monthEl) monthEl.textContent = stats.thisMonth;
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-bookings');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        // Search input
        const searchInput = document.getElementById('search-bookings');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        // Date filter
        const dateFilter = document.getElementById('filter-date');
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.applyFilters());
        }
    }

    /**
     * Refresh bookings data
     */
    async refresh() {
        const refreshBtn = document.getElementById('refresh-bookings');
        if (refreshBtn) {
            refreshBtn.disabled = true;
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        }

        try {
            await this.loadBookings();
            this.renderBookingsTable();
            this.updateBookingStats();
            this.showSuccess('Bookings refreshed successfully!');
        } catch (error) {
            this.showError('Failed to refresh bookings');
        } finally {
            if (refreshBtn) {
                refreshBtn.disabled = false;
                refreshBtn.innerHTML = '<i class="fas fa-sync"></i> Refresh';
            }
        }
    }

    /**
     * Handle search
     */
    handleSearch(query) {
        query = query.toLowerCase().trim();
        
        if (!query) {
            this.filteredBookings = [...this.bookings];
        } else {
            this.filteredBookings = this.bookings.filter(b => 
                b.name.toLowerCase().includes(query) ||
                b.email.toLowerCase().includes(query) ||
                b.phone.includes(query)
            );
        }
        
        this.currentPage = 1;
        this.renderBookingsTable();
    }

    /**
     * Apply filters
     */
    applyFilters() {
        const dateFilter = document.getElementById('filter-date');
        
        if (!dateFilter || !dateFilter.value) {
            this.filteredBookings = [...this.bookings];
        } else {
            const selectedDate = new Date(dateFilter.value);
            this.currentPage = 1;
            this.filteredBookings = this.bookings.filter(b => {
                const bookingDate = new Date(b.datetime);
                return bookingDate.toDateString() === selectedDate.toDateString();
            });
        }
        
        this.renderBookingsTable();
    }

    /**
     * Call customer
     */
    callCustomer(phone) {
        if (phone && phone !== 'N/A') {
            window.location.href = `tel:${phone}`;
        } else {
            alert('Phone number not available');
        }
    }

    /**
     * Email customer
     */
    emailCustomer(email) {
        if (email) {
            window.location.href = `mailto:${email}`;
        } else {
            alert('Email address not available');
        }
    }

    /**
     * Get status badge HTML
     */
    getStatusBadge(status) {
        const badges = {
            'Pending': '<span class="badge bg-warning text-dark">⏳ Pending</span>',
            'Accepted': '<span class="badge bg-info">✓ Accepted</span>',
            'Completed': '<span class="badge bg-success">✓ Completed</span>',
            'Cancelled': '<span class="badge bg-danger">✗ Cancelled</span>'
        };
        return badges[status] || badges['Pending'];
    }

    /**
     * Get manage buttons HTML
     */
    getManageButtons(bookingId, status) {
        if (status === 'Completed') {
            return '<span class="text-success"><i class="fas fa-check-circle"></i> Done</span>';
        }
        
        if (status === 'Cancelled') {
            return '<span class="text-danger"><i class="fas fa-times-circle"></i> Cancelled</span>';
        }

        let buttons = '';
        
        if (status === 'Pending') {
            buttons = `
                <button class="btn btn-sm btn-info mb-1" onclick="bookingViewer.updateStatus('${bookingId}', 'Accepted')" title="Accept Booking">
                    <i class="fas fa-check"></i> Accept
                </button>
            `;
        }
        
        if (status === 'Pending' || status === 'Accepted') {
            buttons += `
                <button class="btn btn-sm btn-success mb-1" onclick="bookingViewer.updateStatus('${bookingId}', 'Completed')" title="Mark as Completed">
                    <i class="fas fa-check-double"></i> Complete
                </button>
            `;
        }

        return buttons;
    }

    /**
     * Update booking status
     */
    async updateStatus(bookingId, newStatus) {
        // Find the booking
        const booking = this.bookings.find(b => b.id === bookingId);
        if (!booking) return;

        // Update status locally first
        booking.status = newStatus;

        // Update in filtered bookings too
        const filteredBooking = this.filteredBookings.find(b => b.id === bookingId);
        if (filteredBooking) {
            filteredBooking.status = newStatus;
        }

        // Save to Google Apps Script (server-side)
        await this.saveStatusToServer(bookingId, newStatus);

        // Re-render
        this.renderBookingsTable();
        this.updateBookingStats();

        // Show success message
        const messages = {
            'Accepted': 'Booking accepted successfully!',
            'Completed': 'Booking marked as completed!',
            'Cancelled': 'Booking cancelled!'
        };
        this.showSuccess(messages[newStatus] || 'Status updated!');
    }

    /**
     * Save booking status to Google Apps Script
     */
    async saveStatusToServer(bookingId, status) {
        try {
            const webAppUrl = 'https://script.google.com/macros/s/AKfycby-uU5nRZaNp17qXoLdGIMS8qhlBbovfCKciQh_Y3NKFalZV2MGiw3Qmsc751-WTqayYw/exec';
            
            // Find booking to get customer details
            const booking = this.bookings.find(b => b.id === bookingId);
            
            const response = await fetch(webAppUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'updateStatus',
                    bookingId: bookingId,
                    status: status,
                    customerName: booking ? booking.name : '',
                    customerEmail: booking ? booking.email : '',
                    bookingDate: booking ? booking.datetime : '',
                    bookingPeople: booking ? booking.people : ''
                })
            });

            console.log('Status saved to server for booking:', bookingId);
            return true;
        } catch (error) {
            console.error('Error saving status to server:', error);
            // Fallback to localStorage
            this.saveBookingStatus(bookingId, status);
            return false;
        }
    }

    /**
     * Load all statuses from Google Apps Script
     */
    async loadAllStatuses() {
        try {
            const webAppUrl = 'https://script.google.com/macros/s/AKfycby-uU5nRZaNp17qXoLdGIMS8qhlBbovfCKciQh_Y3NKFalZV2MGiw3Qmsc751-WTqayYw/exec';
            
            // Use JSONP to fetch statuses (works with CORS)
            const callbackName = 'statusCallback_' + Date.now();
            
            return new Promise((resolve, reject) => {
                // Set up callback
                window[callbackName] = (data) => {
                    if (data.success && data.statuses) {
                        // Apply statuses to bookings
                        this.bookings.forEach(booking => {
                            if (data.statuses[booking.id]) {
                                booking.status = data.statuses[booking.id];
                            } else {
                                booking.status = 'Pending';
                            }
                        });
                    }
                    // Cleanup
                    delete window[callbackName];
                    document.body.removeChild(script);
                    resolve();
                };
                
                // Create script tag for JSONP
                const script = document.createElement('script');
                script.src = `${webAppUrl}?callback=${callbackName}`;
                script.onerror = () => {
                    console.error('Error loading statuses from server');
                    // Fallback to localStorage
                    this.bookings.forEach(booking => {
                        booking.status = this.loadBookingStatus(booking.id);
                    });
                    delete window[callbackName];
                    document.body.removeChild(script);
                    resolve();
                };
                
                document.body.appendChild(script);
            });
            
        } catch (error) {
            console.error('Error loading statuses from server:', error);
            // Fallback to localStorage
            this.bookings.forEach(booking => {
                booking.status = this.loadBookingStatus(booking.id);
            });
        }
    }

    /**
     * Save booking status to localStorage
     */
    saveBookingStatus(bookingId, status) {
        try {
            const statusData = JSON.parse(localStorage.getItem('booking_statuses') || '{}');
            statusData[bookingId] = status;
            localStorage.setItem('booking_statuses', JSON.stringify(statusData));
        } catch (error) {
            console.error('Error saving status:', error);
        }
    }

    /**
     * Load booking status from localStorage
     */
    loadBookingStatus(bookingId) {
        try {
            const statusData = JSON.parse(localStorage.getItem('booking_statuses') || '{}');
            return statusData[bookingId] || 'Pending';
        } catch (error) {
            return 'Pending';
        }
    }

    /**
     * Format datetime for display
     */
    formatDateTime(datetime) {
        try {
            const date = new Date(datetime);
            return date.toLocaleString('en-IN', {
                timeZone: 'Asia/Kolkata',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (error) {
            return datetime;
        }
    }

    /**
     * Format timestamp for display
     */
    formatTimestamp(timestamp) {
        try {
            const date = new Date(timestamp);
            const now = new Date();
            const diffMs = now - date;
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);

            if (diffMins < 1) return 'Just now';
            if (diffMins < 60) return `${diffMins} min ago`;
            if (diffHours < 24) return `${diffHours}h ago`;
            if (diffDays < 7) return `${diffDays}d ago`;
            
            return date.toLocaleDateString('en-IN');
        } catch (error) {
            return timestamp;
        }
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        // Create toast or alert
        const toast = document.createElement('div');
        toast.className = 'alert alert-success alert-dismissible fade show position-fixed top-0 end-0 m-3';
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }

    /**
     * Show error message
     */
    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'alert alert-danger alert-dismissible fade show position-fixed top-0 end-0 m-3';
        toast.style.zIndex = '9999';
        toast.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 5000);
    }
}

// Global instance
window.dashboardBookingViewer = new DashboardBookingViewer();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.dashboardBookingViewer.init();
    });
} else {
    window.dashboardBookingViewer.init();
}
