<script type="module">
  // Import Firebase SDKs
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
  import { getAuth, onAuthStateChanged, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

  // Set persistence
  setPersistence(auth, browserSessionPersistence)
    .then(() => {
      console.log("Auth persistence set");
    })
    .catch((error) => {
      console.error("Error setting auth persistence:", error);
    });

  // Function to update UI based on auth state
  function updateUIForAuth(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const dashboardLink = document.querySelector('a[href="dashboard.html"]')?.parentElement;
    
    if (!authButtons) return;

    if (user) {
      // User is signed in
      authButtons.innerHTML = `
        <a href="#" class="btn btn-outline-light" id="logoutBtn">Logout</a>
      `;
      document.getElementById('logoutBtn').addEventListener('click', () => {
        auth.signOut();
      });
      
      if (dashboardLink) dashboardLink.style.display = 'block';
    } else {
      // User is signed out
      authButtons.innerHTML = `
        <a href="register.html" class="btn btn-register">Register</a>
        <a href="login.html" class="btn btn-signin">Sign in</a>
      `;
      
      if (dashboardLink) dashboardLink.style.display = 'none';
    }
  }

  // Listen for auth state changes
  onAuthStateChanged(auth, (user) => {
    updateUIForAuth(user);
  });
</script>