import { gsap } from 'gsap';
import { Renderer } from '../webgl/renderer.js';
import { COMET_CONST_HIDE_VH } from '../scroll/timeline.js';
import { FloatingProcesses } from '../ui/floating-processes.js';
import { ProcessLinks } from '../ui/process-links.js';

// Comet: two sequential 200vh sticky panels (intro, methods). The starline draws
// inside the central renderer (gated to 'comet', intro-panel surface).

const Toggle = {
  current: 'stardust',
  init() {
    const tabStardust = document.getElementById('tab-stardust');
    const tabHorizon = document.getElementById('tab-horizon');
    if (tabStardust) tabStardust.addEventListener('click', () => this.switch('stardust'));
    if (tabHorizon) tabHorizon.addEventListener('click', () => this.switch('horizon'));
  },
  switch(method) {
    const stardust = document.getElementById('panel-stardust');
    const horizon = document.getElementById('panel-horizon');
    const tabStardust = document.getElementById('tab-stardust');
    const tabHorizon = document.getElementById('tab-horizon');
    const slider = document.getElementById('pillSlider');
    if (!stardust || !horizon || !tabStardust || !tabHorizon || !slider) return;
    this.current = method;
    const isStardust = method === 'stardust';
    stardust.classList.toggle('active', isStardust);
    horizon.classList.toggle('active', !isStardust);
    tabStardust.classList.toggle('active', isStardust);
    tabHorizon.classList.toggle('active', !isStardust);
    slider.classList.toggle('right', !isStardust);
  },
};

export function initComet() {
  FloatingProcesses.init();
  ProcessLinks.init();
  Toggle.init();

  Renderer.add({ sections: ['comet'], render: (now) => ProcessLinks.draw(now) });

  buildCometTimeline();
  return { resize: () => ProcessLinks.resize() };
}

function buildCometTimeline() {
  const introPage = document.getElementById('comet-collab-intro');
  const methods = document.querySelector('.comet-collab-methods');
  const constCanvas = document.getElementById('constellation-canvas');
  if (!introPage) return;

  const CFADE = 100; // vh fade duration per panel edge

  // Hide constellation as we enter the comet wrapper (overlaps intro fade-in).
  if (constCanvas) {
    gsap.fromTo(constCanvas, { opacity: 1 }, {
      opacity: 0, ease: 'none',
      scrollTrigger: {
        trigger: '.comet-panel-intro', start: 'top top',
        end: `top+=${COMET_CONST_HIDE_VH}vh top`, scrub: true, invalidateOnRefresh: true,
      },
    });
  }

  // Panel 1: intro — fade in, hold, fade out as the panel scrolls away.
  gsap.fromTo(introPage, { opacity: 0 }, {
    opacity: 1, ease: 'power2.out',
    scrollTrigger: {
      trigger: '.comet-panel-intro', start: 'top top',
      end: `top+=${CFADE}vh top`, scrub: true, invalidateOnRefresh: true,
    },
  });
  gsap.fromTo(introPage, { opacity: 1 }, {
    opacity: 0, ease: 'power2.in',
    scrollTrigger: {
      trigger: '.comet-panel-intro',
      start: `bottom-=${CFADE}vh top`, end: 'bottom top',
      scrub: true, invalidateOnRefresh: true,
    },
  });

  // Panel 2: methods/tabs — fade in.
  if (methods) {
    gsap.fromTo(methods, { opacity: 0 }, {
      opacity: 1, ease: 'power2.out',
      scrollTrigger: {
        trigger: '.comet-panel-tabs', start: 'top top',
        end: `top+=${CFADE}vh top`, scrub: true, invalidateOnRefresh: true,
      },
    });
  }
}
