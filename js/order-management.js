/**
 * Order Management System for Food Dynasty
 * Handles online food ordering, cart management, and order tracking
 */

class OrderManager {
    constructor() {
        this.cart = [];
        this.orders = [];
        this.currentCategory = 'all';
        
        // Menu database
        this.menuItems = [
            // Breakfast
            { id: 1, name: 'Idli', category: 'breakfast', type: 'veg', price: 95, image: 'img/breakfast-1.jpg', description: 'Soft steamed rice cakes with chutney and sambar' },
            { id: 2, name: 'Poha', category: 'breakfast', type: 'veg', price: 99, image: 'img/breakfast-2.jpg', description: 'Flattened rice with vegetables and spices' },
            { id: 3, name: 'Dosa', category: 'breakfast', type: 'veg', price: 179, image: 'img/breakfast-3.jpg', description: 'Crispy fermented crepe with potato filling' },
            { id: 4, name: 'Appe', category: 'breakfast', type: 'veg', price: 115, image: 'img/breakfast-4.jpg', description: 'South Indian savory dumpling' },
            { id: 5, name: 'Bread Butter', category: 'breakfast', type: 'veg', price: 119, image: 'img/breakfast-5.jpg', description: 'Toasted bread with butter' },
            { id: 6, name: 'Upma', category: 'breakfast', type: 'veg', price: 98, image: 'img/breakfast-6.jpg', description: 'Savory semolina porridge with vegetables' },
            { id: 7, name: 'Coffee', category: 'breakfast', type: 'veg', price: 89, image: 'img/breakfast-8.jpg', description: 'Fresh brewed coffee' },
            
            // Lunch
            { id: 8, name: 'Nihari Ghost', category: 'lunch', type: 'non-veg', price: 483, image: 'img/menu-1.jpg', description: 'Slow cooked mutton stew' },
            { id: 9, name: 'Schezwan Fried Rice', category: 'lunch', type: 'veg', price: 449, image: 'img/menu-2.jpg', description: 'Spicy fried rice with vegetables' },
            { id: 10, name: 'Mutton Biryani', category: 'lunch', type: 'non-veg', price: 499, image: 'img/menu-3.jpg', description: 'Aromatic rice with tender mutton' },
            { id: 11, name: 'Butter Chicken', category: 'lunch', type: 'non-veg', price: 443, image: 'img/menu-4.jpg', description: 'Creamy tomato curry with chicken' },
            { id: 12, name: 'Vegetable Tandoori', category: 'lunch', type: 'veg', price: 312, image: 'img/menu-5.jpg', description: 'Grilled vegetables tandoori style' },
            { id: 13, name: 'Yellow Dal Tadka', category: 'lunch', type: 'veg', price: 115, image: 'img/menu-6.jpg', description: 'Lentils tempered with spices' },
            { id: 14, name: 'Paneer Biryani', category: 'lunch', type: 'veg', price: 399, image: 'img/menu-7.jpg', description: 'Aromatic rice with paneer cubes' },
            { id: 15, name: 'Chicken Tikka Salad', category: 'lunch', type: 'non-veg', price: 456, image: 'img/menu-8.jpg', description: 'Fresh salad with grilled chicken' },
            
            // Dinner
            { id: 16, name: 'Murgh Makhni', category: 'dinner', type: 'non-veg', price: 599, image: 'img/menu-1.jpg', description: 'Tandoori chicken in rich tomato gravy' },
            { id: 17, name: 'Rajma Raseela', category: 'dinner', type: 'veg', price: 289, image: 'img/menu-2.jpg', description: 'Red kidney beans curry' },
            { id: 18, name: 'Sag Aloo', category: 'dinner', type: 'veg', price: 250, image: 'img/menu-3.jpg', description: 'Potatoes cooked with spinach' },
            { id: 19, name: 'Paneer Kulcha', category: 'dinner', type: 'veg', price: 325, image: 'img/menu-4.jpg', description: 'Stuffed bread with paneer' },
            { id: 20, name: 'Navaratan Korma', category: 'dinner', type: 'veg', price: 355, image: 'img/menu-5.jpg', description: 'Mixed vegetables in creamy curry' },
            { id: 21, name: 'Chole Punjabi', category: 'dinner', type: 'veg', price: 313, image: 'img/menu-6.jpg', description: 'Spicy chickpea curry' },
            { id: 22, name: 'Egg Curry', category: 'dinner', type: 'non-veg', price: 350, image: 'img/menu-7.jpg', description: 'Boiled eggs in spicy gravy' },
            { id: 23, name: 'Maah Ki Dal with Roti', category: 'dinner', type: 'veg', price: 599, image: 'img/menu-8.jpg', description: 'Dal with 2 rotis' }
        ];
    }

    init() {
        this.loadCart();
        this.loadOrders();
        this.renderMenuItems();
        this.updateCartUI();
    }

    // Render menu items
    renderMenuItems() {
        const container = document.getElementById('menu-items');
        if (!container) return;

        let filteredItems = this.menuItems;

        // Apply category filter
        if (this.currentCategory !== 'all') {
            if (this.currentCategory === 'veg' || this.currentCategory === 'non-veg') {
                filteredItems = this.menuItems.filter(item => item.type === this.currentCategory);
            } else {
                filteredItems = this.menuItems.filter(item => item.category === this.currentCategory);
            }
        }

        const html = filteredItems.map(item => `
            <div class="col-lg-4 col-md-6 wow fadeInUp" data-wow-delay="0.1s">
                <div class="card menu-item-card">
                    <img src="${item.image}" class="card-img-top menu-item-img" alt="${item.name}">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">${item.name}</h5>
                            <span class="${item.type}-icon"></span>
                        </div>
                        <p class="card-text text-muted small">${item.description}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="price-tag">₹${item.price}</span>
                            <button class="btn btn-primary" onclick="orderManager.addToCart(${item.id})">
                                <i class="fas fa-plus me-1"></i>Add to Cart
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = html;
    }

    // Filter by category
    filterCategory(category) {
        this.currentCategory = category;
        this.renderMenuItems();

        // Update active button
        document.querySelectorAll('[data-category]').forEach(btn => {
            btn.classList.remove('btn-primary', 'active');
            btn.classList.add('btn-outline-primary');
        });
        const activeBtn = document.querySelector(`[data-category="${category}"]`);
        if (activeBtn) {
            activeBtn.classList.remove('btn-outline-primary', 'btn-outline-success', 'btn-outline-danger');
            activeBtn.classList.add('btn-primary', 'active');
        }
    }

    // Add to cart
    addToCart(itemId) {
        const item = this.menuItems.find(i => i.id === itemId);
        if (!item) return;

        const existingItem = this.cart.find(i => i.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.cart.push({ ...item, quantity: 1 });
        }

        this.saveCart();
        this.updateCartUI();
        this.showNotification(`${item.name} added to cart!`, 'success');
    }

    // Remove from cart
    removeFromCart(itemId) {
        this.cart = this.cart.filter(item => item.id !== itemId);
        this.saveCart();
        this.updateCartUI();
    }

    // Update quantity
    updateQuantity(itemId, change) {
        const item = this.cart.find(i => i.id === itemId);
        if (!item) return;

        item.quantity += change;
        if (item.quantity <= 0) {
            this.removeFromCart(itemId);
        } else {
            this.saveCart();
            this.updateCartUI();
        }
    }

    // Clear cart
    clearCart() {
        if (confirm('Are you sure you want to clear the cart?')) {
            this.cart = [];
            this.saveCart();
            this.updateCartUI();
            this.showNotification('Cart cleared', 'info');
        }
    }

    // Update cart UI
    updateCartUI() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartSummary = document.getElementById('cart-summary');

        const totalItems = this.cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCount) cartCount.textContent = totalItems;

        if (!cartItems) return;

        if (this.cart.length === 0) {
            cartItems.innerHTML = `
                <div class="text-center text-muted py-5">
                    <i class="fas fa-shopping-cart fa-3x mb-3"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
            if (cartSummary) cartSummary.classList.add('d-none');
            return;
        }

        // Render cart items
        const itemsHtml = this.cart.map(item => `
            <div class="card mb-2">
                <div class="card-body p-2">
                    <div class="d-flex align-items-center">
                        <img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;" alt="${item.name}">
                        <div class="flex-grow-1 ms-2">
                            <h6 class="mb-0">${item.name}</h6>
                            <small class="text-muted">₹${item.price} each</small>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center mt-2">
                        <div class="qty-control">
                            <button class="qty-btn" onclick="orderManager.updateQuantity(${item.id}, -1)">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span>${item.quantity}</span>
                            <button class="qty-btn" onclick="orderManager.updateQuantity(${item.id}, 1)">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <div>
                            <strong>₹${item.price * item.quantity}</strong>
                            <button class="btn btn-sm btn-outline-danger ms-2" onclick="orderManager.removeFromCart(${item.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        cartItems.innerHTML = itemsHtml;

        // Calculate totals
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const tax = subtotal * 0.05;
        const total = subtotal + tax;

        document.getElementById('cart-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('cart-tax').textContent = `₹${tax.toFixed(2)}`;
        document.getElementById('cart-total').textContent = `₹${total.toFixed(2)}`;
        
        if (cartSummary) cartSummary.classList.remove('d-none');
    }

    // Toggle cart sidebar
    toggleCart() {
        const sidebar = document.getElementById('cart-sidebar');
        const overlay = document.getElementById('cart-overlay');
        
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
    }

    // Proceed to checkout
    proceedToCheckout() {
        const userName = localStorage.getItem('userName');
        const userEmail = localStorage.getItem('userEmail');

        if (!userName || !userEmail) {
            alert('Please login to place an order');
            document.getElementById('loginDropdown').click();
            return;
        }

        if (this.cart.length === 0) {
            alert('Your cart is empty');
            return;
        }

        // Create order
        const order = {
            id: 'ORD-' + Date.now(),
            customerName: userName,
            customerEmail: userEmail,
            items: [...this.cart],
            subtotal: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            tax: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 0.05,
            total: this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) * 1.05,
            status: 'pending',
            createdAt: new Date().toISOString(),
            estimatedTime: 30 // minutes
        };

        this.orders.push(order);
        this.saveOrders();

        // Save to user-specific orders
        const userOrders = JSON.parse(localStorage.getItem(`orders_${userEmail}`) || '[]');
        userOrders.unshift(order);
        localStorage.setItem(`orders_${userEmail}`, JSON.stringify(userOrders));

        // Award loyalty points
        if (typeof loyaltyManager !== 'undefined') {
            loyaltyManager.awardOrderPoints(userEmail, order.total);
        }

        // Clear cart
        this.cart = [];
        this.saveCart();
        this.updateCartUI();
        this.toggleCart();

        // Show success and redirect
        this.showNotification('Order placed successfully! Points earned!', 'success');
        setTimeout(() => {
            window.location.href = 'my-orders.html';
        }, 1500);
    }

    // Load cart from localStorage
    loadCart() {
        const saved = localStorage.getItem('cart');
        this.cart = saved ? JSON.parse(saved) : [];
    }

    // Save cart to localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // Load orders from localStorage
    loadOrders() {
        const saved = localStorage.getItem('allOrders');
        this.orders = saved ? JSON.parse(saved) : [];
    }

    // Save orders to localStorage
    saveOrders() {
        localStorage.setItem('allOrders', JSON.stringify(this.orders));
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed`;
        toast.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 250px;';
        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>
            ${message}
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Get user orders
    getUserOrders(email) {
        return JSON.parse(localStorage.getItem(`orders_${email}`) || '[]');
    }

    // Update order status
    updateOrderStatus(orderId, newStatus) {
        const order = this.orders.find(o => o.id === orderId);
        if (order) {
            order.status = newStatus;
            order.updatedAt = new Date().toISOString();
            this.saveOrders();
            
            // Update user-specific orders
            const userOrders = this.getUserOrders(order.customerEmail);
            const userOrder = userOrders.find(o => o.id === orderId);
            if (userOrder) {
                userOrder.status = newStatus;
                userOrder.updatedAt = new Date().toISOString();
                localStorage.setItem(`orders_${order.customerEmail}`, JSON.stringify(userOrders));
            }
        }
    }
}

// Initialize
const orderManager = new OrderManager();
window.orderManager = orderManager;
