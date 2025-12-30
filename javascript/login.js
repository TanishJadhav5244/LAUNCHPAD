import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, enableNetwork, disableNetwork } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase configuration
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Ensure Firestore network is enabled
enableNetwork(db).catch(err => {
  console.warn('Firestore network enable warning:', err);
});

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

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, setting up login form...');
  
  // DOM Elements
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");
  
  if (!loginForm) {
    console.error('Login form not found');
    return;
  }

  // Handle form submission
  loginForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  errorMessage.style.display = "none";

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    console.log('Attempting login...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Login successful, user UID:', user.uid);
    
    // Ensure network is enabled before reading
    try {
      await enableNetwork(db);
    } catch (networkError) {
      console.warn('Network enable warning (continuing anyway):', networkError);
    }
    
    // Get user role from Firestore
    console.log('Fetching user data from Firestore...');
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log('User data retrieved:', userData);
        
        // Redirect based on user role
        if (userData && userData.role) {
          console.log('Redirecting to dashboard for role:', userData.role);
          redirectToDashboard(userData.role);
          return; // Exit early after redirect
        } else {
          console.warn('User document exists but no role found');
          // Default to startup dashboard if no role
          redirectToDashboard('startup');
          return;
        }
      } else {
        console.warn('User document does not exist in Firestore');
        // User exists in Auth but not in Firestore - default to startup dashboard
        console.log('User authenticated but no Firestore data, redirecting to default dashboard');
        redirectToDashboard('startup');
        return;
      }
    } catch (firestoreError) {
      console.error('Error reading from Firestore:', firestoreError);
      // Even if Firestore fails, user is authenticated - redirect to default dashboard
      console.log('Firestore read failed but user is authenticated, redirecting to default dashboard');
      redirectToDashboard('startup');
      return;
    }
    
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    
    let errorMsg = 'Login failed: ';
    if (error.code === 'unavailable' || error.message?.includes('offline')) {
      errorMsg += 'Network error. Please check your connection and try again.';
    } else if (error.code === 'auth/invalid-credential') {
      errorMsg += 'Invalid email or password.';
    } else if (error.code === 'auth/user-not-found') {
      errorMsg += 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMsg += 'Incorrect password.';
    } else {
      errorMsg += error.message || 'An unexpected error occurred.';
    }
    
    if (errorMessage) {
      errorMessage.textContent = errorMsg;
      errorMessage.style.display = "block";
    }
  }
  });
});

// Check auth state - only redirect if user is already signed in when page loads
// This prevents interference with the form submission flow
onAuthStateChanged(auth, async (user) => {
  if (user) {
    console.log("User already signed in on page load:", user.email);
    
    // Only redirect if we're still on the login page (not already redirected)
    if (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('/')) {
      try {
        // Ensure network is enabled
        try {
          await enableNetwork(db);
        } catch (networkError) {
          console.warn('Network enable warning:', networkError);
        }
        
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData && userData.role) {
            console.log('Redirecting already signed-in user to dashboard:', userData.role);
            redirectToDashboard(userData.role);
          } else {
            console.warn('User document exists but no role found, redirecting to default');
            redirectToDashboard('startup');
          }
        } else {
          console.warn('User document does not exist in Firestore, redirecting to default');
          redirectToDashboard('startup');
        }
      } catch (error) {
        console.error("Error getting user data:", error);
        // Redirect to default dashboard even if Firestore fails
        redirectToDashboard('startup');
      }
    }
  } else {
    console.log('No user signed in');
  }
});