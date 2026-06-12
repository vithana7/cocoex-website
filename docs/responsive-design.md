# Responsive Design Decisions

Why the layout looks the way it does at every viewport. For specific values, read `src/styles/*.css` directly (tokens in `tokens.css`, breakpoints in `responsive.css`) — this doc is rationale, not a CSS dump.

## Strategy: `clamp()` Over Media Queries

Typography, logos, spacing, and most component widths use CSS `clamp(min, preferred, max)`. Media queries are reserved for **layout-only** changes (stacking, hiding, tightening padding).

**Why:** smooth scaling between any viewport sizes, no breakpoint pop, fewer rules to maintain.

Token table (defined in `:root` of `src/styles/tokens.css`):

| Token | Range |
|---|---|
| `--font-h1-size` | `clamp(24px, 3vw, 48px)` |
| `--font-h2-size` | `clamp(14px, 1.5vw, 22px)` |
| `--font-lead-size` | `clamp(18px, 1.7vw, 26px)` — lead paragraph tier (between H2 and body) |
| `--font-body-size` | `clamp(20px, 2.5vw, 36px)` |
| `--intro-logo-size` | `clamp(60px, 15vw, 250px)` |
| `--muse-logo-size` | `clamp(150px, 20vw, 300px)` |
| `--muse-orbit-image-size` | `clamp(80px, 12vw, 150px)` |
| `--comet-logo-size` | `clamp(180px, 25vw, 320px)` |
| `--spacing-xs … --spacing-xl` | all `clamp()`-based |

Never hardcode pixel typography. Reference the variable.

## Breakpoint Philosophy

Three layout-only breakpoints plus a landscape height query, all in `src/styles/responsive.css`. Each changes structure, not type scale (with the exception of the mobile font floors below).

| Breakpoint | What changes |
|---|---|
| `≤1024px` Tablet | `touch-action: manipulation` on muse orbit items; comet intro padding |
| `≤768px` Mobile | Comet method panel stacks vertically (`flex-direction: column`, ordered children); mobile font floors; muse-popup body width cap; orbit tap halo; partnership marquee item spacing tightened |
| `≤480px` Small | Tighter mission-overlay padding; comet min-heights reduced |
| `max-height: 500px` | Muse popup card shrinks (height-relative `30vh` sizing) so it fits landscape phones |

## Muse Orbit Ellipse — Adaptive Axis

The orbit aspect ratio is computed continuously from `window.innerWidth / window.innerHeight` inside `MuseScroll.calcRadius` (`src/sections/muse.js`) — there are no breakpoint jumps:

| Viewport aspect | Shape | Why |
|---|---|---|
| ≤ 0.6 (portrait phones) | Vertical, taller axis | Orbit reads as a column, fills available height |
| ~1.0 (square) | Near-circular | Balanced reveal |
| ≥ 1.4 (desktop landscape) | Horizontal, wider axis | Wide sweeping motion |

The interpolation anchors are `aspect 0.6` and `aspect 1.4`, mapped via `t = clamp((aspect - 0.6) / 0.8, 0, 1)`. From `t`, a `horizontalBias` in `[-1, 1]` drives an `ellipseStretch` of up to `1.8×` on the dominant axis. Because it is continuous, resizing or device rotation never "pops" the ellipse.

Each muse also gets depth scaling from `sin(angle)` — front muses scale up (~1.05×), back ones down (~0.65×) — with a matching `zIndex`. The `zIndex` is written only when its rounded value changes (a per-frame stacking-context churn fix), so the orbit reads as a 3D ring on every aspect without thrashing layout.

## Constellation Explosion — Portrait Transpose

The intro constellation (`#constellation-canvas`, `initFireworkDots` in `src/sections/intro.js`) is authored in a landscape **1400×800** reference space. On a desktop that fits fine, but on a portrait phone `Math.min(w/1400, h/800)` picks the tiny width ratio, shrinking the constellation into a small horizontal cluster floating mid-screen.

So when `height > width`, the layout is **transposed 90°**: the fit box becomes `800×1400` and each dot is rotated — ref-x drives the vertical axis, ref-y drives the horizontal (`rx = p.y`, `ry = refWidth - p.x`). The constellation then runs tall and fills the portrait viewport. Desktop/landscape is untouched. `intro.resize()` re-runs `initFireworkDots()` so an orientation flip re-projects cleanly.

## Mobile Scroll & Touch

The comet floating-process images are **non-interactive** — placed once and left to a CSS `float` bob, with `pointer-events: none`. Drag was removed (it conflicted with mobile scroll and the fixed layout reads better); there are no document-level `touchmove` listeners anymore.

The muse orbit auto-rotation pauses for 2s on `touchstart` inside the section (`MuseScroll.attachHandlers`) so mobile users have a stable tap target.

## iOS Safari `100vh` Toolbar Fix

Full-height surfaces declare `height: 100vh` immediately followed by `height: 100dvh` (or `min-height: 100svh`). See `comet.css` (`.section-panel` children), `muse.css` (`.muse-stage`), and `intro.css`. `100vh` on iOS Safari includes the dynamic toolbar area, hiding content behind it; `100dvh` shrinks with the visible viewport and `100svh` uses the smallest viewport. Browsers without these units fall back to the `100vh` declaration above.

## Muse Popup on Short Viewports

`.muse-popup-content` keeps the card's aura glow (box-shadow) unclipped; the close and prev/next controls are popup-level children (`.muse-popup-nav`, viewport-anchored) so copy length never moves them. `.muse-card-wrapper` is `flex-shrink:0` so the flex column can't squash the disc into an oval, and `.muse-popup-body` reserves a constant `min-height` (copy top-aligned) so variable-length descriptions don't shift the disc between muses. On short/landscape phones (`@media (max-height: 500px)` in `responsive.css`) the card stack would exceed the popup, so the media query shrinks `.muse-card-wrapper` to height-relative `clamp(140px, 30vh, 200px)` and tightens gaps instead of switching to scroll — scrolling would clip the glow.

## Resize Handling

`src/main.js` debounces `resize` (150ms) and, on fire, re-injects section heights (`applyHeightsToCss`), resizes every WebGL/2D surface, recomputes the orbit ellipse, and calls `ScrollTrigger.refresh()`. GSAP triggers read live `window.innerHeight` through `timeline.js` px getters with `invalidateOnRefresh: true`, so the refresh recomputes every scrub offset correctly. (There is no separate `orientationchange` handler — the debounced resize covers rotation.)

## Touch Targets

Interactive controls are ≥ 44px (WCAG AA) — muse orbit (with a `.muse-orbit-item::before { inset: -16px }` halo that preserves the transform-based centring) and the popup nav. **Exception:** the footer was deliberately scaled down (~20% mobile / ~50% desktop, via a `min-width:1024px` override since desktop must be *smaller* than mobile — an inverted relationship a single clamp can't express), and as an explicit product decision its social icons drop below 44px on mobile. They're the only sub-44px tap targets.

## Reduced Motion

`@media (prefers-reduced-motion: reduce)` lives in `src/styles/base.css` and disables CSS animations and transitions. The muse popup also honours it in JS: the 3D pointer tilt and the card-switch **flip** are skipped (instant crossfade), and the spiral-galaxy field (`muse-galaxy.js`) renders a **static scatter** (no rotation/inward drift). WebGL canvases continue rendering — they are visual ambience, not motion that triggers a vestibular response.

## Font Size Floors (≤768px)

Several `clamp()` minimums are too small at portrait widths. The `≤768px` query in `responsive.css` overrides specific elements with floors ≥ 11–13px: `.comet-panel-subtitle`, `.comet-panel-title`, `.comet-panel-body`, `.step-num`, `.step-title`, `.step-body`, `.step-addon-badge`, `.pill-opt`, `.comet-cta`. The override `vw` units are tuned so that on a ~375px screen preferred and minimum nearly coincide, then scale back up as the viewport widens.
