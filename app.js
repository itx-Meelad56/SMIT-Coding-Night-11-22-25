// ========================================
// Mini Social Media App - SIMPLE & CLEAN
// ========================================

// === GLOBAL DATA ===
let users = []
let posts = []
let currentUser = null

// === DOM ELEMENTS ===
const loginForm = document.getElementById("loginForm")
const signupForm = document.getElementById("signupForm")
const toggleSignup = document.getElementById("toggleSignup")
const toggleLogin = document.getElementById("toggleLogin")
const logoutBtn = document.getElementById("logoutBtn")
const themeToggle = document.getElementById("themeToggle")
const authContainer = document.getElementById("authContainer")
const feedContainer = document.getElementById("feedContainer")
const postsFeed = document.getElementById("postsFeed")
const userGreeting = document.getElementById("userGreeting")
const searchInput = document.getElementById("searchInput")
const openCreateModal = document.getElementById("openCreateModal")
const closeCreateModal = document.getElementById("closeCreateModal")
const createModal = document.getElementById("createModal")
const createPostForm = document.getElementById("createPostForm")
const postText = document.getElementById("postText")
const postImage = document.getElementById("postImage")

// === INIT APP ===
function initApp() {
  loadFromStorage()
  applyTheme()
  setupEventListeners()

  if (currentUser) {
    showFeed()
  } else {
    showAuth()
  }
}

// === STORAGE - Load & Save ===
function loadFromStorage() {
  const saved = localStorage.getItem("socialApp")
  if (saved) {
    const data = JSON.parse(saved)
    users = data.users || []
    posts = data.posts || []
    currentUser = data.currentUser || null
  }
}

function saveToStorage() {
  const data = {
    users: users,
    posts: posts,
    currentUser: currentUser,
  }
  localStorage.setItem("socialApp", JSON.stringify(data))
}

function saveToDarkMode(isDark) {
  localStorage.setItem("darkMode", isDark)
}

// === AUTH - Login & Signup ===
function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value.trim()
  const password = document.getElementById("loginPassword").value.trim()

  if (!email || !password) {
    alert("Please fill all fields")
    return
  }

  const user = users.find((u) => u.email === email && u.password === password)

  if (user) {
    currentUser = user
    saveToStorage()
    showFeed()
    loginForm.reset()
  } else {
    alert("Email or password incorrect")
  }
}

function handleSignup(e) {
  e.preventDefault()

  const name = document.getElementById("signupName").value.trim()
  const email = document.getElementById("signupEmail").value.trim()
  const password = document.getElementById("signupPassword").value.trim()

  if (!name || !email || !password) {
    alert("Please fill all fields")
    return
  }

  if (password.length < 4) {
    alert("Password must be at least 4 characters")
    return
  }

  const exists = users.find((u) => u.email === email)
  if (exists) {
    alert("This email already registered")
    return
  }

  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
  }

  users.push(newUser)
  currentUser = newUser
  saveToStorage()
  showFeed()
  signupForm.reset()
}

function handleLogout() {
  if (confirm("Are you sure you want to logout?")) {
    currentUser = null
    saveToStorage()
    showAuth()
  }
}

function toggleAuthForm() {
  document.getElementById("loginBox").classList.toggle("active")
  document.getElementById("signupBox").classList.toggle("active")
}

// === UI - Show/Hide Screens ===
function showAuth() {
  authContainer.classList.remove("hidden")
  feedContainer.classList.add("hidden")
}

function showFeed() {
  authContainer.classList.add("hidden")
  feedContainer.classList.remove("hidden")
  userGreeting.textContent = "Welcome, " + currentUser.name + "! 👋"
  displayPosts(posts)
  updateStats()
}

// === POSTS - Create, Delete, Edit ===
function createPost(e) {
  e.preventDefault()

  const text = postText.value.trim()
  const image = postImage.value.trim()

  if (!text) {
    alert("Please write something!")
    return
  }

  const newPost = {
    id: Date.now(),
    author: currentUser.name,
    authorId: currentUser.id,
    text: text,
    image: image || null,
    time: new Date().toISOString(),
    likes: 0,
    likedBy: [],
  }

  posts.unshift(newPost)
  saveToStorage()
  displayPosts(posts)
  updateStats()
  createModal.classList.remove("active")
  createPostForm.reset()
}

function deletePost(postId) {
  if (confirm("Delete this post?")) {
    posts = posts.filter((p) => p.id !== postId)
    saveToStorage()
    displayPosts(posts)
    updateStats()
  }
}

function editPost(postId) {
  const post = posts.find((p) => p.id === postId)
  if (!post) return

  const newText = prompt("Edit your post:", post.text)
  if (newText && newText.trim()) {
    post.text = newText.trim()
    saveToStorage()
    displayPosts(posts)
  }
}

function toggleLike(postId) {
  const post = posts.find((p) => p.id === postId)
  if (!post) return

  const userLiked = post.likedBy.includes(currentUser.id)

  if (userLiked) {
    post.likedBy = post.likedBy.filter((id) => id !== currentUser.id)
    post.likes = post.likes - 1
  } else {
    post.likedBy.push(currentUser.id)
    post.likes = post.likes + 1
  }

  saveToStorage()
  displayPosts(posts)
  updateStats()
}

// === DISPLAY - Posts List ===
function displayPosts(postsToShow) {
  const searchTerm = searchInput.value.toLowerCase()

  const filtered = postsToShow.filter((post) => {
    const textMatch = post.text.toLowerCase().includes(searchTerm)
    const authorMatch = post.author.toLowerCase().includes(searchTerm)
    return textMatch || authorMatch
  })

  if (filtered.length === 0) {
    postsFeed.innerHTML = '<div class="empty-state"><p>No posts yet. Be the first to share! 🚀</p></div>'
    return
  }

  let html = ""
  for (let i = 0; i < filtered.length; i++) {
    const post = filtered[i]
    const timeText = getTimeAgo(post.time)
    const isOwner = post.authorId === currentUser.id
    const userLiked = post.likedBy.includes(currentUser.id)
    const likeIcon = userLiked ? "❤️" : "🤍"
    const likeClass = userLiked ? "liked" : ""

    const imageHTML = post.image ? '<img src="' + post.image + '" alt="Post" class="post-image">' : ""

    html += `
      <div class="post">
        <div class="post-header">
          <div class="post-meta">
            <div class="post-author">${post.author}</div>
            <div class="post-time">${timeText}</div>
          </div>
          <div class="post-actions">
            ${isOwner ? '<button class="post-action-btn" onclick="editPost(' + post.id + ')" title="Edit">✏️</button>' : ""}
            ${isOwner ? '<button class="post-action-btn" onclick="deletePost(' + post.id + ')" title="Delete">🗑️</button>' : ""}
          </div>
        </div>
        <div class="post-content">
          <div class="post-text">${post.text}</div>
          ${imageHTML}
        </div>
        <div class="post-footer">
          <button class="like-button ${likeClass}" onclick="toggleLike(${post.id})">
            ${likeIcon} ${post.likes} Likes
          </button>
        </div>
      </div>
    `
  }

  postsFeed.innerHTML = html
}

function getTimeAgo(dateString) {
  const postTime = new Date(dateString)
  const now = new Date()
  const diff = now - postTime
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return "just now"
  if (mins < 60) return mins + "m ago"
  if (hrs < 24) return hrs + "h ago"
  if (days < 7) return days + "d ago"
  return postTime.toLocaleDateString()
}

// === STATS ===
function updateStats() {
  const totalPosts = posts.filter((p) => p.authorId === currentUser.id).length
  const totalLikes = posts.filter((p) => p.authorId === currentUser.id).reduce((sum, p) => sum + p.likes, 0)

  document.getElementById("totalPosts").textContent = totalPosts
  document.getElementById("totalLikes").textContent = totalLikes
}

// === SEARCH & SORT ===
function handleSearch() {
  displayPosts(posts)
}

function handleSort(filterType) {
  const sorted = [...posts]

  if (filterType === "oldest") {
    sorted.reverse()
  } else if (filterType === "popular") {
    sorted.sort((a, b) => b.likes - a.likes)
  }

  displayPosts(sorted)
}

// === THEME ===
function toggleTheme() {
  const isDark = document.body.classList.contains("light-mode")

  if (isDark) {
    document.body.classList.remove("light-mode")
    document.querySelector(".theme-icon").textContent = "🌙"
    saveToDarkMode(false)
  } else {
    document.body.classList.add("light-mode")
    document.querySelector(".theme-icon").textContent = "☀️"
    saveToDarkMode(true)
  }
}

function applyTheme() {
  const isDark = localStorage.getItem("darkMode")
  if (isDark === "true") {
    document.body.classList.add("light-mode")
    document.querySelector(".theme-icon").textContent = "☀️"
  }
}

// === MODALS ===
function openCreatePostModal() {
  createModal.classList.add("active")
}

function closeCreatePostModal() {
  createModal.classList.remove("active")
  createPostForm.reset()
}

// === EVENT LISTENERS ===
function setupEventListeners() {
  // Auth
  loginForm.addEventListener("submit", handleLogin)
  signupForm.addEventListener("submit", handleSignup)
  toggleSignup.addEventListener("click", toggleAuthForm)
  toggleLogin.addEventListener("click", toggleAuthForm)

  // Logout & Theme
  logoutBtn.addEventListener("click", handleLogout)
  themeToggle.addEventListener("click", toggleTheme)

  // Posts
  openCreateModal.addEventListener("click", openCreatePostModal)
  closeCreateModal.addEventListener("click", closeCreatePostModal)
  document.getElementById("cancelCreatePost").addEventListener("click", closeCreatePostModal)
  createPostForm.addEventListener("submit", createPost)

  // Search
  searchInput.addEventListener("input", handleSearch)

  // Sort buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"))
      e.target.classList.add("active")
      handleSort(e.target.dataset.filter)
    })
  })

  // Close modal when clicking outside
  createModal.addEventListener("click", (e) => {
    if (e.target === createModal) {
      closeCreatePostModal()
    }
  })

  // Emoji selection for posts (bonus)
  document.querySelectorAll(".emoji-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      document.querySelectorAll(".emoji-btn").forEach((b) => b.classList.remove("selected"))
      btn.classList.add("selected")
      document.getElementById("selectedEmoji").textContent = btn.dataset.emoji
    })
  })
}

// === START APP ===
initApp()

