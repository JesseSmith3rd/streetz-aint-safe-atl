(() => {
  'use strict';

  // Defensive check for community data
  const photos = Array.isArray(window.StreetzCommunityData)
    ? window.StreetzCommunityData
    : [];

  // Filter and validate required fields for safety
  const validPhotos = photos.filter(photo => {
    return photo &&
      typeof photo.id === 'string' && photo.id.trim() !== '' &&
      typeof photo.image === 'string' && photo.image.trim() !== '' &&
      typeof photo.alt === 'string' && photo.alt.trim() !== '';
  });

  // DOM Elements
  const grid = document.getElementById('communityGrid');
  const modal = document.getElementById('lightboxModal');
  const modalImage = document.getElementById('lightboxImage');
  const modalClose = document.getElementById('lightboxClose');
  const modalPrev = document.getElementById('lightboxPrev');
  const modalNext = document.getElementById('lightboxNext');
  const modalInfo = document.getElementById('lightboxInfo');

  let activePhotoIndex = -1;
  let focusedElementBeforeModal = null;
  let originalBodyOverflow = '';
  let originalBodyPadding = '';

  // Touch Swipe state variables
  let touchStartX = 0;
  let touchEndX = 0;

  // Initialize page functionality if elements exist
  document.addEventListener('DOMContentLoaded', () => {
    if (grid) {
      renderGallery();
      setupLightboxEventListeners();
    }
  });

  // Render the responsive gallery cards dynamically
  function renderGallery() {
    grid.innerHTML = '';

    if (validPhotos.length === 0) {
      const emptyState = document.createElement('div');
      emptyState.style.gridColumn = '1 / -1';
      emptyState.style.textAlign = 'center';
      emptyState.style.padding = '60px 20px';
      emptyState.style.color = 'var(--text-muted)';
      
      const emptyText = document.createElement('p');
      emptyText.textContent = 'Our Streetz X Safe Community is growing. Check back soon to see the family representing the movement.';
      emptyText.style.fontSize = '16px';
      emptyText.style.fontStyle = 'italic';
      
      emptyState.appendChild(emptyText);
      grid.appendChild(emptyState);
      return;
    }

    validPhotos.forEach((photo, index) => {
      // Create card container
      const card = document.createElement('div');
      card.className = 'community-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', `View larger version of: ${photo.alt}`);

      // Create photo wrapper for aspect-ratio enforcement
      const photoWrap = document.createElement('div');
      photoWrap.className = 'community-photo-wrap';

      const img = document.createElement('img');
      img.src = photo.image;
      img.alt = photo.alt;
      img.setAttribute('loading', 'lazy');
      img.setAttribute('decoding', 'async');
      photoWrap.appendChild(img);
      card.appendChild(photoWrap);

      // Create metadata details
      const details = document.createElement('div');
      details.className = 'community-card-details';

      let hasDetails = false;

      // Handle optional fields safely (avoid rendering if empty)
      if (photo.name && photo.name.trim() !== '') {
        const nameEl = document.createElement('span');
        nameEl.className = 'community-card-name';
        nameEl.textContent = photo.name;
        details.appendChild(nameEl);
        hasDetails = true;
      }

      if (photo.location && photo.location.trim() !== '') {
        const locEl = document.createElement('span');
        locEl.className = 'community-card-location';
        locEl.textContent = photo.location;
        details.appendChild(locEl);
        hasDetails = true;
      }

      if (photo.product && photo.product.trim() !== '') {
        const prodEl = document.createElement('span');
        prodEl.className = 'community-card-product';
        prodEl.textContent = photo.product;
        details.appendChild(prodEl);
        hasDetails = true;
      }

      if (photo.instagram && photo.instagram.trim() !== '') {
        // Strip leading @
        const handle = photo.instagram.replace(/^@/, '');
        const igLink = document.createElement('a');
        igLink.className = 'community-card-ig';
        igLink.href = `https://www.instagram.com/${encodeURIComponent(handle)}/`;
        igLink.target = '_blank';
        igLink.rel = 'noopener noreferrer';
        igLink.textContent = `@${handle}`;
        
        // Prevent card click trigger when clicking IG handle link
        igLink.addEventListener('click', (e) => {
          e.stopPropagation();
        });

        details.appendChild(igLink);
        hasDetails = true;
      }

      if (photo.caption && photo.caption.trim() !== '') {
        const captionEl = document.createElement('p');
        captionEl.className = 'community-card-caption';
        captionEl.textContent = photo.caption;
        details.appendChild(captionEl);
        hasDetails = true;
      }

      if (hasDetails) {
        card.appendChild(details);
      }

      // Safe Programmatic Click handler (CSP-safe)
      card.addEventListener('click', () => {
        openLightbox(index);
      });

      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(index);
        }
      });

      grid.appendChild(card);
    });
  }

  // Setup programmatical event listeners on the lightbox
  function setupLightboxEventListeners() {
    if (!modal) return;

    modalClose.addEventListener('click', closeLightbox);
    modalPrev.addEventListener('click', showPrevImage);
    modalNext.addEventListener('click', showNextImage);

    // Click outside modal content to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeLightbox();
      }
    });

    // Keyboard handlers
    window.addEventListener('keydown', (e) => {
      if (!modal.classList.contains('active')) return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        showPrevImage();
      } else if (e.key === 'ArrowRight') {
        showNextImage();
      } else if (e.key === 'Tab') {
        trapFocus(e);
      }
    });

    // Mobile Swipe Gesture Listeners
    modal.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    modal.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipeGesture();
    }, { passive: true });
  }

  // Focus trap implementation
  function trapFocus(e) {
    const focusableElements = modal.querySelectorAll('button, [tabindex="0"]');
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  // Open the lightbox and load high-res images
  function openLightbox(index) {
    if (index < 0 || index >= validPhotos.length) return;

    focusedElementBeforeModal = document.activeElement;
    activePhotoIndex = index;

    // Lock page background scrolling
    originalBodyOverflow = document.body.style.overflow;
    originalBodyPadding = document.body.style.paddingRight;
    
    // Prevent layout shift by adding scroll width padding if necessary
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }
    document.body.style.overflow = 'hidden';
    document.body.classList.add('modal-open');

    // Show modal container
    modal.classList.add('active');
    
    // Load requested photo
    loadPhotoInLightbox(index);

    // Focus close button first
    modalClose.focus();
  }

  // Set source photo in lightbox and handle load/error states
  function loadPhotoInLightbox(index) {
    const photo = validPhotos[index];
    if (!photo) return;

    modal.classList.add('loading');
    modalImage.style.display = 'none';

    let errorCount = 0;
    
    // Set fallback handler programmatically
    modalImage.onerror = () => {
      if (errorCount === 0) {
        errorCount++;
        // Fall back to standard card image size if large image fails
        modalImage.src = photo.image;
      } else {
        // Both standard and large failed
        modal.classList.remove('loading');
        modalImage.style.display = 'none';
        modalInfo.innerHTML = '';
        
        const errText = document.createElement('p');
        errText.textContent = 'Image unavailable.';
        errText.style.fontStyle = 'italic';
        errText.style.color = 'var(--accent-red)';
        modalInfo.appendChild(errText);
      }
    };

    modalImage.onload = () => {
      modal.classList.remove('loading');
      modalImage.style.display = 'block';
    };

    // Load dynamic image source
    modalImage.src = photo.imageLarge || photo.image;
    modalImage.alt = photo.alt;

    // Render lightbox caption info
    renderLightboxCaption(photo);

    // Preload next and previous large images dynamically
    preloadAdjacentImages(index);
  }

  // Render text descriptions safely inside Lightbox
  function renderLightboxCaption(photo) {
    modalInfo.innerHTML = '';

    const captionWrap = document.createElement('div');
    captionWrap.style.display = 'flex';
    captionWrap.style.flexDirection = 'column';
    captionWrap.style.gap = '6px';
    captionWrap.style.alignItems = 'center';

    let hasMeta = false;

    if (photo.name && photo.name.trim() !== '') {
      const nameEl = document.createElement('strong');
      nameEl.style.fontSize = '15px';
      nameEl.style.textTransform = 'uppercase';
      nameEl.textContent = photo.name;
      captionWrap.appendChild(nameEl);
      hasMeta = true;
    }

    if (photo.location && photo.location.trim() !== '') {
      const locEl = document.createElement('span');
      locEl.style.fontSize = '12px';
      locEl.style.color = 'var(--text-muted)';
      locEl.textContent = photo.location;
      captionWrap.appendChild(locEl);
      hasMeta = true;
    }

    if (photo.product && photo.product.trim() !== '') {
      const prodEl = document.createElement('span');
      prodEl.style.fontSize = '11px';
      prodEl.style.color = 'var(--accent-red)';
      prodEl.style.textTransform = 'uppercase';
      prodEl.style.fontWeight = 'bold';
      prodEl.textContent = photo.product;
      captionWrap.appendChild(prodEl);
      hasMeta = true;
    }

    if (photo.caption && photo.caption.trim() !== '') {
      const descEl = document.createElement('p');
      descEl.style.marginTop = '8px';
      descEl.style.fontStyle = 'italic';
      descEl.style.fontSize = '13.5px';
      descEl.style.color = 'var(--text-muted)';
      descEl.textContent = photo.caption;
      captionWrap.appendChild(descEl);
      hasMeta = true;
    }

    if (hasMeta) {
      modalInfo.appendChild(captionWrap);
    }
  }

  // Preload adjacent images for fast navigation
  function preloadAdjacentImages(currentIndex) {
    if (validPhotos.length <= 1) return;

    const nextIdx = (currentIndex + 1) % validPhotos.length;
    const prevIdx = (currentIndex - 1 + validPhotos.length) % validPhotos.length;

    [nextIdx, prevIdx].forEach(idx => {
      const p = validPhotos[idx];
      if (p) {
        const nextImageSrc = p.imageLarge || p.image;
        if (nextImageSrc) {
          const preloader = new Image();
          preloader.src = nextImageSrc;
        }
      }
    });
  }

  // Close the lightbox and restore background scrolling states
  function closeLightbox() {
    if (!modal.classList.contains('active')) return;

    modal.classList.remove('active');
    modal.classList.remove('loading');
    modalImage.src = '';
    modalImage.alt = '';
    modalInfo.innerHTML = '';

    // Restore page scroll
    document.body.style.overflow = originalBodyOverflow;
    document.body.style.paddingRight = originalBodyPadding;
    document.body.classList.remove('modal-open');

    // Restore focus to card element that opened lightbox
    if (focusedElementBeforeModal) {
      focusedElementBeforeModal.focus();
    }
  }

  // Show previous image in lightbox
  function showPrevImage() {
    if (validPhotos.length <= 1) return;
    activePhotoIndex = (activePhotoIndex - 1 + validPhotos.length) % validPhotos.length;
    loadPhotoInLightbox(activePhotoIndex);
  }

  // Show next image in lightbox
  function showNextImage() {
    if (validPhotos.length <= 1) return;
    activePhotoIndex = (activePhotoIndex + 1) % validPhotos.length;
    loadPhotoInLightbox(activePhotoIndex);
  }

  // Handle mobile swipe interactions
  function handleSwipeGesture() {
    const swipeThreshold = 50;
    const diff = touchEndX - touchStartX;

    if (Math.abs(diff) < swipeThreshold) return;

    if (diff > 0) {
      // Swiped right -> Show previous
      showPrevImage();
    } else {
      // Swiped left -> Show next
      showNextImage();
    }
  }
})();
