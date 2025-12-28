// Authentication and role-based routing utility
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
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
const db = getFirestore(app);

// Function to redirect to appropriate dashboard based on role
export function redirectToDashboard(role) {
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

// Function to check if user has access to specific dashboard
export async function checkDashboardAccess(requiredRole) {
    return new Promise((resolve) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, 'users', user.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        if (userData.role === requiredRole) {
                            resolve({ hasAccess: true, userData, user });
                        } else {
                            // Redirect to correct dashboard
                            redirectToDashboard(userData.role);
                            resolve({ hasAccess: false });
                        }
                    } else {
                        window.location.href = 'index.html';
                        resolve({ hasAccess: false });
                    }
                } catch (error) {
                    console.error('Error checking user role:', error);
                    window.location.href = 'index.html';
                    resolve({ hasAccess: false });
                }
            } else {
                window.location.href = 'login.html';
                resolve({ hasAccess: false });
            }
        });
    });
}

// Function to handle logout
export async function handleLogout() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout error:', error);
        alert(error.message);
    }
}

// Export Firebase instances for use in other modules
export { auth, db };