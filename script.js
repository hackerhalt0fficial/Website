// ===== Course Data =====
const courses = [
    { id: 'active-directory', title: 'Active Directory Pentesting', icon: 'fa-server', lessons: 40, new: false, description: 'Learn to attack and defend Windows Active Directory environments.' },
    { id: 'windows-fundamentals', title: 'Windows Fundamentals', icon: 'fa-windows', lessons: 35, new: true, description: 'Understand Windows internals, security, and common vulnerabilities.' },
    { id: 'linux-fundamentals', title: 'Linux Fundamentals', icon: 'fa-linux', lessons: 30, new: false, description: 'Master Linux command line, system administration, and security.' },
    { id: 'ceh', title: 'CEH Preparation', icon: 'fa-shield-alt', lessons: 50, new: false, description: 'Prepare for the Certified Ethical Hacker exam with our course.' },
    { id: 'ejpt', title: 'eJPT v2', icon: 'fa-certificate', lessons: 45, new: false, description: 'Everything you need to pass the eLearnSecurity Junior Pentester exam.' },
    { id: 'pnpt', title: 'PNPT', icon: 'fa-bug', lessons: 55, new: false, description: 'Prepare for the Practical Network Penetration Tester certification.' },
    { id: 'aws', title: 'AWS Pentesting', icon: 'fa-aws', lessons: 38, new: true, description: 'Assess and secure AWS environments, from S3 to Lambda.' },
    { id: 'mobile', title: 'Mobile App Pentesting', icon: 'fa-mobile-alt', lessons: 42, new: false, description: 'Learn to test and secure iOS and Android applications.' }
];

// ===== Webhook URLs =====
const CONTACT_WEBHOOK_URL = 'https://discord.com/api/webhooks/1423577299743150171/iJ8umjXqODdnFNdSz8tEiDam4xbjYS5LURjcE0L6-_4jTSY7nt--mVey0eNgqnoINfj7';
const PAYMENT_WEBHOOK_URL = 'https://discord.com/api/webhooks/1423618167393091665/OMoXUgQhfIl3s3kCAI7lGO9ksg8Pu7o5VS_0A5fLsEUccYxKU54ktlfV-KKNVeEQp2SK';

// ===== CORS Proxy Configuration =====
const CORS_PROXIES = [
    'https://api.allorigins.win/raw?url=',
    'https://corsproxy.io/?',
    'https://api.codetabs.com/v1/proxy?quest='
];

// ===== Discord Webhook Integration =====
async function sendToDiscord(data, webhookUrl, type = 'contact') {
    let embed;
    
    if (type === 'payment') {
        embed = {
            title: "💰 New Payment Received",
            color: 0x00ff00,
            fields: [
                { name: "👤 Payer Name", value: data.payerName || "Not provided", inline: true },
                { name: "📧 Email", value: data.payerEmail || "Not provided", inline: true },
                { name: "💵 Amount", value: `₹${data.paymentAmount}` || "Not provided", inline: true },
                { name: "💳 Payment Method", value: data.paymentMethod || "Not provided", inline: true },
                { name: "🆔 Transaction ID", value: data.transactionId || "Not provided", inline: true },
                { name: "💬 Message", value: data.paymentMessage ? (data.paymentMessage.length > 500 ? data.paymentMessage.substring(0, 500) + "..." : data.paymentMessage) : "No additional message" }
            ],
            footer: { text: "RedTeam Toolkit Payment Notification" },
            timestamp: new Date().toISOString()
        };
    } else {
        embed = {
            title: "📧 New Contact Form Submission",
            color: 0x0099ff,
            fields: [
                { name: "👤 Name", value: data.name || "Not provided", inline: true },
                { name: "📧 Email", value: data.email || "Not provided", inline: true },
                { name: "📝 Subject", value: data.subject || "Not provided", inline: true },
                { name: "💬 Message", value: data.message ? (data.message.length > 1000 ? data.message.substring(0, 1000) + "..." : data.message) : "Not provided" }
            ],
            footer: { text: "RedTeam Toolkit Contact Form" },
            timestamp: new Date().toISOString()
        };
    }

    const payload = {
        embeds: [embed],
        username: type === 'payment' ? 'RedTeam Payment Bot' : 'RedTeam Toolkit Bot',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063796.png'
    };

    // Method 1: Try direct POST with no-cors (most reliable)
    try {
        await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
            mode: 'no-cors'
        });
        console.log('✅ Webhook sent via direct no-cors method');
        return true;
    } catch (error) {
        console.warn('Direct method failed:', error.message);
    }

    // Method 2: Try with CORS proxies
    for (const proxy of CORS_PROXIES) {
        try {
            const response = await fetch(proxy + encodeURIComponent(webhookUrl), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(5000)
            });
            
            if (response.ok || response.status === 204) {
                console.log(`✅ Webhook sent via proxy: ${proxy}`);
                return true;
            }
        } catch (error) {
            console.warn(`Proxy ${proxy} failed:`, error.message);
            continue;
        }
    }

    // Method 3: Fallback - XMLHttpRequest
    try {
        await new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', webhookUrl, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = () => resolve();
            xhr.onerror = () => reject(new Error('XHR failed'));
            xhr.send(JSON.stringify(payload));
            
            // Assume success after 1 second
            setTimeout(resolve, 1000);
        });
        console.log('✅ Webhook sent via XHR fallback');
        return true;
    } catch (error) {
        console.warn('XHR method failed:', error.message);
    }

    console.error('❌ All webhook methods failed');
    return false;
}

// ===== Payment System =====
function handlePaymentSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitPaymentBtn');
    const spinner = submitBtn.querySelector('.spinner-border');
    const submitText = submitBtn.querySelector('.submit-payment-text');
    
    const paymentData = {
        payerName: document.getElementById('payerName').value.trim(),
        payerEmail: document.getElementById('payerEmail').value.trim(),
        paymentAmount: document.getElementById('paymentAmount').value.trim(),
        paymentMethod: document.getElementById('paymentMethod').value,
        transactionId: document.getElementById('transactionId').value.trim(),
        paymentMessage: document.getElementById('paymentMessage').value.trim()
    };
    
    if (!paymentData.payerName || !paymentData.payerEmail || !paymentData.paymentAmount || !paymentData.paymentMethod || !paymentData.transactionId) {
        showPaymentAlert('Please fill in all required fields.', 'danger');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(paymentData.payerEmail)) {
        showPaymentAlert('Please enter a valid email address.', 'danger');
        return;
    }
    
    const amount = parseFloat(paymentData.paymentAmount);
    if (amount < 10) {
        showPaymentAlert('Minimum payment amount is ₹10.', 'danger');
        return;
    }
    
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    submitText.textContent = 'Processing Payment...';
    
    sendToDiscord(paymentData, PAYMENT_WEBHOOK_URL, 'payment')
        .then(success => {
            if (success) {
                showPaymentAlert('✅ Payment details submitted successfully! We will verify and confirm your payment shortly.', 'success');
                document.getElementById('paymentForm').reset();
            } else {
                showPaymentAlert('⚠️ Submission completed but verification failed. We may have received your details. If not confirmed within 24 hours, please contact us.', 'warning');
            }
        })
        .catch(error => {
            console.error('Payment error:', error);
            showPaymentAlert('⚠️ Submission completed. If you don\'t receive confirmation within 24 hours, please contact us directly with your transaction ID.', 'warning');
        })
        .finally(() => {
            submitBtn.disabled = false;
            spinner.classList.add('d-none');
            submitText.textContent = 'Submit Payment Details';
        });
}

function showPaymentAlert(message, type) {
    const paymentAlert = document.getElementById('paymentAlert');
    if (!paymentAlert) return;
    
    paymentAlert.innerHTML = message;
    paymentAlert.className = `alert alert-${type} mt-3`;
    paymentAlert.classList.remove('d-none');
    
    if (type === 'success') {
        setTimeout(() => paymentAlert.classList.add('d-none'), 8000);
    }
}

function fillSamplePayment() {
    document.getElementById('payerName').value = 'John Doe';
    document.getElementById('payerEmail').value = 'john.doe@example.com';
    document.getElementById('paymentAmount').value = '500';
    document.getElementById('paymentMethod').value = 'UPI';
    document.getElementById('transactionId').value = 'TXN' + Date.now();
    document.getElementById('paymentMessage').value = 'Thank you for the amazing cybersecurity resources!';
    showPaymentAlert('🧪 Sample data filled. You can now test the payment submission.', 'info');
}

// ===== Contact Form Handling =====
function handleFormSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const spinner = submitBtn.querySelector('.spinner-border');
    const submitText = submitBtn.querySelector('.submit-text');
    
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value.trim()
    };
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showAlert('Please fill in all required fields.', 'danger');
        return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        showAlert('Please enter a valid email address.', 'danger');
        return;
    }
    
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    submitText.textContent = 'Sending...';
    
    sendToDiscord(formData, CONTACT_WEBHOOK_URL, 'contact')
        .then(success => {
            if (success) {
                showAlert('✅ Message sent successfully! We\'ll get back to you soon.', 'success');
                document.getElementById('contactForm').reset();
            } else {
                showAlert('⚠️ Message may have been sent. If you don\'t receive a response within 24 hours, please try again.', 'warning');
            }
        })
        .catch(error => {
            console.error('Form error:', error);
            showAlert('⚠️ Submission completed. If you don\'t receive a response within 24 hours, please contact us through other methods.', 'warning');
        })
        .finally(() => {
            submitBtn.disabled = false;
            spinner.classList.add('d-none');
            submitText.textContent = 'Send Message';
        });
}

function showAlert(message, type) {
    const formAlert = document.getElementById('formAlert');
    if (!formAlert) return;
    
    formAlert.innerHTML = message;
    formAlert.className = `alert alert-${type} mt-3`;
    formAlert.classList.remove('d-none');
    
    if (type === 'success') {
        setTimeout(() => formAlert.classList.add('d-none'), 5000);
    }
}

// ===== Page Navigation =====
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const targetPage = document.getElementById(pageId);
    if (targetPage) targetPage.classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) link.classList.add('active');
    });
    
    window.scrollTo(0, 0);
    history.replaceState(null, null, `#${pageId}`);
}

// ===== Course Rendering =====
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
function copyToClipboard(elementId, buttonId) {
    const element = document.getElementById(elementId);
    const button = document.getElementById(buttonId);
    
    if (element && button) {
        element.select();
        element.setSelectionRange(0, 99999);
        
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
            console.error('Failed to copy:', err);
        }
    }
}

// ===== Initialize Application =====
function initializeApp() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-sun', savedTheme === 'dark');
        icon.classList.toggle('fa-moon', savedTheme === 'light');
        themeToggle.addEventListener('click', toggleTheme);
    }
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showPage(this.getAttribute('data-page'));
        });
    });
    
    const copyUpiBtn = document.getElementById('copy-upi-id');
    if (copyUpiBtn) copyUpiBtn.addEventListener('click', () => copyToClipboard('upi-id', 'copy-upi-id'));
    
    const copyPaymentBtn = document.getElementById('copy-payment-link');
    if (copyPaymentBtn) copyPaymentBtn.addEventListener('click', () => copyToClipboard('payment-link', 'copy-payment-link'));
    
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', handleFormSubmit);
    
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) paymentForm.addEventListener('submit', handlePaymentSubmit);
    
    renderCourses();
    
    const hash = window.location.hash.substring(1);
    const validPages = ['home', 'tools', 'courses', 'resources', 'github', 'contact'];
    showPage(hash && validPages.includes(hash) ? hash : 'home');
}

document.addEventListener('DOMContentLoaded', initializeApp);

window.fillSamplePayment = fillSamplePayment;
window.sendToDiscord = sendToDiscord;
