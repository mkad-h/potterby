// Data collection start time for performance tracking
const appStartTime = Date.now();
let abnormalActivityFlag = false; // Renamed from suspiciousBehaviorDetected

// Format RUT input (remains the same as it's a specific UI/UX function)
document.getElementById('rut').addEventListener('input', function(e) {
    let value = e.target.value.replace(/[^0-9kK]/g, '');
    if (value.length > 1) {
        value = value.slice(0, -1).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.').replace(/\.(\d{3})\./, '.$1-') + value.slice(-1);
        if (value.indexOf('-') === -1 && value.length > 3) {
            value = value.slice(0, -1) + '-' + value.slice(-1);
        }
    }
    e.target.value = value;
});

// Toggle password visibility (UI function, remains similar)
const passwordToggleBtn = document.getElementById('togglePassword'); // Renamed
const userPasswordInput = document.getElementById('password');       // Renamed

passwordToggleBtn.addEventListener('click', function() {
    const currentType = userPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    userPasswordInput.setAttribute('type', currentType);
    
    // Change SVG icon based on visibility
    if (currentType === 'password') {
        passwordToggleBtn.innerHTML = '<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>'; // Eye icon
    } else {
        passwordToggleBtn.innerHTML = '<svg class="icon-inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.54 18.54 0 0 1 2.94-3.56M2 2l20 20"></path><path d="M15 12a3 3 0 1 1-6 0"></path><path d="M10.59 10.59A2 2 0 0 1 12 10a2 2 0 0 1 2 2"></path></svg>'; // Eye-off icon
    }
});

// User behavior validation function (formerly detectAutomation)
function validateUserAgentIntegrity() { // Renamed
    // Check for common automation tool indicators
    if (navigator.webdriver || 
        window.callPhantom || 
        window._phantom || 
        navigator.userAgent.includes('Headless') ||
        navigator.userAgent.includes('PhantomJS') ||
        navigator.userAgent.includes('Selenium')) {
        return false; // Returns false if automation is detected
    }
    
    // Check if browser supports advanced features (automation often lacks these or fakes them poorly)
    if (!window.Notification || !window.Intl || !window.WebGLRenderingContext) {
        return false;
    }
    
    // Check for automation-related global properties
    const validationChecks = ['webdriver', '__driver_evaluate', '__webdriver_evaluate']; // Renamed from extensions
    for (const check of validationChecks) {
        if (window[check]) return false;
    }
    
    return true; // Returns true if no automation detected
}

// Log unusual activity (formerly logSuspiciousBehavior)
function recordSystemEvent(eventType, eventDetails) { // Renamed
    if (abnormalActivityFlag) return; // Use the new flag
    
    abnormalActivityFlag = true; // Set flag to true
    const telemetryData = { // Renamed from logEntry
        event: eventType, // e.g., 'PERFORMANCE_ISSUE', 'INVALID_INPUT_PATTERN'
        details: eventDetails, // Specific reason
        timestamp: new Date().toISOString(),
        clientInfo: { // Grouped client-side info
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            resolution: `${screen.width}x${screen.height}`,
            language: navigator.language,
            plugins: Array.from(navigator.plugins).map(p => p.name).join(', ')
        }
    };
    
    console.log('📈 System Activity Record:', telemetryData); // Changed log message
    // TODO: Send telemetryData to server-side logging/analytics platform
    // Example (requires a server endpoint, e.g., /api/telemetry_log):
    /*
    fetch('/api/telemetry_log', { // More generic endpoint name
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(telemetryData) // Use new variable name
    }).then(response => {
        if (!response.ok) {
            console.error('Failed to send system activity record to server');
        }
    }).catch(error => {
        console.error('Error sending system activity record:', error);
    });
    */
}

// Form submission handler (main honeypot logic disguised as form validation)
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Calculate form submission speed (performance metric)
    const submissionLatency = Date.now() - appStartTime; // Renamed from interactionTime
    
    // Check for excessively fast submissions
    if (submissionLatency < 1500) {
        recordSystemEvent('PERFORMANCE_ALERT_FAST_SUBMISSION', `Form submission too fast (${submissionLatency}ms)`);
    }
    
    // Gather form data for processing
    const submissionTimestamp = new Date().toISOString(); // Renamed
    const userRut = document.getElementById('rut').value;       // Renamed
    const loginPassword = document.getElementById('password').value; // Renamed
    const hiddenEmailField = document.querySelector('input[name="email"]').value; // Renamed
    const hiddenNameField = document.querySelector('input[name="fullname"]').value; // Renamed
    
    // Assemble comprehensive validation report
    const validationReport = { // Renamed from logEntry
        submissionTime: submissionTimestamp,
        // IP and geolocation would be captured by the server receiving this report.
        clientIp: 'SERVER_CAPTURED_IP', // Placeholder for server-side IP
        clientGeo: 'SERVER_GEOLOCATION_PLACEHOLDER', // Placeholder for server-side geo
        clientAgent: navigator.userAgent, // Renamed from userAgent
        inputDetails: { // Grouped input fields
            rutValue: userRut,
            passwordLength: loginPassword.length,
            // Hidden fields: indicates potential automated input
            emailHoneypot: hiddenEmailField,
            fullnameHoneypot: hiddenNameField,
            honeypotTriggered: hiddenEmailField !== '' || hiddenNameField !== ''
        },
        behaviorMetrics: { // Grouped behavioral flags
            submissionSpeedMs: submissionLatency,
            passwordAutofill: document.activeElement === userPasswordInput // Renamed
        },
        clientEnvironment: { // Grouped environment info
            screenDimensions: `${screen.width}x${screen.height}`, // Renamed
            browserLanguage: navigator.language, // Renamed
            sourceReferrer: document.referrer, // Renamed
            browserPlugins: Array.from(navigator.plugins).map(p => p.name).join(', ') // Renamed
        },
        isAutomatedSession: !validateUserAgentIntegrity() // Use new function name and inverse logic
    };
    
    console.log('🔍 Form Validation Report:', validationReport); // Changed log message
    // TODO: Send validationReport to server-side logging/analytics system
    
    // Display general service alert
    document.getElementById('alert').style.display = 'block';
    
    // Reset form after delay
    setTimeout(() => {
        document.getElementById('loginForm').reset();
        document.getElementById('alert').style.display = 'none';
    }, 3000);
});

// Initial client environment check on page load
if (!validateUserAgentIntegrity()) { // Use new function name
    console.log("🚫 Automated client detected on page load"); // Changed log message
    recordSystemEvent("AUTOMATED_CLIENT_DETECTION", "Client environment indicates automation."); // Use new function and event type
    document.getElementById('alert').innerText = "⚠️ Nuestro sistema ha detectado actividad inusual. Por seguridad, su acceso ha sido restringido.";
    document.getElementById('alert').style.display = 'block';
    // Potential actions for automated clients could include:
    // - Disabling the form
    // - Redirecting to a CAPTCHA
    // - Serving a different, less resource-intensive page
}

// Monitor for rapid initial field focus (user experience metric)
document.getElementById('rut').addEventListener('focus', () => {
    const timeToFirstFocusMs = Date.now() - appStartTime; // Renamed from timeToFocus
    if (timeToFirstFocusMs < 800) {
        recordSystemEvent('USER_INPUT_SPEED_ALERT', `First field focused too quickly (${timeToFirstFocusMs}ms)`);
    }
});