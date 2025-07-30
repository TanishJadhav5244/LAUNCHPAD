// js/pitches.js

// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    orderBy, 
    limit, 
    startAfter, 
    getDocs,
    doc,
    updateDoc,
    increment,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

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

// Function to format numbers (e.g., 1000 -> 1k)
function formatNumber(num) {
    if (!num) return '0';
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}

// Function to create a pitch card HTML
function createPitchCard(pitch) {
    // Ensure all required fields have default values
    const title = pitch.startupName || pitch.title || 'Marketplace';
    const description = pitch.description || 'No description available';
    const authorName = pitch.authorName || pitch.email || 'Anonymous';
    const category = pitch.category || 'General';
    const coverImage = pitch.coverImage || null;
    
    // Format date safely
    let formattedDate = 'Date not available';
    try {
        if (pitch.createdAt && pitch.createdAt.toDate) {
            formattedDate = new Date(pitch.createdAt.toDate()).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    } catch (error) {
        console.warn('Error formatting date:', error);
    }

    // Safely truncate description
    const truncatedDescription = description.length > 150 
        ? description.substring(0, 150) + '...' 
        : description;

    // Get category color
    const categoryColor = getCategoryColor(category);
    
    return `
        <div class="col-md-4 mb-4">
            <div class="card pitch-card h-100 border-0 shadow-sm hover-shadow-lg transition-all">
                <div class="card-image-container position-relative overflow-hidden" style="height: 200px;">
                    ${coverImage ? `
                        <img src="${coverImage}" class="card-img-top h-100 w-100 object-cover" alt="${title}">
                    ` : `
                        <div class="no-image-placeholder h-100 w-100 d-flex align-items-center justify-content-center bg-gradient-primary">
                            <i class="fas fa-rocket fa-3x text-white opacity-50"></i>
                        </div>
                    `}
                    <div class="card-overlay-gradient position-absolute bottom-0 start-0 w-100 p-3">
                        <span class="badge" style="background-color: ${categoryColor}">
                            <i class="fas fa-tag me-1"></i>${category}
                        </span>
                    </div>
                </div>
                <div class="card-body p-4">
                    <h5 class="card-title mb-3 fw-bold text-primary">${title}</h5>
                    <p class="card-text text-muted mb-3" style="line-height: 1.6;">${truncatedDescription}</p>
                    <div class="pitch-details d-flex justify-content-between align-items-center">
                        <div class="author-info d-flex align-items-center">
                            <div class="author-avatar bg-primary rounded-circle d-flex align-items-center justify-content-center me-2" 
                                 style="width: 32px; height: 32px;">
                                <i class="fas fa-user text-white"></i>
                            </div>
                            <span class="text-muted">${authorName}</span>
                        </div>
                        <div class="date-info d-flex align-items-center text-muted">
                            <i class="fas fa-calendar-alt me-1"></i>
                            <span>${formattedDate}</span>
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent border-0 p-4 pt-0">
                    <a href="pitch-detail.html?id=${pitch.id}" 
                       class="btn btn-primary w-100 rounded-pill hover-scale transition-all">
                        <i class="fas fa-arrow-right me-2"></i>View Details
                    </a>
                </div>
            </div>
        </div>
    `;
}

// Function to get category color
function getCategoryColor(category) {
    const colors = {
        'Technology': '#3B82F6',
        'Healthcare': '#10B981',
        'Education': '#F59E0B',
        'Sustainability': '#34D399',
        'Finance': '#6366F1',
        'E-commerce': '#EC4899',
        'General': '#6B7280'
    };
    return colors[category] || colors['General'];
}

// Function to show loading state
function showLoading() {
    const container = document.getElementById('featuredPitches') || document.getElementById('pitchesGrid');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    }
}

// Function to show error state
function showError(message) {
    const container = document.getElementById('featuredPitches') || document.getElementById('pitchesGrid');
    if (container) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <div class="alert alert-danger" role="alert">
                    ${message}
                </div>
            </div>
        `;
    }
}

// Function to fetch pitches
export async function fetchPitches(options = {}) {
    const {
        limit: limitCount = 3,
        orderBy: orderByField = 'createdAt',
        orderDirection = 'desc',
        category = null,
        searchTerm = null
    } = options;

    try {
        showLoading();
        
        let q = query(collection(db, 'pitches'));
        
        // Apply ordering
        q = query(q, orderBy(orderByField, orderDirection));
        
        // Apply category filter
        if (category) {
            q = query(q, where('category', '==', category));
        }
        
        // Apply limit
        q = query(q, limit(limitCount));
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            showError('No pitches found');
            return [];
        }
        
        const pitches = [];
        snapshot.forEach(doc => {
            pitches.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        // Apply search term filtering if provided
        if (searchTerm) {
            const filteredPitches = pitches.filter(pitch => 
                pitch.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                pitch.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            return filteredPitches;
        }
        
        return pitches;
    } catch (error) {
        console.error('Error fetching pitches:', error);
        showError('Error loading pitches. Please try again later.');
        return [];
    }
}

// Function to display pitches
export function displayPitches(pitches, containerId = 'featuredPitches') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (pitches.length === 0) {
        container.innerHTML = `
            <div class="col-12 text-center">
                <p class="text-muted">No pitches available yet. Be the first to submit one!</p>
                        </div>
                    `;
                    return;
                }

    container.innerHTML = pitches.map(createPitchCard).join('');
}

// Function to increment view count
export async function incrementViewCount(pitchId) {
    try {
        const pitchRef = doc(db, 'pitches', pitchId);
        await updateDoc(pitchRef, {
            views: increment(1)
        });
    } catch (error) {
        console.error('Error incrementing view count:', error);
    }
}

// Function to increment like count
export async function incrementLikeCount(pitchId) {
    try {
        const pitchRef = doc(db, 'pitches', pitchId);
        await updateDoc(pitchRef, {
            likes: increment(1)
        });
    } catch (error) {
        console.error('Error incrementing like count:', error);
    }
}

// Function to show toast message
function showToast(message, type = 'success') {
    const toastEl = document.getElementById(type === 'success' ? 'successToast' : 'errorToast');
    const messageEl = document.getElementById(type === 'success' ? 'toastMessage' : 'errorToastMessage');
    if (toastEl && messageEl) {
        messageEl.textContent = message;
        const toast = new bootstrap.Toast(toastEl);
        toast.show();
    }
}

// Function to fetch and display pitches
async function fetchAndDisplayPitches(options = {}) {
    const {
        limit: queryLimit = 9,
        orderByField = 'createdAt',
        orderDirection = 'desc',
        searchTerm = null
    } = options;

    const pitchesContainer = document.getElementById('pitchesGrid');
    if (!pitchesContainer) {
        console.error('Pitches container not found');
        return;
    }

    try {
        // Show loading state
        pitchesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-3">Loading pitches...</p>
            </div>
        `;

        // Build query
        let queryConstraints = [
            orderBy(orderByField, orderDirection),
            limit(queryLimit)
        ];

        const pitchesQuery = query(collection(db, 'pitches'), ...queryConstraints);
        const querySnapshot = await getDocs(pitchesQuery);

        if (querySnapshot.empty) {
            pitchesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="no-pitches-container">
                        <i class="fas fa-lightbulb fa-3x text-muted mb-3"></i>
                        <h4 class="text-muted">No Pitches Found</h4>
                        <p class="text-muted">Be the first to submit a pitch!</p>
                        <a href="submit-pitch.html" class="btn btn-primary mt-3">
                            <i class="fas fa-plus"></i> Submit Your Pitch
                        </a>
                    </div>
                </div>
            `;
            return;
        }

        let pitches = [];
        querySnapshot.forEach((doc) => {
            pitches.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Filter pitches based on search term
        if (searchTerm && searchTerm.trim() !== '') {
            const searchLower = searchTerm.toLowerCase().trim();
            pitches = pitches.filter(pitch => {
                const title = (pitch.startupName || pitch.title || '').toLowerCase();
                return title.includes(searchLower);
            });
        }

            if (pitches.length === 0) {
            pitchesContainer.innerHTML = `
                <div class="col-12 text-center">
                    <div class="no-results-container">
                        <i class="fas fa-search fa-3x text-muted mb-3"></i>
                        <h4 class="text-muted">No Matches Found</h4>
                        <p class="text-muted">No pitches match your search "${searchTerm}"</p>
                        <button class="btn btn-outline-primary mt-3" onclick="clearSearch()">
                            <i class="fas fa-times"></i> Clear Search
                        </button>
                    </div>
                    </div>
                `;
                return;
            }

        let pitchesHTML = '';
        pitches.forEach(pitch => {
            pitchesHTML += createPitchCard(pitch);
        });

        pitchesContainer.innerHTML = pitchesHTML;

        // Add search summary if searching
        if (searchTerm && searchTerm.trim() !== '') {
            const searchSummary = document.createElement('div');
            searchSummary.className = 'col-12 mb-4';
            searchSummary.innerHTML = `
                <div class="search-summary d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-0">
                            Found ${pitches.length} pitch${pitches.length === 1 ? '' : 'es'} matching "${searchTerm}"
                        </h5>
                    </div>
                    <button class="btn btn-outline-secondary btn-sm" onclick="clearSearch()">
                        <i class="fas fa-times"></i> Clear Search
                    </button>
                </div>
            `;
            pitchesContainer.insertBefore(searchSummary, pitchesContainer.firstChild);
        }

    } catch (error) {
        console.error('Error fetching pitches:', error);
        pitchesContainer.innerHTML = `
            <div class="col-12 text-center">
                <div class="error-container">
                    <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
                    <h4 class="text-danger">Error Loading Pitches</h4>
                    <p class="text-muted">Please try again later</p>
                    <button class="btn btn-outline-primary mt-3" onclick="location.reload()">
                        <i class="fas fa-sync-alt"></i> Retry
                    </button>
                </div>
            </div>
        `;
        showToast('Error loading pitches: ' + error.message, 'error');
    }
}

// Function to clear search
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        fetchAndDisplayPitches();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initial load
    fetchAndDisplayPitches();

    // Search input handler with debounce
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        // Update search input attributes
        searchInput.className = 'form-control search-input';
        searchInput.placeholder = 'Search pitches...';
        
        // Create search wrapper with new structure
        const searchWrapper = document.createElement('div');
        searchWrapper.className = 'search-wrapper';
        searchInput.parentNode.insertBefore(searchWrapper, searchInput);
        
        // Create search container
        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchWrapper.appendChild(searchContainer);
        
        // Move input to container
        searchContainer.appendChild(searchInput);
        
        // Add search icon
        const searchIcon = document.createElement('div');
        searchIcon.className = 'search-icon';
        searchIcon.innerHTML = '<i class="fas fa-search"></i>';
        searchContainer.appendChild(searchIcon);
        
        // Add clear button
        const clearButton = document.createElement('button');
        clearButton.className = 'search-clear-btn';
        clearButton.innerHTML = '<i class="fas fa-times"></i>';
        clearButton.style.display = 'none';
        clearButton.onclick = () => {
            searchInput.value = '';
            clearButton.style.display = 'none';
            fetchAndDisplayPitches();
        };
        searchContainer.appendChild(clearButton);

        // Show/hide clear button based on input
        searchInput.addEventListener('input', () => {
            clearButton.style.display = searchInput.value ? 'block' : 'none';
        });

        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                const searchTerm = e.target.value;
                fetchAndDisplayPitches({ searchTerm });
            }, 300);
        });
    }

    // Sort select handler
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', (e) => {
            const [field, direction] = e.target.value.split('-');
            fetchAndDisplayPitches({
                orderByField: field || 'createdAt',
                orderDirection: direction || 'desc',
                searchTerm: document.getElementById('searchInput')?.value
            });
        });
    }
});

// Add these styles to the document
const style = document.createElement('style');
style.textContent = `
    .pitch-card {
        transition: all 0.3s ease;
        border-radius: 15px;
        overflow: hidden;
    }

    .pitch-card:hover {
        transform: translateY(-5px);
    }

    .hover-shadow-lg:hover {
        box-shadow: 0 1rem 3rem rgba(0,0,0,.175)!important;
    }

    .transition-all {
        transition: all 0.3s ease;
    }

    .hover-scale:hover {
        transform: scale(1.02);
    }

    .card-overlay-gradient {
        background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
    }

    .object-cover {
        object-fit: cover;
    }

    .bg-gradient-primary {
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    }

    .no-image-placeholder {
        background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
    }

    .author-avatar {
        transition: transform 0.3s ease;
    }

    .pitch-card:hover .author-avatar {
        transform: scale(1.1);
    }

    .badge {
        padding: 0.5rem 1rem;
        font-weight: 500;
        letter-spacing: 0.5px;
    }

    .card-title {
        font-size: 1.25rem;
        line-height: 1.4;
    }

    .btn-primary {
        padding: 0.75rem 1.5rem;
        font-weight: 600;
        letter-spacing: 0.5px;
    }
`;
document.head.appendChild(style);

// Update the search styles
const searchStyles = document.createElement('style');
searchStyles.textContent = `
    .search-wrapper {
        max-width: 1200px;
        margin: 0 auto 2rem;
        padding: 0 1rem;
        width: 100%;
    }
    
    .search-container {
        position: relative;
        display: flex;
        align-items: center;
        background: #FFFFFF;
        border-radius: 100px;
        padding: 0.5rem 1.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
    }
    
    .search-container:hover,
    .search-container:focus-within {
        box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
    }
    
    .search-input {
        border: none !important;
        padding: 1rem 3rem 1rem 2.5rem !important;
        font-size: 1.1rem !important;
        width: 100% !important;
        background: transparent !important;
        color: #333 !important;
        outline: none !important;
        box-shadow: none !important;
    }
    
    .search-input::placeholder {
        color: #999;
        opacity: 0.8;
    }
    
    .search-icon {
        position: absolute;
        left: 1.5rem;
        color: #666;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .search-clear-btn {
        position: absolute;
        right: 1.5rem;
        background: none;
        border: none;
        color: #999;
        cursor: pointer;
        padding: 0.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
    }
    
    .search-clear-btn:hover {
        color: #666;
        transform: scale(1.1);
    }
    
    .search-summary {
        background-color: #f8f9fa;
        border-radius: 1rem;
        padding: 1rem 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    
    .no-results-container {
        padding: 4rem 1rem;
        text-align: center;
    }
    
    .no-results-container i {
        color: #dee2e6;
        margin-bottom: 1.5rem;
    }
    
    @media (max-width: 768px) {
        .search-container {
            padding: 0.25rem 1rem;
        }
        
        .search-input {
            padding: 0.75rem 2.5rem 0.75rem 2rem !important;
            font-size: 1rem !important;
        }
        
        .search-icon {
            left: 1rem;
        }
        
        .search-clear-btn {
            right: 1rem;
        }
    }
`;
document.head.appendChild(searchStyles);

// Export functions for use in other files
export {
    fetchAndDisplayPitches,
    createPitchCard,
    clearSearch
};