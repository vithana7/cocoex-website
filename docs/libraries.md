# Libraries & External Dependencies

Zero-framework, zero-bundler static site. No `package.json`, no build step.

## CDN Dependencies

| Library | Version | Loaded in | Why |
|---|---|---|---|
| Lenis | 1.3.4 | `<script>` end of `<body>`, **before GSAP** | Smooth scrolling; fixes iOS Safari body-scroll quirks |
| GSAP core | 3.12.5 | `<script>` end of `<body>` | Tweens / timelines |
| ScrollTrigger | 3.12.5 | same | Drives all scroll-linked animation |
| Adobe Fonts (Typekit) | — | `<link>` in `<head>` (preconnected) | Loads Canela (kit ID `afs8ors`) |

Scripts load at the bottom of `<body>` (`index.html:403–407`): Lenis, GSAP core, ScrollTrigger, then `js/main.js`. `Lenis`, `gsap`, `ScrollTrigger` are global by the time `main.js` runs. **Lenis must load before GSAP** — `main.js` constructs the Lenis instance and hands its RAF to `gsap.ticker` at the very top of the IIFE. (MotionPathPlugin was removed — it is no longer loaded or registered.)

## Lenis — Project Integration

Lenis virtualizes scroll position and is wired to GSAP at `main.js:20–50`. Body is the scroll container (`html, body { height: 100% }; body { overflow-y: auto }`), so Lenis is initialised with `wrapper: document.body, content: '.scroll-container'`.

```javascript
const lenis = new Lenis({
  wrapper: document.body,
  content: document.querySelector('.scroll-container'),
  autoRaf: false,
  lerp: 0.1,            // lower = stiffer; higher = floatier
  wheelMultiplier: 1.0,
  touchMultiplier: 1.0,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0);
ScrollTrigger.scrollerProxy(document.body, { /* scrollTop + getBoundingClientRect */ });
ScrollTrigger.defaults({ scroller: document.body });
```

**Rules:**
- GSAP ticker is the single RAF source — `autoRaf: false` on Lenis is required, otherwise Lenis runs its own RAF and double-ticks ScrollTrigger.
- Never re-enable `ScrollTrigger.normalizeScroll(true)` — it deadlocks with Lenis on iOS Safari. The legacy block remains commented out (around `main.js:55`) for context.
- Do not remove `html, body { height: 100% }` or `body { overflow-y: auto }` — Lenis is configured for body-as-scroller and removing these breaks layout (regression observed in this codebase).
- `window.lenis` is exposed for debugging.

## GSAP — Project-Specific Patterns

### ScrollTrigger conventions

- `scrub: true` — never use a number (double-easing artefact with timeline easing).
- `invalidateOnRefresh: true` — required on every trigger whose `start`/`end` reads `window.innerHeight` (so resize recomputes pixel offsets).
- **No GSAP `pin: true`.** All sticky sections use native CSS `position: sticky` inside tall wrappers — GSAP pinning deadlocks iOS Safari under the Lenis body-scrollerProxy. Section panels: `.muse-stage`, `.comet-panel-intro`/`.comet-panel-tabs` (each a sticky child of its `.section-panel` wrapper).
- All `start`/`end` distances reference `SCROLL_TIMING` (`main.js:133–169`). Never inline raw vh values.
- All ScrollTrigger triggers run against `document.body` via `scrollerProxy` (set globally with `ScrollTrigger.defaults({ scroller: document.body })`).

### `ScrollTrigger.refresh()` is called

- After resize (debounced 150ms).
- After `orientationchange` with a 300ms timeout — iOS does not commit new viewport dimensions immediately, so refreshing earlier reads stale values.
- On `window` `load`.

## Adobe Fonts (Canela)

Kit ID: `afs8ors`. Weights loaded: 400, 700.

```css
--font-canela: 'canela', Georgia, serif;
```

Rules:
- Reference via `var(--font-canela)`. Never write `'canela'` directly in a rule.
- Fallback is always serif. Canela is a serif display face; the design depends on it.
- Never `@import` inside CSS files (blocks render).

## WebGL

Native WebGL 1.0, no wrappers. Three factory starfield canvases share a single shader (plus the intro's own shader = 4 WebGL contexts total) — see `technical-spec.md` § "WebGL Architecture" for rationale.

Inject shared GLSL via template literals from `GLSL_UTILS` (`main.js:61–128`):

```javascript
const fragmentShaderSource = `
  precision highp float;
  // ...
  ${GLSL_UTILS.SIMPLEX_NOISE}
  ${GLSL_UTILS.STAR_FIELD}
  void main() { /* ... */ }
`;
```

Never copy-paste these helpers into a new shader.

## Local Dev

```bash
python3 -m http.server 8000
# http://localhost:8000
```
