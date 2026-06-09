# cocoex.xyz — AI Context & Technical Reference

> **UPDATED AT:** 2026-06-09 (post muse intro→orbit merge, comet connected-panel removal, starline, copy/pacing pass)
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
| `index.html` | 409 | Semantic structure |
| `css/styles.css` | 1,816 | All styling |
| `js/main.js` | 2,324 | All animation + interaction |

`data/events.json` was deleted — the file was never read by `main.js`. `PartnershipSlider` uses a hardcoded array; Stardust/Horizon panels render static markup.

**External dependencies:**
```html
<!-- Adobe Fonts - Canela typeface (preconnected) -->
<link rel="stylesheet" href="https://use.typekit.net/afs8ors.css">

<!-- Lenis 1.3.4 (must load BEFORE GSAP — main.js wires them at top) -->
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js"></script>

<!-- GSAP 3.12.5 (MotionPathPlugin removed — no longer used) -->
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
```

**Total scroll height:** ~1340vh (intro 480 incl. mission overlay + muse 400 + comet 400 + events ~60vh)

---

## Page Sections (Top → Bottom)

### 1. Landing / Intro + Mission (`0–480vh`)
**HTML:** `index.html:28–58` · **CSS:** `styles.css:164–426` · **JS:** `main.js:479` (`initWebGL`) → `main.js:823` (`masterRender`) · timeline at `main.js:1030`+

Fixed overlay with three animation phases. The mission statement is part of this section — it overlays the settled constellation dots rather than living in its own scroll section. `introScrollHeight` derives from `INTRO_TOTAL`; `.intro-spacer` CSS height (`styles.css:166` = 480vh) **must equal** `INTRO_TOTAL`.
- **Phase 1 (0–~192vh, `INTRO_PHASE1_END: 0.40`):** White + black dots orbit center. Logo scales up, 2 full rotations.
- **Phase 2 (~192–240vh):** Transition text fades in below logo, then fades out.
- **Phase 3 (240vh→, `INTRO_PHASE3_START: 0.50`):** 7 colored constellation dots explode from center. Z-depth rendering. Big bang pulse. The explosion is remapped to **settle** at `EXPLOSION_SETTLE = 0.68` (~326vh) and hold static (`main.js:1097`).
- **Smoke clears (`0.70 → 0.76`):** BOTH the 2D constellation dots (`#constellation-canvas`) AND the cosmic-noise WebGL backdrop (`#bg-canvas`) fade to opacity 0 (`smokeLayers`, `main.js:1129–1152`), so the mission lands on a clean black field.
- **Mission overlay (`0.76 → 1.0`):** `#mission-overlay` spans the full viewport (`inset: 0`) with two beats — `.reveal-text-top` above the dots, `.reveal-text-bottom` below — framing the constellation. Quick fade-in (`missionFadeStart 0.76 → missionFadeEnd 0.80`), holds fully bright (`0.80 → 0.92`), then mission + dots fade out together into the Muse intro (`introFadeStart 0.92 → 1.0`, animating `.intro-content` opacity). `<em>cocoex</em>` renders as hollow outlined text.

Key elements: `#bg-canvas` (WebGL starfield), `#dot-white`, `#dot-black`, `#intro-logo`, `#final-dot`, `#transition-text`, `#constellation-canvas`, `#mission-overlay` / `#reveal-text`.

---

### 2. Muse — Intro → Orbit (`480–880vh`, `MUSE_TOTAL: 400`)
**HTML:** `index.html:70–183` (single `.muse-section-wrapper` → `.section-panel.muse-panel` → `.muse-stage`) · **CSS:** `styles.css:913–1163` · **JS:** `main.js:1202–1256` (timeline) + `main.js:1809` (`MuseScroll`)

**ONE overlapping panel.** Intro and orbit share `.muse-stage` (sticky), so the center logo stays put while the background flips black→white. No separate intro/orbit sections.
- **Intro fade-in (480–580, `MUSE_FADEIN: 100`):** `.muse-shared-logo` + `.muse-intro-copy` fade up over the black starfield. Copy is a short couplet: "Seven causes. / One constellation." (top) + the framework line (bottom), both centered.
- **Hold (580–780, `MUSE_HOLD: 200`):** intro holds fully readable.
- **Switch (780–880, `MUSE_CROSSFADE: 100`, starts at `MUSE_INTRO_HOLD: 300`):** the white `.muse-section` bg fades in, the center logo **opacity-crossfades white→black** (two stacked `<img>`: `#muse-logo-white` out, `#muse-logo-black` in — NO `filter()` tween), and the intro copy fades out as the orbit takes over.
- **No orbit dwell** (`MUSE_CONTENT_HOLD: 0`): you scroll straight from the orbit into the comet intro. The orbit is visible THROUGH the 100vh switch, so its on-screen time already feels generous.

The switch is race-free: intro layers are transparent (black starfield shows through), only the white `.muse-section` is opaque, so fading white IN over the transparent intro has no opaque-over-opaque fight.

7 `.muse-orbit-item` elements rotate on an adaptive ellipse. Ratio interpolates smoothly with viewport aspect (no breakpoint pop): wide → horizontal 1.8×, square → near-circular, tall → vertical 1.8×. Each muse has depth scaling from `sin(angle)` (front ~1.05, back ~0.65) with matching `zIndex`.

Click any muse → **Muse Popup** (`main.js:1597` `MusePopup`): 3D tilt card, colored aura, 12 floating particles, GSAP entrance. Close: Escape / click outside / X.

WebGL: `#muse-background-canvas` (inverted starfield — black stars on off-white), `MuseBackground` factory instance (`main.js:1523`).

---

### 3. Comet Collab Intro (`880–1080vh`, `comet-panel-intro` = 200vh)
**HTML:** `index.html:189–222` · **CSS:** `styles.css:439–637` · **JS:** `main.js:1963` (`FloatingProcesses`) + `main.js:2079` (`ProcessLinks`)

Sticky panel. Constellation hides over `COMET_CONST_HIDE: 40`vh (overlaps the fade-in), comet intro fades in over `COMET_INTRO_FADEIN: 100`vh then holds `COMET_INTRO_HOLD: 100`vh. The White Comet Collabs logo descent is CSS-positioned (**no JS descent tween**). Intro copy ends "...through Stardust and Horizon." then "Guided by Muse, in a continuous loop of creation and impact." on its own line, centered.

5 **draggable** floating process images (`.floating-process`, positions set in `FloatingProcesses.setInitialPositions`). A faint white **starline** (`#process-link-canvas`, 2D, drawn by `ProcessLinks`) connects them in order 1→2→3→4→5, redrawing live from `getBoundingClientRect()` as they bob/drag. Touch drag with `passive: true` document `touchmove`; scroll blocked mid-drag only via `touchAction: 'none'`.

---

### 4. Comet Methods Toggle (`1080–1280vh`, `comet-panel-tabs` = 200vh)
**HTML:** `index.html:225–336` · **CSS:** `styles.css:640–865` · **JS:** `main.js:2141` (`MethodToggle` — slim wrapper) + `main.js:2288` (`window.switchTab`)

Second sticky panel (sequential, not overlapping the intro). Methods panel fades in over `COMET_METHODS_FADE: 100`vh, then holds `COMET_METHODS_DWELL: 100`vh through closure. Comet ends here — there is **no connected-images panel** (removed).

Pill toggle (`.comet-pill`) switches between:
- **Stardust:** artist flow (select cause → create work → launch campaign → funds split)
- **Horizon:** Future Lab flow, with `+Horizon` badge addon

Global function: `window.switchTab('stardust' | 'horizon')` (inline onclick) updates `MethodToggle.currentMethod`.

---

### 5. Events Page (`~1280vh+`)
**HTML:** `index.html:340–349` · **CSS:** `styles.css` § events/partnership · **JS:** `main.js:2152` (`PartnershipSlider`)

`.events-page-wrapper` → `.partnership-section` only. Stardust campaign cards and Horizon labs HTML were removed during the events-page polish.

**Partnership Carousel** (`PartnershipSlider`): scrolling logo strip. Hardcoded 5-entry array referencing `partner-1.png`…`partner-5.png`.

---

### Footer (Static at end of flow)
**HTML:** `index.html:351+` · **CSS:** `styles.css:866` (`.social-links`)

Static footer at the page end. 3 social icons (Telegram, Instagram, LinkedIn). cocoex text logo.

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
--z-text-section: 20   /* unused since mission merged into intro — kept for back-compat */
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
main.js module order (verify exact lines with grep — they shift):
  13   gsap.registerPlugin(ScrollTrigger)
  20   Lenis init + ScrollTrigger.scrollerProxy + scroller defaults to body (20–50)
  55   (normalizeScroll intentionally NOT enabled — Lenis replaces it; note only)
  61   GLSL_UTILS            — shared SIMPLEX_NOISE + STAR_FIELD shaders
 133   SCROLL_TIMING         — all scroll ranges (single source of truth, 133–169)
 174   CONFIG + DATA         — layout params, dot colors, constellation coords
 247   DOM elements cache + state
 281   currentSection state  — drives off-screen WebGL gating
 479   initWebGL()           — intro starfield + big bang pulse
 541   resize()              — debounced 150ms, DPR capped at 2×
 567   initFireworkDots()    — 7 constellation dots
 604   updateConstellationExplosion()
 673   updateFireworkDots()  — draw loop for constellation
 823   masterRender()        — single RAF loop, gated by currentSection
 926   initEventListeners()  — incl. top-level ScrollTrigger that sets currentSection + hides .intro past intro end
1030   initGSAPAnimations()  — all ScrollTrigger timelines (intro/mission, muse, comet)
1409   createStarfield()     — factory: starfield shader (canonical or inverted)
1520   UnifiedStarfield      — factory instance, white-on-black
1523   MuseBackground        — factory instance, inverted (black-on-offwhite)
1529   CometBgPrimary        — factory instance, inverted (comet bg)
1534   getFocusable / createFocusTrap — shared a11y helper used by the popup
1597   MusePopup             — modal, 3D tilt, 12 particles, focus-trap
1809   MuseScroll            — orbit rotation, adaptive ellipse + depth + pause-on-touch
1963   FloatingProcesses     — drag + touch (passive document touchmove)
2079   ProcessLinks          — 2D-canvas starline connecting the 5 floating processes (live getBoundingClientRect)
2141   MethodToggle          — slim: currentMethod + getCurrentMethod only
2152   PartnershipSlider     — partnership logo strip (hardcoded 5-entry array)
2190   setInitialState()
2244   init()
2288   window.switchTab()    — global, called by inline onclick in HTML
```
(Removed this cycle: `CometBgSecondary`, `CometConnections`, `StepPopup`, `STEP_DATA` — the comet connected-images panel is gone.)

### SCROLL_TIMING (centralized — `main.js:133–169`)
RHYTHM: 1 scroll = 100vh. Each phase is an explicit window with a REAL hold between every fade-in and the next transition, so content never just "flashes" past. Transitions use `power2.out`.
```javascript
INTRO_TOTAL: 480              // vh (drives introScrollHeight + .intro-spacer)
INTRO_PHASE1_END: 0.40        // 40% = ~192vh - orbit animation END
INTRO_PHASE2_TEXT: 0.50       // 50% = 240vh - transition text
INTRO_PHASE3_START: 0.50      // 50% = 240vh - constellation explosion starts
// (No TEXT_SECTION_HEIGHT — mission now overlays the settled dots inside the intro)
// MUSE — single overlapping panel: fade-in 0-100, HOLD 100-300, switch 300-400, no orbit dwell.
MUSE_FADEIN: 100              // vh - intro logo + copy fade in
MUSE_HOLD: 200               // vh - intro HOLDS fully readable
MUSE_INTRO_HOLD: 300          // vh - switch START = MUSE_FADEIN + MUSE_HOLD
MUSE_CROSSFADE: 100           // vh - black→white switch + logo crossfade
MUSE_CONTENT_HOLD: 0          // vh - no orbit dwell; scroll straight into comet
MUSE_TOTAL: 400               // = 100 fade + 200 hold + 100 switch
// COMET — two sequential 200vh sticky panels (intro, tabs). No connected panel.
COMET_CONST_HIDE: 40          // vh - constellation canvas hides (overlaps intro fade-in)
COMET_INTRO_FADEIN: 100       // vh - comet intro fades in
COMET_INTRO_HOLD: 100         // vh - comet intro HOLDS
COMET_INTRO_PAUSE: 200        // vh - intro panel total = fade-in + hold
COMET_METHODS_FADE: 100       // vh - methods panel fades in
COMET_METHODS_DWELL: 100      // vh - methods/tab HOLDS through closure
COMET_TOTAL: 400              // = intro panel 200 + tabs panel 200
```
The mission overlay and explosion-settle timings are local constants inside `initGSAPAnimations` (intro-relative fractions, not in `SCROLL_TIMING`). Sequence: explosion settles `EXPLOSION_SETTLE 0.68`, smoke (dots + cosmic-noise bg) clears `0.70 → 0.76`, mission quick fade-in `0.76 → 0.80`, holds bright `0.80 → 0.92`, then joint fade-out `introFadeStart 0.92 → 1.0` into the muse intro (`main.js:1097–1200`).

**Never hardcode vh values in animations** — always reference `SCROLL_TIMING`.
Wrapper `height` values in CSS must match these constants exactly:
- `.intro-spacer` = 480vh (= `INTRO_TOTAL`)
- `.muse-panel` = 400vh (= `MUSE_TOTAL`)
- `.comet-collab-wrapper` = auto (height comes from its two 200vh `.section-panel` children: `comet-panel-intro` + `comet-panel-tabs`)

### Off-screen WebGL gating (`main.js:926`+)
A top-level ScrollTrigger inside `initEventListeners` derives `currentSection` (`'intro' | 'muse' | 'comet' | 'events'`) from scroll position using `SCROLL_TIMING` thresholds with a 75vh **lead buffer** (next-section starfields wake up 75vh early to avoid pop-in). `masterRender()` skips `drawArrays` for any starfield whose owning section isn't current; `MuseScroll.updateOrbitPositions` is also skipped outside `'muse'`. Past the **unbuffered** intro end (480vh), the entire `.intro` overlay is set to `visibility: hidden` and the constellation 2D buffer is `clearRect`'d so the cosmic-noise + smoke don't bleed through the muse section. Scroll-back restores visibility.

---

## Data Layer

`data/events.json` was deleted — it was never read by `main.js`. Current dynamic content sources:

- **Partnership carousel:** hardcoded array inside `PartnershipSlider` (`main.js:2152`). Five entries referencing `assets/images/partnerships/partner-N.png`.
- **Stardust / Horizon panels:** static HTML in `index.html:243–334`. The toggle (`MethodToggle` + `window.switchTab`) only flips the active panel — no data-driven rendering.
When real data needs to drive these surfaces, prefer a thin `fetch('data/...json')` inside the relevant module rather than re-introducing a global JSON.

---

## WebGL System

All canvases render inside `masterRender()` (single RAF loop, gated by `currentSection`). There are **4 WebGL canvases** (3 share one shader via the `createStarfield()` factory, `main.js:1409`) plus **2 2D-canvas** surfaces.

| Canvas | ID | Source | Type | Active section(s) |
|---|---|---|---|---|
| Intro starfield | `#bg-canvas` | `initWebGL()` (`main.js:479`) | WebGL (own shader) | `intro` |
| Constellation | `#constellation-canvas` | `updateConstellationExplosion()` | 2D | `intro` (cleared on exit) |
| Unified starfield | `#unified-starfield-canvas` | `UnifiedStarfield` (factory, white-on-black, `main.js:1520`) | WebGL | `muse`, `comet` |
| Muse backdrop | `#muse-background-canvas` | `MuseBackground` (factory, **inverted**, `main.js:1523`) | WebGL | `muse` |
| Comet backdrop | `#comet-collab-background-canvas` | `CometBgPrimary` (factory, inverted, `main.js:1529`) | WebGL | `comet` |
| Process starline | `#process-link-canvas` | `ProcessLinks` (`main.js:2079`) | 2D | `comet` (intro panel) |

**Rules:**
- DPR capped at `Math.min(devicePixelRatio, 2)` on mobile — the factory respects this; never remove the cap.
- UV aspect-ratio correction (`vec2 uvAspect = vec2(uv.x * aspect, uv.y)`) is required for any noise / circle math. Star tiling uses raw `uv` so stars distribute evenly.
- `lastActiveProgram` cache in `masterRender()` means we only `gl.useProgram()` on switches.
- Stay under 8 concurrent WebGL contexts (Safari cap). Currently 4 WebGL active. Adding more starfield surfaces should reuse the factory, not introduce new shaders.

---

## Accessibility

- Keyboard: Tab through muses (each `.muse-orbit-item` has `tabindex="0"` + `role="button"`), Enter/Space opens popup, Escape closes.
- The Muse popup (`#muse-popup`) has `role="dialog" aria-modal="true"` + `aria-labelledby` and a focus-trap (shared `createFocusTrap` helper at `main.js:1546`). Focus is restored to the previously-focused element on close. (The step popup was removed with the comet connected-images panel.)
- `.muse-popup-close` is `clamp(44px, 10vw, 52px)` ≥ WCAG mobile minimum.
- Mobile orbit tap surface expanded via `.muse-orbit-item::before { inset: -16px }` halo (preserves the transform-based centring).
- Orbit auto-rotation pauses for 2s on `touchstart` inside the muse section so mobile users have a stable target.
- Muse orbit headings render in solid `var(--color-black)` for AA contrast on off-white (per-muse hex tones — esp. Thunor `#F8D86A` — failed AA).
- `prefers-reduced-motion`: disables CSS animations, transitions, and popup particles. WebGL canvases continue rendering (visual ambience, not vestibular motion).
- Touch targets: 44px minimum (social icons 52px).
- Focus indicators: 2px outline + 2px offset.

---

## Asset Map

```
assets/images/
├── logowhite.png / logoblack.png
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

`logoblack_name.png` and `logowhite_name.png` were deleted (zero references).

---

## DOM Quick Reference

Line numbers drift — grep to confirm. Snapshot at this doc's update:

| Element | Selector | HTML:line | CSS:line | JS:line |
|---|---|---|---|---|
| Scroll container | `.scroll-container` | 24 | — | — |
| Intro spacer | `.intro-spacer` | 26 | 165 | — |
| Intro starfield | `#bg-canvas` | 30 | 180 | 479 |
| White orbit dot | `#dot-white` | 34 | — | 567 |
| Black orbit dot | `#dot-black` | 35 | — | 567 |
| Intro logo | `#intro-logo` | 39 | 215 | 567 |
| Merged dot | `#final-dot` | 43 | — | 567 |
| Transition text | `#transition-text` | 46 | — | 1030 |
| Constellation canvas | `#constellation-canvas` | 52 | 338 | 604 |
| Mission overlay | `#mission-overlay` / `.reveal-text` (top 56 / bottom 57) | 55–57 | 364 | 1129 |
| Unified starfield | `#unified-starfield-canvas` | 64 | 351 | 1520 |
| Muse wrapper / panel | `.muse-section-wrapper` / `.muse-panel` | 70 / 74 | 913 / 935 | 1202 |
| Muse backdrop | `#muse-background-canvas` | 81 | 1071 | 1523 |
| Muse orbit items | `.muse-orbit-item` (×7) | 87–160 | 1101 | 1809 |
| Muse shared logo | `.muse-shared-logo` (`#muse-logo-white` / `#muse-logo-black`) | 168 | 954 | 1208 |
| Muse intro copy | `.muse-intro-copy` | 174 | — | 1211 |
| Muse popup | `#muse-popup` | 374 | 1165 | 1597 |
| Comet wrapper | `.comet-collab-wrapper` | 186 | 428 | — |
| Comet intro panel | `.comet-panel-intro` / `#comet-collab-intro` | 189 / 191 | 439 | 1963 |
| Floating processes | `.floating-processes` (×5 `.floating-process`) | 203 | 572 | 1963 |
| Process starline | `#process-link-canvas` | 204 | 562 | 2079 |
| Comet backdrop | `#comet-collab-background-canvas` | 229 | 539 | 1529 |
| Comet tabs panel | `.comet-panel-tabs` / `.comet-pill` | 225 / 233 | 640 | 2141 |
| Stardust panel | `#panel-stardust` | 243 | — | 2288 |
| Horizon panel | `#panel-horizon` | 285 | — | 2288 |
| Events page | `#events-page` (`.events-page-wrapper`) | 340 | — | — |
| Partnership slideshow | `#partnership-slideshow` | 344 | — | 2152 |
| Footer | `.social-links` | 351 | 866 | — |

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
