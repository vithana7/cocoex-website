# cocoex

A vibrant DAO blending art, blockchain, community and social impact.

## About

cocoex aims to cultivate a vibrant community where art and impactful change coexist in harmonious synergy. We bring artists, creators and collectors together to support and inspire one another, creating a sense of unity and shared purpose.

## Website Overview

The cocoex website is a scroll-driven interactive experience built with modern web technologies and minimalist design principles. The site features four main sections with smooth GSAP-powered transitions and WebGL visual effects.

### Site Structure

**Total Scroll Height:** ~1440vh (heights are injected from `src/scroll/timeline.js`)

1. **Intro + Mission** - 640vh (orbit → transition text → constellation explosion → mission reveal)
2. **Muse Portfolio** - 400vh (one overlapping sticky panel: intro → orbit)
3. **Comet Collab** - 400vh (two sequential 200vh sticky panels: intro, methods)
4. **Events + Footer** - static, at the end of the flow

### Features

#### 1. Animated Introduction + Mission (640vh)

**Scroll-driven, five timeline phases:**

- **Orbit (192vh)**: orbiting white and black dots converge to center while the logo scales up with 2 full rotations
- **Transition text (48vh)**: a short line fades in below the logo, holds, then fades out
- **Explosion (140vh)**: seven colored dots explode from center into a 3D constellation (z-depth layering, big-bang pulse), then settle and hold
- **Mission reveal (100vh)**: the constellation + cosmic-noise backdrop fade out, then the mission statement fades in (centered)
- **Mission hold (160vh)**: the mission holds fully readable, then fades out into the Muse section

**Technical Features:**
- WebGL cosmic-noise starfield background with a dispersive big-bang pulse
- Z-depth rendering for the 2D-canvas constellation dots
- Mission and intro overlay torn down at the true (unbuffered) intro end

#### 2. Muse Portfolio (400vh, one overlapping panel)

**Interactive orbiting layout featuring seven muses:**

**Scroll Breakdown (within the panel):**
- **0-100vh**: intro logo + copy fade up over the black starfield
- **100-300vh**: intro holds fully readable
- **300-400vh**: background flips black→white, the center logo crossfades, the orbit takes over

**The Seven Muses (cause per muse):**
- **Lunes** (#5783A6) - Water
- **Ares** (#D54D2E) - Reforestation
- **Rabu** (#8CB07F) - Human Rights
- **Thunor** (#F8D86A) - Renewable Energy
- **Shukra** (#5E47A1) - Bio-diversity
- **Dosei** (#7F49A2) - Zero Hunger
- **Solis** (#D48348) - Well-being

**Interactive Features:**
- Continuous orbital rotation on an adaptive ellipse (axis follows viewport aspect)
- Click a muse to open a detailed modal (3D tilt card, colored aura, 12 particles)
- Keyboard navigation (Tab, Enter/Space, Escape) with focus trap
- Auto-rotation pauses 2s on touch for a stable tap target

**Visual Effects:**
- Inverted starfield backdrop (black stars on off-white) via the shader factory
- Unified starfield shared with the Comet section

#### 3. Comet Collab (400vh, two sequential 200vh panels)

**Two-method impact ecosystem:**

**Panel 1 — Intro (200vh):** white Comet Collabs logo (CSS-positioned), methods copy, and 5 **draggable** floating process images connected by a faint 2D-canvas starline that redraws live as they bob/drag.

**Panel 2 — Methods (200vh):** a pill toggle switches between the Stardust and Horizon flows (`.active` panels, no inline onclick).

**Methods Explained:**
- **Stardust**: artists select a cause, create a work, launch a fundraising campaign, and split proceeds with the partner NGO
- **Horizon**: a Future Lab where communities collectively define a cause and partner, then turn it into art and impact (adds a `+Horizon` step)

**Visual Features:**
- Inverted starfield backdrop via the shader factory
- 5 draggable process images joined by a live starline (`process-links.js`)

#### 4. Events + Footer

**Static, at the end of the flow:**

- Partnership logo marquee (5 logos, duplicated track for a seamless CSS loop)
- Social links: Telegram, Instagram, LinkedIn (touch targets ≥ 44px)
- cocoex text logo
- Keyboard accessible

## Tech Stack

### Core Technologies
- **HTML5** - Semantic markup with ARIA labels
- **CSS3** - Custom properties, Grid, Flexbox
- **Vanilla JavaScript** - ES modules, bundled by Vite
- **Vite** (`^5.4.0`) - Dev server + production build
- **GSAP 3.12.5** + **Lenis 1.3.4** - npm dependencies, imported as ES modules (not CDN)
- **WebGL** - Custom GLSL shaders for visual effects

### Architecture
- ES modules under `src/` (no IIFE, no global scope) — single entry `/src/main.js`
- Single gated `Renderer` RAF loop (renders only on-screen WebGL layers)
- Declarative scroll pacing in `src/scroll/timeline.js` (one `PHASES` array drives CSS heights + GSAP offsets)
- Shared GLSL utilities + one parameterised starfield shader factory
- Passive event listeners + debounced resize (150ms)

### Typography
- **Font:** Canela (Bold 700, Regular 400) via Adobe Fonts
- **Fallback:** Georgia, serif
- Responsive type scale (18-48px for H1, 12-22px for H2)

## Project Structure

```
cocoex-website/
├── index.html              # Single module entry (<script type="module" src="/src/main.js">)
├── package.json            # type:module; gsap, lenis deps; vite devDep
├── vite.config.js          # base './', target es2018, outDir dist, port 5173
├── src/
│   ├── main.js             # boot(): wire scroll, WebGL surfaces, sections
│   ├── data.js             # CONFIG, MUSES, PARTNERS, constellation geometry, easing
│   ├── scroll/             # timeline.js (PHASES), smooth-scroll.js, section-gate.js
│   ├── webgl/              # renderer.js, gl-context.js, starfield.js, intro-starfield.js, shaders/
│   ├── sections/           # intro.js, muse.js, comet.js, events.js
│   ├── ui/                 # focus-trap.js, muse-popup.js, floating-processes.js, process-links.js
│   └── styles/             # tokens, base, intro, muse, comet, events-footer, responsive
├── public/
│   └── assets/images/      # served at site root (muse/, comet-collabs/, partnerships/)
├── tools/
│   └── coordinate-picker.html  # Dev tool for constellation positioning
├── README.md               # This file
└── CLAUDE.md               # Project context for Claude Code
```

## Performance

### Bundle
- `npm run build` emits a hashed, minified, tree-shaken bundle to `dist/` (JS + CSS + copied `public/` assets).
- GSAP, ScrollTrigger and Lenis are bundled in (no separate CDN request).
- Images (~1MB total) are emitted as files (`assetsInlineLimit: 0`) and lazy-loaded.
- Run `npm run build && du -sh dist` for current sizes.

### Performance Benchmarks
- **Lighthouse Score**: 95+ (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: <1.5s on 4G
- **Largest Contentful Paint**: <2.5s on 4G
- **Time to Interactive**: <3s on 4G
- **Cumulative Layout Shift**: <0.1
- **WebGL Rendering**: 60fps desktop, 30fps mobile

### System Requirements

**Minimum:**
- Modern browser (Chrome 90+, Safari 14+, Firefox 88+, Edge 90+)
- WebGL 1.0 support
- 2GB RAM
- iPhone 8 / Galaxy S9 equivalent (2017+)

**Recommended:**
- Desktop: 8GB RAM, dedicated GPU
- Mobile: 4GB RAM, recent device (2020+)
- High-speed internet (4G+)

### Optimization Strategies

**Animation Performance:**
- Hardware-accelerated properties only (`transform`, `opacity`)
- GSAP ScrollTrigger with `scrub: true` for 60fps interpolation
- Extended scroll durations (100vh+ per timeline phase)
- Single gated `Renderer` RAF loop renders only on-screen WebGL layers
- No per-frame `shadowBlur` (starline) and no per-frame zIndex writes (orbit) — measured jank fixes

**WebGL Optimization:**
- Shared GLSL utilities + one parameterised starfield shader factory
- Shared RAF timestamp across surfaces
- Mobile DPR capped at 2x (reduces pixel count by ~33% on high-DPI devices)
- 4 WebGL contexts total (intro + unified starfield + muse + comet backdrops)

**Loading Performance:**
- Passive event listeners for scroll/resize
- Debounced resize handler (150ms)
- Declarative `timeline.js` (one source of truth) prevents cascading changes
- Lazy image loading

### Known Limitations

- **Battery Usage**: Extended viewing on mobile drains battery (WebGL rendering)
- **Low-End Devices**: May drop below 30fps during constellation animation
- **High DPI Displays**: WebGL canvas scales to device pixel ratio (higher memory usage)
- **Safari**: Rare `backdrop-filter` glitch on rapid scroll
- **Chrome DevTools**: ~30% WebGL performance reduction when DevTools open

## Accessibility

- ✅ Semantic HTML5 elements (`<section>`, `<article>`, `<footer>`)
- ✅ ARIA labels for interactive/decorative elements
- ✅ Keyboard navigation (Tab, Escape)
- ✅ Focus visible styles (2px outline + 2px offset)
- ✅ `prefers-reduced-motion` support (disables animations + particles)
- ✅ WCAG AA color contrast standards
- ✅ Touch targets minimum 44px (52px for social icons)
- ✅ Screen reader friendly (decorative elements `aria-hidden="true"`)

## Browser Support

| Browser | Minimum Version | Notes |
|---------|----------------|-------|
| Chrome | 90+ | Best performance |
| Firefox | 88+ | Full support |
| Safari | 14+ | Occasional backdrop-filter glitch |
| Edge | 90+ | Full support |

**Requirements:**
- WebGL 1.0 support
- CSS Grid and Flexbox
- ES6+ JavaScript (const, let, arrow functions, async/await)
- CSS Custom Properties (variables)

## Getting Started

### Local Development

```bash
npm install        # first time only
npm run dev        # Vite dev server (auto-opens http://localhost:5173)
npm run build      # production bundle → dist/
npm run preview    # serve the built dist/ locally
```

### Development Tools

**Coordinate Picker** (`tools/coordinate-picker.html`)
- Interactive tool for positioning constellation dots
- Click to save coordinates, exports as normalized (0-1) values
- Keyboard shortcuts: Z (undo), C (clear all)

**Browser DevTools:**
- Chrome DevTools: Performance profiling, WebGL debugging
- Lighthouse: Performance audits (target 95+)
- axe DevTools: Accessibility testing

## Design Principles

1. **Minimalism First** - Every element serves a purpose, question everything
2. **Performance Budget** - Target 95+ Lighthouse score, <3s TTI
3. **Mobile-First** - Responsive from 320px to 1920px+
4. **Accessibility** - WCAG AA compliant, keyboard navigation, reduced motion support
5. **Semantic HTML** - Meaningful markup over divs
6. **Progressive Enhancement** - Core content works without JavaScript

## Code Standards

### CSS Best Practices
- Design tokens (`:root`) in `src/styles/tokens.css`; `clamp()` over media queries
- `clamp()` for type/spacing; media queries reserved for layout-only changes
- One stylesheet per concern under `src/styles/`
- Hardware acceleration via `transform`/`opacity`
- Avoid `!important` (exceptions: specificity conflicts, reduced motion overrides)

### JavaScript Best Practices
- Small ES modules under `src/` (no IIFE, no global scope); one entry `/src/main.js`
- Scroll pacing centralized in `src/scroll/timeline.js` (declarative `PHASES`)
- Shared GLSL imported from `src/webgl/shaders/`; one starfield shader factory
- Debounced resize, passive event listeners
- Single gated `Renderer` RAF loop

### HTML Best Practices
- Semantic HTML5 elements (avoid div soup)
- W3C valid markup
- SEO: meta description, Open Graph, Twitter cards
- External links: `rel="noopener noreferrer"`
- Descriptive `alt` text on all images
- Decorative elements: `aria-hidden="true"`

## Dependencies

npm dependencies, imported as ES modules and bundled by Vite (no CDN `<script>` tags):

- [GSAP 3.12.5](https://greensock.com/gsap/) - Animation framework + ScrollTrigger (`import { gsap } from 'gsap'`)
- [Lenis 1.3.4](https://github.com/darkroomengineering/lenis) - Smooth scroll (`import Lenis from 'lenis'`)
- [Vite ^5.4.0](https://vitejs.dev/) - Dev server + build tooling (devDependency)

Loaded via `<link>` in `index.html` (the one remaining external resource):

- [Adobe Fonts (Typekit)](https://fonts.adobe.com/) - Canela font family (kit ID `afs8ors`)

## Testing

### Pre-Deployment Checklist

- [ ] Cross-browser test (Chrome, Firefox, Safari, Edge)
- [ ] Responsive validation (320px → 1920px+)
- [ ] Lighthouse audit (target 95+ score in all categories)
- [ ] HTML validation (W3C validator)
- [ ] Keyboard navigation test (Tab, Escape)
- [ ] `prefers-reduced-motion` verification
- [ ] Mobile device testing (iOS Safari, Android Chrome)
- [ ] Touch interaction testing (44px+ targets)

### Testing Tools

- **Chrome DevTools** - Performance profiling, network analysis, WebGL debugging
- **Lighthouse** - Performance, accessibility, SEO audits
- **axe DevTools** - WCAG compliance testing
- **W3C HTML Validator** - Markup validation
- **BrowserStack/LambdaTest** - Cross-browser testing

## Debugging

### Common Issues

**Canvas flickering:** Double transformation - check that manual rotation and CSS transform aren't both applied.

**CSS not applying:** Specificity conflicts - use `window.getComputedStyle()` to debug, consider `!important` for overrides.

**Scroll position reads 0:** Use multiple fallback sources with OR operator (`window.scrollY || window.pageYOffset || document.documentElement.scrollTop`).

**WebGL performance drops:** off-screen layers should be gated out by section; cap mobile DPR at 2x; reuse the starfield factory.

**Animations too fast/jerky:** increase the relevant phase `vh` in `src/scroll/timeline.js` `PHASES` (minimum 100vh per scroll-driven phase for 60fps).

See `CLAUDE.md` for detailed debugging techniques and troubleshooting guide.

## License

All rights reserved. cocoex 2024-2026.

## Contact

- **Website**: [cocoex.xyz](https://cocoex.xyz)
- **Telegram**: [t.me/coco_ex](https://t.me/coco_ex)
- **Instagram**: [@cocoex_](https://instagram.com/cocoex_)
- **LinkedIn**: [company/cocoex](https://www.linkedin.com/company/cocoex/)

---

**Last Updated:** June 10, 2026
