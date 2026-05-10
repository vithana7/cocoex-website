# Responsive Design Implementation Guide

**Last Updated:** 2026-05-10
**Status:** Production-ready

## Overview

The cocoex.xyz website uses modern CSS fluid design principles to provide seamless responsiveness across all devices (320px - 4K+). Instead of fixed breakpoints with hardcoded values, we use `clamp()` for fluid scaling and minimal media queries for layout-specific adjustments.

## Core Principles

### 1. Fluid Typography with `clamp()`
All typography scales smoothly based on viewport width using CSS `clamp()`:

```css
/* Typography scales from mobile (min) through viewport-relative (preferred) to desktop (max) */
--font-h1-size: clamp(24px, 3vw, 48px);
--font-h1-height: clamp(28px, 3.2vw, 52px);

--font-h2-size: clamp(14px, 1.5vw, 22px);
--font-h2-height: clamp(18px, 1.8vw, 26px);

--font-body-size: clamp(20px, 2.5vw, 36px);
--font-body-height: clamp(26px, 3vw, 42px);
```

**How it works:**
- **Min value (24px)**: Minimum size on very small screens (320px)
- **Preferred value (3vw)**: Fluid scaling based on viewport width
- **Max value (48px)**: Maximum size on large screens (1920px+)

### 2. Responsive Logo Sizing
All logos use CSS custom properties with `clamp()` for proportional scaling:

```css
/* Logo size variables - defined in :root (styles.css:41-96) */
--intro-logo-size: clamp(60px, 15vw, 250px);      /* Intro section logo */
--muse-logo-size: clamp(150px, 20vw, 300px);      /* Muse center logo */
--muse-orbit-image-size: clamp(80px, 12vw, 150px); /* Orbiting muse images */
--comet-logo-size: clamp(180px, 25vw, 320px);     /* Comet section logo */
```

**Usage in components:**
```css
.muse-logo-image {
  width: var(--muse-logo-size);
  height: auto;
}

.muse-orbit-item .muse-image {
  width: var(--muse-orbit-image-size);
  height: var(--muse-orbit-image-size);
}
```

### 3. Fluid Spacing System
Spacing scales proportionally across all devices:

```css
/* Spacing variables - responsive from 320px to 1920px+ */
--spacing-xs: clamp(0.25rem, 1vw, 0.5rem);   /* 4px → 8px */
--spacing-sm: clamp(0.5rem, 2vw, 1rem);      /* 8px → 16px */
--spacing-md: clamp(1rem, 3vw, 2rem);        /* 16px → 32px */
--spacing-lg: clamp(2rem, 5vw, 4rem);        /* 32px → 64px */
--spacing-xl: clamp(3rem, 8vw, 8rem);        /* 48px → 128px */
```

## Component-Specific Responsiveness

### Text Section (`styles.css:364-406`)
```css
.text-section {
  padding: clamp(1rem, 5vw, 4rem);
}

.text-content {
  max-width: min(90%, 800px);  /* Never exceeds 90% viewport or 800px */
  width: 100%;
  padding: 0 clamp(1rem, 3vw, 2rem);
}
```

### Transition Text (`styles.css:300-334`)
```css
.transition-text {
  transform: translate(-50%, calc(-50% + clamp(180px, 25vw, 280px)));
  width: 90%;
  max-width: 600px;
}

.transition-text p {
  font-size: clamp(14px, 2vw, 22px);
}
```

### Orbit Dots (`styles.css:227-235`)
```css
.orbit-dot {
  width: clamp(10px, 2vw, 16px);
  height: clamp(10px, 2vw, 16px);
}
```

### Muse Section

**Logo and Orbit Items:**
```css
.muse-logo-image {
  width: var(--muse-logo-size); /* clamp(150px, 20vw, 300px) */
}

.muse-orbit-item .muse-image {
  width: var(--muse-orbit-image-size); /* clamp(80px, 12vw, 150px) */
  height: var(--muse-orbit-image-size);
}

.muse-orbit-item {
  gap: clamp(0.15rem, 0.5vw, 0.25rem);
}
```

**Popup Modal:**
```css
.muse-popup-content {
  max-width: min(90%, 500px);
  gap: clamp(1.5rem, 4vw, 3rem);
}

.muse-card-wrapper {
  width: clamp(220px, 28vw, 320px);
  height: clamp(220px, 28vw, 320px);
}
```

### Comet Section

**Logo and Images:**
```css
.comet-collab-intro-logo img {
  max-width: var(--comet-logo-size); /* clamp(180px, 25vw, 320px) */
  max-height: calc(var(--comet-logo-size) * 0.5);
}

.comet-image-item {
  max-width: clamp(80px, 12vw, 140px);
}
```

### Footer (`styles.css:1262-1324`)
```css
.social-link {
  width: clamp(44px, 6vw, 52px);   /* Maintains WCAG touch target min */
  height: clamp(44px, 6vw, 52px);
  border-radius: clamp(10px, 1.5vw, 12px);
}

.social-icon {
  width: clamp(24px, 4vw, 32px);
  height: clamp(24px, 4vw, 32px);
}

.footer-logo {
  width: clamp(120px, 18vw, 172px);
}
```

## Muse Orbit Ellipse Behavior

**Critical Feature:** The orbit ellipse orientation adapts to device screen ratio.

**JavaScript Implementation:** `main.js:2063-2082`

```javascript
calculateOrbitRadius() {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Mobile: Vertical ellipse (taller than wide) for better centering
  if (viewportWidth <= 768) {
    this.orbitRadiusX = Math.min(viewportHeight, viewportWidth) * 0.35;
    this.orbitRadiusY = this.orbitRadiusX * 1.8; // Vertical ellipse - taller
  }
  // Tablet: Slightly more vertical ellipse
  else if (viewportWidth <= 1024) {
    this.orbitRadiusX = Math.min(viewportHeight, viewportWidth) * 0.30;
    this.orbitRadiusY = this.orbitRadiusX * 1.4; // Slightly vertical
  }
  // Desktop: Horizontal ellipse (original behavior)
  else {
    this.orbitRadiusY = Math.min(viewportHeight, viewportWidth) * 0.30;
    this.orbitRadiusX = this.orbitRadiusY * 1.8; // Horizontal ellipse - wider
  }
}
```

**Visual Effect:**
- **Mobile (portrait)**: Vertical ellipse (1.8x taller than wide)
  - Better use of portrait orientation
  - Logo appears centered within orbit
  - More breathing room above/below

- **Tablet**: Slightly vertical ellipse (1.4x taller)
  - Smooth transition between mobile and desktop

- **Desktop (landscape)**: Horizontal ellipse (1.8x wider than tall)
  - Wide, sweeping orbit on large screens
  - Takes advantage of horizontal space

## Media Query Strategy

With fluid `clamp()` handling most responsive needs, media queries are minimal and focus on **layout-specific adjustments** only.

### Tablet (≤1024px) - `styles.css:1864-1876`
```css
@media screen and (max-width: 1024px) {
  .muse-orbit-item {
    touch-action: manipulation; /* Touch optimization */
  }

  .comet-collab-intro-content {
    padding: 0 clamp(1rem, 4vw, 3rem);
  }
}
```

### Mobile (≤768px) - `styles.css:1881-2020`
```css
@media screen and (max-width: 768px) {
  .muse-orbit-item {
    touch-action: manipulation;
    cursor: pointer;
  }

  .white-section {
    padding: 0;
  }

  .comet-panel.active {
    display: flex;
    flex-direction: column; /* Stack desc + steps vertically */
  }

  .comet-panel-subtitle {
    font-size: clamp(12px, 2.8vw, 14px);
  }

  .comet-panel-body {
    font-size: clamp(13px, 3.2vw, 16px);
  }

  .step-title {
    font-size: clamp(13px, 3.4vw, 16px);
  }

  .step-body {
    font-size: clamp(12px, 3vw, 14px);
  }

  .step-addon-badge {
    font-size: clamp(12px, 2.8vw, 14px);
  }

  .pill-opt {
    font-size: clamp(13px, 3vw, 16px);
  }

  .muse-popup-body {
    max-width: 320px;
  }

  .muse-popup-hint {
    font-size: 12px;
    bottom: var(--spacing-md);
  }
}
```

### Small Mobile (≤480px) - `styles.css:2025-2055`
```css
@media screen and (max-width: 480px) {
  .text-section {
    padding: clamp(0.5rem, 3vw, 1rem);
  }

  .muse-popup-hint {
    font-size: clamp(10px, 2vw, 12px);
  }

  .comet-image-item {
    max-width: clamp(90px, 28vw, 140px);
  }
}
```

### `100dvh` / `100svh` Progressive Enhancement

After every `height: 100vh` declaration we add a `height: 100dvh` (or `min-height: 100svh`) override directly below it. This handles iOS Safari's dynamic toolbar: `100vh` on iOS includes the browser chrome area, causing content to be obscured behind the toolbar. `100dvh` (dynamic viewport height) shrinks to match the visible viewport when the toolbar is shown, and `100svh` (small viewport height) always uses the smallest possible viewport (toolbar fully visible). Both are ignored by browsers that do not support dynamic viewport units, so the `100vh` fallback remains active for them.

Example from `styles.css`:
```css
.text-section {
  height: 100vh;
  height: 100dvh; /* iOS Safari toolbar fix */
}

.white-section {
  min-height: 100vh;
  min-height: 100svh; /* Always matches smallest viewport (toolbar visible) */
}
```

## Font Size Minimums (WCAG)

WCAG 2.1 Success Criterion 1.4.4 requires text to be readable at 200% zoom without loss of content. While there is no absolute minimum in the spec, browser default rendering and common practice set **12px as the practical minimum** for legible body text on mobile. All `clamp()` minimum values in the codebase must be ≥12px.

The ≤768px media query (`styles.css:1881-2020`) enforces specific mobile overrides for elements whose base `clamp()` minimum would be too small at portrait widths:

| Selector | Mobile override (min value) | Base value |
|---|---|---|
| `.comet-panel-subtitle` | `clamp(12px, 2.8vw, 14px)` | `clamp(14px, 1.2vw, 16px)` |
| `.comet-panel-body` | `clamp(13px, 3.2vw, 16px)` | `var(--font-h2-size)` |
| `.step-title` | `clamp(13px, 3.4vw, 16px)` | `clamp(20px, 2.5vw, 28px)` |
| `.step-body` | `clamp(12px, 3vw, 14px)` | `clamp(14px, 1.6vw, 18px)` |
| `.step-addon-badge` | `clamp(12px, 2.8vw, 14px)` | `clamp(12px, 1.2vw, 14px)` |
| `.pill-opt` | `clamp(13px, 3vw, 16px)` | `clamp(14px, 1.5vw, 18px)` |

The higher viewport-relative preferred values (e.g. `3.2vw`) in these overrides compensate for the lower minimums: on a 375px wide phone `3.2vw ≈ 12px`, so the preferred and minimum values nearly coincide and the text still scales proportionally as the phone is rotated or the viewport widens.

## Orientation Change Handler

`main.js:939-944` registers a passive `orientationchange` listener that fires after a 300ms timeout (necessary because `window.innerWidth/Height` are not immediately updated on iOS):

```javascript
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    ScrollTrigger.refresh();
    if (phase2Started) { initFireworkDots(); }
  }, 300);
}, { passive: true });
```

**What it does:**
- `ScrollTrigger.refresh()` — recalculates all scroll trigger start/end positions based on the new viewport dimensions. Without this, GSAP scroll animations break after rotation because their pixel offsets were computed for the previous orientation.
- `initFireworkDots()` — conditionally reinitializes the firework/constellation dot system only when `phase2Started` is true (i.e., the user has already scrolled past the intro explosion phase). This reseeds dot positions relative to the new viewport size, preventing dots from rendering off-screen after a landscape → portrait rotation.

The 300ms delay is intentional — less than ~250ms and iOS has not yet committed the new viewport dimensions.

## Responsive Breakpoints Reference

| Breakpoint | Range | Orbit Shape | Typography | Use Case |
|------------|-------|-------------|------------|----------|
| **Small Mobile** | 320px - 480px | Vertical (1.8x tall) | 20-24px H1 | iPhone SE, small Android |
| **Mobile** | 481px - 768px | Vertical (1.8x tall) | 24-30px H1 | Standard smartphones |
| **Tablet** | 769px - 1024px | Slightly vertical (1.4x tall) | 30-36px H1 | iPad, tablets |
| **Desktop** | 1025px - 1440px | Horizontal (1.8x wide) | 36-42px H1 | Laptops, small monitors |
| **Large Desktop** | 1441px+ | Horizontal (1.8x wide) | 42-48px H1 | Large monitors, 4K |

## Accessibility Compliance

All responsive implementations maintain WCAG AA standards:

✅ **Touch Targets:** Minimum 44px × 44px (footer social icons: `clamp(44px, 6vw, 52px)`)
✅ **Text Contrast:** All text maintains sufficient contrast ratios
✅ **Focus Indicators:** 2px outline with 2px offset
✅ **Keyboard Navigation:** Full keyboard access maintained at all sizes
✅ **Screen Reader:** Semantic HTML and ARIA labels remain intact
✅ **Font Size Minimums:** All mobile overrides ≥12px (see "Font Size Minimums (WCAG)" above)

## Performance Considerations

### Benefits of Fluid Design
- **Reduced CSS:** ~200 fewer lines compared to fixed breakpoint approach
- **Fewer Calculations:** Browser handles scaling natively with `clamp()`
- **Smooth Transitions:** No sudden jumps between breakpoints
- **Future-Proof:** Works on any screen size without updates

### Performance Metrics
| Metric | Target | Actual |
|--------|--------|--------|
| Lighthouse Score | 95+ | 95+ all categories |
| FCP | <1.5s | ~1.2s (4G) |
| LCP | <2.5s | ~2.1s (4G) |
| CLS | <0.1 | ~0.05 |

## Testing Checklist

When testing responsive design:

- [ ] **Mobile (320px)**: iPhone SE, small Android devices
- [ ] **Mobile (375px)**: iPhone 12/13/14 Pro
- [ ] **Mobile (414px)**: iPhone Plus models
- [ ] **Tablet (768px)**: iPad portrait
- [ ] **Tablet (1024px)**: iPad landscape
- [ ] **Desktop (1440px)**: Standard laptop
- [ ] **Large (1920px)**: Full HD monitors
- [ ] **4K (2560px+)**: High-resolution displays

**Test scenarios:**
1. Scroll through entire site
2. Interact with Muse orbiting items
3. Open Muse popups on each device
4. Check footer social icons (touch targets)
5. Verify text readability at each size
6. Test keyboard navigation
7. Check with browser zoom (50% - 200%)
8. Rotate device between portrait and landscape

## Common Adjustments

### Making an element more/less responsive
```css
/* Less responsive (narrower range) */
.element {
  width: clamp(100px, 10vw, 120px); /* Only 20px range */
}

/* More responsive (wider range) */
.element {
  width: clamp(80px, 15vw, 200px); /* 120px range */
}
```

### Adjusting minimum sizes for readability
```css
/* If text is too small on mobile, increase minimum */
--font-h2-size: clamp(16px, 1.5vw, 22px); /* Was 14px */
```

### Adjusting maximum sizes for large screens
```css
/* If elements get too large on 4K screens, reduce maximum */
.muse-logo-image {
  width: clamp(150px, 20vw, 280px); /* Was 300px */
}
```

## Troubleshooting

### Issue: Text too small on mobile
**Solution:** Increase the minimum value in `clamp()`
```css
/* Before */
--font-h2-size: clamp(14px, 1.5vw, 22px);

/* After */
--font-h2-size: clamp(16px, 1.5vw, 22px);
```

### Issue: Layout breaks at specific width
**Solution:** Add a targeted media query for that specific case
```css
@media screen and (max-width: 600px) {
  .specific-element {
    /* Adjustment here */
  }
}
```

### Issue: Muse orbit too cramped on mobile
**Solution:** Adjust the orbit radius multiplier in `main.js:2063-2082`
```javascript
// Increase the base radius
this.orbitRadiusX = Math.min(viewportHeight, viewportWidth) * 0.40; // Was 0.35

// Or increase the vertical ratio
this.orbitRadiusY = this.orbitRadiusX * 2.0; // Was 1.8
```

### Issue: Elements overlap at certain viewport sizes
**Solution:** Add `max-width` or adjust the preferred value in `clamp()`
```css
/* Add constraint */
.element {
  max-width: min(90%, 500px);
}

/* Or adjust viewport scaling */
.element {
  width: clamp(100px, 12vw, 200px); /* Was 15vw */
}
```

### Issue: Scroll animations broken after device rotation
**Solution:** The `orientationchange` handler at `main.js:939-944` calls `ScrollTrigger.refresh()` automatically after 300ms. If animations are still misaligned, check that `phase2Started` is correctly set and that `initFireworkDots()` is being called.

## Browser Compatibility

**`clamp()` support:**
- ✅ Chrome 79+ (Dec 2019)
- ✅ Firefox 75+ (Apr 2020)
- ✅ Safari 13.1+ (Mar 2020)
- ✅ Edge 79+ (Jan 2020)

**`100dvh` / `100svh` support:**
- ✅ Chrome 108+ (Nov 2022)
- ✅ Firefox 101+ (May 2022)
- ✅ Safari 15.4+ (Mar 2022)
- ✅ Edge 108+ (Nov 2022)
- Fallback: `100vh` declaration placed before `100dvh`/`100svh` in every rule

**Coverage:** 96%+ of global browsers (as of 2026)

**Fallback for older browsers:**
```css
/* Not needed - target audience uses modern browsers */
/* If needed, add fixed values before clamp() */
.element {
  font-size: 24px; /* Fallback */
  font-size: clamp(20px, 2.5vw, 36px); /* Modern browsers */
}
```

## Related Files

- **Main CSS:** `css/styles.css:41-96` (CSS variables — colors, typography, logos, spacing)
- **Typography:** `css/styles.css:59-71` (font scales)
- **Spacing:** `css/styles.css:79-84` (spacing scales)
- **Muse Orbit:** `js/main.js:2063-2082` (ellipse calculation)
- **Media Queries:** `css/styles.css:1864-2057` (layout adjustments)
- **Orientation Handler:** `js/main.js:939-944` (ScrollTrigger refresh on rotation)

## Changelog

### May 10, 2026 - Documentation Update
- Fixed `--comet-logo-size` value (`clamp(180px, 25vw, 320px)`, was incorrectly listed as `clamp(100px, 15vw, 182px)`)
- Updated all CSS line number references to match current styles.css (2478 lines)
- Updated JS orbit calculation line reference to `main.js:2063-2082`
- Added "Font Size Minimums (WCAG)" section with mobile override table
- Added `100dvh`/`100svh` progressive enhancement note in Media Query Strategy
- Added "Orientation Change Handler" section documenting `main.js:939-944`
- Updated mobile orbit ratio in Breakpoints Reference table (1.8x, was 1.6x)

### March 9, 2026 - Responsive Overhaul
- Converted all typography to `clamp()` for fluid scaling
- Added logo size CSS variables with `clamp()`
- Updated spacing system to use viewport-relative units
- Changed Muse orbit from horizontal to vertical ellipse on mobile
- Simplified media queries from 5 breakpoints to 3
- Removed ~200 lines of hardcoded responsive CSS
- Improved mobile readability and visual balance

---

**Maintained by:** cocoex development team
**Questions?** Check main `CLAUDE.md` or project README
