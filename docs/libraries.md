> UPDATED AT: 2026-05-10

# cocoex.xyz — Libraries & External Dependencies

## Dependency List

| Library | Version | Load method | CDN URL | Purpose |
|---------|---------|-------------|---------|---------|
| GSAP core | 3.12.5 | `<script>` at body end | `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js` | Scroll-driven animations, timelines, tweens |
| ScrollTrigger | 3.12.5 | `<script>` at body end | `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js` | Ties GSAP animations to scroll position |
| MotionPathPlugin | 3.12.5 | `<script>` at body end | `https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/MotionPathPlugin.min.js` | Registered at startup; not actively used in current animations |
| Adobe Fonts (Typekit) | — | `<link>` in `<head>` | `https://use.typekit.net/afs8ors.css` | Loads Canela / Canela Deck typeface |

Scripts are loaded at the **bottom of `<body>`** (index.html:462–466) so they execute after the DOM is parsed. `main.js` is the last script, which means `gsap`, `ScrollTrigger`, and `MotionPathPlugin` are all available as globals when the IIFE runs.

---

## GSAP 3.12.5

### Setup (main.js:13–17)

```javascript
gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  ScrollTrigger.normalizeScroll(true);
}
```

`ScrollTrigger.normalizeScroll(true)` is called **only on touch devices**. It replaces the browser's native scroll with a virtualised version that GSAP controls directly. This fixes the jittery scroll-position reads that occur on iOS Safari during momentum scrolling, where `window.scrollY` can jump between frames. Without it, scrubbed animations stutter on iPhone. The call is conditional so desktop browsers use native scroll (no unnecessary overhead).

`MotionPathPlugin` is registered here for completeness but no animation in the current codebase calls `motionPath:`. It can be removed if bundle size becomes a concern.

---

### ScrollTrigger — How It's Used Here

#### Basic scroll-driven animation pattern

The canonical pattern used throughout `initGSAPAnimations()` (main.js:971):

```javascript
gsap.to(element, {
  opacity: 1,
  scrollTrigger: {
    trigger: triggerElement,
    start: 'top 80%',
    end: 'bottom 60%',
    scrub: true,
    invalidateOnRefresh: true,
  }
});
```

Key options:

- **`scrub: true`** — Links animation progress directly to scroll position (1:1 mapping). Always use `true`, never a number. A number introduces a lag/ease on the scrub which fights the GSAP timeline easing and produces double-easing artefacts.
- **`invalidateOnRefresh: true`** — Forces GSAP to re-run the `start`/`end` callback functions every time `ScrollTrigger.refresh()` is called (on resize, orientation change, load). Required whenever `start`/`end` use arrow functions that read `window.innerHeight`, because the computed pixel value must update after viewport changes.
- **`anticipatePin: 1`** — Used on triggers that sit near pinned sections (Muse, Comet wrappers). Tells ScrollTrigger to account for pin reflow slightly early, preventing a one-frame pop when a pinned ancestor locks.

All `start`/`end` values that involve scroll distances read from `SCROLL_TIMING` — never use raw pixel numbers inline.

#### onEnter / onLeaveBack pattern (footer reveal)

Used when you need a binary state toggle rather than a continuous scrub (main.js:1078–1092):

```javascript
ScrollTrigger.create({
  trigger: '#horizon',
  start: 'top 80%',
  invalidateOnRefresh: true,
  anticipatePin: 1,
  onEnter: () => {
    socialLinks?.classList.add('visible');
    footerLogo?.classList.add('visible');
  },
  onLeaveBack: () => {
    socialLinks?.classList.remove('visible');
    footerLogo?.classList.remove('visible');
  }
});
```

`onEnter` fires once when the trigger element scrolls into the viewport from below. `onLeaveBack` fires when the user scrolls back up past the trigger. Use this pattern (not scrub) for CSS-class-driven transitions where the animation is handled entirely in CSS.

#### ScrollTrigger.refresh()

Called in three places (main.js:934, 941, 964):

```javascript
// After resize (debounced 150ms)
window.addEventListener('resize', debounce(() => {
  resize();
  ScrollTrigger.refresh();
}, 150), { passive: true });

// After orientation change (300ms delay for reflow)
window.addEventListener('orientationchange', () => {
  setTimeout(() => { ScrollTrigger.refresh(); }, 300);
});

// After full page load
window.addEventListener('load', () => { ScrollTrigger.refresh(); });
```

The 300ms delay on `orientationchange` is intentional: the browser takes a moment to commit the new viewport dimensions after rotation. Refreshing immediately reads stale values.

---

### GSAP Timeline pattern (popup open/close)

Timelines are used in the muse popup (main.js:1904–1982) to sequence multiple elements with overlap using position offsets (`'-=0.2'`):

```javascript
this.openTimeline = gsap.timeline({
  defaults: { ease: 'power3.out' }
});

this.openTimeline
  .to(this.popup,          { opacity: 1, duration: 0.4 })
  .to(this.imageContainer, { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.5)' }, '-=0.2')
  .to(this.content,        { scale: 1, opacity: 1, duration: 0.4 }, '-=0.4')
  .to(this.cause,          { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
  .to(this.text,           { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.3');
```

`defaults` in the timeline constructor sets shared options for every tween in that timeline. The `'-=0.2'` position parameter overlaps the previous tween by 0.2s.

The close timeline uses `stagger` (main.js:1958–1964) on an array of elements:

```javascript
this.closeTimeline
  .to([this.text, this.cause], {
    opacity: 0,
    y: -20,
    duration: 0.2,
    stagger: 0.05,   // 50ms between each element in the array
  })
  // ...
```

Always call `.kill()` on the opposing timeline before starting a new one (open kills closeTimeline, close kills openTimeline) to prevent conflicting tweens on the same properties.

---

### MotionPathPlugin

Registered at main.js:13 but **not used in any current animation**. No `motionPath:` property appears anywhere in the codebase. It was registered during an earlier development phase. Safe to leave registered (zero runtime cost when unused), but do not rely on it being present if you refactor the CDN imports.

---

### GSAP Rules for This Codebase

- Always use `scrub: true` for scroll-driven animations — never `scrub: 0.5` or any number.
- Always set `invalidateOnRefresh: true` on every ScrollTrigger that uses a computed `start` or `end`.
- Never set `scroll-behavior: smooth` in CSS alongside GSAP scroll control — they conflict and produce double-scroll artefacts.
- All timing lives in `SCROLL_TIMING` (main.js:94–122). Never hardcode pixel values in trigger `start`/`end`.
- `ScrollTrigger.normalizeScroll(true)` is set once at startup. Never call it again or conditionally toggle it.
- Kill timelines before creating the opposing one (open/close, enter/leave patterns).

---

## WebGL (Native Browser API)

### How WebGL is Used Here

Not a library. All WebGL code uses the native browser **WebGL 1.0** API (`getContext('webgl')`). There is no Three.js, Babylon, or any WebGL wrapper. Every canvas is managed by a plain JS object module with `init()`, `resize()`, `initShaders()`, and `createShader()` methods.

---

### The Standard Canvas Init Pattern

All WebGL modules follow this structure (shown from `MuseBackground.init()` and `MuseBackground.initShaders()`, main.js:1339–1454):

```javascript
init() {
  this.canvas = document.getElementById('muse-background-canvas');
  if (!this.canvas) return;

  this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl');
  if (!this.gl) return;

  this.resize();
  this.initShaders();
  // Rendering is handled by masterRender() — do NOT start a RAF loop here
},

initShaders() {
  // 1. Write vertex and fragment shader source strings
  const vertexShaderSource = `
    attribute vec2 a_position;
    void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
  `;
  const fragmentShaderSource = `...`;

  // 2. Compile shaders
  const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
  const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);

  // 3. Link program
  this.program = this.gl.createProgram();
  this.gl.attachShader(this.program, vertexShader);
  this.gl.attachShader(this.program, fragmentShader);
  this.gl.linkProgram(this.program);

  // 4. Get attribute and uniform locations
  const posAttr = this.gl.getAttribLocation(this.program, 'a_position');
  this.resUniform  = this.gl.getUniformLocation(this.program, 'u_resolution');
  this.timeUniform = this.gl.getUniformLocation(this.program, 'u_time');

  // 5. Create a full-screen triangle-pair buffer (covers the clip-space quad)
  const buffer = this.gl.createBuffer();
  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
  this.gl.bufferData(
    this.gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
    this.gl.STATIC_DRAW
  );
  this.gl.enableVertexAttribArray(posAttr);
  this.gl.vertexAttribPointer(posAttr, 2, this.gl.FLOAT, false, 0, 0);
}
```

The two triangles (`[-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]`) form a quad that covers the entire clip space. Every fragment shader runs on the full canvas — this is the standard fullscreen shader pattern.

---

### GLSL Utilities (main.js:22–89)

Defined once in `GLSL_UTILS` and injected into fragment shaders via template literals (`${GLSL_UTILS.SIMPLEX_NOISE}`).

#### SIMPLEX_NOISE (main.js:24–51)

A 2D simplex noise implementation. Signature: `float snoise(vec2 v)`. Returns values roughly in the range `[-1.0, 1.0]`. Use it in a fragment shader:

```glsl
${GLSL_UTILS.SIMPLEX_NOISE}  // injected via template literal

// Inside main():
float n = snoise(uvAspect * 2.0 + vec2(u_time * 0.3, u_time * 0.2));
n = n * 0.5 + 0.5; // remap to [0, 1]
```

Used by: intro starfield shader (`#bg-canvas`), MuseBackground gradient, CometCollabBackground gradient.

#### STAR_FIELD (main.js:54–88)

Renders 4 layers of twinkling stars using a hash-based grid. Signature: `float stars(vec2 uv, float time)`. Returns a brightness value to add to the final colour.

```glsl
${GLSL_UTILS.STAR_FIELD}

// Inside main():
float starLight = stars(uv, u_time);
brightness += starLight * 0.25;
```

The `uv` passed to `stars()` uses the **raw** normalised UV (not aspect-corrected) so stars tile evenly regardless of viewport shape. Used by: intro starfield (`#bg-canvas`), UnifiedStarfield (`#unified-starfield-canvas`).

---

### The Aspect-Ratio UV Correction Pattern

Applied in every fragment shader that samples noise or measures distance from a point (main.js:417–418, 1391–1392):

```glsl
vec2 uv = gl_FragCoord.xy / u_resolution.xy;
float aspect = u_resolution.x / u_resolution.y;
vec2 uvAspect = vec2(uv.x * aspect, uv.y);

// Use uvAspect for all noise and distance calculations
float noise = snoise(uvAspect * 2.0 + u_time * 0.1);
```

Without this, noise patterns and circular effects get squashed on portrait viewports (e.g. on mobile, a noise circle becomes a tall oval). `uvAspect` stretches the x-axis to compensate, preserving circular shapes. Do not use `uvAspect` for tiling patterns that should fill the screen uniformly (like the star grid) — use raw `uv` there.

---

### Standard Uniforms Used

| Uniform | Type | Purpose | Shaders |
|---------|------|---------|---------|
| `u_resolution` | `vec2` | Canvas pixel dimensions (after DPR scaling) | All shaders |
| `u_time` | `float` | Elapsed seconds since `startTime` | All shaders |
| `u_pulse` | `float` | Big bang pulse progress (0–1); drives dispersive wave | Intro starfield only (`#bg-canvas`) |

`u_pulse` is set to 0 when inactive. The shader early-exits the pulse block: `if (u_pulse > 0.0) { ... }`. Update it via `gl.uniform1f(pulseUniform, pulseValue)` in `masterRender()`.

---

### DPR Capping Pattern

The intro canvases cap DPR on mobile (main.js:544–546):

```javascript
const baseDPR = window.devicePixelRatio || 1;
const dpr = isMobile() ? Math.min(baseDPR, 2) : baseDPR;

elements.bgCanvas.width  = w * dpr;
elements.bgCanvas.height = h * dpr;
gl.viewport(0, 0, elements.bgCanvas.width, elements.bgCanvas.height);
```

Modern phones ship with 3× DPR. Rendering a full WebGL shader at 3× means 9× the pixel count of a 1× screen. Capping at 2× reduces that to 4× — a 33% pixel-fill saving with negligible visual difference for animated noise/star content. Desktop is uncapped (`baseDPR` used directly) because memory and GPU headroom are larger.

Note: `MuseBackground`, `UnifiedStarfield`, and `CometCollabBackground` use `window.devicePixelRatio || 1` without capping (main.js:1352, 1490, 1601). If mobile performance is a concern on those canvases, apply the same `Math.min(baseDPR, 2)` cap.

---

### Master Render Loop

All WebGL rendering is consolidated into a single RAF loop: `masterRender()` at main.js:825. It runs every frame and draws all four active canvases in sequence.

```javascript
function masterRender() {
  if (!isPageVisible || webglContextsLost) {
    masterRenderLoop = requestAnimationFrame(masterRender);
    return; // skip heavy work when tab is hidden
  }

  const time = (Date.now() - startTime) / 1000;

  // Intro canvas
  if (gl && program) {
    if (lastActiveProgram !== program) {
      gl.useProgram(program);
      // ... bind buffer, set attrib ...
      lastActiveProgram = program;
    }
    gl.uniform2f(resUniform, ...);
    gl.uniform1f(timeUniform, time);
    gl.uniform1f(pulseUniform, pulseValue);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  // MuseBackground, UnifiedStarfield, CometCollabBackground follow same pattern
  // ...

  masterRenderLoop = requestAnimationFrame(masterRender);
}
```

**Never create a second `requestAnimationFrame` loop.** Add new WebGL canvases inside `masterRender()`. The `lastActiveProgram` cache prevents redundant `gl.useProgram()` calls — only switch programs when the program reference actually changes. The loop also pauses when the tab is hidden (Page Visibility API) to save battery.

---

### WebGL Rules for This Codebase

- All canvases render inside `masterRender()` — no standalone RAF loops.
- DPR is capped with `Math.min(devicePixelRatio, 2)` on mobile for the intro canvases.
- Always use the `uvAspect` pattern in fragment shaders for noise and distance calculations.
- Cache `lastActiveProgram` — only call `gl.useProgram()` when the program changes.
- Always handle context loss: listen for `webglcontextlost` / `webglcontextrestored` events and set `webglContextsLost` accordingly (pattern shown in `initWebGL()`, main.js:488–510).
- Inject shared GLSL via `${GLSL_UTILS.SIMPLEX_NOISE}` and `${GLSL_UTILS.STAR_FIELD}` — never copy-paste the functions into a new shader.

---

## Adobe Fonts (Typekit)

### Setup (index.html:11)

```html
<link rel="stylesheet" href="https://use.typekit.net/afs8ors.css">
```

Typekit kit ID: `afs8ors`. The `<link>` is placed in `<head>` before `styles.css` so the font is available before layout.

### Font Used

- Family: Canela / Canela Deck
- Weights loaded: 400 (Regular), 700 (Bold)
- CSS declaration: `--font-canela: 'canela', Georgia, serif` (styles.css `:root`)
- Fallback stack: Georgia, serif

### Usage Rules

- Always reference via the CSS variable: `font-family: var(--font-canela)` — never write `'canela'` directly in a rule.
- The fallback is always a serif face. Never substitute sans-serif — Canela is a serif display typeface and the design depends on it.
- DM Serif Display is a retired placeholder from an earlier iteration — never use it.
- If Canela becomes unavailable, replace the Typekit `<link>` with a Google Fonts `<link>` serving a comparable serif. Never use `@import` inside CSS files (blocks render).

---

## No Other Dependencies

This is a zero-framework, zero-bundler static site.

- No React, Vue, Angular, or any component framework.
- No jQuery.
- No CSS framework (no Tailwind, Bootstrap, or utility-class library).
- No build step: no webpack, Vite, Rollup, Parcel, or esbuild.
- No `package.json`, no `node_modules`.
- No transpilation: the JavaScript is vanilla ES6+ and runs directly in the browser.

To run locally, open `index.html` directly in a browser or serve from a local server:

```bash
python3 -m http.server 8000
# or
npx serve . -l 8000
# then open http://localhost:8000
```
