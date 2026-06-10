import { gsap } from 'gsap';
import { createFocusTrap, wireModalDismiss } from './focus-trap.js';

// Muse modal: white symbol on its colored disc, prev/next nav (arrows, ←/→, swipe),
// 3D pointer tilt, reactive WebGL starfield, focus-trap.
export const MusePopup = {
  isOpen: false,
  previouslyFocused: null,
  muses: [],
  index: 0,
  starfield: null,
  _baseIntensity: 0.4,

  init(starfield, galaxy) {
    this.popup = document.getElementById('muse-popup');
    this.overlay = document.getElementById('muse-popup-overlay');
    this.closeBtn = document.getElementById('muse-popup-close');
    this.content = document.querySelector('.muse-popup-content');
    this.wrapper = this.popup ? this.popup.querySelector('.muse-card-wrapper') : null;
    this.cardShell = this.popup ? this.popup.querySelector('.muse-card-shell') : null;
    this.card = this.popup ? this.popup.querySelector('.muse-card') : null;
    this.imageContainer = document.getElementById('muse-popup-image');
    this.image = document.getElementById('muse-popup-img');
    this.title = document.getElementById('muse-popup-title');
    this.cause = document.getElementById('muse-popup-cause');
    this.text = document.getElementById('muse-popup-text');
    this.prevBtn = document.getElementById('muse-popup-prev');
    this.nextBtn = document.getElementById('muse-popup-next');
    this.starfield = starfield || null;
    this.galaxy = galaxy || null;
    if (this.starfield) this._baseIntensity = this.starfield.intensity;
    if (!this.popup) return;

    gsap.set(this.popup, { display: 'none', opacity: 0 });
    gsap.set(this.content, { scale: 0.7, opacity: 0 });
    gsap.set(this.imageContainer, { scale: 0.8, opacity: 0 });
    gsap.set([this.title, this.cause, this.text], { opacity: 0, y: 30 });

    wireModalDismiss({
      overlay: this.overlay,
      closeBtn: this.closeBtn,
      onClose: () => this.close(),
      isOpenFn: () => this.isOpen,
    });

    if (this.prevBtn) this.prevBtn.addEventListener('click', () => this.prev());
    if (this.nextBtn) this.nextBtn.addEventListener('click', () => this.next());

    // Keyboard navigation while the popup is open.
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); this.prev(); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); this.next(); }
    });

    this._wireTilt();
    this._wireSwipe();

    // Trap focus across the whole modal (arrows live outside .muse-popup-content).
    this.focusTrap = createFocusTrap(this.popup);
  },

  setMuses(muses) {
    this.muses = muses || [];
  },

  open(index) {
    if (!this.popup || this.isOpen || !this.muses.length) return;
    this.isOpen = true;
    this.index = this._wrap(index);

    // Reset to entrance state so reopens animate cleanly.
    if (this.switchTimeline) this.switchTimeline.kill();
    if (this.cardShell) gsap.set(this.cardShell, { rotationY: 0 });
    gsap.set(this.content, { scale: 0.7, opacity: 0 });
    gsap.set(this.imageContainer, { scale: 0.8, opacity: 0 });
    gsap.set([this.title, this.cause, this.text], { opacity: 0, y: 30 });

    this._applyMuse(this.muses[this.index]);

    if (this.closeTimeline) this.closeTimeline.kill();
    gsap.set(this.popup, { display: 'flex' });
    // Canvases had 0 size while the modal was display:none — size them now visible.
    if (this.starfield) this.starfield.resize();
    if (this.galaxy) { this.galaxy.resize(); this.galaxy.seed(); }

    this.openTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    this.openTimeline
      .to(this.popup, { opacity: 1, duration: 0.4 })
      .to(this.title, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
      .to(this.imageContainer, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }, '-=0.3')
      .to(this.content, { scale: 1, opacity: 1, duration: 0.4 }, '-=0.5')
      .to(this.cause, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
      .to(this.text, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3');

    this.previouslyFocused = document.activeElement;
    this.focusTrap.activate();
    if (this.closeBtn) this.closeBtn.focus();
  },

  // Switch muse without closing. The card does a 3D Y-flip: the symbol + disc color
  // swap at the edge-on moment, so the new muse arrives ON the turning card. `dir`
  // (+1 next / -1 prev) sets the flip direction. Title/cause/description fade in sync.
  goTo(index, dir = 1) {
    if (!this.isOpen || !this.muses.length) return;
    this.index = this._wrap(index);
    const muse = this.muses[this.index];
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.switchTimeline) this.switchTimeline.kill();

    if (reduced || !this.cardShell) {
      // No rotation — instant swap with a short crossfade.
      this.switchTimeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
      this.switchTimeline
        .to([this.title, this.cause, this.text, this.imageContainer], { opacity: 0, duration: 0.12 })
        .add(() => this._applyMuse(muse))
        .to([this.title, this.cause, this.text, this.imageContainer], { opacity: 1, duration: 0.18 });
      return;
    }

    // Zero any pointer tilt so the flip is clean, then resume on next pointermove.
    if (this.wrapper) {
      this.wrapper.style.setProperty('--rotate-x', '0deg');
      this.wrapper.style.setProperty('--rotate-y', '0deg');
      this.wrapper.style.setProperty('--pointer-from-center', '0');
    }

    this.switchTimeline = gsap.timeline();
    this.switchTimeline
      .to(this.cardShell, { rotationY: dir * 90, duration: 0.22, ease: 'power2.in' })
      .to([this.title, this.cause, this.text], { opacity: 0, duration: 0.18 }, 0)
      .add(() => this._applyMuse(muse))
      .set(this.cardShell, { rotationY: -dir * 90 })
      .to(this.cardShell, { rotationY: 0, duration: 0.32, ease: 'power2.out' })
      .to([this.title, this.cause, this.text], { opacity: 1, duration: 0.26 }, '-=0.24');
  },

  next() { this.goTo(this.index + 1, 1); },
  prev() { this.goTo(this.index - 1, -1); },

  close() {
    if (!this.popup || !this.isOpen) return;
    this.isOpen = false;

    this.focusTrap.deactivate();
    if (this.previouslyFocused && this.previouslyFocused.focus) {
      try { this.previouslyFocused.focus(); } catch (_) { /* gone */ }
    }
    this.previouslyFocused = null;

    if (this.openTimeline) this.openTimeline.kill();
    if (this.switchTimeline) this.switchTimeline.kill();
    this.closeTimeline = gsap.timeline({
      defaults: { ease: 'power3.in' },
      onComplete: () => {
        gsap.set(this.popup, { display: 'none' });
      },
    });
    this.closeTimeline
      .to([this.text, this.cause, this.title], { opacity: 0, y: -20, duration: 0.2, stagger: 0.05 })
      .to(this.imageContainer, { scale: 0.8, opacity: 0, duration: 0.3 }, '-=0.15')
      .to(this.content, { scale: 0.7, opacity: 0, duration: 0.3 }, '-=0.25')
      .to(this.popup, { opacity: 0, duration: 0.3 }, '-=0.2');
  },

  _wrap(index) {
    const n = this.muses.length;
    return ((index % n) + n) % n;
  },

  _applyMuse(muse) {
    this.title.textContent = muse.name;
    this.cause.textContent = muse.cause;
    // Each sentence on its own line (static data.js copy — safe as markup).
    const sentences = muse.sentences && muse.sentences.length ? muse.sentences : [muse.description];
    this.text.innerHTML = sentences
      .map((s) => `<span class="muse-popup-sentence">${s}</span>`)
      .join('');
    this.image.src = muse.img;
    this.image.alt = muse.name;
    const glow = this._glow(muse.color);
    this.content.style.setProperty('--muse-color', muse.color);
    this.content.style.setProperty('--muse-glow', glow);
    this.imageContainer.style.setProperty('--muse-color', muse.color);
    this.popup.setAttribute('aria-label', `${muse.name} · ${muse.cause}`);
    this._reactStarfield(muse.color);
    if (this.galaxy) this.galaxy.setColor(muse.color);
  },

  // --- Reactive starfield: tint stars toward the muse hue + pulse brightness. ---
  _reactStarfield(color) {
    if (!this.starfield) return;
    const [r, g, b] = this._hexToRgb(color);
    this.starfield.starColor = [0.6 + r * 0.4, 0.6 + g * 0.4, 0.6 + b * 0.4];
    gsap.killTweensOf(this.starfield);
    this.starfield.intensity = this._baseIntensity * 2.4;
    gsap.to(this.starfield, { intensity: this._baseIntensity, duration: 1.2, ease: 'power2.out' });
  },

  // --- 3D pointer tilt: drive the CSS vars the card layers already read. ---
  _wireTilt() {
    if (!this.wrapper) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const wrap = this.wrapper;
    const onMove = (e) => {
      const r = wrap.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const cx = px - 0.5, cy = py - 0.5;
      wrap.style.setProperty('--pointer-x', `${(px * 100).toFixed(1)}%`);
      wrap.style.setProperty('--pointer-y', `${(py * 100).toFixed(1)}%`);
      wrap.style.setProperty('--pointer-from-left', px.toFixed(3));
      wrap.style.setProperty('--pointer-from-top', py.toFixed(3));
      wrap.style.setProperty('--pointer-from-center', Math.min(1, Math.hypot(cx, cy) * 2).toFixed(3));
      wrap.style.setProperty('--background-x', `${(50 + cx * 30).toFixed(1)}%`);
      wrap.style.setProperty('--background-y', `${(50 + cy * 30).toFixed(1)}%`);
      wrap.style.setProperty('--rotate-x', `${(cx * 18).toFixed(2)}deg`);
      wrap.style.setProperty('--rotate-y', `${(-cy * 18).toFixed(2)}deg`);
    };
    const reset = () => {
      wrap.style.setProperty('--pointer-from-center', '0');
      wrap.style.setProperty('--rotate-x', '0deg');
      wrap.style.setProperty('--rotate-y', '0deg');
      wrap.style.setProperty('--background-x', '50%');
      wrap.style.setProperty('--background-y', '50%');
    };
    wrap.addEventListener('pointermove', onMove);
    wrap.addEventListener('pointerleave', reset);
  },

  // --- Horizontal swipe switches muse on touch. ---
  _wireSwipe() {
    let x0 = null, y0 = null;
    this.popup.addEventListener('touchstart', (e) => {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    this.popup.addEventListener('touchend', (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      const dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) this.next(); else this.prev();
      }
      x0 = y0 = null;
    }, { passive: true });
  },

  _hexToRgb(hex) {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || '').trim());
    if (!m) return [1, 1, 1];
    return [parseInt(m[1], 16) / 255, parseInt(m[2], 16) / 255, parseInt(m[3], 16) / 255];
  },

  _glow(color) {
    const [r, g, b] = this._hexToRgb(color);
    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, 0.55)`;
  },
};
