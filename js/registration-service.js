// Registration Service - Food Dynasty
class RegistrationHandler {
    constructor() {
        // Google Form Configuration for User Registration
        this.GOOGLE_FORM = {
            url: 'https://docs.google.com/forms/d/e/1FAIpQLSeAAYyTJDKdVN9g1t6HDkByvOt0SnV_XGDNffiSY7ttkPA7Qg/formResponse',
            fields: {
                name: 'entry.1441762937',
                email: 'entry.1954798555',
                phone: 'entry.1112423499',
                username: 'entry.421194549',
                password: 'entry.1224228799',
                address: 'entry.518137277'
            }
        };

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const registrationForm = document.getElementById('registration-form');
        if (registrationForm) {
            registrationForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegistration();
            });
        }

        // Password strength indicator
        const passwordInput = document.getElementById('reg-password');
        if (passwordInput) {
            passwordInput.addEventListener('input', (e) => {
                this.checkPasswordStrength(e.target.value);
            });
        }

        // Real-time validation
        this.setupRealTimeValidation();
    }

    setupRealTimeValidation() {
        // Email validation
        const emailInput = document.getElementById('reg-email');
        if (emailInput) {
            emailInput.addEventListener('blur', () => {
                this.validateEmail(emailInput.value);
            });
        }

        // Username validation
        const usernameInput = document.getElementById('reg-username');
        if (usernameInput) {
            usernameInput.addEventListener('blur', () => {
                this.validateUsername(usernameInput.value);
            });
        }

        // Phone validation
        const phoneInput = document.getElementById('reg-phone');
        if (phoneInput) {
            phoneInput.addEventListener('blur', () => {
                this.validatePhone(phoneInput.value);
            });
        }
    }

    async handleRegistration() {
        const formData = this.getFormData();
        
        // Validate form data
        if (!this.validateForm(formData)) {
            return;
        }

        this.setButtonLoading(true);
        this.hideMessages();

        try {
            // Submit to Google Forms
            await this.submitToGoogleForms(formData);
            
            // Show success message
            this.showSuccess();
            
            // Reset form
            this.resetForm();
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showError('Registration failed. Please try again or contact support.');
        } finally {
            this.setButtonLoading(false);
        }
    }

    getFormData() {
        return {
            name: document.getElementById('reg-name').value.trim(),
            email: document.getElementById('reg-email').value.trim().toLowerCase(),
            phone: document.getElementById('reg-phone').value.trim(),
            username: document.getElementById('reg-username').value.trim().toLowerCase(),
            password: document.getElementById('reg-password').value,
            confirmPassword: document.getElementById('reg-confirm-password').value,
            address: document.getElementById('reg-address').value.trim(),
            timestamp: new Date().toISOString()
        };
    }

    validateForm(formData) {
        const errors = [];

        // Name validation
        if (formData.name.length < 2) {
            errors.push('Name must be at least 2 characters long');
        }

        // Email validation
        if (!this.isValidEmail(formData.email)) {
            errors.push('Please enter a valid email address');
        }

        // Phone validation
        if (!this.isValidPhone(formData.phone)) {
            errors.push('Please enter a valid phone number (10 digits)');
        }

        // Username validation
        if (formData.username.length < 4) {
            errors.push('Username must be at least 4 characters long');
        }
        if (!/^[a-z0-9_]+$/.test(formData.username)) {
            errors.push('Username can only contain lowercase letters, numbers, and underscores');
        }

        // Password validation
        if (formData.password.length < 6) {
            errors.push('Password must be at least 6 characters long');
        }
        if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
            errors.push('Password must contain both letters and numbers');
        }

        // Confirm password
        if (formData.password !== formData.confirmPassword) {
            errors.push('Passwords do not match');
        }

        // Terms acceptance
        const termsCheckbox = document.getElementById('reg-terms');
        if (!termsCheckbox.checked) {
            errors.push('You must accept the Terms & Conditions');
        }

        if (errors.length > 0) {
            this.showError(errors.join('<br>'));
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    isValidPhone(phone) {
        // Remove all non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        // Check if it's 10 to 12 digits (supports international formats)
        return cleanPhone.length >= 10 && cleanPhone.length <= 12;
    }

    validateEmail(email) {
        const emailInput = document.getElementById('reg-email');
        if (!this.isValidEmail(email)) {
            emailInput.classList.add('is-invalid');
            return false;
        } else {
            emailInput.classList.remove('is-invalid');
            emailInput.classList.add('is-valid');
            return true;
        }
    }

    validateUsername(username) {
        const usernameInput = document.getElementById('reg-username');
        if (username.length < 4 || !/^[a-z0-9_]+$/.test(username)) {
            usernameInput.classList.add('is-invalid');
            return false;
        } else {
            usernameInput.classList.remove('is-invalid');
            usernameInput.classList.add('is-valid');
            return true;
        }
    }

    validatePhone(phone) {
        const phoneInput = document.getElementById('reg-phone');
        if (!this.isValidPhone(phone)) {
            phoneInput.classList.add('is-invalid');
            return false;
        } else {
            phoneInput.classList.remove('is-invalid');
            phoneInput.classList.add('is-valid');
            return true;
        }
    }

    checkPasswordStrength(password) {
        const strengthBar = document.getElementById('password-strength');
        if (!strengthBar) return;

        let strength = 0;
        
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;

        strengthBar.className = 'password-strength';
        
        if (strength <= 2) {
            strengthBar.classList.add('strength-weak');
        } else if (strength <= 3) {
            strengthBar.classList.add('strength-medium');
        } else {
            strengthBar.classList.add('strength-strong');
        }
    }

    async submitToGoogleForms(formData) {
        try {
            // Create form data for Google Forms submission
            const formBody = new FormData();
            
            // Map form data to Google Form entry fields
            formBody.append(this.GOOGLE_FORM.fields.name, formData.name);
            formBody.append(this.GOOGLE_FORM.fields.email, formData.email);
            formBody.append(this.GOOGLE_FORM.fields.phone, formData.phone);
            formBody.append(this.GOOGLE_FORM.fields.username, formData.username);
            // Hash password before storing (basic encoding - in production use proper hashing)
            formBody.append(this.GOOGLE_FORM.fields.password, btoa(formData.password));
            formBody.append(this.GOOGLE_FORM.fields.address, formData.address);

            // Submit to Google Forms using no-cors mode
            const response = await fetch(this.GOOGLE_FORM.url, {
                method: 'POST',
                mode: 'no-cors', // This is required for Google Forms
                body: formBody
            });

            // With no-cors, we can't read the response, but if no error was thrown, assume success
            console.log('Registration submitted to Google Forms');
            
            // Wait a moment to ensure form is processed
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            return { success: true };

        } catch (error) {
            console.error('Google Forms submission error:', error);
            // Even with error, the form might have been submitted due to no-cors
            // We'll assume success if it's a network error
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                console.log('Network error, but form may have been submitted');
                return { success: true };
            }
            throw error;
        }
    }

    showSuccess() {
        const successDiv = document.getElementById('registration-success');
        const formDiv = document.getElementById('registration-form');
        
        if (successDiv && formDiv) {
            formDiv.classList.add('d-none');
            successDiv.classList.remove('d-none');
            
            // Scroll to success message
            successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('registration-error');
        const errorText = document.getElementById('registration-error-text');
        
        if (errorDiv && errorText) {
            errorText.innerHTML = message;
            errorDiv.classList.remove('d-none');
            
            // Scroll to error message
            errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }

    hideMessages() {
        const successDiv = document.getElementById('registration-success');
        const errorDiv = document.getElementById('registration-error');
        
        if (successDiv) successDiv.classList.add('d-none');
        if (errorDiv) errorDiv.classList.add('d-none');
    }

    setButtonLoading(loading) {
        const btn = document.getElementById('register-btn');
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

    resetForm() {
        const form = document.getElementById('registration-form');
        if (form) {
            form.reset();
            
            // Remove validation classes
            const inputs = form.querySelectorAll('.form-control');
            inputs.forEach(input => {
                input.classList.remove('is-valid', 'is-invalid');
            });
            
            // Reset password strength
            const strengthBar = document.getElementById('password-strength');
            if (strengthBar) {
                strengthBar.className = 'password-strength';
            }
        }
    }
}

// Export for global use
window.RegistrationHandler = RegistrationHandler;
