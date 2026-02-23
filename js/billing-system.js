// Billing System for Food-Dynasty Restaurant
class BillingSystem {
    constructor() {
        this.currentBill = {
            items: [],
            customerName: '',
            customerPhone: '',
            tableNumber: '',
            paymentMethod: 'cash'
        };
        
        this.gstPercent = 5;
        this.discountPercent = 0;
        this.isOnline = navigator.onLine;
        this.pendingSync = [];
        
        // Monitor network status
        this.setupNetworkMonitoring();
        
        // Complete menu database with prices
        this.menuItems = [
            // Breakfast
            { id: 1, name: 'Masala Dosa', price: 80, category: 'breakfast' },
            { id: 2, name: 'Idli Sambar (4 pcs)', price: 60, category: 'breakfast' },
            { id: 3, name: 'Vada Sambar (3 pcs)', price: 70, category: 'breakfast' },
            { id: 4, name: 'Poha', price: 50, category: 'breakfast' },
            { id: 5, name: 'Upma', price: 50, category: 'breakfast' },
            { id: 6, name: 'Aloo Paratha', price: 70, category: 'breakfast' },
            
            // Starters
            { id: 7, name: 'Paneer Tikka', price: 180, category: 'starter' },
            { id: 8, name: 'Chicken Tikka', price: 220, category: 'starter' },
            { id: 9, name: 'Veg Spring Roll', price: 120, category: 'starter' },
            { id: 10, name: 'Chicken Wings', price: 200, category: 'starter' },
            { id: 11, name: 'Fish Fingers', price: 240, category: 'starter' },
            { id: 12, name: 'Gobi Manchurian', price: 140, category: 'starter' },
            
            // Main Course - Veg
            { id: 13, name: 'Paneer Butter Masala', price: 220, category: 'veg' },
            { id: 14, name: 'Dal Tadka', price: 150, category: 'veg' },
            { id: 15, name: 'Dal Makhani', price: 170, category: 'veg' },
            { id: 16, name: 'Veg Biryani', price: 180, category: 'veg' },
            { id: 17, name: 'Palak Paneer', price: 200, category: 'veg' },
            { id: 18, name: 'Mix Veg Curry', price: 160, category: 'veg' },
            { id: 19, name: 'Malai Kofta', price: 210, category: 'veg' },
            { id: 20, name: 'Kadai Paneer', price: 220, category: 'veg' },
            
            // Main Course - Non-Veg
            { id: 21, name: 'Chicken Biryani', price: 250, category: 'non-veg' },
            { id: 22, name: 'Mutton Biryani', price: 320, category: 'non-veg' },
            { id: 23, name: 'Butter Chicken', price: 280, category: 'non-veg' },
            { id: 24, name: 'Chicken Curry', price: 240, category: 'non-veg' },
            { id: 25, name: 'Mutton Rogan Josh', price: 350, category: 'non-veg' },
            { id: 26, name: 'Fish Curry', price: 280, category: 'non-veg' },
            { id: 27, name: 'Prawn Masala', price: 340, category: 'non-veg' },
            { id: 28, name: 'Chicken Korma', price: 260, category: 'non-veg' },
            
            // Rice & Breads
            { id: 29, name: 'Plain Rice', price: 80, category: 'rice' },
            { id: 30, name: 'Jeera Rice', price: 100, category: 'rice' },
            { id: 31, name: 'Naan', price: 40, category: 'bread' },
            { id: 32, name: 'Butter Naan', price: 50, category: 'bread' },
            { id: 33, name: 'Garlic Naan', price: 60, category: 'bread' },
            { id: 34, name: 'Tandoori Roti', price: 30, category: 'bread' },
            { id: 35, name: 'Kulcha', price: 50, category: 'bread' },
            
            // Chinese
            { id: 36, name: 'Veg Fried Rice', price: 140, category: 'chinese' },
            { id: 37, name: 'Chicken Fried Rice', price: 180, category: 'chinese' },
            { id: 38, name: 'Veg Noodles', price: 140, category: 'chinese' },
            { id: 39, name: 'Chicken Noodles', price: 180, category: 'chinese' },
            { id: 40, name: 'Veg Manchurian', price: 160, category: 'chinese' },
            { id: 41, name: 'Chilli Chicken', price: 220, category: 'chinese' },
            
            // Beverages
            { id: 42, name: 'Cold Coffee', price: 80, category: 'beverage' },
            { id: 43, name: 'Hot Coffee', price: 50, category: 'beverage' },
            { id: 44, name: 'Tea', price: 30, category: 'beverage' },
            { id: 45, name: 'Fresh Lime Soda', price: 60, category: 'beverage' },
            { id: 46, name: 'Mango Shake', price: 90, category: 'beverage' },
            { id: 47, name: 'Lassi', price: 70, category: 'beverage' },
            { id: 48, name: 'Soft Drink', price: 40, category: 'beverage' },
            
            // Desserts
            { id: 49, name: 'Gulab Jamun (2 pcs)', price: 60, category: 'dessert' },
            { id: 50, name: 'Ice Cream', price: 80, category: 'dessert' },
            { id: 51, name: 'Rasgulla (2 pcs)', price: 60, category: 'dessert' },
            { id: 52, name: 'Gajar Halwa', price: 90, category: 'dessert' },
            { id: 53, name: 'Kheer', price: 70, category: 'dessert' }
        ];
        
        // Popular items for quick add
        this.popularItems = [1, 21, 23, 13, 31, 32, 22, 14, 42, 45, 36, 37];
        
        // Google Sheets Integration - Direct URL
        this.sheetsApiUrl = 'https://script.google.com/macros/s/AKfycby-uU5nRZaNp17qXoLdGIMS8qhlBbovfCKciQh_Y3NKFalZV2MGiw3Qmsc751-WTqayYw/exec';
        this.enableGoogleSheets = true;
        
        this.init();
    }
    
    setupNetworkMonitoring() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.hideOfflineBanner();
            this.showToast('Connection restored! Syncing pending bills...', 'success');
            this.syncPendingBills();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.showOfflineBanner();
            this.showToast('You are offline. Bills will be saved locally.', 'error');
        });
    }
    
    showOfflineBanner() {
        const banner = document.getElementById('offline-banner');
        if (banner) banner.style.display = 'block';
    }
    
    hideOfflineBanner() {
        const banner = document.getElementById('offline-banner');
        if (banner) banner.style.display = 'none';
    }
    
    showToast(message, type = 'success') {
        const toastId = type === 'success' ? 'success-toast' : 'error-toast';
        const messageId = type === 'success' ? 'success-message' : 'error-message';
        const toast = document.getElementById(toastId);
        const messageEl = document.getElementById(messageId);
        
        if (toast && messageEl) {
            messageEl.textContent = message;
            toast.style.display = 'block';
            
            setTimeout(() => {
                toast.style.display = 'none';
            }, 4000);
        }
    }
    
    showConfirmation(title, message, onConfirm) {
        const overlay = document.getElementById('confirmation-overlay');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        
        if (overlay && titleEl && messageEl) {
            titleEl.textContent = title;
            messageEl.textContent = message;
            overlay.style.display = 'flex';
            
            window.confirmAction = () => {
                onConfirm();
                this.closeConfirmation();
            };
        }
    }
    
    closeConfirmation() {
        const overlay = document.getElementById('confirmation-overlay');
        if (overlay) overlay.style.display = 'none';
    }
    
    syncPendingBills() {
        const pending = JSON.parse(localStorage.getItem('pendingBills') || '[]');
        if (pending.length === 0) return;
        
        console.log('Syncing', pending.length, 'pending bills...');
        
        pending.forEach(async (bill) => {
            await this.saveBillToSheets(bill);
        });
        
        localStorage.removeItem('pendingBills');
        this.showToast(`Synced ${pending.length} bills successfully!`, 'success');
    }
    
    init() {
        try {
            // Use direct URL if localStorage is blocked
            if (!this.sheetsApiUrl) {
                this.sheetsApiUrl = 'https://script.google.com/macros/s/AKfycby-uU5nRZaNp17qXoLdGIMS8qhlBbovfCKciQh_Y3NKFalZV2MGiw3Qmsc751-WTqayYw/exec';
            }
            
            this.setupEventListeners();
            this.renderMenuItems('all');
            this.setupCategoryTabs();
            this.loadTodayStats();
            this.generateBillNumber();
            
            // Auto-calculate on GST/Discount change
            const gstInput = document.getElementById('gst-percent');
            const discountInput = document.getElementById('discount-percent');
            
            if (gstInput) {
                gstInput.addEventListener('input', () => {
                    this.gstPercent = parseFloat(gstInput.value) || 0;
                    this.calculateTotals();
                });
            }
            
            if (discountInput) {
                discountInput.addEventListener('input', () => {
                    this.discountPercent = parseFloat(discountInput.value) || 0;
                    this.calculateTotals();
                });
            }
            
            // Check network status
            if (!this.isOnline) {
                this.showOfflineBanner();
            }
            
            console.log('✅ Billing System initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing billing system:', error);
            this.showToast('Failed to initialize billing system', 'error');
        }
    }
    
    setupEventListeners() {
        const searchInput = document.getElementById('menu-search');
        const searchResults = document.getElementById('search-results');
        
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.trim().toLowerCase();
            
            if (query.length < 2) {
                searchResults.style.display = 'none';
                return;
            }
            
            const results = this.menuItems.filter(item => 
                item.name.toLowerCase().includes(query)
            );
            
            if (results.length > 0) {
                searchResults.innerHTML = results.map(item => `
                    <div class="search-item" onclick="window.billingSystem.addItemToBill(${item.id})">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <strong>${item.name}</strong>
                                <br><small class="text-muted">${item.category}</small>
                            </div>
                            <div class="text-end">
                                <strong class="text-primary">₹${item.price}</strong>
                            </div>
                        </div>
                    </div>
                `).join('');
                searchResults.style.display = 'block';
            } else {
                searchResults.innerHTML = '<div class="search-item text-muted">No items found</div>';
                searchResults.style.display = 'block';
            }
        });
        
        // Hide search results when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.menu-search')) {
                searchResults.style.display = 'none';
            }
        });
    }
    
    renderQuickAddButtons() {
        const container = document.getElementById('quick-add-grid');
        if (!container) {
            console.error('❌ Quick add grid container not found!');
            return;
        }
        
        const buttons = this.popularItems.map(itemId => {
            const item = this.menuItems.find(i => i.id === itemId);
            if (!item) return '';
            return `
                <div class="quick-add-btn" onclick="window.billingSystem.addItemToBill(${item.id})">
                    <strong>${item.name}</strong>
                    <div class="text-primary"><small>₹${item.price}</small></div>
                </div>
            `;
        }).join('');
        container.innerHTML = buttons;
        console.log('✅ Quick add buttons rendered');
    }
    
    renderMenuItems(category = 'all') {
        const container = document.getElementById('menu-items-container');
        if (!container) {
            console.error('❌ Menu items container not found!');
            return;
        }
        
        // Filter items by category
        let items = category === 'all' 
            ? this.menuItems 
            : this.menuItems.filter(item => item.category === category);
        
        // Group items by category for display
        const categories = {
            'breakfast': 'Breakfast',
            'starter': 'Starters',
            'veg': 'Veg Main Course',
            'non-veg': 'Non-Veg Main Course',
            'rice': 'Rice',
            'bread': 'Breads',
            'chinese': 'Chinese',
            'beverage': 'Beverages',
            'dessert': 'Desserts'
        };
        
        // Category color mapping
        const categoryColors = {
            'breakfast': '#FF6B6B',
            'starter': '#4ECDC4',
            'veg': '#45B7D1',
            'non-veg': '#FFA07A',
            'rice': '#98D8C8',
            'bread': '#F7DC6F',
            'chinese': '#BB8FCE',
            'beverage': '#85C1E2',
            'dessert': '#F8B195'
        };
        
        let html = '';
        
        if (category === 'all') {
            // Show all items grouped by category with modern cards
            Object.keys(categories).forEach(cat => {
                const categoryItems = this.menuItems.filter(item => item.category === cat);
                if (categoryItems.length > 0) {
                    html += `
                        <div class="mb-4">
                            <div class="d-flex align-items-center mb-3">
                                <div class="category-badge me-2" style="background: ${categoryColors[cat]}">${categories[cat]}</div>
                                <small class="text-muted">${categoryItems.length} items</small>
                            </div>
                            ${categoryItems.map(item => `
                                <div class="menu-item-card" onclick="window.billingSystem.addItemToBill(${item.id})">
                                    <div class="menu-item-info">
                                        <div class="menu-item-name">${item.name}</div>
                                        <span class="menu-item-category" style="border-left: 3px solid ${categoryColors[cat]}">${categories[cat]}</span>
                                    </div>
                                    <div class="d-flex align-items-center">
                                        <div class="menu-item-price">₹${item.price}</div>
                                        <button class="add-item-btn">
                                            <i class="fas fa-plus me-1"></i>Add
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    `;
                }
            });
        } else {
            // Show single category with modern cards
            const categoryColor = categoryColors[category] || '#FEA116';
            html = `
                <div class="mb-3">
                    <div class="d-flex align-items-center mb-3">
                        <div class="category-badge" style="background: ${categoryColor}">${categories[category]}</div>
                        <small class="text-muted ms-2">${items.length} items</small>
                    </div>
                    ${items.map(item => `
                        <div class="menu-item-card" onclick="window.billingSystem.addItemToBill(${item.id})">
                            <div class="menu-item-info">
                                <div class="menu-item-name">${item.name}</div>
                                <span class="menu-item-category" style="border-left: 3px solid ${categoryColor}">${categories[category]}</span>
                            </div>
                            <div class="d-flex align-items-center">
                                <div class="menu-item-price">₹${item.price}</div>
                                <button class="add-item-btn">
                                    <i class="fas fa-plus me-1"></i>Add
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        
        container.innerHTML = html;
        console.log(`✅ Rendered ${items.length} menu items for category: ${category}`);
    }
    
    setupCategoryTabs() {
        const tabs = document.querySelectorAll('#category-tabs .nav-link');
        tabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Get category and render items
                const category = tab.getAttribute('data-category');
                this.renderMenuItems(category);
            });
        });
    }
    
    addItemToBill(itemId) {
        try {
            console.log('➕ Adding item to bill:', itemId);
            
            const menuItem = this.menuItems.find(i => i.id === itemId);
            if (!menuItem) {
                console.error('❌ Item not found:', itemId);
                this.showToast('Item not found!', 'error');
                return;
            }
            
            console.log('📦 Found menu item:', menuItem);
            
            // Check if item already exists
            const existingItem = this.currentBill.items.find(i => i.id === itemId);
            
            if (existingItem) {
                existingItem.quantity++;
                console.log('🔄 Updated quantity:', existingItem);
            } else {
                this.currentBill.items.push({
                    id: menuItem.id,
                    name: menuItem.name,
                    price: menuItem.price,
                    quantity: 1
                });
                console.log('✅ Added new item to bill');
            }
            
            this.renderBillItems();
            this.calculateTotals();
            this.showToast(`${menuItem.name} added to bill`, 'success');
            
            // Clear search
            const searchInput = document.getElementById('menu-search');
            const searchResults = document.getElementById('search-results');
            if (searchInput) searchInput.value = '';
            if (searchResults) searchResults.style.display = 'none';
            
        } catch (error) {
            console.error('❌ Error adding item:', error);
            this.showToast('Failed to add item to bill', 'error');
        }
    }
    
    removeItemFromBill(itemId) {
        this.currentBill.items = this.currentBill.items.filter(item => item.id !== itemId);
        this.renderBillItems();
        this.calculateTotals();
    }
    
    updateItemQuantity(itemId, quantity) {
        const item = this.currentBill.items.find(i => i.id === itemId);
        if (!item) return;
        
        if (quantity <= 0) {
            this.removeItemFromBill(itemId);
        } else {
            item.quantity = quantity;
            this.renderBillItems();
            this.calculateTotals();
        }
    }
    
    renderBillItems() {
        const container = document.getElementById('bill-items');
        
        if (this.currentBill.items.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No items added yet</p>';
            return;
        }
        
        const html = this.currentBill.items.map(item => `
            <div class="bill-item">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="flex-grow-1">
                        <strong>${item.name}</strong>
                        <div class="text-muted"><small>₹${item.price} each</small></div>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="billingSystem.removeItemFromBill(${item.id})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                    <div class="qty-controls">
                        <button class="qty-btn" onclick="billingSystem.updateItemQuantity(${item.id}, ${item.quantity - 1})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="number" class="qty-input" value="${item.quantity}" min="1" 
                               onchange="billingSystem.updateItemQuantity(${item.id}, parseInt(this.value))">
                        <button class="qty-btn" onclick="billingSystem.updateItemQuantity(${item.id}, ${item.quantity + 1})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <strong class="text-primary">₹${(item.price * item.quantity).toFixed(2)}</strong>
                </div>
            </div>
        `).join('');
        
        container.innerHTML = html;
    }
    
    calculateTotals() {
        const subtotal = this.currentBill.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        
        const gstAmount = (subtotal * this.gstPercent) / 100;
        const discountAmount = (subtotal * this.discountPercent) / 100;
        const total = subtotal + gstAmount - discountAmount;
        
        document.getElementById('bill-subtotal').textContent = `₹${subtotal.toFixed(2)}`;
        document.getElementById('bill-gst').textContent = `₹${gstAmount.toFixed(2)}`;
        document.getElementById('bill-discount').textContent = `-₹${discountAmount.toFixed(2)}`;
        document.getElementById('bill-total').textContent = `₹${total.toFixed(2)}`;
    }
    
    generateBillNumber() {
        const today = new Date().toISOString().split('T')[0];
        const bills = JSON.parse(localStorage.getItem('restaurant_bills') || '[]');
        const todayBills = bills.filter(b => b.date === today);
        const billNumber = `FD${today.replace(/-/g, '')}${String(todayBills.length + 1).padStart(3, '0')}`;
        
        const billNumElement = document.getElementById('current-bill-number');
        if (billNumElement) {
            billNumElement.textContent = billNumber;
        }
        
        return billNumber;
    }
    
    completeBill() {
        if (this.currentBill.items.length === 0) {
            alert('❌ Please add items to the bill first!');
            return;
        }
        
        // Get customer info
        this.currentBill.customerName = document.getElementById('customer-name').value || 'Walk-in Customer';
        this.currentBill.customerPhone = document.getElementById('customer-phone').value;
        this.currentBill.tableNumber = document.getElementById('table-number').value;
        
        // Calculate totals
        const subtotal = this.currentBill.items.reduce((sum, item) => 
            sum + (item.price * item.quantity), 0
        );
        const gstAmount = (subtotal * this.gstPercent) / 100;
        const discountAmount = (subtotal * this.discountPercent) / 100;
        const total = subtotal + gstAmount - discountAmount;
        
        // Create bill object
        const bill = {
            billNumber: this.generateBillNumber(),
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString(),
            customerName: this.currentBill.customerName,
            customerPhone: this.currentBill.customerPhone,
            tableNumber: this.currentBill.tableNumber,
            items: [...this.currentBill.items],
            subtotal: subtotal,
            gstPercent: this.gstPercent,
            gstAmount: gstAmount,
            discountPercent: this.discountPercent,
            discountAmount: discountAmount,
            total: total,
            paymentMethod: this.currentBill.paymentMethod
        };
        
        // Save to localStorage
        const bills = JSON.parse(localStorage.getItem('restaurant_bills') || '[]');
        bills.push(bill);
        localStorage.setItem('restaurant_bills', JSON.stringify(bills));
        
        // Save to Google Sheets
        this.saveBillToGoogleSheets(bill);
        
        // Prepare print
        this.preparePrint(bill);
        
        // Print
        window.print();
        
        // Clear bill after print
        setTimeout(() => {
            this.clearBill();
            this.loadTodayStats();
            this.loadRecentBills();
            alert('✅ Bill completed successfully!\n\nBill Number: ' + bill.billNumber);
        }, 500);
    }
    
    preparePrint(bill) {
        document.getElementById('print-bill-no').textContent = bill.billNumber;
        document.getElementById('print-date').textContent = bill.date;
        document.getElementById('print-time').textContent = bill.time;
        document.getElementById('print-customer').textContent = bill.customerName;
        document.getElementById('print-table').textContent = bill.tableNumber || '---';
        document.getElementById('print-payment').textContent = bill.paymentMethod.toUpperCase();
        
        // Show/hide customer and table rows
        document.getElementById('print-customer-row').style.display = 
            bill.customerName !== 'Walk-in Customer' ? 'flex' : 'none';
        document.getElementById('print-table-row').style.display = 
            bill.tableNumber ? 'flex' : 'none';
        
        // Items
        const itemsHtml = bill.items.map(item => `
            <tr>
                <td style="padding: 5px 0;">${item.name}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">₹${item.price}</td>
                <td style="text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');
        document.getElementById('print-items').innerHTML = itemsHtml;
        
        // Totals
        document.getElementById('print-subtotal').textContent = `₹${bill.subtotal.toFixed(2)}`;
        document.getElementById('print-gst-label').textContent = `GST (${bill.gstPercent}%):`;
        document.getElementById('print-gst').textContent = `₹${bill.gstAmount.toFixed(2)}`;
        document.getElementById('print-discount-label').textContent = `Discount (${bill.discountPercent}%):`;
        document.getElementById('print-discount').textContent = `-₹${bill.discountAmount.toFixed(2)}`;
        document.getElementById('print-total').textContent = `₹${bill.total.toFixed(2)}`;
        
        // Show/hide discount row
        document.getElementById('print-discount-row').style.display = 
            bill.discountPercent > 0 ? 'flex' : 'none';
    }
    
    clearBill() {
        this.currentBill = {
            items: [],
            customerName: '',
            customerPhone: '',
            tableNumber: '',
            paymentMethod: 'cash'
        };
        
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-phone').value = '';
        document.getElementById('table-number').value = '';
        document.getElementById('gst-percent').value = '5';
        document.getElementById('discount-percent').value = '0';
        this.gstPercent = 5;
        this.discountPercent = 0;
        
        this.renderBillItems();
        this.calculateTotals();
        this.generateBillNumber();
        
        // Reset payment to cash
        this.currentBill.paymentMethod = 'cash';
        document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-method="cash"]').classList.add('active');
    }
    
    loadTodayStats() {
        const today = new Date().toISOString().split('T')[0];
        const bills = JSON.parse(localStorage.getItem('restaurant_bills') || '[]');
        const todayBills = bills.filter(b => b.date === today);
        
        const todaySales = todayBills.reduce((sum, bill) => sum + bill.total, 0);
        const avgBill = todayBills.length > 0 ? todaySales / todayBills.length : 0;
        
        const todaySalesEl = document.getElementById('today-sales');
        const totalBillsEl = document.getElementById('total-bills');
        const avgBillEl = document.getElementById('avg-bill');
        const lastBillTimeEl = document.getElementById('last-bill-time');
        
        if (todaySalesEl) todaySalesEl.textContent = `₹${todaySales.toFixed(2)}`;
        if (totalBillsEl) totalBillsEl.textContent = todayBills.length;
        if (avgBillEl) avgBillEl.textContent = `₹${avgBill.toFixed(2)}`;
        
        // Show last bill time
        if (lastBillTimeEl && todayBills.length > 0) {
            const lastBill = todayBills[todayBills.length - 1];
            lastBillTimeEl.textContent = lastBill.time;
        }
        
        this.loadRecentBills();
    }
    
    loadRecentBills() {
        const today = new Date().toISOString().split('T')[0];
        const bills = JSON.parse(localStorage.getItem('restaurant_bills') || '[]');
        const todayBills = bills.filter(b => b.date === today).reverse();
        
        const container = document.getElementById('recent-bills-list');
        
        if (todayBills.length === 0) {
            container.innerHTML = '<p class="text-muted text-center">No bills created yet</p>';
            return;
        }
        
        const displayCount = 5;
        const displayBills = todayBills.slice(0, displayCount);
        const remainingCount = todayBills.length - displayCount;
        
        const html = displayBills.map(bill => `
            <div class="card mb-2">
                <div class="card-body p-2">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <strong>${bill.billNumber}</strong>
                            <div class="text-muted"><small>${bill.time} | ${bill.customerName}</small></div>
                            <div><small>${bill.items.length} items</small></div>
                        </div>
                        <div class="text-end">
                            <strong class="text-success">₹${bill.total.toFixed(2)}</strong>
                            <div><small class="badge bg-info">${bill.paymentMethod.toUpperCase()}</small></div>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        const moreButton = remainingCount > 0 ? `
            <div class="text-center mt-2">
                <a href="bills-history.html" class="btn btn-sm btn-outline-primary">
                    <i class="fas fa-plus me-1"></i>View ${remainingCount} More Bills
                </a>
            </div>
        ` : '';
        
        container.innerHTML = html + moreButton;
    }
    
    async saveBillToGoogleSheets(bill) {
        if (!this.enableGoogleSheets || !this.sheetsApiUrl) {
            console.log('⚠️ Google Sheets integration not configured');
            console.log('API URL:', this.sheetsApiUrl);
            return;
        }
        
        try {
            console.log('📤 Sending bill to Google Sheets:', bill.billNumber);
            
            // Use no-cors mode for Google Apps Script
            const response = await fetch(this.sheetsApiUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'saveBill',
                    billNumber: bill.billNumber,
                    date: bill.date,
                    time: bill.time,
                    customerName: bill.customerName,
                    customerPhone: bill.customerPhone,
                    tableNumber: bill.tableNumber,
                    items: bill.items,
                    subtotal: bill.subtotal,
                    gstPercent: bill.gstPercent,
                    gstAmount: bill.gstAmount,
                    discountPercent: bill.discountPercent,
                    discountAmount: bill.discountAmount,
                    total: bill.total,
                    paymentMethod: bill.paymentMethod
                })
            });
            
            // With no-cors, we can't read the response, but the request was sent
            console.log('✅ Bill sent to Google Sheets (check your spreadsheet):', bill.billNumber);
            return true;
            
        } catch (error) {
            console.error('❌ Error saving to Google Sheets:', error);
            console.error('Error details:', error.message);
            return false;
        }
    }
}

// Payment method selection
function selectPayment(method) {
    if (window.billingSystem) {
        window.billingSystem.currentBill.paymentMethod = method;
        document.querySelectorAll('.payment-btn').forEach(btn => btn.classList.remove('active'));
        const selectedBtn = document.querySelector(`[data-method="${method}"]`);
        if (selectedBtn) selectedBtn.classList.add('active');
    }
}

// Clear bill with confirmation
function clearBill() {
    if (window.billingSystem && window.billingSystem.currentBill.items.length > 0) {
        window.billingSystem.showConfirmation(
            'Clear Current Bill?',
            'This will remove all items from the current bill. This action cannot be undone.',
            () => {
                window.billingSystem.clearBill();
            }
        );
    } else {
        window.billingSystem.showToast('No items to clear', 'error');
    }
}

// Complete bill
function completeBill() {
    if (window.billingSystem) {
        window.billingSystem.completeBill();
    }
}

// Close confirmation dialog
function closeConfirmation() {
    if (window.billingSystem) {
        window.billingSystem.closeConfirmation();
    }
}

// Restaurant logout
function handleRestaurantLogout() {
    if (window.billingSystem) {
        window.billingSystem.showConfirmation(
            'Logout Confirmation',
            'Are you sure you want to logout? Any unsaved changes will be lost.',
            () => {
                localStorage.removeItem('restaurantLoggedIn');
                window.location.href = 'restaurant-login.html';
            }
        );
    } else {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('restaurantLoggedIn');
            window.location.href = 'restaurant-login.html';
        }
    }
}

// Initialize billing system
let billingSystem;
window.billingSystem = null; // Pre-declare

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing Billing System...');
    billingSystem = new BillingSystem();
    
    // Make it globally accessible
    window.billingSystem = billingSystem;
    
    console.log('✅ Billing System initialized:', billingSystem);
    console.log('📦 Menu items loaded:', billingSystem.menuItems.length);
    console.log('🌍 Global access test:', typeof window.billingSystem.addItemToBill);
});
