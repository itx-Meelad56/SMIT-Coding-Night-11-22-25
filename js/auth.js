// Auth functionality
function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  if (!email || !password) {
    alert("Please fill all fields");  
    return;
  }

  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    currentUser = user;
    saveToStorage();
    showToast(`Welcome back, ${user.name}! 👋`, "success"); 
    setTimeout(() => {
      window.location.href = "/pages/home.html";
    }, 1500);
  } else {
    alert("Email or password incorrect");  
  }
}

function handleSignup(e) {
  e.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  if (!name || !email || !password) {
    alert("Please fill all fields");  
    return;
  }

  if (password.length < 4) {
    alert("Password must be at least 4 characters");  
    return;
  }

  const exists = users.find((u) => u.email === email);
  if (exists) {
    alert("This email already registered");  
    return;
  }

  const newUser = {
    id: Date.now(),
    name: name,
    email: email,
    password: password,
    avatar: "👤",
    bio: "Hey there! I'm using Social Vibes!",
    joinDate: new Date().toISOString()
  };

  users.push(newUser);
  currentUser = newUser;
  saveToStorage();
  showToast(`Account created successfully! 🎉`, "success");
  setTimeout(() => {
    window.location.href = "/pages/home.html";
  }, 1500);
}


function showToast(message, type = "success") {
  
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-message">${message}</span>
      <button class="toast-close">&times;</button>
    </div>
  `;

  document.body.appendChild(toast);


  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  
  setTimeout(() => {
    hideToast(toast);
  }, 3000);


  toast.querySelector('.toast-close').addEventListener('click', () => {
    hideToast(toast);
  });
}

function hideToast(toast) {
  toast.classList.remove('show');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 300);
}

// Event listeners for auth pages
document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const themeToggle = document.getElementById("themeToggle");
  
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
  
  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup);
  }
  
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
});