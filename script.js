/* ============================================
   RedTeam Toolkit - Main Script (Updated)
   Features:
   - Dynamic page navigation
   - Course rendering
   - Theme toggle
   - Copy-to-clipboard
   - Discord Webhook Integration (Contact Form)
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
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const el = document.getElementById(pageId);
    if (el) el.classList.add('active');
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

    container.innerHTML = courses.map(course => `
        <div class="col-md-6 mb-4">
            <div class="card course-card p-3 h-100">
                <i class="fas ${course.icon} course-icon"></i>
                <h4>${course.title}${course.new ? ' <span class="badge-new">New</span>' : ''}</h4>
                <p>${course.description}</p>
                <div class="mt-auto d-flex justify-content-between align-items-center">
                    <span class="text-muted"><i class="fas fa-book me-1"></i>${course.lessons} lessons</span>
                    <a href="course.html?id=${course.id}" class="btn btn-outline-accent">Explore Course</a>
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
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');

    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
    icon.classList.toggle('fa-sun', !isDark);
    icon.classList.toggle('fa-moon', isDark);
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
}

// ============================================
// COPY TO CLIPBOARD
// ============================================
function copyToClipboard(elementId, buttonId) {
    const element = document.getElementById(elementId);
    const button = document.getElementById(buttonId);
    if (!element || !button) return;

    navigator.clipboard.writeText(element.value)
        .then(() => {
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => (button.textContent = originalText), 2000);
        })
        .catch(err => console.error('Clipboard error:', err));
}

// ============================================
// DISCORD WEBHOOK INTEGRATION
// ============================================
const DISCORD_WEBHOOK_URL =
    'https://discord.com/api/webhooks/1423577299743150171/iJ8umjXqODdnFNdSz8tEiDam4xbjYS5LURjcE0L6-_4jTSY7nt--mVey0eNgqnoINfj7';

async function sendToDiscord(formData) {
    const embed = {
        title: '📩 New Contact Form Submission',
        color: 0x2f81f7,
        fields: [
            { name: '👤 Name', value: formData.name || 'Not provided', inline: true },
            { name: '📧 Email', value: formData.email || 'Not provided', inline: true },
            { name: '📝 Subject', value: formData.subject || 'Not provided', inline: true },
            { name: '💬 Message', value: formData.message || 'Not provided' }
        ],
        footer: { text: 'RedTeam Toolkit Contact Form' },
        timestamp: new Date().toISOString()
    };

    const payload = {
        username: 'RedTeam Toolkit Bot',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063796.png',
        embeds: [embed]
    };

    try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
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
async function handleFormSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const spinner = submitBtn.querySelector('.spinner-border');
    const submitText = submitBtn.querySelector('.submit-text');
    const formAlert = document.getElementById('formAlert');

    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value,
        message: document.getElementById('message').value.trim()
    };

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
        showAlert('⚠️ Please fill in all fields.', 'danger');
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    submitText.textContent = 'Sending...';
    formAlert.classList.add('d-none');

    const success = await sendToDiscord(formData);

    if (success) {
        showAlert('✅ Message sent successfully! Redirecting to our Discord...', 'success');
        document.getElementById('contactForm').reset();
        // Redirect after 2 seconds
        setTimeout(() => {
            window.open('https://discord.gg/YOUR_INVITE_LINK', '_blank');
        }, 2000);
    } else {
        showAlert('❌ Failed to send message. Please try again later.', 'danger');
    }

    // Reset button state
    submitBtn.disabled = false;
    spinner.classList.add('d-none');
    submitText.textContent = 'Send Message';
}

// ============================================
// ALERT HANDLER
// ============================================
function showAlert(message, type) {
    const formAlert = document.getElementById('formAlert');
    formAlert.textContent = message;
    formAlert.className = `alert alert-${type} mt-3`;
    formAlert.classList.remove('d-none');

    if (type === 'success') {
        setTimeout(() => formAlert.classList.add('d-none'), 6000);
    }
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);

    // Set icon based on theme
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        const icon = themeToggle.querySelector('i');
        icon.classList.toggle('fa-sun', savedTheme === 'dark');
        icon.classList.toggle('fa-moon', savedTheme === 'light');
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            showPage(link.getAttribute('data-page'));
        });
    });

    // Copy buttons
    const copyButtons = [
        { element: 'upi-id', button: 'copy-upi-id' },
        { element: 'payment-link', button: 'copy-payment-link' }
    ];
    copyButtons.forEach(({ element, button }) => {
        const btn = document.getElementById(button);
        if (btn) btn.addEventListener('click', () => copyToClipboard(element, button));
    });

    // Render courses
    renderCourses();

    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) contactForm.addEventListener('submit', handleFormSubmit);

    // Default page
    showPage('home');
});
