// dashboard.js (inside js/ folder)

// Initialize dashboard
document.addEventListener('DOMContentLoaded', async () => {
  await dashboardAccess.initialize();

  // Handle logout
  document.getElementById('logoutBtn').addEventListener('click', (e) => {
      e.preventDefault();
      firebase.auth().signOut();
      window.location.href = 'index.html';
  });
});

// Update dashboard content based on user role
function updateDashboardContent() {
  const user = dashboardAccess.currentUser;
  if (!user) {
      window.location.href = 'login.html';
      return;
  }

  // Update role indicator
  const roleIndicator = document.getElementById('roleIndicator');
  roleIndicator.textContent = `${dashboardAccess.accessData.roles[user.role].displayName} Dashboard`;

  // Get permissions
  const permissions = dashboardAccess.getUserPermissions();
  const commonFeatures = dashboardAccess.getCommonFeatures();

  // Generate dashboard content
  const dashboardContent = document.getElementById('dashboardContent');
  let html = '';

  // Role-specific features
  for (const [section, data] of Object.entries(permissions)) {
      if (data.access) {
          html += `
              <div class="col-md-6 col-lg-4">
                  <div class="feature-card">
                      <h3>${section.replace('_', ' ').toUpperCase()}</h3>
                      <ul class="feature-list">
                          ${data.features.map(feature => `
                              <li>
                                  <i class="fas fa-check-circle"></i>
                                  ${feature.replace('_', ' ')}
                              </li>
                          `).join('')}
                      </ul>
                  </div>
              </div>
          `;
      }
  }

  // Common features
  for (const [section, data] of Object.entries(commonFeatures)) {
      html += `
          <div class="col-md-6 col-lg-4">
              <div class="feature-card">
                  <h3>${section.replace('_', ' ').toUpperCase()}</h3>
                  <ul class="feature-list">
                      ${data.features.map(feature => `
                          <li>
                              <i class="fas fa-check-circle"></i>
                              ${feature.replace('_', ' ')}
                          </li>
                      `).join('')}
                  </ul>
              </div>
          </div>
      `;
  }

  dashboardContent.innerHTML = html;
}

// Listen for authentication state changes
firebase.auth().onAuthStateChanged(async (user) => {
  if (user) {
      updateDashboardContent();
  } else {
      window.location.href = 'login.html';
  }
});
