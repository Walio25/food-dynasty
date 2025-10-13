(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    // Initiate the wowjs (with safety check)
    if (typeof WOW !== 'undefined') {
        new WOW().init();
    } else {
        console.warn('WOW.js library not loaded');
    }

    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 45) {
            $('.navbar').addClass('sticky-top shadow-sm');
        } else {
            $('.navbar').removeClass('sticky-top shadow-sm');
        }
    });
    
    // Dropdown on mouse hover
    const $dropdown = $(".dropdown");
    const $dropdownToggle = $(".dropdown-toggle");
    const $dropdownMenu = $(".dropdown-menu");
    const showClass = "show";
    
    $(window).on("load resize", function() {
        if (this.matchMedia("(min-width: 992px)").matches) {
            $dropdown.hover(
            function() {
                const $this = $(this);
                $this.addClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "true");
                $this.find($dropdownMenu).addClass(showClass);
            },
            function() {
                const $this = $(this);
                $this.removeClass(showClass);
                $this.find($dropdownToggle).attr("aria-expanded", "false");
                $this.find($dropdownMenu).removeClass(showClass);
            }
            );
        } else {
            $dropdown.off("mouseenter mouseleave");
        }
    });
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });

    // Facts counter (removed - counterup library not needed)

    // Check authentication status on page load
    $(document).ready(function() {
        // Use a small delay to ensure all DOM elements are properly loaded
        setTimeout(function() {
            updateAuthUI();
        }, 200);
    });
    
    // Also call updateAuthUI when the window loads (as backup)
    $(window).on('load', function() {
        setTimeout(updateAuthUI, 300); // Small delay to ensure DOM is ready
    });

    // Update authentication UI
    function updateAuthUI() {
        // Only check authentication if we have the necessary elements
        const loginSection = document.getElementById('login-section');
        const userSection = document.getElementById('user-section');
        
        if (!loginSection || !userSection) {
            return; // Not on a page with auth UI
        }
        
        // This function is no longer needed - header-auth.js handles authentication
    }

    // Make updateAuthUI available globally
    window.updateAuthUI = updateAuthUI;
    
})(jQuery);

// Global logout function
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear all authentication data from localStorage
        localStorage.removeItem('userName');   // Current auth system
        localStorage.removeItem('userEmail');  // Current auth system
        localStorage.removeItem('authToken');  // Current auth system
        localStorage.removeItem('loginTime');  // Current auth system
        
        // Clear any user-specific bookings data
        const allKeys = Object.keys(localStorage);
        allKeys.forEach(key => {
            if (key.startsWith('bookings_')) {
                localStorage.removeItem(key);
            }
        });
        
        // Update UI using header auth logout if available
        if (window.headerAuth && typeof window.headerAuth.logout === 'function') {
            window.headerAuth.logout();
        } else {
            // Fallback: Update UI to show login form
            if (typeof updateAuthUI === 'function') {
                updateAuthUI();
            }
        }
        
        // Redirect to home page
        window.location.href = 'index.html';
    }
}



