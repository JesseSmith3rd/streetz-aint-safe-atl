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
   SHOPIFY INTEGRATION & TRUSTED CATALOG MAPPING
   ========================================================================== */

// Fixed mapping between every selectable size/option and its corresponding Shopify numeric variant ID.
// Locally stored prices are completely ignored for authoritative checkout calculations.
const PRODUCT_CATALOG = {
  "long-sleeve-hoodies-high-visibility-reflective-design": {
    name: "LONG SLEEVE HOODIES",
    image: "assets/merch-hoodie.jpg",
    variants: {
      "XS": { price: 65.00, variantId: "48455754186967" },
      "S": { price: 65.00, variantId: "48455754186967" },
      "M": { price: 65.00, variantId: "48455754186967" },
      "L": { price: 65.00, variantId: "48455754186967" },
      "XL": { price: 65.00, variantId: "48455754186967" },
      "2XL": { price: 65.00, variantId: "48455754186967" },
      "3XL": { price: 65.00, variantId: "48455754186967" },
      "4XL": { price: 65.00, variantId: "48455754186967" },
      "5XL": { price: 65.00, variantId: "48455754186967" }
    }
  },
  "short-sleeve-t-shirts-high-visibility-reflective-design": {
    name: "SHORT SLEEVE T-SHIRTS",
    image: "assets/merch-tee.jpg",
    variants: {
      "XS": { price: 35.00, variantId: "48455728300247" },
      "S": { price: 35.00, variantId: "48455728267479" },
      "M": { price: 35.00, variantId: "48455728234711" },
      "L": { price: 35.00, variantId: "48455728201943" },
      "XL": { price: 35.00, variantId: "48455728333015" },
      "2XL": { price: 35.00, variantId: "48455728398551" },
      "3XL": { price: 40.00, variantId: "48455728431319" },
      "4XL": { price: 35.00, variantId: "48455728365783" },
      "5XL": { price: 40.00, variantId: "48455728464087" }
    }
  }
};

/**
 * Validates and sanitizes the shopping cart data.
 * Merges duplicates, ignores localStorage pricing, and enforces quantities 1-10.
 */
function validateAndSanitizeCart(rawCart) {
  if (!Array.isArray(rawCart)) return [];
  const mergedCart = {};

  for (let i = 0; i < rawCart.length; i++) {
    const item = rawCart[i];
    
    // Reject malformed cart objects
    if (!item || typeof item !== 'object') continue;
    
    const productId = item.id;
    const size = item.size;
    
    // Reject unknown product IDs
    if (!PRODUCT_CATALOG.hasOwnProperty(productId)) continue;
    const product = PRODUCT_CATALOG[productId];
    
    // Reject unknown variants or sizes
    if (!product.variants.hasOwnProperty(size)) continue;
    const variantInfo = product.variants[size];
    
    const variantId = variantInfo.variantId;
    
    // Parse quantity as base-10 integer
    let qty = parseInt(item.qty, 10);
    if (isNaN(qty) || qty < 1) continue;
    
    // Merge duplicate entries containing the same variant ID
    if (mergedCart[variantId]) {
      mergedCart[variantId].qty += qty;
    } else {
      mergedCart[variantId] = {
        id: productId,
        name: product.name,
        size: size,
        price: variantInfo.price, // ignore local stored prices, rebuild from catalog
        image: product.image,
        variantId: variantId,
        qty: qty
      };
    }
  }

  // Convert merged cart back to array and validate final quantities (1-10)
  const validCart = [];
  for (const variantId in mergedCart) {
    const item = mergedCart[variantId];
    if (item.qty > 10) {
      item.qty = 10;
    }
    if (item.qty >= 1 && item.qty <= 10) {
      validCart.push(item);
    }
  }
  
  return validCart;
}

/* ==========================================================================
   CART SYSTEM OPERATIONS
   ========================================================================== */

let cartState = [];
try {
  const raw = JSON.parse(localStorage.getItem('sz_cart') || '[]');
  cartState = validateAndSanitizeCart(raw);
} catch (e) {
  cartState = [];
}

function saveCart() {
  cartState = validateAndSanitizeCart(cartState);
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
  const checkoutBtn = document.getElementById('checkoutTriggerBtn');
  const cartErrorMsg = document.getElementById('cartErrorMessage');
  
  if (cartErrorMsg) {
    cartErrorMsg.style.display = 'none';
    cartErrorMsg.textContent = '';
  }

  if (!cartList) return;
  
  if (cartState.length === 0) {
    cartList.innerHTML = '';
    const emptyMsg = document.createElement('div');
    emptyMsg.className = 'cart-empty-message';
    emptyMsg.textContent = 'Your cart is empty';
    cartList.appendChild(emptyMsg);
    
    if (cartSubtotalEl) cartSubtotalEl.textContent = '$0.00';
    if (checkoutBtn) {
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = 'Cart is Empty';
    }
    return;
  }
  
  let subtotal = 0;
  cartList.innerHTML = '';
  
  cartState.forEach(item => {
    const itemTotal = item.price * item.qty;
    subtotal += itemTotal;
    
    const itemEl = document.createElement('div');
    itemEl.className = 'cart-item';
    
    // Image element programmatically
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    img.className = 'cart-item-img';
    img.addEventListener('error', () => {
      img.src = 'https://placehold.co/150x150/111/fff?text=merch';
    });
    itemEl.appendChild(img);
    
    // Details wrapper
    const details = document.createElement('div');
    details.className = 'cart-item-details';
    
    const nameWrap = document.createElement('div');
    const nameEl = document.createElement('div');
    nameEl.className = 'cart-item-name';
    nameEl.textContent = item.name;
    nameWrap.appendChild(nameEl);
    
    const variantEl = document.createElement('div');
    variantEl.className = 'cart-item-variant';
    variantEl.textContent = `Size: ${item.size}`;
    nameWrap.appendChild(variantEl);
    details.appendChild(nameWrap);
    
    // Controls row
    const controls = document.createElement('div');
    controls.className = 'cart-item-controls';
    
    const qtyAdjuster = document.createElement('div');
    qtyAdjuster.className = 'qty-adjuster';
    
    const minusBtn = document.createElement('button');
    minusBtn.type = 'button';
    minusBtn.className = 'qty-btn minus';
    minusBtn.textContent = '-';
    minusBtn.addEventListener('click', () => {
      adjustItemQty(item.id, item.size, -1);
    });
    qtyAdjuster.appendChild(minusBtn);
    
    const qtyVal = document.createElement('span');
    qtyVal.className = 'qty-val';
    qtyVal.textContent = item.qty;
    qtyAdjuster.appendChild(qtyVal);
    
    const plusBtn = document.createElement('button');
    plusBtn.type = 'button';
    plusBtn.className = 'qty-btn plus';
    plusBtn.textContent = '+';
    plusBtn.addEventListener('click', () => {
      adjustItemQty(item.id, item.size, 1);
    });
    qtyAdjuster.appendChild(plusBtn);
    controls.appendChild(qtyAdjuster);
    
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'cart-item-remove';
    removeBtn.textContent = 'Remove';
    removeBtn.addEventListener('click', () => {
      removeCartItem(item.id, item.size);
    });
    controls.appendChild(removeBtn);
    details.appendChild(controls);
    
    itemEl.appendChild(details);
    
    // Price column
    const priceEl = document.createElement('div');
    priceEl.className = 'cart-item-price';
    priceEl.textContent = `$${itemTotal.toFixed(2)}`;
    itemEl.appendChild(priceEl);
    
    cartList.appendChild(itemEl);
  });
  
  if (cartSubtotalEl) cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = 'Proceed to Secure Checkout';
  }
}

function adjustItemQty(productId, size, delta) {
  const itemIndex = cartState.findIndex(item => item.id === productId && item.size === size);
  if (itemIndex > -1) {
    const newQty = cartState[itemIndex].qty + delta;
    if (newQty <= 0) {
      cartState.splice(itemIndex, 1);
    } else if (newQty > 10) {
      cartState[itemIndex].qty = 10;
    } else {
      cartState[itemIndex].qty = newQty;
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
  // Validate input parameters against the trusted catalog before adding
  if (!PRODUCT_CATALOG.hasOwnProperty(productId)) return;
  const product = PRODUCT_CATALOG[productId];
  if (!product.variants.hasOwnProperty(size)) return;
  
  const catalogVariant = product.variants[size];
  const existingItemIndex = cartState.findIndex(item => item.id === productId && item.size === size);
  
  if (existingItemIndex > -1) {
    let newQty = cartState[existingItemIndex].qty + 1;
    if (newQty > 10) newQty = 10;
    cartState[existingItemIndex].qty = newQty;
  } else {
    cartState.push({
      id: productId,
      name: product.name,
      size: size,
      price: catalogVariant.price,
      image: product.image,
      variantId: catalogVariant.variantId,
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

/* ==========================================================================
   SECURE SHOPIFY REDIRECT CHECKOUT FLOW
   ========================================================================== */

/**
 * Builds a Shopify cart permalink and redirects the user.
 * Implements rigorous cart sanitization, quantity boundaries, and security policies.
 */
function initiateShopifyCheckout() {
  const checkoutBtn = document.getElementById('checkoutTriggerBtn');
  const cartErrorMsg = document.getElementById('cartErrorMessage');
  
  if (cartErrorMsg) {
    cartErrorMsg.style.display = 'none';
    cartErrorMsg.textContent = '';
  }

  if (!checkoutBtn) return;

  // 1. Confirm cart is non-empty array and validate against approved mappings
  let validatedCart = [];
  try {
    validatedCart = validateAndSanitizeCart(cartState);
  } catch (e) {
    validatedCart = [];
  }

  if (!Array.isArray(validatedCart) || validatedCart.length === 0) {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Cart is Empty';
    if (cartErrorMsg) {
      cartErrorMsg.textContent = 'Unable to process checkout. Your cart is empty or contains invalid items.';
      cartErrorMsg.style.display = 'block';
    }
    return;
  }

  // Disable button immediately to prevent duplicate clicks and change text
  checkoutBtn.disabled = true;
  checkoutBtn.textContent = 'Opening secure Shopify checkout…';

  try {
    // 2. Build the Shopify Cart URL using numeric variant IDs and validated quantities only
    const itemsPath = validatedCart.map(item => {
      const numericVariantId = item.variantId;
      // Reject non-numeric variant IDs
      if (!/^\d+$/.test(numericVariantId)) {
        throw new Error('Invalid variant ID mapping');
      }
      
      const qty = parseInt(item.qty, 10);
      if (isNaN(qty) || qty < 1 || qty > 10) {
        throw new Error('Invalid quantity');
      }
      
      return `${numericVariantId}:${qty}`;
    }).join(',');

    if (!itemsPath) {
      throw new Error('No items to construct path');
    }

    const shopifyCartUrl = `https://streetz-aint-safe.myshopify.com/cart/${itemsPath}`;

    // 3. Perform redirect securely using location.assign
    window.location.assign(shopifyCartUrl);
  } catch (err) {
    // If URL construction fails: do not redirect, display generic message, and restore state
    checkoutBtn.disabled = false;
    checkoutBtn.textContent = 'Proceed to Secure Checkout';
    if (cartErrorMsg) {
      cartErrorMsg.textContent = 'Unable to process checkout. Please try again.';
      cartErrorMsg.style.display = 'block';
    }
  }
}

// Inject necessary HTML containers dynamically on load
function injectCartMarkup() {
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
        <p class="cart-disclaimer" id="cartErrorMessage" style="color: var(--accent-red); font-size: 11px; margin-top: 8px; display: none;" role="status" aria-live="polite"></p>
        <button class="btn primary full" id="checkoutTriggerBtn">Proceed to Secure Checkout</button>
      </div>
    </div>
  `;
  document.body.appendChild(drawerContainer);
  
  // Set up listeners for the injected DOM elements programmatically
  document.getElementById('cartCloseBtn').addEventListener('click', closeCartDrawer);
  document.getElementById('cartBackdrop').addEventListener('click', closeCartDrawer);
  document.getElementById('checkoutTriggerBtn').addEventListener('click', initiateShopifyCheckout);
}

// Global Cart Nav Link Bindings
function bindCartNavLinks() {
  const cartNavLinks = document.querySelectorAll('#cartToggleNav');
  cartNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      openCartDrawer();
    });
  });
}

function initCartSystem() {
  injectCartMarkup();
  renderCart();
  bindCartNavLinks();
}

/* ==========================================================================
   SAFE LANDING PAGE NEWSLETTER FORM
   ========================================================================== */

function initNewsletterForm() {
  const form = document.getElementById("dropNotificationForm");
  const emailInput = document.getElementById("dropEmail");
  const message = document.getElementById("dropFormMessage");

  if (!form || !emailInput || !message) {
    return;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    if (email.length > 254 || !emailInput.checkValidity()) {
      message.textContent = "Please enter a valid email address.";
      emailInput.focus();
      return;
    }

    // Do NOT log email address or save locally (Rule 19)

    // Inform user that form was validated locally but not transmitted (Rule 20)
    message.textContent =
      "Thanks! Email signup is not connected yet. Your email address was validated locally but not transmitted. Please follow Instagram for current updates.";

    form.reset();
  });
}

// Bootstrapping
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initCartSystem();
    initNewsletterForm();
  });
} else {
  initCartSystem();
  initNewsletterForm();
}
