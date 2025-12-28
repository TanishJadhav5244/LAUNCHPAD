// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    
    // Hide error message initially
    errorMessage.style.display = 'none';
    
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Get user role from Firestore
        const userDoc = await getDoc(doc(getFirestore(), 'users', user.uid));
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
        errorMessage.textContent = 'Login failed: ' + error.message;
        errorMessage.style.display = 'block';
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