# cocoex.xyz - Technical Specification & Expected Behavior

**Version:** 1.0
**Last Updated:** March 16, 2026
**Purpose:** Technical review, bug testing, and implementation verification

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Section Breakdown & Expected Behavior](#section-breakdown--expected-behavior)
5. [WebGL Implementation](#webgl-implementation)
6. [Animation System](#animation-system)
7. [Interactive Features](#interactive-features)
8. [Performance Expectations](#performance-expectations)
9. [Browser Compatibility](#browser-compatibility)
10. [Known Limitations](#known-limitations)
11. [Testing Checklist](#testing-checklist)

---

## Project Overview

### Description
Static portfolio website for cocoex e.V., a DAO blending art, blockchain, community, and social impact. The site showcases:
- **Muse**: 7 planetary muses representing global causes
- **Comet Collab**: Ecosystem connecting artists, collectors, activists (Stardust & Horizon methods)
- **Events**: Partnership showcases, campaigns, and future lab projects

### Core Values
- **Usability**: Intuitive navigation, accessible interactions
- **Design**: Minimalist aesthetic, fluid animations
- **Minimalism**: Question every element, white space as feature

### Total Scroll Height
**~1350vh** (13.5× viewport height):
- Landing (Intro): 400vh
- Text Section: 150vh
- Muse Intro: 350vh
- Muse Orbiting: 120vh
- Comet Intro: 360vh
- Comet Methods: 120vh
- Events: 100vh+ (content-based)

---

## Tech Stack

### Core Technologies
```
HTML5          - Semantic markup, 327 lines
CSS3           - Custom properties, Grid/Flexbox, 1,900+ lines
Vanilla JS     - ES6+ IIFE pattern, 2,400+ lines
GSAP 3.12.5    - ScrollTrigger for scroll-driven animations
WebGL          - Custom GLSL shaders for visual effects
```

### No Frameworks
- Pure vanilla JavaScript (no React, Vue, etc.)
- No CSS frameworks (no Tailwind, Bootstrap)
- No animation libraries beyond GSAP
- Static site (no build process required)

### External Dependencies
```html
<!-- GSAP CDN (only external dependency) -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js"></script>

<!-- Adobe Fonts (Canela typeface) -->
<link rel="stylesheet" href="https://use.typekit.net/nvc8nhy.css">
```

### Bundle Sizes
```
HTML:  10.2KB uncompressed (~3.5KB gzipped)
CSS:   26KB uncompressed (~7KB gzipped)
JS:    68KB uncompressed (~18KB gzipped)
GSAP:  47KB (cached after first load)
Total: ~151KB uncompressed (~85KB gzipped)
Images: ~1MB (lazy loaded)
```

---

## Architecture

### JavaScript Module Pattern

```javascript
(function() {
  'use strict';

  // 1. GLSL UTILITIES - Shared shader code
  const GLSL_UTILS = { ... }

  // 2. SCROLL TIMING - Centralized timing constants
  const SCROLL_TIMING = { ... }

  // 3. CONFIGURATION - Colors, data, constants
  const CONFIG = { ... }

  // 4. DOM REFERENCES - Cached selectors
  const dom = { ... }

  // 5. STATE VARIABLES - Runtime state
  let pulseValue = 0;

  // 6. UTILITY FUNCTIONS
  function debounce() { ... }

  // 7. MODULES
  const IntroCanvas = { ... }
  const ConstellationCanvas = { ... }
  const MuseBackground = { ... }
  // ... etc

  // 8. INITIALIZATION
  window.addEventListener('load', init);

})();
```

### Key Patterns

**IIFE (Immediately Invoked Function Expression)**
- Encapsulates all code
- Prevents global scope pollution
- Single entry point: `init()`

**Module Objects**
```javascript
const ModuleName = {
  // Properties
  canvas: null,
  ctx: null,
  isInitialized: false,

  // Methods
  init() { ... },
  resize() { ... },
  render() { ... },
  cleanup() { ... }
};
```

**Master Render Loop**
- Single `requestAnimationFrame` loop
- Consolidates all WebGL/canvas animations
- Pauses when tab hidden (battery optimization)
- ~60fps target

**Centralized Timing**
- All scroll ranges in `SCROLL_TIMING` object
- Easy to adjust animation durations
- Single source of truth

---

## Section Breakdown & Expected Behavior

### Section 1: Landing (Intro) - 400vh

**Scroll Range:** 0-400vh
**Element:** `.intro`
**Position:** Fixed overlay

#### Phase 1: Orbiting Dots (0-160vh / 0-40%)

**Expected Behavior:**
- 2 dots orbit center in ellipse pattern:
  - White dot (right start)
  - Black dot (left start)
- Logo scales from 80px → 250px
- Logo completes 2 full rotations (720°)
- Smooth interpolation via GSAP ScrollTrigger
- 60fps scroll scrubbing

**Visual Elements:**
- WebGL starfield background (twinkling stars)
- Simplex noise for star movement
- Big bang pulse effect (dispersive wave)

**Expected Interactions:**
- Scroll down: Dots converge to center
- Scroll up: Dots return to orbit
- No click/touch interactions

**Bug Check:**
- [ ] Dots maintain ellipse shape at all viewport sizes
- [ ] Logo rotation is smooth (no jumps)
- [ ] Starfield renders on all devices
- [ ] No performance drops below 30fps

#### Phase 2: Transition Text (160-200vh / 40-50%)

**Expected Behavior:**
- Text appears at 76% orbit completion (152vh)
- Content: "art as infrastructure for change"
- Fades in below logo (opacity 0 → 1)
- Fades out before explosion (opacity 1 → 0)
- Position: Below logo, centered

**Bug Check:**
- [ ] Text appears at correct scroll position
- [ ] Text is legible (sufficient contrast)
- [ ] Fade timing is smooth

#### Phase 3: Constellation Explosion (200-400vh / 50-100%)

**Expected Behavior:**
- 7 colored dots explode from center
- Each dot assigned muse color:
  - Lunes: `#5783A6` (blue)
  - Ares: `#D54D2E` (red)
  - Rabu: `#8CB07F` (green)
  - Thunor: `#F8D86A` (yellow)
  - Shukra: `#5E47A1` (purple)
  - Dosei: `#7F49A2` (violet)
  - Solis: `#D48348` (orange)
- Z-depth rendering (-0.5 to 0.6 range)
- Continuous 15° rotation
- Big bang pulse continues (dispersive wave)

**Canvas:** `#constellation-canvas`
**Z-index:** 4 (above starfield)

**Bug Check:**
- [ ] All 7 dots visible and colored correctly
- [ ] Explosion spreads outward smoothly
- [ ] Rotation is consistent
- [ ] Canvas scales to viewport

---

### Section 2: Text Reveal - 150vh

**Scroll Range:** 400-550vh
**Element:** `.text-section-wrapper`
**Position:** Sticky, full viewport

**Expected Behavior:**
- Simple fade-in (opacity 0 → 1)
- No word-by-word highlighting
- Italic styling on key phrases
- Content:
  - cocoex mission statement
  - Comet Collab overview
  - Stardust/Horizon intro
  - Muse framework teaser

**Typography:**
- Font: Canela Regular 400
- Size: `clamp(20px, 2.5vw, 36px)`
- Transform: Uppercase
- Alignment: Justified

**Bug Check:**
- [ ] Text fades in smoothly
- [ ] All text readable at all viewport sizes
- [ ] No layout shifts during fade
- [ ] Scroll scrubbing is smooth

---

### Section 3: Muse Intro Page - 350vh

**Scroll Range:** 550-900vh
**Element:** `.muse-intro-page`
**Position:** Fixed overlay

**Expected Behavior:**
- Black inverted Muse logo (centered)
- Fades in at 80% viewport entrance (550vh)
- Holds for 350vh
- Crossfades out during transition to orbiting (120vh blend)

**Content Structure:**
```
TOP TEXT
--------
Overview of Muse framework
(what Muse represents)

CENTERED LOGO
-------------
Black inverted Muse logo

BOTTOM TEXT
-----------
Seven muses introduction
with hollow "Muse" text effect
```

**Hollow Text Effect:**
- Class: `.highlight-muse`
- Style: Transparent fill, white stroke
- Applied to word "Muse"

**Bug Check:**
- [ ] Logo is centered vertically and horizontally
- [ ] Text is readable (contrast check)
- [ ] Crossfade is smooth (no flicker)
- [ ] Hollow text effect renders correctly

---

### Section 4: Muse Orbiting - 120vh

**Scroll Range:** 900-1020vh
**Element:** `.muse-section`
**Position:** Sticky content

**Expected Behavior:**

#### Central Logo
- White Muse logo (centered)
- Size: `clamp(150px, 20vw, 300px)`
- Always visible
- No animation (static position)

#### 7 Orbiting Muses
- Continuous 240-second rotation cycle
- Ellipse orbit (adaptive to viewport):
  - **Mobile (≤768px)**: Vertical ellipse (0.35 radius, 1.8× taller)
  - **Tablet (768-1024px)**: Slightly vertical (0.30 radius, 1.4× taller)
  - **Desktop (>1024px)**: Horizontal ellipse (0.30 radius, 1.8× wider)

**Each Muse Contains:**
- Colored planet image
- Name (colored text, uppercase)
- Cause subtitle (hidden)

**Muse Data:**
```
1. Lunes   (#5783A6)  - 0°    - Water
2. Ares    (#D54D2E)  - 51.43° - Reforestation
3. Rabu    (#8CB07F)  - 102.86° - Human Rights
4. Thunor  (#F8D86A)  - 154.29° - Renewable Energy
5. Shukra  (#5E47A1)  - 205.71° - Bio-diversity
6. Dosei   (#7F49A2)  - 257.14° - Zero Hunger
7. Solis   (#D48348)  - 308.57° - Well-being
```

**Background Effects:**
- WebGL animated gradient (7-color simplex noise blend)
- Unified starfield canvas (shared layer)
- Hardware-accelerated rotation

**Bug Check:**
- [ ] All 7 muses visible and colored correctly
- [ ] Rotation is smooth and consistent
- [ ] Orbit maintains ellipse shape at all sizes
- [ ] No layout breaks on viewport resize
- [ ] Gradient animates without stuttering

#### Interactive: Muse Popup Modal

**Trigger:** Click muse image or name
**Keyboard:** Tab to navigate, Enter to open, Escape to close

**Expected Behavior:**
- Modal opens with smooth entrance animation
- Background overlay (blur + darken)
- Colored aura effect (matches muse color)
- 12 floating particles (circular motion)
- Content:
  - Large muse image
  - Muse name (colored, uppercase)
  - Cause subtitle
  - Description text
  - Close button (X)

**Entrance Animation:**
- Overlay fades in (0.3s)
- Content scales in (0.4s, overshoot)
- Particles fade in staggered (0.1s delay each)

**Exit Animation:**
- Content scales out (0.3s)
- Overlay fades out (0.2s)
- Particles removed

**Close Methods:**
1. Click X button
2. Click outside modal
3. Press Escape key

**Bug Check:**
- [ ] Modal opens on click/Enter
- [ ] Correct muse data displayed
- [ ] Aura color matches muse color
- [ ] Particles animate smoothly
- [ ] Modal closes via all 3 methods
- [ ] Focus returns to trigger element on close
- [ ] Scroll is locked when modal open

---

### Section 5: Comet Collab Intro - 360vh

**Scroll Range:** 1020-1380vh
**Element:** `.comet-collab-intro`
**Position:** Sticky

**Scroll Breakdown:**
- 0-100vh: Static intro
- 100-280vh: Logo descent animation (180vh)
- 280-360vh: Bottom hold (80vh)
- 360-480vh: Crossfade to methods (120vh)

#### Logo Descent Animation

**Expected Behavior:**
- Logo starts at center
- Moves from center → bottom over 180vh
- Text content moves up
- Smooth, reversible on scroll up

**Logo Size:**
- CSS Variable: `--comet-logo-size`
- Value: `clamp(180px, 25vw, 320px)`
- Larger than before (increased March 16, 2026)

**Content:**
```
CENTERED LOGO (descends)
------------------------
White Comet Collabs logo

TEXT CONTENT (moves up)
-----------------------
"Comet Collab is the ecosystem where artists,
collectors, activists, and communities converge
through STARDUST AND HORIZON, guided by Muse,
in a continuous loop of creation and impact."
```

**Text Styling:**
- "Stardust and Horizon": Uppercase, normal weight (not italic)
- Matches rest of paragraph style
- No shine animation (removed March 16, 2026)

#### Floating Draggable Process Images

**Expected Behavior:**
- 5 process images float on screen
- Initial positions (percentage-based):
  1. Top-left (15%, 10%)
  2. Top-right (25%, 75%)
  3. Mid-left (50%, 15%)
  4. Mid-right (60%, 80%)
  5. Bottom-center (75%, 45%)

**Visual Style:**
- Inverted colors (white on dark background)
- Size: `clamp(80px, 12vw, 140px)` desktop
- Size: `clamp(60px, 15vw, 100px)` mobile
- Floating animation (6s up/down, staggered delays)
- Drop shadow: `rgba(255, 255, 255, 0.3)`

**Interaction:**
- Draggable via mouse (desktop)
- Draggable via touch (mobile)
- Cursor: `grab` → `grabbing`
- Scale: 1.05× on active drag
- Constrained within parent bounds
- Animation pauses while dragging
- Animation resumes on release

**Image Files:**
```
assets/images/comet-collabs/process-one.png
assets/images/comet-collabs/process-two.png
assets/images/comet-collabs/process-three.png
assets/images/comet-collabs/process-four.png
assets/images/comet-collabs/process-five.png
```

**Bug Check:**
- [ ] All 5 images visible and inverted (white)
- [ ] Images can be dragged with mouse
- [ ] Images can be dragged with touch
- [ ] Images stay within bounds
- [ ] Floating animation is smooth
- [ ] No scroll conflict on touch drag
- [ ] Images return to floating after drag release

**Background:**
- WebGL gradient (same shader as Muse section)
- Unified starfield beneath

---

### Section 6: Comet Collab Methods - 120vh

**Scroll Range:** 1380-1500vh
**Element:** `.comet-collab-methods`
**Position:** Sticky

**Expected Behavior:**
- Crossfades in from intro (120vh transition)
- Toggle pill centered at top
- Active panel displayed below

#### Toggle Pill

**Structure:**
```
┌─────────────────────────────┐
│ [I · Stardust] [II · Horizon]│
└─────────────────────────────┘
     ^^^^^^^^^^^^
     Animated slider
```

**Expected Behavior:**
- Pill background: `rgba(255, 255, 255, 0.1)` + blur
- Active button: White background
- Inactive button: Transparent
- Slider animates position on switch (0.3s ease)
- Click switches between methods

**Bug Check:**
- [ ] Pill is centered horizontally
- [ ] Slider animates smoothly
- [ ] Active state updates correctly
- [ ] Click switches panels

#### Method Panels

**Stardust Panel:**
```
COMET COLLAB I
STARDUST

Artists select a cause, create a work, and launch
a fundraising campaign through its sale — funds split
between artist and NGO, facilitated by cocoex.
The art is the vehicle. The impact is the destination.

[View campaigns →]

STEPS:
01 - Choose: Select a cause that resonates
02 - Partner: Connect with an NGO
03 - Create: Transform it into art — any form, any medium
04 - Raise: Launch the fundraising campaign through sales and events
05 - Impact: Funds reach the chosen organisation. cocoex does not profit.
```

**Horizon Panel:**
```
COMET COLLAB II
HORIZON

Communities design their own futures through
4 steps of the Horizon method — from critique
to realization. Vision becomes art. Art becomes change.

[Explore projects →]

STEPS:
01 - Critique: Analyze current reality
02 - Dream: Envision the future
03 - Design: Plan the transformation
04 - Realize: Bring the vision to life
```

**Panel Switching:**
- Fade out current panel (0.4s)
- Fade in new panel (0.4s)
- No layout shift

**Bug Check:**
- [ ] Only one panel visible at a time
- [ ] Panel content displays correctly
- [ ] Steps are numbered and formatted
- [ ] CTA buttons are visible
- [ ] Panel switches smoothly

---

### Section 7: Events Page - 100vh+

**Scroll Range:** 1500vh+
**Element:** `.events-page-wrapper`
**Position:** Relative (natural flow)

**Height:** `min-height: 100vh` (reduced March 16, 2026)

**Expected Behavior:**
- Black background
- Starfield canvas (landing style)
- Content sections:
  1. Partnership slideshow
  2. Stardust campaigns
  3. Horizon projects

#### Partnership Slideshow

**Expected Behavior:**
- Title: "Partnership"
- Auto-scrolling horizontal slideshow
- Partner logos displayed
- Infinite loop
- Smooth scroll animation

**Bug Check:**
- [ ] Slideshow auto-scrolls
- [ ] Logos are visible and sized correctly
- [ ] Loop is seamless
- [ ] No layout breaks

#### Stardust Campaigns

**Expected Behavior:**
- Section label: "Stardust" (white, 28% opacity)
- Headline: "Where art meets cause."
- Campaign cards displayed
- Dynamic content loaded

**Bug Check:**
- [ ] Section is visible
- [ ] Cards render correctly
- [ ] Content is readable

#### Horizon Projects

**Expected Behavior:**
- Section label: "Horizon · Future Lab"
- Headline: "Communities designing their own futures."
- Project cards displayed

**Bug Check:**
- [ ] Section is visible
- [ ] Cards render correctly

---

## WebGL Implementation

### Active Canvases (4 Total)

```javascript
1. Intro Starfield     - #bg-canvas
2. Constellation       - #constellation-canvas
3. Unified Starfield   - #unified-starfield-canvas
4. Muse/Comet Gradient - #muse-background-canvas
                         #comet-collab-background-canvas (same shader)
```

### Shader Programs (3 Unique)

#### 1. Intro Starfield + Pulse

**Canvas:** `#bg-canvas`
**Position:** Fixed, z-index 1

**Features:**
- Twinkling stars (200 total)
- Simplex noise for organic movement
- Big bang pulse effect (dispersive wave)
- Star brightness variation

**Vertex Shader:**
```glsl
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
```

**Fragment Shader:**
```glsl
uniform vec2 u_resolution;
uniform float u_time;
uniform float u_pulse;

// Simplex noise function
// Star generation with early exit
// Twinkling effect (sin wave)
// Pulse wave effect (dispersive)
```

**Expected Behavior:**
- Stars twinkle at varying speeds
- Pulse radiates from center on scroll
- Smooth 60fps rendering
- Scales to device pixel ratio

**Bug Check:**
- [ ] Stars visible and twinkling
- [ ] Pulse effect triggers during explosion
- [ ] No WebGL errors in console
- [ ] Performance stays above 30fps

#### 2. Unified Starfield

**Canvas:** `#unified-starfield-canvas`
**Position:** Fixed, z-index 1 (beneath Muse/Comet sections)

**Features:**
- Static starfield (no pulse)
- Shared between Muse and Comet sections
- Same star generation algorithm

**Expected Behavior:**
- Stars appear during Muse/Comet sections
- Continuous across both sections
- Layered beneath gradient canvases

**Bug Check:**
- [ ] Stars visible in Muse section
- [ ] Stars visible in Comet section
- [ ] No flicker between sections

#### 3. Animated Gradient (Muse/Comet)

**Canvases:**
- `#muse-background-canvas` (Muse section)
- `#comet-collab-background-canvas` (Comet intro)
- `#comet-collab-background-canvas-2` (Comet methods)

**Colors (7 Muse Colors):**
```javascript
const vec3 color1 = vec3(0.34, 0.51, 0.65); // Lunes
const vec3 color2 = vec3(0.84, 0.30, 0.18); // Ares
const vec3 color3 = vec3(0.55, 0.69, 0.50); // Rabu
const vec3 color4 = vec3(0.97, 0.85, 0.42); // Thunor
const vec3 color5 = vec3(0.37, 0.28, 0.63); // Shukra
const vec3 color6 = vec3(0.50, 0.29, 0.64); // Dosei
const vec3 color7 = vec3(0.83, 0.51, 0.28); // Solis
```

**Fragment Shader:**
```glsl
uniform vec2 u_resolution;
uniform float u_time;

// Simplex noise (3D)
// Multi-octave noise layers
// 7-zone color blending
// Strength: 15% (subtle)
```

**Expected Behavior:**
- Slow, organic color movement
- 7 colors blend smoothly
- Subtle effect (15% strength)
- Continuous animation

**Bug Check:**
- [ ] Gradient visible and animating
- [ ] All 7 colors appear over time
- [ ] No harsh color transitions
- [ ] Performance stable

### WebGL Optimizations

**Device Pixel Ratio Capping:**
```javascript
const dpr = Math.min(window.devicePixelRatio, 2);
canvas.width = canvas.clientWidth * dpr;
canvas.height = canvas.clientHeight * dpr;
```

**Program State Caching:**
```javascript
let lastActiveProgram = null;
if (lastActiveProgram !== program) {
  gl.useProgram(program);
  lastActiveProgram = program;
}
```

**Master Render Loop:**
```javascript
function masterRender() {
  if (!isPageVisible || webglContextsLost) return;

  IntroCanvas.render();
  ConstellationCanvas.render();
  MuseBackground.render();
  UnifiedStarfield.render();
  CometCollabBackground.render();
  MuseScroll.updateOrbitPositions();

  masterRenderLoop = requestAnimationFrame(masterRender);
}
```

**Expected Behavior:**
- Single RAF loop consolidates all animations
- Pauses when tab hidden (battery save)
- Program switches minimized
- DPR capped at 2× on mobile (33% pixel reduction)

**Bug Check:**
- [ ] All WebGL canvases render in sync
- [ ] Rendering pauses when tab hidden
- [ ] No duplicate RAF loops
- [ ] Memory usage stable (50-70MB)

---

## Animation System

### GSAP ScrollTrigger

**All scroll-driven animations use GSAP ScrollTrigger with:**
```javascript
{
  scrub: true,           // Smooth 60fps scrubbing
  invalidateOnRefresh: true, // Recalculate on resize
  anticipatePin: 1       // Prevent layout shift
}
```

### Animation Timeline

| Scroll Position (vh) | Section | Animation |
|---------------------|---------|-----------|
| 0-160 | Intro | Orbiting dots convergence |
| 152-200 | Intro | Transition text fade in/out |
| 200-400 | Intro | Constellation explosion |
| 400-550 | Text | Simple fade-in |
| 550-900 | Muse Intro | Crossfade in/hold/out |
| 900-1020 | Muse Orbit | Continuous rotation (240s) |
| 1020-1100 | Comet Intro | Static hold |
| 1100-1280 | Comet Intro | Logo descent + text rise |
| 1280-1360 | Comet Intro | Bottom hold |
| 1360-1480 | Comet Methods | Crossfade + panel display |
| 1480+ | Events | Natural scroll |

### Hardware Acceleration

**Only animate transform/opacity:**
```css
.animated-element {
  will-change: transform, opacity;
  transform: translate3d(0, 0, 0); /* Force GPU layer */
}
```

**Never animate:**
- `width`, `height`
- `top`, `left`, `right`, `bottom`
- `margin`, `padding`
- `color`, `background-color` (except via opacity)

### Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Desktop FPS | 60fps | All animations |
| Mobile FPS | 30fps+ | WebGL may throttle |
| Scroll scrub | 60fps | GSAP interpolation |
| Master loop | 16.67ms | 60fps frame budget |

**Bug Check:**
- [ ] Scroll is smooth (no jank)
- [ ] No layout shifts during animations
- [ ] FPS stays within targets
- [ ] `will-change` applied to animated elements

---

## Interactive Features

### 1. Muse Popup Modal

**Trigger:** Click/tap muse image or name
**Module:** `MusePopup`

**Expected Behavior:**
- Opens with GSAP timeline:
  1. Overlay fade in (0.3s)
  2. Content scale in (0.4s, overshoot)
  3. Particles fade in staggered (0.1s delay)
- Closes with GSAP timeline:
  1. Content scale out (0.3s)
  2. Overlay fade out (0.2s)
- Focus management:
  - Focus trapped inside modal
  - Focus returns to trigger on close
- Scroll lock:
  - Body scroll disabled when open
  - Modal content scrollable if needed

**Keyboard Navigation:**
```
Tab       - Navigate between muses
Enter     - Open focused muse popup
Escape    - Close popup
Shift+Tab - Navigate backward
```

**Bug Check:**
- [ ] Modal opens on click/Enter
- [ ] Modal closes on X/outside click/Escape
- [ ] Focus is trapped in modal
- [ ] Focus returns to trigger on close
- [ ] Body scroll is locked
- [ ] Particles animate correctly
- [ ] Aura color matches muse

### 2. Floating Process Images Drag

**Elements:** `.floating-process` (5 total)
**Module:** `FloatingProcesses`

**Expected Behavior:**

**Mouse (Desktop):**
- Mousedown starts drag
- Mousemove updates position
- Mouseup ends drag

**Touch (Mobile/Tablet):**
- Touchstart starts drag
- Touchmove updates position
- Touchend ends drag
- Prevents default scroll behavior

**During Drag:**
- Cursor changes to `grabbing`
- Element scales to 1.05×
- Floating animation disabled
- Position constrained to parent bounds

**After Drag:**
- Cursor returns to `grab`
- Scale returns to 1×
- Floating animation resumes

**Bug Check:**
- [ ] Images respond to mouse drag
- [ ] Images respond to touch drag
- [ ] No scroll conflict on mobile
- [ ] Images stay within bounds
- [ ] Animation resumes after drag
- [ ] Cursor changes correctly

### 3. Comet Method Toggle

**Element:** `.comet-pill`
**Buttons:** "I · Stardust", "II · Horizon"
**Module:** `MethodToggle`

**Expected Behavior:**
- Click switches between methods
- Slider animates to active button (0.3s ease)
- Panels cross-fade (0.4s)
- Only one panel visible at a time

**Bug Check:**
- [ ] Click switches methods
- [ ] Slider animates smoothly
- [ ] Panels fade correctly
- [ ] No layout shift during switch

### 4. Partnership Slideshow

**Element:** `.partnership-slideshow`
**Module:** `PartnershipSlider`

**Expected Behavior:**
- Auto-scrolls horizontally
- Infinite loop
- Smooth scroll animation
- Logos evenly spaced

**Bug Check:**
- [ ] Slideshow auto-scrolls
- [ ] Loop is seamless
- [ ] Animation is smooth

---

## Performance Expectations

### Lighthouse Targets

| Category | Target | Current |
|----------|--------|---------|
| Performance | 95+ | TBD |
| Accessibility | 95+ | TBD |
| Best Practices | 95+ | TBD |
| SEO | 95+ | TBD |

### Core Web Vitals

| Metric | Target | Description |
|--------|--------|-------------|
| FCP (First Contentful Paint) | <1.5s | When first content renders |
| LCP (Largest Contentful Paint) | <2.5s | When largest element visible |
| TTI (Time to Interactive) | <3s | When page fully interactive |
| CLS (Cumulative Layout Shift) | <0.1 | Visual stability during load |

### WebGL Performance

| Metric | Target | Notes |
|--------|--------|-------|
| GPU Memory | 50-70MB | Viewport-dependent |
| Composited Layers | 15-25 | Hardware-accelerated elements |
| WebGL Contexts | 4 active | Intro, Constellation, Starfield, Gradient |
| Program Switches | Minimal | Cached state reduces switches |

### Battery Impact

**Expected Behavior:**
- Rendering pauses when tab hidden
- Passive event listeners used
- Debounced resize (150ms)
- Mobile DPR capped at 2×

**Known:**
- Extended mobile viewing drains battery (continuous WebGL)
- Low-end devices may drop below 30fps during explosion

---

## Browser Compatibility

### Tested Browsers

| Browser | Version | Status |
|---------|---------|--------|
| Chrome | 120+ | ✅ Primary target |
| Firefox | 115+ | ✅ Full support |
| Safari | 17+ | ⚠️ Backdrop-filter glitch |
| Edge | 120+ | ✅ Full support |

### Required Features

```
✅ ES6+ JavaScript (const, let, arrow functions, template literals)
✅ CSS Custom Properties (--variables)
✅ CSS Grid & Flexbox
✅ WebGL 1.0
✅ requestAnimationFrame
✅ IntersectionObserver (via GSAP ScrollTrigger)
✅ Touch Events API
✅ Pointer Events API
```

### Mobile Browsers

| Browser | Status | Notes |
|---------|--------|-------|
| iOS Safari | ✅ | May throttle WebGL on older devices |
| Android Chrome | ✅ | Full support |
| Samsung Internet | ✅ | Full support |

### Known Issues

**Safari:**
- Rare `backdrop-filter` glitch on rapid scroll
- Workaround: None (cosmetic only)

**Low-End Devices:**
- May drop below 30fps during constellation explosion
- No workaround (hardware limitation)

**DevTools Open:**
- ~30% WebGL performance reduction
- Expected behavior (instrumentation overhead)

---

## Known Limitations

### 1. Battery Drain
**Issue:** Extended mobile viewing drains battery
**Cause:** Continuous WebGL rendering
**Impact:** 10-20% faster battery drain vs. static page
**Mitigation:** Rendering pauses when tab hidden

### 2. Low-End Device Performance
**Issue:** FPS drops below 30 during explosion
**Cause:** WebGL overdraw + particle count
**Impact:** Slightly choppy animation
**Mitigation:** DPR capped at 2×, consider reducing particle count

### 3. High DPI Scaling
**Issue:** Increased memory usage on 3× devices
**Cause:** Canvas scales to device pixel ratio
**Impact:** 50-70MB GPU memory
**Mitigation:** DPR capped at 2×

### 4. No Fallback
**Issue:** No non-WebGL fallback
**Cause:** WebGL is core to experience
**Impact:** Blank screen if WebGL unavailable
**Mitigation:** Browser compatibility check recommended

### 5. Accessibility - Motion
**Issue:** Heavy animations may cause motion sickness
**Mitigation:** `prefers-reduced-motion` disables animations + particles
**Status:** ✅ Implemented

---

## Testing Checklist

### Visual Regression

- [ ] All sections render at correct scroll positions
- [ ] No layout shifts during animations
- [ ] Colors match design spec
- [ ] Typography is consistent
- [ ] Images load and display correctly
- [ ] WebGL canvases render on all devices

### Functional

- [ ] Scroll scrubbing is smooth (60fps target)
- [ ] All interactive elements respond to click/tap
- [ ] Keyboard navigation works (Tab, Enter, Escape)
- [ ] Modal opens/closes correctly
- [ ] Drag functionality works (mouse + touch)
- [ ] Toggle switches between methods
- [ ] Slideshow auto-scrolls

### Performance

- [ ] Lighthouse score >95 all categories
- [ ] FCP <1.5s, LCP <2.5s, TTI <3s, CLS <0.1
- [ ] FPS stays above targets (60fps desktop, 30fps mobile)
- [ ] No memory leaks (test 5+ minutes scrolling)
- [ ] WebGL contexts initialize correctly
- [ ] Master render loop pauses when tab hidden

### Cross-Browser

- [ ] Chrome (desktop + mobile)
- [ ] Firefox (desktop + mobile)
- [ ] Safari (desktop + iOS)
- [ ] Edge (desktop)
- [ ] Samsung Internet (mobile)

### Responsive

- [ ] Test at 320px (iPhone SE)
- [ ] Test at 768px (iPad)
- [ ] Test at 1024px (iPad Pro)
- [ ] Test at 1920px (Desktop)
- [ ] Test at 4K (5120px)
- [ ] Orbit ellipse adjusts correctly
- [ ] Typography scales smoothly (clamp)

### Accessibility

- [ ] Semantic HTML elements used
- [ ] ARIA labels on decorative elements
- [ ] Focus visible styles (2px outline + offset)
- [ ] Keyboard navigation complete
- [ ] Screen reader announces sections
- [ ] WCAG AA color contrast
- [ ] `prefers-reduced-motion` disables animations
- [ ] Touch targets ≥44px (52px social icons)

### Edge Cases

- [ ] Rapid scroll up/down (no flicker)
- [ ] Resize during animation (no break)
- [ ] DevTools open (expect 30% perf drop)
- [ ] Tab switch while animating (pause/resume)
- [ ] Long-term use (no memory leak after 10+ mins)
- [ ] Mobile landscape orientation
- [ ] High DPI displays (3× devices)

---

## Debugging Tips

### Console Logging

**Scroll Position:**
```javascript
const scrollY = window.scrollY || window.pageYOffset ||
                document.documentElement.scrollTop || 0;
const vh = (scrollY / window.innerHeight).toFixed(2);
console.log(`[${vh}vh | ${scrollY}px]`);
```

**WebGL Context:**
```javascript
if (!gl) {
  console.error('WebGL context lost or unavailable');
  return;
}
```

**CSS Computed Styles:**
```javascript
const computed = window.getComputedStyle(element);
console.log({
  color: computed.color,
  opacity: computed.opacity,
  transform: computed.transform
});
```

### Performance Profiling

**Chrome DevTools:**
1. Open Performance tab
2. Record 10 seconds of scrolling
3. Analyze: FPS, long tasks, GPU memory, paint operations

**Optimization Priorities:**
1. Eliminate redundant work (cached programs)
2. Reduce pixel count (DPR capping)
3. Increase scroll distances (longer durations)
4. Hardware acceleration (transform/opacity only)

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-03-16 | 1.0 | Initial technical specification created |

---

**End of Technical Specification**

For implementation details, see:
- `CLAUDE.md` - Project context and development guide
- `docs/responsive-design.md` - Responsive implementation
- `README.md` - User-facing documentation
