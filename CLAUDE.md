# cocoex.xyz — AI Context & Technical Reference

> **UPDATED AT:** 2026-06-10 (landing idle logo + scroll hint; muse intro pure fade, hold 250vh; portrait-transposed constellation; process drag removed)
> Run `/doc-minder` after any meaningful change to keep this file current.

---

## What This File Is

Ground-truth context for any Claude session working on this codebase. Read this before touching any file. When in doubt about a line number, verify with the actual file — this document can lag behind the code.

**Source code is the reference.** `index.html`, the ES modules under `src/`, and the stylesheets under `src/styles/*.css` are authoritative — grep them directly. The `docs/` folder explains *why*, not *what*.

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

**Stack:** Vanilla HTML5 / CSS3 / JavaScript ES modules · Vite build (`^5.4.0`) · GSAP 3.12.5 + Lenis 1.3.4 (npm deps, imported as modules — **not CDN**) · WebGL (custom GLSL).

**Build & deps:**
- `package.json` (`type: module`) — deps `gsap 3.12.5`, `lenis 1.3.4`; devDep `vite ^5.4.0`.
- `vite.config.js` — `base: './'`, build `target: es2018`, `outDir: dist`, `assetsInlineLimit: 0`; dev server port `5173`.
- `index.html` loads exactly one module entry — `<script type="module" src="/src/main.js">`. **No CDN `<script>` tags, no inline `onclick`.**
- GSAP / ScrollTrigger / Lenis are `import`ed in the modules that need them (`import { gsap } from 'gsap'`, `import { ScrollTrigger } from 'gsap/ScrollTrigger'`, `import Lenis from 'lenis'`).
- `npm install` → `npm run dev` (Vite dev server, port 5173) → `npm run build` (emits `dist/`) → `npm run preview`.

**Module map (`src/`):**

| Path | Responsibility |
|------|----------------|
| `src/main.js` | `boot()`: import CSS, `applyHeightsToCss()`, `initSmoothScroll()`, create 4 WebGL surfaces + register them as gated `Renderer` layers, init the four sections, `initSectionGate()`, `Renderer.start()`, debounced resize. |
| `src/data.js` | `CONFIG`, `isMobile`, `DOT_COLORS`, `CONSTELLATION_REF`, `CONNECTIONS`, `MUSES`, `PARTNERS`, easing fns. |
| `src/scroll/timeline.js` | **Single source of truth** for scroll pacing — `PHASES`, builder, `phase()`, `sectionSpan()`, `vhToPx()`, `applyHeightsToCss()`, `COMET_CONST_HIDE_VH`. |
| `src/scroll/smooth-scroll.js` | Lenis init, body-as-scroller, rides `gsap.ticker`, `scrollerProxy`; `normalizeScroll` deliberately OFF. |
| `src/scroll/section-gate.js` | Derives active section (`intro`/`muse`/`comet`/`events`) from scroll with a 75vh **lead buffer**; drives `Renderer.setSection`. |
| `src/webgl/renderer.js` | `Renderer` singleton — one `requestAnimationFrame` loop, renders only layers whose section is active; `visibilitychange` gating. |
| `src/webgl/gl-context.js` | `DPR` cap (`min(devicePixelRatio, 2)`), `getGL`, `compileShader`, `createProgram`, `bindFullscreenQuad`, `sizeCanvas`. |
| `src/webgl/starfield.js` | `createStarfield(canvasId, options)` factory — shared by 3 surfaces; `render(now)` uses the shared RAF timestamp. |
| `src/webgl/intro-starfield.js` | `createIntroStarfield(canvasId)` — own shader, `setPulse()` big-bang, context-lost handlers. |
| `src/webgl/shaders/glsl-utils.js` | `SIMPLEX_NOISE`, `STAR_FIELD`, `VERTEX_QUAD` (verbatim GLSL). |
| `src/webgl/shaders/intro-frag.js` | `INTRO_FRAG` (cosmic noise + pulse) + `STARFIELD_FRAG` (factory shader). |
| `src/sections/intro.js` | Orbit → transition text → 2D-canvas constellation explosion → smoke clear → mission reveal; builds GSAP timelines wired to `timeline.js`; owns intro-overlay teardown at the TRUE intro end. |
| `src/sections/muse.js` | `initMuse`: `MuseScroll` adaptive-ellipse orbit (depth + zIndex churn fix); registers gated layer; black→white switch + logo crossfade. |
| `src/sections/comet.js` | `initComet`: pill `Toggle` (attached listeners, no inline onclick); registers `ProcessLinks.draw` as gated layer; two sequential 200vh sticky panels. |
| `src/sections/events.js` | `initEvents`: partnership logo marquee (duplicated track). |
| `src/ui/focus-trap.js` | `getFocusable`, `createFocusTrap`, `wireModalDismiss`. |
| `src/ui/muse-popup.js` | `MusePopup` — 3D tilt card, 12 particles, GSAP entrance, focus-trap. |
| `src/ui/floating-processes.js` | `FloatingProcesses` — places 5 process imgs once (`setInitialPositions`); they bob via CSS `float` animation. Drag was removed; `pointer-events: none`. |
| `src/ui/process-links.js` | `ProcessLinks` — 2D-canvas starline connecting the 5 processes (jank fix: no per-frame `shadowBlur`, cheap translucent strokes + epsilon redraw-skip). |
| `src/styles/tokens.css` | `:root` design tokens — colors, 7 muse hexes, font clamps, logo sizes, spacing, z-index, transitions. |
| `src/styles/base.css` | reset, `html/body` height 100% + body `overflow-y:auto` for Lenis, scrollbar, `canvas.bg-layer`, `.visually-hidden`, `prefers-reduced-motion`. |
| `src/styles/intro.css` | intro section; `.intro-spacer { height: var(--intro-h) }`; orbit dots, mission overlay, unified starfield, white-section. |
| `src/styles/muse.css` | `.muse-panel { height: var(--muse-h) }`; sticky muse stage; orbit items; full popup system. |
| `src/styles/comet.css` | `.comet-panel-intro` / `.comet-panel-tabs` literal `200vh` each; pill toggle; `@keyframes fadeInPanel`. |
| `src/styles/events-footer.css` | partnership marquee + footer. |
| `src/styles/responsive.css` | 1024/768/480 breakpoints + `max-height:500px`; reduced-motion lives in `base.css`. |

Assets live in `public/assets/images/` — Vite serves `public/` at the site root, so HTML references them as `assets/images/...`. `PartnershipSlider` (now `initEvents`) uses a hardcoded array from `data.js`; Stardust/Horizon panels render static markup.

**Total scroll height:** ~1490vh (intro 640 incl. mission overlay + muse 450 + comet 400, plus the static events page + footer). Heights are injected from `timeline.js` — see SCROLL pacing below.

---

## Page Sections (Top → Bottom)

### 1. Landing / Intro + Mission (`0–640vh`, section `intro`)
**HTML:** `index.html:24–54` · **CSS:** `src/styles/intro.css` · **JS:** `src/sections/intro.js` (timelines) + `src/webgl/intro-starfield.js` (`#bg-canvas`)

Fixed overlay. The mission statement is part of this section — it overlays the settled constellation dots rather than living in its own scroll section. The section height is injected as `var(--intro-h)`; `.intro-spacer` reads it. The intro is built from five `timeline.js` phases (see SCROLL pacing): `intro.orbit` 192, `intro.text` 48, `intro.explosion` 140, `intro.mission` 100, `intro.missionHold` 160 → **640vh total**.
- **Landing idle (before any scroll):** `.intro-content` carries the `intro-idle` class, which shows ONLY the centered cocoex logo (at the 80px orbit-START size, `ORBIT.logoMinSize`) gently pulsing, plus a bottom-centered scroll-down arrow hint (`#scroll-hint`). The orbit dots are hidden. The orbit ScrollTrigger's `onUpdate` toggles `intro-idle` off the instant `progress > 0.001` (and clears the inline logo size so `updateOrbit` takes over with no size jump).
- **`intro.orbit` (0–192vh):** white + black dots orbit center; logo scales up, 2 full rotations (`updateOrbit`).
- **`intro.text` (192–240vh):** transition text fades in below logo, holds, then fades out.
- **`intro.explosion` (240–380vh):** 7 colored constellation dots explode from center on the 2D `#constellation-canvas` (z-depth render, big bang pulse via `introStarfield.setPulse`), front-loaded so they settle then hold. The layout reference is landscape (1400×800); on a **portrait** viewport (`height > width`) `initFireworkDots` transposes it 90° (ref-x → vertical, ref-y → horizontal) so the constellation runs tall instead of cramming into a small horizontal cluster. `resize()` re-projects if the explosion already ran (orientation change).
- **`intro.mission` (380–480vh):** smoke clears, then the mission fades in. Smoke = BOTH the 2D constellation (`#constellation-canvas`) AND the cosmic-noise WebGL backdrop (`#bg-canvas`) fading to opacity 0 over the first half of this phase (`smokeLayers`); the mission overlay then fades in over the back half. Transition SPEEDS are fixed fractions of this short phase so they stay constant.
- **`intro.missionHold` (480–640vh):** mission holds fully bright, then `.intro-content` fades out over the last 25% of the phase, handing off to the muse intro fading in underneath.

The mission overlay (`#mission-overlay`) now centers both `.reveal-text` lines together as one vertically + horizontally centered flex block (no longer top16% / bottom16%). `<em>cocoex</em>` renders as hollow outlined text.

Key elements: `#bg-canvas` (WebGL starfield), `#dot-white`, `#dot-black`, `#intro-logo`, `#final-dot`, `#transition-text`, `#constellation-canvas`, `#mission-overlay` / `#reveal-text`.

---

### 2. Muse — Intro → Orbit (section `muse`, 450vh, follows intro at ~640vh)
**HTML:** `index.html:60–111` (single `.muse-section-wrapper` → `.section-panel.muse-panel` → `.muse-stage`) · **CSS:** `src/styles/muse.css` · **JS:** `src/sections/muse.js` (`MuseScroll` + `buildMuseTimeline`)

**ONE overlapping panel.** Intro and orbit share `.muse-stage` (sticky), so the center logo stays put while the background flips black→white. The 450vh panel height is `var(--muse-h)`. Phases (from `timeline.js`): `muse.fadein` 100, `muse.hold` 250, `muse.switch` 100.
- **Intro fade-in (0–100vh into the panel):** `.muse-shared-logo` + `.muse-intro-copy` fade in (**pure opacity, no translateY/slide** — the copy stays put and just appears) over the black starfield. Copy is a short couplet: "Seven causes. / One constellation." (top) + the framework line (bottom), both centered. The two lines sit at `top: 16%` / `bottom: 16%` for breathing room from the center logo.
- **Hold (100–350vh):** intro holds fully readable.
- **Switch (350–450vh):** the white `.muse-section` bg fades in, the center logo **opacity-crossfades white→black** (two stacked `<img>`: `#muse-logo-white` out, `#muse-logo-black` in — NO `filter()` tween), and the intro copy fades out as the orbit takes over.
- **No orbit dwell:** you scroll straight from the orbit into the comet intro. The orbit is visible THROUGH the 100vh switch, so its on-screen time already feels generous.

The switch is race-free: intro layers are transparent (black starfield shows through), only the white `.muse-section` is opaque, so fading white IN over the transparent intro has no opaque-over-opaque fight.

7 `.muse-orbit-item` elements rotate on an adaptive ellipse (`MuseScroll.calcRadius`/`update`). Ratio interpolates smoothly with viewport aspect (no breakpoint pop): wide → horizontal, square → near-circular, tall → vertical. Each muse has depth scaling from `sin(angle)` (front ~1.05, back ~0.65) with matching `zIndex` — `zIndex` is only written when its rounded value changes (a per-frame stacking-context churn fix). `data-angle` is parsed once on init.

Click any muse → **Muse Popup** (`src/ui/muse-popup.js` `MusePopup`): 3D tilt card, colored aura, 12 floating particles, GSAP entrance. Close: Escape / click outside / X.

WebGL: `#muse-background-canvas` (inverted starfield — black stars on off-white), a `createStarfield(..., { invert: true })` instance created in `main.js`.

---

### 3. Comet Collab Intro (section `comet` panel 1, `comet-panel-intro` = literal 200vh)
**HTML:** `index.html:116–135` · **CSS:** `src/styles/comet.css` · **JS:** `src/sections/comet.js` (`buildCometTimeline`) + `src/ui/floating-processes.js` + `src/ui/process-links.js`

Sticky panel. Constellation hides over `COMET_CONST_HIDE_VH = 40`vh (from `timeline.js`, overlaps the fade-in). The intro fades in over 100vh, holds, then fades out as the panel scrolls away (phases `comet.introIn` 100 + `comet.introHold` 100). The White Comet Collabs logo descent is CSS-positioned (**no JS descent tween**). Intro copy ends "...through Stardust and Horizon." then "Guided by Muse, in a continuous loop of creation and impact." on its own line, centered.

5 floating process images (`.floating-process`, positions set once in `FloatingProcesses.setInitialPositions`, then left to a CSS `float` bob). **Drag was removed** — users liked the fixed arrangement; the elements are `pointer-events: none` and carry no `draggable` attribute or drag listeners. A faint white **starline** (`#process-link-canvas`, 2D, drawn by `ProcessLinks` registered as a gated `Renderer` layer) connects them in order 1→2→3→4→5, redrawing live from `getBoundingClientRect()` as they bob — skipping the redraw when no node moved beyond a 0.4px epsilon, and faking the glow with cheap translucent strokes instead of per-frame `shadowBlur`.

---

### 4. Comet Methods Toggle (section `comet` panel 2, `comet-panel-tabs` = literal 200vh)
**HTML:** `index.html:137–186` · **CSS:** `src/styles/comet.css` · **JS:** `src/sections/comet.js` (`Toggle`)

Second sticky panel (sequential, not overlapping the intro). Methods panel fades in over 100vh, then holds through closure (phases `comet.methodsIn` 100 + `comet.methodsHold` 100). Comet ends here — there is **no connected-images panel**.

Pill toggle (`.comet-pill`) switches between:
- **Stardust:** artist flow (select cause → create work → launch campaign → funds split)
- **Horizon:** Future Lab flow, with `+Horizon` badge addon

The toggle is wired by `Toggle.init()` attaching `click` listeners to `#tab-stardust` / `#tab-horizon` (**no inline onclick, no global `window.switchTab`**); `Toggle.switch(method)` flips `.active` classes + the `#pillSlider` position.

---

### 5. Events Page (section `events`, static after comet)
**HTML:** `index.html:190–194` · **CSS:** `src/styles/events-footer.css` · **JS:** `src/sections/events.js` (`initEvents`)

`.events-page-wrapper` → `.partnership-section` only.

**Partnership marquee:** `initEvents` builds a `.partnership-track`, fills it with the `PARTNERS` array from `data.js` (5 entries → `assets/images/partnerships/partner-N.png`), and **duplicates the set once** for a seamless CSS marquee loop.

---

### Footer (Static at end of flow)
**HTML:** `index.html:197–209` · **CSS:** `src/styles/events-footer.css` (`.social-links`)

Static footer at the page end. 3 social icons (Telegram, Instagram, LinkedIn). cocoex text logo.

---

## CSS Design System

### Colors (`:root` — `src/styles/tokens.css`)
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

### Z-Index Layers (`src/styles/tokens.css`)
```css
--z-bg: 0
--z-intro: 10
--z-white-section: 30
--z-events: 40
--z-popup: 1000
```

### Breakpoints (layout-only — prefer clamp() over media queries)
- `≤1024px` Tablet: Touch optimization
- `≤768px` Mobile: Layout adjustments, vertical ellipse orbit
- `≤480px` Small: Fine-tuning

---

## JavaScript Architecture

**Pattern:** ES modules under `src/`, bundled by Vite. No IIFE, no global scope. `index.html` loads one entry, `/src/main.js`; everything else is reached by `import`. The module map lives under "Site Architecture" above.

**Boot order (`src/main.js` `boot()`):**
1. `applyHeightsToCss()` — inject section heights from the declarative timeline.
2. `initSmoothScroll()` — Lenis ↔ GSAP wiring.
3. Create 4 WebGL surfaces (`createIntroStarfield` for `#bg-canvas`; three `createStarfield` instances — unified white-on-black, muse inverted, comet inverted), `init()` each, then register every starfield as a gated `Renderer` layer with the section(s) it belongs to.
4. `initIntro` / `initMuse` / `initComet` / `initEvents` — each registers its own per-frame `Renderer` layers and GSAP timelines.
5. `initSectionGate()` — drives `Renderer.setSection` (NOT the intro overlay teardown; see gotcha).
6. `Renderer.start()` — the single RAF loop.
7. Debounced (150ms) `resize` → `applyHeightsToCss`, resize every surface, `intro/muse/comet.resize()`, `ScrollTrigger.refresh()`.

### Scroll pacing — declarative `PHASES` (`src/scroll/timeline.js`)
RHYTHM: 1 scroll = 100vh. Every fade-in is followed by a REAL hold so content never flashes past. **`timeline.js` is the single source of truth.**

`PHASES` is an ordered array of `{ id, section, vh }`. A builder turns it into absolute `{ startVh, endVh, durationVh }` per phase plus per-section spans. `phase(id)` returns a descriptor with px-offset getters (`startPx`/`endPx`/`startFromSection`/`endFromSection`) computed against the **live** viewport (read inside ScrollTrigger function-form `start`/`end` with `invalidateOnRefresh: true`). `sectionSpan(name)` and `vhToPx(vh)` are also exported.

`applyHeightsToCss()` writes each section's height to `:root` as a CSS custom property — `--intro-h`, `--muse-h`, `--comet-h`, plus `--total-h`. CSS reads `height: var(--intro-h)` etc. — heights are **injected, never hardcoded**. So changing ONE `vh` number in `PHASES` recascades both the CSS heights and the GSAP offsets — no hand-syncing.

Current `PHASES` (copy exact values from the file — this is a snapshot):
```javascript
// INTRO — section total 640vh
intro.orbit       192   // logo grows + dots orbit, 2 rotations
intro.text         48   // transition text in/hold/out
intro.explosion   140   // constellation explodes + settles
intro.mission     100   // smoke clears + mission fade-in
intro.missionHold 160   // mission holds bright, then fades out

// MUSE — section total 450vh
muse.fadein       100   // intro logo + copy fade in (pure opacity)
muse.hold         250   // intro holds fully readable
muse.switch       100   // black→white + logo crossfade → orbit

// COMET — section total 400vh (two literal 200vh sticky panels)
comet.introIn     100   // comet intro fades in
comet.introHold   100   // intro holds
comet.methodsIn   100   // methods/tabs fade in
comet.methodsHold 100   // methods hold through closure

// plus: COMET_CONST_HIDE_VH = 40  // constellation hides on comet entry
```
The mission/smoke/fade transitions are derived inside `buildIntroTimelines` as fixed fractions of the `intro.mission` / `intro.missionHold` phases (so transition SPEED stays constant while the long hold lives in `missionHold`): smoke clears over the first 50% of `intro.mission`, mission fades in over the back 50%, holds bright through `missionHold`, then `.intro-content` fades out over its last 25%.

**Never hardcode vh values in animations or CSS heights** — reference `timeline.js` (`phase()`/`sectionSpan()`/CSS vars). The `.comet-panel-intro` / `.comet-panel-tabs` literal `200vh` heights in `comet.css` are the one deliberate exception (each panel is exactly one 200vh phase pair).

### Off-screen WebGL gating (`src/scroll/section-gate.js` + `src/webgl/renderer.js`)
`initSectionGate` creates a ScrollTrigger over `.scroll-container` that derives the active section (`'intro' | 'muse' | 'comet' | 'events'`) from scroll position using `timeline.js` section spans with a 75vh **lead buffer** (next-section starfields wake up 75vh early to avoid pop-in), then calls `Renderer.setSection`. `Renderer`'s single RAF loop renders ONLY the layers whose `sections` include the active one — off-screen WebGL never touches the GPU, and `MuseScroll.update()` (its own layer) is skipped outside `'muse'`. The loop also pauses entirely on `visibilitychange` when the tab is hidden.

**Gotcha — intro overlay teardown is decoupled from the gate.** Hiding the `.intro` overlay so its canvases can't bleed into muse is driven by its OWN ScrollTrigger inside `src/sections/intro.js`, keyed to the **TRUE (unbuffered) intro end** (`sectionSpan('intro').endVh`). It is deliberately NOT driven by the section gate: the gate's 75vh lead buffer would hide the overlay ~75vh early — erasing the mission statement that fades in / holds during the last 260vh of intro.

---

## Data Layer

Static content lives in `src/data.js` (imported, not fetched):

- **`PARTNERS`** — five `assets/images/partnerships/partner-N.png` paths, consumed by `initEvents`.
- **`MUSES`** — canonical muse name / cause / CSS-var color.
- **`CONFIG`, `DOT_COLORS`, `CONSTELLATION_REF`, `CONNECTIONS`** — intro layout params + constellation geometry.
- **Stardust / Horizon panels:** static HTML in `index.html`. `Toggle` only flips the active panel — no data-driven rendering.

When real data needs to drive these surfaces, prefer a thin `fetch('data/...json')` (or a JSON import) inside the relevant module rather than a global.

---

## WebGL System

All surfaces render inside the single `Renderer` RAF loop (`src/webgl/renderer.js`), gated by the active section. There are **4 WebGL canvases** (3 share one shader via the `createStarfield()` factory, `src/webgl/starfield.js`; the intro has its own shader) plus **2 2D-canvas** surfaces.

| Canvas | ID | Source | Type | Active section(s) |
|---|---|---|---|---|
| Intro starfield | `#bg-canvas` | `createIntroStarfield` (`src/webgl/intro-starfield.js`) | WebGL (own shader + pulse) | `intro` |
| Constellation | `#constellation-canvas` | `src/sections/intro.js` (`drawExplosion`) | 2D | `intro` (cleared on exit) |
| Unified starfield | `#unified-starfield-canvas` | `createStarfield` (white-on-black) | WebGL | `muse`, `comet` |
| Muse backdrop | `#muse-background-canvas` | `createStarfield(..., { invert: true })` | WebGL | `muse` |
| Comet backdrop | `#comet-collab-background-canvas` | `createStarfield(..., { invert: true })` | WebGL | `comet` |
| Process starline | `#process-link-canvas` | `ProcessLinks` (`src/ui/process-links.js`) | 2D | `comet` (intro panel) |

**Rules:**
- DPR capped at `Math.min(devicePixelRatio, 2)` — `gl-context.js` `DPR()` and the 2D canvases all respect it; never remove the cap.
- The starfield factory shader (`STARFIELD_FRAG`) takes `invert` + `intensity` uniforms — add new starfield surfaces by passing options, **not** by writing a new shader.
- `render(now)` receives the **shared RAF timestamp** from `Renderer` — never start a private `requestAnimationFrame`.
- Stay under 8 concurrent WebGL contexts (Safari cap). Currently 4 WebGL active.
- WebGL context loss: `intro-starfield.js` registers `webglcontextlost`/`webglcontextrestored` handlers and rebuilds the program on restore — replicate on any new context.

---

## Accessibility

- Keyboard: Tab through muses (each `.muse-orbit-item` gets `tabindex="0"` + `role="button"` in `MuseScroll.attachHandlers`), Enter/Space opens popup, Escape closes.
- The Muse popup (`#muse-popup`) has `role="dialog" aria-modal="true"` + `aria-labelledby` and a focus-trap (shared `createFocusTrap` / `wireModalDismiss` in `src/ui/focus-trap.js`). Focus is restored to the previously-focused element on close.
- `.muse-popup-close` is `clamp(44px, 10vw, 52px)` ≥ WCAG mobile minimum.
- Mobile orbit tap surface expanded via `.muse-orbit-item::before { inset: -16px }` halo (preserves the transform-based centring).
- Orbit auto-rotation pauses for 2s on `touchstart` inside the muse section so mobile users have a stable target.
- Muse orbit headings render in solid `var(--color-black)` for AA contrast on off-white (per-muse hex tones — esp. Thunor `#F8D86A` — failed AA).
- `prefers-reduced-motion`: disables CSS animations, transitions, and popup particles. WebGL canvases continue rendering (visual ambience, not vestibular motion).
- Touch targets: 44px minimum (social icons 52px).
- Focus indicators: 2px outline + 2px offset.

---

## Asset Map

Assets live in `public/assets/images/`. Vite serves `public/` at the site root, so HTML/JS reference them as `assets/images/...` (no `public/` prefix).

```
public/assets/images/
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

---

## DOM → Module Quick Reference

Element IDs/selectors are stable; the module that owns each is listed (grep `index.html` to confirm markup). CSS for each lives in the obvious `src/styles/*.css` per section.

| Element | Selector | Owning module |
|---|---|---|
| Scroll container | `.scroll-container` | — (gated by `section-gate.js`) |
| Intro spacer | `.intro-spacer` (`height: var(--intro-h)`) | `timeline.js` injects height |
| Intro starfield | `#bg-canvas` | `intro-starfield.js` |
| Orbit dots / logo / merged dot | `#dot-white` `#dot-black` `#intro-logo` `#final-dot` | `sections/intro.js` |
| Transition text | `#transition-text` | `sections/intro.js` |
| Constellation canvas | `#constellation-canvas` | `sections/intro.js` (2D) |
| Mission overlay | `#mission-overlay` / `.reveal-text` (top + bottom, centered) | `sections/intro.js` |
| Unified starfield | `#unified-starfield-canvas` | `starfield.js` (white-on-black) |
| Muse panel | `.muse-panel` (`height: var(--muse-h)`) / `.muse-stage` | `sections/muse.js` |
| Muse backdrop | `#muse-background-canvas` | `starfield.js` (inverted) |
| Muse orbit items | `.muse-orbit-item` (×7) | `sections/muse.js` (`MuseScroll`) |
| Muse shared logo | `.muse-shared-logo` (`#muse-logo-white` / `#muse-logo-black`) | `sections/muse.js` |
| Muse intro copy | `.muse-intro-copy` | `sections/muse.js` |
| Muse popup | `#muse-popup` | `ui/muse-popup.js` + `ui/focus-trap.js` |
| Comet intro panel | `.comet-panel-intro` / `#comet-collab-intro` (literal 200vh) | `sections/comet.js` |
| Floating processes | `.floating-processes` (×5 `.floating-process`) | `ui/floating-processes.js` |
| Process starline | `#process-link-canvas` | `ui/process-links.js` (2D) |
| Comet backdrop | `#comet-collab-background-canvas` | `starfield.js` (inverted) |
| Comet tabs panel | `.comet-panel-tabs` / `.comet-pill` (literal 200vh) | `sections/comet.js` (`Toggle`) |
| Pill tabs | `#tab-stardust` / `#tab-horizon` / `#pillSlider` | `sections/comet.js` (`Toggle`) |
| Stardust / Horizon panels | `#panel-stardust` / `#panel-horizon` | `sections/comet.js` |
| Events page | `#events-page` / `#partnership-slideshow` | `sections/events.js` |
| Footer | `.social-links` / `.footer-logo` | static (`events-footer.css`) |

---

## Common Bugs & Rules

**Canvas flickering:** never apply both manual rotation and CSS `transform` on the same canvas. Store unrotated positions; let CSS rotate.

**Scroll reads 0:** use `window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0`.

**iOS scroll (Lenis):** Lenis 1.3.4 virtualizes scroll position and is wired to GSAP in `src/scroll/smooth-scroll.js`. Body is the scroll container (`overflow-y: auto; height: 100%`), so Lenis is initialised with `wrapper: document.body, content: '.scroll-container'`, rides `gsap.ticker` (`autoRaf: false`), gets a `scrollerProxy` over body, and `ScrollTrigger.defaults({ scroller: document.body })`. `normalizeScroll` is intentionally NOT enabled — **do not re-enable it**; Lenis replaces its purpose and the two together deadlock on iOS Safari. Removing `html, body { height: 100% }` or `body { overflow-y: auto }` (in `base.css`) breaks layout — leave them.

**Intro overlay teardown vs. section gate:** the intro overlay must be hidden at the **unbuffered** intro end (`sectionSpan('intro').endVh`), driven by its own ScrollTrigger in `sections/intro.js` — NOT by the section gate. The gate's 75vh lead buffer would hide the overlay ~75vh early and erase the mission statement before it reveals. Keep these two decoupled.

**CSS not applying:** debug with `window.getComputedStyle(element).propertyName`. Use `!important` only to resolve specificity — document why.

**Animations too fast:** increase the relevant phase `vh` in `timeline.js` `PHASES`. Minimum 100vh per scroll-driven phase for 60fps smoothness.

**WebGL performance:** one shared `Renderer` RAF loop; off-screen layers are gated out by section. DPR cap at 2× is non-negotiable. Use the starfield factory rather than new shaders.

**Process starline jank:** `ProcessLinks.draw` must NOT set `ctx.shadowBlur` per frame (the original's worst cost) — the glow is faked with wide translucent strokes, and the redraw is skipped when no node moved past a 0.4px epsilon. Keep both.

**Muse zIndex churn:** `MuseScroll.update` only writes `el.style.zIndex` when its rounded depth value changes — writing every frame forces stacking-context recalcs (a measured jank source). Keep the `lastZ` guard.

**Canvas touch blocking:** never rely on inherited `pointer-events: none` for canvas elements on iOS/Android — set it explicitly on the canvas.

**Floating processes are non-interactive (by design):** the 5 `.floating-process` images are placed once and bob via CSS only — `pointer-events: none`, no `draggable`, no drag listeners. Drag was deliberately removed (it conflicted with mobile scroll and the fixed layout reads better). Do NOT re-add drag/`touchmove` handlers.

**Never:** add frameworks, pollute global scope, duplicate `timeline.js` vh values anywhere, use `scroll-behavior: smooth` on `html {}` (breaks GSAP), use `overflow-y: scroll` on both `html` and `body`.

---

## Dev Workflow

```bash
npm install        # first time
npm run dev        # Vite dev server, http://localhost:5173 (auto-opens)
npm run build      # production bundle → dist/
npm run preview    # serve the built dist/ locally
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

For *what* the code does, read `index.html`, the ES modules under `src/`, and the stylesheets under `src/styles/*.css` directly. Those files are the reference.

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
