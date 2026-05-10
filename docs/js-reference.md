> UPDATED AT: 2026-05-10

# cocoex.xyz — JavaScript Reference

---

## Architecture

### IIFE Pattern (main.js:7–2855)
The entire codebase is wrapped in a single immediately-invoked function expression: `(function() { 'use strict'; ... })()`. This prevents all variables, constants, and module objects from leaking into the global `window` scope. Nothing is accessible from outside unless explicitly assigned to `window` (only `window.switchTab` is). The IIFE runs once on page load, registers GSAP plugins, and calls `init()` at the very end. The strict mode pragma catches silent errors early.

### Module Object Pattern
Interactive feature sets are implemented as plain object literals with a consistent shape:

```js
const ModuleName = {
  // DOM references and state properties at the top
  container: null,
  isInitialized: false,

  init() { /* query DOM, bind events, call first render */ },
  resize() { /* recalculate dimensions on viewport change */ },
  // ... other methods
};
```
Modules never have constructors — they are singletons. `init()` is called once from the global `init()` function (line 2770). `resize()` is called from the consolidated `handleResize` debouncer (line 928).

### Master Render Loop (main.js:825–912)
There is exactly **one** `requestAnimationFrame` loop in the codebase: `masterRender()`. It is started at the end of `init()` and stored in `masterRenderLoop`. Every WebGL canvas that needs per-frame updates is rendered here, in sequence:

1. Intro starfield (`#bg-canvas`) — WebGL, `gl` + `program`
2. Muse gradient (`#muse-background-canvas`) — `MuseBackground.gl` + `.program`
3. Unified starfield (`#unified-starfield-canvas`) — `UnifiedStarfield.gl` + `.program`
4. Comet gradient canvas 1 (`#comet-collab-background-canvas`) — `CometCollabBackground.gl` + `.program`
5. Comet gradient canvas 2 (`#comet-collab-background-canvas-2`) — `CometCollabBackground.gl2` + `.program2`
6. `MuseScroll.updateOrbitPositions()` — Canvas 2D, DOM transforms

The loop is paused via the Page Visibility API when the tab is hidden and cancelled on `beforeunload`.

### Event-Driven vs Scroll-Driven
- **Scroll-driven animations** are handled exclusively by GSAP ScrollTrigger inside `initGSAPAnimations()`. No manual `scroll` event listener drives any animation.
- **Event-driven interactions** (clicks, keyboard, drag) are set up in `initEventListeners()` and inside each module's `init()` method.
- The one legacy `ScrollTrigger.create` in `initEventListeners()` (line 919) calls `updatePositions()`, which today only resets `pulseTriggered` and `phase2Started` when scrolling backward — it does not drive visual state.

---

## Constants Reference

### SCROLL_TIMING (main.js:94–122)

All scroll distances are in viewport-height units (vh). Never hardcode a vh value in an animation — always reference this object.

| Key | Value | Meaning in vh | Controls |
|---|---|---|---|
| `INTRO_TOTAL` | 400 | 400vh total intro scroll height | Denominator for all intro progress calculations |
| `INTRO_PHASE1_END` | 0.40 | 160vh | End of orbiting-dots + logo-rotation animation |
| `INTRO_PHASE2_TEXT` | 0.50 | 200vh | Transition text fade-out end |
| `INTRO_PHASE3_START` | 0.50 | 200vh | Constellation explosion starts |
| `TEXT_SECTION_HEIGHT` | 150 | 150vh | Total height of `.text-section-wrapper` |
| `MUSE_INTRO_HOLD` | 350 | 350vh | Scroll distance before muse crossfade begins |
| `MUSE_CROSSFADE` | 120 | 120vh | Duration of muse intro → orbiting crossfade |
| `MUSE_CONTENT_HOLD` | 0 | 0vh | Reserved; currently unused |
| `MUSE_TOTAL` | 470 | 470vh | Total `.muse-section-wrapper` scroll height |
| `COMET_INTRO_PAUSE` | 100 | 100vh | Comet intro holds static |
| `COMET_LOGO_MOVEMENT` | 180 | 180vh | Logo descent + text rise duration |
| `COMET_MOVEMENT_START` | 100 | 100vh | vh offset when logo movement begins |
| `COMET_BOTTOM_HOLD` | 80 | 80vh | Hold after logo reaches bottom |
| `COMET_CROSSFADE_START` | 360 | 360vh | When connected images begin fading in |
| `COMET_CROSSFADE_DURATION` | 120 | 120vh | Crossfade intro → connected images duration |
| `COMET_PHASE_DURATION` | 40 | 40vh | Scroll distance per phase step |
| `COMET_PHASES_START` | 480 | 480vh | When phase-step scrolling begins |
| `COMET_PHASE_COUNT` | 3 | — | Number of phases |
| `COMET_CONTENT_HOLD` | 0 | 0vh | Reserved; currently unused |
| `COMET_TOTAL` | 600 | 600vh | Total `.comet-collab-wrapper` scroll height |

### CONFIG (main.js:127–160)

| Key | Value | Purpose |
|---|---|---|
| `borderMargin` | 0.20 | Fraction of viewport kept clear at the edge for the orbit start position |
| `logoMargin` | 0.20 | Extra margin between logo edge and orbit end-radius |
| `logoMinSize` | 80 | Initial logo size in px (orbit start) |
| `logoMaxSize` | 250 | Final logo size in px on desktop |
| `logoMaxSizeMobile` | 180 | Final logo size on mobile |
| `totalRotations` | 2 | Number of full rotations the logo makes during Phase 1 |
| `dotMaxSize` | 24 | Orbit dot diameter at scroll start (desktop, px) |
| `dotMinSize` | 8 | Orbit dot diameter at orbit end (desktop, px) |
| `dotMaxSizeMobile` | 18 | Orbit dot diameter at scroll start (mobile, px) |
| `dotMinSizeMobile` | 6 | Orbit dot diameter at orbit end (mobile, px) |
| `finalDotSize` | 150 | White merged dot size before explosion (desktop, px) |
| `finalDotSizeMobile` | 100 | White merged dot size before explosion (mobile, px) |
| `phase1End` | 0.40 | Alias for `SCROLL_TIMING.INTRO_PHASE1_END` |
| `phase3Start` | 0.50 | Alias for `SCROLL_TIMING.INTRO_PHASE3_START` |
| `phase3End` | 1.0 | End of constellation animation (100% of intro) |
| `refWidth` | 1400 | Reference screen width used to scale constellation coordinates |
| `refHeight` | 800 | Reference screen height used to scale constellation coordinates |
| `mobileBreakpoint` | 768 | px — `isMobile()` returns true below this |
| `tabletBreakpoint` | 1024 | px — `isTablet()` returns true below this |

### DOT_COLORS (main.js:163–171)

Array index maps directly to `CONSTELLATION_REF` index and to the seven muses (same order).

| Index | Hex | RGB | Muse |
|---|---|---|---|
| 0 | `#FF9F5A` | 255, 159, 90 | Solis (warm orange) |
| 1 | `#FFEC8A` | 255, 236, 138 | Thunor (yellow) |
| 2 | `#8A6FD1` | 138, 111, 209 | Shukra (purple) |
| 3 | `#7AAFD6` | 122, 175, 214 | Lunes (blue) |
| 4 | `#B0D89F` | 176, 216, 159 | Rabu (green) |
| 5 | `#FF6B4A` | 255, 107, 74 | Ares (red) |
| 6 | `#A96FD2` | 169, 111, 210 | Dosei (violet) |

### CONSTELLATION_REF (main.js:175–183)

Reference coordinates in a 1400×800 virtual canvas. At runtime they are scaled and offset to fit the actual viewport. `z` is a depth value: negative = further back (smaller, dimmer), positive = closer (larger, brighter).

| Index | x (raw) | y (raw) | z | Notes |
|---|---|---|---|---|
| 0 | 266 | 335 | -0.3 | Slightly back |
| 1 | 315 | 668 | 0.4 | Forward |
| 2 | 614 | 343 | -0.5 | Further back |
| 3 | 639 | 504 | 0.2 | Slightly forward |
| 4 | 917 | 128 | 0.6 | Most forward (closest) |
| 5 | 1069 | 378 | -0.2 | Slightly back |
| 6 | 892 | 629 | 0.1 | Near center depth |

Raw `x` values are `CONSTELLATION_REF[i].x` = original coordinate − 140 (the -140 shift moves all points 10% left from the center of the 1400px reference canvas).

### STEP_DATA (main.js:198–243)

Nested object keyed by method (`stardust` / `horizon`) then by step number (1–5). Each entry has `title` and `description`. All descriptions are currently placeholder lorem ipsum text. This data is consumed by `StepPopup.open(step)` which reads the active method from `MethodToggle.getCurrentMethod()`.

```
STEP_DATA.stardust[1].title       → 'Stardust Step 1'
STEP_DATA.stardust[1].description → 'Lorem ipsum...'
STEP_DATA.horizon[3].title        → 'Horizon Step 3'
STEP_DATA.horizon[3].description  → 'Curabitur sodales...'
```

---

## DOM Elements Cache (main.js:248–260)

All frequently accessed elements are cached once at module load time in the `elements` object. Never call `document.getElementById` inside an animation loop — use this cache.

| Variable | Selector | References |
|---|---|---|
| `elements.bgCanvas` | `#bg-canvas` | Intro WebGL starfield canvas |
| `elements.logoContainer` | `#logo-container` | Wrapper div that rotates around center; sized/transformed in Phase 1 |
| `elements.introLogo` | `#intro-logo` | The `<img>` inside logoContainer |
| `elements.dotWhite` | `#dot-white` | Filled white orbiting dot |
| `elements.dotBlack` | `#dot-black` | Outlined black orbiting dot |
| `elements.finalDot` | `#final-dot` | Merged white dot shown at transition to explosion |
| `elements.transitionText` | `#transition-text` | "art as infrastructure for change" text overlay |
| `elements.constCanvas` | `#constellation-canvas` | Canvas 2D for explosion dots + lines |
| `elements.revealText` | `#reveal-text` | Mission text block in text section |
| `elements.introSection` | `.intro` | Fixed intro overlay wrapper |
| `elements.textSectionWrapper` | `.text-section-wrapper` | Sticky text section |

Two raw contexts are also initialized at module load (lines 263–264):
- `constCtx` — 2D context of `elements.constCanvas`
- `gl` — WebGL context of `elements.bgCanvas`

---

## State Variables (main.js:269–279)

| Variable | Initial Value | Tracks |
|---|---|---|
| `fireworkDots` | `[]` | Array of dot objects created by `initFireworkDots()`; each has `startX/Y`, `targetX/Y`, `z`, `x/y`, `angle`, `speed`, `trail`, `maxTrail` |
| `phase2Started` | `false` | Whether constellation explosion has been initialized at least once; guards `initFireworkDots()` from re-running on resize before phase 3 |
| `startTime` | `Date.now()` | Epoch ms at page load; used to compute `time = (Date.now() - startTime) / 1000` passed to WebGL shaders |
| `program` | `undefined` | Compiled WebGL program for intro starfield |
| `posAttr` | `undefined` | Attribute location for `a_position` in intro shader |
| `resUniform` | `undefined` | Uniform location for `u_resolution` in intro shader |
| `timeUniform` | `undefined` | Uniform location for `u_time` in intro shader |
| `pulseUniform` | `undefined` | Uniform location for `u_pulse` in intro shader |
| `buffer` | `undefined` | WebGL vertex buffer (full-screen quad, shared across all canvases) |
| `pulseValue` | `0` | Current pulse animation state: 0 = inactive, 0–1 = expanding wave, resets to 0 at 1 |
| `pulseTriggered` | `false` | Prevents pulse from firing more than once per Phase 3 entry |
| `constellationRotation` | `0` | Declared but not actively written; CSS transform on `#constellation-canvas` handles rotation |
| `masterRenderLoop` | `null` | Handle returned by `requestAnimationFrame`; used to cancel the loop |
| `isPageVisible` | `true` | Updated by Page Visibility API; pauses `masterRender` body when `false` |
| `webglContextsLost` | `false` | Set to `true` on `webglcontextlost` event; skips WebGL calls until restored |
| `contextListenersAdded` | `false` | Guards against attaching duplicate context-loss handlers on repeated `initWebGL()` calls |

---

## Module Reference

---

### 1. `initWebGL()` + WebGL Intro Shader (main.js:399–538)

**Purpose:** Compiles and links the intro starfield/pulse WebGL program and attaches context-loss recovery handlers.

**Called by:** `init()` (line 2772)

**Public interface:** None (modifies module-level `program`, `posAttr`, `resUniform`, `timeUniform`, `pulseUniform`, `buffer`).

**Vertex shader (lines 399–404):** Trivial pass-through — maps the full-screen quad to clip space.

**Fragment shader (lines 406–468):** Three behavior layers:
1. Cosmic noise background: 3 octaves of simplex noise create slow-drifting dark clouds. Brightness stays in the `0.003–0.055` range — nearly black.
2. Star field: calls `GLSL_UTILS.STAR_FIELD` (4 layers of twinkling point stars).
3. Big bang pulse (conditional, only when `u_pulse > 0`): three concentric soft Gaussian waves expand from the canvas center, decaying as `u_pulse` → 1.

**UV aspect correction (line 418):**
```glsl
vec2 uvAspect = vec2(uv.x * aspect, uv.y);
```
Prevents noise patterns from stretching on non-square viewports. Use this pattern in every gradient shader.

**Key behavior to know when modifying:**
- The pulse is driven by `pulseValue` in `masterRender()`, which increments by `0.015` per frame (~4 seconds to complete at 60fps).
- Context loss handling (lines 489–510) reinitializes the shader and restarts the render loop; never add context listeners outside `initWebGL()`.

---

### 2. `resize()` (main.js:543–564)

**Purpose:** Resizes all canvases to match the current viewport, respecting DPR. Caps DPR at 2 on mobile.

**Called by:** `init()`, the `handleResize` debouncer, and `webglcontextrestored`.

**Key behavior:**
- `bgCanvas` and `constCanvas` are sized to `window.innerWidth/Height × dpr`.
- `constCanvas` also sets `style.width/height` for CSS layout.
- Only calls `initFireworkDots()` if `phase2Started` is already `true`, preventing unnecessary work before Phase 3.
- Calls `updatePositions()` to sync DOM dot positions after resize.

---

### 3. `initFireworkDots()` (main.js:569–601)

**Purpose:** Populates the `fireworkDots` array by mapping each `CONSTELLATION_REF` point to a screen coordinate, accounting for viewport size and reference dimensions.

**Called by:** `updateConstellationExplosion()` on first call, and `resize()` if `phase2Started`.

**Reads:** `CONSTELLATION_REF`, `CONFIG.refWidth/Height`, `window.innerWidth/Height`.

**Writes:** `fireworkDots` (replaces the entire array).

**Each dot object:**
```js
{
  startX, startY,   // center of screen (explosion origin)
  targetX, targetY, // scaled CONSTELLATION_REF coordinate
  z,                // depth from CONSTELLATION_REF
  x, y,             // current position (updated each frame)
  angle,            // random initial angle (not used for trajectory)
  speed,            // random speed factor (not used post-refactor)
  trail: [],        // last N positions for trail effect
  maxTrail,         // random 15–25
}
```

---

### 4. `updateConstellationExplosion(progress)` (main.js:606–648)

**Purpose:** Entry point for Phase 3 animation. Hides orbit elements, initializes dots on first call, triggers the big bang pulse, then delegates per-frame drawing to `updateFireworkDots()`.

**Signature:** `updateConstellationExplosion(progress: number)` — `progress` is 0→1 driven by GSAP scrub.

**Called by:** The Phase 3 ScrollTrigger `onUpdate` (line 1045).

**Side effects on first call:**
- Sets `phase2Started = true`
- Sets `pulseValue = 0.01` (starts the pulse)
- Sets `pulseTriggered = true`

**Element visibility changes:**
- Hides `logoContainer`, `dotWhite`, `dotBlack`, sets `introLogo.opacity = 0`
- Shows `constCanvas`
- `finalDot` fades out from opacity 1 → 0 during the first 15% of progress

---

### 5. `updateFireworkDots(progress, centerX, centerY)` (main.js:675–818)

**Purpose:** Per-frame 2D canvas render for the constellation explosion.

**Called by:** `updateConstellationExplosion()`.

**Animation phases:**
- `progress < 0.40` — explosion outward with `easeOutCubic`, overshooting target by 8%
- `progress >= 0.35` — settle back to target with `easeOutBack`
- `progress < 0.70` — trailing comet effect drawn as fading arcs
- `progress > 0.50` — connecting lines fade in, colored as gradient between the two connected dot colors
- All frames — dots drawn back-to-front sorted by `z`, sized by `1 + z * 0.4`, pulsed by a sine wave

**Critical pattern:** `constCtx.save()` at line 683, `constCtx.restore()` at line 817. Never draw to `constCtx` outside a save/restore pair.

**DPR scaling:** All `arc()` and `lineTo()` coordinates are multiplied by `dpr` to correctly map to the physical pixel canvas.

---

### 6. `masterRender()` (main.js:825–912)

**Purpose:** The single RAF loop. Renders all active WebGL canvases and updates orbit positions every frame.

**Key behaviors:**
- Skips body if `!isPageVisible || webglContextsLost` (still re-queues the frame)
- Computes `time = (Date.now() - startTime) / 1000` once per frame, shared by all canvases
- Increments `pulseValue += 0.015` per frame when `0 < pulseValue < 1`
- Uses `lastActiveProgram` to avoid redundant `gl.useProgram()` calls across WebGL contexts
- Calls `MuseScroll.updateOrbitPositions()` only when `MuseScroll.isInitialized === true`

**Adding a new canvas to the loop:**
```js
// Inside masterRender(), before the final requestAnimationFrame call:
if (MyModule.gl && MyModule.program) {
  const myGL = MyModule.gl;
  if (lastActiveProgram !== MyModule.program) {
    myGL.useProgram(MyModule.program);
    lastActiveProgram = MyModule.program;
  }
  myGL.uniform2f(MyModule.resUniform, MyModule.canvas.width, MyModule.canvas.height);
  myGL.uniform1f(MyModule.timeUniform, time);
  myGL.drawArrays(myGL.TRIANGLES, 0, 6);
}
```

---

### 7. `initEventListeners()` (main.js:917–966)

**Purpose:** Registers all non-animation event listeners.

**Listeners registered:**

| Event | Target | Handler |
|---|---|---|
| ScrollTrigger (virtual) | `.scroll-container` | `updatePositions()` — resets pulse/phase flags on scroll-back |
| `resize` | `window` | Debounced 150ms: `resize()`, `MuseScroll.handleResize()`, `MuseBackground.resize()`, `UnifiedStarfield.resize()`, `CometCollabBackground.resize()`, `ScrollTrigger.refresh()` |
| `orientationchange` | `window` | 300ms delay then `ScrollTrigger.refresh()` + conditional `initFireworkDots()` |
| `visibilitychange` | `document` | Toggles `isPageVisible`; resumes `masterRender` if needed |
| `beforeunload` | `window` | Cancels `masterRenderLoop` |
| `load` | `window` | `ScrollTrigger.refresh()` |

---

### 8. `initGSAPAnimations()` (main.js:971–1253)

**Purpose:** Registers all scroll-driven animations. Every ScrollTrigger in the codebase lives here.

**ScrollTriggers created (in order):**

#### Phase 1 — Orbit (lines 984–1005)
- **Trigger:** `.scroll-container`
- **Start:** `top top` (0px scroll)
- **End:** `top+=${introScrollHeight * 0.40}px top` (160vh)
- **Scrub:** `true`
- **Animates:** `orbitState.progress` 0→1, `orbitState.logoSize` 80→250, `orbitState.rotation` 720→0
- **onUpdate:** calls `updateOrbitPositions(orbitState)`

#### Transition Text (lines 1009–1029)
- **Trigger:** `.scroll-container`
- **Start:** `top+=${introScrollHeight * 0.304}px top` (76% of 40% = ~121.6vh)
- **End:** `top+=${introScrollHeight * 0.50}px top` (200vh)
- **Scrub:** `true`
- **Animates:** `#transition-text` opacity 0→1 (40%) → hold (30%) → 1→0 (30%)

#### Phase 3 — Constellation Explosion (lines 1034–1053)
- **Trigger:** `.scroll-container`
- **Start:** `top+=${introScrollHeight * 0.50}px top` (200vh)
- **End:** `top+=${introScrollHeight * 1.0}px top` (400vh)
- **Scrub:** `true`
- **Animates:** `phase3State.progress` 0→1
- **onUpdate:** calls `updateConstellationExplosion(phase3State.progress)`

#### Text Reveal (lines 1056–1070)
- **Trigger:** `.text-section-wrapper`
- **Start:** `top 80%`
- **End:** `bottom 60%`
- **Scrub:** `true`
- **Animates:** `#reveal-text` opacity 0→1

#### Footer Reveal (lines 1072–1093)
- **Trigger:** `#horizon`
- **Start:** `top 80%`
- **Scrub:** none (instant toggle)
- **onEnter:** adds `.visible` to `.social-links` and `.footer-logo`
- **onLeaveBack:** removes `.visible`

#### Muse Intro Fade-In (lines 1109–1123)
- **Trigger:** `.muse-section-wrapper`
- **Start:** `top 80%`
- **End:** `top 40%`
- **Scrub:** `true`
- **Animates:** `#muse-intro-page` opacity 0→1

#### Muse Crossfade (lines 1126–1161)
- **Trigger:** `.muse-section-wrapper`
- **Start:** `top+=${MUSE_INTRO_HOLD}vh top` (350vh into wrapper)
- **End:** `top+=${MUSE_INTRO_HOLD + MUSE_CROSSFADE}vh top` (470vh into wrapper)
- **Scrub:** `true`
- **Animates (simultaneous at position 0):**
  - `.muse-intro-logo`, `.muse-intro-text` opacity 1→0
  - `#muse-intro-page` opacity 1→0
  - `.white-section-content` opacity 0→1
  - `.muse-center-logo` opacity 0→1, scale 0.95→1

#### Constellation Canvas Hide (lines 1170–1183)
- **Trigger:** `.comet-collab-wrapper`
- **Start:** `top 90%`
- **End:** `top 60%`
- **Scrub:** `true`
- **Animates:** `#constellation-canvas` opacity 1→0

#### Comet Intro Fade-In (lines 1186–1200)
- **Trigger:** `.comet-collab-wrapper`
- **Start:** `top 80%`
- **End:** `top 40%`
- **Scrub:** `true`
- **Animates:** `#comet-collab-intro` opacity 0→1

#### Comet Methods Fade-In (lines 1204–1220)
- **Trigger:** `.comet-collab-wrapper`
- **Start:** `top+=${COMET_INTRO_PAUSE}vh top` (100vh into wrapper)
- **End:** `top+=${COMET_INTRO_PAUSE + 100}vh top` (200vh into wrapper)
- **Scrub:** `true`
- **Animates:** `.comet-collab-methods` opacity 0→1

#### Comet Crossfade — Intro → Connected Images (lines 1223–1251)
- **Trigger:** `.comet-collab-wrapper`
- **Start:** `top+=${COMET_CROSSFADE_START}vh top` (360vh into wrapper)
- **End:** `top+=${COMET_PHASES_START}vh top` (480vh into wrapper)
- **Scrub:** `true`
- **onEnter:** calls `CometConnections.draw()`
- **Animates (simultaneous at position 0):**
  - `#comet-collab-intro` opacity 1→0
  - `.comet-collab-connected-content` opacity 0→1

---

### 9. `updateOrbitPositions(orbitState)` (main.js:1258–1317)

**Purpose:** DOM-driven Phase 1 animation. Positions the two orbit dots and resizes/rotates the logo based on the GSAP-tweened `orbitState` object.

**Signature:** `updateOrbitPositions(orbitState: { progress: number, logoSize: number, rotation: number })`

**Called by:** Phase 1 ScrollTrigger `onUpdate`.

**What it writes to DOM:**
- `logoContainer.style.width/height` = `orbitState.logoSize + 'px'`
- `logoContainer.style.transform` = `translate(-50%, -50%) rotate(${orbitState.rotation}deg)`
- `dotWhite.style.left/top/width/height` — computed from `orbitRadius` and `whiteAngle`
- `dotBlack.style.left/top/width/height/borderWidth` — same with `blackAngle = whiteAngle + π`
- Clears `constCtx` each call (prevents ghost trails)

**Orbit geometry:** The orbit radius linearly interpolates from `startRadius` (edge of viewport minus `borderMargin`) to `endRadius` (half logoSize plus `logoMargin`) as `progress` goes 0→1. White dot is at angle `-π/2 + orbitAngle`; black dot is diametrically opposite.

---

### 10. `MuseBackground` (main.js:1323–1466)

**Purpose:** WebGL animated gradient for the Muse section background (`#muse-background-canvas`). Generates a slowly flowing blend of the seven muse colors, strongly biased toward white (`colorStrength: 0.15`).

**Public methods:**

| Method | Signature | Purpose |
|---|---|---|
| `init()` | `init(): void` | Queries canvas, gets WebGL context, calls `resize()` and `initShaders()` |
| `resize()` | `resize(): void` | Sizes canvas to parent element bounding rect × DPR |
| `initShaders()` | `initShaders(): void` | Compiles fragment shader, links program, creates full-screen quad buffer, stores `resUniform`/`timeUniform` |
| `createShader(type, source)` | `createShader(GLenum, string): WebGLShader` | Helper — same pattern as top-level `createShader` |

**State written to `this`:** `canvas`, `gl`, `program`, `resUniform`, `timeUniform`

**Shader behavior:** 3-octave simplex noise creates a `pattern` value (0–1), which is mapped to `zone = pattern * 7`, then linearly interpolated between consecutive muse colors. The final output is `mix(white, baseColor, 0.15)` — mostly white with subtle color shifts.

---

### 11. `UnifiedStarfield` (main.js:1471–1561)

**Purpose:** WebGL twinkling starfield for the Muse and Comet sections (`#unified-starfield-canvas`). Reuses `GLSL_UTILS.STAR_FIELD` — identical visual logic to the intro canvas but without the cosmic noise or pulse.

**Public methods:** `init()`, `resize()`, `initShaders()`, `createShader()`

**Key difference from intro shader:** No simplex noise background, no pulse uniform — pure star rendering only. Output is `vec4(vec3(starLight * 0.25), 1.0)`.

**Canvas sizing:** Sized to `window.innerWidth/Height` (full viewport), unlike `MuseBackground` which sizes to its parent element.

---

### 12. `CometCollabBackground` (main.js:1566–1823)

**Purpose:** WebGL animated gradient for both Comet Collab sections. Manages **two canvases** with the **same shader** — canvas 1 (`#comet-collab-background-canvas`) for the intro/methods section, canvas 2 (`#comet-collab-background-canvas-2`) for the connected images section.

**Public methods:**

| Method | Signature | Purpose |
|---|---|---|
| `init()` | `init(): void` | Initializes both canvases; calls `initShaders()` for canvas 1, `initShaders2()` for canvas 2 |
| `resize()` | `resize(): void` | Resizes both canvases to their respective parent element bounding rect × DPR |
| `initShaders()` | `initShaders(): void` | Compiles shader for canvas 1; stores `resUniform`, `timeUniform` |
| `initShaders2()` | `initShaders2(): void` | Same for canvas 2; stores `resUniform2`, `timeUniform2` |
| `createShader(type, source)` | — | Shader compile helper for canvas 1 |
| `createShader2(type, source)` | — | Shader compile helper for canvas 2 |

**Shader:** Identical to `MuseBackground` — same 7 muse colors, same noise layers, same `colorStrength: 0.15` white bias. Provides visual continuity from Muse → Comet sections.

**State properties:** `canvas`, `gl`, `program`, `resUniform`, `timeUniform` (canvas 1) and `canvas2`, `gl2`, `program2`, `resUniform2`, `timeUniform2` (canvas 2).

---

### 13. `MusePopup` (main.js:1828–2029)

**Purpose:** Modal popup that opens when a muse image or title is clicked. Shows a full-screen backdrop, muse image with colored aura, cause title, and description text. Manages 12 CSS-animated floating particles.

**State properties:** `popup`, `overlay`, `closeBtn`, `content`, `image`, `imageContainer`, `title`, `cause`, `text`, `particles`, `openTimeline`, `closeTimeline`, `isOpen`, `currentColor`

**Public methods:**

| Method | Signature | Purpose |
|---|---|---|
| `init()` | `init(): void` | Queries DOM, sets initial GSAP state (`display:none`), attaches overlay/button/Escape listeners |
| `open(causeTitle, description, color, imageSrc)` | `open(string, string, string, string): void` | Populates content, sets `--muse-color` CSS var, runs open GSAP timeline, calls `createParticles()` |
| `close()` | `close(): void` | Runs close GSAP timeline; on complete, hides popup and calls `clearParticles()` |
| `createParticles(color)` | `createParticles(string): void` | Creates 12 `.muse-popup-particle` divs at evenly-spaced angles, radius 200–300px from center, with staggered CSS animation |
| `clearParticles()` | `clearParticles(): void` | Sets `particles.innerHTML = ''` |

**Open timeline sequence (lines 1908–1939):**
1. Fade in backdrop (0.4s)
2. Scale/fade in image container with `back.out(1.5)` (0.6s, overlapping -0.2s)
3. Scale/fade in content wrapper (0.4s, overlapping -0.4s)
4. Fade up cause text (0.4s, overlapping -0.2s)
5. Fade up description text (0.4s, overlapping -0.3s)

**Close conditions:** overlay click, close button click, Escape key. Guards: `isOpen` flag prevents double-open or double-close. Respects `prefers-reduced-motion` for particles.

---

### 14. `MuseScroll` (main.js:2034–2159)

**Purpose:** Manages the orbiting layout of seven muse items around the center logo. Calculates an adaptive ellipse based on viewport size and updates item positions every frame via DOM transforms.

**State properties:** `container`, `items[]`, `isInitialized`, `orbitRadiusX`, `orbitRadiusY`, `animationTime`, `orbitSpeed` (0.00015 = 240s/rotation), `lastTime`

**Public methods:**

| Method | Signature | Purpose |
|---|---|---|
| `init()` | `init(): void` | Queries `#muse-section` and all `.muse-orbit-item`, calls `updateLayout()`, `applyColors()`, `attachClickHandlers()`, `startAnimation()` |
| `updateLayout()` | `updateLayout(): void` | Calls `calculateOrbitRadius()` |
| `calculateOrbitRadius()` | `calculateOrbitRadius(): void` | Sets `orbitRadiusX/Y` based on viewport breakpoint (see Ellipse Behavior) |
| `startAnimation()` | `startAnimation(): void` | Sets `this.lastTime = Date.now()`; actual animation driven by `masterRender()` |
| `updateOrbitPositions()` | `updateOrbitPositions(): void` | Called every frame from `masterRender()`; advances `animationTime` by `deltaTime * orbitSpeed`; sets each item's `transform: translate(calc(-50% + ${x}px), calc(-50% + ${y}px))` |
| `applyColors()` | `applyColors(): void` | Reads `data-color` from each item, applies to the child `h3` |
| `attachClickHandlers()` | `attachClickHandlers(): void` | Reads `data-color`, `data-popup-title` from each item; attaches click to `.muse-image` and `h3`; calls `MusePopup.open()` |
| `handleResize()` | `handleResize(): void` | Calls `updateLayout()` when `isInitialized` |

**Ellipse behavior:**
- Mobile (≤768px): `radiusX = viewport_min × 0.35`, `radiusY = radiusX × 1.8` (tall ellipse)
- Tablet (769–1024px): `radiusX = viewport_min × 0.30`, `radiusY = radiusX × 1.4`
- Desktop (>1024px): `radiusY = viewport_min × 0.30`, `radiusX = radiusY × 1.8` (wide ellipse)

**HTML data attributes required on `.muse-orbit-item`:**
- `data-angle` — starting angle in degrees (e.g., `0`, `51.4`, `102.8`, …)
- `data-color` — hex color string
- `data-popup-title` — displayed in popup cause line (e.g., `"Lunes · Water"`)

---

### 15. `CometConnections` (main.js:2164–2293)

**Purpose:** Canvas 2D overlay that draws glowing white lines between the 5 comet process images and from each image to the central logo.

**Public methods:**

| Method | Signature | Purpose |
|---|---|---|
| `init()` | `init(): void` | Queries `#comet-connection-canvas` and all `.comet-image-item`, calls `resize()` and `draw()`, attaches debounced resize listener |
| `resize()` | `resize(): void` | Sizes canvas to its bounding rect × DPR, scales ctx by DPR |
| `draw()` | `draw(): void` | Clears canvas; draws radial connections (each image → center logo) and sequential connections (1→2→3→4→5) with double-pass glow (outer blur 15px + inner blur 8px) |

**Called externally:** `MethodToggle.animateMergeExplode()` calls `draw()` at 60fps during animation; the Comet Crossfade ScrollTrigger `onEnter` also calls `draw()`.

---

### 16. `FloatingProcesses` (main.js:2298–2405)

**Purpose:** Makes `.floating-process` elements draggable by mouse and touch. On drag-end, restores the CSS `float` animation.

**State:** `processes[]`, `draggedElement`, `offsetX`, `offsetY`, `isDragging`

**Public methods:** `init()`, `setInitialPositions()`, `startDrag(e, element)`, `drag(e)`, `endDrag()`

**Initial positions (% of container):** `{15%,10%}`, `{25%,75%}`, `{50%,15%}`, `{60%,80%}`, `{75%,45%}`

**Touch support:** Handles both `mousedown/move/up` and `touchstart/move/end`. Touch coordinates are accessed via `e.touches[0]`. Position is constrained within the parent element bounds.

---

### 17. `MethodToggle` (main.js:2410–2555)

**Purpose:** Manages the Stardust/Horizon toggle in the Comet section. Tracks the active method, updates button ARIA states, and triggers a merge-explode animation on the 5 process images when switching methods.

**State:** `currentMethod` (`'stardust'` | `'horizon'`), `buttons[]`, `imageItems[]`, `isAnimating`

**Public methods:**

| Method | Signature | Purpose |
|---|---|---|
| `init()` | `init(): void` | Queries `.method-toggle-btn` and `.comet-image-item`; attaches click listeners; calls `randomizePositions()` after 100ms |
| `toggle(method)` | `toggle(string): void` | Guards double-toggle (`isAnimating`); updates button states; calls `animateMergeExplode()` |
| `animateMergeExplode()` | `animateMergeExplode(): void` | Phase 1 (0–600ms): adds `.merging` CSS class to all items, redraws connections at 60fps. Phase 2 (600ms): calls `randomizePositions()`, removes `.merging`, begins explode interval. Phase 3 (1200ms): clears interval, sets `isAnimating = false`, final `CometConnections.draw()` |
| `randomizePositions()` | `randomizePositions(): void` | Uses Fisher-Yates shuffle on 5 evenly-spaced base angles (0°, 72°, 144°, 216°, 288°) ±15° variation; places items at 35–45% radius from center using polar→cartesian conversion |
| `getCurrentMethod()` | `getCurrentMethod(): string` | Returns `this.currentMethod`; used by `StepPopup.open()` |

---

### 18. `PartnershipSlider` (main.js:2560–2598)

**Purpose:** Infinite horizontal logo scroll. Injects two sets of partner logo links into `#partnership-slideshow` to create a seamless CSS animation loop.

**State:** `container`, `logos[]` (5 placeholder entries with `src`, `alt`, `href`)

**Public methods:** `init()` — checks for `#partnership-slideshow`, creates a `.partnership-track` div, renders logos twice (first set + duplicate set), appends to container.

**Note:** The track animation (`partnership-track` keyframe) is CSS-driven; this module only generates the HTML.

---

### 19. `StepPopup` (main.js:2604–2711)

**Purpose:** Modal popup for step-by-step descriptions in the connected images section. Reads the active method from `MethodToggle` and the step number from the clicked item's `data-step` attribute to look up content in `STEP_DATA`.

**State:** `popup`, `overlay`, `content`, `closeBtn`, `title`, `description`, `isOpen`

**Public methods:**

| Method | Signature | Purpose |
|---|---|---|
| `init()` | `init(): void` | Queries `.step-popup` and related elements; attaches click + Enter/Space keyboard handlers to `.comet-image-item.clickable`; attaches close listeners |
| `open(step)` | `open(string): void` | Reads `MethodToggle.getCurrentMethod()`; looks up `STEP_DATA[method][step]`; populates title/description; adds `.active` to popup; GSAP `back.out(1.7)` scale-in animation |
| `close()` | `close(): void` | GSAP scale-out (0.2s); removes `.active` on complete |

**Close conditions:** overlay click, close button click, Escape key.

---

### 20. `init()` + `setInitialState()` (main.js:2716–2812)

**`setInitialState()` (lines 2716–2765):** Writes pixel-precise initial values to DOM before any scroll has occurred:
- `logoContainer`: 80px, rotated `totalRotations × 360°`
- `dotWhite`: positioned at top of start orbit (`y = centerY - startRadius`)
- `dotBlack`: positioned at bottom (`y = centerY + startRadius`)
- `finalDot`: `opacity: 0`, `.visible` class removed

**`init()` (lines 2770–2812):** Initialization sequence (order matters):
1. `setInitialState()`
2. `initWebGL()`
3. `initEventListeners()`
4. `initGSAPAnimations()`
5. `resize()`
6. `UnifiedStarfield.init()`
7. `MuseBackground.init()`
8. `MusePopup.init()`
9. `MuseScroll.init()` — delayed 100ms via `setTimeout` to allow layout to settle
10. `CometCollabBackground.init()`
11. `CometConnections.init()`
12. `FloatingProcesses.init()`
13. `MethodToggle.init()`
14. `PartnershipSlider.init()`
15. `StepPopup.init()`
16. `masterRender()` — starts the RAF loop

---

### 21. `window.switchTab()` (main.js:2821–2853)

**Purpose:** Global function for the Stardust/Horizon tab UI. Manages panel visibility and the sliding pill indicator between the two tabs.

**Signature:** `window.switchTab(method: 'stardust' | 'horizon'): void`

**Why global:** The tab buttons use inline `onclick="switchTab('stardust')"` HTML attributes, which require the function on `window`. This is the only intentional global export.

**Elements it operates on:** `#panel-stardust`, `#panel-horizon`, `#tab-stardust`, `#tab-horizon`, `#pillSlider`

**Behavior:**
- `'stardust'`: adds `.active` to stardust panel + tab, removes from horizon; removes `.right` from `#pillSlider`
- `'horizon'`: adds `.active` to horizon panel + tab, removes from stardust; adds `.right` to `#pillSlider`

---

## GSAP Patterns Used in This Codebase

### ScrollTrigger with scrub (scroll-driven animation)

```js
gsap.to(someState, {
  progress: 1,
  ease: 'none',
  scrollTrigger: {
    trigger: '.some-wrapper',
    start: 'top top',
    end: () => `top+=${window.innerHeight * 4}px top`,
    scrub: true,              // ties animation to scroll position, no snap
    invalidateOnRefresh: true, // recalculates on resize/refresh
    anticipatePin: 1,          // prevents flicker with pinned elements
    onUpdate: () => { /* called every scroll tick */ },
    onEnter: () => { /* called when scrolling into start */ },
    onLeave: () => { /* called when scrolling past end */ },
    onLeaveBack: () => { /* called when scrolling back before start */ },
  }
});
```

### ScrollTrigger with onEnter/onLeaveBack callbacks (instant toggle)

```js
ScrollTrigger.create({
  trigger: '#some-element',
  start: 'top 80%',
  invalidateOnRefresh: true,
  onEnter: () => {
    element.classList.add('visible');
  },
  onLeaveBack: () => {
    element.classList.remove('visible');
  }
});
```

### Timeline with stagger (sequential element animation)

```js
gsap.timeline({
  scrollTrigger: { trigger: '.wrapper', start: '...', end: '...', scrub: true }
})
.fromTo(elementA, { opacity: 0 }, { opacity: 1, ease: 'none' }, 0)  // position 0 = simultaneous
.fromTo(elementB, { opacity: 1 }, { opacity: 0, ease: 'none' }, 0)
.fromTo(elementC, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, ease: 'none' }, 0);
```

For staggered (not simultaneous) use the GSAP offset shorthand:
```js
tl.to(elementA, { opacity: 1, duration: 0.4 })
  .to(elementB, { opacity: 1, duration: 0.4 }, '-=0.2') // overlaps 0.2s
  .to(elementC, { opacity: 1, duration: 0.4, stagger: 0.1 }, '-=0.3');
```

### How to add a new scroll-driven animation (step by step)

1. Add the scroll range to `SCROLL_TIMING` in `main.js:94`:
   ```js
   MY_SECTION_START: 200,  // vh offset
   MY_SECTION_DURATION: 100,
   ```
2. Inside `initGSAPAnimations()`, add a new GSAP call:
   ```js
   gsap.fromTo(myElement,
     { opacity: 0 },
     {
       opacity: 1,
       scrollTrigger: {
         trigger: '.my-wrapper',
         start: `top+=${SCROLL_TIMING.MY_SECTION_START}vh top`,
         end: `top+=${SCROLL_TIMING.MY_SECTION_START + SCROLL_TIMING.MY_SECTION_DURATION}vh top`,
         scrub: true,
         invalidateOnRefresh: true,
         anticipatePin: 1,
       }
     }
   );
   ```
3. Ensure the wrapper element has matching `height` in CSS (use the same vh values).

---

## WebGL Patterns Used

### How a new WebGL canvas is initialized

```js
const MyModule = {
  canvas: null,
  gl: null,
  program: null,
  resUniform: null,
  timeUniform: null,

  init() {
    this.canvas = document.getElementById('my-canvas');
    if (!this.canvas) return;

    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
    if (!this.gl) return;

    this.resize();
    this.initShaders();
  },

  resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
    if (this.gl) this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  },

  initShaders() {
    const vertSrc = `attribute vec2 a_position; void main() { gl_Position = vec4(a_position, 0.0, 1.0); }`;
    const fragSrc = `
      precision highp float;
      uniform vec2 u_resolution;
      uniform float u_time;
      ${GLSL_UTILS.SIMPLEX_NOISE}
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        float aspect = u_resolution.x / u_resolution.y;
        vec2 uvAspect = vec2(uv.x * aspect, uv.y); // aspect correction
        // ... shader logic
        gl_FragColor = vec4(color, 1.0);
      }
    `;

    const vert = this.createShader(this.gl.VERTEX_SHADER, vertSrc);
    const frag = this.createShader(this.gl.FRAGMENT_SHADER, fragSrc);

    this.program = this.gl.createProgram();
    this.gl.attachShader(this.program, vert);
    this.gl.attachShader(this.program, frag);
    this.gl.linkProgram(this.program);

    const posAttr = this.gl.getAttribLocation(this.program, 'a_position');
    this.resUniform = this.gl.getUniformLocation(this.program, 'u_resolution');
    this.timeUniform = this.gl.getUniformLocation(this.program, 'u_time');

    // Full-screen quad (2 triangles, 6 vertices)
    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
      this.gl.STATIC_DRAW
    );
    this.gl.enableVertexAttribArray(posAttr);
    this.gl.vertexAttribPointer(posAttr, 2, this.gl.FLOAT, false, 0, 0);
  },

  createShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader error:', this.gl.getShaderInfoLog(shader));
      return null;
    }
    return shader;
  }
};
```

### The aspect-ratio UV correction pattern

All gradient/noise shaders in this codebase use:
```glsl
vec2 uv = gl_FragCoord.xy / u_resolution.xy;   // normalized 0–1, ignores aspect ratio
float aspect = u_resolution.x / u_resolution.y;
vec2 uvAspect = vec2(uv.x * aspect, uv.y);      // preserves circular shapes on any screen
```
Use `uvAspect` (not `uv`) whenever sampling noise or computing distances from a point. Use plain `uv` only for the star field (which intentionally tiles uniformly across both axes).

### How to add a new canvas to the master render loop

1. Implement `MyModule` following the pattern above (with `gl`, `program`, `resUniform`, `timeUniform`).
2. Call `MyModule.init()` inside `init()`.
3. Call `MyModule.resize()` inside `handleResize` in `initEventListeners()`.
4. Inside `masterRender()`, add before the final `requestAnimationFrame`:

```js
if (MyModule.gl && MyModule.program) {
  const myGL = MyModule.gl;
  if (lastActiveProgram !== MyModule.program) {
    myGL.useProgram(MyModule.program);
    lastActiveProgram = MyModule.program;
  }
  myGL.uniform2f(MyModule.resUniform, MyModule.canvas.width, MyModule.canvas.height);
  myGL.uniform1f(MyModule.timeUniform, time);
  myGL.drawArrays(myGL.TRIANGLES, 0, 6);
}
```

---

## How to Add a New Section

**Step 1 — Add SCROLL_TIMING constants** (`main.js:94`):
```js
MY_SECTION_START: 480,     // vh offset from wrapper top
MY_SECTION_DURATION: 150,  // vh
MY_SECTION_TOTAL: 630,     // wrapper total height
```

**Step 2 — Add DOM reference** (inside `elements` object at `main.js:248`, or query locally inside `initGSAPAnimations()`):
```js
const myElement = document.querySelector('.my-section');
```

**Step 3 — Add GSAP animation in `initGSAPAnimations()`** (follow existing patterns, use `SCROLL_TIMING` keys, always include `invalidateOnRefresh: true` and `anticipatePin: 1`).

**Step 4 — Add to `masterRender()` if WebGL is needed** (follow the pattern in the WebGL section above).

**Step 5 — Add CSS**: Set wrapper `height` to `${MY_SECTION_TOTAL}vh` and inner sticky container to `height: 100vh; position: sticky; top: 0`. See `docs/css-reference.md` for naming conventions.

---

## How to Add a New Muse

**Step 1 — Add to `DOT_COLORS`** (`main.js:163`):
```js
{ hex: '#AABBCC', r: 170, g: 187, b: 204 },  // index 7 - NewMuse
```

**Step 2 — Add to `CONSTELLATION_REF`** (`main.js:175`):
```js
{ x: 700 - 140, y: 400, z: 0.1 },  // index 7
```
Coordinates are in the 1400×800 virtual canvas. Use the coordinate-picker tool at `tools/coordinate-picker.html` to find values interactively.

**Step 3 — Add HTML orbit item**: Follow the pattern of existing `.muse-orbit-item` elements. Required attributes: `data-angle` (degrees, evenly spaced: `360/8 * index`), `data-color` (hex), `data-popup-title`. See `index.html` lines 95–171 for structure reference (`docs/html-reference.md` for detail).

**Step 4 — Add CSS variable for the aura**: In the muse popup CSS, add a color-specific aura rule. See `css/styles.css` Muse Popup section (`docs/css-reference.md`).

Also add a color entry in `MuseBackground.colors[]` (`main.js:1329`) and update the gradient shader's hardcoded color constants and the interpolation chain in `initShaders()` to include the new color.

---

## Rules (Never Break These)

**Never create a second RAF loop.** Always add new per-frame work inside `masterRender()`. Multiple `requestAnimationFrame` loops compound and destroy frame rate. The single loop reference in `masterRenderLoop` is the only one allowed.

**Never hardcode vh values in animations.** All scroll distances must come from `SCROLL_TIMING`. Hardcoded values break when timing is adjusted — the whole point of `SCROLL_TIMING` is a single source of truth.

**Never add `scroll-behavior: smooth` to `html {}`.** This interferes with GSAP ScrollTrigger's scroll normalization (`ScrollTrigger.normalizeScroll(true)`) and causes position calculation errors.

**DPR cap: `Math.min(devicePixelRatio, 2)`.** Never remove this from `resize()` (line 546). On 3× devices this reduces canvas pixel count by ~44% — removing it causes GPU memory spikes and frame drops on mobile.

**`ScrollTrigger.normalizeScroll(true)` must stay** (line 16). It is conditionally enabled on touch devices. Removing it breaks scroll position reading on iOS Safari.

**`window.switchTab` must stay global** (line 2821). The tab buttons use `onclick="switchTab('stardust')"` inline attributes. If you move this function inside the IIFE without a `window.` export, the inline handlers will silently fail.
