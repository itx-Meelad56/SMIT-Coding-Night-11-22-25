
let users = JSON.parse(localStorage.getItem("users")) || [];
let posts = JSON.parse(localStorage.getItem("posts")) || [];
let currentUser = JSON.parse(localStorage.getItem("currentUser")) || null;
let notifications = JSON.parse(localStorage.getItem("notifications")) || [];


function loadFromStorage() {
  const savedUsers = localStorage.getItem("users");
  const savedPosts = localStorage.getItem("posts");
  const savedCurrentUser = localStorage.getItem("currentUser");
  const savedNotifications = localStorage.getItem("notifications");

  if (savedUsers) users = JSON.parse(savedUsers);
  if (savedPosts) posts = JSON.parse(savedPosts);
  if (savedCurrentUser) currentUser = JSON.parse(savedCurrentUser);
  if (savedNotifications) notifications = JSON.parse(savedNotifications);
}


function saveToStorage() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("posts", JSON.stringify(posts));
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  localStorage.setItem("notifications", JSON.stringify(notifications));
}


function getTheme() {
  return localStorage.getItem("darkMode") === "true";
}

function saveTheme(isDark) {
  localStorage.setItem("darkMode", isDark);
}

function applyTheme() {
  const themeIcon = document.querySelector(".theme-icon");
  if (getTheme()) {
    document.body.classList.add("light-mode");
    if (themeIcon) themeIcon.textContent = "☀️";
  } else {
    document.body.classList.remove("light-mode");
    if (themeIcon) themeIcon.textContent = "🌙";
  }
}

function toggleTheme() {
  const isLight = document.body.classList.contains("light-mode");
  if (isLight) {
    document.body.classList.remove("light-mode");
    document.querySelector(".theme-icon").textContent = "🌙";
    saveTheme(false);
  } else {
    document.body.classList.add("light-mode");
    document.querySelector(".theme-icon").textContent = "☀️";
    saveTheme(true);
  }
}


function addNotification(type, message, postId = null) {
  const notification = {
    id: Date.now(),
    type: type,
    message: message,
    postId: postId,
    time: new Date().toISOString(),
    read: false
  };
  notifications.unshift(notification);
  saveToStorage();
  updateNotificationBadge();
}

function updateNotificationBadge() {
  const badge = document.getElementById('notificationBadge');
  const unreadCount = notifications.filter(n => !n.read).length;
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? 'flex' : 'none';
  }
}

function markNotificationsAsRead() {
  notifications.forEach(n => n.read = true);
  saveToStorage();
  updateNotificationBadge();
}


function showToast(message, type = "info") {
  
  const existingToast = document.querySelector('.toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    </div>
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('show'), 100);
  setTimeout(() => hideToast(toast), 3000);

  toast.querySelector('.toast-close').addEventListener('click', () => hideToast(toast));
}

function hideToast(toast) {
  toast.classList.remove('show');
  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 300);
}


document.addEventListener('DOMContentLoaded', function() {
  loadFromStorage();
  applyTheme();
  updateNotificationBadge();

  
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);
});
