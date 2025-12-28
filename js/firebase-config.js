// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);

// Export for use in other modules
export { app, analytics, firebaseConfig };