/**
 * Notification Center for Food Dynasty
 * In-app, email, SMS, and WhatsApp notifications
 */

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.settings = {
            email: true,
            sms: false,
            whatsapp: true,
            push: true,
            orderUpdates: true,
            bookingUpdates: true,
            promotions: true,
            rewards: true
        };
    }

    // Initialize notifications for user
    init(email) {
        this.loadNotifications(email);
        this.loadSettings(email);
        this.startPolling(email);
    }

    // Create notification
    createNotification(email, notification) {
        const newNotification = {
            id: 'NOT-' + Date.now(),
            title: notification.title,
            message: notification.message,
            type: notification.type, // order, booking, reward, promo
            icon: notification.icon || 'bell',
            read: false,
            createdAt: new Date().toISOString(),
            actionUrl: notification.actionUrl || null
        };

        const userNotifications = this.getUserNotifications(email);
        userNotifications.unshift(newNotification);
        localStorage.setItem(`notifications_${email}`, JSON.stringify(userNotifications));

        // Show in-app notification
        this.showInAppNotification(newNotification);

        return newNotification;
    }

    // Show in-app notification toast
    showInAppNotification(notification) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 9999;
            min-width: 300px;
            max-width: 400px;
            background: white;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.2);
            padding: 15px;
            animation: slideInRight 0.5s;
        `;
        
        toast.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="flex-shrink-0">
                    <i class="fas fa-${notification.icon} fa-2x text-primary"></i>
                </div>
                <div class="flex-grow-1 ms-3">
                    <h6 class="mb-1">${notification.title}</h6>
                    <p class="mb-0 small text-muted">${notification.message}</p>
                    ${notification.actionUrl ? `
                        <a href="${notification.actionUrl}" class="btn btn-sm btn-primary mt-2">View</a>
                    ` : ''}
                </div>
                <button class="btn-close ms-2" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;

        document.body.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);

        // Play notification sound
        this.playNotificationSound();
    }

    // Play notification sound
    playNotificationSound() {
        // Create a simple beep using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }

    // Get user notifications
    getUserNotifications(email) {
        return JSON.parse(localStorage.getItem(`notifications_${email}`) || '[]');
    }

    // Load notifications
    loadNotifications(email) {
        this.notifications = this.getUserNotifications(email);
    }

    // Load settings
    loadSettings(email) {
        const saved = localStorage.getItem(`notification_settings_${email}`);
        if (saved) {
            this.settings = JSON.parse(saved);
        }
    }

    // Save settings
    saveSettings(email, settings) {
        this.settings = settings;
        localStorage.setItem(`notification_settings_${email}`, JSON.stringify(settings));
    }

    // Mark notification as read
    markAsRead(email, notificationId) {
        const notifications = this.getUserNotifications(email);
        const notification = notifications.find(n => n.id === notificationId);
        if (notification) {
            notification.read = true;
            localStorage.setItem(`notifications_${email}`, JSON.stringify(notifications));
        }
    }

    // Mark all as read
    markAllAsRead(email) {
        const notifications = this.getUserNotifications(email);
        notifications.forEach(n => n.read = true);
        localStorage.setItem(`notifications_${email}`, JSON.stringify(notifications));
    }

    // Get unread count
    getUnreadCount(email) {
        const notifications = this.getUserNotifications(email);
        return notifications.filter(n => !n.read).length;
    }

    // Delete notification
    deleteNotification(email, notificationId) {
        let notifications = this.getUserNotifications(email);
        notifications = notifications.filter(n => n.id !== notificationId);
        localStorage.setItem(`notifications_${email}`, JSON.stringify(notifications));
    }

    // Clear all notifications
    clearAll(email) {
        localStorage.setItem(`notifications_${email}`, JSON.stringify([]));
    }

    // Start polling for new notifications (simulate real-time)
    startPolling(email) {
        setInterval(() => {
            this.checkForNewNotifications(email);
        }, 30000); // Check every 30 seconds
    }

    // Check for new notifications based on orders/bookings
    checkForNewNotifications(email) {
        const orders = JSON.parse(localStorage.getItem(`orders_${email}`) || '[]');
        const notifications = this.getUserNotifications(email);

        orders.forEach(order => {
            // Check if order status changed and notification not sent
            const hasNotification = notifications.some(n => 
                n.type === 'order' && n.message.includes(order.id)
            );

            if (!hasNotification && (order.status === 'preparing' || order.status === 'ready')) {
                const statusMessages = {
                    preparing: 'Your order is being prepared',
                    ready: 'Your order is ready for pickup!'
                };

                this.createNotification(email, {
                    title: 'Order Update',
                    message: `${statusMessages[order.status]} - Order #${order.id}`,
                    type: 'order',
                    icon: order.status === 'ready' ? 'check-circle' : 'fire',
                    actionUrl: 'my-orders.html'
                });
            }
        });
    }

    // Render notification center UI
    renderNotificationCenter(email, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const notifications = this.getUserNotifications(email);
        const unreadCount = this.getUnreadCount(email);

        const html = `
            <div class="card">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">
                        <i class="fas fa-bell me-2"></i>Notifications
                        ${unreadCount > 0 ? `<span class="badge bg-danger ms-2">${unreadCount}</span>` : ''}
                    </h5>
                    <div>
                        ${notifications.length > 0 ? `
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="notificationManager.markAllAsRead('${email}'); location.reload();">
                                Mark All Read
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="if(confirm('Clear all notifications?')) { notificationManager.clearAll('${email}'); location.reload(); }">
                                Clear All
                            </button>
                        ` : ''}
                    </div>
                </div>
                <div class="card-body p-0">
                    ${notifications.length === 0 ? `
                        <div class="text-center text-muted py-5">
                            <i class="fas fa-bell-slash fa-3x mb-3"></i>
                            <p>No notifications</p>
                        </div>
                    ` : `
                        <div class="list-group list-group-flush">
                            ${notifications.map(notif => `
                                <div class="list-group-item ${!notif.read ? 'bg-light' : ''}" 
                                     onclick="notificationManager.markAsRead('${email}', '${notif.id}'); ${notif.actionUrl ? `window.location.href='${notif.actionUrl}'` : ''}">
                                    <div class="d-flex justify-content-between align-items-start">
                                        <div class="flex-grow-1">
                                            <div class="d-flex align-items-center mb-1">
                                                <i class="fas fa-${notif.icon} me-2 text-primary"></i>
                                                <strong>${notif.title}</strong>
                                                ${!notif.read ? '<span class="badge bg-primary ms-2">New</span>' : ''}
                                            </div>
                                            <p class="mb-1">${notif.message}</p>
                                            <small class="text-muted">
                                                <i class="fas fa-clock me-1"></i>
                                                ${new Date(notif.createdAt).toLocaleString()}
                                            </small>
                                        </div>
                                        <button class="btn btn-sm btn-outline-danger" 
                                                onclick="event.stopPropagation(); notificationManager.deleteNotification('${email}', '${notif.id}'); location.reload();">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    // Render notification badge in navbar
    renderNotificationBadge(email, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const unreadCount = this.getUnreadCount(email);

        container.innerHTML = `
            <a href="notifications.html" class="nav-link position-relative">
                <i class="fas fa-bell"></i>
                ${unreadCount > 0 ? `
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        ${unreadCount}
                    </span>
                ` : ''}
            </a>
        `;
    }

    // Send notification for order status
    notifyOrderStatus(email, orderId, status) {
        const messages = {
            preparing: 'Your order is being prepared by our chefs',
            ready: 'Your order is ready! Come pick it up.',
            delivered: 'Your order has been delivered. Enjoy your meal!'
        };

        if (messages[status]) {
            this.createNotification(email, {
                title: 'Order Update',
                message: `Order #${orderId}: ${messages[status]}`,
                type: 'order',
                icon: status === 'delivered' ? 'check-circle' : 'shopping-bag',
                actionUrl: 'my-orders.html'
            });
        }
    }

    // Send notification for booking confirmation
    notifyBookingConfirmation(email, bookingId, datetime) {
        this.createNotification(email, {
            title: 'Booking Confirmed',
            message: `Your table booking for ${datetime} has been confirmed!`,
            type: 'booking',
            icon: 'calendar-check',
            actionUrl: 'dashboard.html'
        });
    }

    // Send notification for reward points
    notifyRewardPoints(email, points, reason) {
        this.createNotification(email, {
            title: 'Reward Points Earned',
            message: `You earned ${points} points! ${reason}`,
            type: 'reward',
            icon: 'gift',
            actionUrl: 'rewards.html'
        });
    }
}

// Initialize
const notificationManager = new NotificationManager();
window.notificationManager = notificationManager;
