// Authentication Service - Food Dynasty
class LoginHandler {
    constructor() {
        // Google Sheets API Configuration
        this.SPREADSHEET_ID = '1vhA7pc5FnzE5bCxGKJ5K9n4x4Icwe6FfZADBx0q8AIs'; // Your registration form response sheet ID
        this.SHEET_NAME = 'Form Responses 1'; // Standard Google Forms response sheet name
        this.API_KEY = 'AIzaSyB2xOKhNnhRZmyskbbpHHzmZ4l5WcneQ2A';
        
        this.initializeEventListeners();
        this.checkExistingLogin();
    }

    initializeEventListeners() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
    }

    checkExistingLogin() {
        const savedUser = localStorage.getItem('userData');
        const loginTime = localStorage.getItem('loginTime');
        
        if (savedUser && loginTime) {
            const loginDate = new Date(loginTime);
            const now = new Date();
            const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
            
            // Check if remember me was enabled or if login is within 24 hours
            const rememberMe = localStorage.getItem('rememberMe') === 'true';
            
            if (rememberMe || hoursDiff < 24) {
                // User is still logged in, redirect to dashboard
                window.location.href = 'dashboard.html';
            } else {
                // Login expired
                this.logout();
            }
        }
    }

    async handleLogin() {
        const usernameOrEmail = document.getElementById('login-username').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        const rememberMe = document.getElementById('remember-me').checked;

        if (!usernameOrEmail || !password) {
            this.showError('Please enter both username/email and password');
            return;
        }

        this.setButtonLoading(true);
        this.hideError();

        try {
            // Fetch user data from Google Sheets
            const users = await this.fetchUserData();
            
            // Authenticate user
            const user = this.authenticateUser(users, usernameOrEmail, password);
            
            if (user) {
                // Login successful
                this.saveUserSession(user, rememberMe);
                
                // Show success message briefly
                this.showSuccessMessage();
                
                // Redirect to dashboard after 1 second
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                // Invalid credentials
                this.showError('Invalid username/email or password. Please check your credentials.');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Show specific error message
            if (error.message.includes('PERMISSION_ERROR')) {
                this.showError('Google Sheet is not public. Please make it accessible: Share → Anyone with the link → Viewer');
            } else if (error.message.includes('internet connection')) {
                this.showError(error.message);
            } else {
                this.showError('Login failed. Please try again or contact support.');
            }
        } finally {
            this.setButtonLoading(false);
        }
    }

    async fetchUserData() {
        try {
            console.log('Fetching user data from Google Sheets...');
            
            // Use REST API directly (more reliable)
            const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.SPREADSHEET_ID}/values/${encodeURIComponent(this.SHEET_NAME)}!A2:G?key=${this.API_KEY}`;
            console.log('Fetching from:', url);
            
            const res = await fetch(url);
            
            if (!res.ok) {
                if (res.status === 403) {
                    throw new Error('PERMISSION_ERROR: Please make your Google Sheet public (view-only). Go to Share → Anyone with the link → Viewer');
                }
                throw new Error(`Failed to fetch user data: ${res.status} ${res.statusText}`);
            }

            const data = await res.json();
            console.log('Received data:', data);
            
            if (data.values && data.values.length > 0) {
                return this.parseUserData(data.values);
            }

            // No users registered yet
            return [];
            
        } catch (error) {
            console.error('Error fetching user data:', error);
            
            // Show more helpful error messages
            if (error.message.includes('PERMISSION_ERROR')) {
                throw error;
            }
            
            throw new Error('Unable to verify credentials. Please check your internet connection or make sure the Google Sheet is accessible.');
        }
    }



    parseUserData(rows) {
        return rows.map(row => ({
            timestamp: row[0] || '',
            name: row[1] || '',
            email: (row[2] || '').toLowerCase(),
            phone: row[3] || '',
            username: (row[4] || '').toLowerCase(),
            password: row[5] || '', // This is base64 encoded
            address: row[6] || ''
        }));
    }

    authenticateUser(users, usernameOrEmail, password) {
        // Hash the input password (same way as registration)
        const hashedPassword = btoa(password);
        
        // Find user by username or email
        const user = users.find(u => 
            (u.username === usernameOrEmail || u.email === usernameOrEmail) &&
            u.password === hashedPassword
        );
        
        return user;
    }

    saveUserSession(user, rememberMe) {
        // Save user data (excluding password)
        const userData = {
            name: user.name,
            email: user.email,
            phone: user.phone,
            username: user.username,
            address: user.address
        };
        
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('userName', user.name);
        localStorage.setItem('userEmail', user.email);
        localStorage.setItem('loginTime', new Date().toISOString());
        localStorage.setItem('authToken', 'auth-' + Date.now());
        localStorage.setItem('rememberMe', rememberMe.toString());
        
        console.log('User session saved:', userData);
    }

    logout() {
        localStorage.removeItem('userData');
        localStorage.removeItem('userName');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('loginTime');
        localStorage.removeItem('authToken');
        localStorage.removeItem('rememberMe');
        
        window.location.href = 'login.html';
    }

    showSuccessMessage() {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.classList.remove('alert-danger');
            errorDiv.classList.add('alert-success');
            errorDiv.innerHTML = '<i class="fas fa-check-circle me-2"></i>Login successful! Redirecting...';
            errorDiv.classList.remove('d-none');
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('login-error');
        const errorText = document.getElementById('login-error-text');
        
        if (errorDiv) {
            errorDiv.classList.remove('alert-success');
            errorDiv.classList.add('alert-danger');
            
            if (errorText) {
                errorText.textContent = message;
            } else {
                errorDiv.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>${message}`;
            }
            errorDiv.classList.remove('d-none');
        }
    }

    hideError() {
        const errorDiv = document.getElementById('login-error');
        if (errorDiv) {
            errorDiv.classList.add('d-none');
        }
    }

    setButtonLoading(loading) {
        const btn = document.getElementById('login-btn');
        const btnText = btn?.querySelector('.btn-text');
        const btnSpinner = btn?.querySelector('.btn-spinner');
        
        if (btn && btnText && btnSpinner) {
            if (loading) {
                btnText.classList.add('d-none');
                btnSpinner.classList.remove('d-none');
                btn.disabled = true;
            } else {
                btnText.classList.remove('d-none');
                btnSpinner.classList.add('d-none');
                btn.disabled = false;
            }
        }
    }
}

// Export for global use
window.LoginHandler = LoginHandler;
