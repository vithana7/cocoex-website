import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Renderer } from '../webgl/renderer.js';
import { phase, sectionSpan, vhToPx } from '../scroll/timeline.js';
import {
  CONFIG, isMobile, DOT_COLORS, CONSTELLATION_REF, CONNECTIONS,
  easeOutCubic, easeOutBack,
} from '../data.js';

// Intro: logo+dot orbit → transition text → constellation explosion (2D canvas)
// → smoke clear → mission reveal. The explosion canvas draws inside the central
// renderer (gated to 'intro'); GSAP scrubs scroll progress into module state.

// Layout constants for the orbit phase (verbatim).
const ORBIT = {
  logoMinSize: 80,
  logoMaxSize: 250,
  logoMaxSizeMobile: 180,
  dotMaxSize: 24, dotMinSize: 8,
  dotMaxSizeMobile: 18, dotMinSizeMobile: 6,
  borderMargin: 0.20,
  logoMargin: 0.20,
};

const responsive = (d, m) => (isMobile() ? m : d);

export function initIntro(introStarfield) {
  const el = {
    bgCanvas: document.getElementById('bg-canvas'),
    logoContainer: document.getElementById('logo-container'),
    introLogo: document.getElementById('intro-logo'),
    dotWhite: document.getElementById('dot-white'),
    dotBlack: document.getElementById('dot-black'),
    finalDot: document.getElementById('final-dot'),
    transitionText: document.getElementById('transition-text'),
    constCanvas: document.getElementById('constellation-canvas'),
    missionOverlay: document.getElementById('mission-overlay'),
    introContent: document.querySelector('.intro-content'),
    introSection: document.querySelector('.intro'),
  };
  const constCtx = el.constCanvas.getContext('2d');

  let fireworkDots = [];
  let explosionStarted = false;
  let pulseTriggered = false;

  function sizeConstellation() {
    const dpr = isMobile() ? Math.min(window.devicePixelRatio || 1, 2) : (window.devicePixelRatio || 1);
    el.constCanvas.width = window.innerWidth * dpr;
    el.constCanvas.height = window.innerHeight * dpr;
    el.constCanvas.style.width = window.innerWidth + 'px';
    el.constCanvas.style.height = window.innerHeight + 'px';
  }
  sizeConstellation();

  // ---- Orbit phase (phase 1) ----
  function updateOrbit(state) {
    const w = window.innerWidth, h = window.innerHeight;
    const cx = w / 2, cy = h / 2;
    const mobileFactor = isMobile() ? 0.7 : 1;
    const dotMaxSize = responsive(ORBIT.dotMaxSize, ORBIT.dotMaxSizeMobile);
    const dotMinSize = responsive(ORBIT.dotMinSize, ORBIT.dotMinSizeMobile);

    el.logoContainer.style.display = 'flex';
    el.dotWhite.style.display = 'block';
    el.dotBlack.style.display = 'block';
    el.finalDot.classList.remove('visible');
    el.finalDot.style.opacity = 0;
    el.constCanvas.style.opacity = 1;

    el.logoContainer.style.width = state.logoSize + 'px';
    el.logoContainer.style.height = state.logoSize + 'px';
    el.logoContainer.style.transform = `translate(-50%, -50%) rotate(${state.rotation}deg)`;
    el.introLogo.style.opacity = 1;

    const startRadius = Math.min(w, h) * (0.5 - ORBIT.borderMargin);
    const endRadius = (state.logoSize / 2) * (1 + ORBIT.logoMargin);
    const orbitRadius = startRadius + (endRadius - startRadius) * state.progress;

    const orbitAngle = state.progress * CONFIG.totalRotations * Math.PI * 2;
    const whiteAngle = -Math.PI / 2 + orbitAngle;
    const blackAngle = whiteAngle + Math.PI;

    const whiteX = cx + Math.cos(whiteAngle) * orbitRadius;
    const whiteY = cy + Math.sin(whiteAngle) * orbitRadius;
    const blackX = cx + Math.cos(blackAngle) * orbitRadius;
    const blackY = cy + Math.sin(blackAngle) * orbitRadius;

    const dotSize = (dotMaxSize - (dotMaxSize - dotMinSize) * state.progress) * mobileFactor;
    const borderWidth = Math.max(1.5, dotSize * 0.15);

    Object.assign(el.dotWhite.style, {
      left: whiteX + 'px', top: whiteY + 'px',
      width: dotSize + 'px', height: dotSize + 'px', opacity: 1,
    });
    Object.assign(el.dotBlack.style, {
      left: blackX + 'px', top: blackY + 'px',
      width: dotSize + 'px', height: dotSize + 'px',
      borderWidth: borderWidth + 'px', borderStyle: 'solid', borderColor: '#fff', opacity: 1,
    });

    constCtx.clearRect(0, 0, el.constCanvas.width, el.constCanvas.height);
  }

  // ---- Explosion (phase 3) ----
  function initFireworkDots() {
    const w = window.innerWidth, h = window.innerHeight;
    const cx = w / 2, cy = h / 2;

    // The reference layout is landscape (1400×800). On a portrait screen,
    // rotate it 90° so the constellation runs tall instead of cramming into a
    // tiny horizontal cluster — the ref's long axis maps to screen height.
    const portrait = h > w;
    const refW = portrait ? CONFIG.refHeight : CONFIG.refWidth;
    const refH = portrait ? CONFIG.refWidth : CONFIG.refHeight;
    const scale = Math.min(w / refW, h / refH) * 0.85;
    const offsetX = (w - refW * scale) / 2;
    const offsetY = (h - refH * scale) / 2;

    fireworkDots = CONSTELLATION_REF.map((p) => {
      // In portrait, transpose: ref-x drives vertical, ref-y drives horizontal.
      const rx = portrait ? p.y : p.x;
      const ry = portrait ? (CONFIG.refWidth - p.x) : p.y;
      return {
        targetX: rx * scale + offsetX,
        targetY: ry * scale + offsetY,
        z: p.z || 0,
        x: cx, y: cy,
        trail: [],
        maxTrail: 15 + Math.floor(Math.random() * 10),
      };
    });
  }

  function drawExplosion(progress) {
    const dpr = isMobile() ? Math.min(window.devicePixelRatio || 1, 2) : (window.devicePixelRatio || 1);
    const cx = window.innerWidth / 2, cy = window.innerHeight / 2;

    constCtx.save();
    constCtx.clearRect(0, 0, el.constCanvas.width, el.constCanvas.height);

    const explosionEnd = 0.4, settleStart = 0.35;

    fireworkDots.forEach((dot) => {
      let x, y;
      if (progress < explosionEnd) {
        const expProgress = easeOutCubic(progress / explosionEnd);
        const overshoot = 1.08;
        const midX = cx + (dot.targetX - cx) * overshoot;
        const midY = cy + (dot.targetY - cy) * overshoot;
        x = cx + (midX - cx) * expProgress;
        y = cy + (midY - cy) * expProgress;
      } else {
        const settleProgress = easeOutBack(Math.min(1, (progress - settleStart) / (1 - settleStart)));
        const overshoot = 1.08;
        const midX = cx + (dot.targetX - cx) * overshoot;
        const midY = cy + (dot.targetY - cy) * overshoot;
        x = midX + (dot.targetX - midX) * settleProgress;
        y = midY + (dot.targetY - midY) * settleProgress;
      }
      dot.x = x; dot.y = y;
      dot.trail.unshift({ x, y });
      if (dot.trail.length > dot.maxTrail) dot.trail.pop();
    });

    // Trails
    fireworkDots.forEach((dot) => {
      if (dot.trail.length > 1 && progress < 0.7) {
        const trailOpacity = Math.max(0, 1 - progress / 0.7);
        for (let j = 1; j < dot.trail.length; j++) {
          const alpha = (1 - j / dot.trail.length) * 0.6 * trailOpacity;
          const size = (1 - j / dot.trail.length) * 4 + 2;
          constCtx.beginPath();
          constCtx.arc(dot.trail[j].x * dpr, dot.trail[j].y * dpr, size * dpr, 0, Math.PI * 2);
          constCtx.fillStyle = `rgba(255,255,255,${alpha})`;
          constCtx.fill();
        }
      }
    });

    // Connecting lines
    const lineOpacity = progress > 0.5 ? Math.min(1, (progress - 0.5) / 0.3) : 0;
    if (lineOpacity > 0) {
      constCtx.lineCap = 'round';
      constCtx.lineJoin = 'round';
      CONNECTIONS.forEach(({ points: [a, b] }) => {
        const dotA = fireworkDots[a], dotB = fireworkDots[b];
        const sc = DOT_COLORS[a], ec = DOT_COLORS[b];
        const dx = dotB.x - dotA.x, dy = dotB.y - dotA.y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const gap = isMobile() ? 10 : 15;
        if (len > gap * 2) {
          const nx = dx / len, ny = dy / len;
          const sx = (dotA.x + nx * gap) * dpr, sy = (dotA.y + ny * gap) * dpr;
          const ex = (dotB.x - nx * gap) * dpr, ey = (dotB.y - ny * gap) * dpr;
          const g = constCtx.createLinearGradient(sx, sy, ex, ey);
          g.addColorStop(0, `rgba(${sc.r},${sc.g},${sc.b},${lineOpacity})`);
          g.addColorStop(0.2, `rgba(${sc.r},${sc.g},${sc.b},${lineOpacity * 0.8})`);
          g.addColorStop(0.4, `rgba(255,255,255,${lineOpacity * 0.5})`);
          g.addColorStop(0.5, `rgba(255,255,255,${lineOpacity * 0.6})`);
          g.addColorStop(0.6, `rgba(255,255,255,${lineOpacity * 0.5})`);
          g.addColorStop(0.8, `rgba(${ec.r},${ec.g},${ec.b},${lineOpacity * 0.8})`);
          g.addColorStop(1, `rgba(${ec.r},${ec.g},${ec.b},${lineOpacity})`);
          constCtx.strokeStyle = g;
          constCtx.lineWidth = (isMobile() ? 1 : 1.5) * dpr;
          constCtx.beginPath();
          constCtx.moveTo(sx, sy);
          constCtx.lineTo(ex, ey);
          constCtx.stroke();
        }
      });
    }

    // Dots (z-sorted)
    const sorted = fireworkDots.map((dot, i) => ({ dot, i })).sort((p, q) => p.dot.z - q.dot.z);
    const time = performance.now() / 1000;
    const dotSizeBase = isMobile() ? 6 : 8;
    sorted.forEach(({ dot, i }) => {
      const color = DOT_COLORS[i];
      const pulse = 0.8 + 0.2 * Math.sin(time * (2.5 + i * 0.2) + i * 0.5);
      const baseSize = dotSizeBase + (progress > 0.5 ? 2 : 4 * (1 - progress / 0.5));
      const zScale = 1 + dot.z * 0.4;
      const size = baseSize * pulse * zScale;
      const zOpacity = 0.7 + (dot.z + 1) * 0.15;
      constCtx.beginPath();
      constCtx.arc(dot.x * dpr, dot.y * dpr, size * dpr, 0, Math.PI * 2);
      constCtx.fillStyle = color.hex;
      constCtx.globalAlpha = zOpacity;
      constCtx.fill();
    });

    constCtx.restore();
  }

  function updateExplosion(progress) {
    const finalDotSize = responsive(CONFIG.finalDotSize, CONFIG.finalDotSizeMobile);
    el.logoContainer.style.display = 'none';
    el.dotWhite.style.display = 'none';
    el.dotBlack.style.display = 'none';
    el.introLogo.style.opacity = 0;
    el.constCanvas.style.opacity = 1;
    el.finalDot.style.width = finalDotSize + 'px';
    el.finalDot.style.height = finalDotSize + 'px';

    const explosionFadeEnd = 0.15;
    if (progress < explosionFadeEnd) {
      el.finalDot.classList.add('visible');
      el.finalDot.style.opacity = 1 - progress / explosionFadeEnd;
    } else {
      el.finalDot.style.opacity = 0;
      el.finalDot.classList.remove('visible');
    }

    if (!explosionStarted) {
      initFireworkDots();
      explosionStarted = true;
      if (!pulseTriggered) {
        introStarfield.setPulse(0.01);
        pulseTriggered = true;
      }
    }
    drawExplosion(progress);
  }

  // The intro draws nothing extra per-frame beyond what GSAP scrubs — but the
  // pulse needs to advance once triggered. Register a tiny layer for that.
  Renderer.add({
    sections: ['intro'],
    render() {
      if (introStarfield.pulse > 0 && introStarfield.pulse < 1) {
        introStarfield.setPulse(Math.min(1, introStarfield.pulse + 0.012));
      }
    },
  });

  // ---- GSAP timelines wired to declarative timeline phases ----
  buildIntroTimelines({ el, updateOrbit, updateExplosion });

  const setIntroVisible = (visible) => {
    if (el.introSection) el.introSection.style.visibility = visible ? 'visible' : 'hidden';
    if (!visible) constCtx.clearRect(0, 0, el.constCanvas.width, el.constCanvas.height);
  };

  // Hide the intro overlay at the TRUE (unbuffered) intro end so it can't bleed
  // into the muse section. This is intentionally NOT driven by the section gate:
  // the gate wakes muse's WebGL 75vh early, but the mission statement fades in/holds
  // during the last 100vh of intro — hiding it on the buffered boundary would erase
  // the mission before it ever shows.
  ScrollTrigger.create({
    trigger: '.scroll-container',
    start: () => `top+=${vhToPx(sectionSpan('intro').endVh)}px top`,
    end: 'bottom bottom',
    invalidateOnRefresh: true,
    onToggle: (self) => setIntroVisible(!self.isActive),
  });

  return {
    resize() {
      sizeConstellation();
      if (explosionStarted) initFireworkDots();
    },
    setIntroVisible,
  };
}

function buildIntroTimelines({ el, updateOrbit, updateExplosion }) {
  const orbit = phase('intro.orbit');
  const text = phase('intro.text');
  const explosion = phase('intro.explosion');
  const mission = phase('intro.mission');
  const missionHold = phase('intro.missionHold');

  const trig = (p, extra = {}) => ({
    trigger: '.scroll-container',
    start: () => `top+=${p.startPx()}px top`,
    end: () => `top+=${p.endPx()}px top`,
    scrub: true,
    invalidateOnRefresh: true,
    ...extra,
  });

  // Phase 1: orbit. While the user hasn't scrolled (progress ~0) we stay in the
  // landing idle state — just the centered, gently pulsing logo (CSS .intro-idle,
  // dots hidden). The moment the orbit starts we hand off to updateOrbit, which
  // takes over the logo size/rotation and reveals the dots.
  const orbitState = { progress: 0, logoSize: ORBIT.logoMinSize, rotation: CONFIG.totalRotations * 360 };
  gsap.to(orbitState, {
    progress: 1,
    logoSize: () => responsive(ORBIT.logoMaxSize, ORBIT.logoMaxSizeMobile),
    rotation: 0,
    ease: 'none',
    scrollTrigger: {
      ...trig(orbit),
      onUpdate: () => {
        const idle = orbitState.progress < 0.001;
        el.introContent.classList.toggle('intro-idle', idle);
        if (idle) {
          // Clear inline styles updateOrbit may have set so the CSS idle state
          // (centered resting size + pulse) wins on scroll-back to the top.
          el.logoContainer.style.removeProperty('width');
          el.logoContainer.style.removeProperty('height');
          el.logoContainer.style.removeProperty('transform');
        } else {
          updateOrbit(orbitState);
        }
      },
    },
  });

  // Transition text: in / hold / out across the text phase.
  gsap.timeline({ scrollTrigger: trig(text) })
    .fromTo(el.transitionText, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none' })
    .to(el.transitionText, { opacity: 1, duration: 0.3, ease: 'none' })
    .to(el.transitionText, { opacity: 0, duration: 0.3, ease: 'none' });

  // Phase 3: explosion. Front-loaded: dots settle over the first ~70% of the
  // combined explosion+mission span, then hold while scroll continues.
  const explosionState = { progress: 0 };
  gsap.to(explosionState, {
    progress: 1,
    ease: 'none',
    scrollTrigger: {
      ...trig(explosion),
      onUpdate: () => updateExplosion(explosionState.progress),
    },
  });

  // Mission sequence across two phases:
  //   intro.mission     — smoke clears, then the mission fades in.
  //   intro.missionHold  — mission holds fully bright, then fades out at the end.
  // Smoke-clear and fade durations are FIXED fractions of the (short) reveal phase
  // so transition SPEED stays constant; the long hold lives entirely in missionHold.
  const smokeLayers = [el.constCanvas, el.bgCanvas].filter(Boolean);
  const mStart = mission.startPx;
  const revealSpan = () => mission.endPx() - mission.startPx();

  if (smokeLayers.length) {
    gsap.fromTo(smokeLayers, { opacity: 1 }, {
      opacity: 0, ease: 'none',
      scrollTrigger: {
        trigger: '.scroll-container',
        start: () => `top+=${mStart()}px top`,
        end: () => `top+=${mStart() + revealSpan() * 0.5}px top`,
        scrub: true, invalidateOnRefresh: true,
      },
    });
  }

  if (el.missionOverlay) {
    // Fade in over the back half of the reveal phase; holds bright through all of
    // missionHold; fades out over its last 25% into the muse intro.
    gsap.fromTo(el.missionOverlay, { opacity: 0 }, {
      opacity: 1, ease: 'none',
      scrollTrigger: {
        trigger: '.scroll-container',
        start: () => `top+=${mStart() + revealSpan() * 0.5}px top`,
        end: () => `top+=${mission.endPx()}px top`,
        scrub: true, invalidateOnRefresh: true,
      },
    });
  }

  // Joint fade-out of the whole intro content over the last 25% of the
  // missionHold phase, handing off to the muse intro fading in underneath.
  if (el.introContent) {
    const hStart = missionHold.startPx, hEnd = missionHold.endPx;
    const holdSpan = () => hEnd() - hStart();
    gsap.fromTo(el.introContent, { opacity: 1 }, {
      opacity: 0, ease: 'none',
      scrollTrigger: {
        trigger: '.scroll-container',
        start: () => `top+=${hStart() + holdSpan() * 0.75}px top`,
        end: () => `top+=${hEnd()}px top`,
        scrub: true, invalidateOnRefresh: true,
      },
    });
  }
}
