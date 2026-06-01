# cocoex.xyz — AI Context & Technical Reference

> **UPDATED AT:** 2026-06-01
> Run `/doc-minder` after any meaningful change to keep this file current.

---

## What This File Is

Ground-truth context for any Claude session working on this codebase. Read this before touching any file. When in doubt about a line number, verify with the actual file — this document can lag behind the code.

**Source code is the reference.** `index.html`, `css/styles.css`, and `js/main.js` are authoritative — grep them directly. The `docs/` folder explains *why*, not *what*.

**On session start — read these docs before writing any code:**

| Priority | File | Read when |
|---|---|---|
| Always | `docs/technical-spec.md` | Architecture decisions, scroll timing, WebGL rationale |
| Layout work | `docs/responsive-design.md` | Fluid typography strategy, orbit ellipse, breakpoint philosophy |
| Dependencies | `docs/libraries.md` | GSAP + Lenis, Typekit, project-specific patterns |

---

## Project Identity

**cocoex** is an art DAO blending art, blockchain, community and social impact.

**Mission:** Art moves people. People move the world.
**Throughline:** The creation belongs to the artists. The impact belongs to the world.

**Brand rules (apply silently):**
- `cocoex` — always lowercase in copy. `CoCoEX` is a graphic asset only, never typed.
- Tone: precise, poetic. Never: "innovative", "transformative", "impactful", "leveraging".
- Reference world: independent publishing, art institutions, artist studios.
- Font: Canela (bold 700 + regular 400) via Adobe Typekit ID `afs8ors`. Fallback: Georgia, serif.
- Logo system: three hand-drawn logos (cocoex symbol, Comet Collab, Muse constellation). Never simplify or substitute geometry.

---

## The Seven Muses (Canonical)

| # | Name | Cause | Hex | CSS Var | Planet | Day |
|---|------|-------|-----|---------|--------|-----|
| 1 | **Lunes** | Water | `#5783A6` | `--lunes` | Moon | Monday |
| 2 | **Ares** | Reforestation | `#D54D2E` | `--ares` | Mars | Tuesday |
| 3 | **Rabu** | Human Rights | `#8CB07F` | `--rabu` | Mercury | Wednesday |
| 4 | **Thunor** | Renewable Energy | `#F8D86A` | `--thunor` | Jupiter | Thursday |
| 5 | **Shukra** | Bio-diversity | `#5E47A1` | `--shukra` | Venus | Friday |
| 6 | **Dosei** | Zero Hunger | `#7F49A2` | `--dosei` | Saturn | Saturday |
| 7 | **Solis** | Well-being | `#D48348` | `--solis` | Sun | Sunday |

Muse colors are used for: orbit dot fills, popup aura glow, muse tags in campaign cards, WebGL gradient blends.

---

## Site Architecture

**Stack:** Vanilla HTML5 / CSS3 / JavaScript ES6+ · GSAP 3.12.5 + Lenis 1.3.4 (CDN) · WebGL (custom GLSL) · No build step.

**File sizes (current):**

| File | Lines | Purpose |
|------|-------|---------|
| `index.html` | 436 | Semantic structure |
| `css/styles.css` | 1,953 | All styling |
| `js/main.js` | 2,387 | All animation + interaction |

`data/events.json` was deleted — the file was never read by `main.js`. `PartnershipSlider` uses a hardcoded array; Stardust/Horizon panels render static markup.

**External dependencies:**
```html
<!-- Adobe Fonts - Canela typeface (preconnected) -->
<link rel="stylesheet" href="https://use.typekit.net/afs8ors.css">

<!-- Lenis 1.3.4 (must load BEFORE GSAP — main.js wires them at top) -->
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js"></script>

<!-- GSAP 3.12.5 -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/MotionPathPlugin.min.js"></script>
```

**Total scroll height:** ~1750vh (intro 400 + text 150 + muse 460 + comet 680 + events ~60vh)

---

## Page Sections (Top → Bottom)

### 1. Landing / Intro (`0–400vh`)
**HTML:** `index.html:29–55` · **CSS:** `styles.css:185–349` · **JS:** `main.js:519` (`initWebGL`) → `main.js:863` (`masterRender`)

Fixed overlay with three animation phases:
- **Phase 1 (0–160vh, `INTRO_PHASE1_END: 0.40`):** White + black dots orbit center. Logo scales `80px → 250px`, 2 full rotations.
- **Phase 2 (160–200vh):** Transition text fades in below logo, then fades out.
- **Phase 3 (200–400vh, `INTRO_PHASE3_START: 0.50`):** 7 colored constellation dots explode from center. Z-depth rendering. Big bang pulse.

Key elements: `#bg-canvas` (WebGL starfield), `#dot-white`, `#dot-black`, `#intro-logo`, `#final-dot`, `#transition-text`, `#constellation-canvas`.

---

### 2. Mission Text (`400–550vh`)
**HTML:** `index.html:58–63` · **CSS:** `styles.css:369–410` · **JS:** `main.js:1067` (reveal trigger)

Sticky section, `TEXT_SECTION_HEIGHT: 150`. `#reveal-text` paragraph fades in. `<em>` tags render as hollow outlined text (white stroke, transparent fill).

---

### 3. Muse Intro Page (`550–950vh`)
**HTML:** `index.html:76–84` · **CSS:** `styles.css:1135–1247` · **JS:** `main.js:1100` (intro pinning) → `main.js:1140` (crossfade)

Fixed white overlay (`background: var(--color-offwhite)`). Black inverted Muse logo centered. Top + bottom text paragraphs.
Holds for `MUSE_INTRO_HOLD: 400`vh, then `MUSE_CROSSFADE: 60`vh transition to orbiting.
Logo centering uses GSAP `xPercent: -50, yPercent: -50` (CSS centering removed so scale tweens don't drift).

---

### 4. Muse Orbiting (`950–1010vh`, `MUSE_TOTAL: 460`)
**HTML:** `index.html:96–179` · **CSS:** `styles.css:1303–1363` · **JS:** `main.js:1694` (`MuseScroll`)

7 `muse-orbit-item` elements rotate on an adaptive ellipse (240s cycle). Ratio interpolates smoothly with `aspect-ratio` (no breakpoint pop):
- Wide (≥1.5 aspect): horizontal ellipse, 1.8× wider than tall.
- Square (~1.0): near-circular.
- Tall (≤0.65 aspect, mobile portrait): vertical ellipse, 1.8× taller than wide.

Each muse has depth scaling derived from `sin(angle)` — front muses scale `~1.05`, back muses `~0.65`, with matching `zIndex`.

Click any muse → **Muse Popup** opens (`main.js:1488` `MusePopup`): 3D tilt card, colored aura, 12 floating particles, GSAP entrance. Close: Escape / click outside / X.

WebGL: `#muse-background-canvas` (inverted starfield — black stars on off-white). Driven by `MuseBackground` factory instance (`main.js:1476`).

---

### 5. Comet Collab Intro (`1010–1450vh`, first `COMET_INTRO_PAUSE: 440`vh)
**HTML:** `index.html:185–214` · **CSS:** `styles.css:441–511` · **JS:** `main.js:1240` (logo descent) → `main.js:1968` (`FloatingProcesses`)

Sticky section. White Comet Collabs logo (`comet-collabs-logo-white.png`) descends from center to bottom over the intro pause. 5 **draggable** floating process images. Touch-enabled drag with `passive: true` document `touchmove`; scroll only blocked mid-drag via `touchAction: 'none'`.

---

### 6. Comet Methods Toggle (`~1450–1590vh`, `COMET_CROSSFADE_START: 580`)
**HTML:** `index.html:217–323` · **CSS:** `styles.css:514–~990` · **JS:** `main.js:2081` (`MethodToggle` — slim wrapper) + `main.js:2351` (`window.switchTab`)

Pill toggle (`.comet-pill`) switches between:
- **Stardust:** 4-step flow (artist selects cause → creates work → launches campaign → funds split)
- **Horizon:** 5-step Future Lab flow (Critique → Realisation), with `+Horizon` badge addon

Global function: `window.switchTab('stardust' | 'horizon')` (inline onclick) updates `MethodToggle.currentMethod`.

---

### 7. Comet Connected Images (`~1590–1690vh`, ends at `COMET_TOTAL: 680`)
**HTML:** `index.html:328–365` · **CSS:** `styles.css:938–1078` · **JS:** `main.js:1834` (`CometConnections`)

5 process images in flex layout (`.comet-image-item.clickable`). Black connection lines drawn between them via `#comet-connection-canvas` (2D, DPR-capped at 2 with `setTransform`). Click any image → **Step Popup** (`StepPopup`, `main.js:2136`) shows step title + description.

---

### 8. Events Page (`~1690vh+`)
**HTML:** `index.html:367–377` · **CSS:** `styles.css:1868–~1953` · **JS:** `main.js:2092` (`PartnershipSlider`)

Trimmed to **partnership carousel only**. Stardust campaign cards and Horizon labs HTML were removed during the events-page polish. The wrapper centers content (`min-height: 60vh; flex; align-items: center`).

**Partnership Carousel** (`PartnershipSlider`): scrolling logo strip. Hardcoded 5-entry array at `main.js:2097` referencing `partner1.png`…`partner5.png` (no hyphen). The actual filenames in `assets/images/partnerships/` use `partner-1.png` (with hyphen) — **mismatch latent until assets are renamed or array updated**.

---

### Footer (Static at end of flow)
**HTML:** `index.html:378–399` · **CSS:** `styles.css:1080–~1126`

Static footer at the page end (no longer fixed-positioned). 3 social icons (Telegram, Instagram, LinkedIn) — 52px touch targets. cocoex text logo.

---

## CSS Design System

### Colors (`:root` — `styles.css:50–106`)
```css
--color-black: #000
--color-white: #fff
--color-offwhite: #FAFAFA   /* muse + comet section background */
--lunes: #5783A6
--ares: #D54D2E
--rabu: #8CB07F
--thunor: #F8D86A
--shukra: #5E47A1
--dosei: #7F49A2
--solis: #D48348
```

### Typography
```css
--font-canela: 'canela', Georgia, serif
--font-h1-size: clamp(24px, 3vw, 48px)   /* weight 700 */
--font-h2-size: clamp(14px, 1.5vw, 22px)  /* weight 400 */
--font-body-size: clamp(20px, 2.5vw, 36px) /* weight 400 */
```
All text sizes use `clamp()` — never hardcode px values for typography.

### Responsive Logo Sizes
```css
--intro-logo-size: clamp(60px, 15vw, 250px)
--muse-logo-size: clamp(150px, 20vw, 300px)
--muse-orbit-image-size: clamp(80px, 12vw, 150px)
--comet-logo-size: clamp(180px, 25vw, 320px)
```

### Spacing
```css
--spacing-xs through --spacing-xl  /* all clamp()-based */
```

### Z-Index Layers
```css
--z-background: 1
--z-intro: 10
--z-text-section: 20
--z-white-section: 30
```

### Breakpoints (layout-only — prefer clamp() over media queries)
- `≤1024px` Tablet: Touch optimization
- `≤768px` Mobile: Layout adjustments, vertical ellipse orbit
- `≤480px` Small: Fine-tuning

---

## JavaScript Architecture

**Pattern:** IIFE (`(function() { 'use strict'; ... })()`) — no global scope pollution.

**Module structure:**
```
main.js module order:
  13   gsap.registerPlugin(ScrollTrigger)
  20   Lenis init + ScrollTrigger.scrollerProxy + scroller defaults to body
  56   (legacy normalizeScroll block — commented out, Lenis replaces it)
  65   GLSL_UTILS            — shared SIMPLEX_NOISE + STAR_FIELD shaders
 137   SCROLL_TIMING         — all scroll ranges (single source of truth)
 165   CONFIG + DATA         — layout params, dot colors, constellation coords
 ~270  DOM elements cache + state
 519   initWebGL()           — intro starfield + big bang pulse
 581   resize()              — debounced 150ms, DPR capped at 2×
 607   initFireworkDots()    — 7 constellation dots
 644   updateConstellationExplosion()
 713   updateFireworkDots()  — draw loop for constellation
 863   masterRender()        — single RAF loop for ALL WebGL canvases
 973   initEventListeners()
1028   initGSAPAnimations()  — all ScrollTrigger timelines
1362   createStarfield()     — factory: starfield shader (canonical or inverted)
1473   UnifiedStarfield      — factory instance, white-on-black
1476   MuseBackground        — factory instance, inverted (black-on-offwhite)
1482   CometBgPrimary        — factory instance, inverted (methods toggle bg)
1483   CometBgSecondary      — factory instance, inverted (connected images bg)
1488   MusePopup             — modal, 3D tilt, 12 particles
1694   MuseScroll            — orbit rotation, adaptive ellipse + depth scaling
1834   CometConnections      — 2D-canvas connection lines (black, DPR-capped)
1968   FloatingProcesses     — drag + touch (passive document touchmove)
2081   MethodToggle          — slim: currentMethod + getCurrentMethod only
2092   PartnershipSlider     — partnership logo strip (hardcoded 5-entry array)
2136   StepPopup             — step detail modal
2248   setInitialState()
2302   init()
2351   window.switchTab()    — global, called by inline onclick in HTML
```

### SCROLL_TIMING (centralized — `main.js:137–161`)
```javascript
INTRO_TOTAL: 400              // vh
INTRO_PHASE1_END: 0.40        // 40% = 160vh
INTRO_PHASE2_TEXT: 0.50       // 50% = 200vh
INTRO_PHASE3_START: 0.50      // 50% = 200vh
TEXT_SECTION_HEIGHT: 150
MUSE_INTRO_HOLD: 400          // vh
MUSE_CROSSFADE: 60            // vh
MUSE_TOTAL: 460               // = HOLD 400 + CROSSFADE 60
COMET_INTRO_PAUSE: 440        // vh - hold intro static (logo descent + read time)
COMET_CROSSFADE_START: 580    // = pause 440 + methods 100 + dwell 40
COMET_CROSSFADE_DURATION: 80
COMET_PHASES_START: 660       // = COMET_CROSSFADE_START + DURATION
COMET_TOTAL: 680              // = pause 440 + methods 100 + dwell 40 + crossfade 80 + tail 20
```
**Never hardcode vh values in animations** — always reference `SCROLL_TIMING`.
Wrapper `height` values in CSS must match these constants exactly:
- `.text-section-wrapper` = 150vh
- `.muse-section-wrapper` = 460vh
- `.comet-collab-wrapper` = 680vh

---

## Data Layer

`data/events.json` was deleted — it was never read by `main.js`. Current dynamic content sources:

- **Partnership carousel:** hardcoded array at `main.js:2097–2101` inside `PartnershipSlider`. Five entries pointing to `assets/images/partnerships/partnerN.png` (no hyphen) — note that the actual asset filenames use a hyphen (`partner-1.png`); reconcile when wiring real partner logos.
- **Stardust / Horizon panels:** static HTML in `index.html:217–323`. The toggle (`MethodToggle` + `window.switchTab`) only flips the active panel — no data-driven rendering.
- **Step popups:** static `STEP_DATA` constant in `main.js` (currently lorem ipsum copy — replace before launch).

When real data needs to drive these surfaces, prefer a thin `fetch('data/...json')` inside the relevant module rather than re-introducing a global JSON.

---

## WebGL System

All canvases render inside `masterRender()` (single RAF loop). Four of the five WebGL canvases share one shader via the `createStarfield()` factory (`main.js:1362`).

| Canvas | ID | Source | Purpose |
|---|---|---|---|
| Intro starfield | `#bg-canvas` | `initWebGL()` (`main.js:519`) | Twinkling stars + cosmic noise + big bang pulse |
| Constellation | `#constellation-canvas` | `updateConstellationExplosion()` (2D Canvas, not WebGL) | 7-dot explosion |
| Unified starfield | `#unified-starfield-canvas` | `UnifiedStarfield` (factory, white-on-black, `main.js:1473`) | Shared Muse + Comet background |
| Muse backdrop | `#muse-background-canvas` | `MuseBackground` (factory, **inverted**, `main.js:1476`) | Black stars on off-white |
| Comet backdrop 1 | `#comet-collab-background-canvas` | `CometBgPrimary` (factory, inverted, `main.js:1482`) | Methods toggle section |
| Comet backdrop 2 | `#comet-collab-background-canvas-2` | `CometBgSecondary` (factory, inverted, `main.js:1483`) | Connected images section |

**Rules:**
- DPR capped at `Math.min(devicePixelRatio, 2)` on mobile — the factory respects this; never remove the cap.
- UV aspect-ratio correction (`vec2 uvAspect = vec2(uv.x * aspect, uv.y)`) is required for any noise / circle math. Star tiling uses raw `uv` so stars distribute evenly.
- `lastActiveProgram` cache in `masterRender()` means we only `gl.useProgram()` on switches.
- Stay under 8 concurrent WebGL contexts (Safari cap). Currently 5 active. Adding more starfield surfaces should reuse the factory, not introduce new shaders.

---

## Accessibility

- Keyboard: Tab through muses, Enter opens popup, Escape closes
- `prefers-reduced-motion`: disables CSS animations, transitions, and popup particles. WebGL canvases continue rendering (visual ambience, not vestibular motion).
- Touch targets: 44px minimum (social icons 52px)
- ARIA labels on interactive + decorative elements
- Focus indicators: 2px outline + 2px offset
- WCAG AA color contrast on all text

---

## Asset Map

```
assets/images/
├── logowhite.png / logoblack.png
├── logowhite_name.png / logoblack_name.png
├── cocoex-text.png / cocoex-text-black.png
├── muse/
│   ├── muse_logo_black.png
│   └── lunes.png · ares.png · rabu.png · thunor.png · shukra.png · dosei.png · solis.png
├── comet-collabs/
│   ├── comet-collabs-logo.png · comet-collabs-logo-white.png
│   └── process-one.png … process-five.png
└── partnerships/
    └── partner-1.png … partner-5.png
```

---

## DOM Quick Reference

| Element | Selector | HTML:line | CSS:line | JS:line |
|---|---|---|---|---|
| Intro starfield | `#bg-canvas` | 30 | 185 | 519 |
| White orbit dot | `#dot-white` | 34 | — | 644 |
| Black orbit dot | `#dot-black` | 35 | — | 644 |
| Intro logo | `#intro-logo` | 39 | 220 | 644 |
| Merged dot | `#final-dot` | 43 | 278 | 644 |
| Transition text | `#transition-text` | 46 | 307 | 1067 |
| Constellation canvas | `#constellation-canvas` | 52 | 343 | 644 |
| Mission text | `#reveal-text` | 61 | 394 | 1067 |
| Unified starfield | `#unified-starfield-canvas` | 67 | 356 | 1473 |
| Muse intro page | `#muse-intro-page` | 76 | 1135 | 1100 |
| Muse backdrop | `#muse-background-canvas` | 89 | — | 1476 |
| Muse orbit items | `.muse-orbit-item` (×7) | 100–172 | 1303 | 1694 |
| Muse popup | `#muse-popup` | 401 | 1366 | 1488 |
| Comet intro | `#comet-collab-intro` | 185 | 441 | 1240 |
| Comet backdrop 1 | `#comet-collab-background-canvas` | 219 | 536 | 1482 |
| Comet pill toggle | `.comet-pill` | 223 | 627 | 2081 |
| Stardust panel | `#panel-stardust` | 233 | — | 2351 |
| Horizon panel | `#panel-horizon` | 275 | — | 2351 |
| Connected images | `#comet-collab-connected-content` | 328 | 938 | 1834 |
| Comet backdrop 2 | `#comet-collab-background-canvas-2` | 330 | 537 | 1483 |
| Connection canvas | `#comet-connection-canvas` | 333 | 967 | 1834 |
| Step popup | `.step-popup` | 356 | 980 | 2136 |
| Events page | `#events-page` | 367 | 1868 | — |
| Partnership slideshow | `#partnership-slideshow` | 371 | 1884 | 2092 |
| Footer | `.social-links` | 378 | 1080 | — |

---

## Common Bugs & Rules

**Canvas flickering:** never apply both manual rotation and CSS `transform` on the same canvas. Store unrotated positions; let CSS rotate.

**Scroll reads 0:** use `window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0`.

**iOS scroll (Lenis):** Lenis 1.3.4 virtualizes scroll position and is wired to GSAP at `main.js:20–53`. Body is the scroll container (`overflow-y: auto; height: 100%`), so Lenis is initialised with `wrapper: document.body, content: '.scroll-container'`. ScrollTrigger gets a `scrollerProxy` over body and `ScrollTrigger.defaults({ scroller: document.body })`. The legacy `ScrollTrigger.normalizeScroll` block is commented out — **do not re-enable it**; Lenis replaces its purpose and the two together deadlock on iOS Safari. Removing `html, body { height: 100% }` or `body { overflow-y: auto }` breaks layout — leave them.

**CSS not applying:** debug with `window.getComputedStyle(element).propertyName`. Use `!important` only to resolve specificity — document why.

**Animations too fast:** increase `SCROLL_TIMING` constants. Minimum 100vh per scroll-driven phase for 60fps smoothness.

**WebGL performance:** cache program state. Use `gl.useProgram()` only on switch. DPR cap at 2× is non-negotiable on mobile.

**Canvas touch blocking:** never rely on inherited `pointer-events: none` for canvas elements on iOS/Android — always set it explicitly on the canvas itself. All WebGL canvases in this codebase have explicit `pointer-events: none`.

**Drag + scroll conflict:** `FloatingProcesses` uses a passive `touchmove` listener on `document`. Scroll blocking during drag is handled via `element.style.touchAction = 'none'` set in `startDrag()` and cleared in `endDrag()`. Do not add `{ passive: false }` back to the document-level listener — it kills all mobile scroll.

**Never:** add frameworks, pollute global scope, duplicate `SCROLL_TIMING` values, use `scroll-behavior: smooth` on `html {}` (breaks GSAP), use `overflow-y: scroll` on both `html` and `body`.

---

## Dev Workflow

```bash
python3 -m http.server 8000
# visit http://localhost:8000
```

Pre-push checklist:
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] `prefers-reduced-motion` verified
- [ ] Keyboard navigation intact
- [ ] Lighthouse 95+ (all categories)
- [ ] Run `/doc-minder` to update documentation

---

## Related Docs

### Architecture Docs (`docs/`)

| File | Purpose |
|---|---|
| `docs/technical-spec.md` | Why: scroll budget rationale, single-RAF master loop, factory shader, Lenis integration, DPR cap |
| `docs/responsive-design.md` | Why: clamp-first strategy, adaptive orbit ellipse, mobile touch + scroll coexistence |
| `docs/libraries.md` | GSAP + Lenis, Typekit kit ID, project-specific WebGL patterns |

For *what* the code does, read `index.html`, `css/styles.css`, and `js/main.js` directly. Those files are the reference.

### Brand & Concept (`.claude/memo/`)

| File | Purpose |
|------|---------|
| `.claude/memo/The Seven Muses.md` | Muse canon (planet, day, cause, color) |
| `.claude/memo/Stardust.md` | Stardust programme concept |
| `.claude/memo/Horizon.md` | Horizon + Future Lab methodology |
| `.claude/memo/cocoex Brand Rules.md` | Tone, typography, visual identity |

### Dev Tools

| File | Purpose |
|------|---------|
| `tools/coordinate-picker.html` | Interactive dev tool for constellation dot positioning |
