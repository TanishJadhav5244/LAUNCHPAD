import { db } from './firebase-config.js';

// Function to format numbers (e.g., 1000 -> 1k)
function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num;
}

// Function to display pitches in the container
function displayPitches(pitches) {
    const featuredPitchesContainer = document.getElementById('featuredPitches');
    if (!featuredPitchesContainer) return;

    if (pitches.length === 0) {
        featuredPitchesContainer.innerHTML = `
            <div class="col-12 text-center">
                <p>No pitches available yet.</p>
            </div>
        `;
        return;
    }

    const pitchesHTML = pitches.map(pitch => `
        <div class="col-md-4 mb-4">
            <div class="card h-100 shadow-sm">
                <div class="card-body">
                    <h5 class="card-title">${pitch.startupName}</h5>
                    <p class="badge bg-primary">${pitch.category}</p>
                    <p class="card-text">${pitch.summary.substring(0, 100)}...</p>
                    
                    <div class="mt-2">
                        <small class="text-muted">
                            <i class="fas fa-building"></i> ${pitch.domain}<br>
                            <i class="fas fa-chart-line"></i> ${pitch.stage}<br>
                            <i class="fas fa-users"></i> ${pitch.teamSize}
                        </small>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mt-3">
                        <div class="stats">
                            <small class="text-muted">
                                <i class="fas fa-eye"></i> ${formatNumber(pitch.views || 0)}
                                <i class="fas fa-heart ms-2"></i> ${formatNumber(pitch.likes || 0)}
                            </small>
                        </div>
                        <span class="badge bg-${pitch.status === 'pending' ? 'warning' : 'success'}">${pitch.status}</span>
                    </div>
                </div>
                <div class="card-footer bg-white">
                    <a href="pitch-detail.html?id=${pitch.id}" class="btn btn-primary btn-sm w-100">View Details</a>
                </div>
            </div>
        </div>
    `).join('');

    featuredPitchesContainer.innerHTML = pitchesHTML;
}

// Function to fetch pitches from Firestore
async function fetchPitches() {
    const featuredPitchesContainer = document.getElementById('featuredPitches');
    
    try {
        // Show loading state
        featuredPitchesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;

        // Fetch pitches from Firestore
        const snapshot = await db.collection('pitches')
            .orderBy('createdAt', 'desc') // Get newest first
            .get();

        const pitches = [];
        snapshot.forEach(doc => {
            pitches.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Display the fetched pitches
        displayPitches(pitches);

    } catch (error) {
        console.error('Error fetching pitches:', error);
        featuredPitchesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger" role="alert">
                    Error loading pitches. Please try again later.
                </div>
            </div>
        `;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', fetchPitches); 