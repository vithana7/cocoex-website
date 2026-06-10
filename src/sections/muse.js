import { gsap } from 'gsap';
import { Renderer } from '../webgl/renderer.js';
import { sectionSpan } from '../scroll/timeline.js';
import { MusePopup } from '../ui/muse-popup.js';

// Muse: ONE overlapping sticky panel. Intro copy + shared logo fade in over the
// black starfield, hold, then a 100vh switch crossfades the bg black→white, the
// logo white→black, and reveals the orbit. 7 muses rotate on an adaptive ellipse.

const MuseScroll = {
  container: null,
  items: [],
  orbitRadiusX: 0,
  orbitRadiusY: 0,
  animationTime: 0,
  orbitSpeed: 0.00015, // ~240s per rotation
  orbitPauseUntil: 0,
  lastTime: performance.now(),
  initialized: false,

  init() {
    this.container = document.getElementById('muse-section');
    this.items = Array.from(document.querySelectorAll('.muse-orbit-item')).map((el) => ({
      el,
      // Parse data-angle ONCE (was re-parsed every frame — a needless cost).
      baseAngle: parseFloat(el.getAttribute('data-angle')) * (Math.PI / 180),
      lastZ: null,
    }));
    if (!this.container || !this.items.length) return;
    this.initialized = true;
    this.calcRadius();
    this.attachHandlers();
  },

  calcRadius() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const aspect = vw / vh;
    const t = Math.max(0, Math.min(1, (aspect - 0.6) / 0.8));
    const horizontalBias = -1 + t * 2;
    const ellipseStretch = 1 + Math.abs(horizontalBias) * 0.8;
    const baseRadius = Math.min(vh, vw) * 0.32;
    if (horizontalBias >= 0) {
      this.orbitRadiusX = baseRadius * ellipseStretch;
      this.orbitRadiusY = baseRadius;
    } else {
      this.orbitRadiusX = baseRadius;
      this.orbitRadiusY = baseRadius * ellipseStretch;
    }
  },

  // Called per-frame by the renderer ONLY while the muse section is active.
  update() {
    if (!this.initialized) return;
    const now = performance.now();
    const delta = now - this.lastTime;
    this.lastTime = now;

    if (!this.orbitPauseUntil || now >= this.orbitPauseUntil) {
      this.animationTime += delta * this.orbitSpeed;
    }

    for (const item of this.items) {
      const angle = item.baseAngle + this.animationTime;
      const x = Math.cos(angle) * this.orbitRadiusX;
      const y = Math.sin(angle) * this.orbitRadiusY;
      const depth = (Math.sin(angle) + 1) * 0.5;
      const scale = 0.65 + depth * 0.40;
      item.el.style.transform =
        `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${scale})`;
      // Only touch zIndex when the rounded value actually changes — avoids
      // per-frame stacking-context recalcs (a measurable jank source before).
      const z = Math.round(depth * 100);
      if (z !== item.lastZ) {
        item.el.style.zIndex = z;
        item.lastZ = z;
      }
    }
  },

  attachHandlers() {
    for (const item of this.items) {
      const el = item.el;
      const color = el.getAttribute('data-color');
      const popupTitle = el.getAttribute('data-popup-title');
      const heading = el.querySelector('.muse-text h3');
      const paragraph = el.querySelector('.muse-text p');
      const img = el.querySelector('.muse-image img');

      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      if (popupTitle) el.setAttribute('aria-label', popupTitle);
      el.style.cursor = 'pointer';

      const open = () => MusePopup.open(
        popupTitle || (heading ? heading.textContent : ''),
        paragraph ? paragraph.textContent : '',
        color,
        img ? img.src : ''
      );
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });
    }
    this.container.addEventListener('touchstart', () => {
      this.orbitPauseUntil = performance.now() + 2000;
    }, { passive: true });
  },

  resize() {
    if (this.initialized) this.calcRadius();
  },
};

export function initMuse() {
  MusePopup.init();
  MuseScroll.init();

  Renderer.add({ sections: ['muse'], render: () => MuseScroll.update() });

  buildMuseTimeline();
  return { resize: () => MuseScroll.resize() };
}

function buildMuseTimeline() {
  const panel = document.querySelector('.muse-panel');
  const sharedLogo = document.querySelector('.muse-shared-logo');
  const logoWhite = document.getElementById('muse-logo-white');
  const logoBlack = document.getElementById('muse-logo-black');
  const introCopy = document.querySelector('.muse-intro-copy');
  const section = document.querySelector('.muse-section');
  if (!panel || !sharedLogo || !section) return;

  // Phase durations within the muse section, derived from the timeline.
  // fadein 100 / hold 200 / switch 100 → switch starts at 300vh into the panel.
  const span = sectionSpan('muse'); // 400vh
  const FADE_VH = 100;
  const SWITCH_AT_VH = 300;
  const SWITCH_VH = 100;

  gsap.set(sharedLogo, { xPercent: -50, yPercent: -50, opacity: 0 });

  // Intro fade-in (0 → FADE).
  gsap.timeline({
    defaults: { ease: 'power2.out' },
    scrollTrigger: {
      trigger: '.muse-panel', start: 'top top',
      end: `top+=${FADE_VH}vh top`, scrub: true, invalidateOnRefresh: true,
    },
  })
    .fromTo(sharedLogo, { opacity: 0 }, { opacity: 1 }, 0)
    .fromTo(introCopy, { opacity: 0 }, { opacity: 1 }, 0);

  // Switch (SWITCH_AT → SWITCH_AT+SWITCH): bg black→white, logo white→black,
  // intro copy out, orbit revealed.
  gsap.timeline({
    scrollTrigger: {
      trigger: '.muse-panel',
      start: `top+=${SWITCH_AT_VH}vh top`,
      end: `top+=${SWITCH_AT_VH + SWITCH_VH}vh top`,
      scrub: true, invalidateOnRefresh: true,
    },
  })
    .fromTo(section, { opacity: 0 }, { opacity: 1, ease: 'power1.inOut' }, 0)
    .fromTo(logoWhite, { opacity: 1 }, { opacity: 0, ease: 'power1.inOut' }, 0)
    .fromTo(logoBlack, { opacity: 0 }, { opacity: 1, ease: 'power1.inOut' }, 0)
    .fromTo(introCopy, { opacity: 1 }, { opacity: 0, ease: 'power2.in' }, 0);
}
