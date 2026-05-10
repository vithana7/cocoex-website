> UPDATED AT: 2026-05-10

# cocoex.xyz — Behavior Specification & Test Checklist

## How to use this doc

This is the source of truth for expected behavior on cocoex.xyz. Run the bug checklists after every change to verify no regressions.

---

## Scroll Map

| Section | Scroll Range (vh) | HTML Element | Position Type |
|---|---|---|---|
| Landing | 0–400vh | `.intro` | Fixed overlay |
| Mission Text | 400–550vh | `.text-section-wrapper` | Sticky |
| Muse Intro Page | 550–900vh | `.muse-intro-page` | Fixed overlay (fades in/out) |
| Muse Orbiting | 900–1020vh | `.muse-section` | Sticky |
| Comet Collab Intro | 1020–1380vh | `.comet-collab-intro` | Sticky |
| Comet Methods Toggle | ~1380–1500vh | `.comet-collab-methods` | Sticky |
| Comet Connected Images | ~1500–1620vh | `.comet-collab-connected-content` | Sticky |
| Events Page | 1620vh+ | `.events-page-wrapper` | Normal flow |
| Footer | Fixed (bottom) | `footer.social-links` + `.footer-logo` | Fixed |

Derived from `SCROLL_TIMING` in `js/main.js:94–122`. Total: ~1620vh + events content height.

---

## Section 1: Landing (0–400vh)

### Phase 1: Orbiting Dots (0–160vh)

**Expected behavior:**
- One white dot and one hollow white-bordered black dot orbit the center logo in an ellipse.
- Logo starts at 80px and scales to 250px (mobile: 180px) over the full 160vh.
- Logo rotates 2 full turns (720°) during orbit.
- Both dots shrink from 24px (desktop) / 18px (mobile) toward the center as orbit progress increases.
- WebGL starfield (`#bg-canvas`) renders twinkling star layers (4 layers) driven by simplex noise.
- At orbit progress = 0, dots are at top and bottom of a large ellipse.
- All motion driven by GSAP ScrollTrigger, `scrub: true`.

**Bug checklist:**
- [ ] White dot visible and orbiting at page load (0vh)
- [ ] Black dot visible with white border, orbiting opposite white dot
- [ ] Logo size is 80px at 0vh, increases smoothly to 250px at 160vh
- [ ] Logo rotates exactly 2× during scroll from 0 to 160vh
- [ ] `#bg-canvas` fills viewport, no black border or gap
- [ ] Stars twinkle (brightness fluctuates continuously)
- [ ] On mobile (≤768px), logo max is 180px, dots max is 18px

### Phase 2: Transition Text (160–200vh)

**Expected behavior:**
- Transition text `"Unleashing the compounds of existence through ART, IMPACT, and COMMUNITY."` fades in below the logo at 160vh (INTRO_PHASE1_END = 40%).
- Tagline `cocoex · compounds co-exist` appears beneath the quote.
- Text fades out before 200vh (INTRO_PHASE3_START = 50%).
- Orbiting dots have converged toward center and are no longer orbiting.

**Bug checklist:**
- [ ] Transition text appears at ~160vh, not earlier
- [ ] Text fades out cleanly before constellation starts at 200vh
- [ ] Text is centered and readable on all viewport widths
- [ ] Tagline renders below the quote

### Phase 3: Constellation Explosion (200–400vh)

**Expected behavior:**
- 7 colored dots explode outward from center starting at 200vh (50% of 400vh intro).
- Dot colors (exact hex from `DOT_COLORS`):
  - `#FF9F5A` — Orange
  - `#FFEC8A` — Yellow
  - `#8A6FD1` — Purple
  - `#7AAFD6` — Blue
  - `#B0D89F` — Green
  - `#FF6B4A` — Red
  - `#A96FD2` — Violet
- Dots have z-depth rendering: dot at z=0.6 renders largest/brightest, z=−0.5 renders smallest/darkest. Range: −0.5 to 0.6.
- Constellation rotates continuously at 15° per cycle on the Z axis.
- 8 connection lines render between dots per `CONNECTIONS` array (pairs: [0,1], [0,2], [1,3], [2,3], [2,4], [4,5], [5,6], [6,3]).
- Big bang pulse effect (dispersive expanding wave) triggers once at explosion start. Three overlapping soft Gaussian waves expand outward with organic noise offset.
- Logo scales up to final 250px size and is visible during constellation phase.

**Bug checklist:**
- [ ] All 7 colored dots appear at 200vh
- [ ] Z-depth: dots closer to z=0.6 are visually larger/brighter than z=−0.5
- [ ] Constellation rotates continuously (not frozen)
- [ ] All 8 connection lines render between correct dot pairs
- [ ] Big bang pulse wave visible once at explosion start, does not repeat
- [ ] Pulse fades out smoothly (not abrupt cut)
- [ ] Constellation remains visible through 400vh
- [ ] `#constellation-canvas` overlays `#bg-canvas` correctly (no z-index conflict)

---

## Section 2: Mission Text (400–550vh)

**Expected behavior:**
- `.text-section-wrapper` is sticky for 150vh.
- Text fades in from opacity 0 to 1 over the scroll range (GSAP `scrub: true`).
- Full text: *cocoex* is a transdisciplinary social impact lab that uses art, participation, and technology to generate real environmental and social change. We bring artists, creators and collectors together — cultivating a community built on shared purpose, where art and impact are inseparable. / We are a non-profit. We build the infrastructure, hold the space, and set the conditions for something larger than ourselves. / The creation belongs to the artists. The impact belongs to the world.
- "cocoex" rendered in `<em>` (italic).
- Text is uppercase, justified alignment, fluid size `clamp(20px, 2.5vw, 36px)`.

**Bug checklist:**
- [ ] Text is invisible at 400vh (start of section)
- [ ] Text reaches full opacity by ~500vh
- [ ] Text uses Canela font (not fallback Georgia)
- [ ] Text is uppercase
- [ ] No horizontal overflow on mobile

---

## Section 3: Muse Intro Page (550–900vh)

**Expected behavior:**
- `.muse-intro-page` fades in at 550vh and holds for 350vh (`MUSE_INTRO_HOLD`).
- Black inverted Muse logo (`muse_logo_black.png`) centered vertically.
- Top text: "Muse explores the complexity of nature and life identifying 7 global challenges where collective efforts can reach positive systemic change. The seven Muses are cocoex's guiding framework — each one aligned with a global cause, from reforestation and clean water to human rights and biodiversity."
- Bottom text: "Together they form a single constellation of orientations that runs through every campaign, every Future Lab, every act of collective creativity within the cocoex ecosystem. Each Muse has its own community and its own body of art growing around it."
- Section begins crossfading out at 900vh over 120vh (`MUSE_CROSSFADE`), simultaneous with Muse orbiting section fading in.

**Bug checklist:**
- [ ] Muse intro page is not visible before 550vh
- [ ] Black logo renders (not white logo) on white/light background
- [ ] Top and bottom paragraphs are both visible
- [ ] Section holds fully through 900vh without flickering
- [ ] Crossfade to orbiting section is smooth (no hard cut)

---

## Section 4: Muse Orbiting (900–1020vh)

### Orbit Behavior

**Expected behavior:**
- 7 muse images orbit a central Muse logo in an ellipse.
- Orbit completes one full cycle every 240 seconds (continuous CSS rotation).
- Initial angles per muse (from `data-angle`):
  - Lunes: 0°, Ares: 51.43°, Rabu: 102.86°, Thunor: 154.29°, Shukra: 205.71°, Dosei: 257.14°, Solis: 308.57°
- Ellipse ratios by device:
  - Desktop (>1024px): horizontal — 1.8× wider than tall
  - Tablet (768–1024px): slightly vertical — 1.4× taller than wide
  - Mobile (≤768px): vertical — 1.6× taller than wide
- WebGL animated gradient (`#muse-background-canvas`) renders a 7-color simplex noise blend behind the orbiting layout.
- Unified starfield (`#unified-starfield-canvas`) renders beneath the gradient.
- Muse fades in as Muse intro crossfades out (900–1020vh).

### Muse Popup Modal

**Expected behavior:**
- Clicking a muse image or pressing Enter on a focused muse opens `.muse-popup`.
- Popup displays: muse name + cause (from `data-popup-title`, e.g. "Lunes · Water"), muse image, and description text from the muse's `<p>` tag.
- 3D tilt card effect on the popup card (mouse move drives tilt transform).
- Colored aura effect uses the muse's `data-color` hex value.
- 12 floating particles animate around the popup on open.
- GSAP entrance animation: content scales from 0.8 to 1.0 with `back.out(1.7)` ease.
- Close methods: click X button, click outside `.muse-popup-content`, press Escape.
- GSAP exit animation: content scales to 0.8, opacity to 0, duration 0.2s.
- Popup starfield canvas (`#muse-popup-starfield`) renders twinkling stars inside the popup.
- Keyboard: Tab navigates between muses; Enter opens popup; Escape closes.
- Hint text "Click outside or press ESC to close" is visible at popup bottom.

**Bug checklist:**
- [ ] All 7 muses render in ellipse orbit on desktop
- [ ] Orbit rotates continuously (no pause or jitter)
- [ ] Ellipse is horizontal on desktop (wider than tall)
- [ ] Ellipse is vertical on mobile (taller than wide)
- [ ] Clicking any muse image opens popup
- [ ] Popup title matches `data-popup-title` of clicked muse
- [ ] Muse image loads inside popup (not broken img)
- [ ] Aura color matches the muse's `data-color`
- [ ] 12 particles animate on popup open
- [ ] Popup closes on Escape
- [ ] Popup closes on overlay click
- [ ] Popup closes on X button click
- [ ] Tab navigation cycles through all 7 muses
- [ ] Enter key opens popup when muse is focused
- [ ] `#muse-background-canvas` gradient is visible (not black)
- [ ] `#unified-starfield-canvas` visible beneath gradient

---

## Section 5: Comet Collab Intro (1020–1380vh)

### Logo Descent

**Expected behavior:**
- Comet Collabs white logo (`comet-collabs-logo-white.png`) starts centered.
- Static intro hold: 1020–1120vh (`COMET_INTRO_PAUSE: 100`).
- Logo descent begins at 1120vh and completes at 1300vh (`COMET_LOGO_MOVEMENT: 180`).
- Logo moves from vertical center to bottom of viewport; text content moves upward simultaneously.
- Bottom hold: logo stays at bottom position from 1300vh to 1380vh (`COMET_BOTTOM_HOLD: 80`).
- Animation is fully reversible (scroll back → logo ascends).

### Floating Draggable Images

**Expected behavior:**
- 5 process images (`.floating-process`) are positioned absolutely within `.floating-processes`.
- Initial positions (percentage-based): process-1 at top:15% left:10%, process-2 at top:25% left:75%, process-3 at top:50% left:15%, process-4 at top:60% left:80%, process-5 at top:75% left:45%.
- Each image has a continuous `float` CSS animation: 6s ease-in-out, staggered delay of `(index-1) × 1.2s`.
- Mouse drag: `mousedown` starts drag, `animation: none` disabled while dragging, `mouseup` re-enables float animation.
- Touch drag: `touchstart`/`touchmove`/`touchend` mirrors mouse behavior (`passive: false` on touchmove).
- Drag is constrained within parent container bounds (cannot drag outside `.floating-processes`).
- On drag end, `float` animation resumes with original delay.

### Shine Animation

**Expected behavior:**
- The words "Stardust" and "Horizon" in the intro text have a glow/shine animation.
- Scroll down (entering from text section): Stardust shines first → 1s delay → Horizon shines.
- Scroll back (entering from comet-collab-2 / methods): Horizon shines first → 1s delay → Stardust shines.
- Each shine: 1.6s duration with drop-shadow + stroke-width increase.
- Animation triggers every time the section enters viewport in either direction (not only once).

**Bug checklist:**
- [ ] White Comet Collabs logo visible and centered at 1020vh
- [ ] Logo does not move before 1120vh
- [ ] Logo reaches bottom by 1300vh
- [ ] Logo holds at bottom from 1300–1380vh
- [ ] Scrolling back moves logo back to center (reversible)
- [ ] All 5 floating images are visible in intro section
- [ ] Each image floats (bobbing animation) when not being dragged
- [ ] Mouse drag moves images freely within bounds
- [ ] Touch drag works on mobile
- [ ] Images do not escape parent container
- [ ] Float resumes after drag release
- [ ] Stardust word shines before Horizon when scrolling down
- [ ] Horizon word shines before Stardust when scrolling back
- [ ] Shine repeats every time section enters viewport

---

## Section 6: Comet Methods Toggle (~1380–1500vh)

### Toggle Pill

**Expected behavior:**
- Two-button pill: "I · Stardust" (default active) and "II · Horizon".
- Clicking a button calls `window.switchTab(method)`.
- Active button gets `.active` class; pill slider (`#pillSlider`) animates to underline the active tab.
- Switching tabs shows the corresponding `.comet-panel` and hides the other.
- Active panel has `.active` class. Default: `#panel-stardust` is active.

### Stardust Panel (4 steps)

Panel description: "Artists select one cause, create a work, and launch a fundraising campaign through its sale — funds split between artist and NGO, facilitated by cocoex. The art is the vehicle. The impact is the destination."

CTA link: `#stardust` → "View campaigns →"

Steps (exact text from HTML):

| # | Title | Body |
|---|---|---|
| 01 | Choose | Select a social cause aligned with one of the seven Muses |
| 02 | Create | Transform it into art — any form, any medium |
| 03 | Raise | Launch the fundraising campaign through sales and events |
| 04 | Impact | Funds reach the NGO. cocoex does not profit. |

### Horizon Panel (5 steps)

Panel description: "A Future Lab where communities collectively define a cause, choose their partner organisation, and transform their shared vision into art — and the funds it raises into real-world change."

CTA link: `#horizon` → "View Future Labs →"

Steps (exact text from HTML):

| # | Title | Body |
|---|---|---|
| 01 | Choose | Select a social cause aligned with one of the seven Muses |
| 02 | Future Lab | A participatory process where the community explores the challenge and votes on the partner organisation |
| 03 | Create | Transform it into art — any form, any medium |
| 04 | Raise | Launch the fundraising campaign through sales and events |
| 05 | Impact | Funds reach the chosen organisation. cocoex does not profit. |

Step 02 in Horizon has an addon badge: `+ Horizon` rendered in `.step-addon-badge`.

Note: `STEP_DATA` in `js/main.js:198–243` contains placeholder Lorem Ipsum descriptions used by the step popup. The step titles/bodies shown above are the HTML display text; popup descriptions come from `STEP_DATA`.

**Bug checklist:**
- [ ] Stardust tab is active by default (pill slider under "I · Stardust")
- [ ] Clicking "II · Horizon" shows Horizon panel, hides Stardust panel
- [ ] Clicking back to "I · Stardust" restores Stardust panel
- [ ] Pill slider animates smoothly between tabs
- [ ] Stardust: exactly 4 step rows render
- [ ] Horizon: exactly 5 step rows render, step 02 has `+ Horizon` badge
- [ ] Stardust step 04 text: "Funds reach the NGO. cocoex does not profit."
- [ ] Horizon step 05 text: "Funds reach the chosen organisation. cocoex does not profit."
- [ ] `#comet-collab-background-canvas` WebGL gradient visible behind panel
- [ ] CTA links "View campaigns →" and "View Future Labs →" present

---

## Section 7: Comet Connected Images (~1500–1620vh)

### Connection Lines

**Expected behavior:**
- 5 process images (`#comet-image-item[data-step=1..5]`) displayed in a flex row.
- `#comet-connection-canvas` overlays the images and draws white lines connecting them in sequence.
- `#comet-collab-background-canvas-2` renders the same WebGL gradient shader as the methods section for visual continuity.
- Images have hover scale transform (1.05×).

### Step Popup

**Expected behavior:**
- Clicking a `.comet-image-item.clickable` opens `.step-popup` modal.
- Popup reads the currently active method from `MethodToggle.getCurrentMethod()` (stardust or horizon).
- `STEP_DATA[method][step]` provides title and description.
- Popup content animates in: scale 0.8 → 1.0, opacity 0 → 1, `back.out(1.7)` ease, 0.3s.
- Popup content animates out: scale 1 → 0.8, opacity 1 → 0, `power2.in` ease, 0.2s.
- Close methods: X button (`.step-popup-close`), overlay click (`.step-popup-overlay`), Escape key.
- Keyboard: Enter or Space on focused image opens popup.
- Focus is trapped to close button on popup open.

**Bug checklist:**
- [ ] All 5 images render in a row
- [ ] White connection lines visible between images
- [ ] `#comet-collab-background-canvas-2` gradient matches methods section
- [ ] Images scale on hover (1.05×)
- [ ] Clicking a `.comet-image-item` opens step popup
- [ ] Popup title and description match `STEP_DATA` for current method + step number
- [ ] Popup closes on overlay click
- [ ] Popup closes on X button
- [ ] Popup closes on Escape
- [ ] Enter/Space keyboard opens popup on focused image
- [ ] Popup reflects active method (switching tab then clicking image shows correct method's data)

---

## Section 8: Events Page (~1620vh+)

### Partnership Carousel

**Expected behavior:**
- Title "Partnership" (`h2.partnership-title`) above the carousel.
- `PartnershipSlider` module builds a `.partnership-track` inside `#partnership-slideshow`.
- Logos are loaded from `data/events.json` `partnerships` array (5 entries: Partner 1–5).
- Track contains logos duplicated (10 total) for seamless infinite CSS scroll loop.
- Each logo is wrapped in an `<a>` tag with `target="_blank" rel="noopener noreferrer"`.
- Images use `loading="lazy"`.

Current partnership data (from `data/events.json`):

| Name | Logo Path | URL |
|---|---|---|
| Partner 1 | assets/images/partnerships/partner-1.png | # |
| Partner 2 | assets/images/partnerships/partner-2.png | # |
| Partner 3 | assets/images/partnerships/partner-3.png | # |
| Partner 4 | assets/images/partnerships/partner-4.png | # |
| Partner 5 | assets/images/partnerships/partner-5.png | # |

Note: `PartnershipSlider` in `main.js:2563` hardcodes paths as `partner1.png` (no hyphen), while `events.json` uses `partner-1.png`. Verify which path is used at runtime.

### Stardust Campaigns

**Expected behavior:**
- Section `#stardust` with headline: "Where *art* meets cause." (italic "art").
- Campaign cards dynamically inserted into `#stardust-campaigns`.
- Each card shows: campaign number, status badge, name, subtitle, NGO name, muse tag(s) with symbol + color, and a link.

Current campaign data (from `data/events.json`):

| # | Status | Name | Subtitle | NGO | Muses | Link |
|---|---|---|---|---|---|---|
| 003 | active | La Luna 007 | Silat Beksi × Wex Records × La Luna · Silent Rixdorf, Berlin · August 2026 | Repair Together — rebuilding communities in war-affected Ukraine | ♀ Shukra (Bio-diversity, `--shukra`) | # |
| 002 | open | Practicing the Futures | Vinili e Vinelli Festival · Italy · July 7–19, 2026 | Terra Nuda — art and culture in rural communities | ✕ Ares (Reforestation, `--ares`), ◉ Solis (Well-being, `--solis`) | #now (Apply →) |
| 001 | archive | Cantine Volpi | Limited wine release · first proof of concept | Art embedded in product to generate charitable funds | ✕ Ares (Reforestation, `--ares`), ◉ Solis (Well-being, `--solis`) | null (Archive) |

### Horizon Future Labs

**Expected behavior:**
- Section `#horizon` with headline: "Communities designing their own *futures.*" (italic "futures.").
- Right column header text: "What if the people most affected by a challenge were also the ones designing its solution?"
- Body text references Robert Jungk's Zukunftswerkstatt.
- Labs rendered in `#horizon-labs` as a 3-column grid: Event | Outcome | Conclusion.
- Footnote: "* Inspired by Robert Jungk's Zukunftswerkstatt — a participatory futures methodology developed as a democratic counterweight to top-down planning. Structural partner: Robert Jungk Bibliothek (JBZ)."

Current lab data (from `data/events.json`):

**Future Lab, Carezzano · 2024**
- Event: "Held during Vinili e Vinelli, September 2024. Communities co-created four visions for the future of sustainable local tourism in the Colli Tortonesi."
- Outcome: "A community's choice" — "Participants chose Slow Food Terre Derthona to carry the community's vision forward — strengthening the territory and its agricultural culture."
- Conclusion: "Art as closure · September 2025" — "Works exhibited and sold for charity at the same location where the Future Lab began. The circle closed."

**Bug checklist:**
- [ ] Partnership carousel is visible and logos display
- [ ] Carousel scrolls horizontally in a loop without a visible seam
- [ ] All 3 stardust campaign cards render
- [ ] Campaign 003 shows status "active"
- [ ] Campaign 002 shows status "open" with "Apply →" link
- [ ] Campaign 001 shows status "archive" with no link
- [ ] Muse tags display correct symbol and color for each campaign
- [ ] Horizon section headline renders with italic "futures."
- [ ] 1 Future Lab row renders with all 3 columns
- [ ] Footnote with Robert Jungk / JBZ credit is visible
- [ ] `#events-background-canvas` renders starfield background

---

## Footer (Fixed)

**Expected behavior:**
- `footer.social-links` is fixed position, revealed at comet section end (ScrollTrigger).
- Three social links: Telegram (`https://t.me/coco_ex`), Instagram (`https://instagram.com/cocoex_`), LinkedIn (`https://www.linkedin.com/company/cocoex/`).
- All links: `target="_blank" rel="noopener noreferrer"`.
- Icon touch targets: 52px minimum.
- Icons scale on hover.
- `.footer-logo` (`cocoex-text.png`, 172px width) appears alongside social links; scales on hover.
- Footer is separate from page scroll flow; does not push content.

**Bug checklist:**
- [ ] Footer not visible during landing and text sections
- [ ] Footer becomes visible when comet section ends
- [ ] All 3 social icons render as SVG (not broken image)
- [ ] Telegram link opens `t.me/coco_ex` in new tab
- [ ] Instagram link opens `instagram.com/cocoex_` in new tab
- [ ] LinkedIn link opens `linkedin.com/company/cocoex/` in new tab
- [ ] Footer logo image loads
- [ ] Touch targets are ≥44px on mobile
- [ ] `rel="noopener noreferrer"` present on all external links

---

## WebGL Canvases

| Canvas ID | Section | Shader | Expected Visual | Bug Checks |
|---|---|---|---|---|
| `#bg-canvas` | Landing (0–400vh) | Intro starfield + simplex noise + big bang pulse uniform | Dark cosmic background, twinkling stars (4 layers), single dispersive pulse wave at constellation trigger | Stars twinkle continuously; pulse fires once; canvas fills viewport |
| `#constellation-canvas` | Landing Phase 3 (200–400vh) | 2D Canvas (not WebGL) | 7 colored dots with z-depth, white connection lines, Z-axis rotation | Dots visible at 200vh; rotation continuous; lines connect correct pairs |
| `#unified-starfield-canvas` | Muse + Comet sections (550–1620vh) | Unified starfield shader | Sparse twinkling stars shared across Muse and Comet backgrounds | Stars visible in both Muse and Comet sections; no seam at section boundary |
| `#muse-background-canvas` | Muse Orbiting (900–1020vh) | Animated gradient (7-color simplex blend) | Slow-moving multicolor gradient blending 7 muse colors | Gradient visible behind orbiting muses; colors shift slowly |
| `#comet-collab-background-canvas` | Comet Methods Toggle (~1380–1500vh) | Same animated gradient shader as Muse | Continuous visual flow from Muse gradient | Gradient present; no black flash on section enter |
| `#comet-collab-background-canvas-2` | Comet Connected Images (~1500–1620vh) | Same animated gradient shader | Seamless continuation of comet methods background | Gradient matches methods section; no discontinuity |

CDN: GSAP loaded from `https://cdn.jsdelivr.net/npm/gsap@3.12.5/` (gsap.min.js, ScrollTrigger.min.js, MotionPathPlugin.min.js).

---

## Performance Targets

| Metric | Target |
|---|---|
| First Contentful Paint | < 1.5s (4G) |
| Largest Contentful Paint | < 2.5s (4G) |
| Time to Interactive | < 3s (4G) |
| Cumulative Layout Shift | < 0.1 |
| Lighthouse Score | 95+ (all categories) |
| Scroll animation | 60fps desktop |
| Mobile WebGL | ≥ 30fps (DPR capped at 2×) |
| Resize debounce | 150ms |

---

## Cross-Browser Checklist

- [ ] **Chrome (latest)**: Full animation, WebGL, GSAP — baseline
- [ ] **Firefox (latest)**: Scroll behavior, WebGL context, thin scrollbar (Firefox CSS)
- [ ] **Safari (latest)**: `backdrop-filter` on rapid scroll, WebGL context loss, scroll normalization
- [ ] **Edge (latest)**: Same as Chrome; verify GSAP ScrollTrigger normalizeScroll
- [ ] **iOS Safari (latest)**: Touch drag on floating images, touch orbit navigation, scroll normalization active (`ScrollTrigger.normalizeScroll(true)`)
- [ ] **Android Chrome (latest)**: Touch events, DPR capping at 2×, floating image drag
- [ ] All external links open in new tab with no opener
- [ ] Keyboard navigation (Tab/Enter/Escape) works in all browsers
- [ ] `prefers-reduced-motion`: all animations and particles disabled
- [ ] No console errors on clean page load in any browser

---

## Responsive Checklist

- [ ] **320px**: Text no overflow, logo min-size, dots visible, no horizontal scroll
- [ ] **375px (iPhone SE)**: Vertical ellipse orbit, floating images within bounds
- [ ] **390px (iPhone 14)**: Touch drag, popup readable, all sections scroll
- [ ] **480px**: Small breakpoint — fine-tuned spacing
- [ ] **768px**: Transition from vertical to slightly-vertical ellipse (1.4× taller)
- [ ] **1024px**: Tablet — touch optimization active, ellipse shifts to horizontal
- [ ] **1280px**: Standard desktop — horizontal ellipse (1.8× wider)
- [ ] **1440px**: Large desktop — typography at upper clamp values
- [ ] **1920px**: Full HD — no layout stretching, canvases fill viewport
- [ ] **4K (3840px)**: Canvas DPR capped at 2×; layout scales without overflow
- [ ] Footer social icons ≥ 44px touch target at all sizes
- [ ] Comet Methods toggle pill readable and tappable on mobile
- [ ] Muse popup readable on all viewport widths (no overflow)
