/* ============================================================
   JPIC — main.js
   Component loader, nav behaviour, animations, utilities
   ============================================================ */

'use strict';

const API_BASE = 'https://api.jpeducation.net/api/v1';

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
  const v = '20260602';
  await Promise.all([
    loadComponent('[data-component="nav"]',    root + 'components/nav.html?v=' + v),
    loadComponent('[data-component="footer"]', root + 'components/footer.html?v=' + v),
  ]);
  initNav();
  initNotifBell();
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
      const imgUrl = imgSrc ? `${API_BASE.replace('/api/v1', '')}/uploads/${imgSrc}` : null;
      return `
        <article class="news-card reveal">
          ${imgUrl ? `<img src="${imgUrl}" alt="${escapeHtml(post.title)}" class="news-card-img" width="2048" height="1365" loading="lazy">` : ''}
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
   7b. TOAST NOTIFICATIONS
   ------------------------------------------------------------ */
const _TOAST_ICONS = {
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>`,
  error:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  info:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
};
const _TOAST_TITLES = { success: 'Success', error: 'Error', warning: 'Warning', info: 'Info' };

function showToast(message, type = 'info', duration = 4000) {
  const validTypes = ['success', 'error', 'warning', 'info'];
  const t = validTypes.includes(type) ? type : 'info';

  let container = document.getElementById('jpic-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'jpic-toast-container';
    document.body.appendChild(container);
  }

  const el = document.createElement('div');
  el.className = `jpic-toast toast-${t}`;
  el.setAttribute('role', 'alert');
  el.setAttribute('aria-live', 'polite');
  el.innerHTML = `
    <span class="jpic-toast-icon">${_TOAST_ICONS[t]}</span>
    <div class="jpic-toast-body">
      <p class="jpic-toast-title">${_TOAST_TITLES[t]}</p>
      <p class="jpic-toast-msg">${escapeHtml(message)}</p>
    </div>
    <button class="jpic-toast-close" aria-label="Dismiss">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  `;

  function dismiss() {
    el.classList.remove('toast-in');
    el.classList.add('toast-out');
    setTimeout(() => el.remove(), 280);
  }

  el.addEventListener('click', dismiss);
  el.querySelector('.jpic-toast-close').addEventListener('click', (e) => {
    e.stopPropagation();
    dismiss();
  });

  container.appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('toast-in')));
  if (duration > 0) setTimeout(dismiss, duration);

  return { dismiss };
}

/* ------------------------------------------------------------
   7c. NOTIFICATION BELL
   ------------------------------------------------------------ */
const _NOTIF_STORAGE_KEY = 'jpic_notif_seen_at';
let _notifData = null;

function _getLastSeen() {
  const stored = localStorage.getItem(_NOTIF_STORAGE_KEY);
  if (stored) return new Date(stored);
  return new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}

function _markAllRead() {
  localStorage.setItem(_NOTIF_STORAGE_KEY, new Date().toISOString());
}

function _getAcademicYear() {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  return m >= 7 ? `${y}-${y + 1}` : `${y - 1}-${y}`;
}

async function _fetchNotifData() {
  if (_notifData) return _notifData;

  const [newsRes, calRes, careersRes] = await Promise.allSettled([
    fetch(`${API_BASE}/public/news`).then(r => r.json()),
    fetch(`${API_BASE}/calendar/public?academicYear=${_getAcademicYear()}`, {
      headers: { 'Accept': 'application/json' }
    }).then(r => r.json()),
    fetch(`${API_BASE}/public/careers`).then(r => r.json()),
  ]);

  const news = (newsRes.status === 'fulfilled' && newsRes.value.data)
    ? (newsRes.value.data.posts || []).slice(0, 5)
    : [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const calEvents = (calRes.status === 'fulfilled' && calRes.value.data)
    ? (calRes.value.data.events || [])
        .filter(e => new Date(e.startDate) >= today)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 4)
    : [];

  const careers = (careersRes.status === 'fulfilled' && careersRes.value.data)
    ? (careersRes.value.data.posts || []).slice(0, 4)
    : [];

  _notifData = { news, calEvents, careers };
  return _notifData;
}

function _countUnread(data, lastSeen) {
  let count = 0;
  data.news.forEach(p => { if (new Date(p.publishedAt) > lastSeen) count++; });
  data.careers.forEach(j => { if (new Date(j.createdAt) > lastSeen) count++; });
  return count;
}

function _renderNotifPanel(data, lastSeen) {
  const body = document.getElementById('notif-panel-body');
  if (!body) return;

  const calIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
  const newsIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h14a2 2 0 002-2V7.5L14.5 2H6a2 2 0 00-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M2 15h8M2 19h4"/></svg>`;
  const jobIcon  = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>`;

  const rows = [];

  if (data.news.length) {
    rows.push(`<div class="notif-section-label">News &amp; Notices</div>`);
    data.news.forEach(post => {
      const isNew = new Date(post.publishedAt) > lastSeen;
      rows.push(`
        <a href="/news/article.html?id=${encodeURIComponent(post.slug)}" class="notif-item${isNew ? ' unread' : ''}">
          <span class="notif-item-icon icon-news">${newsIcon}</span>
          <div class="notif-item-content">
            <p class="notif-item-title">${escapeHtml(post.title)}</p>
            <p class="notif-item-meta">${isNew ? '<span class="notif-item-dot"></span>' : ''}${post.category ? escapeHtml(post.category) + ' &middot; ' : ''}${formatDate(post.publishedAt)}</p>
          </div>
        </a>`);
    });
  }

  if (data.calEvents.length) {
    rows.push(`<div class="notif-section-label">Upcoming Events</div>`);
    data.calEvents.forEach(ev => {
      rows.push(`
        <a href="/academic-calendar/" class="notif-item">
          <span class="notif-item-icon icon-calendar">${calIcon}</span>
          <div class="notif-item-content">
            <p class="notif-item-title">${escapeHtml(ev.title)}</p>
            <p class="notif-item-meta">${formatDate(ev.startDate)}</p>
          </div>
        </a>`);
    });
  }

  if (data.careers.length) {
    rows.push(`<div class="notif-section-label">Careers</div>`);
    data.careers.forEach(job => {
      const isNew = new Date(job.createdAt) > lastSeen;
      const sub = [job.department, job.location].filter(Boolean).map(escapeHtml).join(' &middot; ');
      rows.push(`
        <a href="/careers/" class="notif-item${isNew ? ' unread' : ''}">
          <span class="notif-item-icon icon-careers">${jobIcon}</span>
          <div class="notif-item-content">
            <p class="notif-item-title">${escapeHtml(job.title)}</p>
            <p class="notif-item-meta">${isNew ? '<span class="notif-item-dot"></span>' : ''}${sub}</p>
          </div>
        </a>`);
    });
  }

  body.innerHTML = rows.length
    ? rows.join('')
    : `<div class="notif-empty">No updates at the moment.</div>`;
}

function initNotifBell() {
  const btn       = document.getElementById('nav-notif-btn');
  const panel     = document.getElementById('nav-notif-panel');
  const badge     = document.getElementById('nav-notif-badge');
  const markBtn   = document.getElementById('notif-mark-read');
  const container = document.getElementById('nav-notif');

  if (!btn || !panel) return;

  let panelOpen  = false;
  let dataLoaded = false;

  function updateBadge(count) {
    if (count > 0) {
      badge.textContent = count > 99 ? '99+' : String(count);
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }
  }

  function openPanel() {
    panel.classList.add('open');
    panel.setAttribute('aria-hidden', 'false');
    btn.setAttribute('aria-expanded', 'true');
    panelOpen = true;
  }

  function closePanel() {
    panel.classList.remove('open');
    panel.setAttribute('aria-hidden', 'true');
    btn.setAttribute('aria-expanded', 'false');
    panelOpen = false;
  }

  // Background fetch: update badge count without blocking
  _fetchNotifData().then(data => {
    const lastSeen = _getLastSeen();
    updateBadge(_countUnread(data, lastSeen));
    if (panelOpen && !dataLoaded) {
      _renderNotifPanel(data, lastSeen);
      dataLoaded = true;
    }
  }).catch(() => {});

  btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    if (panelOpen) { closePanel(); return; }
    openPanel();
    if (!dataLoaded) {
      try {
        const data = await _fetchNotifData();
        _renderNotifPanel(data, _getLastSeen());
        dataLoaded = true;
      } catch {
        const body = document.getElementById('notif-panel-body');
        if (body) body.innerHTML = `<div class="notif-empty">Could not load updates.</div>`;
      }
    }
  });

  if (markBtn) {
    markBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      _markAllRead();
      updateBadge(0);
      if (_notifData) _renderNotifPanel(_notifData, new Date());
    });
  }

  document.addEventListener('click', (e) => {
    if (panelOpen && container && !container.contains(e.target)) closePanel();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && panelOpen) closePanel();
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
  toast: showToast,
};
