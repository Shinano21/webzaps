/* ─── ZAPS SOLUTIONS INC. — Improved JavaScript ─── */
/* Performance-optimized, class-based, no inline styles */

(function () {
  'use strict';

  // ─── UTILITIES ───
  const qs  = (s, ctx = document) => ctx.querySelector(s);
  const qsa = (s, ctx = document) => ctx.querySelectorAll(s);
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ─── DOM READY ───
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    setupNav();
    setupScrollReveal();
    setupActiveNav();
    if (!prefersReducedMotion) {
      setupHeroMouseParallax();
      setupScrollParallax();
    }
    suppressMissingBgImages();
  }

  // ─── NAV: scroll class + mobile drawer ───
  function setupNav() {
    const nav     = qs('nav');
    const menuBtn = qs('.mobile-menu-btn');
    const drawer  = qs('.nav-drawer');
    if (!nav) return;

    // Scroll-based nav class (no inline style)
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 80);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // Mobile drawer toggle
    if (!menuBtn || !drawer) return;

    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-controls', 'nav-drawer');
    drawer.id = 'nav-drawer';

    menuBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(isOpen));
      menuBtn.innerHTML = isOpen ? iconX() : iconMenu();
    });

    // Close on link click
    qsa('a', drawer).forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = iconMenu();
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!nav.contains(e.target) && !drawer.contains(e.target)) {
        drawer.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = iconMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && drawer.classList.contains('open')) {
        drawer.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.innerHTML = iconMenu();
        menuBtn.focus();
      }
    });
  }

  // ─── SCROLL REVEAL ───
  function setupScrollReveal() {
    const els = qsa('.reveal');
    if (!els.length) return;

    // If reduced motion, just show everything immediately
    if (prefersReducedMotion) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target); // fire once only
        }
      });
    }, { threshold: 0.12 });

    els.forEach(el => observer.observe(el));
  }

  // ─── ACTIVE NAV LINKS ───
  function setupActiveNav() {
    const sections  = qsa('section[id]');
    const navLinks  = qsa('.nav-links a');
    if (!sections.length || !navLinks.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${entry.target.id}`
            );
          });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  // ─── HERO MOUSE PARALLAX ───
  function setupHeroMouseParallax() {
    const heroBg = qs('.hero-bg-img');
    if (!heroBg) return;

    let rafId = null;
    let targetX = 0, targetY = 0;
    let currentX = 0, currentY = 0;

    document.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth  - 0.5) * 14;
      targetY = (e.clientY / window.innerHeight - 0.5) * 14;
    });

    function animate() {
      // Lerp for smooth follow
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      heroBg.style.transform = `translate(${currentX}px, ${currentY}px) scale(1.05)`;
      rafId = requestAnimationFrame(animate);
    }
    animate();
  }

  // ─── SCROLL PARALLAX (desktop only, throttled via rAF) ───
  function setupScrollParallax() {
    if (window.innerWidth <= 900) return;

    const items = [
      { el: qs('.hero-bg-img'),     speed: 0.35 },
      { el: qs('.pharmcle-bg-img'), speed: 0.28 },
      { el: qs('.about-bg-img'),    speed: 0.28 },
      { el: qs('.iptmf-bg-img'),    speed: 0.28 },
      { el: qs('.services-bg-img'), speed: 0.28 },
      { el: qs('.team-bg-img'),     speed: 0.28 },
      { el: qs('.contact-bg-img'),  speed: 0.28 },
    ].filter(i => i.el !== null);

    if (!items.length) return;

    let ticking = false;

    function applyParallax() {
      const scrollY = window.scrollY;
      items.forEach(({ el, speed }) => {
        const section  = el.closest('section') || el.parentElement;
        const rect     = section.getBoundingClientRect();
        // Only process if near viewport
        if (rect.bottom < -200 || rect.top > window.innerHeight + 200) return;
        const sectionTop = rect.top + scrollY;
        const offset     = (scrollY - sectionTop) * speed;
        el.style.transform = `translateY(${offset}px)`;
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(applyParallax);
        ticking = true;
      }
    }, { passive: true });

    applyParallax();

    // Re-check on resize
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 900) {
        items.forEach(({ el }) => { el.style.transform = ''; });
      }
    });
  }

  // ─── SUPPRESS MISSING BG IMAGES ───
  function suppressMissingBgImages() {
    qsa('[class$="-bg-img"]').forEach(el => {
      const url = getComputedStyle(el).backgroundImage;
      if (!url || url === 'none' || url === 'url("")') {
        el.style.opacity = '0';
      }
    });
  }

  // ─── ICON HELPERS ───
  function iconMenu() {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;
  }
  function iconX() {
    return `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  }

})();
