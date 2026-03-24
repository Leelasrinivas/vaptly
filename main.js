/* ============================================================
   VAPTLY — main.js
   Global JavaScript — All Pages
   Version: 4.0 — Premium Rewrite
   ============================================================

   TABLE OF CONTENTS
   -----------------
   1.  DOM Ready Helper
   2.  Utility Helpers
   3.  Announcement Bar Dismiss
   4.  Header — Scroll Shadow (sticky, no hide/show conflict)
   5.  Mobile Drawer
   6.  Desktop Dropdown — Keyboard Accessible
   7.  Scroll Progress Bar
   8.  Back To Top Button
   9.  Scroll Reveal — IntersectionObserver
   10. Stagger Children Animation
   11. Hero Counters — Odometer Animation
   12. Generic Counters — Data Attribute Driven
   13. Compliance / Progress Bars
   14. Active Nav Link Highlight
   15. Smooth Scroll — Anchor Links
   16. Contact Form — Validation & Submit
   17. Globe Canvas — Hero (index.html only)
   18. Lazy Image Loading
   19. Card Tilt — Desktop Hover Effect
   20. Copy To Clipboard
   21. Tooltip
   22. Focus Trap — Accessibility Utility
   23. Global Error Boundary
   24. Init — Bootstrap All Modules
   ============================================================ */

'use strict';


/* ============================================================
   1. DOM READY HELPER
   ============================================================ */

function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}


/* ============================================================
   2. UTILITY HELPERS
   ============================================================ */

const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(fn, delay = 120) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

function isMobile() {
  return window.innerWidth <= 1024;
}

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/*
   Announcement bar height tracker.
   CSS variable --announcement-height is updated live so all
   sticky/fixed elements offset correctly after dismiss.
*/
function getAnnouncementHeight() {
  const bar = $('#announcementBar');
  return bar ? bar.offsetHeight : 0;
}

function syncAnnouncementHeight() {
  const h = getAnnouncementHeight();
  document.documentElement.style.setProperty('--announcement-height', h + 'px');
}


/* ============================================================
   3. ANNOUNCEMENT BAR DISMISS
   ============================================================

   FIX: The bar uses position:sticky with z-index:850.
   The header uses position:sticky with z-index:900.
   Because the bar is above the header in DOM order,
   dismissing the bar naturally moves the header to top:0.
   No manual offset calculation needed.
   ============================================================ */

function initAnnouncementBar() {
  const bar     = $('#announcementBar');
  const closeBtn = $('#announcementClose');
  if (!bar) return;

  // Set initial CSS variable
  syncAnnouncementHeight();

  // Update on resize (font size changes affect height)
  window.addEventListener('resize', debounce(syncAnnouncementHeight, 150), { passive: true });

  if (!closeBtn) return;

  closeBtn.addEventListener('click', () => {
    // Animate height collapse
    const currentHeight = bar.offsetHeight;
    bar.style.maxHeight  = currentHeight + 'px';
    bar.style.overflow   = 'hidden';
    bar.style.transition = 'max-height 0.38s cubic-bezier(0.4,0,0.2,1), opacity 0.28s ease, padding 0.32s ease';

    // Force reflow before transitioning
    bar.offsetHeight; // eslint-disable-line no-unused-expressions

    bar.style.maxHeight = '0';
    bar.style.opacity   = '0';
    bar.style.padding   = '0';

    setTimeout(() => {
      bar.remove();
      // Reset CSS variable to 0 so all offsets recalculate
      document.documentElement.style.setProperty('--announcement-height', '0px');
    }, 400);
  });
}


/* ============================================================
   4. HEADER — Scroll Shadow
   ============================================================

   Uses position:sticky so no top offset calculation needed.
   Only adds .scrolled class for box-shadow on scroll.
   The hide-on-scroll-down behaviour is removed because it
   conflicted with sticky positioning — the header is always
   visible as the authoritative navigation landmark.
   ============================================================ */

function initHeader() {
  const header = $('#siteHeader');
  if (!header) return;

  let ticking  = false;
  const SHADOW = 24;

  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > SHADOW);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateHeader);
      ticking = true;
    }
  }, { passive: true });

  // Run once immediately
  updateHeader();
}


/* ============================================================
   5. MOBILE DRAWER
   ============================================================ */

function initDrawer() {
  const hamburger = $('#navHamburger');
  const drawer    = $('#mobileDrawer');
  const overlay   = $('#drawerOverlay');
  const closeBtn  = $('#drawerClose');

  if (!hamburger || !drawer) return;

  let isOpen       = false;
  let removeTrap   = null;

  function openDrawer() {
    isOpen = true;
    drawer.classList.add('open');
    overlay?.classList.add('active');
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Trap focus inside drawer for accessibility
    removeTrap = trapFocus(drawer);

    // Focus first interactive element
    const firstEl = drawer.querySelector('a, button');
    if (firstEl) setTimeout(() => firstEl.focus(), 80);
  }

  function closeDrawer() {
    if (!isOpen) return;
    isOpen = false;
    drawer.classList.remove('open');
    overlay?.classList.remove('active');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    // Release focus trap
    if (removeTrap) { removeTrap(); removeTrap = null; }

    // Return focus to trigger
    hamburger.focus();
  }

  hamburger.addEventListener('click', () => isOpen ? closeDrawer() : openDrawer());
  closeBtn?.addEventListener('click', closeDrawer);
  overlay?.addEventListener('click', closeDrawer);

  // ESC key closes drawer
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeDrawer();
  });

  // Close on internal link click
  $$('a', drawer).forEach(link => {
    link.addEventListener('click', () => setTimeout(closeDrawer, 120));
  });

  // Close on resize to desktop
  window.addEventListener('resize', debounce(() => {
    if (!isMobile() && isOpen) closeDrawer();
  }, 200));
}


/* ============================================================
   6. DESKTOP DROPDOWN — Keyboard Accessible
   ============================================================ */

function initDropdowns() {
  const dropdowns = $$('.nav-dropdown');
  if (!dropdowns.length) return;

  function closeAll() {
    dropdowns.forEach(dd => {
      const menu    = dd.querySelector('.dropdown-menu');
      const trigger = dd.querySelector('.nav-link');
      if (menu) {
        menu.style.opacity       = '';
        menu.style.pointerEvents = '';
        menu.style.transform     = '';
      }
      trigger?.setAttribute('aria-expanded', 'false');
    });
  }

  dropdowns.forEach(dd => {
    const trigger = dd.querySelector('.nav-link');
    const menu    = dd.querySelector('.dropdown-menu');
    if (!trigger || !menu) return;

    // Keyboard: Enter or Space opens menu
    trigger.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const open = menu.style.opacity === '1';
        closeAll();
        if (!open) {
          menu.style.opacity       = '1';
          menu.style.pointerEvents = 'all';
          menu.style.transform     = 'translateX(-50%) translateY(0)';
          trigger.setAttribute('aria-expanded', 'true');
          menu.querySelector('a')?.focus();
        }
      }
      if (e.key === 'Escape') { closeAll(); trigger.focus(); }
    });

    // Arrow key navigation within menu
    const menuItems = $$('a', menu);
    menuItems.forEach((item, i) => {
      item.addEventListener('keydown', e => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          menuItems[(i + 1) % menuItems.length].focus();
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          menuItems[(i - 1 + menuItems.length) % menuItems.length].focus();
        }
        if (e.key === 'Escape') { closeAll(); trigger.focus(); }
        if (e.key === 'Tab' && i === menuItems.length - 1 && !e.shiftKey) closeAll();
      });
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!e.target.closest('.nav-dropdown')) closeAll();
  });
}


/* ============================================================
   7. SCROLL PROGRESS BAR
   ============================================================ */

function initScrollProgress() {
  const bar = $('#scrollProgress');
  if (!bar) return;

  let ticking = false;

  function update() {
    const scrolled  = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const pct       = maxScroll > 0 ? clamp((scrolled / maxScroll) * 100, 0, 100) : 0;
    bar.style.width = pct + '%';
    bar.setAttribute('aria-valuenow', Math.round(pct));
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
}


/* ============================================================
   8. BACK TO TOP BUTTON
   ============================================================ */

function initBackToTop() {
  const btn = $('#backToTop');
  if (!btn) return;

  const THRESHOLD = 500;
  let ticking = false;

  function update() {
    btn.classList.toggle('visible', window.scrollY > THRESHOLD);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Return focus to top of page for screen readers
    const main = $('#main-content') || document.body;
    main.setAttribute('tabindex', '-1');
    main.focus();
    setTimeout(() => main.removeAttribute('tabindex'), 1000);
  });
}


/* ============================================================
   9. SCROLL REVEAL — IntersectionObserver
   ============================================================ */

function initScrollReveal() {
  const els = $$('[data-reveal]');
  if (!els.length) return;

  // Respect reduced motion — reveal immediately
  if (reducedMotion()) {
    els.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    });
  }, {
    threshold:  0.1,
    rootMargin: '0px 0px -40px 0px',
  });

  els.forEach(el => observer.observe(el));
}


/* ============================================================
   10. STAGGER CHILDREN ANIMATION
   ============================================================ */

function initStaggerChildren() {
  const parents = $$('[data-stagger]');
  if (!parents.length) return;

  if (reducedMotion()) {
    parents.forEach(p => {
      [...p.children].forEach(c => {
        c.style.opacity   = '1';
        c.style.transform = 'none';
      });
    });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const children = [...entry.target.children];
      const delay    = parseInt(entry.target.dataset.staggerDelay || '80');

      children.forEach((child, i) => {
        // Set initial state
        child.style.opacity    = '0';
        child.style.transform  = 'translateY(18px)';
        child.style.transition =
          `opacity 0.52s cubic-bezier(0.4,0,0.2,1) ${i * delay}ms,
           transform 0.52s cubic-bezier(0.4,0,0.2,1) ${i * delay}ms`;

        // Animate in on next paint
        requestAnimationFrame(() => requestAnimationFrame(() => {
          child.style.opacity   = '1';
          child.style.transform = 'translateY(0)';
        }));
      });

      observer.unobserve(entry.target);
    });
  }, { threshold: 0.1 });

  parents.forEach(p => observer.observe(p));
}


/* ============================================================
   11. HERO COUNTERS — Odometer Animation (index.html)
   ============================================================ */

function initHeroCounters() {
  const items = $$('.counter-value[data-count]');
  if (!items.length) return;

  // Show final values immediately if motion is reduced
  if (reducedMotion()) {
    items.forEach(el => {
      const end = parseFloat(el.dataset.count);
      const sfx = el.dataset.suffix || '';
      const pfx = el.dataset.prefix || '';
      const dec = +(el.dataset.decimals || 0);
      el.textContent = pfx + end.toFixed(dec) + sfx;
    });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el  = entry.target;
      const end = parseFloat(el.dataset.count);
      const sfx = el.dataset.suffix || '';
      const pfx = el.dataset.prefix || '';
      const dec = +(el.dataset.decimals || 0);
      const dur = 1800; // ms
      const t0  = performance.now();

      function tick(now) {
        const elapsed  = now - t0;
        const progress = Math.min(elapsed / dur, 1);
        // Ease-out cubic
        const eased    = 1 - Math.pow(1 - progress, 3);
        el.textContent = pfx + (eased * end).toFixed(dec) + sfx;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = pfx + end.toFixed(dec) + sfx;
        }
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, {
    threshold:  0.05,
    rootMargin: '0px',
  });

  items.forEach(el => observer.observe(el));
}


/* ============================================================
   12. GENERIC COUNTERS — Data Attribute Driven
       (for stats sections on other pages)
   ============================================================ */

function initCounters() {
  // Avoid double-animating hero counters handled above
  const counters = $$('[data-count]:not(.counter-value)');
  if (!counters.length) return;

  if (reducedMotion()) {
    counters.forEach(el => {
      const end = parseFloat(el.dataset.count);
      const sfx = el.dataset.suffix || '';
      const pfx = el.dataset.prefix || '';
      const dec = +(el.dataset.decimals || 0);
      el.textContent = pfx + end.toFixed(dec) + sfx;
    });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el  = entry.target;
      const end = parseFloat(el.dataset.count);
      const sfx = el.dataset.suffix || '';
      const pfx = el.dataset.prefix || '';
      const dec = +(el.dataset.decimals || 0);
      const dur = 1600;
      const t0  = performance.now();

      function tick(now) {
        const p      = Math.min((now - t0) / dur, 1);
        const eased  = 1 - Math.pow(1 - p, 3);
        el.textContent = pfx + (eased * end).toFixed(dec) + sfx;
        p < 1 ? requestAnimationFrame(tick)
              : (el.textContent = pfx + end.toFixed(dec) + sfx);
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.1 });

  counters.forEach(c => observer.observe(c));
}


/* ============================================================
   13. COMPLIANCE / PROGRESS BARS
   ============================================================ */

function initComplianceBars() {
  const bars = $$('.comp-bar');
  if (!bars.length) return;

  if (reducedMotion()) {
    bars.forEach(b => b.classList.add('animated'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('animated');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  bars.forEach(b => observer.observe(b));
}


/* ============================================================
   14. ACTIVE NAV LINK HIGHLIGHT
   ============================================================ */

function initActiveNav() {
  // Determine current page filename
  const path     = window.location.pathname;
  const page     = path.split('/').pop() || 'index.html';
  const isIndex  = page === '' || page === 'index.html';

  // Desktop nav links
  $$('.nav-link').forEach(link => {
    const href     = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('/').pop().split('#')[0] || 'index.html';

    const match = linkPage === page || (isIndex && linkPage === 'index.html');
    if (match) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });

  // Mobile drawer links
  $$('.drawer-nav-link').forEach(link => {
    const href     = link.getAttribute('href');
    if (!href) return;
    const linkPage = href.split('/').pop().split('#')[0] || 'index.html';
    const match    = linkPage === page || (isIndex && linkPage === 'index.html');

    if (match) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}


/* ============================================================
   15. SMOOTH SCROLL — Anchor Links
   ============================================================ */

function initSmoothScroll() {
  document.addEventListener('click', e => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href || href === '#') return;

    const target = document.querySelector(href);
    if (!target) return;

    e.preventDefault();

    // Calculate offset: announcement bar height + nav height + buffer
    const annoHeight = getAnnouncementHeight();
    const navHeight  = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-height')
    ) || 68;
    const offset     = annoHeight + navHeight + 20;
    const targetTop  = target.getBoundingClientRect().top + window.scrollY - offset;

    window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });

    // Update URL hash without triggering native scroll
    history.pushState(null, '', href);

    // Move focus to target for accessibility
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    setTimeout(() => target.removeAttribute('tabindex'), 1200);
  });
}


/* ============================================================
   16. CONTACT FORM — Validation & Submit
   ============================================================ */

function initContactForm() {
  const form = $('#contactForm') || $('#contact-form');
  if (!form) return;

  // Field registry — maps field key → { el, rules }
  const fields = {
    name:    { el: form.querySelector('#field-name'),    rules: ['required', 'minlength:2'] },
    email:   { el: form.querySelector('#field-email'),   rules: ['required', 'email'] },
    company: { el: form.querySelector('#field-company'), rules: ['required'] },
    service: { el: form.querySelector('#field-service'), rules: [] },
    message: { el: form.querySelector('#field-message'), rules: ['required', 'minlength:20'] },
  };

  // Validation rules engine
  function validate(key, value) {
    const { rules } = fields[key];
    for (const rule of rules) {
      if (rule === 'required' && !value.trim()) {
        return 'This field is required.';
      }
      if (rule === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
        return 'Please enter a valid professional email address.';
      }
      if (rule.startsWith('minlength:')) {
        const min = parseInt(rule.split(':')[1]);
        if (value.trim().length < min) return `Minimum ${min} characters required.`;
      }
    }
    return null;
  }

  function showError(key, msg) {
    const { el } = fields[key];
    if (!el) return;
    el.classList.add('error');
    el.setAttribute('aria-invalid', 'true');
    const errEl = form.querySelector(`#error-${key}`);
    if (errEl) errEl.textContent = msg;
  }

  function clearError(key) {
    const { el } = fields[key];
    if (!el) return;
    el.classList.remove('error');
    el.setAttribute('aria-invalid', 'false');
    const errEl = form.querySelector(`#error-${key}`);
    if (errEl) errEl.textContent = '';
  }

  // Live validation on blur / input
  Object.keys(fields).forEach(key => {
    const { el } = fields[key];
    if (!el) return;
    el.addEventListener('blur', () => {
      const err = validate(key, el.value);
      err ? showError(key, err) : clearError(key);
    });
    el.addEventListener('input', () => {
      if (el.classList.contains('error')) {
        const err = validate(key, el.value);
        err ? showError(key, err) : clearError(key);
      }
    });
  });

  // Submit handler
  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate all fields
    let hasErrors = false;
    Object.keys(fields).forEach(key => {
      const { el } = fields[key];
      if (!el) return;
      const err = validate(key, el.value);
      if (err) { showError(key, err); hasErrors = true; }
      else clearError(key);
    });

    if (hasErrors) {
      // Focus first invalid field
      const firstErr = form.querySelector('.form-control.error');
      if (firstErr) firstErr.focus();
      return;
    }

    // Loading state
    const submitBtn  = form.querySelector('[type="submit"]');
    const successEl  = $('#formSuccess') || form.parentElement?.querySelector('.form-success');

    if (submitBtn) {
      submitBtn.disabled               = true;
      submitBtn.dataset.originalText   = submitBtn.textContent;
      const origInner                  = submitBtn.innerHTML;
      submitBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
             style="animation:spin 0.9s linear infinite" aria-hidden="true">
          <path d="M21 12a9 9 0 11-3.2-6.9"/>
        </svg>
        Sending&hellip;`;
      submitBtn.dataset.origInner = origInner;
    }

    // Add spin keyframe if not already present
    if (!document.getElementById('vaptly-spin-style')) {
      const s = document.createElement('style');
      s.id = 'vaptly-spin-style';
      s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(s);
    }

    // ── Replace this block with your actual API/Formspree/backend call ──
    try {
      await new Promise(resolve => setTimeout(resolve, 1400));

      // Success state
      form.style.transition = 'opacity 0.3s ease';
      form.style.opacity    = '0';
      setTimeout(() => {
        form.style.display = 'none';
        if (successEl) {
          successEl.classList.add('visible');
          successEl.style.display = 'block';
          successEl.setAttribute('tabindex', '-1');
          successEl.focus();
        }
      }, 320);
    } catch (err) {
      // Restore button on failure
      console.error('[Vaptly] Form submission error:', err);
      if (submitBtn) {
        submitBtn.disabled   = false;
        submitBtn.innerHTML  = submitBtn.dataset.origInner || 'Submit';
      }
    }
    // ─────────────────────────────────────────────────────────────────────
  });
}


/* ============================================================
   17. GLOBE CANVAS — Hero (index.html only)
   ============================================================ */

function initGlobe() {
  const canvas = $('#globeCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, cx, cy, radius, animId;

  const DOTS      = 320;
  const DOT_R     = 1.4;
  const LINES     = 28;
  const ROT_SPEED = reducedMotion() ? 0 : 0.0013;

  let angle = 0;

  // Distribute dots using golden-angle spiral for uniform coverage
  const dots = Array.from({ length: DOTS }, (_, i) => {
    const theta = Math.acos(1 - (2 * (i + 0.5)) / DOTS);
    const phi   = Math.PI * (1 + Math.sqrt(5)) * i;
    return { theta, phi };
  });

  const connections = Array.from({ length: LINES }, () => ({
    a:        Math.floor(Math.random() * DOTS),
    b:        Math.floor(Math.random() * DOTS),
    progress: Math.random(),
    speed:    0.004 + Math.random() * 0.006,
    active:   Math.random() > 0.35,
  }));

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // FIX: Use hero section dimensions as fallback —
    // canvas.offsetWidth is 0 on mobile before layout settles
    const hero = canvas.closest('.hero') || canvas.parentElement?.parentElement;
    W = canvas.offsetWidth  || hero?.offsetWidth  || window.innerWidth;
    H = canvas.offsetHeight || hero?.offsetHeight || window.innerHeight;

    if (W === 0 || H === 0) return;

    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    ctx.scale(dpr, dpr);
    cx     = W / 2;
    cy     = H / 2;
    radius = Math.min(W, H) * 0.38;
  }

  function project(theta, phi) {
    const sinT = Math.sin(theta);
    const x    = sinT * Math.cos(phi + angle);
    const y    = Math.cos(theta);
    const z    = sinT * Math.sin(phi + angle);
    const s    = (z + 2) / 3;
    return {
      x:       cx + x * radius,
      y:       cy - y * radius,
      z,
      scale:   s,
      visible: z > -0.25,
    };
  }

  function drawGrid() {
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth   = 0.5;

    const GRID = 10;

    // Latitude lines
    for (let i = 0; i <= GRID; i++) {
      const theta = (i / GRID) * Math.PI;
      ctx.beginPath();
      let lifted = true;
      for (let j = 0; j <= 64; j++) {
        const phi = (j / 64) * Math.PI * 2;
        const p   = project(theta, phi);
        if (p.visible) {
          lifted ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
          lifted = false;
        } else {
          lifted = true;
        }
      }
      ctx.stroke();
    }

    // Longitude lines
    for (let i = 0; i <= GRID * 2; i++) {
      const phi = (i / (GRID * 2)) * Math.PI * 2;
      ctx.beginPath();
      let lifted = true;
      for (let j = 0; j <= 64; j++) {
        const theta = (j / 64) * Math.PI;
        const p     = project(theta, phi);
        if (p.visible) {
          lifted ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
          lifted = false;
        } else {
          lifted = true;
        }
      }
      ctx.stroke();
    }
  }

  function drawConnections() {
    connections.forEach(conn => {
      if (!conn.active) return;

      const a = project(dots[conn.a].theta, dots[conn.a].phi);
      const b = project(dots[conn.b].theta, dots[conn.b].phi);
      if (!a.visible || !b.visible) return;

      conn.progress += conn.speed;
      if (conn.progress > 1.4) {
        conn.progress = 0;
        conn.a = Math.floor(Math.random() * DOTS);
        conn.b = Math.floor(Math.random() * DOTS);
      }

      const prog = clamp(conn.progress, 0, 1);
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0,    'rgba(200,16,46,0)');
      grad.addColorStop(prog, 'rgba(200,16,46,0.52)');
      grad.addColorStop(1,    'rgba(200,16,46,0)');

      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth   = 0.85;
      ctx.stroke();
    });
  }

  function drawDots() {
    dots.forEach(dot => {
      const p = project(dot.theta, dot.phi);
      if (!p.visible) return;
      const alpha = 0.12 + p.scale * 0.52;
      ctx.beginPath();
      ctx.arc(p.x, p.y, DOT_R * p.scale, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawConnections();
    drawDots();
    angle  += ROT_SPEED;
    animId  = requestAnimationFrame(draw);
  }

  // FIX: Double RAF ensures DOM dimensions are real on mobile before drawing
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      resize();
      if (!reducedMotion()) {
        animId = requestAnimationFrame(draw);
      }
    });
  });

  // FIX: Restart draw loop after resize, not just resize canvas
  window.addEventListener('resize', debounce(() => {
    cancelAnimationFrame(animId);
    resize();
    if (!reducedMotion()) animId = requestAnimationFrame(draw);
  }, 200), { passive: true });

  // FIX: Handle mobile orientation change (portrait ↔ landscape)
  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      cancelAnimationFrame(animId);
      resize();
      if (!reducedMotion()) animId = requestAnimationFrame(draw);
    }, 300);
  });

  // Pause when tab is hidden to save battery
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else if (!reducedMotion()) {
      animId = requestAnimationFrame(draw);
    }
  });
}



/* ============================================================
   18. LAZY IMAGE LOADING — data-src fallback
   ============================================================ */

function initLazyImages() {
  const imgs = $$('img[data-src]');
  if (!imgs.length) return;

  if (!('IntersectionObserver' in window)) {
    // Fallback for old browsers — load all immediately
    imgs.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img  = entry.target;
      img.src    = img.dataset.src;
      img.removeAttribute('data-src');
      observer.unobserve(img);
    });
  }, { rootMargin: '200px 0px' });

  imgs.forEach(img => observer.observe(img));
}


/* ============================================================
   19. CARD TILT — Desktop Hover Effect
   ============================================================ */

function initCardTilt() {
  // Only on desktop with fine pointer (mouse)
  if (reducedMotion() || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const cards   = $$('.product-teaser-card, .service-card, .why-card');
  const STRENGTH = 5;

  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s ease';
    });

    card.addEventListener('mousemove', e => {
      const rect  = card.getBoundingClientRect();
      const x     = e.clientX - rect.left;
      const y     = e.clientY - rect.top;
      const rotY  =  ((x - rect.width  / 2) / (rect.width  / 2)) * STRENGTH;
      const rotX  = -((y - rect.height / 2) / (rect.height / 2)) * STRENGTH;
      card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-3px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.4s ease';
      card.style.transform  = '';
    });
  });
}


/* ============================================================
   20. COPY TO CLIPBOARD
   ============================================================ */

function initCopyButtons() {
  $$('[data-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const text = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        const orig         = btn.innerHTML;
        btn.innerHTML      = `
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.8" stroke-linecap="round"
               stroke-linejoin="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied`;
        btn.style.color    = 'var(--color-success)';
        setTimeout(() => {
          btn.innerHTML  = orig;
          btn.style.color = '';
        }, 2000);
      } catch {
        // Clipboard API not available
      }
    });
  });
}


/* ============================================================
   21. TOOLTIP — Lightweight, no library
   ============================================================ */

function initTooltips() {
  const els = $$('[data-tooltip]');
  if (!els.length) return;

  // Create shared tooltip element
  const tip = document.createElement('div');
  tip.setAttribute('role', 'tooltip');
  tip.style.cssText = `
    position: fixed;
    z-index: 9998;
    background: #1a1a2e;
    color: rgba(255,255,255,0.88);
    font-size: 0.74rem;
    font-weight: 500;
    line-height: 1.45;
    padding: 0.38rem 0.78rem;
    border-radius: 5px;
    pointer-events: none;
    opacity: 0;
    transition: opacity 0.18s ease;
    white-space: normal;
    max-width: 220px;
    box-shadow: 0 4px 18px rgba(0,0,0,0.25);
  `;
  document.body.appendChild(tip);

  function position(e) {
    const pad = 14;
    let x = e.clientX + pad;
    let y = e.clientY + pad;
    if (x + tip.offsetWidth  > window.innerWidth)  x = e.clientX - tip.offsetWidth  - pad;
    if (y + tip.offsetHeight > window.innerHeight)  y = e.clientY - tip.offsetHeight - pad;
    tip.style.left = x + 'px';
    tip.style.top  = y + 'px';
  }

  els.forEach(el => {
    const id = 'vaptly-tip-' + Math.random().toString(36).slice(2, 7);
    tip.id   = id;
    el.setAttribute('aria-describedby', id);

    el.addEventListener('mouseenter', e => {
      tip.textContent = el.dataset.tooltip;
      tip.style.opacity = '1';
      position(e);
    });
    el.addEventListener('mousemove', position);
    el.addEventListener('mouseleave', () => { tip.style.opacity = '0'; });
    el.addEventListener('focus', () => {
      tip.textContent   = el.dataset.tooltip;
      tip.style.opacity = '1';
      const r = el.getBoundingClientRect();
      tip.style.left = r.left + 'px';
      tip.style.top  = (r.bottom + 8) + 'px';
    });
    el.addEventListener('blur', () => { tip.style.opacity = '0'; });
  });
}


/* ============================================================
   22. FOCUS TRAP — Accessibility Utility
       Returns a cleanup function to remove the trap.
   ============================================================ */

function trapFocus(container) {
  const selectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  const focusable = $$( selectors, container).filter(
    el => !el.hasAttribute('disabled') && el.offsetParent !== null
  );

  if (!focusable.length) return () => {};

  const first = focusable[0];
  const last  = focusable[focusable.length - 1];

  function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus(); }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
    }
  }

  container.addEventListener('keydown', handler);
  return () => container.removeEventListener('keydown', handler);
}


/* ============================================================
   23. GLOBAL ERROR BOUNDARY
   ============================================================ */

window.addEventListener('error', e => {
  console.warn('[Vaptly JS Error]', e.message, '—', e.filename, 'line', e.lineno);
});

window.addEventListener('unhandledrejection', e => {
  console.warn('[Vaptly Unhandled Promise]', e.reason);
});


/* ============================================================
   24. INIT — Bootstrap All Modules on DOM Ready
   ============================================================ */

onReady(() => {
  // Core UI — order matters: bar must init before header
  initAnnouncementBar();
  initHeader();
  initDrawer();
  initDropdowns();

  // Page utilities
  initScrollProgress();
  initBackToTop();
  initActiveNav();
  initSmoothScroll();

  // Animations — after layout is stable
  initScrollReveal();
  initStaggerChildren();
  initHeroCounters();
  initCounters();
  initComplianceBars();

  // Page-specific
  initContactForm();
  initGlobe();

  // Progressive enhancements
  initLazyImages();
  initCardTilt();
  initCopyButtons();
  initTooltips();
});
