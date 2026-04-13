# cocoex.xyz Website - Technical Documentation

## Project Overview
Static portfolio website for cocoex e.V. - a vibrant DAO blending art, blockchain, community and social impact. Core values: **usability**, **design**, **minimalism**.

**Current Status:** Production-ready. All major features implemented and tested.

## Site Architecture

**Total Scroll Height:** ~1720vh (17.2× viewport height)

### Section 1: Landing (Orbiting → Explosion)
**Scroll Range:** 0-400vh (`.intro`)
**Positioning:** Fixed overlay

**Animation Phases:**
- **Phase 1 (0-40%)**: Orbiting dots convergence
  - White/black dots orbit center in ellipse pattern
  - Logo scales 80px → 250px with 2 full rotations
  - GSAP ScrollTrigger drives smooth interpolation

- **Phase 2 (30-50%)**: Transition text
  - "art as infrastructure for change" appears at 76% orbit progress
  - Fades in below logo, fades out before explosion

- **Phase 3 (50-100%)**: Constellation explosion
  - 7 colored dots explode from center
  - Z-depth rendering (-0.5 to 0.6 range)
  - Big bang pulse effect (dispersive wave shader uniform)
  - Continuous 15° rotation

**Key Features:**
- WebGL starfield background (twinkling stars + simplex noise)
- Hardware-accelerated transforms
- Responsive logo sizing (clamp: 60-250px across devices)

**Files:**
- HTML: `index.html:27-52` (intro section)
- CSS: `styles.css:156-341` (intro, logo, dots, constellation)
- JS: `main.js:270-386` (WebGL shader), `main.js:408-664` (constellation), `main.js:867-913` (GSAP animations)

---

### Section 2: Intro (Mission Text)
**Scroll Range:** 400-550vh (`.text-section-wrapper`)
**Positioning:** Sticky, full viewport height

**Content:**
- cocoex mission statement
- comet collab ecosystem overview
- Stardust and Horizon methods introduction
- Muse framework teaser

**Animation:**
- Simple fade-in (opacity 0 → 1)
- Italic styling on key words (static, no highlighting)
- GSAP `scrub: true` for 60fps smoothness

**Responsive Features:**
- Fluid typography: `clamp(20px, 2.5vw, 36px)`
- Text transforms to uppercase
- Justified alignment for readability

**Files:**
- HTML: `index.html:55-61`
- CSS: `styles.css:356-398`
- JS: `main.js:914-951` (fade-in animation)

---

### Section 3: Muse-1 (Intro Page)
**Scroll Range:** 550-700vh (`.muse-intro-page`)
**Positioning:** Fixed overlay with fade-in/out

**Content:**
- Black inverted Muse logo (centered)
- Top text: Overview of Muse framework
- Bottom text: Seven muses introduction with hollow "Muse" text effect

**Animation:**
- Fades in at 80% viewport entrance (550vh mark)
- Holds for 150vh
- Crossfades out during transition to orbiting layout

**Text Styling:**
- Uppercase transformation
- Justified alignment
- `.highlight-muse`: Hollow letter effect (transparent fill, white stroke)

**Files:**
- HTML: `index.html:73-78`
- CSS: `styles.css:641-737` (intro page), `styles.css:733-737` (highlight effect)
- JS: `main.js:979-1000` (fade-in animation)

---

### Section 4: Muse-2 (Orbiting Portfolio)
**Scroll Range:** 700-820vh (`.white-section-content`, `.muse-section`)
**Positioning:** Sticky content

**Scroll Breakdown:**
- **0-120vh**: Crossfade from intro page (smooth opacity blend)
- **120vh+**: Active orbiting layout with continuous rotation

**The Seven Muses:**
| Name | Color | Description |
|------|-------|-------------|
| **Lunes** | `#5783A6` | Mystery and intuition |
| **Ares** | `#D54D2E` | Passion and courage |
| **Rabu** | `#8CB07F` | Communication and connection |
| **Thunor** | `#F8D86A` | Thunder and strength |
| **Shukra** | `#5E47A1` | Beauty and harmony |
| **Dosei** | `#7F49A2` | Wisdom and structure |
| **Solis** | `#D48348` | Warmth and vitality |

**Orbit Behavior (Adaptive Ellipse):**
- **Mobile (≤768px)**: Vertical ellipse - 1.6x taller than wide
- **Tablet (768-1024px)**: Slightly vertical - 1.4x taller than wide
- **Desktop (>1024px)**: Horizontal ellipse - 1.8x wider than tall
- **Rotation**: 240 seconds per complete cycle

**Interactive Features:**
- **Modal Popup**: Click muse image or title
  - Colored aura effects (unique per muse color)
  - Floating particle animations (12 particles)
  - GSAP-driven entrance/exit
  - Close: Escape key, click outside, or X button

- **Keyboard Navigation**: Tab through muses, Enter to open, Escape to close

**Visual Effects:**
- WebGL animated gradient (7-color simplex noise blend)
- Unified starfield canvas (shared with Comet section)
- Hardware-accelerated rotation with ellipse mathematics

**Files:**
- HTML: `index.html:80-176` (orbiting section + popup)
- CSS: `styles.css:739-869` (orbiting layout), `styles.css:870-1052` (popup modal)
- JS: `main.js:1003-1039` (crossfade animation), `main.js:1148-1289` (gradient), `main.js:1521-1719` (popup), `main.js:1724-1839` (orbit rotation)

---

### Section 5: Comet-collab-1 (Intro Page)
**Scroll Range:** 820-1370vh (`.comet-collab-intro`)
**Positioning:** Sticky with descending logo animation

**Content:**
- White Comet Collabs logo
- Stardust and Horizon methods description
- Uppercase, justified text

**Animation Breakdown:**
- **0-180vh**: Intro page hold (static)
- **180-460vh**: Logo descent animation (280vh smooth transition)
  - Logo moves from center → bottom
  - Text content moves up
  - Fully reversible on scroll up
- **460-610vh**: Bottom hold (150vh pause)
  - Logo remains at bottom position
  - Gives users time to read content
  - Smooth transition before crossfade

**Shine Animation:**
- **Scroll down** (entering from text section): Stardust shines → 1s delay → Horizon shines
- **Scroll back** (from comet-collab-2): Horizon shines → 1s delay → Stardust shines
- Each shine: 1.6s duration with glow effect (drop-shadow + stroke width increase)
- Triggers every time section enters viewport in either direction

**Methods Explained:**
- **Stardust**: Artists select a cause, create work, launch fundraising campaign. Funds split between artist and organization.
- **Horizon**: Future Lab where communities design their futures through 4 steps (Critique → Realisation), transforming vision into art and change.

**Visual Features:**
- WebGL gradient background (`.comet-collab-background-canvas` at z-index 1)
- Unified starfield beneath
- Responsive logo: `clamp(100px, 15vw, 182px)`
- Hollow letter styling on method names (transparent fill, white stroke)
- Sequential shine animation with glow effect

**Files:**
- HTML: `index.html:190` (shine-word spans with data attributes)
- CSS: `styles.css:416-490` (intro section), `styles.css:492-520` (shine animation), `styles.css:571-580` (gradient canvas)
- JS: `main.js:1042-1078` (intro + logo animation), `main.js:1080-1090` (shine trigger forward), `main.js:1102-1105` (shine trigger reverse), `main.js:1389-1516` (gradient background), `main.js:1962-2009` (shine animation function)

---

### Section 6: Comet-collab-2 (Connected Images)
**Scroll Range:** 1370-1720vh (`.comet-collab-connected-content`)
**Positioning:** Sticky content

**Animation:**
- **610-730vh**: Crossfade from intro (120vh transition, opacity 0 → 1)
- **730vh+**: Static display of 5 process images
- Images arranged in flex layout with white connection lines (canvas overlay)

**Content:**
- 5 connected process images
- Visual representation of Stardust/Horizon methodology
- Responsive image sizing: `clamp(120px, 20vw, 250px)` desktop, smaller on mobile

**Visual Features:**
- Same WebGL gradient as intro (continuous visual flow)
- Unified starfield background
- White connection lines between images (`.comet-connection-canvas`)
- Hover scale transform on images (1.05x)

**Files:**
- HTML: `index.html:194-219`
- CSS: `styles.css:492-569` (connected images layout)
- JS: `main.js:1080-1103` (crossfade animation), `main.js:1841-1909` (connection lines)

---

### Footer
**Positioning:** Fixed, revealed at comet section end
**Trigger:** When connected images scroll into view

**Contents:**
- **Social Links**: Telegram, Instagram, LinkedIn
  - 52px touch targets (accessibility compliant)
  - Hover scale transform
  - External links with `rel="noopener noreferrer"`

- **cocoex Text Logo**: 172px width, scales on hover

**Files:**
- HTML: `index.html:222-242`
- CSS: `styles.css:1026-1091`
- JS: `main.js:954-976` (reveal animation)

---

## DOM Reference Guide

### Communication Best Practices

When requesting changes, use **visual description + DOM selector + line reference** for precision.

**Examples:**
```
❌ Poor:  "The icons at the bottom"
✅ Good:  "The footer with Instagram, Telegram, LinkedIn icons"
✅ Best:  "The .social-links footer (styles.css:1029, index.html:223)"
```

### Quick Reference Table

| Element | Selector | CSS Lines | JS Lines | HTML Lines |
|---------|----------|-----------|----------|------------|
| Intro starfield | `#bg-canvas` | 139-180 | 270-386 | 28 |
| Orbiting dots | `.orbit-dot` | 182-257 | 1083-1142 | 32-33 |
| Logo rotation | `#intro-logo` | 182-257 | 772-793 | 37 |
| Transition text | `#transition-text` | 287-313 | 891-913 | 44-46 |
| Constellation canvas | `#constellation-canvas` | 315-326 | 449-664 | 49 |
| Text reveal | `.reveal-text` | 342-380 | 936-951 | 58 |
| Muse intro page | `.muse-intro-page` | 1093-1125 | 914-976 | 73-78 |
| Muse gradient | `#muse-background-canvas` | - | 1148-1289 | 85 |
| Unified starfield | `#unified-starfield-canvas` | 329-339 | 1294-1384 | 64 |
| Orbiting muses | `.muse-orbit-item` | 1169-1283 | 1724-1839 | 95-171 |
| Muse popup | `.muse-popup` | 1285-1466 | 1521-1719 | 245-260 |
| Comet intro | `.comet-collab-intro` | 379-517 | 979-1078 | 181-191 |
| Connected images | `.comet-collab-connected-content` | 519-786 | - | 194-219 |
| Comet gradient | `#comet-collab-background-canvas` | - | 1389-1516 | 196 |
| Footer social links | `.social-links` | 1026-1068 | 894-911 | 223-239 |
| Footer logo | `.footer-logo` | 1070-1091 | 894-911 | 242 |

### CSS Organization (styles.css - 1729 lines total)

| Lines | Section | Key Classes |
|-------|---------|-------------|
| 1-40 | Scrollbar | Firefox + Webkit thin scrollbar |
| 42-77 | CSS Variables | `:root`, typography scale, spacing |
| 79-137 | Reset & Base | Universal reset, `prefers-reduced-motion` |
| 139-180 | Intro Canvas | `.intro`, `.intro-canvas`, `.intro-content` |
| 182-257 | Logo & Dots | `.logo-container`, `.orbit-dot`, `.final-dot` |
| 259-285 | Final Dot | Merged dot state |
| 287-313 | Transition Text | Appears at 76% orbit |
| 315-326 | Constellation | Explosion canvas |
| 329-339 | Unified Starfield | Shared Muse/Comet background |
| 342-380 | Text Section | `.text-section-wrapper`, `.reveal-text` |
| 363-377 | White Section | Container for Muse + Comet |
| 379-517 | Comet Intro | Logo animation, methods text |
| 519-786 | Connected Images | 5 process images layout |
| 788-892 | Connection Canvas | Lines between images (future) |
| 1026-1091 | Footer | Social links, logo |
| 1093-1166 | Muse Wrapper | Intro page, sticky content |
| 1169-1283 | Muse Orbiting | Ellipse layout, center logo |
| 1285-1466 | Muse Popup | Modal, particles, aura effects |
| 1468-1683 | Responsive | Tablet → Mobile → Small → Large breakpoints |
| 1686-1728 | Utilities | `.visually-hidden`, print styles |

### JavaScript Module Reference (main.js - 2617 lines total)

| Lines | Module | Purpose | Key Functions |
|-------|--------|---------|---------------|
| 1-14 | IIFE Wrapper | Scope isolation | Encapsulates all code |
| 16-85 | GLSL_UTILS | Shared shaders | SIMPLEX_NOISE, STAR_FIELD |
| 88-117 | SCROLL_TIMING | Centralized timing | All scroll ranges/durations |
| 119-190 | CONFIG + DATA | Constants | DOT_COLORS, CONSTELLATION_REF |
| 194-225 | DOM References | Cached selectors | All major DOM elements |
| 227-268 | State Variables | Runtime state | pulseValue, constellationRotation |
| 270-386 | WebGL Intro | Starfield shader | Twinkling stars, pulse effect |
| 388-406 | Resize Handler | Debounced (150ms) | Canvas resizing, responsive |
| 408-664 | Constellation | Explosion animation | Z-depth, rotation, particles |
| 667-727 | Master Render Loop | Consolidated RAF | All WebGL canvases |
| 732-865 | Event Listeners | Setup | Scroll, resize, load |
| 867-1078 | GSAP Animations | ScrollTrigger | All section transitions |
| 1083-1142 | updateOrbitPositions | Phase 1 orbit | White/black dot positioning |
| 1148-1289 | MuseBackground | WebGL gradient | 7-color simplex blend |
| 1294-1384 | UnifiedStarfield | Shared starfield | Muse + Comet background |
| 1389-1516 | CometCollabBackground | Gradient (reused) | Same shader as Muse |
| 1521-1719 | MusePopup | Modal module | Open, close, animations |
| 1724-1839 | MuseScroll | Orbiting layout | 240s rotation, ellipse math |
| 1841-2617 | CometCollabSlider | Bouncing logo system | (Not currently active in HTML) |

---

## Tech Stack

### Core Technologies
- **HTML5**: Semantic markup, ARIA labels, 327 lines
- **CSS3**: Custom properties, Grid, Flexbox, 1729 lines
- **Vanilla JavaScript**: ES6+, IIFE pattern, 2617 lines
- **GSAP 3.12.5**: ScrollTrigger for scroll-driven animations
- **WebGL**: Custom GLSL shaders for visual effects

### Architecture Patterns
- **IIFE Module Pattern**: Global scope isolation
- **Master Render Loop**: Consolidates all WebGL animations (single RAF)
- **Centralized Timing**: `SCROLL_TIMING` object for all scroll ranges
- **Shared GLSL Utilities**: Simplex noise, star field rendering
- **Passive Event Listeners**: Scroll and touch events
- **Debounced Resize**: 150ms delay for stability

### Typography
- **Font**: Canela (Bold 700, Regular 400) via Adobe Fonts (Typekit ID: `nvc8nhy`)
- **Fallback**: Georgia, serif
- **Fluid Scale**: H1 `clamp(24px, 3vw, 48px)`, H2 `clamp(14px, 1.5vw, 22px)`
- **Responsive**: All typography uses `clamp()` for smooth scaling (320px → 4K+)

### Responsive Design
**Implementation:** Fluid design with minimal breakpoints
**Documentation:** See `docs/responsive-design.md` for complete guide

**Key Features:**
- **Fluid Typography**: All text sizes use `clamp()` for viewport-relative scaling
- **Responsive Logos**: Logo sizes scale with CSS variables: `--intro-logo-size`, `--muse-logo-size`, `--muse-orbit-image-size`, `--comet-logo-size`
- **Fluid Spacing**: Spacing system scales: `--spacing-xs` through `--spacing-xl`
- **Adaptive Orbit**: Muse orbit changes from horizontal ellipse (desktop) to vertical ellipse (mobile)
- **Touch Optimization**: 44px+ touch targets, touch-action optimization on mobile

**Breakpoints (layout-only):**
- Tablet (≤1024px): Touch optimization
- Mobile (≤768px): Layout adjustments, vertical ellipse orbit
- Small (≤480px): Fine-tuning for very small screens

**Orbit Behavior:**
- **Mobile (≤768px)**: Vertical ellipse (1.6x taller) - better portrait centering
- **Tablet (768-1024px)**: Slightly vertical (1.4x taller) - transition
- **Desktop (>1024px)**: Horizontal ellipse (1.8x wider) - wide sweep

**Benefits:**
- ~200 fewer CSS lines vs. fixed breakpoint approach
- Smooth transitions without jumps between breakpoints
- Future-proof for any screen size
- Better performance with native browser scaling

### WebGL Resources
- **Active Canvases**: 4 total
  1. Intro starfield (`#bg-canvas`)
  2. Constellation explosion (`#constellation-canvas`)
  3. Unified starfield (`#unified-starfield-canvas`)
  4. Muse/Comet gradient (2 instances, same shader)

- **Shader Programs**: 3 unique
  1. Intro starfield + pulse
  2. Unified starfield (shared)
  3. Animated gradient (Muse + Comet)

- **Memory Usage**: ~50-70MB (viewport-dependent)
- **GPU Layers**: 15-25 composited

---

## Performance Profile

### Bundle Sizes (After March 2026 Cleanup)
- **HTML**: 10.2KB uncompressed (~3.5KB gzipped)
- **CSS**: 26KB uncompressed (~7KB gzipped) - **↓32% from 38.4KB**
- **JavaScript**: 68KB uncompressed (~18KB gzipped) - **↓26% from 92KB**
- **Total Core**: 104KB uncompressed (~28.5KB gzipped) - **↓26% overall**
- **GSAP CDN**: 47KB (cached after first load)
- **Images**: ~1MB total (lazy loaded)

**Cleanup Impact:**
- Removed 1,079 lines of unused code (CometCollabSlider module)
- Reduced bundle by 36.6KB uncompressed (~9KB gzipped)
- 0 functional changes, all features preserved
- Improved maintainability and code clarity

### Performance Benchmarks
| Metric | Target | Notes |
|--------|--------|-------|
| Lighthouse Score | 95+ | All categories |
| First Contentful Paint | <1.5s | 4G connection |
| Largest Contentful Paint | <2.5s | 4G connection |
| Time to Interactive | <3s | 4G connection |
| Cumulative Layout Shift | <0.1 | Fixed positioning |
| WebGL Rendering | 60fps desktop, 30fps mobile | Capped DPR on mobile |

### Optimization Strategies

**Animation:**
- Hardware-accelerated properties only (`transform`, `opacity`)
- GSAP ScrollTrigger with `scrub: true` (60fps interpolation)
- Extended scroll durations (100vh+ per animation)
- `will-change` hints on animated elements
- Z-index layering minimizes repaints

**WebGL:**
- Shared GLSL utilities reduce duplication (~150 lines saved)
- Cached program state (minimizes GPU context switches)
- Mobile DPR capped at 2x (33% pixel reduction on 3x devices)
- Early exit in shader star generation
- Master render loop consolidates all animations

**Loading:**
- Passive event listeners (scroll, touch, resize)
- Debounced resize handler (150ms)
- Centralized `SCROLL_TIMING` prevents cascading changes
- Big bang pulse uses single uniform (no DOM manipulation)

### Known Limitations
- **Battery**: Extended mobile viewing drains battery (WebGL rendering)
- **Low-End**: May drop below 30fps during constellation animation
- **High DPI**: WebGL scales to device pixel ratio (higher memory)
- **Safari**: Rare `backdrop-filter` glitch on rapid scroll
- **DevTools**: ~30% WebGL performance reduction when open

---

## Design Principles

### Minimalism
- Question every element
- White space is a feature
- Less code = faster load
- Remove over-engineering

### Fluid Performance
- 60fps scroll animations (GSAP `scrub: true`)
- Hardware-accelerated properties only
- Debounced resize: 150ms
- Touch targets: min 44px (52px social icons)
- Responsive breakpoints: 480, 768, 1024, 1440, 1920px

### Accessibility
- Semantic HTML5 elements
- ARIA labels on decorative/interactive elements
- Keyboard navigation (Tab, Escape)
- Focus visible styles (2px outline + 2px offset)
- WCAG AA color contrast
- `prefers-reduced-motion` disables animations + particles
- Screen reader friendly

### Performance Targets
| Metric | Target |
|--------|--------|
| FCP | <1.5s |
| LCP | <2.5s |
| TTI | <3s |
| CLS | <0.1 |
| Lighthouse | 95+ |

---

## Code Standards

### CSS Best Practices
✅ **Do:**
- CSS custom properties in `:root`
- Mobile-first responsive design
- Section-based organization with comments
- Hardware acceleration via `transform`/`opacity`
- `window.getComputedStyle()` for debugging

❌ **Don't:**
- Use `!important` (exceptions: specificity conflicts, reduced motion)
- Hardcode values that should be variables
- Use floats for layout (Grid/Flexbox instead)

### JavaScript Best Practices
✅ **Do:**
- IIFE pattern for scope isolation
- Module structure: CONSTANTS → DOM → STATE → UTILS → MODULES → INIT
- Centralize timing in `SCROLL_TIMING`
- Share GLSL code via `GLSL_UTILS`
- Debounce resize, use passive listeners
- Consolidate animations in master render loop

❌ **Don't:**
- Pollute global scope
- Duplicate timing constants
- Create multiple render loops
- Use synchronous event listeners

### HTML Best Practices
✅ **Do:**
- Use semantic HTML5 elements
- W3C valid markup
- Add SEO meta tags
- Use `rel="noopener noreferrer"` on external links
- Descriptive `alt` text on images
- `aria-hidden="true"` on decorative elements

❌ **Don't:**
- Use div soup (meaningless containers)
- Skip ARIA labels
- Forget mobile viewport meta tag

---

## Scroll Timing Reference

All timing centralized in `SCROLL_TIMING` object (main.js:88-117):

```javascript
// Intro section (400vh total)
INTRO_TOTAL: 400
INTRO_PHASE1_END: 0.40    // 40% - orbit ends
INTRO_PHASE2_TEXT: 0.50   // 50% - transition text
INTRO_PHASE3_START: 0.50  // 50% - explosion starts

// Text section (150vh total)
TEXT_SECTION_HEIGHT: 150

// Muse section (270vh total)
MUSE_INTRO_HOLD: 150      // Intro page hold
MUSE_CROSSFADE: 120       // Crossfade duration
MUSE_TOTAL: 270

// Comet section (750vh total)
COMET_INTRO_PAUSE: 120         // Intro hold
COMET_LOGO_MOVEMENT: 280       // Logo descent
COMET_CROSSFADE_DURATION: 120  // Crossfade
COMET_TOTAL: 750               // Total wrapper height
```

**Adjustment Guidelines:**
- Minimum 100vh per scroll-driven animation for 60fps smoothness
- Crossfades should be 100-120vh for perceptible transitions
- Intro holds should be 100-150vh to avoid rushed feeling

---

## Debugging & Troubleshooting

### Common Issues

**1. Canvas Flickering**
- **Cause**: Double transformation (manual rotation + CSS transform)
- **Fix**: Store unrotated positions, let CSS handle rotation
- **Always**: Use `ctx.save()` and `ctx.restore()` for clean state

**2. CSS Not Applying**
- **Cause**: Specificity conflicts
- **Debug**: `window.getComputedStyle(element).propertyName`
- **Fix**: Use `!important` sparingly for overrides

**3. Scroll Position Reads 0**
- **Cause**: Browser differences in scroll properties
- **Fix**: Multiple fallback sources with OR operator
```javascript
const scrollY = window.scrollY || window.pageYOffset ||
                document.documentElement.scrollTop || 0;
```

**4. WebGL Performance Drops**
- **Cause**: Redundant `gl.useProgram()` calls
- **Fix**: Cache last active program, only switch when necessary
- **Mobile**: Cap DPR at 2x (`Math.min(window.devicePixelRatio, 2)`)

**5. Animations Too Fast/Jerky**
- **Cause**: Scroll distances too short for 60fps interpolation
- **Fix**: Increase values in `SCROLL_TIMING` (min 100vh per phase)

### Debug Logging Pattern

```javascript
// Scroll position with multiple sources
const scrollY = window.scrollY || window.pageYOffset ||
                document.documentElement.scrollTop || 0;
const vh = (scrollY / window.innerHeight).toFixed(2);
console.log(`[${vh}vh | ${scrollY}px]`);

// CSS computed styles
const computed = window.getComputedStyle(element);
console.log({
  color: computed.color,
  opacity: computed.opacity
});

// WebGL program switches (should be minimal)
let programSwitchCount = 0;
if (lastActiveProgram !== program) {
  programSwitchCount++;
  console.log(`Program switch #${programSwitchCount}`);
}
```

### Performance Profiling Workflow

**Before Optimizing:**
1. Open Chrome DevTools Performance tab
2. Record 10 seconds of scrolling
3. Analyze: FPS, long tasks, GPU memory, paint operations

**Optimization Priorities:**
1. Eliminate redundant work (cached programs)
2. Reduce pixel count (DPR capping)
3. Increase scroll distances (longer durations)
4. Hardware acceleration (`transform`/`opacity` only)

**After Optimizing:**
1. Re-record same 10-second segment
2. Compare metrics to baseline
3. Verify visual quality unchanged
4. Test on low-end device

---

## Development Workflow

### Local Setup

```bash
# Start local server
python3 -m http.server 8000
# or
npx serve . -l 8000

# Visit http://localhost:8000
```

### Development Tools

**Coordinate Picker** (`tools/coordinate-picker.html`)
- Interactive tool for constellation positioning
- Click to save coordinates (normalized 0-1)
- Keyboard: Z (undo), C (clear)

**Browser DevTools:**
- **Chrome**: Performance profiling, WebGL debugging
- **Lighthouse**: Performance audits (target 95+)
- **axe DevTools**: Accessibility testing
- **W3C Validator**: HTML validation

### Pre-Deployment Checklist

- [ ] Cross-browser test (Chrome, Firefox, Safari, Edge)
- [ ] Responsive validation (320px → 1920px+)
- [ ] Lighthouse audit (95+ all categories)
- [ ] HTML validation (W3C)
- [ ] Keyboard navigation (Tab, Escape)
- [ ] `prefers-reduced-motion` verification
- [ ] Mobile device testing
- [ ] Touch target testing (44px+)

---

## Best Practices Summary

**Always:**
- Mobile-first responsive design
- Profile before optimizing
- Test on real devices
- Use semantic HTML
- Validate with Lighthouse (target 95+)
- Hardware-accelerated properties only
- Debounce resize/scroll handlers (150ms)
- Add `aria-hidden="true"` to decorative elements
- Support `prefers-reduced-motion`
- Test keyboard navigation
- Use `ctx.save()`/`ctx.restore()` for canvas
- Multiple fallback sources for scroll position
- Cache WebGL program state

**Never:**
- Add frameworks for simple interactions
- Sacrifice accessibility for aesthetics
- Hardcode values in `SCROLL_TIMING`
- Use animations without reduced motion support
- Deploy without Lighthouse audit
- Use `!important` habitually (exceptions documented)
- Ignore keyboard navigation
- Commit unused code
- Apply both manual rotation and CSS transform
- Assume single scroll source works cross-browser

---

## Implementation Status

**Current Features (March 2026):**
- ✅ Intro: Orbiting dots, logo rotation, constellation explosion
- ✅ Transition text "art as infrastructure for change"
- ✅ Big bang pulse effect (dispersive wave)
- ✅ WebGL starfield backgrounds (intro + unified)
- ✅ Simplified text reveal (fade-in only, no word highlighting)
- ✅ Muse intro page with black inverted logo + 120vh crossfade
- ✅ Orbiting muse layout (240s rotation, adaptive ellipse)
- ✅ Interactive muse popup modals (colored aura, particles)
- ✅ WebGL animated gradient (Muse/Comet sections)
- ✅ Comet intro page with descending logo (280vh animation) + 150vh bottom hold
- ✅ Shine animation on Stardust/Horizon words (direction-aware, 1.6s duration)
- ✅ Connected images display (5 process images)
- ✅ Footer reveal at page end (social icons + logo)
- ✅ Full keyboard navigation support
- ✅ `prefers-reduced-motion` disables animations + particles
- ✅ Responsive design (320px → 4K+) with fluid typography

**Recent Changes (March 2026):**
- ✅ **Responsive Design Overhaul**
  - Implemented fluid typography with `clamp()` throughout
  - Created adaptive ellipse orbit (vertical mobile, horizontal desktop)
  - Added comprehensive responsive design documentation (`docs/responsive-design.md`)
  - Reduced CSS by ~200 lines through consolidation

- ✅ **Text Styling Improvements**
  - Added `.highlight-muse` hollow letter effect (transparent fill, white stroke)
  - Made all text sections uppercase with justified alignment
  - Ensured visual consistency across all sections

- ✅ **Code Cleanup (1,079 lines removed)**
  - Removed unused CometCollabSlider module (586 lines JS)
  - Removed slider-related CSS (493 lines)
  - Fixed canvas background CSS bug (restored essential `.comet-collab-background-canvas`)
  - Updated static-web-dev skill with cleanup learnings
  - Total reduction: 35KB uncompressed, 0 functional changes

- ✅ **Documentation Updates**
  - Restructured CLAUDE.md with new section naming (landing, intro, muse-1, muse-2, comet-collab-1, comet-collab-2)
  - Added responsive design guide with troubleshooting
  - Created comprehensive cleanup case study in skill
  - Set debug logging to false for production

- ✅ **Comet Section Enhancements (March 9, 2026)**
  - Added 150vh bottom hold in comet-collab-1 after logo descent (better pacing)
  - Implemented shine animation on Stardust and Horizon words (1.6s glow effect)
  - Direction-aware animation: Stardust→Horizon (scroll down), Horizon→Stardust (scroll back)
  - Sequential timing: 1 second delay between word animations
  - Triggers every time section enters viewport in either direction
  - Total scroll height increased: 1570vh → 1720vh

**Known Technical Debt:**
- Connection canvas for lines between images (visual enhancement, not critical)

**Performance:**
- Master render loop consolidates animations ✅
- GSAP ScrollTrigger handles all scroll ✅
- Debounced resize: 150ms ✅
- Hardware acceleration: `will-change` hints ✅
- Shared GLSL code reduces duplication ✅
- Z-index layering minimizes repaints ✅
- Fluid responsive design eliminates breakpoint jumps ✅

---

## Key Files Reference

| File | Lines | Purpose | Last Updated |
|------|-------|---------|--------------|
| `index.html` | 327 | Semantic HTML5 structure | March 9, 2026 |
| `css/styles.css` | 1,174 | Styling with responsive design | March 9, 2026 |
| `js/main.js` | 2,035 | Animation logic (GSAP + WebGL) | March 9, 2026 |
| `docs/responsive-design.md` | 453 | Responsive implementation guide | March 9, 2026 |
| `.claude/skills/static-web-dev/skill.md` | 929 | Dev skill with cleanup learnings | March 9, 2026 |
| `tools/coordinate-picker.html` | - | Dev tool for constellation | Feb 24, 2026 |
| `README.md` | - | User-facing documentation | March 9, 2026 |
| `CLAUDE.md` | - | Project context (this file) | March 9, 2026 |

---

**Last Updated:** March 9, 2026

**Major Changes:**
- ✅ Restructured section naming (landing, intro, muse-1, muse-2, comet-collab-1, comet-collab-2)
- ✅ Implemented comprehensive responsive design with fluid typography
- ✅ Added adaptive ellipse orbit (vertical mobile, horizontal desktop)
- ✅ Removed 1,079 lines of unused code (26% bundle reduction)
- ✅ Added responsive design documentation and cleanup case study
- ✅ Set debug logging to false for production
- ✅ Updated all file references and scroll ranges
- ✅ 0 functional changes - all features preserved and working
