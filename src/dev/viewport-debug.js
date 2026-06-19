import { vhToPx, sectionSpan, TIMELINE } from '../scroll/timeline.js';
import { Renderer } from '../webgl/renderer.js';

// On-device viewport diagnostic for the iOS-Safari muse-logo timing drift (Issue 2).
// Gated behind `?debug` so it NEVER ships in normal use. It prints, live as you scroll on
// the phone, whether the layout (CSS vh/dvh heights) and the scroll math (window.innerHeight)
// agree. The key tell is `muse panel Δ`: the measured .muse-panel height (from CSS `490vh`)
// vs. what the scroll math assumes (`490 * innerHeight/100`). On Chrome these match (Δ≈0);
// on iOS Safari they diverge as the URL bar shows/hides — that divergence IS the bug.
//
// Usage: open the site with `?debug` (e.g. vithana7.github.io/?debug), scroll into the muse
// intro on the iPhone, and watch the rows. If `muse panel Δ` is non-zero / changes with the
// URL bar, the unit-mismatch hypothesis is confirmed → apply fix A or B from the plan.

export function initViewportDebug() {
  if (!new URLSearchParams(location.search).has('debug')) return;

  const box = document.createElement('div');
  box.setAttribute('aria-hidden', 'true');
  Object.assign(box.style, {
    position: 'fixed', top: '0', left: '0', zIndex: '99999',
    font: '11px/1.45 ui-monospace, Menlo, monospace',
    color: '#0f0', background: 'rgba(0,0,0,0.82)',
    padding: '6px 8px', margin: '0', whiteSpace: 'pre', pointerEvents: 'none',
    maxWidth: '62vw', borderBottomRightRadius: '6px',
  });
  document.body.appendChild(box);

  const panel = () => document.querySelector('.muse-panel');
  const stage = () => document.querySelector('.muse-stage');
  const num = (n) => Math.round(n);

  const museDurVh = TIMELINE.sections.muse.endVh - TIMELINE.sections.muse.startVh;

  let queued = false;
  const render = () => {
    queued = false;
    const ih = window.innerHeight;
    const vv = window.visualViewport ? window.visualViewport.height : NaN;
    const vhUnit100 = vhToPx(100); // 100vh in px via the (now CSS-matched) unit — should ≈ measured/4.9

    const p = panel();
    const measuredPanel = p ? p.getBoundingClientRect().height : NaN;  // layout px (CSS vh)
    const assumedPanel = vhToPx(museDurVh);                            // scroll-math px (post-fix)
    const panelDelta = measuredPanel - assumedPanel;                  // should now be ~0

    const st = stage();
    const measuredStage = st ? st.getBoundingClientRect().height : NaN; // 100dvh (dynamic)

    // Lenis scrolls <body>, so window.scrollY stays 0 — read Lenis's virtual scroll.
    const scrollPx = window.lenis ? window.lenis.scroll
      : (document.body.scrollTop || window.scrollY || 0);
    const museStartPx = vhToPx(sectionSpan('muse').startVh);
    const fadeEndPx = museStartPx + vhToPx(50); // muse.fadein = 50vh (logo/copy fade-in end)

    box.textContent =
      `scroll         ${num(scrollPx)}\n` +
      `innerHeight    ${num(ih)}\n` +
      `visualViewport ${num(vv)}\n` +
      `vh unit (100)  ${num(vhUnit100)}   <- CSS vh, vs innerHeight\n` +
      `rAF frames     ${Renderer.frames}   <- scroll: climbs? or stalls?\n` +
      `─ muse ─\n` +
      `panel measured ${num(measuredPanel)}\n` +
      `panel assumed  ${num(assumedPanel)}\n` +
      `panel Δ        ${num(panelDelta)}   <- ~0 = FIXED\n` +
      `stage measured ${num(measuredStage)}\n` +
      `muse startPx   ${num(museStartPx)}\n` +
      `fadeIn endPx   ${num(fadeEndPx)}`;
  };

  // Tick the readout on its own rAF too, so `rAF frames` is observable while idle (and you can
  // watch it stall during an iOS momentum scroll, which is the Issue-4 root cause).
  const loop = () => { render(); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);

  // Render SYNCHRONOUSLY on scroll/resize (not via rAF) so the overlay keeps updating during an
  // iOS momentum scroll even when rAF is throttled — that's how you see `rAF frames` stall while
  // `scroll` keeps changing (the Issue-4 signature). Listen on Lenis too (its scroll is virtual).
  window.addEventListener('scroll', render, { passive: true });
  window.addEventListener('resize', render, { passive: true });
  if (window.lenis) window.lenis.on('scroll', render);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', render, { passive: true });
    window.visualViewport.addEventListener('scroll', render, { passive: true });
  }
  render();
}
