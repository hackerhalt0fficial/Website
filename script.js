// ===== Course Data =====
const courses = [
    { 
        id: 'active-directory', 
        title: 'Active Directory Pentesting', 
        icon: 'fa-server', 
        lessons: 40, 
        new: false, 
        description: 'Learn to attack and defend Windows Active Directory environments.' 
    },
    { 
        id: 'windows-fundamentals', 
        title: 'Windows Fundamentals', 
        icon: 'fa-windows', 
        lessons: 35, 
        new: true, 
        description: 'Understand Windows internals, security, and common vulnerabilities.' 
    },
    { 
        id: 'linux-fundamentals', 
        title: 'Linux Fundamentals', 
        icon: 'fa-linux', 
        lessons: 30, 
        new: false, 
        description: 'Master Linux command line, system administration, and security.' 
    },
    { 
        id: 'ceh', 
        title: 'CEH Preparation', 
        icon: 'fa-shield-alt', 
        lessons: 50, 
        new: false, 
        description: 'Prepare for the Certified Ethical Hacker exam with our course.' 
    },
    { 
        id: 'ejpt', 
        title: 'eJPT v2', 
        icon: 'fa-certificate', 
        lessons: 45, 
        new: false, 
        description: 'Everything you need to pass the eLearnSecurity Junior Pentester exam.' 
    },
    { 
        id: 'pnpt', 
        title: 'PNPT', 
        icon: 'fa-bug', 
        lessons: 55, 
        new: false, 
        description: 'Prepare for the Practical Network Penetration Tester certification.' 
    },
    { 
        id: 'aws', 
        title: 'AWS Pentesting', 
        icon: 'fa-aws', 
        lessons: 38, 
        new: true, 
        description: 'Assess and secure AWS environments, from S3 to Lambda.' 
    },
    { 
        id: 'mobile', 
        title: 'Mobile App Pentesting', 
        icon: 'fa-mobile-alt', 
        lessons: 42, 
        new: false, 
        description: 'Learn to test and secure iOS and Android applications.' 
    }
];

// ===== Webhook URLs =====
const CONTACT_WEBHOOK_URL = 'https://discord.com/api/webhooks/1423577299743150171/iJ8umjXqODdnFNdSz8tEiDam4xbjYS5LURjcE0L6-_4jTSY7nt--mVey0eNgqnoINfj7';
const PAYMENT_WEBHOOK_URL = 'https://discord.com/api/webhooks/1423618167393091665/OMoXUgQhfIl3s3kCAI7lGO9ksg8Pu7o5VS_0A5fLsEUccYxKU54ktlfV-KKNVeEQp2SK';

// ===== Discord Webhook Integration =====
/**
 * Send data to Discord webhook
 * @param {Object} data - Data to send
 * @param {string} webhookUrl - Webhook URL
 * @param {string} type - Type of notification (contact/payment)
 * @returns {Promise<boolean>} - Success status
 */
async function sendToDiscord(data, webhookUrl, type = 'contact') {
    let embed;
    
    if (type === 'payment') {
        embed = {
            title: "💰 New Payment Received",
            color: 0x00ff00,
            fields: [
                {
                    name: "👤 Payer Name",
                    value: data.payerName || "Not provided",
                    inline: true
                },
                {
                    name: "📧 Email",
                    value: data.payerEmail || "Not provided",
                    inline: true
                },
                {
                    name: "💵 Amount",
                    value: `₹${data.paymentAmount}` || "Not provided",
                    inline: true
                },
                {
                    name: "💳 Payment Method",
                    value: data.paymentMethod || "Not provided",
                    inline: true
                },
                {
                    name: "🆔 Transaction ID",
                    value: data.transactionId || "Not provided",
                    inline: true
                },
                {
                    name: "💬 Message",
                    value: data.paymentMessage ? 
                        (data.paymentMessage.length > 500 ? 
                            data.paymentMessage.substring(0, 500) + "..." : 
                            data.paymentMessage) : 
                        "No additional message"
                }
            ],
            footer: {
                text: "RedTeam Toolkit Payment Notification"
            },
            timestamp: new Date().toISOString()
        };
    } else {
        embed = {
            title: "📧 New Contact Form Submission",
            color: 0x0099ff,
            fields: [
                {
                    name: "👤 Name",
                    value: data.name || "Not provided",
                    inline: true
                },
                {
                    name: "📧 Email",
                    value: data.email || "Not provided",
                    inline: true
                },
                {
                    name: "📝 Subject",
                    value: data.subject || "Not provided",
                    inline: true
                },
                {
                    name: "💬 Message",
                    value: data.message ? 
                        (data.message.length > 1000 ? 
                            data.message.substring(0, 1000) + "..." : 
                            data.message) : 
                        "Not provided"
                }
            ],
            footer: {
                text: "RedTeam Toolkit Contact Form"
            },
            timestamp: new Date().toISOString()
        };
    }

    try {
        // Using CORS proxy to bypass GitHub Pages restrictions
        const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
        const response = await fetch(proxyUrl + webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ 
                embeds: [embed],
                username: type === 'payment' ? 'RedTeam Payment Bot' : 'RedTeam Toolkit Bot',
                avatar_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063796.png'
            })
        });

        if (!response.ok) {
            throw new Error(`Discord webhook failed: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error sending to Discord:', error);
        
        // Fallback: Try direct connection with no-cors
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'no-cors',
                body: JSON.stringify({
                    embeds: [embed],
                    username: type === 'payment' ? 'RedTeam Payment Bot' : 'RedTeam Toolkit Bot'
                })
            });
            return true; // With no-cors, we can't read response but request might still work
        } catch (fallbackError) {
            console.error('Fallback also failed:', fallbackError);
            return false;
        }
    }
}

// ===== Payment System =====
/**
 * Handle payment form submission
 * @param {Event} event - Form submit event
 */
function handlePaymentSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitPaymentBtn');
    const spinner = submitBtn.querySelector('.spinner-border');
    const submitText = submitBtn.querySelector('.submit-payment-text');
    const paymentAlert = document.getElementById('paymentAlert');
    
    // Get payment data
    const paymentData = {
        payerName: document.getElementById('payerName').value.trim(),
        payerEmail: document.getElementById('payerEmail').value.trim(),
        paymentAmount: document.getElementById('paymentAmount').value.trim(),
        paymentMethod: document.getElementById('paymentMethod').value,
        transactionId: document.getElementById('transactionId').value.trim(),
        paymentMessage: document.getElementById('paymentMessage').value.trim()
    };
    
    // Validate payment form
    if (!paymentData.payerName || !paymentData.payerEmail || !paymentData.paymentAmount || 
        !paymentData.paymentMethod || !paymentData.transactionId) {
        showPaymentAlert('Please fill in all required fields.', 'danger');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paymentData.payerEmail)) {
        showPaymentAlert('Please enter a valid email address.', 'danger');
        return;
    }
    
    // Amount validation
    const amount = parseFloat(paymentData.paymentAmount);
    if (amount < 10) {
        showPaymentAlert('Minimum payment amount is ₹10.', 'danger');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    submitText.textContent = 'Processing Payment...';
    paymentAlert.classList.add('d-none');
    
    // Send payment notification to Discord
    sendToDiscord(paymentData, PAYMENT_WEBHOOK_URL, 'payment')
        .then(success => {
            if (success) {
                showPaymentAlert('Payment details submitted successfully! We will verify and confirm your payment shortly.', 'success');
                document.getElementById('paymentForm').reset();
                
                // Also send email confirmation (simulated)
                simulateEmailConfirmation(paymentData);
            } else {
                showPaymentAlert('Failed to submit payment details. Please try again or contact us directly.', 'danger');
            }
        })
        .catch(error => {
            console.error('Payment submission error:', error);
            showPaymentAlert('An error occurred. Please try again later.', 'danger');
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            spinner.classList.add('d-none');
            submitText.textContent = 'Submit Payment Details';
        });
}

/**
 * Show payment alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, danger, warning)
 */
function showPaymentAlert(message, type) {
    const paymentAlert = document.getElementById('paymentAlert');
    if (!paymentAlert) return;
    
    paymentAlert.textContent = message;
    paymentAlert.className = `alert alert-${type} mt-3`;
    paymentAlert.classList.remove('d-none');
    
    // Auto-hide success messages after 8 seconds
    if (type === 'success') {
        setTimeout(() => {
            paymentAlert.classList.add('d-none');
        }, 8000);
    }
}

/**
 * Simulate email confirmation (for demo purposes)
 * @param {Object} paymentData - Payment data
 */
function simulateEmailConfirmation(paymentData) {
    console.log('Sending email confirmation to:', paymentData.payerEmail);
    console.log('Payment Details:', {
        amount: `₹${paymentData.paymentAmount}`,
        method: paymentData.paymentMethod,
        transactionId: paymentData.transactionId
    });
    
    // In a real implementation, you would send an actual email here
    // This is just for demonstration
}

/**
 * Fill sample payment data for testing
 */
function fillSamplePayment() {
    document.getElementById('payerName').value = 'John Doe';
    document.getElementById('payerEmail').value = 'john.doe@example.com';
    document.getElementById('paymentAmount').value = '500';
    document.getElementById('paymentMethod').value = 'UPI';
    document.getElementById('transactionId').value = 'TXN' + Date.now();
    document.getElementById('paymentMessage').value = 'Thank you for the amazing cybersecurity resources!';
    
    showPaymentAlert('Sample data filled. You can now test the payment submission.', 'info');
}

// ===== Contact Form Handling =====
/**
 * Handle contact form submission
 * @param {Event} event - Form submit event
 */
function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const spinner = submitBtn.querySelector('.spinner-border');
    const submitText = submitBtn.querySelector('.submit-text');
    const formAlert = document.getElementById('formAlert');
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value.trim()
    };
    
    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showAlert('Please fill in all required fields.', 'danger');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showAlert('Please enter a valid email address.', 'danger');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    submitText.textContent = 'Sending...';
    formAlert.classList.add('d-none');
    
    // Send to Discord
    sendToDiscord(formData, CONTACT_WEBHOOK_URL, 'contact')
        .then(success => {
            if (success) {
                showAlert('Message sent successfully! We\'ll get back to you soon.', 'success');
                document.getElementById('contactForm').reset();
            } else {
                showAlert('Failed to send message. Please try again or contact us through other methods.', 'danger');
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            showAlert('An error occurred. Please try again later.', 'danger');
        })
        .finally(() => {
            // Reset button state
            submitBtn.disabled = false;
            spinner.classList.add('d-none');
            submitText.textContent = 'Send Message';
        });
}

// ===== Alert System =====
/**
 * Show alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, danger, warning)
 */
function showAlert(message, type) {
    const formAlert = document.getElementById('formAlert');
    if (!formAlert) return;
    
    formAlert.textContent = message;
    formAlert.className = `alert alert-${type} mt-3`;
    formAlert.classList.remove('d-none');
    
    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            formAlert.classList.add('d-none');
        }, 5000);
    }
}

// ===== Page Navigation =====
/**
 * Show specific page and hide others
 * @param {string} pageId - ID of the page to show
 */
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show target page
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
    }
    
    // Update navigation links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
    
    // Scroll to top
    window.scrollTo(0, 0);
    
    // Update browser history
    history.replaceState(null, null, `#${pageId}`);
}

// ===== Course Rendering =====
/**
 * Render courses on the courses page
 */
function renderCourses() {
    const container = document.getElementById('courses-container');
    if (!container) return;
    
    container.innerHTML = courses.map(course => `
        <div class="col-md-6 mb-4">
            <div class="card course-card p-3 h-100">
                <i class="fas ${course.icon} course-icon"></i>
                <h4>${course.title}${course.new ? ' <span class="badge-new">New</span>' : ''}</h4>
                <p>${course.description}</p>
                <div class="mt-auto">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-muted"><i class="fas fa-book me-1"></i>${course.lessons} lessons</span>
                        <a href="course.html?id=${course.id}" class="btn btn-outline-accent">Explore Course</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// ===== Theme Management =====
/**
 * Toggle between dark and light themes
 */
function toggleTheme() {
    const body = document.body;
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');
    
    if (body.getAttribute('data-theme') === 'dark') {
        body.setAttribute('data-theme', 'light');
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
        localStorage.setItem('theme', 'light');
    } else {
        body.setAttribute('data-theme', 'dark');
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
        localStorage.setItem('theme', 'dark');
    }
}

// ===== Clipboard Functions =====
/**
 * Copy text to clipboard
 * @param {string} elementId - ID of input element to copy from
 * @param {string} buttonId - ID of button to update text
 */
function copyToClipboard(elementId, buttonId) {
    const element = document.getElementById(elementId);
    const button = document.getElementById(buttonId);
    
    if (element && button) {
        element.select();
        element.setSelectionRange(0, 99999); // For mobile devices
        
        try {
            document.execCommand('copy');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            button.classList.add('btn-success');
            
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.remove('btn-success');
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            showAlert('Failed to copy to clipboard', 'danger');
        }
    }
}

// ===== Utility Functions =====
/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Check if element is in viewport
 * @param {Element} el - Element to check
 * @returns {boolean} - Whether element is in viewport
 */
function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// ===== Initialize Application =====
/**
 * Initialize the application when DOM is loaded
 */
function initializeApp() {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-sun', savedTheme === 'dark');
        icon.classList.toggle('fa-moon', savedTheme === 'light');
    }
    
    // Set up event listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });
    
    // Theme toggle
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    // Copy button event listeners
    const copyUpiBtn = document.getElementById('copy-upi-id');
    if (copyUpiBtn) {
        copyUpiBtn.addEventListener('click', function() {
            copyToClipboard('upi-id', 'copy-upi-id');
        });
    }
    
    const copyPaymentBtn = document.getElementById('copy-payment-link');
    if (copyPaymentBtn) {
        copyPaymentBtn.addEventListener('click', function() {
            copyToClipboard('payment-link', 'copy-payment-link');
        });
    }
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Payment form
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', handlePaymentSubmit);
    }
    
    // Render courses
    renderCourses();
    
    // Handle initial page load from URL hash
    const hash = window.location.hash.substring(1);
    const validPages = ['home', 'tools', 'courses', 'resources', 'github', 'contact'];
    if (hash && validPages.includes(hash)) {
        showPage(hash);
    } else {
        showPage('home');
    }
    
    // Add scroll effects
    const debouncedScroll = debounce(() => {
        const cards = document.querySelectorAll('.card');
        cards.forEach(card => {
            if (isInViewport(card)) {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }
        });
    }, 100);
    
    window.addEventListener('scroll', debouncedScroll);
    
    // Initialize card animations
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    // Trigger initial scroll check
    debouncedScroll();
}

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', initializeApp);

// Make fillSamplePayment function globally available
window.fillSamplePayment = fillSamplePayment;

// Export functions for testing (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        sendToDiscord,
        handlePaymentSubmit,
        handleFormSubmit,
        showPage,
        renderCourses,
        toggleTheme
    };
}
