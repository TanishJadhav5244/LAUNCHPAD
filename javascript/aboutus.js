// Import Firebase SDKs
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
    import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

    // Firebase configuration
    const firebaseConfig = {
      apiKey: "AIzaSyC2C2dq3RwYQeUGGA8MzLgxtudcnL_dKuo",
      authDomain: "launchpad-2ab08.firebaseapp.com",
      projectId: "launchpad-2ab08",
      storageBucket: "launchpad-2ab08.firebasestorage.app",
      messagingSenderId: "974657612108",
      appId: "1:974657612108:web:adbc2eb0183ca5996687e9",
      measurementId: "G-Y3B565L6ED"
    };

    // Initialize Firebase
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);

    // Auth state management
    onAuthStateChanged(auth, (user) => {
      const authButtonsContainer = document.querySelector('.auth-buttons');
      
      if (user) {
        // User is signed in
        authButtonsContainer.innerHTML = `
          <a href="#" class="btn btn-light btn-auth btn-profile" 
             data-bs-toggle="modal" data-bs-target="#profileModal">
             <i class="fas fa-user-circle me-2"></i>Profile
          </a>
          <button type="button" class="btn btn-outline-light ms-2 btn-auth" 
                  data-bs-toggle="modal" data-bs-target="#logoutConfirmModal">
             <i class="fas fa-sign-out-alt me-2"></i>Logout
          </button>
        `;
      } else {
        // User is signed out
        authButtonsContainer.innerHTML = `
          <a class="btn btn-outline-light me-2" href="register.html">Register</a>
          <a class="btn btn-light" href="login.html">Sign in</a>
        `;
      }
    });

    // Handle logout function
    window.handleLogout = async function() {
      try {
        await signOut(auth);
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Logout error:', error);
        alert(error.message);
      }
    };