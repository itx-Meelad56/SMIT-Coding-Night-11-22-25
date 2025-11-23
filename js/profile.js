// Profile functionality
function initProfile() {
  loadFromStorage();
  
  if (!currentUser) {
    window.location.href = "/index.html";
    return;
  }

  // Show user profile info
  document.getElementById("profileName").textContent = currentUser.name;
  document.getElementById("profileEmail").textContent = currentUser.email;

  // Show user posts
  displayUserPosts();
  updateProfileStats();
}

function displayUserPosts() {
  const userPosts = posts.filter((p) => p.authorId === currentUser.id);
  const userPostsFeed = document.getElementById("userPostsFeed");

  if (userPosts.length === 0) {
    userPostsFeed.innerHTML = '<div class="empty-state"><p>You haven\'t posted yet. <a href="home.html">Create one now!</a></p></div>';
    return;
  }

  userPostsFeed.innerHTML = userPosts.map(post => {
    const timeText = getTimeAgo(post.time);
    const imageHTML = post.image ? `<img src="${post.image}" alt="Post" class="post-image">` : "";

    return `
      <div class="post">
        <div class="post-header">
          <div class="post-meta">
            <div class="post-author">${post.author}</div>
            <div class="post-time">${timeText}</div>
          </div>
          <div class="post-actions">
            <button class="post-action-btn" onclick="editUserPost(${post.id})" title="Edit">✏️</button>
            <button class="post-action-btn" onclick="deleteUserPost(${post.id})" title="Delete">🗑️</button>
          </div>
        </div>
        <div class="post-content">
          <div class="post-text">${post.text}</div>
          ${imageHTML}
        </div>
        <div class="post-footer">
          <span class="like-count">❤️ ${post.likes} Likes</span>
        </div>
      </div>
    `;
  }).join('');
}

function updateProfileStats() {
  const userPosts = posts.filter((p) => p.authorId === currentUser.id);
  const userPostsCount = userPosts.length;
  const totalLikesCount = userPosts.reduce((sum, p) => sum + p.likes, 0);
  
  document.getElementById("userPosts").textContent = userPostsCount;
  document.getElementById("userLikes").textContent = totalLikesCount;
}

// Get time ago
function getTimeAgo(dateString) {
  const postTime = new Date(dateString);
  const now = new Date();
  const diff = now - postTime;
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return "just now";
  if (mins < 60) return mins + "m ago";
  if (hrs < 24) return hrs + "h ago";
  if (days < 7) return days + "d ago";
  return postTime.toLocaleDateString();
}

// Delete post
function deleteUserPost(postId) {
  if (confirm("Delete this post?")) {
    posts = posts.filter((p) => p.id !== postId);
    saveToStorage();
    displayUserPosts();
    updateProfileStats();
  }
}

// Edit post
function editUserPost(postId) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  const newText = prompt("Edit your post:", post.text);
  if (newText && newText.trim()) {
    post.text = newText.trim();
    saveToStorage();
    displayUserPosts();
  }
}

// Logout
function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    currentUser = null;
    saveToStorage();
    window.location.href = "/index.html";
  }
}

// Initialize profile when page loads
document.addEventListener('DOMContentLoaded', function() {
  initProfile();
  
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
  
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
});