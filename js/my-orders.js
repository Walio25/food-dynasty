/**
 * My Orders Page - Order Tracking and History
 */

class MyOrdersManager {
    constructor() {
        this.orders = [];
        this.statusConfig = {
            pending: { label: 'Pending', icon: 'clock', color: 'warning' },
            preparing: { label: 'Preparing', icon: 'fire', color: 'info' },
            ready: { label: 'Ready', icon: 'check-circle', color: 'success' },
            delivered: { label: 'Delivered', icon: 'box', color: 'secondary' },
            cancelled: { label: 'Cancelled', icon: 'times-circle', color: 'danger' }
        };
    }

    init() {
        this.checkAuth();
        this.loadOrders();
        this.renderOrders();
        this.startAutoStatusUpdate();
    }

    checkAuth() {
        const userName = localStorage.getItem('userName');
        const userEmail = localStorage.getItem('userEmail');

        const loginRequired = document.getElementById('login-required');
        const ordersContent = document.getElementById('orders-content');

        if (!userName || !userEmail) {
            loginRequired.classList.remove('d-none');
            ordersContent.classList.add('d-none');
            return false;
        }

        loginRequired.classList.add('d-none');
        ordersContent.classList.remove('d-none');
        return true;
    }

    loadOrders() {
        const userEmail = localStorage.getItem('userEmail');
        if (!userEmail) return;

        this.orders = JSON.parse(localStorage.getItem(`orders_${userEmail}`) || '[]');
    }

    renderOrders() {
        const ordersList = document.getElementById('orders-list');
        const noOrders = document.getElementById('no-orders');

        if (!ordersList) return;

        if (this.orders.length === 0) {
            noOrders.classList.remove('d-none');
            ordersList.innerHTML = '';
            return;
        }

        noOrders.classList.add('d-none');

        const html = this.orders.map(order => this.renderOrderCard(order)).join('');
        ordersList.innerHTML = html;
    }

    renderOrderCard(order) {
        const status = this.statusConfig[order.status] || this.statusConfig.pending;
        const orderDate = new Date(order.createdAt);
        
        return `
            <div class="card order-card mb-4">
                <div class="card-header bg-light">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <h5 class="mb-0">
                                <i class="fas fa-receipt me-2"></i>Order #${order.id}
                            </h5>
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>
                                ${orderDate.toLocaleString('en-IN', { 
                                    dateStyle: 'medium', 
                                    timeStyle: 'short' 
                                })}
                            </small>
                        </div>
                        <div class="col-md-6 text-md-end">
                            <span class="badge status-badge-${order.status} px-3 py-2">
                                <i class="fas fa-${status.icon} me-1"></i>
                                ${status.label}
                            </span>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-8">
                            <h6 class="mb-3">Order Items:</h6>
                            <div class="table-responsive">
                                <table class="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Qty</th>
                                            <th>Price</th>
                                            <th>Total</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${order.items.map(item => `
                                            <tr>
                                                <td>${item.name}</td>
                                                <td>${item.quantity}</td>
                                                <td>₹${item.price}</td>
                                                <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                            
                            ${order.status !== 'cancelled' && order.status !== 'delivered' ? `
                                <button class="btn btn-sm btn-outline-danger mt-2" 
                                        onclick="myOrdersManager.cancelOrder('${order.id}')">
                                    <i class="fas fa-times me-1"></i>Cancel Order
                                </button>
                            ` : ''}
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-light">
                                <div class="card-body">
                                    <h6 class="mb-3">Order Summary</h6>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Subtotal:</span>
                                        <span>₹${order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div class="d-flex justify-content-between mb-2">
                                        <span>Tax (5%):</span>
                                        <span>₹${order.tax.toFixed(2)}</span>
                                    </div>
                                    <hr>
                                    <div class="d-flex justify-content-between">
                                        <strong>Total:</strong>
                                        <strong class="text-primary">₹${order.total.toFixed(2)}</strong>
                                    </div>
                                    
                                    ${order.status !== 'cancelled' && order.status !== 'delivered' ? `
                                        <div class="alert alert-info mt-3 mb-0 p-2">
                                            <small>
                                                <i class="fas fa-clock me-1"></i>
                                                Est. Time: ${order.estimatedTime || 30} mins
                                            </small>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                            
                            <!-- Order Tracking Timeline -->
                            <div class="mt-3">
                                <h6>Order Status:</h6>
                                <div class="timeline">
                                    <div class="timeline-item ${order.status === 'pending' || order.status === 'preparing' || order.status === 'ready' || order.status === 'delivered' ? 'active' : ''}">
                                        <small class="text-muted">Order Placed</small>
                                    </div>
                                    <div class="timeline-item ${order.status === 'preparing' || order.status === 'ready' || order.status === 'delivered' ? 'active' : ''}">
                                        <small class="text-muted">Preparing</small>
                                    </div>
                                    <div class="timeline-item ${order.status === 'ready' || order.status === 'delivered' ? 'active' : ''}">
                                        <small class="text-muted">Ready</small>
                                    </div>
                                    <div class="timeline-item ${order.status === 'delivered' ? 'active' : ''}">
                                        <small class="text-muted">Delivered</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this order?')) return;

        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;

        if (order.status === 'delivered' || order.status === 'cancelled') {
            alert('This order cannot be cancelled');
            return;
        }

        order.status = 'cancelled';
        order.updatedAt = new Date().toISOString();

        const userEmail = localStorage.getItem('userEmail');
        localStorage.setItem(`orders_${userEmail}`, JSON.stringify(this.orders));

        // Update global orders
        const allOrders = JSON.parse(localStorage.getItem('allOrders') || '[]');
        const globalOrder = allOrders.find(o => o.id === orderId);
        if (globalOrder) {
            globalOrder.status = 'cancelled';
            globalOrder.updatedAt = new Date().toISOString();
            localStorage.setItem('allOrders', JSON.stringify(allOrders));
        }

        this.renderOrders();
        this.showNotification('Order cancelled successfully', 'info');
    }

    // Auto-update order status simulation
    startAutoStatusUpdate() {
        setInterval(() => {
            let updated = false;
            const now = new Date().getTime();

            this.orders.forEach(order => {
                if (order.status === 'cancelled' || order.status === 'delivered') return;

                const createdTime = new Date(order.createdAt).getTime();
                const elapsedMinutes = (now - createdTime) / (1000 * 60);

                // Auto progression: pending → preparing (2 min) → ready (15 min) → delivered (30 min)
                if (order.status === 'pending' && elapsedMinutes >= 2) {
                    order.status = 'preparing';
                    updated = true;
                } else if (order.status === 'preparing' && elapsedMinutes >= 15) {
                    order.status = 'ready';
                    updated = true;
                } else if (order.status === 'ready' && elapsedMinutes >= 30) {
                    order.status = 'delivered';
                    updated = true;
                }
            });

            if (updated) {
                const userEmail = localStorage.getItem('userEmail');
                localStorage.setItem(`orders_${userEmail}`, JSON.stringify(this.orders));
                this.renderOrders();
            }
        }, 10000); // Check every 10 seconds
    }

    showNotification(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed`;
        toast.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 250px;';
        toast.innerHTML = `<i class="fas fa-info-circle me-2"></i>${message}`;
        document.body.appendChild(toast);

        setTimeout(() => toast.remove(), 3000);
    }
}

// Initialize
const myOrdersManager = new MyOrdersManager();
window.myOrdersManager = myOrdersManager;

document.addEventListener('DOMContentLoaded', function() {
    myOrdersManager.init();
});
