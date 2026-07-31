/* Grandma Mei's Herbal Remedies — shared site behavior
   Vanilla JS only: scroll reveals, SVG draw-on-scroll (dividers + vines),
   falling leaves, parallax botanicals, email modal, mobile nav, motes.
   Every effect respects prefers-reduced-motion. */

(function () {
  'use strict';

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.querySelector('.nav-toggle');
  var siteNav = document.querySelector('.site-nav');
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', function () {
      var open = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  /* ---------- Scroll-triggered reveals ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Self-drawing SVGs: dividers AND corner vines ---------- */
  var drawEls = document.querySelectorAll('[data-draw]');
  drawEls.forEach(function (host) {
    host.querySelectorAll('path').forEach(function (path) {
      try {
        var len = Math.ceil(path.getTotalLength());
        path.style.setProperty('--path-len', len);
        path.style.strokeDasharray = len;
        path.style.strokeDashoffset = len;
      } catch (e) { /* non-rendered SVG; skip */ }
    });
  });
  if (!reducedMotion && 'IntersectionObserver' in window) {
    var drawObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-drawn');
          drawObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    drawEls.forEach(function (d) { drawObserver.observe(d); });
  } else {
    drawEls.forEach(function (d) {
      d.querySelectorAll('path').forEach(function (p) {
        p.style.strokeDasharray = 'none';
        p.style.strokeDashoffset = '0';
      });
    });
  }

  /* ---------- Falling leaves ---------- */
  var LEAF_SHAPES = [
    // simple pointed leaf — jade
    '<svg viewBox="0 0 24 24" fill="none" stroke="#1F4B3F" stroke-width="1.3" stroke-linecap="round"><path d="M12 2 C 19 8, 19 17, 12 22 C 5 17, 5 8, 12 2 Z"/><path d="M12 5 V 19"/></svg>',
    // rounder leaf — gold
    '<svg viewBox="0 0 24 24" fill="rgba(201,162,75,0.16)" stroke="#C9A24B" stroke-width="1.2" stroke-linecap="round"><path d="M12 3 C 20 7, 21 16, 12 21 C 3 16, 4 7, 12 3 Z"/><path d="M12 6 V 18 M12 10 C 14.5 9, 16 7.5, 16.5 6 M12 14 C 9.5 13, 8 11.5, 7.5 10"/></svg>',
    // ginkgo-ish fan — jade, light fill
    '<svg viewBox="0 0 24 24" fill="rgba(31,75,63,0.12)" stroke="#2E6353" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21 V 14 M12 14 C 4 14, 3 7, 5 3 C 9 6, 11 9, 12 14 C 13 9, 15 6, 19 3 C 21 7, 20 14, 12 14 Z"/></svg>'
  ];
  document.querySelectorAll('.leaves').forEach(function (host) {
    if (reducedMotion) return;
    var COUNT = 9;
    for (var i = 0; i < COUNT; i++) {
      var leaf = document.createElement('span');
      leaf.className = 'leaf-fall';
      leaf.innerHTML = LEAF_SHAPES[i % LEAF_SHAPES.length];
      leaf.setAttribute('aria-hidden', 'true');
      var size = 13 + Math.random() * 13;
      leaf.style.width = size + 'px';
      leaf.style.height = size + 'px';
      leaf.style.left = (Math.random() * 100) + '%';
      leaf.style.setProperty('--leaf-x', (Math.random() * 160 - 80) + 'px');
      leaf.style.setProperty('--leaf-r', (120 + Math.random() * 300) + 'deg');
      leaf.style.animationDuration = (13 + Math.random() * 14) + 's';
      leaf.style.animationDelay = (Math.random() * 20) + 's';
      var sway = leaf.querySelector('svg');
      if (sway) {
        sway.style.animationDuration = (2.2 + Math.random() * 2) + 's';
        sway.style.animationDelay = (Math.random() * 2) + 's';
      }
      host.appendChild(leaf);
    }
  });

  /* ---------- Parallax botanicals ---------- */
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if (parallaxEls.length && !reducedMotion) {
    var ticking = false;
    var updateParallax = function () {
      var y = window.scrollY || window.pageYOffset;
      parallaxEls.forEach(function (el) {
        var factor = parseFloat(el.getAttribute('data-parallax')) || 0.08;
        el.style.transform = 'translate3d(0,' + (y * factor).toFixed(1) + 'px,0)';
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { window.requestAnimationFrame(updateParallax); ticking = true; }
    }, { passive: true });
    updateParallax();
  }

  /* ---------- Ambient dust motes ---------- */
  var moteHost = document.querySelector('.motes');
  if (moteHost && !reducedMotion) {
    for (var m = 0; m < 12; m++) {
      var mote = document.createElement('span');
      mote.className = 'mote';
      mote.style.left = (Math.random() * 100) + '%';
      mote.style.setProperty('--drift-x', (Math.random() * 80 - 40) + 'px');
      mote.style.animationDuration = (14 + Math.random() * 14) + 's';
      mote.style.animationDelay = (Math.random() * 18) + 's';
      var msize = 3 + Math.random() * 4;
      mote.style.width = msize + 'px';
      mote.style.height = msize + 'px';
      moteHost.appendChild(mote);
    }
  }

  /* ---------- First-visit email capture modal (soft gate) ---------- */
  var overlay = document.getElementById('email-modal');
  if (overlay) {
    var STORAGE_KEY = 'gm_modal_seen';
    var seen = null;
    try { seen = localStorage.getItem(STORAGE_KEY); } catch (e) {}

    var openModal = function () {
      overlay.classList.add('is-open');
      overlay.removeAttribute('aria-hidden');
      var btn = overlay.querySelector('.modal__close');
      if (btn) btn.focus();
    };
    var closeModal = function () {
      overlay.classList.remove('is-open');
      overlay.setAttribute('aria-hidden', 'true');
      try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
    };

    if (!seen) { setTimeout(openModal, 2500); }

    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closeModal();
    });
    var closeBtn = overlay.querySelector('.modal__close');
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal();
    });
    document.querySelectorAll('[data-open-modal]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        overlay.classList.add('is-open');
        overlay.removeAttribute('aria-hidden');
      });
    });
  }

  /* ---------- Lazy-load below-the-fold images ---------- */
  document.querySelectorAll('img[data-lazy]').forEach(function (img) {
    img.loading = 'lazy';
  });
})();
