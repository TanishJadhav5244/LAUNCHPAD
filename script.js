document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    const emailInput = document.querySelector('input[type="email"]');
    const passwordInput = document.querySelector('input[type="password"]');
    const rememberMeCheckbox = document.querySelector('input[type="checkbox"]');

    // Add checkmark when email is valid
    emailInput.addEventListener('input', function() {
        const isValid = emailInput.checkValidity();
        const checkmark = this.parentElement.querySelector('.checkmark');
        
        if (!checkmark && isValid) {
            const span = document.createElement('span');
            span.className = 'checkmark';
            span.innerHTML = '✓';
            span.style.position = 'absolute';
            span.style.right = '12px';
            span.style.top = '50%';
            span.style.transform = 'translateY(-50%)';
            span.style.color = '#10B981';
            this.parentElement.appendChild(span);
        } else if (checkmark && !isValid) {
            checkmark.remove();
        }
    });

    // Handle form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Basic validation
        if (!emailInput.value || !passwordInput.value) {
            alert('Please fill in all fields');
            return;
        }

        // Create login data object
        const loginData = {
            email: emailInput.value,
            password: passwordInput.value,
            rememberMe: rememberMeCheckbox.checked
        };

        // Here you would typically send this data to your server
        console.log('Login attempt:', loginData);
        
        // Simulate API call
        simulateLogin(loginData);
    });

    // Social login handlers
    const socialButtons = document.querySelectorAll('.social-button');
    socialButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const provider = this.querySelector('img').alt.toLowerCase();
            handleSocialLogin(provider);
        });
    });

    // Simulate login API call
    function simulateLogin(data) {
        // Show loading state
        const loginButton = loginForm.querySelector('button[type="submit"]');
        const originalText = loginButton.textContent;
        loginButton.textContent = 'Logging in...';
        loginButton.disabled = true;

        // Simulate API delay
        setTimeout(() => {
            // Reset button state
            loginButton.textContent = originalText;
            loginButton.disabled = false;

            // Simulate successful login
            alert('Login successful! Welcome back!');
            
            // Redirect to index.html
            window.location.href = 'index.html';
        }, 1500);
    }

    // Handle social login
    function handleSocialLogin(provider) {
        console.log(`Initiating ${provider} login...`);
        // Here you would typically:
        // 1. Open OAuth popup or redirect
        // 2. Handle the OAuth flow
        // 3. Process the response
        alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} login coming soon!`);
    }

    // Handle "Forgot Password" link
    const forgotPasswordLink = document.querySelector('.forgot-password');
    forgotPasswordLink.addEventListener('click', function(e) {
        e.preventDefault();
        const email = emailInput.value;
        if (email) {
            alert(`Password reset link would be sent to: ${email}`);
        } else {
            alert('Please enter your email address first');
            emailInput.focus();
        }
    });

    // Handle "Create Account" link
    const createAccountLink = document.querySelector('.signup-link a');
    createAccountLink.addEventListener('click', function(e) {
        e.preventDefault();
        alert('Registration page coming soon!');
    });
}); 