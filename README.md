# cocoex

A vibrant DAO blending art, blockchain, community and social impact.

## About

cocoex aims to cultivate a vibrant community where art and impactful change coexist in harmonious synergy. We bring artists, creators and collectors together to support and inspire one another, creating a sense of unity and shared purpose.

## Website Overview

The cocoex website is a scroll-driven interactive experience built with modern web technologies and minimalist design principles. The site features four main sections with smooth GSAP-powered transitions and WebGL visual effects.

### Site Structure

**Total Scroll Height:** ~1570vh (15.7x viewport height)

1. **Intro Animation** - 0 to 400vh
2. **Mission Text** - 400 to 550vh
3. **Muse Portfolio** - 550 to 820vh
4. **Comet Collab** - 820 to 1570vh

### Features

#### 1. Animated Introduction (0-400vh)

**Scroll-driven animation in three phases:**

- **Phase 1 (0-40%)**: Orbiting white and black dots converge to center while logo scales from 80px to 250px with 2 full rotations
- **Phase 2 (30-50%)**: Transition text "art as infrastructure for change" appears below logo at 76% orbit progress
- **Phase 3 (50-100%)**: Constellation explosion - seven colored dots explode into 3D constellation pattern with depth layering

**Technical Features:**
- WebGL starfield background with twinkling stars and simplex noise
- Big bang pulse effect (dispersive wave from center)
- Z-depth rendering for constellation dots (-0.5 to 0.6 range)
- Hardware-accelerated animations using GSAP ScrollTrigger

#### 2. Mission Statement (400-550vh)

**Simple fade-in text reveal:**

- cocoex mission and philosophy
- Description of comet collab ecosystem
- Stardust and Horizon methods
- Muse framework introduction

**Optimization:**
- Reduced from 350vh to 150vh for smoother scroll
- Removed word highlighting for better performance
- Pure opacity transition (60fps on most devices)

#### 3. Muse Portfolio (550-820vh)

**Interactive orbiting layout featuring seven muses:**

**Scroll Breakdown:**
- **0-150vh**: Black intro page with Muse logo and description
- **150-270vh**: Smooth crossfade transition (120vh)
- **270vh+**: Orbiting muse layout visible

**The Seven Muses:**
- **Lunes** (#5783A6) - Mystery and intuition
- **Ares** (#D54D2E) - Passion and courage
- **Rabu** (#8CB07F) - Communication and connection
- **Thunor** (#F8D86A) - Thunder and strength
- **Shukra** (#5E47A1) - Beauty and harmony
- **Dosei** (#7F49A2) - Wisdom and structure
- **Solis** (#D48348) - Warmth and vitality

**Interactive Features:**
- Continuous 240-second orbital rotation (horizontal ellipse)
- Click muse image or name to open detailed modal
- Colored aura effects in popup (unique to each muse)
- Floating particle animations
- Keyboard navigation (Tab, Escape)

**Visual Effects:**
- WebGL animated gradient (7-color blend with simplex noise)
- Unified starfield background (shared with Comet section)
- GSAP-driven smooth animations

#### 4. Comet Collab (820-1570vh)

**Two-method impact ecosystem:**

**Scroll Breakdown:**
- **0-120vh**: Intro page with white Comet logo and methods description
- **120-400vh**: Logo descends to bottom, text moves up (280vh animation)
- **400-520vh**: Crossfade transition to connected images (120vh)
- **520vh+**: Static display of 5 process images with WebGL background

**Methods Explained:**
- **Stardust**: Artist-driven fundraising campaigns where artists select causes, create works, and split proceeds with organizations
- **Horizon**: Future Lab where communities move through four steps (Critique → Realisation) to transform shared vision into art and real-world change

**Visual Features:**
- WebGL animated gradient background (identical shader to Muse section)
- Unified starfield beneath gradient
- 5 connected process images displaying methodology
- Smooth scroll-driven logo animation with reversible motion

#### 5. Footer

**Fixed positioning, revealed at page end:**

- Social links: Telegram, Instagram, LinkedIn
- Touch-friendly targets (52px minimum)
- Hover states with scale transform
- cocoex text logo (172px width)
- Keyboard accessible

## Tech Stack

### Core Technologies
- **HTML5** - Semantic markup with ARIA labels
- **CSS3** - Custom properties, Grid, Flexbox
- **Vanilla JavaScript** - ES6+ with IIFE pattern
- **GSAP 3.12.5** - ScrollTrigger animation library
- **WebGL** - Custom GLSL shaders for visual effects

### Architecture
- IIFE module pattern with namespace isolation
- Master render loop (consolidates all WebGL animations)
- Centralized timing constants (`SCROLL_TIMING`)
- Shared GLSL utilities (simplex noise, star field rendering)
- Passive event listeners + debounced resize (150ms)

### Typography
- **Font:** Canela (Bold 700, Regular 400) via Adobe Fonts
- **Fallback:** Georgia, serif
- Responsive type scale (18-48px for H1, 12-22px for H2)

## Project Structure

```
cocoex-website/
├── index.html              # Main HTML structure
├── css/
│   └── styles.css          # Styling with CSS custom properties (1729 lines)
├── js/
│   └── main.js             # Animation logic (2617 lines)
├── assets/
│   ├── images/
│   │   ├── logowhite.png
│   │   ├── cocoex-text.png
│   │   ├── muse/           # 7 muse images + logo
│   │   └── comet-collabs/  # 5 process images + logos
│   └── fonts/              # (via Adobe Fonts CDN)
├── tools/
│   └── coordinate-picker.html  # Dev tool for constellation positioning
├── README.md               # This file
└── CLAUDE.md              # Project context for Claude Code
```

## Performance

### Bundle Size
- **HTML**: 10.2KB (~3.5KB gzipped)
- **CSS**: 38.4KB (~9.2KB gzipped)
- **JavaScript**: 92KB (~23KB gzipped)
- **Total Core**: 140.6KB (~35.7KB gzipped)
- **GSAP CDN**: 47KB (cached after first load)
- **Images**: ~1MB total (lazy loaded)

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
- Extended scroll durations (100vh+ per animation phase)
- Master render loop consolidates all animations
- `will-change` hints on animated elements

**WebGL Optimization:**
- Shared GLSL utilities reduce code duplication
- Cached WebGL program state (minimizes GPU context switches)
- Mobile DPR capped at 2x (reduces pixel count by 33% on high-DPI devices)
- Early exit in shader star generation
- 4 WebGL canvases total (intro, unified starfield, muse gradient, comet gradient)

**Loading Performance:**
- Passive event listeners for scroll/resize
- Debounced resize handler (150ms)
- Z-index layering minimizes repaints
- Centralized `SCROLL_TIMING` prevents cascading changes
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
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx serve . -l 8000

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

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
- CSS custom properties in `:root` for theming
- Mobile-first responsive design (min-width media queries)
- Section-based organization with header comments
- Hardware acceleration via `transform`/`opacity`
- Avoid `!important` (exceptions: specificity conflicts, reduced motion overrides)

### JavaScript Best Practices
- IIFE pattern for global scope isolation
- Module structure: CONSTANTS → DOM → STATE → UTILS → MODULES → INIT
- Centralized timing via `SCROLL_TIMING` object
- Shared GLSL code via `GLSL_UTILS` object
- Debounced resize, passive event listeners
- Master render loop consolidates animations

### HTML Best Practices
- Semantic HTML5 elements (avoid div soup)
- W3C valid markup
- SEO: meta description, Open Graph, Twitter cards
- External links: `rel="noopener noreferrer"`
- Descriptive `alt` text on all images
- Decorative elements: `aria-hidden="true"`

## Dependencies

External libraries loaded from CDN:

- [GSAP 3.12.5](https://greensock.com/gsap/) - Animation framework (core library)
- [ScrollTrigger](https://greensock.com/scrolltrigger/) - Scroll-based animation plugin
- [MotionPathPlugin](https://greensock.com/docs/v3/Plugins/MotionPathPlugin) - Path-based animations (registered, minimal usage)
- [Adobe Fonts (Typekit)](https://fonts.adobe.com/) - Canela font family

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

**WebGL performance drops:** Cache WebGL program state, cap mobile DPR at 2x.

**Animations too fast/jerky:** Increase scroll duration values in `SCROLL_TIMING` (minimum 2-3vh per phase for 60fps).

See `CLAUDE.md` for detailed debugging techniques and troubleshooting guide.

## License

All rights reserved. cocoex 2024-2026.

## Contact

- **Website**: [cocoex.xyz](https://cocoex.xyz)
- **Telegram**: [t.me/coco_ex](https://t.me/coco_ex)
- **Instagram**: [@cocoex_](https://instagram.com/cocoex_)
- **LinkedIn**: [company/cocoex](https://www.linkedin.com/company/cocoex/)

---

**Last Updated:** March 9, 2026
