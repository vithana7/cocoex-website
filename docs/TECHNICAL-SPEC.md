# Technical Specification — Architecture Decisions

Why the codebase is structured this way. For exact behaviour at each scroll position, read `js/main.js` and the section copy in `index.html`. This doc explains the *why*.

---

## Scroll Budget

Total page height ≈ **1340vh**. All section heights derive from `SCROLL_TIMING` (`main.js:133–169`). Never hardcode `vh` values inline. Wrapper heights in `styles.css` must match these constants.

| Section | Range | Position | Constant |
|---|---|---|---|
| Landing + Mission | 0–480vh | Fixed overlay | `INTRO_TOTAL: 480` (mission overlays the settled dots) |
| Muse (intro → orbit) | 480–880vh | Sticky `.muse-stage`, one overlapping panel | `MUSE_TOTAL: 400` (fade 100 + hold 200 + switch 100) |
| Comet Intro | 880–1080vh | Sticky `.comet-panel-intro` | `COMET_INTRO_PAUSE: 200` (fade 100 + hold 100) |
| Comet Methods | 1080–1280vh | Sticky `.comet-panel-tabs` | `COMET_METHODS_FADE: 100` + `DWELL: 100` (`COMET_TOTAL: 400`) |
| Events | 1280vh+ | Normal flow (centered) | — |
| Footer | end of flow | Static | — |

The comet **connected-images panel was removed** — comet now ends at the methods/tabs panel. Muse intro and orbit were **merged into one overlapping sticky panel** (the center logo stays put while the background flips black→white), so there is no separate muse-intro section.

### Why these values?

- **480vh intro:** three phases (orbit, transition text, constellation explosion) plus the smoke-clear + mission hold all need room. The explosion settles at fraction `0.68`, smoke clears `0.70→0.76`, mission holds `0.80→0.92`, then fades out `0.92→1.0`.
- **400vh muse:** fade-in 100 + readable hold 200 + black→white switch 100. No orbit dwell (`MUSE_CONTENT_HOLD: 0`) — the orbit is visible through the switch, so you scroll straight into comet.
- **200vh per comet panel:** intro = fade-in 100 + hold 100; tabs = methods fade 100 + dwell 100. Two sequential sticky panels that never co-exist on screen (the old z-index race is gone).

**Rule of thumb:** any phase under 100vh stutters on trackpads. Any phase over 200vh feels slack — Lenis's lerp amplifies that. Update wrapper heights in CSS in lockstep with `SCROLL_TIMING` changes.

---

## Single `masterRender()` RAF Loop

All WebGL canvases render inside one `requestAnimationFrame` loop (`masterRender()`, `main.js:823`), driven by `gsap.ticker` (which also drives Lenis). New canvases are added inside `masterRender()`, never as separate RAF loops.

Each per-canvas draw block is gated by a `currentSection` check, so off-screen starfields don't spend GPU cycles. A top-level ScrollTrigger inside `initEventListeners` updates `currentSection` from scroll position with a 75vh **lead buffer** (next-section shaders wake up early to avoid pop-in). Past the **unbuffered** intro end (480vh), the entire `.intro` overlay is set to `visibility: hidden` and the constellation 2D buffer is `clearRect`'d, since the intro canvases would otherwise bleed through the transparent muse section.

**Why one loop:**
1. Browsers throttle every additional RAF independently — multiple loops compound jitter.
2. We can pause all rendering at once when the tab is hidden (Page Visibility API gates the loop).
3. `lastActiveProgram` cache means `gl.useProgram()` is only called when the program reference actually changes — saves dozens of state switches per frame.
4. Single point of control for context-loss handling. If any context is lost (`webglContextsLost = true`), the loop early-exits until restored.

The orbit position update (`MuseScroll.updateOrbitPositions`) also lives in this loop for the same reason — one frame budget, one place to coordinate.

---

## WebGL Architecture: One Shader Factory

The codebase has **three** starfield canvases driven by the factory (plus the intro's own shader). They all use **the same shader**, parameterized by a factory.

`createStarfield(canvasId, options)` (`main.js:1409`) returns a self-contained module. Two options:

- `invert: true` — fragment output becomes `1.0 - color`, turning the canonical white-on-black starfield into black-on-offwhite. Used for the muse and comet sections, which sit on a light surface.
- `intensity` — multiplies star brightness pre-mix. Default low; inverted variants use `0.9` to read against off-white.

Instances:

| Instance | Canvas | Role |
|---|---|---|
| `UnifiedStarfield` | `#unified-starfield-canvas` | Default white-on-black. Shared backdrop across muse + comet. |
| `MuseBackground` | `#muse-background-canvas` | Inverted. Behind muse orbiting layout. |
| `CometBgPrimary` | `#comet-collab-background-canvas` | Inverted. Comet section. |

(`CometBgSecondary` was removed with the comet connected-images panel.)

**Why a factory and not separate modules:**
The previous architecture had `MuseBackground` and `CometCollabBackground` as separate gradient shaders (7-color simplex blends). They drifted out of sync, duplicated GLSL, and triggered extra `gl.useProgram()` switches per frame. Collapsing to one shader with two parameters cut ~450 LOC, removed the `MuseBackground.colors[]` array, and made adding new canvases trivial.

If you need a non-starfield WebGL effect, prefer extending the factory with another option flag rather than introducing a new module.

### Intro shader is separate

`#bg-canvas` (`initWebGL()`, `main.js:479`) uses its own shader because it has unique requirements:
- Cosmic noise background (3 octaves of simplex, not a star grid).
- `u_pulse` uniform for the dispersive big bang wave at the constellation explosion start.

Folding this into the factory would have meant a uniform every starfield canvas pays for. Kept separate.

### Constellation canvas is 2D

`#constellation-canvas` uses 2D Canvas, not WebGL. It draws 7 dots with z-depth sort, eight connection lines with linear gradients, and trails — all of which are easier with the 2D context API and don't need shader-level performance. Adding another WebGL context for this would push us past the browser's per-page WebGL context limit (Chrome caps at 16, Safari at 8) without benefit.

---

## DPR Cap on Mobile

```javascript
const dpr = isMobile() ? Math.min(baseDPR, 2) : baseDPR;
```

Modern phones ship with `devicePixelRatio` of 3. A full-screen WebGL shader at 3× is 9× the pixel count of 1×. Capping at 2× cuts that to 4× — a 33% pixel-fill reduction with negligible visual difference for animated noise/star content.

The cap is **non-negotiable on mobile**. Removing it has caused 30→15fps regressions on iPhones in past testing. Desktop is uncapped because GPU headroom is larger.

The factory `createStarfield` also caps at 2× — every WebGL canvas in the codebase respects the cap, as does the 2D `ProcessLinks` starline canvas which uses `setTransform(dpr,0,0,dpr,0,0)`.

---

## Lenis-driven Scroll (replaces `normalizeScroll`)

```javascript
// main.js:20–53
const lenis = new Lenis({
  wrapper: document.body,
  content: document.querySelector('.scroll-container'),
  autoRaf: false,
  lerp: 0.1,
  wheelMultiplier: 1.0,
  touchMultiplier: 1.0,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
ScrollTrigger.scrollerProxy(document.body, { /* ... */ });
ScrollTrigger.defaults({ scroller: document.body });
```

Production iOS Safari was freezing scroll on the body-as-scroller layout — earlier we tried `ScrollTrigger.normalizeScroll(true)` (Android-guarded) but on iOS it deadlocks with non-passive touch listeners, and on the body-scroll layout it didn't address the underlying jitter. Lenis 1.3.4 virtualizes scroll position, sidestepping the iOS quirk entirely while smoothing the experience on every platform.

**Why this exact wiring:**
- `wrapper: document.body, content: '.scroll-container'` — Lenis defaults assume `<html>` is the scroller. Our app body-scrolls (`html, body { height: 100% }; body { overflow-y: auto }`), so we tell Lenis explicitly. Removing those CSS rules breaks layout.
- `autoRaf: false` + `gsap.ticker.add(t => lenis.raf(t * 1000))` — single RAF source. Two RAFs double-tick ScrollTrigger and corrupt scrub progress.
- `lenis.on('scroll', ScrollTrigger.update)` — every Lenis tick refreshes ST positions; otherwise pinned/scrubbed sections drift.
- `ScrollTrigger.scrollerProxy(document.body, …)` + `ScrollTrigger.defaults({ scroller: document.body })` — every trigger is implicitly tied to body. New triggers need no per-instance scroller config.

The legacy `normalizeScroll` block (around `main.js:55`) is left commented for context. **Never re-enable it alongside Lenis.**

---

## SCROLL_TIMING is the Single Source of Truth

All scroll-driven distances live in `SCROLL_TIMING` (`main.js:133–169`). Inline `vh` values in animations are forbidden.

**Why a constant table:**
1. Phase boundaries are coupled — moving `MUSE_INTRO_HOLD` requires updating `MUSE_TOTAL` and the comet wrapper trigger offsets. Centralising forces these dependencies to stay coherent.
2. Reading the table is the fastest way to understand the page's pacing without simulating the scroll.
3. Comments next to each value (`// 350 - increased from 250`) document the *reason* for each choice — a value buried in a `start: 'top+=350vh top'` does not.

When tuning scroll feel, change `SCROLL_TIMING` constants. Then verify with the bug checklists below per section.

---

## Common Pitfalls

These are the bugs that have actually been hit in this codebase. Read them before changing related code.

**Canvas rotation flicker.** Never apply both manual rotation (in canvas draw) and CSS `transform` rotation on the same canvas. Store unrotated positions; let CSS rotate. The constellation canvas does this — see `updateFireworkDots()`.

**Scroll position reads as 0.** Browsers vary. Use `window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0`.

**`scroll-behavior: smooth` on `html`.** Conflicts with GSAP scroll control. Produces double-scroll artefacts. Forbidden.

**`overflow-y: scroll` on both `html` and `body`.** Creates a doubled scrollbar; one of them stops responding to GSAP. Set on one only.

**Drag interferes with scroll.** Document-level `touchmove` must be `{ passive: true }`. Block scroll only on the dragged element via `style.touchAction = 'none'`. See `FloatingProcesses.startDrag/endDrag`.

**WebGL context limit.** Browsers cap concurrent WebGL contexts (~8–16). Adding more canvases evicts older ones, causing visible blackouts. Four WebGL contexts are active — stay under eight.

**WebGL context loss.** Mobile browsers can drop contexts at any time. `initWebGL` registers `webglcontextlost`/`webglcontextrestored` handlers (`main.js:479`+); the master loop checks `webglContextsLost` and pauses until restoration. Replicate this pattern on any new context.

---

## Performance Targets

| Metric | Target |
|---|---|
| FCP | < 1.5s on 4G |
| LCP | < 2.5s on 4G |
| CLS | < 0.1 |
| Lighthouse | 95+ all categories |
| Desktop scroll | 60fps |
| Mobile WebGL | ≥ 30fps (DPR capped at 2×) |
| Resize debounce | 150ms |

---

## Cross-Browser & Responsive Verification

Before a release, scroll through the entire page on:

- Chrome / Firefox / Safari / Edge desktop (latest).
- iOS Safari (current iPhone): touch drag on floating images, popup interactions, no scroll freeze.
- Android Chrome: Lenis-driven scroll smooth, DPR cap visible (no overheating).
- 320px / 375px / 768px / 1024px / 1440px / 1920px viewports.
- `prefers-reduced-motion`: CSS animations and popup particles disabled.
- Keyboard navigation: Tab through muses, Enter opens popup, Escape closes.
- All external links open in a new tab with `rel="noopener noreferrer"`.

Per-section bug checklists previously lived in this file. They are now checked at PR time against the actual rendered behaviour rather than against documentation that drifts from code.
