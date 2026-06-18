import { gsap } from 'gsap';
import { Renderer } from '../webgl/renderer.js';
import { COMET_CONST_HIDE_VH, vhToPx } from '../scroll/timeline.js';
import { FloatingProcesses } from '../ui/floating-processes.js';
import { ProcessLinks } from '../ui/process-links.js';
import { SWIRL_CX } from '../ui/comet-dive.js';

// Comet: two sequential 200vh sticky panels (intro, methods). The starline draws
// inside the central renderer (gated to 'comet', intro-panel surface).

const Toggle = {
  current: 'stardust',
  _suppressClick: false,
  init() {
    const tabStardust = document.getElementById('tab-stardust');
    const tabHorizon = document.getElementById('tab-horizon');
    const pill = document.querySelector('.comet-pill');
    const slider = document.getElementById('pillSlider');
    // Tap a label to switch (kept).
    if (tabStardust) tabStardust.addEventListener('click', () => this.switch('stardust'));
    if (tabHorizon) tabHorizon.addEventListener('click', () => this.switch('horizon'));
    // Drag the thumb left/right; snap to the nearest side on release.
    if (pill && slider) this._initDrag(pill, slider);
  },

  // Pointer-Events drag (mouse + touch). The thumb sits BEHIND the labels (z-index),
  // so we listen on the whole pill. A move past a small threshold becomes a drag: the
  // slider follows the finger 1:1 (transition off), and on release it snaps to the
  // nearest side and switches. Below the threshold it's a tap → the label's click
  // handler does the switch. `touch-action: pan-y` (CSS) lets a vertical swipe still
  // scroll the page; a horizontal drag is ours.
  _initDrag(pill, slider) {
    let dragging = false, moved = false, startX = 0, startFrac = 0, frac = 0, travel = 1, pid = null;

    const onDown = (e) => {
      if (e.button != null && e.button !== 0) return; // primary / touch only
      this._suppressClick = false; // clear any stale flag from a prior drag
      travel = slider.getBoundingClientRect().width || 1; // px the thumb travels (its own width)
      startX = e.clientX;
      startFrac = this.current === 'horizon' ? 1 : 0;
      frac = startFrac;
      dragging = true;
      moved = false;
      pid = e.pointerId;
    };

    const onMove = (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved) {
        if (Math.abs(dx) < 4) return; // threshold separates a tap from a drag
        moved = true;
        slider.classList.add('dragging'); // kill the snap transition → follow finger 1:1
        try { pill.setPointerCapture(pid); } catch (_) { /* ok */ }
      }
      frac = Math.max(0, Math.min(1, startFrac + dx / travel));
      slider.style.transform = `translateX(${frac * 100}%)`;
      e.preventDefault();
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      if (!moved) return; // a tap → leave it to the label click handler
      try { pill.releasePointerCapture(pid); } catch (_) { /* ok */ }
      slider.classList.remove('dragging'); // restore the snap transition
      this.switch(frac > 0.5 ? 'horizon' : 'stardust'); // set the target side
      slider.style.transform = ''; // release inline → the .right class animates the snap
      this._suppressClick = true; // swallow the trailing click so it doesn't re-switch
    };

    pill.addEventListener('pointerdown', onDown);
    pill.addEventListener('pointermove', onMove);
    pill.addEventListener('pointerup', onUp);
    pill.addEventListener('pointercancel', onUp);
    // Capture-phase: eat the click that fires after a drag (before the label handlers).
    pill.addEventListener('click', (e) => {
      if (this._suppressClick) { e.preventDefault(); e.stopPropagation(); this._suppressClick = false; }
    }, true);
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

export function initComet(cometDive) {
  FloatingProcesses.init();
  ProcessLinks.init();
  Toggle.init();

  Renderer.add({ sections: ['comet'], render: (now) => ProcessLinks.draw(now) });

  buildCometTimeline(cometDive);
  return { resize: () => { ProcessLinks.resize(); if (cometDive) cometDive.resize(); } };
}

function buildCometTimeline(cometDive) {
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

  // Panel 1: intro — fade IN (shared by both transition paths below). Plays during the
  // APPROACH, not after pin: the muse white stage un-sticks and scrolls off over muse's last
  // 100vh, which begins exactly when this panel's top crosses the viewport bottom — so fading
  // the comet scene in from `top bottom` → `top top` crosses over with the muse exit in
  // lockstep (no black void). Keyword form (NOT `top+=100vh`) also sidesteps the vh-as-px trap
  // that made this fade ~100px = a near-instant pop-in.
  gsap.fromTo(introPage, { opacity: 0 }, {
    opacity: 1, ease: 'power2.out',
    scrollTrigger: {
      trigger: '.comet-panel-intro', start: 'top bottom',
      end: 'top top', scrub: true, invalidateOnRefresh: true,
    },
  });

  // --- Intro -> Methods transition ---
  const portal = document.querySelector('.comet-zoom-portal');
  const swirlCanvas = document.getElementById('comet-zoom-swirl-canvas');
  const logoEl = document.getElementById('comet-collab-intro-logo');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fallback (reduced motion, or markup missing): plain scroll cross-fade — intro out
  // as its panel scrolls away, methods in on the next panel. No zoom.
  if (reduce || !portal || !swirlCanvas || !logoEl || !cometDive) {
    gsap.fromTo(introPage, { opacity: 1 }, {
      opacity: 0, ease: 'power2.in',
      scrollTrigger: {
        trigger: '.comet-panel-intro',
        start: `bottom-=${CFADE}vh top`, end: 'bottom top',
        scrub: true, invalidateOnRefresh: true,
      },
    });
    if (methods) {
      gsap.fromTo(methods, { opacity: 0 }, {
        opacity: 1, ease: 'power2.out',
        scrollTrigger: {
          trigger: '.comet-panel-tabs', start: 'top top',
          end: `top+=${CFADE}vh top`, scrub: true, invalidateOnRefresh: true,
        },
      });
    }
    return;
  }

  // --- Zoom-portal transition: the swirl takes over (text fades), the camera flies INTO a
  //     WHITE point of the swirl until that white fills the screen (no veil), then the toggle.
  // The swirl AND the ripple are CANVASES (comet-dive.js + burst-ripple.js) drawn by the central
  // Renderer every frame from ONE scrub value (`dive.p`). The dive geometry/ease/pulse all live
  // in comet-dive.js; here we only own the timeline (WHEN it happens) and feed it `p` + `appear`
  // + the on-page logo's LIVE rect (so the take-over anchors exactly on any device). Driving both
  // surfaces from one canvas-painted source is what kills the fast-reverse desync — a CSS
  // transform layer and a canvas can't be guaranteed to present the same frame. ---
  const content = introPage.querySelector('.comet-collab-intro-content');
  const processes = document.getElementById('floating-processes');
  const processGroup = document.getElementById('floating-process-group');

  gsap.set(portal, { opacity: 0 });
  gsap.set(methods, { opacity: 0 });

  // Implode the process images toward the swirl (not screen centre) as the dive plunges, so
  // seed the group's scale pivot at the on-page swirl point (same SWIRL_CX the dive uses, so
  // the two can't drift). transform-origin is relative to the element's OWN box, so compute the
  // swirl offset RELATIVE to the group's rect (scroll-invariant — both move together as the
  // sticky panel scrolls), not viewport-absolute. Re-seed on refresh (URL-bar/layout shifts).
  const setProcessOrigin = () => {
    if (!processGroup) return;
    const r = logoEl.getBoundingClientRect();
    const g = processGroup.getBoundingClientRect();
    if (!r.width || !r.height) return;
    gsap.set(processGroup, {
      transformOrigin: `${(r.x - g.x) + r.width * SWIRL_CX}px ${(r.y - g.y) + r.height * 0.5}px`,
    });
  };
  setProcessOrigin();

  // dive.p = linear dive progress 0->1 (comet-dive.js applies the power3.in ease + pulse window,
  // so scale + ripple come from the same p and can't desync). dive.appear = take-over fade-in.
  // dive.reveal cross-dissolves the canvas white into the methods toggle seen THROUGH the
  // swirl (comet-dive.js masks the static methods panel with the swirl, fed from the swirl's
  // own per-frame rect — same source/frame, so the window can't desync).
  const dive = { p: 0, appear: 0, reveal: 0 };
  cometDive.setState({ methodsEl: methods }); // the panel the swirl masks as it grows
  const pushDive = () => {
    const r = logoEl.getBoundingClientRect();
    cometDive.setState({
      p: dive.p,
      appear: dive.appear,
      reveal: dive.reveal,
      logoRect: { x: r.x, y: r.y, width: r.width, height: r.height },
    });
  };
  pushDive();

  // One scrubbed timeline. Window 80vh->280vh into comet; 1 unit==1vh. vh->px per the trap.
  // pushDive runs on the TIMELINE's onUpdate (fires on EVERY playhead move, incl. fast jumps
  // past child tweens), so the canvas always has the current p/appear/anchor.
  const tl = gsap.timeline({
    onUpdate: pushDive,
    scrollTrigger: {
      trigger: '.comet-panel-intro',
      start: () => `top+=${vhToPx(80)}px top`,
      end: () => `top+=${vhToPx(280)}px top`,
      scrub: true,
      invalidateOnRefresh: true,
      onRefresh: () => { pushDive(); setProcessOrigin(); },
    },
  });

  tl
    // 1) TAKE-OVER: the on-page logo (text) fades out; the canvas swirl fades in over the same
    //    spot/size (anchored to the live logo rect), so it reads as the on-page swirl itself.
    .to(portal, { opacity: 1, duration: 5 }, 0)
    .to(logoEl, { opacity: 0, duration: 20 }, 0)
    // Text leaves FAST (20); the process illustrations LINGER ~3× longer (60) and implode
    // toward the swirl as it dives — filling the bottom with inward motion instead of a void.
    // `processes` opacity fades the whole container (incl. starline); `processGroup` scale
    // pulls only the images inward (the canvas is a sibling, so it isn't scaled).
    .to(content, { opacity: 0, ease: 'power1.in', duration: 20 }, 0)
    .to(processes, { opacity: 0, ease: 'power2.in', duration: 60 }, 0)
    .to(processGroup, { scale: 0.3, ease: 'power2.in', duration: 60 }, 0)
    .to(dive, { appear: 1, duration: 14 }, 4)
    // 2) FLY IN: linear p 0->1; comet-dive.js eases it (power3.in) into the white point while
    //    drifting that point to centre, and pulses the ripple from the same p.
    .to(dive, { p: 1, ease: 'none', duration: 150 }, 22)
    // 3) WINDOW REVEAL: cross-dissolve the canvas white into the methods panel (section + toggle)
    //    seen THROUGH the swirl. Start earlier (p~0.3, while the swirl window is still SMALL) with an
    //    ease-IN so the white logo dominates first and the content emerges through a small, then
    //    growing, swirl window — "you start to see the text". Methods goes opaque as the reveal
    //    starts; comet-dive.js masks it from reveal==0 so it's NEVER opaque-but-unmasked (that
    //    boundary frame was the full-light-background "white flash"); the canvas white fades by
    //    (1-reveal); the window size tracks the swirl (p), so it grows to fill. ~p0.95 → clean full toggle.
    .set(methods, { opacity: 1 }, 70)
    .to(dive, { reveal: 1, ease: 'power2.in', duration: 95 }, 70)
    // 4) Once the window has filled (toggle fully revealed, mask auto-cleared), fade the portal
    //    (residual ripple) out — the toggle is already there underneath.
    .to(portal, { opacity: 0, duration: 22 }, 168);
}
