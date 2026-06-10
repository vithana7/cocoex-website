import { ScrollTrigger } from 'gsap/ScrollTrigger';

import './styles/tokens.css';
import './styles/base.css';
import './styles/intro.css';
import './styles/muse.css';
import './styles/comet.css';
import './styles/events-footer.css';
import './styles/responsive.css';

import { applyHeightsToCss } from './scroll/timeline.js';
import { initSmoothScroll } from './scroll/smooth-scroll.js';
import { initSectionGate } from './scroll/section-gate.js';
import { Renderer } from './webgl/renderer.js';
import { createIntroStarfield } from './webgl/intro-starfield.js';
import { createStarfield } from './webgl/starfield.js';
import { initIntro } from './sections/intro.js';
import { initMuse } from './sections/muse.js';
import { MusePopup } from './ui/muse-popup.js';
import { createMuseGalaxy } from './ui/muse-galaxy.js';
import { initComet } from './sections/comet.js';
import { initEvents } from './sections/events.js';

function boot() {
  // 1. Inject section heights from the single declarative timeline.
  applyHeightsToCss();

  // 2. Smooth scroll (Lenis ↔ GSAP).
  initSmoothScroll();

  // 3. WebGL surfaces. Three share the starfield factory; intro has its own.
  const introStarfield = createIntroStarfield('bg-canvas');
  const unified = createStarfield('unified-starfield-canvas');                 // white-on-black
  const museBg = createStarfield('muse-background-canvas', { invert: true, intensity: 0.9 });
  const cometBg = createStarfield('comet-collab-background-canvas', { invert: true, intensity: 0.9 });
  const popupStars = createStarfield('muse-popup-starfield', { intensity: 0.4 }); // reactive modal bg
  [introStarfield, unified, museBg, cometBg, popupStars].forEach((s) => s.init());

  const popupGalaxy = createMuseGalaxy('muse-popup-galaxy'); // 2D spiral particles
  popupGalaxy.init();

  // Register each starfield as a gated render layer.
  Renderer.add({ sections: ['intro'], render: (n) => introStarfield.render(n) });
  Renderer.add({ sections: ['muse', 'comet', 'events'], render: (n) => unified.render(n) });
  Renderer.add({ sections: ['muse'], render: (n) => museBg.render(n) });
  Renderer.add({ sections: ['comet'], render: (n) => cometBg.render(n) });
  // Popup surfaces render only while the modal is open (any section).
  Renderer.add({ active: () => MusePopup.isOpen, render: (n) => popupStars.render(n) });
  Renderer.add({ active: () => MusePopup.isOpen, render: (n) => popupGalaxy.render(n) });

  // 4. Sections (each registers its own per-frame layers + GSAP timelines).
  const intro = initIntro(introStarfield);
  const muse = initMuse(popupStars, popupGalaxy);
  const comet = initComet();
  initEvents();

  // 5. Section gating drives WebGL activity. (Intro overlay teardown is handled
  // inside initIntro at the TRUE intro end, NOT here — the gate's 75vh lead buffer
  // would otherwise hide the mission statement before it finishes revealing.)
  initSectionGate();

  // 6. Start the single RAF loop.
  Renderer.start();

  // 7. Resize: debounced, resizes every surface + recomputes ellipse, refreshes ST.
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      applyHeightsToCss();
      [introStarfield, unified, museBg, cometBg, popupStars].forEach((s) => s.resize());
      popupGalaxy.resize();
      intro.resize();
      muse.resize();
      comet.resize();
      ScrollTrigger.refresh();
    }, 150);
  }, { passive: true });

  // Ensure triggers measure correctly after fonts/layout settle.
  ScrollTrigger.refresh();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
