document.addEventListener('DOMContentLoaded', () => {
  // 0. Setup Gallery Dropdown Submenu
  setupGalleryDropdown();

  // 1. Navigation Active Link Setup
  highlightActiveLink();

  // 2. Language Setup
  initLanguage();

  // 3. Mobile Menu Toggle
  initMobileMenu();

  // 4. Contact Form Handler (if on contact page)
  initContactForm();

  // 5. Lightbox Setup
  initLightbox();

  // 6. Hero Slider Setup
  initHeroSlider();

  // 7. Gallery Tabs Setup
  initGalleryTabs();
  
  // 8. Section Detail Modals Setup
  initSectionModals();

  // 9. Universal Popup System
  initUniversalPopup();

  // 10. Scroll-reveal animations
  initScrollReveal();

  // 11. Back-to-top button
  initBackToTop();
});

// Highlight the current active page in the navigation bar
function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    
    // Normalize paths
    const cleanHref = href.split('#')[0].replace(/^\.\.\//, '');
    const isGallery = cleanHref.includes('gallery') && currentPath.includes('gallery');
    const isHome = (cleanHref === 'index.html' || cleanHref === '') && (currentPath.endsWith('/') || currentPath.endsWith('index.html')) && !currentPath.includes('gallery') && !currentPath.includes('news/');
    const isOther = currentPath.endsWith(cleanHref) && cleanHref !== 'index.html';
    
    if (isHome || isGallery || isOther) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// Initialize Language Selection
function initLanguage() {
  const langBtn = document.getElementById('langBtn');
  const langDropdown = document.getElementById('langDropdown');
  const langLabel = document.getElementById('langLabel');
  
  // Get saved language or default to English
  let currentLang = localStorage.getItem('lang') || 'en';
  
  // Set language on start
  applyLanguage(currentLang);
  
  if (langBtn && langDropdown) {
    // Toggle dropdown visibility
    langBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      langDropdown.classList.toggle('show');
    });

    // Close dropdown on click outside
    document.addEventListener('click', () => {
      langDropdown.classList.remove('show');
    });

    // Language selection
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(option => {
      option.addEventListener('click', () => {
        const lang = option.getAttribute('data-lang');
        applyLanguage(lang);
      });
    });
  }
}

// Apply translation strings and update UI
function applyLanguage(lang) {
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang === 'en' ? 'en' : 'mr';

  // Update button label
  const langLabel = document.getElementById('langLabel');
  if (langLabel) {
    langLabel.textContent = lang === 'en' ? 'English' : 'मराठी';
  }

  // Fade transition effect
  const transElements = document.querySelectorAll('.i18n-container');
  transElements.forEach(el => el.classList.add('fade-transition'));

  setTimeout(() => {
    // Translate text of all elements with data-i18n attribute
    const elementsToTranslate = document.querySelectorAll('[data-i18n]');
    elementsToTranslate.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const translation = translations[lang][key];
      
      if (translation) {
        // Handle input placeholders specifically
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.setAttribute('placeholder', translation);
        } else {
          element.textContent = translation;
        }
      }
    });

    // Translate dynamic elements if present (e.g. document rows or committee roles)
    translateDynamicContent(lang);

    // Remove fade class after updating content
    transElements.forEach(el => el.classList.add('fade-in'));
  }, 100);
}

// Handle translating custom page elements that load data dynamically (like lists/cards)
function translateDynamicContent(lang) {
  // Committee roles & names
  const committeeCards = document.querySelectorAll('.committee-card');
  if (committeeCards.length > 0) {
    committeeCards.forEach(card => {
      const roleEn = card.getAttribute('data-role-en');
      const roleMr = card.getAttribute('data-role-mr');
      const nameEn = card.getAttribute('data-name-en');
      const nameMr = card.getAttribute('data-name-mr');
      
      const roleEl = card.querySelector('.committee-role');
      const nameEl = card.querySelector('.committee-name');
      
      if (roleEl) roleEl.textContent = lang === 'en' ? roleEn : roleMr;
      if (nameEl) nameEl.textContent = lang === 'en' ? nameEn : nameMr;
    });
  }

  // Documents listing
  const docRows = document.querySelectorAll('.doc-row');
  if (docRows.length > 0) {
    docRows.forEach(row => {
      const titleEn = row.getAttribute('data-title-en');
      const titleMr = row.getAttribute('data-title-mr');
      const descEn = row.getAttribute('data-desc-en');
      const descMr = row.getAttribute('data-desc-mr');
      
      const titleEl = row.querySelector('.doc-name-cell');
      const descEl = row.querySelector('.doc-desc-cell');
      
      if (titleEl) titleEl.textContent = lang === 'en' ? titleEn : titleMr;
      if (descEl) descEl.textContent = lang === 'en' ? descEn : descMr;
    });
  }
}

// Mobile drawer menu interactions
function initMobileMenu() {
  const menuToggle = document.getElementById('mobileMenuToggle');
  const navLinks = document.getElementById('navLinks');
  
  if (menuToggle && navLinks) {
    const setOpen = (isOpen) => {
      navLinks.classList.toggle('active', isOpen);
      menuToggle.textContent = isOpen ? '✕' : '☰';
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      document.body.classList.toggle('nav-open', isOpen);
    };

    menuToggle.addEventListener('click', () => {
      setOpen(!navLinks.classList.contains('active'));
    });

    // Close the drawer once a destination is picked, matching standard
    // mobile nav behavior (it previously stayed open after navigating).
    navLinks.querySelectorAll('.nav-link').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });
  }
}

// Reveal cards/sections with a fade-up effect as they scroll into view
function initScrollReveal() {
  const targets = document.querySelectorAll(
    '.pillar-card, .activity-card, .news-card, .gallery-item, .committee-card, .sector-item, .trust-badge, .involved-card'
  );
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(el => el.classList.add('reveal-visible'));
    return;
  }

  targets.forEach(el => el.classList.add('reveal-init'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('reveal-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

// Show/hide the floating "back to top" button based on scroll position
function initBackToTop() {
  const btn = document.getElementById('backToTopBtn');
  if (!btn) return;

  const toggleVisibility = () => {
    btn.classList.toggle('show', window.scrollY > 400);
  };

  window.addEventListener('scroll', toggleVisibility, { passive: true });
  toggleVisibility();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// Offline-capable local contact form submission handler
function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');
  
  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const subject = document.getElementById('subject').value.trim();
      const message = document.getElementById('message').value.trim();
      
      // Basic Validation
      if (!name || !email || !subject || !message) {
        showStatus('Please fill in all fields.', 'error');
        return;
      }
      
      // Construct submission item
      const submission = {
        id: Date.now(),
        name,
        email,
        subject,
        message,
        date: new Date().toLocaleString()
      };

      try {
        // Keep a local log in this browser (best-effort only)
        const existingMessages = JSON.parse(localStorage.getItem('contact_messages') || '[]');
        existingMessages.push(submission);
        localStorage.setItem('contact_messages', JSON.stringify(existingMessages));
      } catch (err) {
        // ignore local logging failures, the mailto handoff below is what matters
      }

      // Static site, no backend: hand off to the visitor's own email client
      // so the message actually reaches the trust's inbox.
      const NGO_EMAIL = 'ajanta3535@gmail.com';
      const mailBody = `Name: ${name}\nEmail: ${email}\n\n${message}`;
      const mailtoLink = `mailto:${NGO_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(mailBody)}`;

      const lang = localStorage.getItem('lang') || 'en';
      const successMsg = lang === 'en'
        ? 'Opening your email app to send this message. Please hit "Send" there to complete it.'
        : 'हा संदेश पाठवण्यासाठी तुमचे ईमेल अ‍ॅप उघडत आहे. कृपया तिथे "Send" दाबून पूर्ण करा.';

      showStatus(successMsg, 'success');
      window.location.href = mailtoLink;
      contactForm.reset();
    });
  }
  
  function showStatus(text, type) {
    formStatus.textContent = text;
    formStatus.className = 'form-status ' + type;
    formStatus.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}


// Initialize Lightbox Modal for Gallery Page
function initLightbox() {
  const galleryItems = document.querySelectorAll('.gallery-item');
  const modal = document.getElementById('lightboxModal');
  const modalImg = document.getElementById('lightboxImg');
  const modalVideo = document.getElementById('lightboxVideo');
  const modalTitle = document.getElementById('lightboxTitle');
  const modalMeta = document.getElementById('lightboxMeta');
  const modalLink = document.getElementById('lightboxLink');
  const closeBtn = document.getElementById('lightboxClose');
  
  // Gallery Jump Navigation Logic
  const jumpToPhotos = document.getElementById('jumpToPhotos');
  const jumpToVideos = document.getElementById('jumpToVideos');
  const photoSec = document.getElementById('photoGallerySection');
  const videoSec = document.getElementById('videoGallerySection');
  
  if (jumpToPhotos && photoSec) {
    jumpToPhotos.addEventListener('click', () => {
      photoSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  
  if (jumpToVideos && videoSec) {
    jumpToVideos.addEventListener('click', () => {
      videoSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  
  if (!modal || galleryItems.length === 0) return;
  
  galleryItems.forEach(item => {
    item.addEventListener('click', (e) => {
      // If clicking directly on the news link, don't open the lightbox
      if (e.target.classList.contains('gallery-news-link')) {
        return;
      }
      
      const img = item.querySelector('.gallery-img');
      const title = item.getAttribute('data-title-key');
      const date = item.getAttribute('data-date-key');
      const location = item.getAttribute('data-location-key');
      const linkHref = item.getAttribute('data-link');
      const videoSrc = item.getAttribute('data-video-src');
      const videoFallback = item.getAttribute('data-video-fallback');
      
      if (!img) return;
      
      // Video vs Photo setup
      if (videoSrc && modalVideo) {
        modalImg.style.display = 'none';
        modalVideo.style.display = 'block';
        
        // Bind the error event handler BEFORE assigning the src to prevent synchronous race condition
        modalVideo.onerror = function() {
          if (videoFallback && modalVideo.src !== videoFallback) {
            console.log("Local video not found, falling back to: " + videoFallback);
            modalVideo.src = videoFallback;
            modalVideo.load();
            modalVideo.play();
          }
        };
        
        modalVideo.src = videoSrc;
        modalVideo.load();
        modalVideo.play();
      } else {
        if (modalVideo) {
          modalVideo.style.display = 'none';
          modalVideo.pause();
          modalVideo.src = '';
        }
        modalImg.style.display = 'block';
        modalImg.src = img.src;
        modalImg.alt = img.alt;
      }
      
      // Setup dynamic translation IDs for lightbox
      modalTitle.setAttribute('data-i18n', title);
      modalLink.setAttribute('href', linkHref);
      
      // We will render date/location inline
      const currentLang = localStorage.getItem('lang') || 'en';
      updateLightboxText(currentLang, title, date, location);
      
      modal.classList.add('show');
      document.body.style.overflow = 'hidden'; // Disable background scroll
    });
  });
  
  // Close handlers
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeLightbox();
    });
  }
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target === closeBtn) {
      closeLightbox();
    }
  });
  
  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      closeLightbox();
    }
  });
}

function closeLightbox() {
  const modal = document.getElementById('lightboxModal');
  const modalVideo = document.getElementById('lightboxVideo');
  
  if (modalVideo) {
    modalVideo.pause();
    modalVideo.src = '';
  }
  
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = ''; // Restore scroll
  }
}

// Custom handler for updating lightbox text based on active language
function updateLightboxText(lang, titleKey, dateKey, locationKey) {
  const modalTitle = document.getElementById('lightboxTitle');
  const modalMeta = document.getElementById('lightboxMeta');
  const modalLink = document.getElementById('lightboxLink');
  
  if (translations[lang]) {
    const titleText = translations[lang][titleKey];
    const dateText = translations[lang][dateKey];
    const locText = translations[lang][locationKey];
    const linkText = translations[lang]['label_related_news'] || 'Read Related News';
    const dateLabel = translations[lang]['label_date'] || 'Date:';
    const locLabel = translations[lang]['label_location'] || 'Location:';
    
    if (modalTitle) modalTitle.textContent = titleText;
    if (modalMeta) {
      modalMeta.textContent = `${dateLabel} ${dateText} | ${locLabel} ${locText}`;
    }
    if (modalLink) modalLink.textContent = linkText;
  }
}

// We hook into applyLanguage to update the lightbox text if it is open when language is toggled
const originalApplyLanguage = applyLanguage;
applyLanguage = function(lang) {
  originalApplyLanguage(lang);
  
  // Check if lightbox is open
  const modal = document.getElementById('lightboxModal');
  if (modal && modal.classList.contains('show')) {
    const modalTitle = document.getElementById('lightboxTitle');
    const titleKey = modalTitle.getAttribute('data-i18n');
    
    // We can extract keys from their data attributes on the active gallery item if needed
    // or just translate what's currently active. Let's find the active item attributes:
    const activeImgSrc = document.getElementById('lightboxImg').src;
    const items = document.querySelectorAll('.gallery-item');
    let activeItem = null;
    items.forEach(item => {
      const img = item.querySelector('.gallery-img');
      if (img && img.src === activeImgSrc) {
        activeItem = item;
      }
    });
    
    if (activeItem) {
      const title = activeItem.getAttribute('data-title-key');
      const date = activeItem.getAttribute('data-date-key');
      const location = activeItem.getAttribute('data-location-key');
      updateLightboxText(lang, title, date, location);
    }
  }
};

// Initialize Hero Carousel/Slider
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  const prevBtn = document.getElementById('heroPrevBtn');
  const nextBtn = document.getElementById('heroNextBtn');
  const sliderBg = document.getElementById('heroSliderBg');

  if (slides.length === 0) return;

  let currentSlide = 0;
  let slideInterval = null;
  const slideDuration = 5000; // 5 seconds

  function showSlide(index) {
    // Wrap around boundaries
    if (index >= slides.length) {
      currentSlide = 0;
    } else if (index < 0) {
      currentSlide = slides.length - 1;
    } else {
      currentSlide = index;
    }

    // Toggle active state for slides
    slides.forEach((slide, i) => {
      if (i === currentSlide) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // Toggle active state for dots
    dots.forEach((dot, i) => {
      if (i === currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    // Sync the blurred backdrop fill so contained (letterboxed) slides
    // never show flat black bars, regardless of each photo's aspect ratio.
    if (sliderBg) {
      sliderBg.style.backgroundImage = `url('${slides[currentSlide].getAttribute('src')}')`;
    }
  }

  // Set the initial backdrop to match the slide marked active in the markup
  if (sliderBg && slides[currentSlide]) {
    sliderBg.style.backgroundImage = `url('${slides[currentSlide].getAttribute('src')}')`;
  }
  
  function nextSlide() {
    showSlide(currentSlide + 1);
  }
  
  function prevSlide() {
    showSlide(currentSlide - 1);
  }
  
  function startAutoplay() {
    stopAutoplay();
    slideInterval = setInterval(nextSlide, slideDuration);
  }
  
  function stopAutoplay() {
    if (slideInterval) {
      clearInterval(slideInterval);
    }
  }
  
  // Attach arrow listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      prevSlide();
      startAutoplay(); // Reset timer
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      startAutoplay(); // Reset timer
    });
  }
  
  // Attach dot listeners
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const targetIndex = parseInt(e.target.getAttribute('data-slide'), 10);
      showSlide(targetIndex);
      startAutoplay(); // Reset timer
    });
  });
  
  // Pause on hover
  const heroSection = document.querySelector('.hero-section.slider-active');
  if (heroSection) {
    heroSection.addEventListener('mouseenter', stopAutoplay);
    heroSection.addEventListener('mouseleave', startAutoplay);
  }
  
  // Keyboard Arrow Navigation
  document.addEventListener('keydown', (e) => {
    // Only handle if homepage and slider is in/near viewport
    const rect = heroSection?.getBoundingClientRect();
    if (rect && rect.bottom > 0 && rect.top < window.innerHeight) {
      if (e.key === 'ArrowLeft') {
        prevSlide();
        startAutoplay();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
        startAutoplay();
      }
    }
  });
  
  // Start the auto cycle
  startAutoplay();
}

// Copy to clipboard helper for bank details
window.copyText = function(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    const lang = localStorage.getItem('lang') || 'en';
    const origText = translations[lang]['btn_copy'] || 'Copy';
    const copiedText = translations[lang]['copied_text'] || 'Copied!';
    
    button.textContent = copiedText;
    button.style.backgroundColor = 'var(--secondary)';
    button.style.color = 'var(--primary-dark)';
    button.style.borderColor = 'var(--secondary)';
    
    setTimeout(() => {
      button.textContent = origText;
      button.style.backgroundColor = '';
      button.style.color = '';
      button.style.borderColor = '';
    }, 1500);
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
};

// Setup gallery submenu dropdown dynamically
function setupGalleryDropdown() {
  const galleryLink = document.querySelector('.nav-links a[data-i18n="nav_gallery"]');
  if (!galleryLink) return;
  
  const galleryItem = galleryLink.parentElement;
  if (!galleryItem) return;
  
  galleryItem.classList.add('dropdown');
  galleryLink.classList.add('dropdown-toggle');
  
  // Determine correct paths based on current location
  const currentPath = window.location.pathname;
  let photosPath = 'gallery/index.html?tab=photos';
  let videosPath = 'gallery/index.html?tab=videos';
  
  if (currentPath.includes('gallery/')) {
    photosPath = 'index.html?tab=photos';
    videosPath = 'index.html?tab=videos';
  } else if (currentPath.includes('news/')) {
    photosPath = '../gallery/index.html?tab=photos';
    videosPath = '../gallery/index.html?tab=videos';
  }
  
  const dropdownMenu = document.createElement('ul');
  dropdownMenu.className = 'dropdown-menu';
  
  const photosLi = document.createElement('li');
  const photosA = document.createElement('a');
  photosA.href = photosPath;
  photosA.className = 'dropdown-item';
  photosA.setAttribute('data-i18n', 'gallery_photos');
  photosA.textContent = 'Photos';
  photosLi.appendChild(photosA);
  
  const videosLi = document.createElement('li');
  const videosA = document.createElement('a');
  videosA.href = videosPath;
  videosA.className = 'dropdown-item';
  videosA.setAttribute('data-i18n', 'gallery_videos');
  videosA.textContent = 'Videos';
  videosLi.appendChild(videosA);
  
  dropdownMenu.appendChild(photosLi);
  dropdownMenu.appendChild(videosLi);
  
  galleryItem.appendChild(dropdownMenu);
}

// Gallery page tabs filtering logic
function initGalleryTabs() {
  const tabButtons = document.querySelectorAll('.gallery-tab-btn');
  const photoSection = document.getElementById('photoGallerySection');
  const videoSection = document.getElementById('videoGallerySection');
  
  if (tabButtons.length === 0) return;
  
  // Read initial tab parameter from URL search query
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab');
  if (initialTab) {
    switchTab(initialTab);
  }
  
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      // Clean query parameter when clicking tabs manually to keep UX clean
      try {
        const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({ path: newUrl }, '', newUrl);
      } catch (e) {
        console.warn("Unable to clear search query on file:// protocol");
      }
      switchTab(tab);
    });
  });
  
  function switchTab(tab) {
    tabButtons.forEach(b => {
      if (b.getAttribute('data-tab') === tab) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    
    if (tab === 'all') {
      if (photoSection) photoSection.style.display = 'block';
      if (videoSection) videoSection.style.display = 'block';
    } else if (tab === 'photos') {
      if (photoSection) photoSection.style.display = 'block';
      if (videoSection) videoSection.style.display = 'none';
    } else if (tab === 'videos') {
      if (photoSection) photoSection.style.display = 'none';
      if (videoSection) videoSection.style.display = 'block';
    }
  }
}

// Dynamic Section Detail Modals Setup
function initSectionModals() {
  const cards = document.querySelectorAll('.activity-card, .sector-item, .pillar-card');
  if (cards.length === 0) return;

  // Add cursor: pointer to all cards programmatically
  cards.forEach(card => {
    card.style.cursor = 'pointer';
  });

  // Create modal element if it doesn't exist
  let modal = document.getElementById('sectionDetailModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'sectionDetailModal';
    modal.className = 'lightbox-modal'; // Reuse lightbox modal backdrop styles
    modal.style.display = 'none'; // Initially hidden
    modal.innerHTML = `
      <span class="lightbox-close" id="sectionDetailClose">&times;</span>
      <div class="modal-card-content">
        <div id="modalIcon">🎭</div>
        <h3 id="modalTitle">Title</h3>
        <p id="modalDesc">Description</p>
      </div>
    `;
    document.body.appendChild(modal);

    // Style the modal transition & layout
    const style = document.createElement('style');
    style.textContent = `
      #sectionDetailModal.lightbox-modal {
        display: none;
        position: fixed;
        z-index: 10000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(18, 15, 16, 0.95);
        backdrop-filter: blur(8px);
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      #sectionDetailModal.lightbox-modal.show {
        display: flex;
        opacity: 1;
      }
      #sectionDetailModal .modal-card-content {
        background-color: var(--primary-dark);
        color: var(--text-light);
        border: 2px solid var(--secondary);
        border-radius: var(--radius-lg);
        padding: 3rem;
        max-width: 600px;
        width: 90%;
        text-align: center;
        position: relative;
        box-shadow: 0 20px 40px rgba(0,0,0,0.6);
        transform: scale(0.9);
        transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }
      #sectionDetailModal.lightbox-modal.show .modal-card-content {
        transform: scale(1);
      }
      #sectionDetailModal #modalIcon {
        font-size: 4rem;
        margin-bottom: 1.5rem;
        color: var(--secondary);
        animation: popIn 0.5s ease;
      }
      #sectionDetailModal #modalTitle {
        font-size: 1.8rem;
        font-family: var(--font-serif);
        color: var(--secondary-light);
        margin-bottom: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        padding-bottom: 1rem;
      }
      #sectionDetailModal #modalDesc {
        font-size: 1.1rem;
        line-height: 1.8;
        color: rgba(253, 251, 247, 0.85);
        margin-bottom: 0;
        text-align: justify;
      }
      @keyframes popIn {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    // Close on clicking close button or background
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.id === 'sectionDetailClose') {
        closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
      }
    });
  }

  function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => {
      if (!modal.classList.contains('show')) {
        modal.style.display = 'none';
      }
    }, 300);
    document.body.style.overflow = '';
  }

  // Bind click listener
  cards.forEach(card => {
    card.addEventListener('click', () => {
      const titleKey = card.getAttribute('data-title-key');
      const detailKey = card.getAttribute('data-detail-key') || card.getAttribute('data-desc-key');
      const icon = card.getAttribute('data-icon') || card.querySelector('.pillar-icon, .sector-icon, .activity-icon-badge')?.textContent?.trim()?.substring(0, 2) || '🎭';

      if (!titleKey || !detailKey) return;

      const lang = localStorage.getItem('lang') || 'en';
      const title = (translations[lang] && translations[lang][titleKey]) || card.querySelector('h3, h4')?.textContent?.trim();
      const desc = (translations[lang] && translations[lang][detailKey]) || card.querySelector('p')?.textContent?.trim();

      document.getElementById('modalIcon').textContent = icon;
      document.getElementById('modalTitle').textContent = title;
      document.getElementById('modalDesc').textContent = desc;

      modal.style.display = 'flex';
      // Force reflow
      modal.offsetHeight;
      modal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });
}

// =============================================================
// Universal Popup System
// Opens a rich, animated popup when any section card is clicked
// =============================================================
function initUniversalPopup() {
  // Create the universal popup modal in DOM
  let popup = document.getElementById('universalPopup');
  if (!popup) {
    popup = document.createElement('div');
    popup.id = 'universalPopup';
    popup.setAttribute('role', 'dialog');
    popup.setAttribute('aria-modal', 'true');
    popup.innerHTML = `
      <div class="upopup-backdrop"></div>
      <div class="upopup-panel">
        <button class="upopup-close" id="upopupClose" aria-label="Close">&times;</button>
        <div class="upopup-img-wrap" id="upopupImgWrap">
          <img id="upopupImg" src="" alt="" />
        </div>
        <div class="upopup-body">
          <div class="upopup-meta" id="upopupMeta"></div>
          <h2 class="upopup-title" id="upopupTitle"></h2>
          <div class="upopup-avatar" id="upopupAvatar" style="display:none;"></div>
          <p class="upopup-text" id="upopupText"></p>
          <div class="upopup-actions" id="upopupActions"></div>
        </div>
      </div>
    `;
    document.body.appendChild(popup);

    // Inject CSS
    const css = document.createElement('style');
    css.textContent = `
      #universalPopup {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        visibility: hidden;
        transition: opacity 0.35s ease, visibility 0.35s ease;
      }
      #universalPopup.ushow {
        opacity: 1;
        pointer-events: auto;
        visibility: visible;
      }
      .upopup-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(10, 7, 8, 0.88);
        backdrop-filter: blur(10px);
        cursor: pointer;
      }
      .upopup-panel {
        position: relative;
        background: var(--bg-secondary, #faf8f4);
        border-radius: 18px;
        max-width: 760px;
        width: 94%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 30px 80px rgba(0,0,0,0.5);
        transform: translateY(40px) scale(0.96);
        transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.35s ease;
        opacity: 0;
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(212, 175, 55, 0.25);
      }
      #universalPopup.ushow .upopup-panel {
        transform: translateY(0) scale(1);
        opacity: 1;
      }
      .upopup-close {
        position: absolute;
        top: 16px;
        right: 20px;
        font-size: 2rem;
        line-height: 1;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: rgba(122, 28, 49, 0.9);
        color: #fff;
        cursor: pointer;
        z-index: 10;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        font-weight: 700;
      }
      .upopup-close:hover {
        background: var(--primary-dark, #5a0f1e);
        transform: scale(1.1) rotate(90deg);
      }
      .upopup-img-wrap {
        width: 100%;
        max-height: 340px;
        overflow: hidden;
        border-radius: 18px 18px 0 0;
        flex-shrink: 0;
      }
      .upopup-img-wrap.hidden { display: none; }
      .upopup-img-wrap img {
        width: 100%;
        height: 340px;
        object-fit: cover;
        display: block;
        transition: transform 0.6s ease;
      }
      .upopup-img-wrap img:hover { transform: scale(1.04); }
      .upopup-body {
        padding: 2rem 2.5rem 2.5rem;
        flex-grow: 1;
      }
      .upopup-meta {
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: var(--secondary-dark, #b8860b);
        margin-bottom: 0.75rem;
        display: flex;
        gap: 1.5rem;
        flex-wrap: wrap;
      }
      .upopup-meta span { display: flex; align-items: center; gap: 0.3rem; }
      .upopup-title {
        font-family: var(--font-serif, Georgia, serif);
        font-size: 1.9rem;
        color: var(--primary-dark, #5a0f1e);
        margin-bottom: 1.25rem;
        line-height: 1.3;
        border-bottom: 2px solid rgba(212,175,55,0.3);
        padding-bottom: 1rem;
      }
      .upopup-avatar {
        width: 90px;
        height: 90px;
        border-radius: 50%;
        background: linear-gradient(135deg, var(--primary, #7a1c31), var(--primary-dark, #5a0f1e));
        border: 3px solid var(--secondary, #d4af37);
        color: #fff;
        font-size: 2rem;
        font-weight: 700;
        font-family: var(--font-serif, Georgia, serif);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      }
      .upopup-text {
        font-size: 1.08rem;
        line-height: 1.85;
        color: var(--text-muted, #5a5a5a);
        margin-bottom: 2rem;
        text-align: justify;
      }
      .upopup-actions {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .upopup-btn-primary {
        display: inline-block;
        background: var(--primary, #7a1c31);
        color: #fff;
        font-weight: 700;
        padding: 0.75rem 1.75rem;
        border-radius: 8px;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        transition: all 0.2s;
        border: 2px solid var(--primary, #7a1c31);
        text-decoration: none;
      }
      .upopup-btn-primary:hover {
        background: transparent;
        color: var(--primary, #7a1c31);
      }
      .upopup-role-badge {
        display: inline-block;
        background: rgba(122,28,49,0.08);
        color: var(--primary, #7a1c31);
        padding: 0.4rem 1.2rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 1.2rem;
        border: 1px solid rgba(122,28,49,0.15);
      }
      /* Scrollbar styling */
      .upopup-panel::-webkit-scrollbar { width: 6px; }
      .upopup-panel::-webkit-scrollbar-track { background: transparent; }
      .upopup-panel::-webkit-scrollbar-thumb { background: rgba(122,28,49,0.3); border-radius: 3px; }
      /* Mobile adjustments */
      @media (max-width: 600px) {
        .upopup-body { padding: 1.5rem; }
        .upopup-title { font-size: 1.4rem; }
        .upopup-img-wrap img { height: 220px; }
      }
    `;
    document.head.appendChild(css);
  }

  // Helper: get translated string
  function t(key) {
    const lang = localStorage.getItem('lang') || 'en';
    return (typeof translations !== 'undefined' && translations[lang] && translations[lang][key]) || key;
  }

  // Helper: show/hide popup
  function openPopup() {
    popup.classList.add('ushow');
    document.body.style.overflow = 'hidden';
  }
  function closePopup() {
    popup.classList.remove('ushow');
    document.body.style.overflow = '';
  }

  // Close handlers
  document.getElementById('upopupClose').addEventListener('click', closePopup);
  popup.querySelector('.upopup-backdrop').addEventListener('click', closePopup);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && popup.classList.contains('ushow')) closePopup();
  });

  // Accessors
  const imgWrap = document.getElementById('upopupImgWrap');
  const img = document.getElementById('upopupImg');
  const meta = document.getElementById('upopupMeta');
  const titleEl = document.getElementById('upopupTitle');
  const avatarEl = document.getElementById('upopupAvatar');
  const textEl = document.getElementById('upopupText');
  const actionsEl = document.getElementById('upopupActions');

  // ---- Use event delegation on document for reliability ----
  document.addEventListener('click', e => {
    // ---- News Card ----
    const newsCard = e.target.closest('.news-card[data-popup="news"]');
    if (newsCard && !e.target.closest('.news-card-btn')) {
      e.preventDefault();
      const imgSrc    = newsCard.getAttribute('data-img') || '';
      const title     = t(newsCard.getAttribute('data-title-key'));
      const date      = t(newsCard.getAttribute('data-date-key'));
      const location  = t(newsCard.getAttribute('data-location-key'));
      const body      = t(newsCard.getAttribute('data-body-key'));
      const link      = newsCard.getAttribute('data-link') || '#';
      const dateLabel = t('label_date');
      const locLabel  = t('label_location');
      const readMore  = t('btn_read_article');
      const locKey    = newsCard.getAttribute('data-location-key');

      imgWrap.classList.toggle('hidden', !imgSrc);
      if (imgSrc) { img.src = imgSrc; img.alt = title; }
      meta.innerHTML = `<span>📅 ${dateLabel} ${date}</span>${location && location !== locKey ? `<span>📍 ${locLabel} ${location}</span>` : ''}`;
      titleEl.textContent = title;
      avatarEl.style.display = 'none';
      textEl.textContent = body || newsCard.querySelector('.news-card-summary')?.textContent || '';
      actionsEl.innerHTML = `<a href="${link}" class="upopup-btn-primary">${readMore} →</a>`;
      openPopup();
      return;
    }

    // ---- Committee Card ----
    const committeeCard = e.target.closest('.committee-card[data-popup="committee"]');
    if (committeeCard) {
      const lang = localStorage.getItem('lang') || 'en';
      const name = lang === 'en' ? committeeCard.getAttribute('data-name-en') : committeeCard.getAttribute('data-name-mr');
      const role = lang === 'en' ? committeeCard.getAttribute('data-role-en') : committeeCard.getAttribute('data-role-mr');
      const initials = committeeCard.getAttribute('data-initials') || '?';
      const trustee  = t('member_view_profile');
      const committeeTitleStr = t('committee_title');

      imgWrap.classList.add('hidden');
      meta.innerHTML = `<span>🏛 ${committeeTitleStr}</span>`;
      titleEl.textContent = name;
      avatarEl.style.display = 'flex';
      avatarEl.textContent = initials;
      textEl.innerHTML = `<span class="upopup-role-badge">${role}</span><br><br>Executive Member — AJANTA SCHOOL OF DRAMA AND FILM TRUST`;
      actionsEl.innerHTML = '';
      openPopup();
      return;
    }

    // ---- Gallery Items (on home page only, not on gallery/index.html) ----
    const isGalleryPage = window.location.pathname.includes('gallery/');
    if (!isGalleryPage) {
      const galleryItem = e.target.closest('.gallery-item');
      if (galleryItem && !e.target.closest('.gallery-news-link')) {
        const imgEl    = galleryItem.querySelector('.gallery-img');
        const imgSrc   = imgEl ? imgEl.src : '';
        const imgAlt   = imgEl ? imgEl.alt : '';
        const title    = t(galleryItem.getAttribute('data-title-key'));
        const date     = t(galleryItem.getAttribute('data-date-key'));
        const link     = galleryItem.getAttribute('data-link') || '#';
        const dateLabel = t('label_date');
        const readMore  = t('label_related_news');

        imgWrap.classList.toggle('hidden', !imgSrc);
        if (imgSrc) { img.src = imgSrc; img.alt = imgAlt; }
        meta.innerHTML = `<span>📅 ${dateLabel} ${date}</span>`;
        titleEl.textContent = title;
        avatarEl.style.display = 'none';
        textEl.textContent = '';
        actionsEl.innerHTML = `<a href="${link}" class="upopup-btn-primary">${readMore} →</a>`;
        openPopup();
        e.stopPropagation();
        return;
      }
    }
  });
}

