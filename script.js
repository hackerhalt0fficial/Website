// Course data
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

// Page navigation
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    const el = document.getElementById(pageId);
    if (el) el.classList.add('active');
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        }
    });
    window.scrollTo(0, 0);
}

// Function to render courses
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

// Theme toggle functionality
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

// Copy to clipboard functions
function copyToClipboard(elementId, buttonId) {
    const element = document.getElementById(elementId);
    const button = document.getElementById(buttonId);
    if (element) {
        element.select();
        element.setSelectionRange(0, 99999); // For mobile devices
        try {
            document.execCommand('copy');
            const originalText = button.textContent;
            button.textContent = 'Copied!';
            setTimeout(() => {
                button.textContent = originalText;
            }, 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    // Set initial theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.setAttribute('data-theme', savedTheme);
    const themeToggle = document.getElementById('theme-toggle');
    const icon = themeToggle.querySelector('i');
    icon.classList.toggle('fa-sun', savedTheme === 'dark');
    icon.classList.toggle('fa-moon', savedTheme === 'light');

    // Set up event listeners
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const page = this.getAttribute('data-page');
            showPage(page);
        });
    });

    document.getElementById('theme-toggle').addEventListener('click', toggleTheme);

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

    // Render courses on the courses page
    renderCourses();

    // Show home page by default
    showPage('home');
});

// Discord Webhook Integration
const DISCORD_WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL_HERE'; // Replace with your actual webhook URL

async function sendToDiscord(formData) {
    const embed = {
        title: "📧 New Contact Form Submission",
        color: 0x0099ff,
        fields: [
            {
                name: "👤 Name",
                value: formData.name || "Not provided",
                inline: true
            },
            {
                name: "📧 Email",
                value: formData.email || "Not provided",
                inline: true
            },
            {
                name: "📝 Subject",
                value: formData.subject || "Not provided",
                inline: true
            },
            {
                name: "💬 Message",
                value: formData.message ? (formData.message.length > 1000 ? formData.message.substring(0, 1000) + "..." : formData.message) : "Not provided"
            }
        ],
        footer: {
            text: "RedTeam Toolkit Contact Form"
        },
        timestamp: new Date().toISOString()
    };

    try {
        const response = await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                embeds: [embed],
                username: 'RedTeam Toolkit Bot',
                avatar_url: 'https://cdn-icons-png.flaticon.com/512/3063/3063796.png'
            })
        });

        if (!response.ok) {
            throw new Error(`Discord webhook failed: ${response.status}`);
        }
        
        return true;
    } catch (error) {
        console.error('Error sending to Discord:', error);
        return false;
    }
}

// Form submission handler
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
    
    // Show loading state
    submitBtn.disabled = true;
    spinner.classList.remove('d-none');
    submitText.textContent = 'Sending...';
    formAlert.classList.add('d-none');
    
    // Send to Discord
    sendToDiscord(formData)
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

// Alert function
function showAlert(message, type) {
    const formAlert = document.getElementById('formAlert');
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

// Add form event listener in the DOMContentLoaded event
document.addEventListener('DOMContentLoaded', function() {
    // ... your existing initialization code ...
    
    // Add contact form event listener
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
    
    // ... rest of your existing code ...
});
