import { gsap } from 'gsap';
import { createFocusTrap, wireModalDismiss } from './focus-trap.js';

// Muse modal: 3D tilt card, colored aura, 12 floating particles, focus-trap.
export const MusePopup = {
  isOpen: false,
  previouslyFocused: null,

  init() {
    this.popup = document.getElementById('muse-popup');
    this.overlay = document.getElementById('muse-popup-overlay');
    this.closeBtn = document.getElementById('muse-popup-close');
    this.content = document.querySelector('.muse-popup-content');
    this.imageContainer = document.getElementById('muse-popup-image');
    this.image = document.getElementById('muse-popup-img');
    this.title = document.getElementById('muse-popup-title');
    this.cause = document.getElementById('muse-popup-cause');
    this.text = document.getElementById('muse-popup-text');
    this.particles = document.getElementById('muse-popup-particles');
    if (!this.popup) return;

    gsap.set(this.popup, { display: 'none', opacity: 0 });
    gsap.set(this.content, { scale: 0.7, opacity: 0 });
    gsap.set(this.imageContainer, { scale: 0.8, opacity: 0 });
    gsap.set(this.title, { display: 'none' });
    gsap.set([this.cause, this.text], { opacity: 0, y: 30 });

    wireModalDismiss({
      overlay: this.overlay,
      closeBtn: this.closeBtn,
      onClose: () => this.close(),
      isOpenFn: () => this.isOpen,
    });

    this.focusTrap = createFocusTrap(this.content);
  },

  open(causeTitle, description, color, imageSrc) {
    if (!this.popup || this.isOpen) return;
    this.isOpen = true;

    this.cause.textContent = causeTitle;
    this.text.textContent = description;
    this.image.src = imageSrc;
    this.image.alt = causeTitle;
    this.content.style.setProperty('--muse-color', color);
    this.imageContainer.style.setProperty('--muse-color', color);

    if (this.closeTimeline) this.closeTimeline.kill();
    gsap.set(this.popup, { display: 'flex' });
    this.createParticles(color);

    this.openTimeline = gsap.timeline({ defaults: { ease: 'power3.out' } });
    this.openTimeline
      .to(this.popup, { opacity: 1, duration: 0.4 })
      .to(this.imageContainer, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }, '-=0.2')
      .to(this.content, { scale: 1, opacity: 1, duration: 0.4 }, '-=0.4')
      .to(this.cause, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
      .to(this.text, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3');

    this.previouslyFocused = document.activeElement;
    this.focusTrap.activate();
    if (this.closeBtn) this.closeBtn.focus();
  },

  close() {
    if (!this.popup || !this.isOpen) return;
    this.isOpen = false;

    this.focusTrap.deactivate();
    if (this.previouslyFocused && this.previouslyFocused.focus) {
      try { this.previouslyFocused.focus(); } catch (_) { /* gone */ }
    }
    this.previouslyFocused = null;

    if (this.openTimeline) this.openTimeline.kill();
    this.closeTimeline = gsap.timeline({
      defaults: { ease: 'power3.in' },
      onComplete: () => {
        gsap.set(this.popup, { display: 'none' });
        this.clearParticles();
      },
    });
    this.closeTimeline
      .to([this.text, this.cause], { opacity: 0, y: -20, duration: 0.2, stagger: 0.05 })
      .to(this.imageContainer, { scale: 0.8, opacity: 0, duration: 0.3 }, '-=0.15')
      .to(this.content, { scale: 0.7, opacity: 0, duration: 0.3 }, '-=0.25')
      .to(this.popup, { opacity: 0, duration: 0.3 }, '-=0.2');
  },

  createParticles(color) {
    if (!this.particles) return;
    this.clearParticles();
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const count = 12;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'muse-popup-particle';
      p.style.setProperty('--muse-color', color);
      const angle = (i / count) * Math.PI * 2;
      const radius = 200 + Math.random() * 100;
      p.style.left = `calc(50% + ${Math.cos(angle) * radius}px)`;
      p.style.top = `calc(50% + ${Math.sin(angle) * radius}px)`;
      p.style.setProperty('--particle-x', `${(Math.random() - 0.5) * 100}px`);
      p.style.setProperty('--particle-y', `${(Math.random() - 0.5) * 100}px`);
      p.style.animationDelay = `${i * 0.15}s`;
      this.particles.appendChild(p);
    }
  },

  clearParticles() {
    if (this.particles) this.particles.innerHTML = '';
  },
};
