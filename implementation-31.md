# Implementation Plan: 3.1 — Mobile Scroll & Proportion Fix

**Date:** 2026-04-28
**Status:** Planning — not yet implemented
**Scope:** Fix scroll-driven animations and canvas element proportions on mobile (primary target: iOS Safari)

---

## Problems found in the code

### Problem 1 — Constellation shape is squashed on mobile [NEW — root cause confirmed]

**File:** main.js:562-573 (`initFireworkDots`)

```javascript
// Current code — WRONG
const scaleX = w / CONFIG.refWidth;   // refWidth = 1400
const scaleY = h / CONFIG.refHeight;  // refHeight = 800

const targetX = point.x * scaleX;
const targetY = point.y * scaleY;
```

The constellation reference coordinates were designed on a 1400×800 canvas (landscape desktop).
On mobile portrait (e.g. 390×844):
- scaleX = 390 / 1400 = **0.278** — x compressed to 28% of original
- scaleY = 844 / 800 = **1.055** — y stays nearly the same

The horizontal spread of the constellation (its defining shape) gets crushed to less than
a third of its design width, while the vertical positions barely change. The result is a
completely different silhouette — a narrow vertical cluster instead of the designed wide
spread. This is exactly "squashed" and why it looks nothing like the desktop version.

**Fix — uniform "contain" scaling:**

```javascript
// Correct: scale both axes by the same factor, center the result
const scale = Math.min(w / CONFIG.refWidth, h / CONFIG.refHeight) * 0.85;
const offsetX = (w - CONFIG.refWidth * scale) / 2;
const offsetY = (h - CONFIG.refHeight * scale) / 2;

const targetX = point.x * scale + offsetX;
const targetY = point.y * scale + offsetY;
```

This is the same logic as CSS `object-fit: contain` — the shape maintains its exact
proportions on any screen size. On mobile it will be smaller, but identical silhouette.
The `0.85` factor gives a small margin so dots don't reach the screen edges.

---

### Problem 2 — WebGL shaders: no aspect ratio correction (affects pulse cloud + noise)

**File:** main.js:412–439 (intro starfield + pulse), same pattern in muse/comet gradient shaders

```glsl
// Current — MISSING aspect ratio correction
vec2 uv = gl_FragCoord.xy / u_resolution.xy;
```

**The white hazy cloud / big bang pulse is directly affected by this.**

The pulse calculates its expanding rings using Euclidean distance in raw UV space (line 439):
```glsl
vec2 toCenter = uv - center;
float dist = length(toCenter) + noiseOffset;  // ← no aspect correction
```

On desktop (1440×900, ratio ~1.6:1): pulse expands as a near-circle — looks correct.
On mobile portrait (390×844, ratio ~0.46:1): y-axis covers ~2× more screen space per UV
unit than x. `length(toCenter)` draws equal-distance contours that map to a shape twice
as tall as wide on screen. The dispersive waves and the central glow cloud appear as
**tall vertical ovals instead of circular bursts**.

The cosmic noise clouds (`snoise(uv * 3.0...)`, lines 416–418) have the same problem —
they stretch vertically on portrait viewports, changing the hazy background character.

**Fix — apply aspect ratio to UV before distance and noise calculations:**

```glsl
vec2 uv = gl_FragCoord.xy / u_resolution.xy;
float aspect = u_resolution.x / u_resolution.y;

// Aspect-corrected UV for noise sampling (consistent cloud shapes)
vec2 uvAspect = vec2(uv.x * aspect, uv.y);

// Use uvAspect for all noise calls:
float noise1 = snoise(uvAspect * 3.0 + u_time * 0.05);
float noise2 = snoise(uvAspect * 5.0 - u_time * 0.03 + 50.0);
// etc.

// Aspect-corrected pulse distance (circular waves on any screen):
vec2 toCenter = uv - center;
toCenter.x *= aspect;              // ← correct x to match y scale
float dist = length(toCenter) + noiseOffset;
```

This makes the pulse expand as a true circle and the cloud patterns stay consistent
in shape regardless of whether the screen is portrait or landscape.

---

### Problem 3 — Hard-coded `100vh` (iOS Safari browser chrome bug)

iOS Safari includes the collapsible URL bar in its `100vh` measurement. When the bar
is visible, `100vh` is ~7% larger than the actual visible area, causing fixed-position
sections to overflow and GSAP ScrollTrigger to miscalculate every animation offset.

**Affected lines in styles.css:** 376, 414, 441, 516, 1056, 1339, 1438, 1454

**Fix — progressive enhancement with dvh:**
```css
height: 100vh;     /* fallback for older browsers */
height: 100dvh;    /* dvh = dynamic viewport height, adjusts with iOS chrome */
```

For `min-height` on sections, prefer `100svh` (small viewport height = always-visible area).
Browser support: Safari 15.4+ (2022), Chrome 108+, Firefox 101+.

---

### Problem 4 — `touch-action: none` blocks scroll on mobile

**File:** styles.css:575 — on `.floating-process` elements (comet section images)

```css
touch-action: none; /* blocks ALL touch interaction including vertical scroll */
```

This prevents any touch event — including the vertical scroll gesture — from propagating
on the floating process images. Users cannot scroll through the comet section by touching
those elements. Since drag functionality (task 3.6) is not yet implemented, this is purely
harmful right now.

**Fix:** `touch-action: none` → `touch-action: pan-y`
Allows vertical scrolling while still blocking horizontal drag hijacking.

---

### Problem 5 — `scroll-behavior: smooth` conflicts with GSAP

**File:** styles.css:114

```css
html { scroll-behavior: smooth; }
```

When GSAP ScrollTrigger performs internal scroll adjustments (invalidate, refresh, pin
corrections), the browser's native smooth scroll adds inertia that GSAP doesn't account
for — causing stuttering or position drift on iOS. The `prefers-reduced-motion` block
already disables this (styles.css:118), confirming it was never essential.

**Fix:** Remove `scroll-behavior: smooth` from `html` entirely. GSAP controls all scroll.

---

### Problem 6 — No `ScrollTrigger.normalizeScroll()` for iOS

GSAP provides `ScrollTrigger.normalizeScroll(true)` specifically to normalize iOS Safari's
scroll event model — it prevents momentum scrolling and rubber-band effects from desyncing
the scrub animations. It is not currently called anywhere in main.js.

**Fix — add after registerPlugin, before any ScrollTrigger.create():**
```javascript
if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
  ScrollTrigger.normalizeScroll(true);
}
```

---

### Problem 7 — No orientation change handler

When a user rotates their device, the viewport dimensions change significantly. The current
150ms debounced resize handler fires, but GSAP ScrollTrigger does not always catch
orientation changes as resize events reliably on iOS. All section heights (in vh), canvas
dimensions, and the constellation positions need to be recalculated.

**Fix — add explicit orientationchange listener:**
```javascript
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    ScrollTrigger.refresh();
    // Re-initialize constellation if phase2 has started
    if (phase2Started) { initFireworkDots(); }
  }, 300); // 300ms delay — iOS needs time to settle new dimensions
}, { passive: true });
```

---

### Problem 8 — Duplicate overflow rules on body

**File:** styles.css:34-36 vs 147-148

Two blocks set overflow on body — line 36 sets `overflow-y: scroll`, line 148 sets
`overflow-y: auto` on body alone (overrides the first). The inconsistency signals
accumulated patches and causes `scroll` vs `auto` behavior to be ambiguous.

**Fix:** Remove the line-36 `overflow-y: scroll` declaration, keep line 148 `auto` on body.

---

### Problem 9 — Font sizes below legibility threshold on mobile

**File:** styles.css — mobile breakpoint block (≤768px)

Several text elements in the Stardust/Horizon toggle section have minimum font sizes
that are too small to read comfortably on a phone:

| Element | Current mobile clamp | Problem |
|---------|---------------------|---------|
| `.comet-panel-subtitle` | `clamp(9px, 2.2vw, 11px)` | 9px minimum — unreadable |
| `.comet-panel-body` | `clamp(10px, 2.6vw, 13px)` | 10px minimum — barely legible |
| `.step-body` | `clamp(10px, 2.4vw, 12px)` | 10px minimum — too small |
| `.pill-opt` (toggle) | `clamp(10px, 2.4vw, 12px)` | UI control text too small |
| `.step-title` | `clamp(11px, 2.8vw, 14px)` | tight but borderline |

The `vw`-based middle value is also too aggressive — on a 390px phone, `2.2vw = 8.6px`,
which falls immediately to the floor. The clamp middle value does no work on mobile,
meaning these sizes are always at their minimums on real devices.

**Fix — raise minimum sizes to legible thresholds:**
```css
/* Mobile ≤768px */
.comet-panel-subtitle { font-size: clamp(12px, 2.8vw, 14px); }
.comet-panel-body     { font-size: clamp(13px, 3.2vw, 16px); line-height: 1.5; }
.step-body            { font-size: clamp(12px, 3vw, 14px); }
.step-title           { font-size: clamp(13px, 3.4vw, 16px); }
.pill-opt             { font-size: clamp(13px, 3vw, 16px); }
```

WCAG guideline: 16px body text, 12px absolute minimum for any text. Nothing below 12px.

---

### Problem 10 — Text too close to screen edges in Stardust/Horizon toggle

**File:** styles.css:1887-1893 (mobile), 512-528 (base)

The `.comet-collab-methods` container on mobile uses:
```css
padding: clamp(1rem, 3vw, 1.5rem);  /* ≈ 16px each side on 390px device */
```

16px horizontal padding on a 390px screen leaves 358px for content — workable on
its own, but the panel content (`.comet-panels`) has no padding of its own. The text
in `.comet-panel-body` and `.step-body` runs to within 16px of the physical screen
edge. On a device with a case or gesture areas, this feels uncomfortably close.

The toggle pill (`.comet-toggle-wrap`) at the top also inherits this tight container
and the pill options use `padding: clamp(5px, 1.4vw, 7px) clamp(12px, 3vw, 16px)` —
the horizontal pill padding resolves to ~12px on mobile, making the Stardust/Horizon
labels feel cramped inside the pill.

**Fix — increase horizontal breathing room on mobile:**
```css
/* Mobile ≤768px */
.comet-collab-methods {
  padding: clamp(1.5rem, 5vw, 2rem);        /* was clamp(1rem, 3vw, 1.5rem) */
  padding-top: clamp(3rem, 6vh, 5rem);       /* unchanged */
  padding-bottom: clamp(3rem, 6vh, 5rem);    /* unchanged */
}

.pill-opt {
  padding: clamp(8px, 2vw, 10px) clamp(16px, 4vw, 22px); /* wider horizontal tap area */
}
```

This gives ~24px minimum edge clearance — still tight but noticeably more balanced.

---

### Problem 11 — Horizon panel content risks overflowing viewport on small phones

**File:** styles.css:701, 1892, 1903, 1958

The minimum height stack in the Stardust/Horizon section on mobile:
- `padding-top`: `clamp(3rem, 6vh, 5rem)` → 48px minimum
- Toggle pill: ~44px height
- Gap: `clamp(2.5rem, 6vh, 4rem)` → 40px minimum
- `.comet-panels min-height`: 400px (line 2003)
- **Total minimum: ~532px**

On iPhone SE (375×667px, minus Safari chrome ≈ 580px visible), the Horizon panel
has more content than Stardust (4 steps vs. Stardust's layout) and can push the CTA
button and step 4 below the fold — which the user describes as "text too close to
the bottom edge."

**Fix — reduce min-height and tighten gaps on small phones:**
```css
/* Mobile ≤768px */
.comet-panels { min-height: 320px; }  /* was 400px — let content breathe naturally */

/* Small mobile ≤480px */
.comet-collab-methods {
  gap: clamp(1.5rem, 4vh, 2.5rem);    /* tighter gap to recover vertical space */
  padding-top: clamp(2rem, 5vh, 3rem);
}
.comet-panels { min-height: 280px; }
```

This recovers ~120px of vertical space on small phones without changing desktop layout.

---

## What was NOT a problem

- Viewport meta tag (index.html:5) — correct: `width=device-width, initial-scale=1.0`
- Fixed-position element count — 8 total; all decorative canvases already have
  `pointer-events: none` set, so they don't eat touch events
- Passive event listeners — already in place on scroll handlers (main.js:342)
- GSAP version 3.12.5 — no known iOS-breaking bugs in this version

---

## Execution sequence

### Phase 0 — Diagnose on device (before any code change)
1. Set `DEBUG_ENABLED = true` in main.js:280
2. Open site on real iOS Safari (not DevTools device emulation)
3. Scroll slowly, screenshot console output at the section where scroll breaks
4. This confirms whether Problems 3–6 or Problems 1–2 are causing the main symptom

---

### Phase 1 — Canvas proportions (Problems 1 + 2)
These are pure visual fixes with no scroll side effects — safe to do first.

| Step | File | Change |
|------|------|--------|
| 1a | main.js:568-573 | Replace independent scaleX/scaleY with uniform contain-scale |
| 1b | main.js:412 | Add aspect ratio correction to intro starfield UV |
| 1b | main.js (muse/comet shaders) | Same UV correction in gradient shaders |

Test: open on mobile, confirm constellation has same silhouette as desktop version.

---

### Phase 1b — Text sizing and layout (Problems 9 + 10 + 11)
These are CSS-only changes, isolated to the mobile breakpoint. No JS touched.

| Step | File | Change |
|------|------|--------|
| 1b-i | styles.css:1941-1984 | Raise minimum font sizes in mobile comet panel text |
| 1b-ii | styles.css:1887-1893 | Increase horizontal padding on `.comet-collab-methods` |
| 1b-iii | styles.css:1997 | Increase pill option horizontal padding |
| 1b-iv | styles.css:2002-2004 | Reduce `.comet-panels` min-height on mobile |
| 1b-v | styles.css:2019+ | Add small-mobile (≤480px) gap/padding-top tightening |

Test: open on iOS Safari, check Stardust and Horizon panels. Text should not touch
screen edges. Horizon steps 3–4 and CTA should be visible without scrolling on SE.

---

### Phase 2 — Quick scroll wins (Problems 4 + 5 + 8)

| Step | File | Change |
|------|------|--------|
| 2a | styles.css:575 | `touch-action: none` → `touch-action: pan-y` |
| 2b | styles.css:114 | Remove `scroll-behavior: smooth` from `html` |
| 2c | styles.css:34-36 | Remove duplicate `overflow-y: scroll` block |

Test each independently. These are low-risk and easy to trace if something breaks.

---

### Phase 3 — Viewport height (Problem 3)

Replace all hard-coded `100vh` with `dvh`/`svh` progressive enhancement.
Test all breakpoints: 320px, 390px, 768px, 1024px, 1440px.

---

### Phase 4 — GSAP mobile config (Problems 6 + 7)

Add `normalizeScroll` and `orientationchange` handler in main.js.
Test: rotate device mid-scroll, confirm animations recover correctly.

---

### Phase 5 — Full cross-browser verification

- [ ] iOS Safari (real device): scroll through all sections
- [ ] iOS Safari: constellation shape matches desktop silhouette
- [ ] iOS Safari: rotate device — animations recover
- [ ] Stardust/Horizon toggle: text not touching screen edges at 390px
- [ ] Stardust/Horizon toggle: Horizon panel fully visible on iPhone SE (375px)
- [ ] All panel text reads at ≥12px — check with iOS accessibility display zoom off
- [ ] Android Chrome: full scroll test
- [ ] Desktop Chrome / Firefox / Safari: no regressions
- [ ] Disable `DEBUG_ENABLED` before committing

---

## Risk assessment

| Change | Risk | Reason |
|--------|------|--------|
| Uniform constellation scale | Low | Isolated to initFireworkDots(), visual-only |
| UV aspect ratio correction | Low | Shader change, visual-only, no scroll impact |
| touch-action pan-y | Low | No active drag to break |
| Remove scroll-behavior smooth | Low | GSAP handles scroll; native smooth was redundant |
| Remove duplicate overflow | Low | Second rule already overrides first |
| 100vh → 100dvh | Medium | Affects all section heights; test all breakpoints |
| normalizeScroll(true) | Medium | Changes GSAP's scroll model; verify desktop too |
| orientationchange handler | Low | Additive only, no existing behavior overridden |
| Font size floors raised | Low | Only affects ≤768px breakpoint, CSS-only |
| Horizontal padding increased | Low | More whitespace, no layout structure change |
| Panel min-height reduced | Low | Content still has generous room; only shrinks minimum |

---

## Files to edit

| File | Lines affected |
|------|---------------|
| [css/styles.css](css/styles.css) | 34-36, 114, 376, 414, 441, 516, 575, 1056, 1339, 1438, 1454 |
| [js/main.js](js/main.js) | ~13 (normalizeScroll), ~568-573 (constellation scale), ~412 (UV correction), resize handler (orientationchange) |
| [css/styles.css](css/styles.css) | 1941-1984 (font sizes), 1887-1893 (methods padding), 1997 (pill padding), 2002-2004 (panel min-height), 2019+ (small mobile tightening) |
