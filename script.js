/* ============================================
   RedTeam Toolkit - Main Script (Final Updated)
   Author: Abhishek Aswal (HackerHalt)
   Features:
   - Page Navigation & Theme
   - Copy to Clipboard
   - Contact Form Discord Webhook
   - Payment Webhook Integration (Google Pay QR)
   ============================================ */

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
    const el = document.getElementById(pageId);
    if (el) el.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(l => {
        l.classList.remove('active');
        if (l.getAttribute('data-page') === pageId) l.classList.add('active');
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
    const dark = body.getAttribute('data-theme') === 'dark';

    body.setAttribute('data-theme', dark ? 'light' : 'dark');
    icon.classList.toggle('fa-sun', !dark);
    icon.classList.toggle('fa-moon', dark);
    localStorage.setItem('theme', dark ? 'light' : 'dark');
}

// ============================================
// COPY TO CLIPBOARD
// ============================================
function copyToClipboard(id, btnId) {
    const element = document.getElementById(id);
    const button = document.getElementById(btnId);
    if (!element || !button) return;

    navigator.clipboard.writeText(element.value).then(() => {
        const old = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => (button.textContent = old), 1500);
    });
}

// ============================================
// DISCORD WEBHOOKS
// ============================================
const DISCORD_WEBHOOK_CONTACT =
    'https://discord.com/api/webhooks/1423577299743150171/iJ8umjXqODdnFNdSz8tEiDam4xbjYS5LURjcE0L6-_4jTSY7nt--mVey0eNgqnoINfj7';

const DISCORD_WEBHOOK_PAYMENT =
    'https://discord.com/api/webhooks/1423618167393091665/OMoXUgQhfIl3s3kCAI7lGO9ksg8Pu7o5VS_0A5fLsEUccYxKU54ktlfV-KKNVeEQp2SK';

// ============================================
// SEND TO DISCORD (Reusable Function)
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
        footer: { text: 'RedTeam Toolkit System' },
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
        showAlert('⚠️ Please fill all fields.', 'danger');
        return;
    }

    btn.disabled = true;
    spinner.classList.remove('d-none');
    text.textContent = 'Sending...';
    alertBox.classList.add('d-none');

    const ok = await sendToDiscord(DISCORD_WEBHOOK_CONTACT, '📩 New Contact Form Submission', formData);

    if (ok) {
        showAlert('✅ Message sent successfully! Redirecting to Discord...', 'success');
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
// PAYMENT HANDLER (QR CODE)
–============================================
async function handlePaymentConfirm() {
    const upiID = document.getElementById('upi-id')?.value || 'Not captured';
    const paymentLink = document.getElementById('payment-link')?.value || 'Not captured';

    const paymentData = {
        '💰 Payment Type': 'Google Pay / UPI QR',
        '💳 UPI ID': upiID,
        '🔗 Payment Link': paymentLink,
        '📅 Timestamp': new Date().toLocaleString()
    };

    const ok = await sendToDiscord(DISCORD_WEBHOOK_PAYMENT, '💸 New Payment Attempt', paymentData);

    if (ok) {
        alert('✅ Payment confirmation sent! Redirecting to Discord for verification...');
        window.open('https://discord.gg/YOUR_INVITE_LINK', '_blank');
    } else {
        alert('❌ Failed to send payment info. Please contact support.');
    }
}

// ============================================
// ALERT FUNCTION
// ============================================
function showAlert(msg, type) {
    const box = document.getElementById('formAlert');
    box.textContent = msg;
    box.className = `alert alert-${type} mt-3`;
    box.classList.remove('d-none');

    if (type === 'success') setTimeout(() => box.classList.add('d-none'), 5000);
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Theme setup
    const saved = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', saved);
    const icon = document.querySelector('#theme-toggle i');
    if (icon) {
        icon.classList.toggle('fa-sun', saved === 'dark');
        icon.classList.toggle('fa-moon', saved === 'light');
    }

    // Theme toggle
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    // Navigation links
    document.querySelectorAll('.nav-link').forEach(link =>
        link.addEventListener('click', e => {
            e.preventDefault();
            showPage(link.getAttribute('data-page'));
        })
    );

    // Copy buttons
    const copyButtons = [
        { element: 'upi-id', button: 'copy-upi-id' },
        { element: 'payment-link', button: 'copy-payment-link' }
    ];
    copyButtons.forEach(({ element, button }) => {
        const btn = document.getElementById(button);
        if (btn) btn.addEventListener('click', () => copyToClipboard(element, button));
    });

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', handleContactSubmit);

    // Payment handler (QR confirm button)
    const qrPayBtn = document.querySelector('[data-bs-target="#donateModal"]');
    if (qrPayBtn) qrPayBtn.addEventListener('click', handlePaymentConfirm);

    // Render courses
    renderCourses();

    // Default to home
    showPage('home');
});
