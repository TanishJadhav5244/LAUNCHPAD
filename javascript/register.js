// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDh_xXoGd3-Adw6F8uRY1f1XMDCs10Dwog",
  authDomain: "buildit-a4f00.firebaseapp.com",
  projectId: "buildit-a4f00",
  storageBucket: "buildit-a4f00.firebasestorage.app",
  messagingSenderId: "266070023537",
  appId: "1:266070023537:web:d8a1d71f65df93ff73ead0",
  measurementId: "G-HMCSD02CCE"
};

// Initialize Firebase
console.log('Initializing Firebase...', firebaseConfig);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
console.log('Firebase initialized successfully', { app, auth, db });

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, setting up registration form...');
  
  // DOM Elements
  const registerForm = document.getElementById('registerForm');
  const passwordInput = document.getElementById('signupPassword');
  const errorMessage = document.getElementById('errorMessage');
  const successMessage = document.getElementById('success-message');
  
  console.log('DOM Elements:', { registerForm, passwordInput, errorMessage, successMessage });
  
  // Check if DOM elements exist
  if (!registerForm || !passwordInput || !errorMessage) {
    console.error('Required DOM elements not found:', { registerForm, passwordInput, errorMessage });
    if (errorMessage) {
      errorMessage.textContent = 'Error: Required form elements not found. Please refresh the page.';
      errorMessage.style.display = 'block';
    }
    return;
  }

  function validatePassword(password) {
    if (!password) return false;
    
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const requirementElements = document.querySelectorAll('.requirement');
    if (requirementElements.length >= 4) {
      requirementElements[0].classList.toggle('met', requirements.length);
      requirementElements[1].classList.toggle('met', requirements.uppercase);
      requirementElements[2].classList.toggle('met', requirements.number);
      requirementElements[3].classList.toggle('met', requirements.special);
    }

    return Object.values(requirements).every(Boolean);
  }

  function showError(message) {
    if (errorMessage) {
      errorMessage.textContent = message;
      errorMessage.style.display = 'block';
    }
    if (successMessage) {
      successMessage.style.display = 'none';
    }
  }

  function showSuccess(message) {
    if (successMessage) {
      successMessage.textContent = message;
      successMessage.style.display = 'block';
    }
    if (errorMessage) {
      errorMessage.style.display = 'none';
    }
  }

  function clearMessages() {
    if (errorMessage) {
      errorMessage.style.display = 'none';
    }
    if (successMessage) {
      successMessage.style.display = 'none';
    }
  }

  // Function to redirect to appropriate dashboard based on role
  function redirectToDashboard(role) {
    switch(role) {
      case 'startup':
      case 'founder':
        window.location.href = 'founderdashboard.html';
        break;
      case 'investor':
        window.location.href = 'investordashboard.html';
        break;
      case 'mentor':
        window.location.href = 'mentordashboard.html';
        break;
      default:
        window.location.href = 'dashboard.html';
    }
  }

  // Password validation on input
  if (passwordInput) {
    passwordInput.addEventListener('input', (e) => {
      validatePassword(e.target.value);
    });
  }

  // Form submission handler
  console.log('Attaching form submission handler...');
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    const fullName = document.getElementById('signupName')?.value.trim();
    const email = document.getElementById('signupEmail')?.value.trim();
    const password = passwordInput?.value;
    const selectedRole = document.getElementById('userRole')?.value;

    console.log('Form submitted with data:', { fullName, email, selectedRole, passwordLength: password?.length });

    if (!fullName || !email || !password || !selectedRole) {
      showError('Please fill in all required fields.');
      return;
    }

    if (!validatePassword(password)) {
      showError('Please make sure your password meets all the requirements.');
      return;
    }

    const submitButton = registerForm.querySelector('button[type="submit"]');
    if (!submitButton) {
      showError('Form submission error. Please try again.');
      return;
    }
    
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Creating Account...';

    try {
      console.log('Creating user account...', { email, fullName, selectedRole });
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('User created in Auth:', user.uid);

      console.log('Updating user profile...');
      await updateProfile(user, { displayName: fullName });
      console.log('Profile updated');

      console.log('Saving user data to Firestore...', { uid: user.uid });
      const userData = {
        fullName,
        email,
        role: selectedRole,
        userId: user.uid,
        createdAt: serverTimestamp()
      };
      console.log('User data to save:', userData);
      
      try {
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log('User data saved to Firestore successfully');
      } catch (firestoreError) {
        console.error('Firestore save error:', firestoreError);
        // If Firestore fails but Auth succeeded, still show success but warn user
        console.warn('User created in Auth but Firestore save failed. User may need to update profile later.');
        // Continue anyway since the user is created
      }

      showSuccess('Account created successfully! Redirecting...');
      setTimeout(() => redirectToDashboard(selectedRole), 2000);
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      
      let message = 'Failed to create account. ';
      
      // Check for Firestore permission errors
      if (error.code === 'permission-denied' || error.message?.includes('permission')) {
        message += 'Permission denied. Please check Firebase security rules.';
      } else if (error.code === 'unavailable' || error.message?.includes('unavailable')) {
        message += 'Firebase service unavailable. Please try again later.';
      } else {
        switch (error.code) {
          case 'auth/email-already-in-use': 
            message += 'Email already registered.'; 
            break;
          case 'auth/invalid-email': 
            message += 'Invalid email address.'; 
            break;
          case 'auth/weak-password': 
            message += 'Password is too weak.'; 
            break;
          case 'auth/network-request-failed':
            message += 'Network error. Please check your connection and disable ad blockers if enabled.';
            break;
          default: 
            message += error.message || 'An unexpected error occurred. If you have an ad blocker, please disable it for this site.';
        }
      }
      showError(message);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = originalButtonText;
    }
  });

  // Social login
  document.querySelectorAll('.social-button').forEach(button => {
    button.addEventListener('click', async () => {
      clearMessages();

      const imgElement = button.querySelector('img');
      if (!imgElement) return;
      
      const providerName = imgElement.alt.toLowerCase();
      let authProvider;
      if (providerName === 'google') authProvider = new GoogleAuthProvider();
      if (providerName === 'facebook') authProvider = new FacebookAuthProvider();
      if (providerName === 'twitter') authProvider = new TwitterAuthProvider();

      if (!authProvider) return;

      const submitButton = registerForm.querySelector('button[type="submit"]');
      if (!submitButton) return;
      
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = 'Connecting...';

      try {
        const result = await signInWithPopup(auth, authProvider);
        const user = result.user;

        if (result._tokenResponse?.isNewUser) {
          const roleModal = document.createElement('div');
          roleModal.className = 'modal fade';
          roleModal.id = 'roleSelectionModal';
          roleModal.innerHTML = `
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Select Your Role</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                  <p>Please select your role to complete registration:</p>
                  <select id="socialUserRole" class="form-select">
                    <option value="startup">Startup Founder</option>
                    <option value="mentor">Mentor</option>
                    <option value="investor">Investor</option>
                  </select>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-primary" id="confirmRoleBtn">Continue</button>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(roleModal);
          const modal = new bootstrap.Modal(roleModal);
          modal.show();

          document.getElementById('confirmRoleBtn').addEventListener('click', async () => {
            const selectedRole = document.getElementById('socialUserRole').value;

            await setDoc(doc(db, 'users', user.uid), {
              fullName: user.displayName || 'User',
              email: user.email,
              role: selectedRole,
              userId: user.uid,
              createdAt: serverTimestamp()
            });

            modal.hide();
            redirectToDashboard(selectedRole);
          });
        } else {
          // Existing user, get their role and redirect
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            redirectToDashboard(userDoc.data().role);
          } else {
            window.location.href = 'index.html';
          }
        }
      } catch (error) {
        console.error("Social login error:", error);
        showError(error.message || 'Social login failed. Please try again.');
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    });
  });
});
