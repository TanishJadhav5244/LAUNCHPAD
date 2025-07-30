<<<<<<< Updated upstream
// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { formatNumber } from './utils.js';

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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Sample data for demonstration
const samplePitches = [
    {
        id: 1,
        title: "EcoSmart - Sustainable Living Solutions",
        description: "Revolutionizing sustainable living with smart home technology that reduces energy consumption.",
        image: "https://placehold.co/300x200",
        videoUrl: "https://www.youtube.com/embed/sample1",
        views: 1250,
        likes: 89,
        comments: 23,
        rating: 4.5
    },
    {
        id: 2,
        title: "HealthTrack - AI-Powered Health Monitoring",
        description: "Advanced health monitoring system using AI to predict and prevent health issues.",
        image: "https://placehold.co/300x200",
        videoUrl: "https://www.youtube.com/embed/sample2",
        views: 980,
        likes: 67,
        comments: 15,
        rating: 4.2
    },
    {
        id: 3,
        title: "EduTech - Personalized Learning Platform",
        description: "Adaptive learning platform that personalizes education for each student.",
        image: "https://placehold.co/300x200",
        videoUrl: "https://www.youtube.com/embed/sample3",
        views: 1500,
        likes: 112,
        comments: 45,
        rating: 4.8
    }
];

// DOM Elements
const featuredPitchesContainer = document.getElementById('featuredPitches');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const pitchForm = document.getElementById('pitchForm');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    displayFeaturedPitches();
    setupEventListeners();
    updateAuthUI();
    
    // Add auth state listener
    auth.onAuthStateChanged((user) => {
        updateAuthUI(user);
    });
});

// Display featured pitches
function displayFeaturedPitches() {
    if (!featuredPitchesContainer) return;

    featuredPitchesContainer.innerHTML = samplePitches.map(pitch => `
        <div class="col-md-4">
            <div class="card pitch-card fade-in">
                <img src="${pitch.image}" class="card-img-top" alt="${pitch.title}">
                <div class="card-body">
                    <h5 class="card-title">${pitch.title}</h5>
                    <p class="card-text">${pitch.description}</p>
                    <div class="pitch-stats d-flex justify-content-between">
                        <span><i class="fas fa-eye"></i> ${pitch.views}</span>
                        <span><i class="fas fa-heart"></i> ${pitch.likes}</span>
                        <span><i class="fas fa-comment"></i> ${pitch.comments}</span>
                        <span><i class="fas fa-star"></i> ${pitch.rating}</span>
                    </div>
                    <a href="pitch-detail.html?id=${pitch.id}" class="btn btn-primary mt-3">View Details</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            handleLogin(email, password);
        });
    }

    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            handleSignup(name, email, password);
        });
    }

    // Pitch form submission
    if (pitchForm) {
        pitchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('pitchTitle').value;
            const description = document.getElementById('pitchDescription').value;
            const videoUrl = document.getElementById('pitchVideo').value;
            const image = document.getElementById('pitchImage').files[0];
            handlePitchSubmission(title, description, videoUrl, image);
        });
    }
}

// Handle login
async function handleLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Close modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        
        // Show success message
        const message = `Welcome back, ${user.displayName || 'User'}!`;
        const toastEl = document.getElementById('successToast');
        if (toastEl) {
            showSuccessToast(message);
        } else {
            alert(message);
        }
    
        // Redirect to index.html
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Failed to log in. ';
        
        switch (error.code) {
            case 'auth/invalid-credential':
                errorMessage += 'Invalid email or password.';
                break;
            case 'auth/user-not-found':
                errorMessage += 'No account found with this email.';
                break;
            case 'auth/wrong-password':
                errorMessage += 'Incorrect password.';
                break;
            case 'auth/too-many-requests':
                errorMessage += 'Too many failed attempts. Please try again later.';
                break;
            default:
                errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
}

// Handle signup
async function handleSignup(name, email, password) {
    try {
        // Get selected role
        const selectedRole = document.querySelector('input[name="userRole"]:checked').value;
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile with name
        await updateProfile(user, {
            displayName: name
        });
        
        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name: name,
            email: email,
            role: selectedRole,
            createdAt: new Date().toISOString()
        });
        
        // Close modal
        const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
        signupModal.hide();
        
        // Show success toast
        showSuccessToast('Registration successful! Welcome to LaunchPad!');
        
        // Redirect to index.html
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Signup error:', error);
        let errorMessage = 'Failed to sign up. ';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage += 'This email is already registered. Please try logging in instead.';
                break;
            case 'auth/invalid-email':
                errorMessage += 'Please enter a valid email address.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage += 'Email/password accounts are not enabled. Please contact support.';
                break;
            case 'auth/weak-password':
                errorMessage += 'Please choose a stronger password.';
                break;
            default:
                errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
}

// Update UI based on auth state
function updateAuthUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const profileBtn = document.getElementById('profileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (user) {
        // User is signed in
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        // User is signed out
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (registerBtn) registerBtn.style.display = 'inline-block';
        if (profileBtn) profileBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Make updateAuthUI available globally
window.updateAuthUI = updateAuthUI;

// Handle logout
async function handleLogout() {
    try {
        await signOut(auth);
        showSuccessToast('You have been successfully logged out.');
    } catch (error) {
        console.error('Logout error:', error);
        alert(error.message);
    }
}

// Make handleLogout available globally
window.handleLogout = handleLogout;

// Handle pitch submission
function handlePitchSubmission(title, description, videoUrl, image) {
    // Simulate pitch submission - In a real app, this would make an API call
    console.log('Pitch submission:', { title, description, videoUrl, image });
    alert('Pitch submitted successfully!');
    const pitchModal = bootstrap.Modal.getInstance(document.getElementById('submitPitchModal'));
    pitchModal.hide();
}

// Add smooth scrolling to all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Function to show user profile
async function showProfile() {
    const user = auth.currentUser;
    if (!user) {
        alert('You must be logged in to view your profile');
        return;
    }

    // Get user data from Firestore
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        // Update profile modal with user data
        document.getElementById('profileName').textContent = user.displayName || 'No name set';
        document.getElementById('profileEmail').textContent = user.email;
        
        // Format role for display
        let roleDisplay = 'Standard';
        if (userData?.role) {
            switch(userData.role) {
                case 'startup':
                    roleDisplay = 'Startup Founder';
                    break;
                case 'mentor':
                    roleDisplay = 'Mentor';
                    break;
                case 'investor':
                    roleDisplay = 'Investor';
                    break;
                default:
                    roleDisplay = userData.role;
            }
        }
        document.getElementById('profileAccountType').textContent = roleDisplay;
        
        // Format dates
        const memberSince = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown';
        const lastLogin = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown';
        
        document.getElementById('profileMemberSince').textContent = memberSince;
        document.getElementById('profileLastLogin').textContent = lastLogin;
        
        // Show the modal
        const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
        profileModal.show();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        alert('Failed to load profile data. Please try again.');
    }
}

// Make showProfile available globally
window.showProfile = showProfile;

// Function to show success toast
function showSuccessToast(message) {
  const toastEl = document.getElementById('successToast');
  const toastMessage = document.getElementById('toastMessage');
  
  if (toastEl && toastMessage) {
    toastMessage.textContent = message;
    const toast = new bootstrap.Toast(toastEl, {
      animation: true,
      autohide: true,
      delay: 3000
    });
    toast.show();
  }
}

// Make showSuccessToast available globally
=======
// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getFirestore, setDoc, doc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// Sample data for demonstration
const samplePitches = [
    {
        id: 1,
        title: "EcoSmart - Sustainable Living Solutions",
        description: "Revolutionizing sustainable living with smart home technology that reduces energy consumption.",
        image: "https://placehold.co/300x200",
        videoUrl: "https://www.youtube.com/embed/sample1",
        views: 1250,
        likes: 89,
        comments: 23,
        rating: 4.5
    },
    {
        id: 2,
        title: "HealthTrack - AI-Powered Health Monitoring",
        description: "Advanced health monitoring system using AI to predict and prevent health issues.",
        image: "https://placehold.co/300x200",
        videoUrl: "https://www.youtube.com/embed/sample2",
        views: 980,
        likes: 67,
        comments: 15,
        rating: 4.2
    },
    {
        id: 3,
        title: "EduTech - Personalized Learning Platform",
        description: "Adaptive learning platform that personalizes education for each student.",
        image: "https://placehold.co/300x200",
        videoUrl: "https://www.youtube.com/embed/sample3",
        views: 1500,
        likes: 112,
        comments: 45,
        rating: 4.8
    }
];

// DOM Elements
const featuredPitchesContainer = document.getElementById('featuredPitches');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const pitchForm = document.getElementById('pitchForm');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    displayFeaturedPitches();
    setupEventListeners();
    updateAuthUI();
    
    // Add auth state listener
    auth.onAuthStateChanged((user) => {
        updateAuthUI(user);
    });
});

// Display featured pitches
function displayFeaturedPitches() {
    if (!featuredPitchesContainer) return;

    featuredPitchesContainer.innerHTML = samplePitches.map(pitch => `
        <div class="col-md-4">
            <div class="card pitch-card fade-in">
                <img src="${pitch.image}" class="card-img-top" alt="${pitch.title}">
                <div class="card-body">
                    <h5 class="card-title">${pitch.title}</h5>
                    <p class="card-text">${pitch.description}</p>
                    <div class="pitch-stats d-flex justify-content-between">
                        <span><i class="fas fa-eye"></i> ${pitch.views}</span>
                        <span><i class="fas fa-heart"></i> ${pitch.likes}</span>
                        <span><i class="fas fa-comment"></i> ${pitch.comments}</span>
                        <span><i class="fas fa-star"></i> ${pitch.rating}</span>
                    </div>
                    <a href="pitch-detail.html?id=${pitch.id}" class="btn btn-primary mt-3">View Details</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            handleLogin(email, password);
        });
    }

    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('signupName').value;
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            handleSignup(name, email, password);
        });
    }

    // Pitch form submission
    if (pitchForm) {
        pitchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('pitchTitle').value;
            const description = document.getElementById('pitchDescription').value;
            const videoUrl = document.getElementById('pitchVideo').value;
            const image = document.getElementById('pitchImage').files[0];
            handlePitchSubmission(title, description, videoUrl, image);
        });
    }
}

// Handle login
async function handleLogin(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Close modal
        const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
        loginModal.hide();
        
        // Show success toast
        showSuccessToast(`Welcome back, ${user.displayName || 'User'}!`);
        
        // Redirect to index.html
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Login error:', error);
        let errorMessage = 'Failed to log in. ';
        
        switch (error.code) {
            case 'auth/invalid-credential':
                errorMessage += 'Invalid email or password.';
                break;
            case 'auth/user-not-found':
                errorMessage += 'No account found with this email.';
                break;
            case 'auth/wrong-password':
                errorMessage += 'Incorrect password.';
                break;
            case 'auth/too-many-requests':
                errorMessage += 'Too many failed attempts. Please try again later.';
                break;
            default:
                errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
}

// Handle signup
async function handleSignup(name, email, password) {
    try {
        // Get selected role
        const selectedRole = document.querySelector('input[name="userRole"]:checked').value;
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Update user profile with name
        await updateProfile(user, {
            displayName: name
        });
        
        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
            name: name,
            email: email,
            role: selectedRole,
            createdAt: new Date().toISOString()
        });
        
        // Close modal
        const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
        signupModal.hide();
        
        // Show success toast
        showSuccessToast('Registration successful! Welcome to LaunchPad!');
        
        // Redirect to index.html
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Signup error:', error);
        let errorMessage = 'Failed to sign up. ';
        
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage += 'This email is already registered. Please try logging in instead.';
                break;
            case 'auth/invalid-email':
                errorMessage += 'Please enter a valid email address.';
                break;
            case 'auth/operation-not-allowed':
                errorMessage += 'Email/password accounts are not enabled. Please contact support.';
                break;
            case 'auth/weak-password':
                errorMessage += 'Please choose a stronger password.';
                break;
            default:
                errorMessage += error.message;
        }
        
        alert(errorMessage);
    }
}

// Update UI based on auth state
function updateAuthUI(user) {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const profileBtn = document.getElementById('profileBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (user) {
        // User is signed in
        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        if (profileBtn) profileBtn.style.display = 'inline-block';
        if (logoutBtn) logoutBtn.style.display = 'inline-block';
    } else {
        // User is signed out
        if (loginBtn) loginBtn.style.display = 'inline-block';
        if (registerBtn) registerBtn.style.display = 'inline-block';
        if (profileBtn) profileBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Make updateAuthUI available globally
window.updateAuthUI = updateAuthUI;

// Handle logout
async function handleLogout() {
    try {
        await signOut(auth);
        showSuccessToast('You have been successfully logged out.');
    } catch (error) {
        console.error('Logout error:', error);
        alert(error.message);
    }
}

// Make handleLogout available globally
window.handleLogout = handleLogout;

// Handle pitch submission
function handlePitchSubmission(title, description, videoUrl, image) {
    // Simulate pitch submission - In a real app, this would make an API call
    console.log('Pitch submission:', { title, description, videoUrl, image });
    alert('Pitch submitted successfully!');
    const pitchModal = bootstrap.Modal.getInstance(document.getElementById('submitPitchModal'));
    pitchModal.hide();
}

// Utility function to format numbers
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Add smooth scrolling to all links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Function to show user profile
async function showProfile() {
    const user = auth.currentUser;
    if (!user) {
        alert('You must be logged in to view your profile');
        return;
    }

    // Get user data from Firestore
    try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        // Update profile modal with user data
        document.getElementById('profileName').textContent = user.displayName || 'No name set';
        document.getElementById('profileEmail').textContent = user.email;
        
        // Format role for display
        let roleDisplay = 'Standard';
        if (userData?.role) {
            switch(userData.role) {
                case 'startup':
                    roleDisplay = 'Startup Founder';
                    break;
                case 'mentor':
                    roleDisplay = 'Mentor';
                    break;
                case 'investor':
                    roleDisplay = 'Investor';
                    break;
                default:
                    roleDisplay = userData.role;
            }
        }
        document.getElementById('profileAccountType').textContent = roleDisplay;
        
        // Format dates
        const memberSince = user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'Unknown';
        const lastLogin = user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString() : 'Unknown';
        
        document.getElementById('profileMemberSince').textContent = memberSince;
        document.getElementById('profileLastLogin').textContent = lastLogin;
        
        // Show the modal
        const profileModal = new bootstrap.Modal(document.getElementById('profileModal'));
        profileModal.show();
    } catch (error) {
        console.error('Error fetching user profile:', error);
        alert('Failed to load profile data. Please try again.');
    }
}

// Make showProfile available globally
window.showProfile = showProfile;

// Function to show success toast
function showSuccessToast(message) {
  const toastEl = document.getElementById('successToast');
  const toastMessage = document.getElementById('toastMessage');
  
  if (toastEl && toastMessage) {
    toastMessage.textContent = message;
    const toast = new bootstrap.Toast(toastEl, {
      animation: true,
      autohide: true,
      delay: 3000
    });
    toast.show();
  }
}

// Make showSuccessToast available globally
>>>>>>> Stashed changes
window.showSuccessToast = showSuccessToast;