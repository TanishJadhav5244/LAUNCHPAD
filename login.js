// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // Hide error message initially
    if (errorMessage) errorMessage.style.display = 'none';
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get user role from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        // Redirect based on user role
        if (userData && userData.role) {
            redirectToDashboard(userData.role);
        } else {
            // Default redirect if no role found
            window.location.href = 'index.html';
        }
        
    } catch (error) {
        console.error('Login error:', error);
        if (errorMessage) {
            errorMessage.textContent = 'Login failed: ' + error.message;
            errorMessage.style.display = 'block';
        }
    }
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