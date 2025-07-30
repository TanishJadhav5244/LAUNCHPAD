// Sample data for pitch details
const pitchDetails = {
    1: {
        title: "EcoSmart - Sustainable Living Solutions",
        description: "Revolutionizing sustainable living with smart home technology that reduces energy consumption. Our innovative platform integrates IoT devices, machine learning algorithms, and user behavior analytics to optimize energy usage in residential and commercial buildings.",
        videoUrl: "https://www.youtube.com/embed/sample1",
        views: 1250,
        likes: 89,
        comments: 23,
        rating: 4.5,
        team: [
            {
                name: "Sarah Johnson",
                role: "CEO & Founder",
                image: "https://via.placeholder.com/50"
            },
            {
                name: "Michael Chen",
                role: "CTO",
                image: "https://via.placeholder.com/50"
            },
            {
                name: "Emily Rodriguez",
                role: "Head of Product",
                image: "https://via.placeholder.com/50"
            }
        ],
        feedback: [
            {
                user: "Dr. Emily Chen",
                role: "Technology Mentor",
                rating: 5,
                comment: "Excellent pitch! The technology stack is impressive and the market potential is significant. Consider adding more details about your go-to-market strategy.",
                date: "2024-03-15"
            },
            {
                user: "Mark Thompson",
                role: "Sustainability Expert",
                rating: 4,
                comment: "Strong focus on environmental impact. Would like to see more data on energy savings projections.",
                date: "2024-03-14"
            }
        ],
        relatedPitches: [2, 5]
    }
};

// DOM Elements
const pitchTitle = document.getElementById('pitchTitle');
const pitchDescription = document.getElementById('pitchDescription');
const pitchVideo = document.getElementById('pitchVideo');
const viewCount = document.getElementById('viewCount');
const likeCount = document.getElementById('likeCount');
const commentCount = document.getElementById('commentCount');
const rating = document.getElementById('rating');
const likeButton = document.getElementById('likeButton');
const feedbackList = document.getElementById('feedbackList');
const teamMembers = document.getElementById('teamMembers');
const relatedPitches = document.getElementById('relatedPitches');
const feedbackForm = document.getElementById('feedbackForm');
const ratingStars = document.querySelectorAll('.rating i');

// Get pitch ID from URL
const urlParams = new URLSearchParams(window.location.search);
const pitchId = parseInt(urlParams.get('id')) || 1;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadPitchDetails();
    setupEventListeners();
});

// Load pitch details
function loadPitchDetails() {
    const pitch = pitchDetails[pitchId];
    if (!pitch) return;

    // Update main content
    pitchTitle.textContent = pitch.title;
    pitchDescription.textContent = pitch.description;
    pitchVideo.src = pitch.videoUrl;
    viewCount.textContent = formatNumber(pitch.views);
    likeCount.textContent = formatNumber(pitch.likes);
    commentCount.textContent = formatNumber(pitch.comments);
    rating.textContent = pitch.rating.toFixed(1);

    // Display team members
    teamMembers.innerHTML = pitch.team.map(member => `
        <div class="d-flex align-items-center mb-3">
            <img src="${member.image}" alt="${member.name}" class="rounded-circle me-2" width="50">
            <div>
                <h6 class="mb-0">${member.name}</h6>
                <small class="text-muted">${member.role}</small>
            </div>
        </div>
    `).join('');

    // Display feedback
    feedbackList.innerHTML = pitch.feedback.map(feedback => `
        <div class="card mb-3">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <div>
                        <h6 class="mb-0">${feedback.user}</h6>
                        <small class="text-muted">${feedback.role}</small>
                    </div>
                    <div class="rating">
                        ${Array(5).fill().map((_, i) => `
                            <i class="fas fa-star ${i < feedback.rating ? 'text-warning' : 'text-muted'}"></i>
                        `).join('')}
                    </div>
                </div>
                <p class="card-text">${feedback.comment}</p>
                <small class="text-muted">${formatDate(feedback.date)}</small>
            </div>
        </div>
    `).join('');

    // Display related pitches
    relatedPitches.innerHTML = pitch.relatedPitches.map(id => {
        const relatedPitch = allPitches.find(p => p.id === id);
        return `
            <div class="card mb-2">
                <div class="card-body">
                    <h6 class="card-title">${relatedPitch.title}</h6>
                    <p class="card-text small">${relatedPitch.description.substring(0, 100)}...</p>
                    <a href="pitch-detail.html?id=${relatedPitch.id}" class="btn btn-sm btn-outline-primary">View Details</a>
                </div>
            </div>
        `;
    }).join('');
}

// Setup event listeners
function setupEventListeners() {
    // Like button
    if (likeButton) {
        likeButton.addEventListener('click', handleLike);
    }

    // Rating stars
    ratingStars.forEach(star => {
        star.addEventListener('click', () => handleStarClick(star));
        star.addEventListener('mouseover', () => handleStarHover(star));
        star.addEventListener('mouseout', handleStarHoverOut);
    });

    // Feedback form
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', handleFeedbackSubmit);
    }
}

// Handle like button click
function handleLike() {
    const currentLikes = parseInt(likeCount.textContent);
    likeCount.textContent = formatNumber(currentLikes + 1);
    likeButton.classList.toggle('btn-outline-primary');
    likeButton.classList.toggle('btn-primary');
}

// Handle star rating click
function handleStarClick(star) {
    const rating = parseInt(star.dataset.rating);
    ratingStars.forEach(s => {
        s.classList.toggle('text-warning', parseInt(s.dataset.rating) <= rating);
    });
}

// Handle star hover
function handleStarHover(star) {
    const rating = parseInt(star.dataset.rating);
    ratingStars.forEach(s => {
        s.classList.toggle('text-warning', parseInt(s.dataset.rating) <= rating);
    });
}

// Handle star hover out
function handleStarHoverOut() {
    const selectedRating = document.querySelector('.rating i.text-warning:last-child');
    if (selectedRating) {
        const rating = parseInt(selectedRating.dataset.rating);
        ratingStars.forEach(s => {
            s.classList.toggle('text-warning', parseInt(s.dataset.rating) <= rating);
        });
    }
}

// Handle feedback submission
function handleFeedbackSubmit(e) {
    e.preventDefault();
    const feedbackText = document.getElementById('feedbackText').value;
    const selectedRating = document.querySelectorAll('.rating i.text-warning').length;

    // In a real application, this would send data to a server
    console.log('Feedback submitted:', { rating: selectedRating, text: feedbackText });

    // Add feedback to the list
    const newFeedback = {
        user: "Current User",
        role: "Mentor",
        rating: selectedRating,
        comment: feedbackText,
        date: new Date().toISOString().split('T')[0]
    };

    // Update the feedback list
    const feedbackCard = document.createElement('div');
    feedbackCard.className = 'card mb-3';
    feedbackCard.innerHTML = `
        <div class="card-body">
            <div class="d-flex justify-content-between align-items-center mb-2">
                <div>
                    <h6 class="mb-0">${newFeedback.user}</h6>
                    <small class="text-muted">${newFeedback.role}</small>
                </div>
                <div class="rating">
                    ${Array(5).fill().map((_, i) => `
                        <i class="fas fa-star ${i < newFeedback.rating ? 'text-warning' : 'text-muted'}"></i>
                    `).join('')}
                </div>
            </div>
            <p class="card-text">${newFeedback.comment}</p>
            <small class="text-muted">${formatDate(newFeedback.date)}</small>
        </div>
    `;

    feedbackList.insertBefore(feedbackCard, feedbackList.firstChild);

    // Reset form and close modal
    feedbackForm.reset();
    ratingStars.forEach(s => s.classList.remove('text-warning'));
    const modal = bootstrap.Modal.getInstance(document.getElementById('feedbackModal'));
    modal.hide();

    // Update stats
    commentCount.textContent = formatNumber(parseInt(commentCount.textContent) + 1);
}

// Format date
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}