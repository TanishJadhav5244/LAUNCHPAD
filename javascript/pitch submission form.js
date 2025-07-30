    // Initialize Firebase (replace with your config)
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
    firebase.initializeApp(firebaseConfig);
    const db = firebase.firestore();
    const auth = firebase.auth();
    
    // Form submission handler
    document.getElementById('pitchSubmissionForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = e.target.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
      
      try {
        // Check if user is authenticated
        const user = auth.currentUser;
        if (!user) {
          throw new Error('Please sign in to submit a pitch');
        }

        // Get form values
        const formData = {
          startupName: document.getElementById('startupName').value,
          founderName: document.getElementById('founderName').value,
          email: document.getElementById('email').value,
          category: document.getElementById('category').value,
          stage: document.getElementById('stage').value,
          teamSize: parseInt(document.getElementById('teamSize').value),
          summary: document.getElementById('summary').value,
          problem: document.getElementById('problem').value,
          solution: document.getElementById('solution').value,
          market: document.getElementById('market').value,
          competitors: document.getElementById('competitors').value,
          video: document.getElementById('video').value || null,
          additional: document.getElementById('additional').value || null,
          status: 'pending',
          userId: user.uid, // Add user ID to the pitch data
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        // Add pitch to Firestore
        const docRef = await db.collection('pitches').add(formData);
        
        // Show success toast
        const toast = new bootstrap.Toast(document.getElementById('successToast'));
        document.getElementById('toastMessage').textContent = 'Your pitch has been submitted successfully!';
        toast.show();
        
        // Reset form
        e.target.reset();
        
        // Redirect to founder dashboard with the new pitch ID
        setTimeout(() => {
          window.location.href = `founder-dashboard.html?pitch=${docRef.id}`;
        }, 1500);
      } catch (error) {
        console.error('Error submitting pitch:', error);
        // Show error toast instead of alert
        const toast = new bootstrap.Toast(document.getElementById('errorToast'));
        document.getElementById('errorToastMessage').textContent = error.message;
        toast.show();
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Pitch';
      }
    });
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        document.querySelector('.navbar').classList.add('scrolled');
      } else {
        document.querySelector('.navbar').classList.remove('scrolled');
      }
    });
    
    // Check auth state
    auth.onAuthStateChanged(user => {
      const registerBtn = document.getElementById('registerBtn');
      const loginBtn = document.getElementById('loginBtn');
      const profileBtn = document.getElementById('profileBtn');
      const logoutBtn = document.getElementById('logoutBtn');
      
      if (user) {
        // User is signed in
        registerBtn.style.display = 'none';
        loginBtn.style.display = 'none';
        profileBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'inline-block';
      } else {
        // No user is signed in
        registerBtn.style.display = 'inline-block';
        loginBtn.style.display = 'inline-block';
        profileBtn.style.display = 'none';
        logoutBtn.style.display = 'none';
      }
    });
    
    // Logout handler
    function handleLogout() {
      auth.signOut().then(() => {
        window.location.href = 'index.html';
      }).catch(error => {
        console.error('Logout error:', error);
      });
    }
  