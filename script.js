/* ==========================================================
   RedTeam Toolkit - Main JavaScript (Final Version)
   Author: Abhishek Aswal (HackerHalt)
   Version: 3.0
   Features:
   ✅ Page Navigation
   ✅ Theme Toggle
   ✅ Copy to Clipboard
   ✅ Contact Form Discord Webhook
   ✅ Payment QR Webhook Integration
   ========================================================== */

// ============================================
// COURSE DATA
// ============================================
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

// ============================================
// PAGE NAVIGATION
// ============================================
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const activePage = document.getElementById(pageId);
    if (activePage) activePage.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) link.classList.add('active');
    });

    window.scrollTo(0, 0);
}

// ============================================
// RENDER COURSES
// ============================================
function renderCourses() {
    const container = document.getElementById('courses-container');
    if (!container) return;

    container.innerHTML = courses.map(c => `
        <div class="col-md-6 mb-4">
            <div class="card course-card p-3 h-100">
                <i class="fas ${c.icon} course-icon"></i>
                <h4>${c.title}${c.new ? ' <span class="badge-new">New</span>' : ''}</h4>
                <p>${c.description}</p>
                <div class="mt-auto d-flex justify-content-between align-items-center">
                    <span class="text-muted"><i class="fas fa-book me-1"></i>${c.lessons} lessons</span>
                    <a href="course.html?id=${c.id}" class="btn btn-outline-accent">Explore Course</a>
                </div>
            </div>
        </div>
    `).join('');
}

// ============================================
// THEME TOGGLE
// ============================================
function toggleTheme() {
    const body = document.body;
    const icon = document.querySelector('#theme-toggle i');
    const darkMode = body.getAttribute('data-theme') === 'dark';

    body.setAttribute('data-theme', darkMode ? 'light' : 'dark');
    icon.classList.toggle('fa-sun', !darkMode);
    icon.classList.toggle('fa-moon', darkMode);
    localStorage.setItem('theme', darkMode ? 'light' : 'dark');
}

// ============================================
// COPY TO CLIPBOARD
// ============================================
function copyToClipboard(id, btnId) {
    const element = document.getElementById(id);
    const button = document.getElementById(btnId);
    if (!element || !button) return;

    navigator.clipboard.writeText(element.value)
        .then(() => {
            const oldText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => button.textContent = oldText, 1500);
        })
        .catch(err => console.error('Clipboard error:', err));
}

// ============================================
// DISCORD WEBHOOKS
// ============================================
const DISCORD_WEBHOOK_CONTACT =
    'https://discord.com/api/webhooks/1423577299743150171/iJ8umjXqODdnFNdSz8tEiDam4xbjYS5LURjcE0L6-_4jTSY7nt--mVey0eNgqnoINfj7';

const DISCORD_WEBHOOK_PAYMENT =
    'https://discord.com/api/webhooks/1423618167393091665/OMoXUgQhfIl3s3kCAI7lGO9ksg8Pu7o5VS_0A5fLsEUccYxKU54ktlfV-KKNVeEQp2SK';

// ============================================
// SEND DATA TO DISCORD (Reusable Function)
// ============================================
async function sendToDiscord(webhookURL, title, data) {
    const embed = {
        title: title,
        color: 0x2f81f7,
        fields: Object.keys(data).map(key => ({
            name: key,
            value: data[key] || 'Not provided',
            inline: true
        })),
        footer: { text: 'HackerHalt | RedTeam Toolkit' },
        timestamp: new Date().toISOString()
    };

    const payload = {
        username: 'RedTeam Toolkit Bot',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063796.png',
        embeds: [embed]
    };

    try {
        const res = await fetch(webhookURL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        return res.ok;
    } catch (err) {
        console.error('Webhook Error:', err);
        return false;
    }
}

// ============================================
// CONTACT FORM HANDLER
// ============================================
async function handleContactSubmit(e) {
    e.preventDefault();

    const btn = document.getElementById('submitBtn');
    const spinner = btn.querySelector('.spinner-border');
    const text = btn.querySelector('.submit-text');
    const alertBox = document.getElementById('formAlert');

    const formData = {
        '👤 Name': document.getElementById('name').value.trim(),
        '📧 Email': document.getElementById('email').value.trim(),
        '📝 Subject': document.getElementById('subject').value,
        '💬 Message': document.getElementById('message').value.trim()
    };

    if (!formData['👤 Name'] || !formData['📧 Email'] || !formData['📝 Subject'] || !formData['💬 Message']) {
        showAlert('⚠️ Please fill in all fields.', 'danger');
        return;
    }

    btn.disabled = true;
    spinner.classList.remove('d-none');
    text.textContent = 'Sending...';
    alertBox.classList.add('d-none');

    const ok = await sendToDiscord(DISCORD_WEBHOOK_CONTACT, '📩 New Contact Form Submission', formData);

    if (ok) {
        showAlert('✅ Message sent successfully! Redirecting to our Discord...', 'success');
        document.getElementById('contactForm').reset();
        setTimeout(() => window.open('https://discord.gg/YOUR_INVITE_LINK', '_blank'), 2000);
    } else {
        showAlert('❌ Failed to send. Please try again.', 'danger');
    }

    btn.disabled = false;
    spinner.classList.add('d-none');
    text.textContent = 'Send Message';
}

// ============================================
// PAYMENT QR WEBHOOK HANDLER
// ============================================
async function handlePaymentSubmit(e) {
    e.preventDefault();

    const upiID = document.getElementById('upi-id')?.value || 'Not provided';
    const paymentLink = document.getElementById('payment-link')?.value || 'Not provided';
    const payerName = document.getElementById('payer-name')?.value.trim() || 'Anonymous';
    const amount = document.getElementById('amount')?.value.trim() || 'Not specified';

    const paymentData = {
        '💰 Payment Type': 'Google Pay / QR Code',
        '👤 Payer Name': payerName,
        '💳 UPI ID': upiID,
        '💵 Amount': `${amount} INR`,
        '🔗 Payment Link': paymentLink,
        '📅 Timestamp': new Date().toLocaleString()
    };

    const ok = await sendToDiscord(DISCORD_WEBHOOK_PAYMENT, '💸 New Payment Confirmation', paymentData);

    if (ok) {
        alert('✅ Payment details submitted successfully! Redirecting to our Discord for verification...');
        window.open('https://discord.gg/YOUR_INVITE_LINK', '_blank');
    } else {
        alert('❌ Failed to send payment info. Please try again later.');
    }
}

// ============================================
// ALERT BOX HANDLER
// ============================================
function showAlert(message, type) {
    const box = document.getElementById('formAlert');
    box.textContent = message;
    box.className = `alert alert-${type} mt-3`;
    box.classList.remove('d-none');
    if (type === 'success') setTimeout(() => box.classList.add('d-none'), 6000);
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-sun', savedTheme === 'dark');
        icon.classList.toggle('fa-moon', savedTheme === 'light');
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link =>
        link.addEventListener('click', e => {
            e.preventDefault();
            showPage(link.getAttribute('data-page'));
        })
    );

    // Copy buttons
    const copyBtns = [
        { element: 'upi-id', button: 'copy-upi-id' },
        { element: 'payment-link', button: 'copy-payment-link' }
    ];
    copyBtns.forEach(({ element, button }) => {
        const btn = document.getElementById(button);
        if (btn) btn.addEventListener('click', () => copyToClipboard(element, button));
    });

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', handleContactSubmit);

    // Payment form
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) paymentForm.addEventListener('submit', handlePaymentSubmit);

    // Render courses
    renderCourses();

    // Default to home page
    showPage('home');
});
