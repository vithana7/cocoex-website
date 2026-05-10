# cocoex.xyz — AI Context & Technical Reference

> **UPDATED AT:** 2026-05-10
> Run `/doc-minder` after any meaningful change to keep this file current.

---

## What This File Is

Ground-truth context for any Claude session working on this codebase. Read this before touching any file. When in doubt about a line number, verify with the actual file — this document can lag behind the code.

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
| `index.html` | 468 | Semantic structure |
| `css/styles.css` | 2,478 | All styling |
| `js/main.js` | 2,855 | All animation + interaction |
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
**HTML:** `index.html:27–53` · **CSS:** `styles.css:156–348` · **JS:** `main.js:399–648`

Fixed overlay with three animation phases:
- **Phase 1 (0–160vh):** White + black dots orbit center. Logo scales `80px → 250px`, 2 full rotations.
- **Phase 2 (160–200vh):** Transition text fades in below logo, then fades out.
- **Phase 3 (200–400vh):** 7 colored constellation dots explode from center. Z-depth rendering. Big bang pulse.

Key elements: `#bg-canvas` (WebGL starfield), `#dot-white`, `#dot-black`, `#intro-logo`, `#final-dot`, `#transition-text`, `#constellation-canvas`.

---

### 2. Mission Text (`400–550vh`)
**HTML:** `index.html:55–62` · **CSS:** `styles.css:362–406` · **JS:** `main.js:914–967`

Sticky section. `#reveal-text` paragraph fades in. `<em>` tags render as hollow outlined text (white stroke, transparent fill).

---

### 3. Muse Intro Page (`550–900vh`)
**HTML:** `index.html:74–80` · **CSS:** `styles.css:1326–1435` · **JS:** `main.js:979–1000`

Fixed black overlay. Black inverted Muse logo centered. Top + bottom text paragraphs. `.highlight-muse` class produces hollow letter effect.
Holds for 350vh, then crossfades to orbiting layout.

---

### 4. Muse Orbiting (`900–1020vh`)
**HTML:** `index.html:82–176` · **CSS:** `styles.css:1437–1583` · **JS:** `main.js:2034–2160`

7 `muse-orbit-item` elements rotate on an adaptive ellipse (240s cycle):
- **Desktop (>1024px):** Horizontal ellipse (1.8× wider than tall)
- **Tablet (768–1024px):** Slightly vertical (1.4×)
- **Mobile (≤768px):** Vertical ellipse (1.6× taller than wide)

Click any muse → **Muse Popup** opens (`main.js:1828–2030`): 3D tilt card, colored aura, 12 floating particles, GSAP entrance. Close: Escape / click outside / X.

WebGL: `#muse-background-canvas` (7-color simplex gradient, `main.js:1323–1467`).

---

### 5. Comet Collab Intro (`1020–1380vh`)
**HTML:** `index.html:183–212` · **CSS:** `styles.css:424–602` · **JS:** `main.js:1080–1253`

Sticky section. White Comet Collabs logo descends from center to bottom over 180vh. 5 **draggable** floating process images (`FloatingProcesses` module, `main.js:2298–2405`). Touch-enabled drag.

Shine animation on `<em>` words (Stardust / Horizon): direction-aware, 1.6s glow. Scroll down → Stardust shines first. Scroll back → Horizon shines first.

---

### 6. Comet Methods Toggle (`~1380–1500vh`)
**HTML:** `index.html:215–322` · **CSS:** `styles.css:624–858` · **JS:** `main.js:2410–2556`

Pill toggle (`.comet-pill`) switches between:
- **Stardust:** 4-step flow (artist selects cause → creates work → launches campaign → funds split)
- **Horizon:** 5-step Future Lab flow (Critique → Realisation), with `+Horizon` badge addon

Global function: `window.switchTab('stardust' | 'horizon')` (inline onclick).

---

### 7. Comet Connected Images (`~1500–1620vh`)
**HTML:** `index.html:326–350` · **CSS:** `styles.css:1051–1092` · **JS:** `main.js:2164–2293`

5 process images in flex layout. White connection lines drawn between them via `#comet-connection-canvas` (`CometConnections` module). Click any image → **Step Popup** (`StepPopup` module, `main.js:2604–2712`) shows step title + description.

---

### 8. Events Page (`~1620vh+`)
**HTML:** `index.html:365–406` · **CSS:** `styles.css:2103–2478` · **JS:** `main.js:2560–2712`

Three subsections, all populated dynamically from `data/events.json`:

**Partnership Carousel** (`PartnershipSlider`, `main.js:2560–2600`): Scrolling logo strip (30s CSS animation). 5 partner logos.

**Stardust Campaigns** (`#stardust-campaigns`): Campaign cards with number badge, status (`active` / `open` / `archive`), name, subtitle, NGO description, muse tags (color-coded), CTA link.

**Horizon Future Labs** (`#horizon-labs`): 3-column grid (Event → Outcome → Conclusion) per lab entry.

---

### Footer (Fixed, revealed at events section)
**HTML:** `index.html:410–429` · **CSS:** `styles.css:1259–1325`

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
  13   GSAP setup + ScrollTrigger.normalizeScroll(true)
  22   GLSL_UTILS          — shared SIMPLEX_NOISE + STAR_FIELD shaders
  94   SCROLL_TIMING        — all scroll ranges (single source of truth)
 127   CONFIG + DATA        — layout params, dot colors, constellation coords
 248   DOM elements cache   — all major element references
 283   State variables
 399   WebGL intro shader   — intro starfield + pulse
 543   resize()             — debounced 150ms, DPR capped at 2x
 569   initFireworkDots()   — 7 constellation dots
 606   Constellation explosion
 675   Firework animation loop
 825   masterRender()       — single RAF loop for ALL WebGL canvases
 917   initEventListeners()
 971   initGSAPAnimations() — all ScrollTrigger timelines
1258   updateOrbitPositions() — ellipse math
1323   MuseBackground       — WebGL 7-color gradient
1471   UnifiedStarfield     — shared Muse + Comet background
1566   CometCollabBackground — same shader as MuseBackground
1828   MusePopup            — modal, 3D tilt, particles
2034   MuseScroll           — orbit rotation, adaptive ellipse
2164   CometConnections     — canvas connection lines
2298   FloatingProcesses    — drag + touch on process images
2410   MethodToggle         — Stardust/Horizon pill switch
2560   PartnershipSlider    — load + render from events.json
2604   StepPopup            — step detail modal
2716   setInitialState()
2770   init()
2820   window.switchTab()   — global, called by inline onclick
```

### SCROLL_TIMING (centralized — `main.js:94–122`)
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

All campaigns, events, and partners live here. JS modules populate the DOM dynamically at load.

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

4 active canvases, all managed in `masterRender()` (single RAF loop):

| Canvas | ID | JS Module | Purpose |
|--------|-----|-----------|---------|
| Intro starfield | `#bg-canvas` | `initWebGL()` | Twinkling stars + big bang pulse |
| Constellation | `#constellation-canvas` | `updateConstellationExplosion()` | 7-dot explosion |
| Unified starfield | `#unified-starfield-canvas` | `UnifiedStarfield` | Shared Muse + Comet background |
| Muse gradient | `#muse-background-canvas` | `MuseBackground` | 7-color simplex blend |
| Comet gradient 1 | `#comet-collab-background-canvas` | `CometCollabBackground` | Same shader as Muse |
| Comet gradient 2 | `#comet-collab-background-canvas-2` | `CometCollabBackground` | Continuation canvas |

**Rules:**
- DPR capped at `Math.min(devicePixelRatio, 2)` — never remove this cap
- UV space uses aspect-ratio correction: `vec2 uvAspect = vec2(uv.x * aspect, uv.y)` — keeps noise/circles proportional on portrait viewports
- Constellation uses uniform scale (`Math.min(w/refW, h/refH)`) — preserves shape on all aspect ratios

---

## Accessibility

- Keyboard: Tab through muses, Enter opens popup, Escape closes
- `prefers-reduced-motion`: disables all animations + particles
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
|---------|----------|-----------|----------|---------|
| Intro starfield | `#bg-canvas` | 28 | 156 | 399 |
| White orbit dot | `#dot-white` | 32 | 224 | 1258 |
| Black orbit dot | `#dot-black` | 33 | 224 | 1258 |
| Intro logo | `#intro-logo` | 37 | 200 | 569 |
| Merged dot | `#final-dot` | 41 | 271 | 606 |
| Transition text | `#transition-text` | 44 | 300 | 971 |
| Constellation canvas | `#constellation-canvas` | 50 | 336 | 606 |
| Mission text | `#reveal-text` | 59 | 362 | 914 |
| Unified starfield | `#unified-starfield-canvas` | 65 | 349 | 1471 |
| Muse intro page | `#muse-intro-page` | 74 | 1326 | 979 |
| Muse gradient | `#muse-background-canvas` | 87 | — | 1323 |
| Muse orbit items | `.muse-orbit-item` (×7) | 98–172 | 1454 | 2034 |
| Muse popup | `#muse-popup` | 433 | 1584 | 1828 |
| Comet intro | `#comet-collab-intro` | 183 | 424 | 1080 |
| Comet gradient | `#comet-collab-background-canvas` | 217 | — | 1566 |
| Comet pill toggle | `.comet-pill` | 221 | 624 | 2410 |
| Stardust panel | `.comet-panel[data-panel="stardust"]` | 231 | 697 | 2410 |
| Horizon panel | `.comet-panel[data-panel="horizon"]` | 273 | 697 | 2410 |
| Connected images | `#comet-collab-connected-content` | 326 | 1051 | 2164 |
| Connection canvas | `#comet-connection-canvas` | 331 | 1083 | 2164 |
| Step popup | `.step-popup` | 354 | 1159 | 2604 |
| Events page | `#events-page` | 365 | 2103 | 2560 |
| Partnership slideshow | `#partnership-slideshow` | 372 | 2127 | 2560 |
| Stardust campaigns | `#stardust-campaigns` | 383 | 2192 | 2560 |
| Horizon labs | `#horizon-labs` | 400 | 2337 | 2560 |
| Footer | `.social-links` | 410 | 1259 | — |

---

## Common Bugs & Rules

**Canvas flickering:** never apply both manual rotation and CSS `transform` on the same canvas. Store unrotated positions; let CSS rotate.

**Scroll reads 0:** use `window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0`.

**iOS scroll desync:** `ScrollTrigger.normalizeScroll(true)` is set at startup (`main.js:15`). Do not remove.

**CSS not applying:** debug with `window.getComputedStyle(element).propertyName`. Use `!important` only to resolve specificity — document why.

**Animations too fast:** increase `SCROLL_TIMING` constants. Minimum 100vh per scroll-driven phase for 60fps smoothness.

**WebGL performance:** cache program state. Use `gl.useProgram()` only on switch. DPR cap at 2× is non-negotiable on mobile.

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

| File | Purpose |
|------|---------|
| `docs/TECHNICAL-SPEC.md` | Deep-dive implementation specs |
| `docs/responsive-design.md` | Fluid typography + orbit ellipse guide |
| `.claude/memo/The Seven Muses.md` | Muse canon (planet, day, cause) |
| `.claude/memo/Stardust.md` | Stardust programme concept |
| `.claude/memo/Horizon.md` | Horizon + Future Lab methodology |
| `.claude/memo/cocoex Brand Rules.md` | Tone, typography, visual identity |
| `tools/coordinate-picker.html` | Dev tool for constellation positioning |
