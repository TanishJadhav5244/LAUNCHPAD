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
    serverTimestamp
  } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

  // Firebase Config
  const firebaseConfig = {
    apiKey: "AIzaSyA8ZedixW9VBxK9vew-mZrIiArs4pD2qME",
    authDomain: "launchpad2025-fbf68.firebaseapp.com",
    projectId: "launchpad2025-fbf68",
    storageBucket: "launchpad2025-fbf68.appspot.com",
    messagingSenderId: "287852575824",
    appId: "1:287852575824:web:f3fba7158a9f43feb26555",
    measurementId: "G-GZEVYXLSNN"
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

  passwordInput.addEventListener('input', (e) => {
    validatePassword(e.target.value);
  });

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMessages();

    const fullName = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const password = passwordInput.value;
    const selectedRole = document.getElementById('userRole').value;

    if (!validatePassword(password)) {
      showError('Please make sure your password meets all the requirements.');
      return;
    }

    const submitButton = registerForm.querySelector('button[type="submit"]');
    const spinner = submitButton.querySelector('.spinner-border');
    submitButton.disabled = true;
    spinner?.classList.remove('d-none');

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: fullName });

      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        role: selectedRole,
        userId: user.uid,
        createdAt: serverTimestamp()
      });

      showSuccess('Account created successfully! Redirecting...');
      setTimeout(() => window.location.href = 'index.html', 2000);
    } catch (error) {
      let message = 'Failed to create account. ';
      switch (error.code) {
        case 'auth/email-already-in-use': message += 'Email already registered.'; break;
        case 'auth/invalid-email': message += 'Invalid email address.'; break;
        case 'auth/weak-password': message += 'Password is too weak.'; break;
        default: message += error.message;
      }
      showError(message);
    } finally {
      submitButton.disabled = false;
      spinner?.classList.add('d-none');
    }
  });

  // Social login
  document.querySelectorAll('.social-button').forEach(button => {
    button.addEventListener('click', async () => {
      clearMessages();

      const providerName = button.querySelector('img').alt.toLowerCase();
      let authProvider;
      if (providerName === 'google') authProvider = new GoogleAuthProvider();
      if (providerName === 'facebook') authProvider = new FacebookAuthProvider();
      if (providerName === 'twitter') authProvider = new TwitterAuthProvider();

      const submitButton = registerForm.querySelector('button[type="submit"]');
      const spinner = submitButton.querySelector('.spinner-border');
      submitButton.disabled = true;
      spinner?.classList.remove('d-none');

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
            window.location.href = 'index.html';
          });
        } else {
          window.location.href = 'index.html';
        }
      } catch (error) {
        console.error("Social login error:", error);
        showError(error.message);
      } finally {
        submitButton.disabled = false;
        spinner?.classList.add('d-none');
      }
    });
  });
