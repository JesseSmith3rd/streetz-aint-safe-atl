// Dynamic Footer Copyright Year
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

// Mobile Menu Drawer Toggle Logic
const toggle = document.querySelector(".navToggle");
const nav = document.querySelector(".nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("isOpen");
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    
    // Accessibility icon change (☰ to ✕)
    toggle.textContent = isOpen ? "✕" : "☰";
    
    // Prevent body scrolling when fullscreen drawer is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  });
}

// Active Nav Link Highlighter (using pathname comparison)
const currentFile = window.location.pathname.split("/").pop() || "index.html";
const navLinks = document.querySelectorAll(".nav a");

navLinks.forEach(link => {
  const href = link.getAttribute("href");
  if (href === currentFile) {
    link.classList.add("active");
  } else {
    link.classList.remove("active");
  }
});

/* ==========================================================================
   LUXURY SHOPPING CART & SECURE CHECKOUT OVERLAY SYSTEM
   ========================================================================== */

let cartState = JSON.parse(localStorage.getItem('sz_cart') || '[]');

function saveCart() {
  localStorage.setItem('sz_cart', JSON.stringify(cartState));
  renderCart();
}

function updateCartCountBadge() {
  const count = cartState.reduce((sum, item) => sum + item.qty, 0);
  const cartCounts = document.querySelectorAll('#cartCount');
  cartCounts.forEach(el => {
    el.textContent = count;
    
    // Animate badge
    el.classList.remove('badge-pop');
    void el.offsetWidth; // Trigger reflow
    el.classList.add('badge-pop');
  });
}

function renderCart() {
  updateCartCountBadge();
  const cartList = document.getElementById('cartItemsList');
  const cartSubtotalEl = document.getElementById('cartSubtotal');
  
  if (!cartList) return;
  
  if (cartState.length === 0) {
    cartList.innerHTML = `<div class="cart-empty-message">Your cart is empty</div>`;
    cartSubtotalEl.textContent = '$0.00';
    return;
  }
  
  let subtotal = 0;
  cartList.innerHTML = '';
  
  cartState.forEach(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    itemEl.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='https://placehold.co/150x150/111/fff?text=merch'" />
      <div class="cart-item-details">
        <div>
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-variant">Size: ${item.size}</div>
        </div>
        <div class="cart-item-controls">
          <div class="qty-adjuster">
            <button type="button" class="qty-btn minus" onclick="adjustItemQty('${item.id}', '${item.size}', -1)">-</button>
            <span class="qty-val">${item.qty}</span>
            <button type="button" class="qty-btn plus" onclick="adjustItemQty('${item.id}', '${item.size}', 1)">+</button>
          </div>
          <button type="button" class="cart-item-remove" onclick="removeCartItem('${item.id}', '${item.size}')">Remove</button>
        </div>
      </div>
      <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
    `;
    cartList.appendChild(itemEl);
  });
  
  cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
}

function adjustItemQty(productId, size, delta) {
  const itemIndex = cartState.findIndex(item => item.id === productId && item.size === size);
  if (itemIndex > -1) {
    cartState[itemIndex].qty += delta;
    if (cartState[itemIndex].qty <= 0) {
      cartState.splice(itemIndex, 1);
    }
    saveCart();
  }
}

function removeCartItem(productId, size) {
  const itemIndex = cartState.findIndex(item => item.id === productId && item.size === size);
  if (itemIndex > -1) {
    cartState.splice(itemIndex, 1);
    saveCart();
  }
}

function addItemToCart(productId, name, size, price, image, variantId) {
  const existingItemIndex = cartState.findIndex(item => item.id === productId && item.size === size);
  if (existingItemIndex > -1) {
    cartState[existingItemIndex].qty += 1;
  } else {
    cartState.push({
      id: productId,
      name: name,
      size: size,
      price: parseFloat(price),
      image: image,
      variantId: variantId,
      qty: 1
    });
  }
  saveCart();
  openCartDrawer();
}

function openCartDrawer() {
  // If mobile menu is open, close it first
  if (nav && nav.classList.contains("isOpen")) {
    nav.classList.remove("isOpen");
    if (toggle) toggle.textContent = "☰";
  }

  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  if (drawer && backdrop) {
    drawer.classList.add('active');
    backdrop.classList.add('active');
    document.body.classList.add('drawer-open');
  }
}

function closeCartDrawer() {
  const drawer = document.getElementById('cartDrawer');
  const backdrop = document.getElementById('cartBackdrop');
  if (drawer && backdrop) {
    drawer.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.classList.remove('drawer-open');
  }
}

function openCheckoutModal() {
  if (cartState.length === 0) {
    alert('Your cart is empty.');
    return;
  }
  
  closeCartDrawer();
  
  const modal = document.getElementById('checkoutModal');
  const backdrop = document.getElementById('checkoutBackdrop');
  if (modal && backdrop) {
    // Populate Order Summary
    const summaryItems = document.getElementById('checkoutSummaryItems');
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const totalEl = document.getElementById('checkoutTotal');
    
    if (summaryItems && subtotalEl && totalEl) {
      summaryItems.innerHTML = '';
      let subtotal = 0;
      
      cartState.forEach(item => {
        const itemTotal = item.price * item.qty;
        subtotal += itemTotal;
        
        const summaryEl = document.createElement('div');
        summaryEl.className = 'checkout-summary-item';
        summaryEl.innerHTML = `
          <span>${item.name} (x${item.qty}) [Size: ${item.size}]</span>
          <span>$${itemTotal.toFixed(2)}</span>
        `;
        summaryItems.appendChild(summaryEl);
      });
      
      subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
      totalEl.textContent = `$${subtotal.toFixed(2)}`;
    }
    
    // Reset inputs, loaders, success screens
    const loader = document.getElementById('checkoutLoaderScreen');
    const success = document.getElementById('checkoutSuccessScreen');
    if (loader) loader.classList.remove('active');
    if (success) success.classList.remove('active');
    
    const form = document.getElementById('checkoutForm');
    if (form) form.reset();
    
    modal.classList.add('active');
    backdrop.classList.add('active');
    document.body.classList.add('modal-open');
  }
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkoutModal');
  const backdrop = document.getElementById('checkoutBackdrop');
  if (modal && backdrop) {
    modal.classList.remove('active');
    backdrop.classList.remove('active');
    document.body.classList.remove('modal-open');
  }
}

// Format credit card number inputs (add spaces every 4 characters)
function formatCardNumber(e) {
  let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  let parts = [];
  for (let i = 0; i < value.length; i += 4) {
    parts.push(value.substring(i, i + 4));
  }
  e.target.value = parts.join(' ');
}

// Format expiry date MM/YY input
function formatExpiryDate(e) {
  let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  if (value.length > 2) {
    e.target.value = value.substring(0, 2) + ' / ' + value.substring(2, 4);
  } else {
    e.target.value = value;
  }
}

// Process Secure Payment Simulation
function processPayment(event) {
  if (event) event.preventDefault();
  
  const loader = document.getElementById('checkoutLoaderScreen');
  const success = document.getElementById('checkoutSuccessScreen');
  if (!loader || !success) return;
  
  // Show secure loader spinner
  loader.classList.add('active');
  
  setTimeout(() => {
    // Hide loader, show success screen
    loader.classList.remove('active');
    success.classList.add('active');
    
    // Clear shopping cart state on complete
    cartState = [];
    saveCart();
  }, 1800);
}

// PayPal checkout simulator click action
function triggerPaypalPayment() {
  // Simple validation check: ensure information is filled out if requested, or proceed with quick simulation
  const emailVal = document.getElementById('checkoutEmail').value;
  const nameVal = document.getElementById('checkoutName').value;
  const addressVal = document.getElementById('checkoutAddress').value;
  
  if (!emailVal || !nameVal || !addressVal) {
    alert('Please fill out your Customer Information first before paying.');
    return;
  }
  
  processPayment(null);
}

// Inject necessary HTML containers dynamically on load
function injectCartAndCheckoutMarkup() {
  if (document.getElementById('cartDrawer')) return; // Check if already injected
  
  const drawerContainer = document.createElement('div');
  drawerContainer.innerHTML = `
    <!-- Cart Backdrop -->
    <div id="cartBackdrop" class="drawer-backdrop"></div>
    <!-- Cart Drawer -->
    <div id="cartDrawer" class="cart-drawer">
      <div class="cart-header">
        <h2>Shopping Cart</h2>
        <button class="cart-close-btn" id="cartCloseBtn">✕</button>
      </div>
      <div class="cart-items-list" id="cartItemsList"></div>
      <div class="cart-footer">
        <div class="cart-subtotal-row">
          <span class="cart-subtotal-label">Subtotal</span>
          <span class="cart-subtotal-value" id="cartSubtotal">$0.00</span>
        </div>
        <p class="cart-disclaimer">Shipping & taxes calculated at checkout</p>
        <button class="btn primary full" id="checkoutTriggerBtn">Proceed to Secure Checkout</button>
      </div>
    </div>
  `;
  document.body.appendChild(drawerContainer);
  
  const checkoutContainer = document.createElement('div');
  checkoutContainer.innerHTML = `
    <!-- Checkout Backdrop -->
    <div id="checkoutBackdrop" class="modal-backdrop"></div>
    <!-- Checkout Modal -->
    <div id="checkoutModal" class="checkout-modal">
      <div class="checkout-header">
        <h2>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="margin-top:-2px"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          Secure Checkout
        </h2>
        <button class="checkout-close-btn" id="checkoutCloseBtn">✕</button>
      </div>
      
      <div class="checkout-body">
        <!-- Order Summary -->
        <div class="checkout-summary-box">
          <div class="checkout-summary-title">Order Summary</div>
          <div class="checkout-summary-items" id="checkoutSummaryItems"></div>
          <div class="checkout-summary-totals">
            <div class="checkout-summary-row">
              <span>Subtotal</span>
              <span id="checkoutSubtotal">$0.00</span>
            </div>
            <div class="checkout-summary-row">
              <span>Shipping</span>
              <span style="color:#1abc9c">FREE</span>
            </div>
            <div class="checkout-summary-row grand-total">
              <span>Total (USD)</span>
              <span id="checkoutTotal">$0.00</span>
            </div>
          </div>
        </div>
        
        <!-- Billing/Shipping Form -->
        <form id="checkoutForm">
          <div class="checkout-form-section">
            <div class="checkout-section-title">Customer Information</div>
            <div class="form-field">
              <label for="checkoutEmail">Email Address</label>
              <input type="email" id="checkoutEmail" class="input" required placeholder="email@example.com" />
            </div>
            <div class="form-field">
              <label for="checkoutName">Full Name</label>
              <input type="text" id="checkoutName" class="input" required placeholder="John Doe" />
            </div>
            <div class="form-field">
              <label for="checkoutAddress">Shipping Address</label>
              <input type="text" id="checkoutAddress" class="input" required placeholder="123 Main St, Atlanta, GA 30303" />
            </div>
          </div>
          
          <!-- Payment Method -->
          <div class="checkout-form-section">
            <div class="checkout-section-title">Payment Method</div>
            <div class="payment-tabs">
              <button type="button" class="payment-tab-btn active" id="tabStripe">Credit Card</button>
              <button type="button" class="payment-tab-btn" id="tabPaypal">PayPal</button>
            </div>
            
            <!-- Credit Card Tab (Stripe style) -->
            <div class="payment-tab-content active" id="contentStripe">
              <div class="stripe-input-container">
                <div class="stripe-card-number-wrapper">
                  <span class="stripe-card-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
                  </span>
                  <input type="text" id="stripeCardNumber" required placeholder="4242 4242 4242 4242" maxlength="19" />
                </div>
                <div class="stripe-details-row">
                  <input type="text" id="stripeCardExpiry" required placeholder="MM / YY" maxlength="7" />
                  <input type="text" id="stripeCardCvc" required placeholder="CVC" maxlength="4" />
                  <input type="text" id="stripeCardZip" required placeholder="ZIP" maxlength="5" />
                </div>
              </div>
            </div>
            
            <!-- PayPal Tab -->
            <div class="payment-tab-content" id="contentPaypal">
              <div class="paypal-button-mock" id="paypalButtonMock">
                Pay with <span>Pay</span><span>Pal</span>
              </div>
            </div>
          </div>
          
          <!-- Submit Button -->
          <button type="submit" class="btn primary full" id="submitPaymentBtn">Pay Now</button>
        </form>
        
        <!-- Trust Badges -->
        <div class="checkout-trust-badges">
          <div class="checkout-trust-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:2px"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            SSL Encrypted
          </div>
          <div class="checkout-trust-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right:2px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            100% Secure Checkout
          </div>
        </div>
      </div>
      
      <!-- Loading overlay screen -->
      <div class="checkout-loader-screen" id="checkoutLoaderScreen">
        <div class="spinner"></div>
        <div style="font-family:var(--font-heading); font-size:11px; letter-spacing:0.15em; text-transform:uppercase;">Processing Secure Payment...</div>
      </div>
      
      <!-- Success screen -->
      <div class="checkout-success-screen" id="checkoutSuccessScreen">
        <div class="success-icon-wrap">✓</div>
        <h3 class="checkout-success-title">Order Confirmed</h3>
        <p class="checkout-success-text">All transactions are secure and encrypted. Thank you for supporting the movement. Your simulated order has been placed.</p>
        <button class="btn primary" id="successCloseBtn" style="min-width: 150px;">Return to Shop</button>
      </div>
    </div>
  `;
  document.body.appendChild(checkoutContainer);
  
  // Set up listeners for the injected DOM elements
  document.getElementById('cartCloseBtn').addEventListener('click', closeCartDrawer);
  document.getElementById('cartBackdrop').addEventListener('click', closeCartDrawer);
  
  document.getElementById('checkoutCloseBtn').addEventListener('click', closeCheckoutModal);
  document.getElementById('checkoutBackdrop').addEventListener('click', closeCheckoutModal);
  document.getElementById('checkoutTriggerBtn').addEventListener('click', openCheckoutModal);
  
  const checkoutForm = document.getElementById('checkoutForm');
  checkoutForm.addEventListener('submit', processPayment);
  
  // Format Card input
  const ccInput = document.getElementById('stripeCardNumber');
  ccInput.addEventListener('input', formatCardNumber);
  
  // Format Expiry input
  const expInput = document.getElementById('stripeCardExpiry');
  expInput.addEventListener('input', formatExpiryDate);
  
  // Format numeric inputs for Zip and CVC
  const cvcInput = document.getElementById('stripeCardCvc');
  cvcInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/gi, '');
  });
  const zipInput = document.getElementById('stripeCardZip');
  zipInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/gi, '');
  });
  
  // Tab Switching
  const tabStripe = document.getElementById('tabStripe');
  const tabPaypal = document.getElementById('tabPaypal');
  const contentStripe = document.getElementById('contentStripe');
  const contentPaypal = document.getElementById('contentPaypal');
  
  tabStripe.addEventListener('click', () => {
    tabStripe.classList.add('active');
    tabPaypal.classList.remove('active');
    contentStripe.classList.add('active');
    contentPaypal.classList.remove('active');
    
    // Enable Stripe validations
    document.getElementById('stripeCardNumber').required = true;
    document.getElementById('stripeCardExpiry').required = true;
    document.getElementById('stripeCardCvc').required = true;
    document.getElementById('stripeCardZip').required = true;
  });
  
  tabPaypal.addEventListener('click', () => {
    tabPaypal.classList.add('active');
    tabStripe.classList.remove('active');
    contentPaypal.classList.add('active');
    contentStripe.classList.remove('active');
    
    // Disable Stripe validations
    document.getElementById('stripeCardNumber').required = false;
    document.getElementById('stripeCardExpiry').required = false;
    document.getElementById('stripeCardCvc').required = false;
    document.getElementById('stripeCardZip').required = false;
  });
  
  // PayPal mock button trigger
  document.getElementById('paypalButtonMock').addEventListener('click', triggerPaypalPayment);
  
  // Success page Return to Shop Close trigger
  document.getElementById('successCloseBtn').addEventListener('click', () => {
    closeCheckoutModal();
    // Redirect or update UI
    if (window.location.pathname.indexOf('merch.html') === -1) {
      window.location.href = 'merch.html';
    }
  });
}

// Global Cart Nav Link Bindings
function bindCartNavLinks() {
  // The nav cart link can be clicked on any page
  const cartNavLinks = document.querySelectorAll('#cartToggleNav');
  cartNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  });
}

function initCartSystem() {
  injectCartAndCheckoutMarkup();
  renderCart();
  bindCartNavLinks();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCartSystem);
} else {
  initCartSystem();
}
