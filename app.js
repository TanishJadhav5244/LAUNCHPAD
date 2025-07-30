// Import Firebase modules
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBdVuEHRvxKph3CUoDBBn45URjHtUxZzfY",
    authDomain: "launchpad-2025kit.firebaseapp.com",
    projectId: "launchpad-2025kit",
    storageBucket: "launchpad-2025kit.appspot.com",
    messagingSenderId: "786536378187",
    appId: "1:786536378187:web:0cd2dee5587a9761ebc2ce",
    measurementId: "G-Z1GBWD5ED5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to handle account type selection
export function selectType(type) {
    // Remove selected class from all buttons
    document.querySelectorAll('.btn-outline-primary').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add selected class to clicked button
    document.getElementById(`${type}Btn`).classList.add('active');
    
    // Store the selected type
    window.selectedAccountType = type;
}

// Function to handle login
export function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('message');
    
    // Basic validation
    if (!email || !password) {
        messageDiv.textContent = 'Please fill in all fields';
        messageDiv.className = 'alert alert-danger mt-3';
        messageDiv.style.display = 'block';
        return;
    }
    
    // Here you would typically make an API call to your backend
    // For now, we'll just show a success message
    messageDiv.textContent = 'Login successful!';
    messageDiv.className = 'alert alert-success mt-3';
    messageDiv.style.display = 'block';
    
    // Redirect to dashboard after successful login
    setTimeout(() => {
        window.location.href = '/main/dashboard.html';
    }, 1500);
}

// Function to handle signup (placeholder for now)
export function signup() {
    // Implement signup functionality
    console.log('Signup function called');
}

// Function to handle logout
export function logout() {
    // Clear any stored user data
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    
    // Redirect to home page
    window.location.href = '/main/index.html';
}

// Helper function to show messages
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.className = `alert alert-${type === 'error' ? 'danger' : 'success'} mt-3`;
    messageDiv.style.display = 'block';
}
