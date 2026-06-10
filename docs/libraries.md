# Libraries & External Dependencies

Vanilla JS organised into ES modules, bundled by **Vite**. GSAP and Lenis are npm dependencies imported as modules — **not** loaded from a CDN.

## npm Dependencies (`package.json`)

| Library | Version | Imported in | Why |
|---|---|---|---|
| `gsap` | `3.12.5` | the modules that animate | Tweens / timelines |
| `gsap/ScrollTrigger` | (ships with gsap) | scroll modules + sections | Drives all scroll-linked animation |
| `lenis` | `1.3.4` | `src/scroll/smooth-scroll.js` | Smooth scrolling; fixes iOS Safari body-scroll quirks |
| `vite` (dev) | `^5.4.0` | build tooling | Dev server + production bundle |

`index.html` loads exactly one entry: `<script type="module" src="/src/main.js">`. There are **no CDN `<script>` tags** and no inline `onclick`. (MotionPathPlugin is not used.)

### Import pattern

```javascript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
```

`gsap.registerPlugin(ScrollTrigger)` is called once, in `initSmoothScroll()` (`src/scroll/smooth-scroll.js`), before any trigger is created. Vite resolves the bare specifiers from `node_modules` and tree-shakes the bundle.

### Build & run

```bash
npm install
npm run dev      # Vite dev server, http://localhost:5173
npm run build    # production bundle → dist/
npm run preview  # serve the built dist/
```

`vite.config.js`: `base: './'`, build `target: es2018`, `outDir: dist`, `assetsInlineLimit: 0` (assets are emitted as files, never inlined as data URIs), dev server `port: 5173`, `open: true`.

## Lenis — Project Integration

Lenis virtualizes scroll position and is wired to GSAP in `src/scroll/smooth-scroll.js`. Body is the scroll container (`html, body { height: 100% }; body { overflow-y: auto }` in `base.css`), so Lenis is initialised with `wrapper: document.body, content: '.scroll-container'`.

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
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
ScrollTrigger.scrollerProxy(document.body, { /* scrollTop + getBoundingClientRect */ });
ScrollTrigger.defaults({ scroller: document.body });
```

**Rules:**
- GSAP ticker is the single RAF source — `autoRaf: false` on Lenis is required, otherwise Lenis runs its own RAF and double-ticks ScrollTrigger.
- `normalizeScroll` is intentionally NOT enabled — it deadlocks with Lenis on iOS Safari. **Never re-enable it.**
- Do not remove `html, body { height: 100% }` or `body { overflow-y: auto }` — Lenis is configured for body-as-scroller and removing these breaks layout.
- `window.lenis` is exposed for debugging.

## GSAP — Project-Specific Patterns

### ScrollTrigger conventions

- `scrub: true` — never use a number (double-easing artefact with timeline easing).
- `invalidateOnRefresh: true` — required on every trigger whose `start`/`end` reads `window.innerHeight` (so resize recomputes pixel offsets). The section timelines use function-form `start`/`end` that call the px getters on `timeline.js` `phase()` descriptors.
- **No GSAP `pin: true`.** All sticky sections use native CSS `position: sticky` inside tall wrappers — GSAP pinning deadlocks iOS Safari under the Lenis body-scrollerProxy. Sticky panels: `.muse-stage`, `.comet-panel-intro`, `.comet-panel-tabs`.
- All `start`/`end` distances reference `src/scroll/timeline.js` (`phase()` / `sectionSpan()` / `vhToPx()`). Never inline raw vh values.
- All triggers run against `document.body` via `scrollerProxy` (set globally with `ScrollTrigger.defaults({ scroller: document.body })`).

### `ScrollTrigger.refresh()` is called

- After the debounced (150ms) resize in `src/main.js`, having re-injected heights and resized surfaces.
- Once at the end of `boot()` so triggers measure correctly after fonts/layout settle.

## Adobe Fonts (Canela)

Kit ID: `afs8ors`. Weights loaded: 400, 700. Still loaded via `<link>` in `index.html` `<head>` (preconnected) — this is the one remaining external `<link>`.

```css
--font-canela: 'canela', Georgia, serif;
```

Rules:
- Reference via `var(--font-canela)`. Never write `'canela'` directly in a rule.
- Fallback is always serif. Canela is a serif display face; the design depends on it.
- Never `@import` a font inside CSS (blocks render).

## WebGL

Native WebGL 1.0, no wrappers. Three factory starfield canvases share one shader (`createStarfield`, `src/webgl/starfield.js`); the intro has its own shader (`createIntroStarfield`, `src/webgl/intro-starfield.js`) — 4 WebGL contexts total. See `technical-spec.md` § "WebGL Architecture" for rationale.

Shared GLSL is imported from `src/webgl/shaders/glsl-utils.js` (`SIMPLEX_NOISE`, `STAR_FIELD`, `VERTEX_QUAD`) and the fragment sources in `src/webgl/shaders/intro-frag.js` (`INTRO_FRAG`, `STARFIELD_FRAG`):

```javascript
import { VERTEX_QUAD } from './shaders/glsl-utils.js';
import { STARFIELD_FRAG } from './shaders/intro-frag.js';
```

Never copy-paste the GLSL helpers into a new shader — import them.
