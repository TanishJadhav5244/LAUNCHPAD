// In each dashboard file
<script type="module">
  import { auth, db } from './auth.js';
  import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

  // Check user role on page load
  auth.onAuthStateChanged(async (user) => {
    if (user) {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists) {
          window.location.href = 'index.html';
          return;
        }
        
        const userData = userDoc.data();
        const currentPage = window.location.pathname.split('/').pop();
        const allowedPages = {
          'founder': 'founderdashboard.html',
          'mentor': 'mentordashboard.html',
          'investor': 'investordashboard.html'
        };

        if (currentPage !== allowedPages[userData.role]) {
          window.location.href = allowedPages[userData.role] || 'index.html';
        }
      } catch (error) {
        console.error('Error checking user role:', error);
        window.location.href = 'index.html';
      }
    } else {
      window.location.href = 'login.html';
    }
  });
</script>