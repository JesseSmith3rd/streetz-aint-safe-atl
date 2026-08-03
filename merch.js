// Fetch and populate merchandise from products.json safely
async function loadMerch() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  try {
    const response = await fetch("products.json");
    if (!response.ok) throw new Error("Failed to load products.json");
    const products = await response.json();
    
    if (!Array.isArray(products) || products.length === 0) {
      grid.innerHTML = '';
      const noProducts = document.createElement('div');
      noProducts.style.gridColumn = '1/-1';
      noProducts.style.textAlign = 'center';
      noProducts.style.padding = '40px';
      noProducts.style.color = 'var(--text-muted)';
      noProducts.textContent = 'No products found.';
      grid.appendChild(noProducts);
      return;
    }

    grid.innerHTML = ""; // Clear loader safely (since it only contained the static loading text)
    
    products.forEach(product => {
      if (!product || typeof product !== 'object' || !product.id || !product.variants) return;

      const card = document.createElement("div");
      card.className = "product-card";
      card.id = `product-${product.id}`;
      
      // Default selection is M (Medium) or the first variant in the array
      let defaultIndex = product.variants.findIndex(v => v.size === "M");
      if (defaultIndex === -1) defaultIndex = 0;
      const initialVariant = product.variants[defaultIndex];
      
      // 1. Photo wrap
      const photoWrap = document.createElement("div");
      photoWrap.className = "product-photo-wrap";
      
      const img = document.createElement("img");
      img.src = product.image || "";
      img.alt = product.name || "Product Image";
      img.addEventListener("error", () => {
        img.src = `https://placehold.co/600x800/111/fff?text=${encodeURIComponent(product.name || 'merch')}`;
      });
      photoWrap.appendChild(img);
      card.appendChild(photoWrap);
      
      // 2. Product Details
      const details = document.createElement("div");
      details.className = "product-details";
      
      const subname = document.createElement("span");
      subname.className = "product-subname";
      subname.textContent = product.subname || "";
      details.appendChild(subname);
      
      const title = document.createElement("h3");
      title.textContent = product.name || "";
      details.appendChild(title);
      
      const desc = document.createElement("p");
      desc.className = "product-desc";
      desc.textContent = product.description || "";
      details.appendChild(desc);
      
      const priceDisplay = document.createElement("div");
      priceDisplay.className = "product-price";
      priceDisplay.id = `price-${product.id}`;
      priceDisplay.textContent = `$${initialVariant.price.toFixed(2)}`;
      details.appendChild(priceDisplay);
      card.appendChild(details);
      
      // 3. Size Selector
      const optionsRow = document.createElement("div");
      optionsRow.className = "product-options-row";
      
      const sizeLabel = document.createElement("label");
      sizeLabel.textContent = "Select Size";
      optionsRow.appendChild(sizeLabel);
      
      const selectorWrap = document.createElement("div");
      selectorWrap.className = "size-selector-wrap";
      
      const sizeButtons = [];
      product.variants.forEach((v, index) => {
        const isSelected = index === defaultIndex;
        const sizeBtn = document.createElement("button");
        sizeBtn.type = "button";
        sizeBtn.className = "size-option-btn" + (isSelected ? " selected" : "");
        sizeBtn.dataset.variantId = v.variantId;
        sizeBtn.dataset.price = `$${v.price.toFixed(2)}`;
        sizeBtn.textContent = v.size;
        
        // Handle click event programmatically
        sizeBtn.addEventListener("click", () => {
          sizeButtons.forEach(btn => btn.classList.remove("selected"));
          sizeBtn.classList.add("selected");
          priceDisplay.textContent = sizeBtn.dataset.price;
        });
        
        sizeButtons.push(sizeBtn);
        selectorWrap.appendChild(sizeBtn);
      });
      optionsRow.appendChild(selectorWrap);
      card.appendChild(optionsRow);
      
      // 4. Add to Cart Button
      const addBtn = document.createElement("button");
      addBtn.type = "button";
      addBtn.className = "btn primary full";
      addBtn.id = `add-btn-${product.id}`;
      addBtn.textContent = "Add to Cart";
      
      addBtn.addEventListener("click", () => {
        const selectedBtn = selectorWrap.querySelector('.size-option-btn.selected');
        if (!selectedBtn) return;
        
        const size = selectedBtn.textContent;
        const price = selectedBtn.dataset.price.replace('$', '');
        const variantId = selectedBtn.dataset.variantId;
        const name = title.textContent;
        const image = img.getAttribute('src');
        
        if (typeof addItemToCart === 'function') {
          addItemToCart(product.id, name, size, price, image, variantId);
          
          // Visual button feedback
          const originalText = addBtn.textContent;
          addBtn.textContent = "✓ Added!";
          addBtn.style.backgroundColor = "var(--accent-red)";
          addBtn.style.color = "var(--text-color)";
          addBtn.style.borderColor = "var(--accent-red)";
          addBtn.disabled = true;
          
          setTimeout(() => {
            addBtn.textContent = originalText;
            addBtn.style.backgroundColor = "";
            addBtn.style.color = "";
            addBtn.style.borderColor = "";
            addBtn.disabled = false;
          }, 1200);
        } else {
          console.error('addItemToCart is not loaded in script.js');
        }
      });
      
      card.appendChild(addBtn);
      grid.appendChild(card);
    });
  } catch (err) {
    console.error("Error fetching products:", err);
    grid.innerHTML = '';
    const errorDiv = document.createElement('div');
    errorDiv.style.gridColumn = '1/-1';
    errorDiv.style.textAlign = 'center';
    errorDiv.style.padding = '40px';
    errorDiv.style.color = 'var(--accent-red)';
    errorDiv.textContent = 'Unable to load products. Check console for error details.';
    grid.appendChild(errorDiv);
  }
}

// Initialize layout
document.addEventListener("DOMContentLoaded", loadMerch);
