// State management
let currentUser = null;
let isGuestMode = false;
let cart = [];
let users = [];

// DOM elements
const loginModal = document.getElementById("login-modal");
const signinModal = document.getElementById("signin-modal");
const authLink = document.getElementById("auth-link");
const searchInput = document.getElementById("search-input");
const searchBtn = document.getElementById("search-btn");

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  loadUserData();
  updateNavigation();
  loadCart();
  setupEventListeners();
  updateCartDisplay();
});

// Setup event listeners
function setupEventListeners() {
  // Modal controls
  const closeButtons = document.querySelectorAll(".close");
  closeButtons.forEach((btn) => {
    btn.addEventListener("click", closeModals);
  });

  // Auth links
  if (authLink) {
    authLink.addEventListener("click", handleAuthClick);
  }

  // Modal navigation
  const toSignin = document.getElementById("to-signin");
  const sudahPunyaAkun = document.getElementById("sudah-punya-akun");
  const masukTanpaAkun = document.getElementById("masuk-tanpa-akun");
  const masukTanpaAkunSignin = document.getElementById(
    "masuk-tanpa-akun-signin"
  );

  if (toSignin) toSignin.addEventListener("click", showSigninModal);
  if (sudahPunyaAkun) sudahPunyaAkun.addEventListener("click", showLoginModal);
  if (masukTanpaAkun) masukTanpaAkun.addEventListener("click", enterGuestMode);
  if (masukTanpaAkunSignin)
    masukTanpaAkunSignin.addEventListener("click", enterGuestMode);

  // Forms
  const loginForm = document.getElementById("login-form");
  const signinForm = document.getElementById("signin-form");

  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (signinForm) signinForm.addEventListener("submit", handleSignin);

  // Search
  if (searchBtn) searchBtn.addEventListener("click", handleSearch);
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        handleSearch();
      }
    });
  }

  // Add to cart buttons
  const addToCartButtons = document.querySelectorAll(".add-to-cart");
  addToCartButtons.forEach((btn) => {
    btn.addEventListener("click", handleAddToCart);
  });

  // Filter buttons
  const filterButtons = document.querySelectorAll(".filter-btn");
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", handleFilter);
  });

  // Close modal when clicking outside
  window.addEventListener("click", function (e) {
    if (e.target === loginModal || e.target === signinModal) {
      closeModals();
    }
  });
}

// Authentication functions
function handleAuthClick(e) {
  e.preventDefault();
  if (currentUser || isGuestMode) {
    logout();
  } else {
    showLoginModal();
  }
}

function showLoginModal() {
  closeModals();
  if (loginModal) loginModal.style.display = "block";
}

function showSigninModal() {
  closeModals();
  if (signinModal) signinModal.style.display = "block";
}

function closeModals() {
  if (loginModal) loginModal.style.display = "none";
  if (signinModal) signinModal.style.display = "none";
}

function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById("login-username").value;
  const password = document.getElementById("login-password").value;

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    currentUser = user;
    isGuestMode = false;
    saveUserData();
    updateNavigation();
    closeModals();
    alert("Login berhasil!");
  } else {
    alert("Username atau password salah!");
  }
}

function handleSignin(e) {
  e.preventDefault();
  const username = document.getElementById("signin-username").value;
  const password = document.getElementById("signin-password").value;

  // Check if user already exists
  if (users.find((u) => u.username === username)) {
    alert("Username sudah digunakan!");
    return;
  }

  const newUser = { username, password };
  users.push(newUser);
  currentUser = newUser;
  isGuestMode = false;
  saveUserData();
  updateNavigation();
  closeModals();
  alert("Akun berhasil dibuat dan Anda sudah login!");
}

function enterGuestMode() {
  currentUser = null;
  isGuestMode = true;
  updateNavigation();
  closeModals();
  alert("Anda masuk sebagai tamu");
}

function logout() {
  currentUser = null;
  isGuestMode = false;
  cart = [];
  saveUserData();
  saveCart();
  updateNavigation();
  updateCartDisplay();
  alert("Anda telah logout");
}

function updateNavigation() {
  if (authLink) {
    if (currentUser) {
      authLink.textContent = "Logout";
    } else if (isGuestMode) {
      authLink.textContent = "Login";
    } else {
      authLink.textContent = "Login";
    }
  }
}

// Search functionality
function handleSearch() {
  const query = searchInput.value.toLowerCase().trim();

  if (!query) {
    alert("Masukkan kata kunci pencarian");
    return;
  }

  // If on products page, filter products
  if (window.location.pathname.includes("produk.html")) {
    filterProducts(query);
  } else {
    // Redirect to products page with search
    window.location.href = `produk.html?search=${encodeURIComponent(query)}`;
  }
}

function filterProducts(query) {
  const productCards = document.querySelectorAll(".product-card");
  let hasResults = false;

  productCards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    const description = card.querySelector("p").textContent.toLowerCase();

    if (title.includes(query) || description.includes(query)) {
      card.style.display = "block";
      hasResults = true;
    } else {
      card.style.display = "none";
    }
  });

  // Show search results header
  showSearchResults(query, hasResults);
}

function showSearchResults(query, hasResults) {
  // Remove existing search results
  const existingResults = document.querySelector(".search-results");
  if (existingResults) {
    existingResults.remove();
  }

  const resultsDiv = document.createElement("div");
  resultsDiv.className = "search-results";

  if (hasResults) {
    resultsDiv.innerHTML = `<h2>Hasil pencarian untuk: "${query}"</h2>`;
  } else {
    resultsDiv.innerHTML = `
            <h2>Hasil pencarian untuk: "${query}"</h2>
            <div class="no-results">Tidak ada produk yang ditemukan</div>
        `;
  }

  const productsGrid = document.getElementById("products-grid");
  if (productsGrid) {
    productsGrid.parentNode.insertBefore(resultsDiv, productsGrid);
  }
}

// Filter functionality
function handleFilter(e) {
  const filterValue = e.target.dataset.filter;
  const productCards = document.querySelectorAll(".product-card");

  // Update active filter button
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  e.target.classList.add("active");

  // Filter products
  productCards.forEach((card) => {
    if (filterValue === "all" || card.dataset.category === filterValue) {
      card.style.display = "block";
    } else {
      card.style.display = "none";
    }
  });
}

// Cart functionality
function handleAddToCart(e) {
  // Check if user is logged in or in guest mode
  if (!currentUser && !isGuestMode) {
    alert(
      "Silakan login terlebih dahulu untuk menambahkan produk ke keranjang"
    );
    showLoginModal();
    return;
  }

  const productName = e.target.dataset.product;
  const productPrice = parseInt(e.target.dataset.price);

  // Check if item already in cart
  const existingItem = cart.find((item) => item.name === productName);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      name: productName,
      price: productPrice,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
    });
  }

  saveCart();
  updateCartDisplay();
  alert(`${productName} ditambahkan ke keranjang!`);
}

function updateCartDisplay() {
  const cartContainer = document.getElementById("cart-container");
  const emptyCart = document.getElementById("empty-cart");
  const cartTotal = document.getElementById("cart-total");
  const totalAmount = document.getElementById("total-amount");

  if (!cartContainer) return;

  if (cart.length === 0) {
    if (emptyCart) emptyCart.style.display = "block";
    if (cartTotal) cartTotal.style.display = "none";
    cartContainer.innerHTML = `
            <div class="empty-cart">
                <p>Keranjang Anda kosong</p>
                <button onclick="window.location.href='produk.html'">Mulai Belanja</button>
            </div>
        `;
    return;
  }

  if (emptyCart) emptyCart.style.display = "none";
  if (cartTotal) cartTotal.style.display = "block";

  let cartHTML = "";
  let total = 0;

  cart.forEach((item, index) => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    cartHTML += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>Rp ${item.price.toLocaleString("id-ID")}</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button onclick="updateQuantity(${index}, -1)">-</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${index})">Hapus</button>
                </div>
            </div>
        `;
  });

  cartContainer.innerHTML = cartHTML;

  if (totalAmount) {
    totalAmount.textContent = total.toLocaleString("id-ID");
  }

  // Update checkout page if present
  updateCheckoutDisplay(total);
}

function updateQuantity(index, change) {
  if (cart[index]) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveCart();
    updateCartDisplay();
  }
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartDisplay();
}

function updateCheckoutDisplay(total) {
  const checkoutItems = document.getElementById("checkout-items");
  const checkoutTotal = document.getElementById("checkout-total");

  if (!checkoutItems) return;

  if (cart.length === 0) {
    checkoutItems.innerHTML = "<p>Keranjang kosong</p>";
    if (checkoutTotal) checkoutTotal.textContent = "0";
    return;
  }

  let itemsHTML = "";
  cart.forEach((item) => {
    itemsHTML += `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span>${item.name} x${item.quantity}</span>
                <span>Rp ${(item.price * item.quantity).toLocaleString(
                  "id-ID"
                )}</span>
            </div>
        `;
  });

  checkoutItems.innerHTML = itemsHTML;
  if (checkoutTotal) {
    checkoutTotal.textContent = total.toLocaleString("id-ID");
  }
}

// Data persistence
function saveUserData() {
  localStorage.setItem("balena_users", JSON.stringify(users));
  localStorage.setItem("balena_current_user", JSON.stringify(currentUser));
  localStorage.setItem("balena_guest_mode", JSON.stringify(isGuestMode));
}

function loadUserData() {
  const savedUsers = localStorage.getItem("balena_users");
  const savedCurrentUser = localStorage.getItem("balena_current_user");
  const savedGuestMode = localStorage.getItem("balena_guest_mode");

  if (savedUsers) {
    users = JSON.parse(savedUsers);
  }

  if (savedCurrentUser) {
    currentUser = JSON.parse(savedCurrentUser);
  }

  if (savedGuestMode) {
    isGuestMode = JSON.parse(savedGuestMode);
  }
}

function saveCart() {
  localStorage.setItem("balena_cart", JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem("balena_cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
}

// Handle URL search parameters
window.addEventListener("load", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const searchQuery = urlParams.get("search");

  if (searchQuery && window.location.pathname.includes("produk.html")) {
    if (searchInput) {
      searchInput.value = searchQuery;
    }
    filterProducts(searchQuery);
  }
});

// Global functions for onclick handlers
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
