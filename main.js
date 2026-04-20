import { initChart as initUndernourishment, driveChart } from './charts/undernourishment.js';
import { initChart as initFoodWaste, revealChart as revealFoodWaste } from './charts/food-waste.js';
import { initChart as initStunting, revealChart as revealStunting } from './charts/stunting.js';
import { initRegionalGlobe } from './globe.js';

const { gsap, ScrollTrigger, ScrollToPlugin } = window;
gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

// ── Smooth scroll (native — macOS handles momentum perfectly) ─
function initSmoothScroll() {
  // Don't intercept wheel events — macOS inertia scroll is already smooth.
  // Just handle nav anchor clicks with a GSAP tween for a polished feel.
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const dest = Math.round(target.getBoundingClientRect().top + window.scrollY - 60);
      gsap.to(window, {
        scrollTo: { y: dest, autoKill: true },
        duration: 0.8,
        ease: 'power2.inOut',
        onUpdate: () => ScrollTrigger.update(),
      });
    });
  });
}

// ── Scroll parallax ────────────────────────────────────────
function initParallax() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  // Subtle upward drift on section headings
  document.querySelectorAll('#intro h2, #chart3 h2, .un-image-section h2, #cta .cta-headline').forEach(el => {
    gsap.fromTo(el, { y: 40 }, {
      y: -20,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });

  // Pull-quote floats up slightly
  gsap.fromTo('#message .pull-quote', { y: 60 }, {
    y: -30,
    ease: 'none',
    scrollTrigger: { trigger: '#message', start: 'top bottom', end: 'bottom top', scrub: true },
  });

  // UN image plates have a gentle scale+translate reveal
  document.querySelectorAll('.image-plate').forEach(plate => {
    gsap.fromTo(plate, { scale: 0.96, opacity: 0.6 }, {
      scale: 1, opacity: 1,
      ease: 'none',
      scrollTrigger: { trigger: plate, start: 'top 90%', end: 'top 30%', scrub: true },
    });
  });
}

// ── Particles ──────────────────────────────────────────────
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -Math.random() * 0.25 - 0.05,
      alpha: Math.random() * 0.25 + 0.05,
    };
  }

  resize();
  particles = Array.from({ length: 50 }, makeParticle);
  window.addEventListener('resize', resize);

  function tick() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.y < -4 || p.x < -4 || p.x > W + 4) Object.assign(p, makeParticle(), { y: H + 4 });
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232,163,61,${p.alpha})`;
      ctx.fill();
    });
    requestAnimationFrame(tick);
  }
  tick();
}

// ── Hero intro ─────────────────────────────────────────────
function initHero() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    document.querySelectorAll('.hero-eyebrow, .hero-headline .word-inner, .hero-subhead, .scroll-hint').forEach(el => {
      el.style.opacity = 1;
      el.style.transform = 'none';
    });
    return;
  }

  const tl = gsap.timeline({ id: 'heroIntro', defaults: { ease: 'expo.out' } });
  tl.to('.hero-eyebrow', { opacity: 1, y: 0, duration: 1, delay: 0.3 })
    .to('.hero-headline .word-inner', {
      opacity: 1, y: '0%', duration: 1.1, stagger: 0.12, ease: 'power3.out'
    }, '-=0.6')
    .to('.hero-subhead', { opacity: 1, y: 0, duration: 0.9 }, '-=0.5')
    .to('.scroll-hint',  { opacity: 1, duration: 0.6 }, '-=0.2');
}

// ── Nav reveal ─────────────────────────────────────────────
function initNav() {
  const nav = document.querySelector('.site-nav');
  ScrollTrigger.create({
    trigger: '#intro',
    start: 'top 80%',
    onEnter: () => nav.classList.add('visible'),
    onLeaveBack: () => nav.classList.remove('visible'),
  });
}

// ── Section 2 — intro ──────────────────────────────────────
function initIntro() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    document.querySelectorAll('#intro .section-body p, #intro .amber-rule').forEach(el => {
      el.style.opacity = 1; el.style.width = '100%'; el.style.transform = 'none';
    });
    return;
  }
  gsap.to('#intro .amber-rule', {
    width: '100%', duration: 0.8, ease: 'power2.out',
    scrollTrigger: { trigger: '#intro', start: 'top 70%' }
  });
  gsap.to('#intro .section-body p', {
    opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
    scrollTrigger: { trigger: '#intro .section-body', start: 'top 75%' }
  });
}

// ── Section 3 — pull quote ─────────────────────────────────
function initPullQuote() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const words = document.querySelectorAll('#message .pull-quote blockquote .word');
  if (prefersReduced) {
    words.forEach(w => { w.style.opacity = 1; w.style.transform = 'none'; });
    return;
  }
  gsap.to('#message .pull-quote blockquote .word', {
    id: 'pullQuoteReveal',
    opacity: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power2.out',
    scrollTrigger: { trigger: '#message', start: 'top 65%' }
  });
}



// ── Section 4 — pinned chart ───────────────────────────────
function initChart1() {
  const container = document.getElementById('chart1-container');
  if (!container) return;

  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const annotationCards = gsap.utils.toArray('#chart1-wrapper .annotation-card');
  const annotationWindows = [
    { start: 0.02, end: 0.42 },
    { start: 0.42, end: 0.72 },
    { start: 0.72, end: 1.1 },
  ];

  const clamp01 = value => Math.max(0, Math.min(1, value));
  const smoothStep = (start, end, value) => {
    const t = clamp01((value - start) / (end - start));
    return t * t * (3 - 2 * t);
  };
  const setAnnotationProgress = progress => {
    const fade = 0.05;
    annotationCards.forEach((card, i) => {
      const { start, end } = annotationWindows[i];
      const fadeIn = smoothStep(start, start + fade, progress);
      const fadeOut = i === annotationWindows.length - 1
        ? 1
        : 1 - smoothStep(end - fade, end, progress);
      const opacity = clamp01(fadeIn * fadeOut);
      gsap.set(card, {
        opacity,
        y: (1 - opacity) * 24,
        pointerEvents: opacity > 0.9 ? 'auto' : 'none',
      });
    });
  };

  // Create the ScrollTrigger pin SYNCHRONOUSLY so GSAP measures the
  // correct scroll position before any async work shifts things.
  let pinnedST = null;
  if (!isMobile && !prefersReduced) {
    const wrapper = document.getElementById('chart1-wrapper');
    pinnedST = ScrollTrigger.create({
      id: 'pinnedChart1',
      trigger: wrapper,
      start: 'top top',
      end: '+=3000',
      pin: true,
      pinSpacing: true,
      anticipatePins: 1,          // pre-computes pin position for fast scroll
      scrub: 0.5,                 // faster scrub feels more responsive
      onUpdate(self) {
        driveChart(container, self.progress);
        setAnnotationProgress(self.progress);
      },
    });
    setAnnotationProgress(pinnedST.progress);
    // Keep the wrapper below the hero in stacking context
    wrapper.style.zIndex = '0';
  }

  // Fetch data + render D3 async; apply current progress once ready
  initUndernourishment(container).then(() => {
    if (isMobile || prefersReduced) {
      driveChart(container, 1);
      document.querySelectorAll('.annotation-card').forEach(card => {
        card.style.opacity = 1; card.style.transform = 'none';
        card.style.pointerEvents = 'auto';
      });
    } else if (pinnedST) {
      driveChart(container, pinnedST.progress);
      setAnnotationProgress(pinnedST.progress);
    }
  });
}

// ── Section 5 — food waste ─────────────────────────────────
function initChart2() {
  const container = document.getElementById('chart2-container');
  if (!container) return;

  // Build chart (bars start at width 0)
  initFoodWaste(container);

  // Animate bars in when section scrolls into view
  ScrollTrigger.create({
    trigger: '#chart2',
    start: 'top 78%',
    once: true,
    onEnter() { revealFoodWaste(container); },
  });

  // Animate the big counter
  const numEl = document.querySelector('.big-number');
  if (numEl) {
    ScrollTrigger.create({
      trigger: '#chart2',
      start: 'top 85%',
      once: true,
      onEnter() {
        let val = 0;
        const target = 1.05;
        const step = target / 60;
        const timer = setInterval(() => {
          val = Math.min(val + step, target);
          numEl.textContent = `${val.toFixed(2)}B+`;
          if (val >= target) clearInterval(timer);
        }, 16);
      },
    });
  }
}

// ── Section 6 — stunting ───────────────────────────────────
function initChart3() {
  const container = document.getElementById('chart3-container');
  if (!container) return;

  requestAnimationFrame(() => {
    initStunting(container);
    ScrollTrigger.create({
      trigger: '#chart3',
      start: 'top 75%',
      once: true,
      onEnter() { revealStunting(container); },
    });
  });
}

// ── Mouse / interactive background ─────────────────────────
function initMouseEffects() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;
  const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const glow = document.createElement('div');
  glow.className = 'cursor-glow';
  document.body.appendChild(glow);

  let siteCursor = null;
  const interactiveSelector = [
    'a',
    'button',
    '[role="button"]',
    'input',
    'select',
    'textarea',
    'summary',
    '.bar-rect',
    '.action-card',
    '.globe-region-controls button',
    '.globe-viewport',
  ].join(',');
  const dragSelector = '.globe-viewport, #regional-globe-canvas';

  function scatterGlints(x, y) {
    if (!supportsFinePointer) return;
    for (let i = 0; i < 4; i += 1) {
      const glint = document.createElement('span');
      glint.className = 'cursor-glint';
      glint.style.left = `${x}px`;
      glint.style.top = `${y}px`;
      glint.style.setProperty('--glint-x', `${(Math.random() - 0.5) * 42}px`);
      glint.style.setProperty('--glint-y', `${-10 - Math.random() * 28}px`);
      glint.style.setProperty('--glint-rot', `${-70 + Math.random() * 140}deg`);
      document.body.appendChild(glint);
      glint.addEventListener('animationend', () => glint.remove(), { once: true });
    }
  }

  if (supportsFinePointer) {
    document.body.classList.add('custom-cursor-enabled');

    siteCursor = document.createElement('div');
    siteCursor.className = 'site-cursor';
    siteCursor.setAttribute('aria-hidden', 'true');
    siteCursor.innerHTML = `
      <span class="site-cursor__halo"></span>
      <span class="site-cursor__marker"></span>
    `;
    document.body.appendChild(siteCursor);

    const setCursorState = target => {
      const closest = target?.closest?.bind(target);
      siteCursor.classList.toggle('is-hovering', Boolean(closest?.(interactiveSelector)));
      siteCursor.classList.toggle('is-drag-target', Boolean(closest?.(dragSelector)));
    };

    document.addEventListener('pointerdown', e => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      siteCursor.classList.add('is-pressing');
      siteCursor.classList.toggle('is-dragging', Boolean(e.target.closest?.(dragSelector)));
      scatterGlints(e.clientX, e.clientY);
    });
    document.addEventListener('pointerup', () => {
      siteCursor.classList.remove('is-pressing', 'is-dragging');
    });
    document.addEventListener('pointerover', e => setCursorState(e.target));
    document.addEventListener('pointerout', e => {
      if (!e.relatedTarget) siteCursor.classList.remove('is-visible', 'is-hovering', 'is-drag-target', 'is-dragging');
    });
    window.addEventListener('blur', () => {
      siteCursor.classList.remove('is-visible', 'is-hovering', 'is-drag-target', 'is-dragging', 'is-pressing');
    });
  }

  let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
  let cx = tx, cy = ty;
  document.addEventListener('pointermove', e => {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    tx = e.clientX;
    ty = e.clientY;
    if (siteCursor) {
      siteCursor.classList.add('is-visible');
      siteCursor.style.transform = `translate3d(${tx - 18}px, ${ty - 18}px, 0)`;
    }
  });

  const heroBg = document.querySelector('.hero-bg');
  function lerp(a, b, t) { return a + (b - a) * t; }

  (function animGlow() {
    cx = lerp(cx, tx, 0.08);
    cy = lerp(cy, ty, 0.08);
    glow.style.left = cx + 'px';
    glow.style.top  = cy + 'px';

    if (heroBg) {
      const hero = document.getElementById('hero');
      const hr = hero.getBoundingClientRect();
      if (hr.bottom > 0 && hr.top < window.innerHeight) {
        const xPct = (tx / window.innerWidth) * 100;
        const yPct = 70 + (cy / window.innerHeight) * 40;
        heroBg.style.background =
          `radial-gradient(ellipse 90% 65% at ${xPct}% ${yPct}%, rgba(232,163,61,0.22) 0%, transparent 68%), var(--bg-0)`;
      }
    }
    requestAnimationFrame(animGlow);
  })();

  // Floating orbs on key sections
  [
    { sel: '#message',  x: '20%', y: '50%' },
    { sel: '#chart3',   x: '80%', y: '30%' },
    { sel: '#cta',      x: '50%', y: '80%' },
  ].forEach(({ sel, x, y }) => {
    const sec = document.querySelector(sel);
    if (!sec) return;
    const orb = document.createElement('div');
    orb.className = 'section-orb';
    orb.style.cssText = `left:${x};top:${y};transform:translate(-50%,-50%);`;
    sec.style.position = 'relative';
    sec.style.overflow = 'hidden';
    sec.appendChild(orb);
    gsap.to(orb, { x: '+=60', y: '+=40', duration: 6 + Math.random() * 3, repeat: -1, yoyo: true, ease: 'sine.inOut' });
  });
}

// ── Section 9 — CTA ────────────────────────────────────────
function initCTA() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    document.querySelectorAll('.cta-headline .line, .cta-subhead, .action-card').forEach(el => {
      el.style.opacity = 1; el.style.transform = 'none';
    });
    return;
  }

  gsap.to('.cta-headline .line', {
    opacity: 1, y: 0, duration: 0.9, stagger: 0.25, ease: 'power3.out',
    scrollTrigger: { trigger: '#cta', start: 'top 70%' }
  });
  gsap.to('.cta-subhead', {
    opacity: 1, duration: 0.7, ease: 'power2.out', delay: 0.6,
    scrollTrigger: { trigger: '#cta', start: 'top 65%' }
  });
  gsap.to('.action-card', {
    opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out',
    scrollTrigger: { trigger: '.action-cards', start: 'top 80%' }
  });
}

// ── Boot ───────────────────────────────────────────────────
function boot() {
  initSmoothScroll();  // wire smooth scroll before ScrollTrigger measures
  initParticles();
  initHero();
  initNav();
  initIntro();
  initPullQuote();
  initParallax();
  initChart1();    // synchronous pin setup; D3 renders immediately with fallback
  initChart2();    // async but uses revealWhenVisible
  initChart3();    // async but uses revealWhenVisible
  initRegionalGlobe();
  initCTA();
  initMouseEffects();

  // Refresh ScrollTrigger after fonts load to prevent offset drift
  document.fonts.ready.then(() => ScrollTrigger.refresh());
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
