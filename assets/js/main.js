/* ============================================================
   JPIC — main.js
   Component loader, nav behaviour, animations, utilities
   ============================================================ */

'use strict';

const API_BASE = 'http://localhost:3100/api/v1';

/* ------------------------------------------------------------
   1. COMPONENT LOADER
   Injects nav.html and footer.html into every page
   ------------------------------------------------------------ */
async function loadComponent(selector, url) {
  const el = document.querySelector(selector);
  if (!el) return;
  try {
    const res = await fetch(url, { cache: 'default', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    const html = await res.text();
    el.innerHTML = html;
    el.removeAttribute('data-component');
    // Dispatch event so nav/footer scripts can initialise
    document.dispatchEvent(new CustomEvent('componentLoaded', { detail: { selector, url } }));
  } catch (err) {
    console.warn('JPIC component loader:', err);
  }
}

async function loadComponents() {
  const root = document.documentElement.dataset.root || '/';
  const v = '20260524';
  await Promise.all([
    loadComponent('[data-component="nav"]',    root + 'components/nav.html?v=' + v),
    loadComponent('[data-component="footer"]', root + 'components/footer.html?v=' + v),
  ]);
  initNav();
  initFooter();
  setActiveNavLink();
}

/* ------------------------------------------------------------
   2. NAVIGATION
   ------------------------------------------------------------ */
function initNav() {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  // Solid nav on inner pages (not home)
  const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html';
  if (!isHome) nav.classList.add('nav-solid');

  // Scroll behaviour
  function onScroll() {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      if (!nav.classList.contains('nav-solid')) {
        nav.classList.remove('scrolled');
      }
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile toggle
  const toggle = document.getElementById('nav-toggle');
  const mobileMenu = document.getElementById('nav-mobile');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      toggle.classList.toggle('open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      mobileMenu.setAttribute('aria-hidden', String(!isOpen));
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && mobileMenu.classList.contains('open')) {
        mobileMenu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
      }
    });
  }

  // Mobile sub-menus
  document.querySelectorAll('.mobile-group-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const submenu = btn.nextElementSibling;
      const isOpen = submenu.classList.toggle('open');
      btn.classList.toggle('open', isOpen);
      btn.setAttribute('aria-expanded', String(isOpen));
    });
  });

  // Close mobile menu on nav link click
  document.querySelectorAll('.nav-mobile a').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) {
        mobileMenu.classList.remove('open');
        if (toggle) { toggle.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
        document.body.style.overflow = '';
      }
    });
  });

  // Desktop dropdown hover with 150ms grace period so mouse can travel to panel
  document.querySelectorAll('.nav-item-dropdown').forEach(item => {
    let closeTimeout;
    item.addEventListener('mouseenter', () => {
      clearTimeout(closeTimeout);
      item.classList.add('dropdown-open');
    });
    item.addEventListener('mouseleave', () => {
      closeTimeout = setTimeout(() => item.classList.remove('dropdown-open'), 150);
    });
    const dropdown = item.querySelector('.nav-dropdown');
    if (dropdown) {
      dropdown.addEventListener('mouseenter', () => clearTimeout(closeTimeout));
      dropdown.addEventListener('mouseleave', () => {
        closeTimeout = setTimeout(() => item.classList.remove('dropdown-open'), 150);
      });
    }
  });
}

/* Mark active nav link based on current URL */
function setActiveNavLink() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link, .nav-dropdown a, .nav-mobile-links a').forEach(link => {
    if (link.dataset.noActive) return;
    const href = link.getAttribute('href');
    if (!href) return;
    if (href === '/' && path === '/') {
      link.classList.add('active');
    } else if (href !== '/' && path.startsWith(href)) {
      link.classList.add('active');
    }
  });
}

/* ------------------------------------------------------------
   3. FOOTER
   ------------------------------------------------------------ */
function initFooter() {
  const year = new Date().getFullYear();
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = year;
  const cambridgeYearEl = document.getElementById('cambridge-year');
  if (cambridgeYearEl) cambridgeYearEl.textContent = year;
}

/* ------------------------------------------------------------
   4. SCROLL REVEAL
   Adds 'revealed' class to .reveal elements when they enter viewport
   ------------------------------------------------------------ */
function initScrollReveal() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
    return;
  }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/* ------------------------------------------------------------
   5. BACK TO TOP
   ------------------------------------------------------------ */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ------------------------------------------------------------
   6. NEWS FEED
   Loads news/news.json and renders latest news cards on homepage
   ------------------------------------------------------------ */
async function loadNewsFeed(containerId, limit = 3) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const root = document.documentElement.dataset.root || '/';
    const res = await fetch(`${API_BASE}/public/news`);
    if (!res.ok) throw new Error('News feed unavailable');
    const json = await res.json();
    const posts = (json.data && json.data.posts) ? json.data.posts : [];

    const latest = posts.slice(0, limit);

    container.innerHTML = latest.map(post => {
      const imgSrc = post.coverImage || null;
      return `
        <article class="news-card reveal">
          ${imgSrc ? `<img src="${imgSrc}" alt="${escapeHtml(post.title)}" class="news-card-img" width="2048" height="1365" loading="lazy">` : ''}
          <div class="news-card-body">
            <div class="news-card-meta">
              ${post.category ? `<span class="news-card-badge">${escapeHtml(post.category)}</span>` : ''}
              <span class="news-card-date">${formatDate(post.publishedAt)}</span>
            </div>
            <h3 class="news-card-title">${escapeHtml(post.title)}</h3>
            <p class="news-card-excerpt">${escapeHtml(post.excerpt)}</p>
            <a href="${root}news/article.html?id=${post.slug}" class="news-card-link">
              Read more <span>→</span>
            </a>
          </div>
        </article>
      `;
    }).join('');

    initScrollReveal();
  } catch (err) {
    container.innerHTML = '<p class="text-muted" style="text-align:center;padding:2rem">News feed unavailable.</p>';
    console.warn('JPIC news feed:', err);
  }
}

/* ------------------------------------------------------------
   7. UTILITIES
   ------------------------------------------------------------ */
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* Smooth scroll for anchor links */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - offset - 16;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* Enquiry form: attach to AdmissionsHQ public API */
function initEnquiryForm(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const API_URL = form.dataset.apiUrl || 'https://api.jpeducation.net/api/v1/public/leads/inquiry';

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const msgEl = document.getElementById(formId + '-msg');

    btn.disabled = true;
    btn.textContent = 'Sending…';

    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) {
        form.reset();
        if (msgEl) { msgEl.textContent = 'Thank you! We will be in touch shortly.'; msgEl.className = 'form-msg success'; }
      } else {
        throw new Error(json.error || 'Submission failed');
      }
    } catch (err) {
      if (msgEl) { msgEl.textContent = 'Something went wrong. Please call us on 031 225 4143.'; msgEl.className = 'form-msg error'; }
    } finally {
      btn.disabled = false;
      btn.textContent = 'Send Enquiry';
    }
  });
}

/* ------------------------------------------------------------
   8. INIT
   ------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  loadComponents();
  initScrollReveal();
  initBackToTop();
  initSmoothScroll();
});

// Expose public API for individual pages
window.JPIC = {
  loadNewsFeed,
  initEnquiryForm,
  formatDate,
};
