# cocoex.xyz — AI Context & Technical Reference

> **UPDATED AT:** 2026-05-14
> Run `/doc-minder` after any meaningful change to keep this file current.

---

## What This File Is

Ground-truth context for any Claude session working on this codebase. Read this before touching any file. When in doubt about a line number, verify with the actual file — this document can lag behind the code.

**Source code is the reference.** `index.html`, `css/styles.css`, and `js/main.js` are authoritative — grep them directly. The `docs/` folder explains *why*, not *what*.

**On session start — read these docs before writing any code:**

| Priority | File | Read when |
|---|---|---|
| Always | `docs/TECHNICAL-SPEC.md` | Architecture decisions, scroll timing, WebGL rationale |
| Layout work | `docs/responsive-design.md` | Fluid typography strategy, orbit ellipse, breakpoint philosophy |
| Dependencies | `docs/libraries.md` | GSAP version + iOS guard, Typekit, project-specific patterns |

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

**Stack:** Vanilla HTML5 / CSS3 / JavaScript ES6+ · GSAP 3.12.5 (CDN) · WebGL (custom GLSL) · No build step.

**File sizes (current):**

| File | Lines | Purpose |
|------|-------|---------|
| `index.html` | 467 | Semantic structure |
| `css/styles.css` | 2,424 | All styling |
| `js/main.js` | 2,481 | All animation + interaction |
| `data/events.json` | 107 | Dynamic content (campaigns, partners) |

**External dependencies:**
```html
<!-- Adobe Fonts - Canela typeface -->
<link rel="stylesheet" href="https://use.typekit.net/afs8ors.css">

<!-- GSAP 3.12.5 -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/MotionPathPlugin.min.js"></script>
```

**Total scroll height:** ~1900vh

---

## Page Sections (Top → Bottom)

### 1. Landing / Intro (`0–400vh`)
**HTML:** `index.html:27–53` · **CSS:** `styles.css:165–350` · **JS:** `main.js:401–820`

Fixed overlay with three animation phases:
- **Phase 1 (0–160vh):** White + black dots orbit center. Logo scales `80px → 250px`, 2 full rotations.
- **Phase 2 (160–200vh):** Transition text fades in below logo, then fades out.
- **Phase 3 (200–400vh):** 7 colored constellation dots explode from center. Z-depth rendering. Big bang pulse.

Key elements: `#bg-canvas` (WebGL starfield), `#dot-white`, `#dot-black`, `#intro-logo`, `#final-dot`, `#transition-text`, `#constellation-canvas`.

---

### 2. Mission Text (`400–550vh`)
**HTML:** `index.html:55–62` · **CSS:** `styles.css:365–408` · **JS:** `main.js:1076–1090`

Sticky section. `#reveal-text` paragraph fades in. `<em>` tags render as hollow outlined text (white stroke, transparent fill).

---

### 3. Muse Intro Page (`550–900vh`)
**HTML:** `index.html:74–80` · **CSS:** `styles.css:1294–1420` · **JS:** `main.js:1093–1158`

Fixed white overlay. Black inverted Muse logo centered. Top + bottom text paragraphs.
Holds for 350vh, then crossfades to orbiting layout.

---

### 4. Muse Orbiting (`900–1020vh`)
**HTML:** `index.html:82–176` · **CSS:** `styles.css:1422–1539` · **JS:** `main.js:1659–1784` (`MuseScroll`)

7 `muse-orbit-item` elements rotate on an adaptive ellipse (240s cycle):
- **Desktop (>1024px):** Horizontal ellipse (1.8× wider than tall)
- **Tablet (768–1024px):** Slightly vertical (1.4×)
- **Mobile (≤768px):** Vertical ellipse (1.8× taller than wide)

Click any muse → **Muse Popup** opens (`main.js:1453–1654`): 3D tilt card, colored aura, 12 floating particles, GSAP entrance. Close: Escape / click outside / X.

WebGL: `#muse-background-canvas` (inverted starfield — black stars on off-white). Driven by `MuseBackground` factory instance (`main.js:1436`).

---

### 5. Comet Collab Intro (`1020–1380vh`)
**HTML:** `index.html:183–212` · **CSS:** `styles.css:437–511` · **JS:** `main.js:1161–1249`

Sticky section. White Comet Collabs logo descends from center to bottom over 180vh. 5 **draggable** floating process images (`FloatingProcesses` module, `main.js:1923–2031`). Touch-enabled drag.

---

### 6. Comet Methods Toggle (`~1380–1500vh`)
**HTML:** `index.html:215–322` · **CSS:** `styles.css:513–991` · **JS:** `main.js:2036–2181` (`MethodToggle`) + `main.js:2447` (`window.switchTab`)

Pill toggle (`.comet-pill`) switches between:
- **Stardust:** 4-step flow (artist selects cause → creates work → launches campaign → funds split)
- **Horizon:** 5-step Future Lab flow (Critique → Realisation), with `+Horizon` badge addon

Global function: `window.switchTab('stardust' | 'horizon')` (inline onclick).

---

### 7. Comet Connected Images (`~1500–1620vh`)
**HTML:** `index.html:326–350` · **CSS:** `styles.css:1039–1078` · **JS:** `main.js:1789–1918` (`CometConnections`)

5 process images in flex layout. Black connection lines drawn between them via `#comet-connection-canvas`. Click any image → **Step Popup** (`StepPopup`, `main.js:2230–2337`) shows step title + description.

---

### 8. Events Page (`~1620vh+`)
**HTML:** `index.html:365–406` · **CSS:** `styles.css:2050–2424` · **JS:** `main.js:2186–2225` (`PartnershipSlider`)

Currently only the partnership carousel is JS-rendered. Stardust campaigns and Horizon labs sections exist in the HTML but are not yet populated from `data/events.json` — see "Known divergences" below.

**Partnership Carousel** (`PartnershipSlider`): Scrolling logo strip. The module currently uses a hardcoded 5-entry array (`partner1.png`…`partner5.png`, no hyphen). `data/events.json` `partnerships[]` exists but is **not read** by the current code — paths there use `partner-1.png` (with hyphen) so they would mismatch the assets the code requests.

**Stardust Campaigns** (`#stardust-campaigns`): Campaign cards with number badge, status (`active` / `open` / `archive`), name, subtitle, NGO description, muse tags (color-coded), CTA link.

**Horizon Future Labs** (`#horizon-labs`): 3-column grid (Event → Outcome → Conclusion) per lab entry.

---

### Footer (Fixed, revealed at events section)
**HTML:** `index.html:410–429` · **CSS:** `styles.css:1247–1292`

Fixed bottom. 3 social icons (Telegram, Instagram, LinkedIn) — 52px touch targets. cocoex text logo.

---

## CSS Design System

### Colors (`:root` — `styles.css:38–96`)
```css
--color-black: #000
--color-white: #fff
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
  13   GSAP setup + ScrollTrigger.normalizeScroll (iOS-guarded)
  24   GLSL_UTILS            — shared SIMPLEX_NOISE + STAR_FIELD shaders
  96   SCROLL_TIMING         — all scroll ranges (single source of truth)
 129   CONFIG + DATA         — layout params, dot colors, constellation coords
 250   DOM elements cache
 271   State variables
 401   WebGL intro shader    — intro starfield + big bang pulse
 545   resize()              — debounced 150ms, DPR capped at 2x
 571   initFireworkDots()    — 7 constellation dots
 608   updateConstellationExplosion()
 677   updateFireworkDots()  — draw loop for constellation
 827   masterRender()        — single RAF loop for ALL WebGL canvases
 937   initEventListeners()
 991   initGSAPAnimations()  — all ScrollTrigger timelines
1255   updateOrbitPositions()
1322   createStarfield()     — factory: starfield shader (canonical or inverted)
1433   UnifiedStarfield      — factory instance, white-on-black (Muse + Comet)
1436   MuseBackground        — factory instance, inverted (black-on-offwhite)
1443   CometCollabBackground — wraps two inverted instances (canvas1, canvas2)
1453   MusePopup             — modal, 3D tilt, 12 particles
1659   MuseScroll            — orbit rotation, adaptive ellipse
1789   CometConnections      — 2D-canvas connection lines
1923   FloatingProcesses     — drag + touch (passive document touchmove)
2036   MethodToggle          — Stardust/Horizon pill switch
2186   PartnershipSlider     — partnership logo strip (currently hardcoded array)
2230   StepPopup             — step detail modal
2342   setInitialState()
2396   init()
2447   window.switchTab()    — global, called by inline onclick in HTML
```

### SCROLL_TIMING (centralized — `main.js:96–124`)
```javascript
INTRO_TOTAL: 400           // vh
INTRO_PHASE1_END: 0.40     // 40% = 160vh
INTRO_PHASE3_START: 0.50   // 50% = 200vh
TEXT_SECTION_HEIGHT: 150
MUSE_INTRO_HOLD: 350
MUSE_CROSSFADE: 120
MUSE_TOTAL: 470
COMET_INTRO_PAUSE: 100
COMET_LOGO_MOVEMENT: 180
COMET_CROSSFADE_START: 360
COMET_CROSSFADE_DURATION: 120
COMET_TOTAL: 600
```
**Never hardcode vh values in animations** — always reference `SCROLL_TIMING`.

---

## Data Layer (`data/events.json`)

Schema documented below. **Heads-up:** the JSON file is currently *not read* by `main.js` — `PartnershipSlider` uses a hardcoded array, and the Stardust/Horizon sections render their static HTML markup unchanged. Wiring this up is a follow-up. The schema is preserved as intent.

```json
{
  "stardust": [{
    "number": "003",
    "status": "active | open | archive",
    "name": "...",
    "subtitle": "...",
    "ngo": "...",
    "muses": [{ "symbol": "♀", "name": "Shukra", "cause": "Bio-diversity", "color": "--shukra" }],
    "link": "...",
    "linkText": "View →"
  }],
  "horizon": [{
    "eventTitle": "...", "eventLabel": "...", "eventDescription": "...",
    "outcomeTitle": "...", "outcomeLabel": "...", "outcomeDescription": "...",
    "conclusionTitle": "...", "conclusionLabel": "...", "conclusionDescription": "..."
  }],
  "partnerships": [{ "name": "...", "logo": "assets/images/partnerships/partner-1.png", "url": "..." }]
}
```

**To add a Stardust campaign:** append to `stardust[]`. Status badge and muse tags render automatically.
**To add a partner:** append to `partnerships[]` with logo path and URL.
**To add a Horizon lab:** append to `horizon[]` — 3 columns (event, outcome, conclusion) render automatically.

---

## WebGL System

All canvases render inside `masterRender()` (single RAF loop). Four of the five WebGL canvases share one shader via the `createStarfield()` factory (`main.js:1322`).

| Canvas | ID | Source | Purpose |
|---|---|---|---|
| Intro starfield | `#bg-canvas` | `initWebGL()` | Twinkling stars + cosmic noise + big bang pulse |
| Constellation | `#constellation-canvas` | `updateConstellationExplosion()` (2D Canvas, not WebGL) | 7-dot explosion |
| Unified starfield | `#unified-starfield-canvas` | `UnifiedStarfield` (factory, white-on-black) | Shared Muse + Comet background |
| Muse backdrop | `#muse-background-canvas` | `MuseBackground` (factory, **inverted**) | Black stars on off-white |
| Comet backdrop 1 | `#comet-collab-background-canvas` | `CometCollabBackground.canvas1` (factory, inverted) | Methods toggle section |
| Comet backdrop 2 | `#comet-collab-background-canvas-2` | `CometCollabBackground.canvas2` (factory, inverted) | Connected images section |

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
| Intro starfield | `#bg-canvas` | 28 | 165 | 401 |
| White orbit dot | `#dot-white` | 32 | 227 | 1255 |
| Black orbit dot | `#dot-black` | 33 | 244 | 1255 |
| Intro logo | `#intro-logo` | 37 | 218 | 1255 |
| Merged dot | `#final-dot` | 41 | 274 | 608 |
| Transition text | `#transition-text` | 44 | 303 | 1029 |
| Constellation canvas | `#constellation-canvas` | 50 | 339 | 608 |
| Mission text | `#reveal-text` | 59 | 365 | 1076 |
| Unified starfield | `#unified-starfield-canvas` | 65 | 352 | 1433 |
| Muse intro page | `#muse-intro-page` | 74 | 1294 | 1093 |
| Muse backdrop | `#muse-background-canvas` | 87 | — | 1436 |
| Muse orbit items | `.muse-orbit-item` (×7) | 98–172 | 1422 | 1659 |
| Muse popup | `#muse-popup` | 433 | 1541 | 1453 |
| Comet intro | `#comet-collab-intro` | 183 | 437 | 1162 |
| Comet backdrop | `#comet-collab-background-canvas` | 217 | 535 | 1444 |
| Comet pill toggle | `.comet-pill` | 221 | 626 | 2036 |
| Stardust panel | `#panel-stardust` | 231 | 513 | 2447 |
| Horizon panel | `#panel-horizon` | 273 | 513 | 2447 |
| Connected images | `#comet-collab-connected-content` | 326 | 1039 | 1789 |
| Connection canvas | `#comet-connection-canvas` | 331 | 1083 | 1789 |
| Step popup | `.step-popup` | 354 | 1147 | 2230 |
| Events page | `#events-page` | 365 | 2050 | — |
| Partnership slideshow | `#partnership-slideshow` | 372 | 2074 | 2186 |
| Stardust campaigns | `#stardust-campaigns` | 383 | 2139 | — |
| Horizon labs | `#horizon-labs` | 400 | 2284 | — |
| Footer | `.social-links` | 410 | 1247 | — |

---

## Common Bugs & Rules

**Canvas flickering:** never apply both manual rotation and CSS `transform` on the same canvas. Store unrotated positions; let CSS rotate.

**Scroll reads 0:** use `window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0`.

**iOS scroll desync:** `ScrollTrigger.normalizeScroll` is iOS-guarded at startup (`main.js:13–19`). It runs on Android only — iOS handles GSAP scroll natively. Do not enable `normalizeScroll(true)` unconditionally; it deadlocks with non-passive touch listeners on iOS.

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
| `docs/TECHNICAL-SPEC.md` | Why: scroll budget rationale, single-RAF master loop, factory shader, iOS guard, DPR cap |
| `docs/responsive-design.md` | Why: clamp-first strategy, adaptive orbit ellipse, mobile touch + scroll coexistence |
| `docs/libraries.md` | GSAP version + iOS-guarded normalize, Typekit kit ID, project-specific WebGL patterns |

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
