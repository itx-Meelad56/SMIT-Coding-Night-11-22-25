
function initFeed() {
  loadFromStorage();
  
  if (!currentUser) {
    window.location.href = "../index.html";
    return;
  }

  
  document.getElementById("userGreeting").textContent = `Welcome, ${currentUser.name}! 👋`;
  displayPosts(posts);
  updateStats();
  setupRealTimeFeatures();
}


function setupRealTimeFeatures() {

  setInterval(() => {
    if (document.visibilityState === 'visible') {
      displayPosts(posts);
    }
  }, 30000);
}


function handleCreatePost(e) {
  e.preventDefault();

  const text = document.getElementById("postText").value.trim();
  const image = document.getElementById("postImage").value.trim();

  if (!text) {
    showToast("Please write something!", "error");
    return;
  }

  const newPost = {
    id: Date.now(),
    author: currentUser.name,
    authorId: currentUser.id,
    authorAvatar: currentUser.avatar || "👤",
    text: text,
    image: image || null,
    time: new Date().toISOString(),
    likes: 0,
    likedBy: [],
    comments: [],
    shares: 0
  };

  posts.unshift(newPost);
  saveToStorage();
  displayPosts(posts);
  updateStats();
  closeCreatePostModal();
  showToast("Post created successfully! 🚀", "success");
}


function displayPosts(postsToShow) {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const filtered = postsToShow.filter((post) => {
    const textMatch = post.text.toLowerCase().includes(searchTerm);
    const authorMatch = post.author.toLowerCase().includes(searchTerm);
    return textMatch || authorMatch;
  });

  const postsFeed = document.getElementById("postsFeed");

  if (filtered.length === 0) {
    postsFeed.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📝</div>
        <p>No posts found</p>
        <p class="empty-subtitle">Be the first to share something amazing! 🚀</p>
      </div>
    `;
    return;
  }

  postsFeed.innerHTML = filtered.map((post, index) => {
    const timeText = getTimeAgo(post.time);
    const isOwner = post.authorId === currentUser.id;
    const userLiked = post.likedBy.includes(currentUser.id);
    const likeIcon = userLiked ? "❤️" : "🤍";
    const imageHTML = post.image ? `
      <div class="post-image-container">
        <img src="${post.image}" alt="Post" class="post-image" onclick="openImageModal('${post.image}')">
      </div>
    ` : "";
    
    const commentsHTML = post.comments && post.comments.length > 0 ? `
      <div class="post-comments-preview">
        <div class="comment-count">💬 ${post.comments.length} comments</div>
        ${post.comments.slice(0, 2).map(comment => `
          <div class="comment-preview">
            <span class="comment-author">${comment.author}:</span>
            <span class="comment-text">${comment.text}</span>
          </div>
        `).join('')}
        ${post.comments.length > 2 ? `<div class="view-all-comments">View all ${post.comments.length} comments</div>` : ''}
      </div>
    ` : '';

    return `
      <div class="post" style="animation-delay: ${index * 0.1}s">
        <div class="post-header">
          <div class="post-author-info">
            <div class="post-avatar">${post.authorAvatar}</div>
            <div class="post-meta">
              <div class="post-author">${post.author}</div>
              <div class="post-time">${timeText}</div>
            </div>
          </div>
          ${isOwner ? `
          <div class="post-actions">
            <button class="post-action-btn" onclick="editPost(${post.id})" title="Edit">✏️</button>
            <button class="post-action-btn" onclick="deletePost(${post.id})" title="Delete">🗑️</button>
          </div>
          ` : ''}
        </div>
        <div class="post-content">
          <div class="post-text">${post.text}</div>
          ${imageHTML}
        </div>
        <div class="post-stats">
          <span class="post-stat">❤️ ${post.likes} likes</span>
          <span class="post-stat>💬 ${post.comments ? post.comments.length : 0} comments</span>
          <span class="post-stat">🔄 ${post.shares} shares</span>
        </div>
        <div class="post-footer">
          <button class="post-action-btn ${userLiked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
            ${likeIcon} Like
          </button>
          <button class="post-action-btn" onclick="focusComment(${post.id})">
            💬 Comment
          </button>
          <button class="post-action-btn" onclick="sharePost(${post.id})">
            🔄 Share
          </button>
        </div>
        ${commentsHTML}
        <div class="comment-input-container">
          <input type="text"  class="comment-input" id="commentInput-${post.id}" placeholder="Write a comment..." onkeypress="handleCommentKeypress(event, ${post.id})">
        </div>
      </div>
    `;
  }).join('');
}


function addComment(postId) {
  const commentInput = document.getElementById(`commentInput-${postId}`);
  const text = commentInput.value.trim();
  
  if (!text) return;
  
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  
  if (!post.comments) post.comments = [];
  
  const newComment = {
    id: Date.now(),
    author: currentUser.name,
    authorId: currentUser.id,
    text: text,
    time: new Date().toISOString()
  };
  
  post.comments.unshift(newComment);
  saveToStorage();
  displayPosts(posts);
 
  if (post.authorId !== currentUser.id) {
    addNotification('comment', `${currentUser.name} commented on your post`, postId);
  }
  
  commentInput.value = '';
  showToast("Comment added! 💬", "success");
}

function handleCommentKeypress(e, postId) {
  if (e.key === 'Enter') {
    addComment(postId);
  }
}

function focusComment(postId) {
  const commentInput = document.getElementById(`commentInput-${postId}`);
  commentInput.focus();
}


function sharePost(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  
  post.shares = (post.shares || 0) + 1;
  saveToStorage();
  displayPosts(posts);
  
  showToast("Post shared! 🔄", "success");
  
 
  if (post.authorId !== currentUser.id) {
    addNotification('share', `${currentUser.name} shared your post`, postId);
  }
}


function deletePost(postId) {
  if (confirm("Are you sure you want to delete this post?")) {
    posts = posts.filter((p) => p.id !== postId);
    saveToStorage();
    displayPosts(posts);
    updateStats();
    showToast("Post deleted successfully", "info");
  }
}


function editPost(postId) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  const newText = prompt("Edit your post:", post.text);
  if (newText && newText.trim()) {
    post.text = newText.trim();
    saveToStorage();
    displayPosts(posts);
    showToast("Post updated successfully! ✏️", "success");
  }
}


function toggleLike(postId) {
  const post = posts.find((p) => p.id === postId);
  if (!post) return;

  const userLiked = post.likedBy.includes(currentUser.id);

  if (userLiked) {
    post.likedBy = post.likedBy.filter((id) => id !== currentUser.id);
    post.likes--;
  } else {
    post.likedBy.push(currentUser.id);
    post.likes++;
   
    if (post.authorId !== currentUser.id) {
      addNotification('like', `${currentUser.name} liked your post`, postId);
    }
  }

  saveToStorage();
  displayPosts(posts);
  updateStats();
}


function openImageModal(imageUrl) {
  const modal = document.createElement('div');
  modal.className = 'image-modal active';
  modal.innerHTML = `
    <div class="image-modal-content">
      <button class="close-image-modal">&times;</button>
      <img src="${imageUrl}" alt="Full size" class="full-image">
    </div>
  `;
  
  document.body.appendChild(modal);
  
  modal.querySelector('.close-image-modal').addEventListener('click', () => {
    modal.remove();
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

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


function updateStats() {
  const userPosts = posts.filter((p) => p.authorId === currentUser.id);
  const totalPosts = userPosts.length;
  const totalLikes = userPosts.reduce((sum, p) => sum + p.likes, 0);
  const totalComments = userPosts.reduce((sum, p) => sum + (p.comments ? p.comments.length : 0), 0);

  document.getElementById("totalPosts").textContent = totalPosts;
  document.getElementById("totalLikes").textContent = totalLikes;
  

  const totalCommentsElem = document.getElementById("totalComments");
  if (totalCommentsElem) {
    totalCommentsElem.textContent = totalComments;
  }
}

let searchTimeout;
function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    displayPosts(posts);
  }, 300);
}


function handleSort(filterType) {
  const sorted = [...posts];

  if (filterType === "oldest") {
    sorted.reverse();
  } else if (filterType === "popular") {
    sorted.sort((a, b) => b.likes - a.likes);
  } else if (filterType === "commented") {
    sorted.sort((a, b) => (b.comments ? b.comments.length : 0) - (a.comments ? a.comments.length : 0));
  }

  displayPosts(sorted);
}

function openCreatePostModal() {
  document.getElementById("createModal").classList.add("active");
}

function closeCreatePostModal() {
  document.getElementById("createModal").classList.remove("active");
  document.getElementById("createPostForm").reset();
}


function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    currentUser = null;
    saveToStorage();
    showToast("Logged out successfully", "info");
      window.location.href = "../index.html";
  }
}


document.addEventListener('DOMContentLoaded', function() {
  initFeed();
  

  const createPostForm = document.getElementById("createPostForm");
  if (createPostForm) {
    createPostForm.addEventListener("submit", handleCreatePost);
  }
  
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch);
  }
  
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
  
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
  
  const openCreateModal = document.getElementById("openCreateModal");
  if (openCreateModal) {
    openCreateModal.addEventListener("click", openCreatePostModal);
  }
  
  const closeCreateModal = document.getElementById("closeCreateModal");
  if (closeCreateModal) {
    closeCreateModal.addEventListener("click", closeCreatePostModal);
  }
  
  const cancelCreatePost = document.getElementById("cancelCreatePost");
  if (cancelCreatePost) {
    cancelCreatePost.addEventListener("click", closeCreatePostModal);
  }

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      e.target.classList.add("active");
      handleSort(e.target.dataset.filter);
    });
  });
  
  const createModal = document.getElementById("createModal");
  if (createModal) {
    createModal.addEventListener("click", (e) => {
      if (e.target === createModal) {
        closeCreatePostModal();
      }
    });
  }
  

  const notificationBtn = document.getElementById('notificationBtn');
  if (notificationBtn) {
    notificationBtn.addEventListener('click', toggleNotifications);
  }
});