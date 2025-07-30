const registerForm = document.getElementById('registerForm');
    const passwordInput = document.getElementById('signupPassword');
    const errorMessage = document.getElementById('errorMessage');

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

    passwordInput.addEventListener('input', (e) => {
      validatePassword(e.target.value);
    });

    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      errorMessage.style.display = 'none';

      const fullName = document.getElementById('signupName').value;
      const email = document.getElementById('signupEmail').value;
      const password = passwordInput.value;
      const selectedRole = document.getElementById('userRole').value;

      if (!validatePassword(password)) {
        errorMessage.textContent = "Please make sure your password meets all the requirements.";
        errorMessage.style.display = 'block';
        return;
      }

      // Show loading state
      const submitButton = registerForm.querySelector('button[type="submit"]');
      const originalText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "Creating Account...";

      // Create user with email and password
      firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(function(userCredential) {
          const user = userCredential.user;
          
          // Update user profile with display name
          return user.updateProfile({
            displayName: fullName
          }).then(function() {
            // Save additional user data to Firestore
            return firebase.firestore().collection('users').doc(user.uid).set({
              fullName: fullName,
              email: email,
              role: selectedRole,
              createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
          });
        })
        .then(function() {
          // Registration successful
          window.location.href = "index.html";
        })
        .catch(function(error) {
          // Handle errors
          console.error("Registration error:", error);
          errorMessage.textContent = error.message;
          errorMessage.style.display = 'block';
          
          // Reset button state
          submitButton.disabled = false;
          submitButton.textContent = originalText;
        });
    });

    // Add click handlers for social login buttons
    document.querySelectorAll('.social-button').forEach(button => {
      button.addEventListener('click', function() {
        const provider = this.querySelector('img').getAttribute('alt').toLowerCase();
        errorMessage.style.display = 'none';
        
        // Show loading state
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = "Connecting...";
        
        let authProvider;
        
        if (provider === 'google') {
          authProvider = new firebase.auth.GoogleAuthProvider();
        } else if (provider === 'facebook') {
          authProvider = new firebase.auth.FacebookAuthProvider();
        } else if (provider === 'twitter') {
          authProvider = new firebase.auth.TwitterAuthProvider();
        }
        
        if (authProvider) {
          firebase.auth().signInWithPopup(authProvider)
            .then(function(result) {
              // Social login successful
              const user = result.user;
              
              // Prompt for role selection if this is a new user
              if (result.additionalUserInfo.isNewUser) {
                const roleOptions = ['startup', 'mentor', 'investor'];
                const roleLabels = {
                  'startup': 'Startup Founder',
                  'mentor': 'Mentor',
                  'investor': 'Investor'
                };
                
                // Create a simple modal for role selection
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
                        <div class="mb-3">
                          <label for="socialUserRole" class="form-label">I am a:</label>
                          <select id="socialUserRole" name="socialUserRole" class="form-select">
                            <option value="startup" selected>Startup Founder</option>
                            <option value="mentor">Mentor</option>
                            <option value="investor">Investor</option>
                          </select>
                        </div>
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
                
                // Handle role confirmation
                document.getElementById('confirmRoleBtn').addEventListener('click', function() {
                  const selectedRole = document.getElementById('socialUserRole').value;
                  
                  // Save role to Firestore
                  firebase.firestore().collection('users').doc(user.uid).set({
                    fullName: user.displayName || 'User',
                    email: user.email,
                    role: selectedRole,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                  }).then(function() {
                    modal.hide();
                    window.location.href = "index.html";
                  });
                });
              } else {
                // Existing user, redirect to home
                window.location.href = "index.html";
              }
            })
            .catch(function(error) {
              console.error("Social login error:", error);
              errorMessage.textContent = error.message;
              errorMessage.style.display = 'block';
              
              // Reset button state
              submitButton.disabled = false;
              submitButton.textContent = originalText;
            });
        }
      });
    });