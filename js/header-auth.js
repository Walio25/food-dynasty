// Simple Header Authentication Handler (Name + Email Only)
class HeaderAuth {
    constructor() {
        this.userName = '';
        this.userEmail = '';
        
        this.initializeEventListeners();
        this.checkExistingLogin();
    }

    // Simple email validation
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Check if user is already logged in
    checkExistingLogin() {
        const savedName = localStorage.getItem('userName');
        const savedEmail = localStorage.getItem('userEmail');
        const loginTime = localStorage.getItem('loginTime');
        
        if (savedName && savedEmail && loginTime) {
            // Check if login is still valid (24 hours)
            const loginDate = new Date(loginTime);
            const now = new Date();
            const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
            
            if (hoursDiff < 24) {
                this.userName = savedName;
                this.userEmail = savedEmail;
                this.showLoggedInState();
                return true;
            } else {
                // Login expired, clear data
                this.logout();
            }
        }
        return false;
    }

    initializeEventListeners() {
        // Simple login form submission
        const loginForm = document.getElementById('header-login-form-element');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout functionality
        const logoutBtn = document.getElementById('header-logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Close dropdown on successful login
        document.addEventListener('click', (e) => {
            if (e.target.closest('.dropdown-menu')) {
                e.stopPropagation();
            }
        });
    }

    async handleLogin() {
        const nameInput = document.getElementById('headerUserName');
        const emailInput = document.getElementById('headerUserEmail');
        const loginBtn = document.getElementById('header-login-btn');
        
        // Get values
        const name = nameInput ? nameInput.value.trim() : '';
        const email = emailInput ? emailInput.value.trim() : '';
        
        // Validate name
        if (name.length < 2) {
            this.showError('Please enter your name (minimum 2 characters)');
            return;
        }

        // Validate email
        if (!this.validateEmail(email)) {
            this.showError('Please enter a valid email address');
            return;
        }

        // Set loading state
        this.setButtonLoading(loginBtn, true);
        this.hideError();

        try {
            // Simulate a brief loading time for better UX
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Store user data
            this.userName = name;
            this.userEmail = email;
            
            // Save to localStorage
            localStorage.setItem('userName', name);
            localStorage.setItem('userEmail', email);
            localStorage.setItem('loginTime', new Date().toISOString());
            localStorage.setItem('authToken', 'simple-login-token');
            
            this.showSuccessMessage();
            
            // Show logged in state immediately
            this.showLoggedInState();
            
            // Update UI immediately after login
            if (window.updateAuthUI) {
                window.updateAuthUI();
            }
            
            // Notify dashboard to refresh if user is on dashboard page
            if (window.dashboardManager && typeof window.dashboardManager.refreshDashboard === 'function') {
                setTimeout(() => {
                    window.dashboardManager.refreshDashboard();
                }, 500);
            }
            
            // Close dropdown after success
            setTimeout(() => {
                this.closeDropdown();
                this.resetForm();
                
                // Final UI update
                this.showLoggedInState();
                if (window.updateAuthUI) {
                    window.updateAuthUI();
                }
            }, 2000);
            
        } catch (error) {
            this.showError('Login failed. Please try again.');
        } finally {
            this.setButtonLoading(loginBtn, false);
        }
    }

    logout() {
        // Clear all stored data
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('authToken');
        
        // Reset state
        this.userName = '';
        this.userEmail = '';
        
        // Show logged out state
        this.showLoggedOutState();
        
        // Update UI
        if (window.updateAuthUI) {
            window.updateAuthUI();
        }
    }

    showLoggedInState() {
        const loginSection = document.getElementById('login-section');
        const userSection = document.getElementById('user-section');
        
        if (loginSection) {
            loginSection.classList.add('d-none');
            loginSection.style.cssText = 'display: none !important; visibility: hidden !important;';
        }
        
        if (userSection) {
            userSection.classList.remove('d-none');
            userSection.style.cssText = 'display: block !important; visibility: visible !important;';
            
            // Update user display
            const navUserName = document.getElementById('navUserPhone');
            const dropdownUserName = document.getElementById('dropdownUserName');
            const dropdownUserEmail = document.getElementById('dropdownUserPhone');
            
            if (navUserName) {
                navUserName.textContent = this.userName;
            }
            if (dropdownUserName) {
                dropdownUserName.textContent = this.userName;
            }
            if (dropdownUserEmail) {
                dropdownUserEmail.textContent = this.userEmail;
            }
        }
    }

    showLoggedOutState() {
        const loginSection = document.getElementById('login-section');
        const userSection = document.getElementById('user-section');
        
        if (loginSection) {
            loginSection.classList.remove('d-none');
            loginSection.style.cssText = 'display: block !important; visibility: visible !important;';
        }
        if (userSection) {
            userSection.classList.add('d-none');
            userSection.style.cssText = 'display: none !important; visibility: hidden !important;';
        }
    }

    showSuccessMessage() {
        const container = document.getElementById('header-login-container');
        if (container) {
            container.innerHTML = `
                <div class="text-center">
                    <div class="text-success mb-2">
                        <i class="fas fa-check-circle" style="font-size: 2rem;"></i>
                    </div>
                    <h6 class="text-success mb-2">Login Successful!</h6>
                    <p class="small text-muted mb-0">Welcome to Food Dynasty, ${this.userName}!</p>
                </div>
            `;
        }
    }

    showError(message) {
        let errorDiv = document.getElementById('header-error-message');
        let errorText = document.getElementById('header-error-text');
        
        if (errorDiv) {
            // Update the error text if the element exists, otherwise set the whole div
            if (errorText) {
                errorText.textContent = message;
            } else {
                errorDiv.innerHTML = `<small><i class="fas fa-exclamation-triangle me-1"></i>${message}</small>`;
            }
            errorDiv.classList.remove('d-none');
        }
    }

    hideError() {
        const errorDiv = document.getElementById('header-error-message');
        if (errorDiv) {
            errorDiv.classList.add('d-none');
        }
    }

    setButtonLoading(button, isLoading) {
        if (!button) return;
        
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Logging in...';
        } else {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-sign-in-alt me-1"></i>Login';
        }
    }

    resetForm() {
        const nameInput = document.getElementById('headerUserName');
        const emailInput = document.getElementById('headerUserEmail');
        
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        
        this.hideError();
    }

    closeDropdown() {
        const dropdown = document.getElementById('loginDropdown');
        if (dropdown) {
            // Close Bootstrap dropdown
            const bsDropdown = bootstrap.Dropdown.getInstance(dropdown);
            if (bsDropdown) {
                bsDropdown.hide();
            }
        }
    }


}

// Initialize header authentication
document.addEventListener('DOMContentLoaded', function() {
    const loginContainer = document.getElementById('header-login-container');
    
    if (loginContainer) {
        window.headerAuth = new HeaderAuth();
        
        // Immediately update auth UI after creation
        if (typeof updateAuthUI === 'function') {
            updateAuthUI();
        }
    }
});

// Export for global use
window.HeaderAuth = HeaderAuth;