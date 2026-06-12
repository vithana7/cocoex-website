import { gsap } from 'gsap';
import { Renderer } from '../webgl/renderer.js';
import { phase } from '../scroll/timeline.js';
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
  orbitSpeed: 0.000105, // ~60s per full rotation — calm, clearly-visible drift
  orbitPauseUntil: 0,
  hovering: false, // desktop hover freezes the whole orbit so a muse is catchable
  lastTime: performance.now(),
  initialized: false,
  hintIndex: -1,   // which orbit muse currently wears the "click me" halo (-1 = none)
  hintTimer: null,

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
    // Clamp delta: update() only runs while the muse section is active (gated), so the
    // FIRST active frame after intro/comet would otherwise see a huge delta (time since
    // the layer last ran) and lurch the orbit forward. Cap it to ~one slow frame so the
    // drift always eases in smoothly instead of jumping.
    const delta = Math.min(now - this.lastTime, 50);
    this.lastTime = now;

    if (!this.hovering && (!this.orbitPauseUntil || now >= this.orbitPauseUntil)) {
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

  // Roaming "click me" halo. Moves a single spectrum halo from muse to muse so the
  // discs read as interactive. Self-scheduling so it costs nothing when idle.
  scheduleHint(delay) {
    clearTimeout(this.hintTimer);
    this.hintTimer = setTimeout(() => this.showHint(), delay);
  },

  showHint() {
    const prev = this.hintIndex;
    // Only hint while the orbit is actually on screen and uncontested: update() runs
    // (and refreshes lastTime) only while the muse section is the active gated layer,
    // so a stale lastTime means we're elsewhere. Also yield to hover/popup/hidden tab.
    const orbitLive = performance.now() - this.lastTime < 400;
    if (!orbitLive || this.hovering || MusePopup.isOpen || document.hidden) {
      this.clearHint();
      this.scheduleHint(1500); // re-check shortly
      return;
    }
    let i = Math.floor(Math.random() * this.items.length);
    if (this.items.length > 1 && i === prev) i = (i + 1) % this.items.length;
    if (prev >= 0 && prev !== i && this.items[prev]) this.items[prev].el.classList.remove('is-hinting');
    this.items[i].el.classList.add('is-hinting');
    this.hintIndex = i;
    this.scheduleHint(3500); // dwell, then hop to another muse (CSS crossfades the swap)
  },

  clearHint() {
    if (this.hintIndex >= 0 && this.items[this.hintIndex]) {
      this.items[this.hintIndex].el.classList.remove('is-hinting');
    }
    this.hintIndex = -1;
  },

  attachHandlers() {
    // Build the ordered muse list once. Cause is parsed from data-popup-title
    // ("Lunes · Water"); the popup symbol is the white variant of each muse.
    this.muses = this.items.map(({ el }) => {
      const popupTitle = el.getAttribute('data-popup-title') || '';
      const heading = el.querySelector('.muse-text h3');
      const paragraph = el.querySelector('.muse-text p');
      const name = (heading ? heading.textContent : popupTitle.split('·')[0]).trim();
      const cause = popupTitle.includes('·') ? popupTitle.split('·')[1].trim() : '';
      const description = paragraph ? paragraph.textContent.trim() : '';
      // Split into sentences so each renders on its own line in the popup (every
      // muse description is two sentences) — sentence 2 never trails mid-line.
      const sentences = (description.match(/[^.]+\./g) || [description]).map((s) => s.trim());
      return {
        name,
        cause,
        description,
        sentences,
        color: el.getAttribute('data-color'),
        img: `assets/images/muse/${name.toLowerCase()}-white.png`,
      };
    });
    MusePopup.setMuses(this.muses);

    // Only hover-capable (desktop) pointers freeze the orbit — matches the CSS
    // `@media (hover: hover)` flip; on touch a tap just opens the popup.
    const canHover = window.matchMedia('(hover: hover)').matches;

    this.items.forEach(({ el }, i) => {
      const popupTitle = el.getAttribute('data-popup-title');
      el.style.setProperty('--muse-color', el.getAttribute('data-color'));
      el.setAttribute('tabindex', '0');
      el.setAttribute('role', 'button');
      if (popupTitle) el.setAttribute('aria-label', popupTitle);
      el.style.cursor = 'pointer';

      const open = () => MusePopup.open(i);
      el.addEventListener('click', open);
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
      });

      if (canHover) {
        // Freeze on hover/focus so the (now still) card is easy to click; the
        // CSS flip reveals the name in the same window.
        const thaw = () => { this.hovering = false; };
        // Engaging a muse clears the roaming halo so it never fights the hover flip.
        el.addEventListener('mouseenter', () => { this.hovering = true; this.clearHint(); });
        el.addEventListener('mouseleave', thaw);
        // Only freeze on KEYBOARD focus (focus-visible) — closing the popup restores
        // focus here programmatically, which must NOT re-freeze the orbit for mouse users.
        el.addEventListener('focus', () => { if (el.matches(':focus-visible')) { this.hovering = true; this.clearHint(); } });
        el.addEventListener('blur', thaw);
      }
    });

    this.container.addEventListener('touchstart', () => {
      this.orbitPauseUntil = performance.now() + 2000;
    }, { passive: true });

    // Kick off the roaming "click me" halo (gated to when the orbit is actually visible).
    this.scheduleHint(2000);
  },

  resize() {
    if (this.initialized) this.calcRadius();
  },
};

export function initMuse(popupStarfield, popupGalaxy) {
  MusePopup.init(popupStarfield, popupGalaxy);
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

  // Phase windows derived from the declarative timeline (section-relative vh), so
  // changing the PHASES in timeline.js automatically retimes the muse intro/switch
  // with no hand-syncing. fadein → hold → switch.
  const fadein = phase('muse.fadein');
  const sw = phase('muse.switch');
  // Section-relative PIXEL offsets (computed against the live viewport inside the
  // function-form start/end + invalidateOnRefresh, so they stay correct on resize).
  // NOTE: ScrollTrigger reads a `top+=Xvh` string as X *pixels* (it strips the unit),
  // so vh MUST be converted to px here — mirrors the intro section's pattern.
  const FADE_END_PX = () => fadein.endFromSection();     // end of fade-in, into the panel
  const SWITCH_START_PX = () => sw.startFromSection();   // switch start, into the panel
  const SWITCH_END_PX = () => sw.endFromSection();       // switch end, into the panel

  gsap.set(sharedLogo, { xPercent: -50, yPercent: -50, opacity: 0 });

  // Intro fade-in (0 → FADE). Logo + copy fade in TOGETHER, pure linear opacity — a direct
  // mirror of the cocoex mission reveal (one simple scrubbed opacity move, no stagger, no
  // slide) so it carries the same unhurried flow.
  gsap.fromTo([sharedLogo, introCopy], { opacity: 0 }, {
    opacity: 1, ease: 'none',
    scrollTrigger: {
      trigger: '.muse-panel', start: 'top top',
      end: () => `top+=${FADE_END_PX()}px top`, scrub: true, invalidateOnRefresh: true,
    },
  });

  // Switch (SWITCH_START → SWITCH_END): bg black→white, logo white→black,
  // intro copy out, orbit revealed.
  gsap.timeline({
    scrollTrigger: {
      trigger: '.muse-panel',
      start: () => `top+=${SWITCH_START_PX()}px top`,
      end: () => `top+=${SWITCH_END_PX()}px top`,
      scrub: true, invalidateOnRefresh: true,
    },
  })
    .fromTo(section, { opacity: 0 }, { opacity: 1, ease: 'power1.inOut' }, 0)
    .fromTo(logoWhite, { opacity: 1 }, { opacity: 0, ease: 'power1.inOut' }, 0)
    .fromTo(logoBlack, { opacity: 0 }, { opacity: 1, ease: 'power1.inOut' }, 0)
    .fromTo(introCopy, { opacity: 1 }, { opacity: 0, ease: 'power2.in' }, 0);
}
