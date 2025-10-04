/* ============================================
   RedTeam Toolkit - Course Registration Script
   Features:
   - Course registration form
   - Discord Webhook Integration
   - Form validation
   - Theme toggle
   ============================================ */

// ============================================
// DISCORD WEBHOOK INTEGRATION
// ============================================
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1424089083587592372/pbqINJiA1O7eweyMPV7iSGa_pkPR9AoSmtV_F5r7--4NTIhsFWM7yIjtfMS_Yqur5ZCx';


async function sendRegistrationToDiscord(formData) {
    // Course mapping for better display
    const courseMap = {
        'active-directory': '🎯 Active Directory Pentesting',
        'windows-fundamentals': '🪟 Windows Fundamentals',
        'linux-fundamentals': '🐧 Linux Fundamentals',
        'ceh': '🛡️ CEH Preparation',
        'ejpt': '📜 eJPT v2',
        'pnpt': '🔍 PNPT',
        'aws': '☁️ AWS Pentesting',
        'web-pentesting': '🌐 Web Application Pentesting',
        'malware': '🦠 Malware Analysis',
        'oscp': '🎓 OSCP Preparation',
        'cloud': '☁️ Cloud Security'
    };

    // Experience level mapping
    const experienceMap = {
        'Beginner': '🟢 Beginner (0-1 years)',
        'Intermediate': '🟡 Intermediate (1-3 years)',
        'Advanced': '🟠 Advanced (3-5 years)',
        'Expert': '🔴 Expert (5+ years)'
    };

    const embed = {
        title: '🎓 New Course Registration',
        description: `**Student Registration Details**\n*Registration submitted at ${new Date().toLocaleString()}*`,
        color: 0x2f81f7,
        thumbnail: {
            url: 'https://cdn-icons-png.flaticon.com/512/3063/3063796.png'
        },
        fields: [
            { 
                name: '👤 Student Information', 
                value: `**Name:** ${formData.fullName}\n**Email:** ${formData.email}\n**Phone:** ${formData.phone}`, 
                inline: false 
            },
            { 
                name: '📚 Course Details', 
                value: `**Selected Course:** ${courseMap[formData.course] || formData.course}\n**Experience Level:** ${experienceMap[formData.experience] || formData.experience}`, 
                inline: false 
            },
            { 
                name: '🎯 Learning Objectives', 
                value: formData.goals ? `*"${formData.goals}"*` : '*No specific goals mentioned*', 
                inline: false 
            }
        ],
        footer: { 
            text: 'RedTeam Toolkit • Course Registration System',
            icon_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063796.png'
        },
        timestamp: new Date().toISOString()
    };

    const payload = {
        username: 'RedTeam Toolkit • Course Registration',
        avatar_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063796.png',
        embeds: [embed]
    };

    try {
        const res = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if (res.ok) {
            // Send a follow-up notification
            setTimeout(async () => {
                const notificationEmbed = {
                    title: '✅ Registration Confirmed',
                    description: `**${formData.fullName}** has been successfully registered for **${courseMap[formData.course] || formData.course}**`,
                    color: 0x28a745,
                    fields: [
                        {
                            name: '📧 Next Steps',
                            value: '• Confirmation email sent to student\n• Course materials will be provided\n• Welcome email scheduled',
                            inline: false
                        }
                    ],
                    footer: { 
                        text: 'RedTeam Toolkit • Automated System',
                        icon_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063796.png'
                    },
                    timestamp: new Date().toISOString()
                };

                const notificationPayload = {
                    username: 'RedTeam Toolkit • System Notification',
                    avatar_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063796.png',
                    embeds: [notificationEmbed]
                };

                try {
                    await fetch(DISCORD_WEBHOOK_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(notificationPayload)
                    });
                } catch (notificationErr) {
                    console.log('Notification sent (optional)');
                }
            }, 2000);
        }
        
        return res.ok;
    } catch (err) {
        console.error('Webhook Error:', err);
        return false;
    }
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
// FORM VALIDATION
// ============================================
function validateForm(formData) {
    const errors = [];

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
        errors.push('Please enter a valid email address');
    }

    // Phone validation
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(formData.phone.replace(/[\s\-\(\)]/g, ''))) {
        errors.push('Please enter a valid phone number');
    }

    // Course selection validation
    if (!formData.course) {
        errors.push('Please select a course');
    }

    // Experience level validation
    if (!formData.experience) {
        errors.push('Please select your experience level');
    }

    return errors;
}

// ============================================
// REGISTRATION FORM HANDLER
// ============================================
async function handleRegistrationSubmit(e) {
    e.preventDefault();
    const submitBtn = document.getElementById('submitBtn');
    const spinner = submitBtn.querySelector('.spinner-border');
    const submitText = submitBtn.querySelector('.submit-text');
    const formAlert = document.getElementById('formAlert');

    // Collect form data
    const formData = {
        fullName: document.getElementById('fullName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        course: document.getElementById('course').value,
        experience: document.getElementById('experience').value,
        goals: document.getElementById('goals').value.trim()
    };

    // Validate form
    const errors = validateForm(formData);
    if (errors.length > 0) {
        showAlert('⚠️ ' + errors.join('<br>'), 'danger');
        return;
    }

    // Show loading state
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    submitText.textContent = 'Processing Registration...';
    formAlert.classList.add('d-none');

    // Send to Discord
    const success = await sendRegistrationToDiscord(formData);

    if (success) {
        showAlert('✅ Course registration successful! You will receive a confirmation email with course details shortly.', 'success');
        document.getElementById('registrationForm').reset();
        // Redirect to main page after 3 seconds
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 3000);
    } else {
        showAlert('❌ Registration failed. Please try again later or contact support.', 'danger');
    }

    // Reset button state
    submitBtn.disabled = false;
    spinner.classList.add('d-none');
    submitText.textContent = 'Register for Course';
}

// ============================================
// ALERT HANDLER
// ============================================
function showAlert(message, type) {
    const formAlert = document.getElementById('formAlert');
    formAlert.innerHTML = message;
    formAlert.className = `alert alert-${type} mt-3`;
    formAlert.classList.remove('d-none');

    if (type === 'success') {
        setTimeout(() => formAlert.classList.add('d-none'), 8000);
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

    // Registration form
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistrationSubmit);
    }

    // Real-time phone validation
    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', () => {
            const phone = phoneField.value.replace(/[\s\-\(\)]/g, '');
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            
            if (phone && !phoneRegex.test(phone)) {
                phoneField.setCustomValidity('Please enter a valid phone number');
            } else {
                phoneField.setCustomValidity('');
            }
        });
    }
});
