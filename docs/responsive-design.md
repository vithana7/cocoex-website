# Responsive Design Decisions

Why the layout looks the way it does at every viewport. For specific values, read `css/styles.css` directly — this doc is rationale, not a CSS dump.

## Strategy: `clamp()` Over Media Queries

Typography, logos, spacing, and most component widths use CSS `clamp(min, preferred, max)`. Media queries are reserved for **layout-only** changes (stacking, hiding, switching ellipse axis).

**Why:** smooth scaling between any viewport sizes, no breakpoint pop, fewer rules to maintain. Removed ~200 lines of fixed responsive CSS during the March 2026 overhaul.

Token table (defined in `:root` of `css/styles.css`):

| Token | Range |
|---|---|
| `--font-h1-size` | `clamp(24px, 3vw, 48px)` |
| `--font-h2-size` | `clamp(14px, 1.5vw, 22px)` |
| `--font-body-size` | `clamp(20px, 2.5vw, 36px)` |
| `--intro-logo-size` | `clamp(60px, 15vw, 250px)` |
| `--muse-logo-size` | `clamp(150px, 20vw, 300px)` |
| `--muse-orbit-image-size` | `clamp(80px, 12vw, 150px)` |
| `--comet-logo-size` | `clamp(180px, 25vw, 320px)` |
| `--spacing-xs … --spacing-xl` | all `clamp()`-based |

Never hardcode pixel typography. Reference the variable.

## Breakpoint Philosophy

Three layout-only breakpoints exist. Each one changes structure, not size.

| Breakpoint | What changes |
|---|---|
| `≤1024px` Tablet | `touch-action: manipulation` on interactive surfaces |
| `≤768px` Mobile | Comet panels stack vertically; mobile-readable font overrides; muse-popup constraints |
| `≤480px` Small | Tighter padding |

## Muse Orbit Ellipse — Adaptive Axis

The orbit aspect ratio is computed continuously from `window.innerWidth / window.innerHeight` inside `MuseScroll.calculateOrbitRadius` — there are no breakpoint jumps:

| Viewport aspect | Shape | Why |
|---|---|---|
| ≤ 0.65 (portrait phones) | Vertical 1.8× tall | Orbit reads as a column, fills available height |
| ~1.0 (square) | Near-circular | Balanced reveal |
| ≥ 1.5 (desktop landscape) | Horizontal 1.8× wide | Wide sweeping motion |

The interpolation between these anchors is smooth, so resizing or device rotation never "pops" the ellipse. Each muse also gets depth scaling derived from `sin(angle)` (front muses ~1.05×, back muses ~0.65×) with matching `zIndex`, so the orbit reads as a 3D ring on every aspect.

## Mobile Scroll: Drag + Touch Coexistence

`FloatingProcesses` uses a **passive** `touchmove` listener on `document`. Scroll is blocked only on the dragged element via `element.style.touchAction = 'none'` (set in `startDrag()`, cleared in `endDrag()`).

**Why passive:** a non-passive document-level `touchmove` listener kills all mobile scroll on the rest of the page. The previous implementation had this and made the site unscrollable on iOS during certain interactions.

## iOS Safari `100vh` Toolbar Fix

Every `height: 100vh` is followed by a `height: 100dvh` (or `min-height: 100svh`). `100vh` on iOS Safari includes the dynamic toolbar area, hiding content behind it. `100dvh` shrinks with the visible viewport; `100svh` always uses the smallest viewport. Browsers without these units fall back to the `100vh` declaration above.

## Orientation Change

`main.js:959–964` listens to `orientationchange` and calls `ScrollTrigger.refresh()` after 300ms. iOS does not commit new viewport dimensions immediately on rotation; refreshing earlier reads stale values and breaks every scrub trigger.

## Touch Targets

All interactive elements are ≥ 44px (WCAG AA). Footer social icons use `clamp(44px, 6vw, 52px)` to give thumb space on phones without inflating on desktop.

## Reduced Motion

`@media (prefers-reduced-motion: reduce)` in `css/styles.css` disables CSS animations, transitions, and the muse-popup particle system. WebGL canvases continue rendering — they are visual ambience, not motion that triggers vestibular response. If that becomes a concern, gate `masterRender()` on the same media query.

## Font Size Floors (≤768px)

Several `clamp()` minimums are too small at portrait widths. The mobile media query overrides specific elements with floors ≥ 12px:

`.comet-panel-subtitle`, `.comet-panel-body`, `.step-title`, `.step-body`, `.step-addon-badge`, `.pill-opt` — see `css/styles.css` § "Responsive Styles - Mobile" for exact values. The override `vw` units are tuned so that on a 375px screen the preferred and minimum nearly coincide, then scale back up as the viewport widens.
