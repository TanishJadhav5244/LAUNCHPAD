  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
  import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
  import {
    getFirestore,
    collection,
    query,
    orderBy,
    limit,
    getDocs,
    enableIndexedDbPersistence
  } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

  let app, db, auth;

  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);

    await enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        console.warn('Multiple tabs open. Persistence only works in one.');
      } else if (err.code === 'unimplemented') {
        console.warn('Persistence is not supported by this browser.');
      }
    });
  } catch (err) {
    console.error('Firebase initialization error:', err);
    showToast('Firebase init failed: ' + err.message, 'error');
  }

  // Toast utility
  function showToast(message, type = 'success') {
    const toastEl = document.getElementById(type === 'success' ? 'successToast' : 'errorToast');
    const messageEl = document.getElementById(type === 'success' ? 'toastMessage' : 'errorToastMessage');
    if (toastEl && messageEl) {
      messageEl.textContent = message;
      new bootstrap.Toast(toastEl).show();
    }
  }

  // Format number like 1.2k
  function formatNumber(num) {
    return num >= 1000 ? (num / 1000).toFixed(1) + 'k' : num;
  }

  // Create pitch card
  function createPitchCard(pitch) {
    const title = pitch.startupName || pitch.title || 'Marketplace';
    const description = pitch.description || pitch.summary || 'No description available';
    const authorName = pitch.founderName || pitch.authorName || pitch.email || 'Anonymous';
    const category = pitch.category || 'General';
    const coverImage = pitch.coverImage || null;
    const views = formatNumber(pitch.views || 0);
    const likes = formatNumber(pitch.likes || 0);
    const comments = formatNumber(pitch.comments || 0);
    const status = pitch.status || 'active';

    let formattedDate = 'Date not available';
    if (pitch.createdAt?.toDate) {
      formattedDate = new Date(pitch.createdAt.toDate()).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    }

    const truncated = description.length > 150 ? description.substring(0, 150) + '...' : description;

    return `
      <div class="col-md-4 mb-4">
        <div class="card pitch-card h-100">
          <div class="card-image-container">
            ${coverImage ? `<img src="${coverImage}" class="card-img-top" alt="${title}">`
              : `<div class="no-image-placeholder"><i class="fas fa-store"></i></div>`}
            <div class="card-overlay">
              <span class="badge bg-primary">${category}</span>
              <div class="stats-overlay">
                <span><i class="fas fa-eye"></i> ${views}</span>
                <span><i class="fas fa-heart"></i> ${likes}</span>
                <span><i class="fas fa-comment"></i> ${comments}</span>
              </div>
            </div>
          </div>
          <div class="card-body">
            <h5 class="card-title">${title}</h5>
            <p class="card-text">${truncated}</p>
            <div class="pitch-details">
              <div class="author-info"><i class="fas fa-user"></i> ${authorName}</div>
              <div class="date-info"><i class="fas fa-calendar"></i> ${formattedDate}</div>
            </div>
          </div>
          <div class="card-footer">
            <a href="pitch-detail.html?id=${pitch.id}" class="btn btn-primary btn-view">
              <i class="fas fa-arrow-right"></i> View Details
            </a>
          </div>
        </div>
      </div>
    `;
  }

  // Fetch featured pitches
  async function fetchFeaturedPitches() {
    const container = document.getElementById('featuredPitches');
    if (!container || !db) return;

    container.innerHTML = `
      <div class="col-12 text-center">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;

    try {
      const q = query(collection(db, 'pitches'), orderBy('createdAt', 'desc'), limit(6));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        container.innerHTML = `
          <div class="col-12 text-center">
            <h5>No pitches available yet.</h5>
            <a href="submit-pitch.html" class="btn btn-primary mt-2">Submit Your Pitch</a>
          </div>
        `;
        return;
      }

      let html = '';
      snapshot.forEach(doc => {
        html += createPitchCard({ id: doc.id, ...doc.data() });
      });
      container.innerHTML = html;
    } catch (error) {
      console.error('Fetch error:', error);
      container.innerHTML = `
        <div class="col-12 text-center">
          <div class="alert alert-danger">Error loading pitches. Try again later.</div>
        </div>
      `;
      showToast(error.message, 'error');
    }
  }

  // Auth state
  onAuthStateChanged(auth, (user) => {
    const container = document.querySelector('.auth-buttons');
    if (!container) return;

    if (user) {
      container.innerHTML = `
        <a href="#" class="btn btn-light btn-auth btn-profile" data-bs-toggle="modal" data-bs-target="#profileModal">
          <i class="fas fa-user-circle me-2"></i>Profile
        </a>
        <button type="button" class="btn btn-outline-light ms-2 btn-auth" data-bs-toggle="modal" data-bs-target="#logoutConfirmModal">
          <i class="fas fa-sign-out-alt me-2"></i>Logout
        </button>
      `;
    } else {
      container.innerHTML = `
        <a class="btn btn-outline-light me-2" href="register.html">Register</a>
        <a class="btn btn-light" href="login.html">Sign in</a>
      `;
    }
  });

  // Logout handler (attach to global scope)
  window.handleLogout = async function () {
    try {
      await signOut(auth);
      window.location.href = 'index.html';
    } catch (error) {
      console.error('Logout failed:', error);
      showToast('Logout failed: ' + error.message, 'error');
    }
  };

  // On page load
  document.addEventListener('DOMContentLoaded', () => {
    fetchFeaturedPitches();
  });
