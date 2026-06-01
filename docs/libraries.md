# Libraries & External Dependencies

Zero-framework, zero-bundler static site. No `package.json`, no build step.

## CDN Dependencies

| Library | Version | Loaded in | Why |
|---|---|---|---|
| GSAP core | 3.12.5 | `<script>` end of `<body>` | Tweens / timelines |
| ScrollTrigger | 3.12.5 | same | Drives all scroll-linked animation |
| MotionPathPlugin | 3.12.5 | same | Registered for completeness; not currently used. Safe to remove if bundle size matters. |
| Adobe Fonts (Typekit) | — | `<link>` in `<head>` | Loads Canela (kit ID `afs8ors`) |

Scripts load at the bottom of `<body>` (`index.html:462–465`); `gsap`, `ScrollTrigger`, `MotionPathPlugin` are global by the time `main.js` runs.

## GSAP — Project-Specific Patterns

### iOS-guarded `normalizeScroll`

```javascript
// main.js:15–19
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
if (!isIOS && 'ontouchstart' in window) {
  ScrollTrigger.normalizeScroll(true);
}
```

`normalizeScroll(true)` deadlocks with non-passive touch listeners on iOS Safari, freezing scroll. iOS handles GSAP scrub natively, so we only enable normalization on Android. **Do not change this guard** — toggling it unconditionally has caused production scroll freezes.

### ScrollTrigger conventions

- `scrub: true` — never use a number (double-easing artefact with timeline easing).
- `invalidateOnRefresh: true` — required on every trigger whose `start`/`end` reads `window.innerHeight` (so resize recomputes pixel offsets).
- `anticipatePin: 1` — set on triggers near pinned sections (Muse, Comet wrappers) to prevent a one-frame pop.
- All `start`/`end` distances reference `SCROLL_TIMING` (`main.js:96–124`). Never inline raw vh values.

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

Native WebGL 1.0, no wrappers. Five WebGL canvases share a single starfield shader factory — see `TECHNICAL-SPEC.md` § "WebGL Architecture" for rationale.

Inject shared GLSL via template literals from `GLSL_UTILS` (`main.js:24–91`):

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
