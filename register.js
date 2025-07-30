
// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, FacebookAuthProvider, TwitterAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC2C2dq3RwYQeUGGA8MzLgxtudcnL_dKuo",
    authDomain: "launchpad-2ab08.firebaseapp.com",
    projectId: "launchpad-2ab08",
    storageBucket: "launchpad-2ab08.firebasestorage.app",
    messagingSenderId: "974657612108",
    appId: "1:974657612108:web:adbc2eb0183ca5996687e9",
    measurementId: "G-Y3B565L6E0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const registerForm = document.getElementById('registerForm');
const passwordInput = document.getElementById('signupPassword');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('success-message');

function validatePassword(password) {
    const requirements = {
        length: password.length >= 8,
        uppercase: /[A-Z]/.test(password),
        number: /[0-9]/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const requirementElements = document.querySelectorAll('.requirement');
    requirementElements[0].classList.toggle('met', requirements.length);
    requirementElements[1].classList.toggle('met', requirements.uppercase);
    requirementElements[2].classList.toggle('met', requirements.number);
    requirementElements[3].classList.toggle('met', requirements.special);

    return Object.values(requirements).every(Boolean);
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    successMessage.style.display = 'none';
}

function showSuccess(message) {
    successMessage.textContent = message;
    successMessage.style.display = 'block';
    errorMessage.style.display = 'none';
}

function clearMessages() {
    errorMessage.style.display = 'none';
    successMessage.style.display = 'none';
}

// Password validation on input
passwordInput.addEventListener('input', (e) => {
    validatePassword(e.target.value);
});

// Handle form submission
registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    clearMessages();

    const fullName = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = passwordInput.value;
    const selectedRole = document.getElementById('userRole').value;

    if (!validatePassword(password)) {
        showError('Please make sure your password meets all the requirements.');
        return;
    }

    // Show loading state
    const submitButton = registerForm.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Creating Account...";

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile
        await updateProfile(user, {
            displayName: fullName
        });

        // Save additional user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            fullName: fullName,
            email: email,
            role: selectedRole,
            createdAt: serverTimestamp()
        });

        // Registration successful
        showSuccess('Account created successfully! Redirecting...');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    } catch (error) {
        console.error("Registration error:", error);
        let errorMessage = 'Failed to create account. ';

        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage += 'This email is already registered.';
                break;
            case 'auth/invalid-email':
                errorMessage += 'Please enter a valid email address.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage += 'Email/password accounts are not enabled.';
                break;
            case 'auth/weak-password':
                errorMessage += 'Please choose a stronger password.';
                break;
            default:
                errorMessage += error.message;
        }

        showError(errorMessage);
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = originalText;
    }
});

// Handle social login buttons
document.querySelectorAll('.social-button').forEach(button => {
    button.addEventListener('click', async function() {
        const provider = this.querySelector('img').getAttribute('alt').toLowerCase();
        clearMessages();
        
        // Show loading state
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = "Connecting...";
        
        let authProvider;
        
        switch (provider) {
            case 'google':
                authProvider = new GoogleAuthProvider();
                break;
            case 'facebook':
                authProvider = new FacebookAuthProvider();
                break;
            case 'twitter':
                authProvider = new TwitterAuthProvider();
                break;
        }
        
        if (authProvider) {
            try {
                const result = await signInWithPopup(auth, authProvider);
                const user = result.user;
                
                if (result.additionalUserInfo.isNewUser) {
                    // Save new user data to Firestore
                    await setDoc(doc(db, 'users', user.uid), {
                        fullName: user.displayName || 'User',
                        email: user.email,
                        role: 'startup', // Default role
                        createdAt: serverTimestamp()
                    });
                }
                
                window.location.href = "index.html";
            } catch (error) {
                console.error("Social login error:", error);
                showError(error.message);
            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        }
    });
>>>>>>> Stashed changes
});