> UPDATED AT: 2026-05-10

# cocoex.xyz — CSS Reference

This document is the authoritative CSS bible for the cocoex website. A developer or AI agent can style new elements, add a section, or modify existing styles by reading this — without parsing 2478 lines of CSS.

---

## File Organization

| Line Range | Section | Key Classes |
|-----------|---------|-------------|
| 1–37 | Scrollbar Styling | `*`, `*::-webkit-scrollbar`, `*::-webkit-scrollbar-thumb` |
| 38–96 | CSS Custom Properties | `:root` — all design tokens |
| 98–155 | Reset & Base | `*`, `html`, `body`, `img`, `@media prefers-reduced-motion` |
| 156–162 | Scroll Container | `.scroll-container` |
| 163–199 | Intro Section (fixed overlay) | `.intro-spacer`, `.intro`, `.intro-canvas`, `.intro-content` |
| 200–222 | Logo Container | `.logo-container`, `.intro-logo` |
| 224–298 | Orbiting Dots | `.orbit-dot`, `.orbit-dot-white`, `.orbit-dot-black`, `.final-dot` |
| 299–347 | Transition Text | `.transition-text`, `.tagline` |
| 336–347 | Constellation Canvas | `.constellation-canvas` |
| 349–360 | Unified Starfield | `.unified-starfield-canvas` |
| 362–405 | Text Section | `.text-section-wrapper`, `.text-section`, `.text-content`, `.reveal-text` |
| 407–422 | White Section | `.white-section` |
| 424–432 | Comet Collab Wrapper | `.comet-collab-wrapper` |
| 433–508 | Comet Collab Intro | `.comet-collab-intro`, `.comet-collab-intro-logo`, `.comet-collab-intro-content`, `.comet-methods-text`, `.method-names` |
| 510–622 | Floating Processes | `.comet-collab-methods`, `.comet-collab-background-canvas`, `.floating-processes`, `.floating-process` |
| 623–695 | Toggle Pill | `.comet-toggle-wrap`, `.comet-pill`, `.pill-slider`, `.pill-opt` |
| 697–857 | Method Panels | `.comet-panels`, `.comet-panel`, `.comet-panel-desc`, `.comet-panel-title`, `.comet-panel-body`, `.comet-steps`, `.step-row`, `.step-title`, `.step-body`, `.step-addon`, `.step-addon-badge` |
| 858–1003 | Comet Image Items | `.comet-images-container`, `.comet-central-logo`, `.comet-image-item`, `.comet-collab-static-logo` |
| 1005–1050 | Method Toggle (legacy) | `.method-toggle-container`, `.method-toggle-btn` |
| 1051–1091 | Comet Connected Images | `.comet-collab-connected-content`, `.comet-connected-images`, `.comet-connection-canvas` |
| 1093–1158 | RSS Feed Ticker | `.rss-feed-section`, `.rss-feed-ticker`, `.rss-ticker-content`, `.rss-ticker-item` |
| 1159–1258 | Step Popup Modal | `.step-popup`, `.step-popup-overlay`, `.step-popup-content`, `.step-popup-close`, `.step-popup-title` |
| 1259–1325 | Footer | `.social-links`, `.social-link`, `.social-icon`, `.footer-logo` |
| 1326–1435 | Muse Intro Page | `.muse-section-wrapper`, `.muse-intro-page`, `.muse-intro-logo`, `.muse-intro-text-top`, `.muse-intro-text-bottom`, `.highlight-muse` |
| 1437–1583 | Muse Section & Orbit | `.white-section-content`, `.muse-section`, `.muse-background-canvas`, `.muse-center-logo`, `.muse-orbit-container`, `.muse-orbit-item` |
| 1584–1860 | Muse Popup | `.muse-popup`, `.muse-popup-starfield`, `.muse-card`, `.muse-card-inside`, `.muse-card-shine`, `.muse-card-glare`, `.muse-popup-image`, `.muse-popup-cause`, `.muse-popup-particles` |
| 1861–1899 | Responsive — Tablet (≤1024px) | Touch adjustments, comet intro padding |
| 1880–2020 | Responsive — Mobile (≤768px) | Layout switches, panel flex, font size reductions |
| 2022–2055 | Responsive — Small Mobile (≤480px) | Fine-tuning, min-heights |
| 2057–2057 | Note: large desktop removed | Handled by `clamp()` |
| 2059–2101 | Utility & Print | `.visually-hidden`, `@media print` |
| 2103–2126 | Events Page Wrapper | `.events-page-wrapper`, `.events-background-canvas` |
| 2127–2191 | Partnership Section | `.partnership-section`, `.partnership-track`, `.partnership-logo` |
| 2192–2336 | Stardust Section | `.stardust`, `.campaign`, `.campaign-num`, `.campaign-status`, `.campaign-name`, `.muse-tag` |
| 2337–2445 | Horizon Section | `.horizon`, `.horizon-proof`, `.proof-cell` |
| 2447–2478 | Events Page Responsive | Tablet + mobile overrides for campaign/horizon |

---

## CSS Custom Properties (`:root` — styles.css:41–96)

### Colors

| Variable | Value | Usage |
|---------|-------|-------|
| `--color-black` | `#000` | Backgrounds, text on light surfaces |
| `--color-white` | `#fff` | Primary text, borders, icon fill |
| `--color-text-outline` | `#fff` | Stroke color for hollow text effect (same as white) |

#### Muse Colors

| Variable | Hex | Muse |
|---------|-----|------|
| `--lunes` | `#5783A6` | Mystery and intuition |
| `--ares` | `#D54D2E` | Passion and courage |
| `--rabu` | `#8CB07F` | Communication and connection |
| `--thunor` | `#F8D86A` | Thunder and strength |
| `--shukra` | `#5E47A1` | Beauty and harmony |
| `--dosei` | `#7F49A2` | Wisdom and structure |
| `--solis` | `#D48348` | Warmth and vitality |

These are used as inline CSS custom properties (`--muse-color`, `--muse-glow`) set by JavaScript on each `.muse-orbit-item` and `.muse-popup` at runtime, not applied via class selectors in the stylesheet.

### Typography

| Variable | Value | Usage |
|---------|-------|-------|
| `--font-canela` | `'canela', Georgia, serif` | All text — set on `body`, inherited everywhere |
| `--font-h1-size` | `clamp(24px, 3vw, 48px)` | Section titles, large headings |
| `--font-h1-height` | `clamp(28px, 3.2vw, 52px)` | Line height for h1 |
| `--font-h1-weight` | `700` | Bold — used for headings, muse names, step titles |
| `--font-h2-size` | `clamp(14px, 1.5vw, 22px)` | Body text, reveal text, comet methods text |
| `--font-h2-height` | `clamp(18px, 1.8vw, 26px)` | Line height for h2/body |
| `--font-h2-weight` | `400` | Regular — used for body copy |
| `--font-body-size` | `clamp(20px, 2.5vw, 36px)` | Middle-size paragraphs |
| `--font-body-height` | `clamp(26px, 3vw, 42px)` | Line height for body |
| `--font-body-weight` | `400` | Regular |

### Responsive Sizes

| Variable | Value | Element |
|---------|-------|---------|
| `--intro-logo-size` | `clamp(60px, 15vw, 250px)` | `.logo-container` width/height during orbit phase |
| `--muse-logo-size` | `clamp(150px, 20vw, 300px)` | `.muse-intro-logo-image`, `.muse-logo-image` |
| `--muse-orbit-image-size` | `clamp(80px, 12vw, 150px)` | `.muse-orbit-item .muse-image` width + height |
| `--comet-logo-size` | `clamp(180px, 25vw, 320px)` | `.comet-collab-intro-logo img` max-width |

### Spacing

| Variable | Value | Usage |
|---------|-------|-------|
| `--spacing-xs` | `clamp(0.25rem, 1vw, 0.5rem)` | Tight gaps, small margins |
| `--spacing-sm` | `clamp(0.5rem, 2vw, 1rem)` | Component internal padding |
| `--spacing-md` | `clamp(1rem, 3vw, 2rem)` | Section padding, text padding |
| `--spacing-lg` | `clamp(2rem, 5vw, 4rem)` | Between major elements |
| `--spacing-xl` | `clamp(3rem, 8vw, 8rem)` | Section-level padding (intro page padding-top/bottom) |

### Transitions

| Variable | Value | Usage |
|---------|-------|-------|
| `--transition-fast` | `0.15s ease-out` | Hover snaps, final dot |
| `--transition-medium` | `0.3s ease-out` | Most hover states, social links, footer |
| `--transition-slow` | `0.5s ease-out` | Intro logo opacity, orbit dot opacity |

### Z-Index Layers

| Variable | Value | Layer Purpose |
|---------|-------|---------------|
| `--z-background` | `1` | WebGL canvases (starfield, gradient) |
| `--z-intro` | `10` | `.intro` fixed overlay during landing |
| `--z-text-section` | `20` | `.text-section` sticky — above intro once scrolled |
| `--z-white-section` | `30` | `.white-section` — Muse + Comet content |

Additional z-index values set directly (not via variables):

| Value | Element | Context |
|-------|---------|---------|
| `0` | `.unified-starfield-canvas` | Fixed background beneath everything |
| `2` | `.intro-content` | Above `.intro-canvas` (WebGL) |
| `3` | `.transition-text` | Above orbit dots |
| `5` | `.comet-collab-intro`, `.muse-intro-page` | Sticky overlay |
| `10` | `.white-section-content`, `.muse-section` | Orbiting layout |
| `20` | `.muse-center-logo`, `.muse-orbit-container` | Above `.muse-section::before` dark overlay |
| `25` | `.muse-orbit-item` | Above dark overlay to prevent dimming |
| `50` | `.comet-collab-methods` | Methods toggle panel — above gradient |
| `100` | `.social-links`, `.footer-logo` | Fixed footer elements |
| `1000` | `.muse-popup`, `.step-popup` | Full-screen modals |

---

## Key Classes Reference

### Base & Reset (1–155)

**`* { scrollbar-width: thin }` — lines 9–11**
Sets thin scrollbar globally for Firefox. `scrollbar-color: rgba(255,255,255,0.2) transparent`.

**`*::-webkit-scrollbar` — lines 15–31**
- 6px wide, transparent track, white-15% thumb with hover to white-30%.

**`@media (prefers-reduced-motion: reduce)` — lines 115–135**
- Forces `animation-duration: 0.01ms` and `transition-duration: 0.01ms` on everything.
- Specifically disables `.comet-collab-bouncing-logo .comet-collab-logo-image` animation.
- Hides `.spark` elements.
- Always add `prefers-reduced-motion` overrides here when adding new animations.

**`body` — lines 144–148**
- `overflow-x: hidden`, `overflow-y: auto`, `font-family: var(--font-canela)`.

---

### Intro Section (163–347)

**`.intro-spacer` — line 166**
- `height: 400vh` — creates the scroll distance for the fixed `.intro` overlay.
- No visual output, purely structural.

**`.intro` — lines 171–180**
- `position: fixed`, full viewport, `z-index: var(--z-intro)` (10).
- `pointer-events: none` — scroll passes through.
- `will-change: opacity` — GSAP animates this out at scroll end of intro section.

**`.intro-canvas` — lines 182–188**
- `position: absolute`, covers `.intro` 100%.
- Houses the WebGL `#bg-canvas` starfield.

**`.intro-content` — lines 190–198**
- `position: absolute`, full size, `z-index: 2` — sits above `.intro-canvas`.
- `pointer-events: none`.

**`.logo-container` — lines 203–214**
- `position: absolute`, centered with `top: 50%; left: 50%; transform: translate(-50%, -50%)`.
- Initial `width: 80px; height: 80px` — GSAP scales this up to `var(--intro-logo-size)` during scroll.
- `will-change: transform, width, height`.

**`.intro-logo` — lines 216–222**
- `opacity: 0` on load — GSAP sets to 1 after load.
- `transition: opacity var(--transition-slow)`.

**`.orbit-dot` — lines 227–235**
- `position: absolute`, `border-radius: 50%`.
- Size: `clamp(10px, 2vw, 16px)`.
- `will-change: transform, opacity` — JS positions via `transform: translate()`.

**`.orbit-dot-white` — lines 237–240**
- `background: var(--color-white)`.
- `animation: pulseWhite 2s ease-in-out infinite`.

**`.orbit-dot-black` — lines 242–247**
- `background: var(--color-black)`, visible as black against white star background.
- `animation: pulseBlack 2s ease-in-out infinite`, `animation-delay: 1s` (offset from white).

**`@keyframes pulseWhite` / `@keyframes pulseBlack` — lines 249–269**
- Both identical: scale 1 → 1.3 → 1 at 50% mark.
- Note: dots use `transform: translate(-50%, -50%)` for centering, so pulse must include this.

**`.final-dot` — lines 274–284**
- `position: absolute`, centered, `opacity: 0`.
- Appears when all orbit dots converge. JS adds `.visible` class.
- `background: var(--color-white)`, `border-radius: 50%`.

**`.final-dot.visible` — lines 286–289**
- `opacity: 1`, `animation: pulseFinal 1.5s ease-in-out infinite`.

**`.transition-text` — lines 303–315**
- `position: absolute`, centered horizontally, offset below center: `transform: translate(-50%, calc(-50% + clamp(180px, 25vw, 280px)))`.
- `opacity: 0` — GSAP fades in at 76% of orbit progress.
- `z-index: 3`, `pointer-events: none`.
- `width: 90%; max-width: 600px`.

**`.transition-text p` — lines 317–328**
- `font-size: clamp(14px, 2vw, 22px)`, white, justified.

**`.transition-text .tagline` — lines 330–334**
- `font-size: clamp(11px, 1.5vw, 16px)`, `font-style: italic`.

**`.constellation-canvas` — lines 339–347**
- `position: absolute`, full `.intro` coverage.
- `pointer-events: none`, `will-change: transform, opacity`.
- JS draws the 7-dot explosion here.

---

### Unified Starfield (349–360)

**`.unified-starfield-canvas` — lines 352–360**
- `position: fixed`, `z-index: 0` — lowest layer, visible beneath Muse and Comet sections.
- `pointer-events: none`.
- Shared canvas for both Muse and Comet sections. Never add `background` to sections above this — use `background: transparent`.

---

### Text Section (362–405)

**`.text-section-wrapper` — lines 365–368**
- `position: relative; height: 250vh` — scroll area for the sticky text.

**`.text-section` — lines 370–382**
- `position: sticky; top: 0`.
- `height: 100vh; height: 100dvh` — dvh override for iOS Safari.
- `z-index: var(--z-text-section)` (20).
- Flex column, centered.

**`.text-content` — lines 384–388**
- `max-width: min(90%, 800px)`.

**`.reveal-text` — lines 390–398**
- `font-size: var(--font-h2-size)`, white, `text-align: justify`.
- `opacity` starts at 0 — GSAP fades in on scroll.

**`.reveal-text em` — lines 400–405**
- **Hollow text effect**: `color: rgba(0,0,0,0)` (transparent fill) + `-webkit-text-stroke: 1px var(--color-white)`.
- This is the outline/stroke letter pattern used on key words. See also `.highlight-muse`, `.stardust-headline em`, `.horizon-headline em`.

---

### White Section (407–422)

**`.white-section` — lines 410–422**
- `position: relative`, `z-index: var(--z-white-section)` (30).
- `background: transparent` — allows `.unified-starfield-canvas` to show through.
- Container for both Muse and Comet content blocks.

---

### Comet Collab Intro (424–508)

**`.comet-collab-wrapper` — lines 427–432**
- `position: relative; height: 600vh` — entire scroll container for both comet sections.

**`.comet-collab-intro` — lines 437–453**
- `position: sticky; top: 0`.
- `height: 100vh; height: 100dvh`.
- `z-index: 5`, `opacity: 1`, `will-change: opacity`.
- Flex column, centered, `gap: clamp(3rem, 8vh, 6rem)`.
- GSAP animates `opacity` to 0 when crossfading to methods section.

**`.comet-collab-intro-logo` — lines 456–459**
- `flex-shrink: 0` — logo doesn't compress in flex layout.

**`.comet-collab-intro-logo img` — lines 461–468**
- `max-width: var(--comet-logo-size)`, `max-height: calc(var(--comet-logo-size) * 0.5)`.
- `filter: drop-shadow(0 4px 12px rgba(255,255,255,0.3))`.

**`.comet-collab-intro-content` — lines 470–479**
- `flex: 0`, centered, `max-width: 800px`.

**`.comet-methods-text` — lines 482–493**
- Identical styling to `.reveal-text`: `font-size: var(--font-h2-size)`, white, `text-align: justify`.
- `opacity: 1 !important` — prevents GSAP from accidentally hiding it during section transitions.

**`.comet-methods-text em` — lines 495–500**
- Same hollow text pattern as `.reveal-text em`: transparent fill + white stroke.

---

### Floating Processes (510–622)

**`.comet-collab-methods` — lines 513–530**
- `position: sticky; top: 0`, full viewport.
- `z-index: 50` — above everything in the comet section.
- `opacity: 0` — GSAP fades in when crossfading from intro.
- `will-change: opacity`.
- Flex column, `align-items: center`, `justify-content: flex-start`, `padding-top: clamp(6rem, 12vh, 8rem)`.

**`.comet-collab-background-canvas` / `.comet-collab-background-canvas-2` — lines 533–542**
- `position: absolute`, full size, `z-index: 1`.
- WebGL gradient canvas sitting behind all content within `.comet-collab-methods`.

**`.comet-collab-methods::before` — lines 544–555**
- Dark overlay `background: rgba(0,0,0,0.4)`, `z-index: 2`.
- Improves text contrast over the WebGL gradient.

**`.floating-processes` — lines 558–566**
- `position: absolute`, full coverage, `z-index: 3`.
- `pointer-events: none` on container — individual `.floating-process` elements override to `auto`.

**`.floating-process` — lines 568–578**
- `position: absolute`, `width/height: clamp(80px, 12vw, 140px)`.
- `animation: float 6s ease-in-out infinite`.
- `touch-action: pan-y` — allows vertical page scroll while enabling horizontal drag.

**`@keyframes float` — lines 595–602**
- `translateY(0px)` → `translateY(-15px)` → `translateY(0px)`.
- Applied to `.floating-process`.

**Delay variants — lines 604–622**

| Selector | Delay |
|---------|-------|
| `.floating-process[data-process="1"]` | `0s` |
| `.floating-process[data-process="2"]` | `1.2s` |
| `.floating-process[data-process="3"]` | `2.4s` |
| `.floating-process[data-process="4"]` | `3.6s` |
| `.floating-process[data-process="5"]` | `4.8s` |

---

### Toggle Pill (624–695)

**`.comet-toggle-wrap` — lines 625–633**
- `position: relative`, `z-index: 10`, `max-width: 500px`, centered.

**`.comet-pill` — lines 636–645**
- `display: inline-flex`, pill shape: `border-radius: 50px`.
- `background: rgba(255,255,255,0.1)`, `border: 1px solid var(--color-white)`.
- `backdrop-filter: blur(10px)`.

**`.pill-slider` — lines 648–658**
- Animated white background behind active option.
- `position: absolute; top: 4px; left: 4px`.
- `width: calc(50% - 4px)`, transitions via `transform: translateX(100%)`.
- `.pill-slider.right` moves slider to second option: `transform: translateX(100%)`.

**`.pill-opt` — lines 664–681**
- `font-size: clamp(14px, 1.5vw, 18px)`, `text-transform: uppercase`.
- `z-index: 2` — sits above `.pill-slider`.
- `flex: 1 1 50%`, `white-space: nowrap`.

**`.pill-opt.active` — line 684–686**
- `color: var(--color-black)` — becomes dark text when slider passes under.

---

### Method Panels (697–857)

**`.comet-panels` — lines 698–706**
- `position: relative; width: 100%; max-width: 1200px`.
- `min-height: 500px` — reserves space during panel transitions.

**`.comet-panel` — lines 709–718**
- `display: none; opacity: 0` by default.

**`.comet-panel.active` — lines 720–727**
- `display: grid; grid-template-columns: 1fr 1fr`.
- `gap: clamp(3rem, 6vw, 6rem)`, `opacity: 1`.
- `animation: fadeInPanel 0.5s ease` — **Note: `@keyframes fadeInPanel` is not defined in this file.** This is a known bug; the panel still appears due to `opacity: 1` but has no entrance animation.

**`.comet-panel-title` — lines 747–757**
- `font-size: clamp(48px, 8vw, 96px)`, bold, uppercase, `line-height: 0.9`.

**`.comet-panel-body` — lines 758–767**
- `font-size: var(--font-h2-size)`, `text-align: justify`.

**`.comet-cta` — lines 769–783**
- Pill-shaped link button: `border: 1px solid var(--color-white)`, `border-radius: 50px`.
- Hover: `background: var(--color-white); color: var(--color-black); transform: translateX(4px)`.

**`.step-row` — lines 803–809**
- `display: grid; grid-template-columns: auto 1fr`.
- `align-items: flex-start`.

**`.step-num` — lines 811–817**
- `font-size: clamp(20px, 2.5vw, 32px)`, bold, white.

**`.step-title` — lines 825–831**
- `font-size: clamp(20px, 2.5vw, 28px)`, bold, uppercase.

**`.step-body` — lines 833–839**
- `font-size: clamp(14px, 1.6vw, 18px)`, `color: rgba(255,255,255,0.8)`.

**`.step-addon-badge` — lines 846–857**
- Pill badge: `background: var(--color-white); color: var(--color-black)`.
- `font-size: clamp(12px, 1.2vw, 14px)`, `border-radius: 20px`.

---

### Comet Image Items (858–1003)

**`.comet-image-item` — lines 887–893**
- `position: absolute`, `max-width: clamp(80px, 12vw, 140px)`.
- `animation: levitate 4s ease-in-out infinite`.
- `will-change: transform, left, top` — JS repositions these.

**`@keyframes levitate` — lines 896–903**
- `translateY(0px)` → `translateY(-10px)` — subtle float, smaller than `.float`.

**Levitate delay variants — lines 906–924**
- `[data-step="1"]`: `0s`, `[data-step="2"]`: `0.8s`, up to `[data-step="5"]`: `3.2s`.

**`.comet-image-item.merging` — lines 950–957**
- Forces `left: 50% !important; top: 50% !important; transform: translate(-50%,-50%) scale(0.3) !important`.
- `opacity: 0.5` — convergence animation state.

**`@keyframes starBlink` — lines 974–981**
- `opacity: 1 → 0.4 → 1` on hover of `.comet-image-item img`.

**`.comet-collab-static-logo` — lines 984–1001**
- `position: absolute; bottom: var(--spacing-xl)`.
- `opacity: 0` — appears during overlay animation (GSAP driven).

---

### Comet Connected Images (1051–1091)

**`.comet-collab-connected-content` — lines 1054–1067**
- `position: sticky; top: 0`.
- `height: 100vh; height: 100dvh`.
- `z-index: 5`, `opacity: 0` — GSAP fades in.
- `will-change: opacity`.

**`.comet-connected-images` — lines 1069–1081**
- `position: relative; max-width: 1200px; height: 60vh`.
- `display: flex; flex-wrap: wrap`, centered.
- `gap: clamp(3rem, 6vw, 6rem)`.

**`.comet-connection-canvas` — lines 1083–1091**
- `position: absolute`, full coverage.
- `pointer-events: none; z-index: 9`.
- Canvas overlay for white connection lines drawn by JS.

---

### RSS Feed Ticker (1093–1158)

**`.rss-feed-section` — lines 1096–1105**
- `position: absolute; bottom: calc(var(--spacing-md) + 140px)`.
- `z-index: 10`.

**`.rss-feed-ticker` — lines 1119–1127**
- `overflow: hidden`, border top/bottom only (`border-left/right: none`).

**`.rss-ticker-content` — lines 1129–1134**
- `display: inline-flex; white-space: nowrap`.
- `animation: ticker-scroll 30s linear infinite`.

**`@keyframes ticker-scroll` — lines 1136–1143**
- `translateX(0)` → `translateX(-50%)` — moves duplicated content to create seamless loop.

---

### Step Popup (1159–1258)

**`.step-popup` — lines 1162–1173**
- `position: fixed`, full viewport, `z-index: 1000`.
- `display: none` by default; `pointer-events: none`.

**`.step-popup.active` — lines 1175–1178**
- `display: flex; pointer-events: auto`.

**`.step-popup-overlay` — lines 1180–1189**
- `background: rgba(0,0,0,0.85)`, `backdrop-filter: blur(10px)`.

**`.step-popup-content` — lines 1191–1200**
- `background: var(--color-white)`, `border-radius: 16px`.
- `max-width: 600px; width: 90%`.
- `box-shadow: 0 20px 60px rgba(0,0,0,0.3)`.

---

### Footer (1259–1325)

**`.social-links` — lines 1262–1273**
- `position: fixed; bottom: calc(var(--spacing-md) + 60px)`.
- Horizontally centered via `left: 50%; transform: translateX(-50%)`.
- `z-index: 100`, `opacity: 0; pointer-events: none` by default.
- GSAP adds `.visible` class via JS when comet section is in view.

**`.social-links.visible` — lines 1275–1278**
- `opacity: 1; pointer-events: auto`.

**`.social-link` — lines 1280–1289**
- `width/height: clamp(44px, 6vw, 52px)` — meets 44px accessibility minimum.
- `border-radius: clamp(10px, 1.5vw, 12px)`.
- `transition` on color, transform, background-color.

**`.social-icon` — lines 1303–1306**
- `width/height: clamp(24px, 4vw, 32px)`.

**`.footer-logo` — lines 1308–1324**
- `position: fixed; bottom: var(--spacing-md)`.
- `width: clamp(120px, 18vw, 172px)`.
- `opacity: 0; pointer-events: none` by default — `.visible` enables it.

---

### Muse Intro Page (1326–1435)

**`.muse-section-wrapper` — lines 1329–1334**
- `position: relative; height: 350vh` — scroll container for muse section.

**`.muse-intro-page` — lines 1337–1353**
- `position: fixed`, full viewport, `z-index: 5`.
- `opacity: 0` — GSAP fades in/out.
- `pointer-events: none` — scroll passes through.
- `will-change: opacity`.

**`.muse-intro-logo` — lines 1355–1362**
- `position: absolute`, perfectly centered in `.muse-intro-page`.
- `z-index: 10`.

**`.muse-intro-logo-image` — lines 1364–1370**
- `width: var(--muse-logo-size)`.
- `filter: brightness(0) invert(1)` — renders any image as pure white (black logo inverted).

**`.muse-intro-text-top` — lines 1372–1392**
- `position: absolute; top: 18%; left: 50%; transform: translateX(-50%)`.
- `font-size: var(--font-h2-size)`, white, `text-align: justify`.
- `max-height: 28vh; overflow: visible`.

**`.muse-intro-text-bottom` — lines 1394–1414**
- `position: absolute; bottom: 18%` — mirrored from top.
- Same typography as `.muse-intro-text-top`.

**`.highlight-muse` — lines 1431–1435**
- **Hollow text effect**: `color: transparent` + `-webkit-text-stroke: 1px var(--color-white)`.
- Apply to any `<span>` wrapping text that should appear as white outline letters.

---

### Muse Section (1437–1583)

**`.white-section-content` — lines 1438–1451**
- `position: sticky; top: 0`.
- `height: 100vh; height: 100dvh`.
- `z-index: 10`, `opacity: 0` — GSAP fades in during crossfade from muse intro page.
- `will-change: opacity`.

**`.muse-section` — lines 1457–1469**
- `width/height: 100vh; 100dvh`, `position: relative`.
- `background: transparent`, `overflow: hidden`.
- `z-index: 10`.

**`.muse-background-canvas` — lines 1472–1480**
- `position: absolute`, full size, `z-index: 1`, `opacity: 0.9`.
- WebGL gradient. `opacity: 0.9` allows slight starfield bleed-through.

**`.muse-section::before` — lines 1483–1493**
- Dark overlay: `background: rgba(0,0,0,0.4)`, `z-index: 2`.
- Darkens WebGL gradient for better text contrast.

**`.muse-center-logo` — lines 1496–1504**
- `position: absolute`, perfectly centered.
- `z-index: 20`, `opacity: 0` — GSAP fades in after crossfade.

**`.muse-logo-image` — lines 1506–1511**
- `width: var(--muse-logo-size)`.

**`.muse-orbit-container` — lines 1514–1522**
- `position: absolute`, full size, centered.
- `z-index: 20` — JS rotates this element to orbit muses.

**`.muse-orbit-item` — lines 1525–1535**
- `position: absolute; top: 50%; left: 50%` — all items start at center.
- JS applies `transform: translate(x, y)` to position along ellipse.
- `will-change: transform`.
- `z-index: 25` — above dark overlay.

**`.muse-orbit-item .muse-image` — lines 1538–1544**
- `width/height: var(--muse-orbit-image-size)`.

**`.muse-orbit-item .muse-text h3` — lines 1561–1574**
- `font-size: var(--font-h2-size)`, bold, uppercase.
- `cursor: pointer`, hover `transform: scale(1.1)`.
- `-webkit-text-stroke: 0.5px rgba(0,0,0,0.3)` — subtle dark outline for legibility.

**`.muse-orbit-item .muse-text p` — lines 1580–1582**
- `display: none` — descriptions hidden in orbit view, shown in popup.

---

### Muse Popup (1584–1860)

**`.muse-popup` — lines 1587–1600**
- `position: fixed`, full viewport, `z-index: 1000`.
- `display: none` initially — GSAP sets to `flex` and animates `opacity`.
- `background: #000` — full black behind the starfield canvas.

**`.muse-popup-starfield` — lines 1602–1610**
- `position: absolute`, full size, `z-index: 1`.
- Canvas for popup-specific starfield.

**`.muse-popup-overlay` — lines 1612–1621**
- `background: rgba(0,0,0,0.3)`, `z-index: 2`.
- `cursor: pointer` — clicking overlay closes popup.

**`.muse-popup-content` — lines 1623–1636**
- `position: relative; z-index: 3`.
- `max-width: min(90%, 500px)`.
- Flex column, centered.

**`.muse-card-wrapper` — lines 1644–1651**
- `width/height: clamp(220px, 28vw, 320px)` — circular card container.
- `perspective: 1000px; transform-style: preserve-3d` — enables 3D tilt.

**`.muse-card` — lines 1661–1675**
- `border-radius: 50%` — circular card.
- `transform: rotateX(var(--rotate-y)) rotateY(var(--rotate-x))` — CSS variables updated by JS on mousemove.
- `box-shadow: ... 0 0 50px var(--muse-glow, rgba(255,255,255,0.4))` — colored glow, `--muse-glow` set per-muse by JS.

**`.muse-card-inside` — lines 1677–1690**
- Radial gradient background: `circle at var(--background-x, 50%) var(--background-y, 50%)` shifts with pointer.
- Uses `var(--muse-color)` — set by JS inline style per muse.

**`.muse-card-shine` — lines 1693–1707**
- Overlay radial gradient following pointer: `circle at var(--pointer-x) var(--pointer-y)`.
- `opacity: calc(var(--pointer-from-center, 0) * 0.8)` — appears only when pointer is away from center.
- `mix-blend-mode: overlay`.

**`.muse-card-glare` — lines 1710–1728**
- Static diagonal glare: `linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 40%...)`.
- `opacity: calc(var(--pointer-from-center) * 0.6)`.
- Shifts position via `translateX/Y` based on `--pointer-from-left` and `--pointer-from-top` CSS vars.

**`.muse-popup-image` — lines 1731–1753**
- `width: 70%; height: 70%` — fills most of the circular card.
- `z-index: 2`, triple `drop-shadow` filter including `--muse-glow` and `--muse-color`.

**`.muse-popup-cause` — lines 1756–1768**
- Label below card: `font-size: clamp(16px, 1.8vw, 20px)`, bold, uppercase.
- `text-shadow: 0 2px 8px rgba(0,0,0,0.5)`.

**`.muse-popup-particle` — lines 1801–1811**
- `width/height: 4px`, `border-radius: 50%`.
- `background: var(--muse-color, #fff)` — colored per muse.
- `animation: float-particle 4s ease-in-out infinite`.

**`@keyframes float-particle` — lines 1813–1828**
- Starts at `(0,0) scale(1) opacity: 0`.
- Fades to `opacity: 0.8` at 10%, holds until 90%, then moves to `var(--particle-x), var(--particle-y)` (set by JS) and fades out.

**`.muse-popup-hint` — lines 1842–1854**
- `position: absolute; bottom: var(--spacing-lg)`.
- `font-size: 14px; color: rgba(255,255,255,0.5)`.
- `animation: fade-hint 2s ease-in-out infinite`.

**`@keyframes fade-hint` — lines 1856–1859**
- `opacity: 0.5 → 0.8 → 0.5`.

---

### Events Page (2103–2478)

**`.events-page-wrapper` — lines 2106–2114**
- `position: relative; min-height: 100vh; 100svh`.
- `background: var(--color-black)`.
- `padding: clamp(4rem, 8vh, 8rem) clamp(2rem, 5vw, 4rem)`.
- `z-index: 40` — above white section (z-index 30).

**`.events-background-canvas` — lines 2117–2125**
- `position: fixed; z-index: -1` — behind events page content.

**`.partnership-section` — lines 2130–2135**
- `max-width: 1400px; margin: 0 auto clamp(6rem, 12vh, 10rem)`.

**`.partnership-slideshow` — lines 2147–2155**
- `overflow: hidden`, `backdrop-filter: blur(10px)`.

**`.partnership-track` — lines 2157–2162**
- `display: flex; animation: partnership-scroll 30s linear infinite`.
- Pauses on hover.

**`@keyframes partnership-scroll` — lines 2168–2175**
- `translateX(0)` → `translateX(-50%)` — seamless infinite scroll (content duplicated in HTML).

**`.partnership-logo` — lines 2177–2185**
- `filter: brightness(0) invert(1)` — all logos rendered white.
- `opacity: 0.7`, hover → `opacity: 1; transform: scale(1.1)`.

**`.stardust` — lines 2195–2199**
- `max-width: 1200px; margin: 0 auto clamp(8rem, 15vh, 12rem)`.

**`.campaign` — lines 2232–2239**
- `display: grid; grid-template-columns: auto 1fr auto`.
- `border-bottom: 1px solid rgba(255,255,255,0.1)`.

**`.campaign-num` — lines 2245–2251**
- `color: rgba(255,255,255,0.4)` — muted numbering.

**`.campaign-status` — lines 2253–2263**
- Pill badge: `border-radius: 20px; padding: 4px 12px`.
- Three state variants:
  - `.status-active`: green `#4CAF50` on `rgba(76,175,80,0.2)` background
  - `.status-open`: blue `#2196F3` on `rgba(33,150,243,0.2)`
  - `.status-archive`: white-30% on white-5%

**`.muse-tag` — lines 2312–2319**
- `font-size: clamp(12px, 1.2vw, 15px)`, uppercase.
- Color applied inline via muse color variables in HTML.

**`.horizon` — lines 2340–2344**
- `max-width: 1200px; margin: 0 auto`.

**`.horizon-header` — lines 2346–2351**
- `display: grid; grid-template-columns: 1fr 1fr`.
- Collapses to single column at ≤1024px.

**`.horizon-proof` — lines 2394–2402**
- `display: grid; grid-template-columns: repeat(3, 1fr)`.
- `background: rgba(255,255,255,0.02); border-radius: 16px`.
- Collapses to single column at ≤1024px.

**`.proof-cell` — lines 2404–2408**
- Flex column, `gap: var(--spacing-sm)`.

---

## Animation Keyframes

| Name | Line | Purpose | Used By |
|------|------|---------|---------|
| `pulseWhite` | 249 | Scale 1→1.3→1 pulse | `.orbit-dot-white` |
| `pulseBlack` | 260 | Scale 1→1.3→1 pulse (offset 1s) | `.orbit-dot-black` |
| `pulseFinal` | 291 | Gentle scale 1→1.1→1 | `.final-dot.visible` |
| `float` | 595 | Vertical translateY 0→-15px | `.floating-process` |
| `levitate` | 896 | Vertical translateY 0→-10px | `.comet-image-item` |
| `starBlink` | 974 | Opacity 1→0.4→1 | `.comet-image-item img:hover` |
| `ticker-scroll` | 1136 | `translateX(0→-50%)` infinite | `.rss-ticker-content` |
| `float-particle` | 1813 | Opacity + translate toward `--particle-x/y` | `.muse-popup-particle` |
| `fade-hint` | 1856 | Opacity 0.5→0.8→0.5 | `.muse-popup-hint` |
| `partnership-scroll` | 2168 | `translateX(0→-50%)` infinite | `.partnership-track` |
| `fadeInPanel` | — | **NOT DEFINED** — referenced in `.comet-panel.active` but missing | `.comet-panel.active` |

---

## Z-Index System

From bottom (behind) to top (in front):

| Z-Index | Element | Notes |
|--------|---------|-------|
| `-1` | `.events-background-canvas` | Behind events page |
| `0` | `.unified-starfield-canvas` | Fixed base layer — always visible |
| `1` | `.comet-collab-background-canvas`, `.muse-background-canvas` | WebGL gradient |
| `2` | `.intro-content`, `.comet-collab-methods::before`, `.muse-section::before` | Dark overlays |
| `3` | `.floating-processes`, `.transition-text` | Above dark overlays |
| `5` | `.comet-collab-intro`, `.comet-collab-connected-content`, `.muse-intro-page` | Sticky panels |
| `10` | `.white-section-content`, `.muse-section`, `.rss-feed-section`, `.comet-toggle-wrap`, `.comet-panels` | Active section content |
| `10` (var) | `.intro` | Fixed landing overlay |
| `20` (var) | `.text-section` | Text on scroll — above intro |
| `20` | `.muse-center-logo`, `.muse-orbit-container` | Above muse dark overlay |
| `25` | `.muse-orbit-item` | Above dark overlay, interactive |
| `30` (var) | `.white-section` | Muse + Comet container |
| `40` | `.events-page-wrapper` | Above all scrolling sections |
| `50` | `.comet-collab-methods` | Methods panel (highest non-modal) |
| `100` | `.social-links`, `.footer-logo` | Fixed footer |
| `1000` | `.muse-popup`, `.step-popup` | Full-screen modals |

---

## Responsive Breakpoints

| Breakpoint | Line Range | What Changes |
|-----------|-----------|--------------|
| `≤1024px` (tablet) | 1864–1876 | `.muse-orbit-item` touch-action; `.comet-collab-intro-content` padding reduced |
| `≤1024px` (events) | 2450–2459 | `.horizon-header` → single column; `.horizon-proof` → single column |
| `≤768px` (mobile) | 1881–2020 | `.white-section` padding 0; `.comet-collab-methods` padding/gap reduced; `.comet-panel.active` → flex column; panel font sizes reduced; `.step-row`, `.step-num`, `.step-title`, `.step-body` all reduced; `.pill-opt` reduced; `.muse-popup-body` narrower |
| `≤768px` (events) | 2461–2478 | `.campaign` → single column; `.campaign-num` reordered; `.partnership-track` gap reduced |
| `≤480px` (small) | 2025–2055 | `.text-section` padding tighter; `.muse-popup-hint` smaller; `.comet-image-item` max-width increased; `.comet-panels` min-height 280px; `.comet-collab-methods` padding reduced |
| `print` | 2077–2101 | Hides intro elements; `.text-section` static; `.reveal-text` black, no filter |

Most sizing is handled fluidly by `clamp()` — these breakpoints only handle layout changes (column counts, flex direction, spacing overrides).

---

## How to Add a New Section's Styles

1. **Where to insert**: Place new section CSS before the `Responsive Styles` block (before line 1861). After the last existing section and before the first `@media` rule.

2. **Use CSS variables for all values**:
   ```css
   .new-section {
     font-family: var(--font-canela);
     color: var(--color-white);
     padding: var(--spacing-xl) var(--spacing-md);
   }
   ```

3. **Add the dvh override after any 100vh height**:
   ```css
   .new-section {
     height: 100vh;
     height: 100dvh; /* iOS Safari fix — must follow immediately */
   }
   ```

4. **If the section is sticky, use this pattern**:
   ```css
   .new-section-wrapper {
     position: relative;
     height: Nvh; /* scroll distance */
   }
   .new-section {
     position: sticky;
     top: 0;
     height: 100vh;
     height: 100dvh;
     z-index: /* choose from Z-Index System above */;
     opacity: 0; /* if GSAP will fade in */
     will-change: opacity;
     background: transparent; /* allow starfield through */
   }
   ```

5. **Add WebGL canvas if needed** (follows `.comet-collab-background-canvas` pattern):
   ```css
   .new-section-canvas {
     position: absolute;
     top: 0;
     left: 0;
     width: 100%;
     height: 100%;
     z-index: 1;
   }
   ```

6. **Add to responsive breakpoints** at lines 1861–2057 only if layout changes (column counts, flex direction). Do not add font-size overrides — use `clamp()` in the base definition.

---

## Common Patterns

### The Hollow / Outline Text Effect

Used in: `.reveal-text em`, `.comet-methods-text em`, `.highlight-muse`, `.stardust-headline em`, `.horizon-headline em`.

```css
/* On any element that should appear as white outline letters */
color: rgba(0, 0, 0, 0);          /* transparent fill */
-webkit-text-stroke: 1px var(--color-white);
text-stroke: 1px var(--color-white);
```

For inline spans (`.highlight-muse`), use `color: transparent` instead of `rgba(0,0,0,0)`.

### The WebGL Canvas Positioning Pattern

All background canvases follow the same pattern. Choose `position: absolute` (within a section) or `position: fixed` (global layer):

```css
/* Absolute — scoped to parent section */
.section-background-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;          /* behind content overlays (z-index 2+) */
  pointer-events: none;
}

/* Fixed — global background */
.global-background-canvas {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;          /* absolute bottom */
  pointer-events: none;
}
```

### The Sticky Section Pattern

Every major scroll-driven section uses this:

```css
.section-wrapper {
  position: relative;
  height: Nvh;            /* total scroll distance for this section */
  background: transparent;
}

.section-content {
  position: sticky;
  top: 0;
  width: 100%;
  height: 100vh;
  height: 100dvh;         /* always include dvh immediately after vh */
  z-index: N;
  opacity: 0;             /* GSAP will fade in */
  will-change: opacity;
  background: transparent;
}
```

---

## Rules (Never Break These)

- **Never use `!important`** except for specificity conflicts. The only legitimate uses in this file: `prefers-reduced-motion` block (lines 123–127), `.comet-image-item.merging` override (lines 952–956), `.comet-methods-text` opacity lock (line 491). Always add an inline comment explaining why.

- **Never use floats for layout.** Grid and Flexbox only.

- **Never hardcode values that have CSS variables.** Colors must use `--color-*`. Fonts must use `--font-*`. Spacing must use `--spacing-*`. Logo sizes must use the `--*-logo-size` variables.

- **Always add `height: 100dvh` after `height: 100vh`.** iOS Safari ignores 100vh for the visible viewport area. The dvh unit line must immediately follow the vh line.

- **Font sizes: minimum `clamp()` first value is 12px on mobile.** No text smaller than 12px even at narrowest viewport.

- **Touch targets: minimum 44px.** Interactive elements must be at least `clamp(44px, ...)`. Social icons are `clamp(44px, 6vw, 52px)`.

- **Never create multiple RAF loops.** All WebGL animation must go through the master render loop in `main.js:667–727`.

- **`background: transparent` on all sticky sections.** The `.unified-starfield-canvas` must always be visible. Never set `background: var(--color-black)` on a sticky section that overlaps the starfield zone.
