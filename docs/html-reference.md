> UPDATED AT: 2026-05-10

# cocoex.xyz — HTML Reference

## Purpose

Authoritative markup reference for the cocoex.xyz codebase — use this instead of reading `index.html` when writing, adding, or modifying HTML.

---

## Document Structure

Top-level nesting of every major element with selector and line number.

```
html[lang="en"]                                              (2)
└── head                                                     (3)
│     charset, viewport, description, theme-color           (4–7)
│     title                                                  (8)
│     link: favicon                                          (9)
│     link: Adobe Fonts (Typekit afs8ors)                    (11)
│     link: css/styles.css?v=3.0                             (12)
│     meta: og:type, og:title, og:description, og:image      (14–17)
│     meta: twitter:card                                     (18)
└── body                                                     (20)
    └── div.scroll-container[role="main"]                    (22)
        ├── div.intro-spacer[aria-hidden="true"]             (24)
        ├── section.intro                                    (27)
        │   ├── canvas#bg-canvas.intro-canvas               (28)
        │   └── div.intro-content                           (30)
        │       ├── div#dot-white.orbit-dot.orbit-dot-white (32)
        │       ├── div#dot-black.orbit-dot.orbit-dot-black (33)
        │       ├── div#logo-container.logo-container       (36)
        │       │   └── img#intro-logo.intro-logo           (37)
        │       ├── div#final-dot.final-dot                 (41)
        │       ├── div#transition-text.transition-text     (44)
        │       │   └── p > span.tagline                    (45–46)
        │       └── canvas#constellation-canvas             (50)
        ├── section.text-section-wrapper                    (56)
        │   └── div#text-section.text-section               (57)
        │       └── div.text-content                        (58)
        │           └── p#reveal-text.reveal-text           (59)
        ├── canvas#unified-starfield-canvas                 (65)
        └── section#white-section.white-section             (68)
            ├── div.muse-section-wrapper                    (71)
            │   ├── section#muse-intro-page.muse-intro-page (74)
            │   │   ├── p.muse-intro-text-top               (75)
            │   │   ├── div.muse-intro-logo                 (76)
            │   │   │   └── img.muse-intro-logo-image       (77)
            │   │   └── p.muse-intro-text-bottom            (79)
            │   └── div.white-section-content               (82)
            │       └── article#muse-section.muse-section   (84)
            │           ├── canvas#muse-background-canvas   (87)
            │           ├── div.muse-center-logo            (90)
            │           │   └── img.muse-logo-image         (91)
            │           └── div.muse-orbit-container        (95)
            │               ├── div.muse-orbit-item ×7      (98–172)
            │               │   ├── div.muse-image > img    (99–101)
            │               │   └── div.muse-text > h3 + p  (102–105)
            │               └── (×6 more, angles 51.43–308.57)
            ├── div.comet-collab-wrapper                    (181)
            │   ├── section#comet-collab-intro              (183)
            │   │   ├── div#comet-collab-intro-logo         (185)
            │   │   │   └── img                             (186)
            │   │   ├── div.comet-collab-intro-content      (190)
            │   │   │   └── p.comet-methods-text            (191)
            │   │   └── div#floating-processes              (195)
            │   │       └── div.floating-process ×5        (196–210)
            │   │           └── img                        (197,…)
            │   ├── div.comet-collab-methods                (215)
            │   │   ├── canvas#comet-collab-background-canvas (217)
            │   │   ├── div.comet-toggle-wrap               (220)
            │   │   │   └── div.comet-pill                  (221)
            │   │   │       ├── button#tab-stardust.pill-opt.active (222)
            │   │   │       ├── button#tab-horizon.pill-opt (223)
            │   │   │       └── div#pillSlider.pill-slider  (224)
            │   │   └── div.comet-panels                    (229)
            │   │       ├── div#panel-stardust.comet-panel.active (231)
            │   │       │   ├── div.comet-panel-desc        (232)
            │   │       │   │   ├── div.comet-panel-subtitle (234)
            │   │       │   │   ├── div.comet-panel-title   (235)
            │   │       │   │   ├── p.comet-panel-body      (236)
            │   │       │   │   └── a.comet-cta             (237)
            │   │       │   └── div.comet-steps             (240)
            │   │       │       └── div.step-row ×4         (241–268)
            │   │       │           ├── div.step-num        (242,…)
            │   │       │           └── div.step-content    (243,…)
            │   │       │               ├── div.step-title  (244,…)
            │   │       │               └── div.step-body   (245,…)
            │   │       └── div#panel-horizon.comet-panel   (273)
            │   │           ├── div.comet-panel-desc        (274)
            │   │           │   ├── div.comet-panel-subtitle (276)
            │   │           │   ├── div.comet-panel-title   (277)
            │   │           │   ├── p.comet-panel-body      (278)
            │   │           │   └── a.comet-cta             (279)
            │   │           └── div.comet-steps             (282)
            │   │               └── div.step-row ×5         (283–318)
            │   │                   (step-row step-addon at line 290)
            │   │                   └── div.step-addon-badge (293)
            │   ├── section#comet-collab-connected-content  (326)
            │   │   ├── canvas#comet-collab-background-canvas-2 (328)
            │   │   ├── canvas#comet-connection-canvas      (331)
            │   │   └── div.comet-connected-images          (334)
            │   │       └── div.comet-image-item ×5        (335–349)
            │   │           └── img                        (336,…)
            │   └── div.step-popup[role="dialog"]           (354)
            │       ├── div.step-popup-overlay              (355)
            │       └── div.step-popup-content              (356)
            │           ├── button.step-popup-close         (357)
            │           ├── h2#step-popup-title             (358)
            │           └── p.step-popup-description        (359)
            ├── section#events-page.events-page-wrapper     (365)
            │   ├── canvas#events-background-canvas         (367)
            │   ├── div.partnership-section                 (370)
            │   │   ├── h2.partnership-title                (371)
            │   │   └── div#partnership-slideshow           (372) ← JS-populated
            │   ├── section#stardust.stardust               (378)
            │   │   ├── div.stardust-header                 (379)
            │   │   │   ├── div > div.section-label         (380)
            │   │   │   └── h2.stardust-headline            (381)
            │   │   └── div#stardust-campaigns              (383) ← JS-populated
            │   └── section#horizon.horizon                 (389)
            │       ├── div.horizon-header                  (390)
            │       │   ├── div.horizon-header-left         (391)
            │       │   │   ├── div.section-label           (392)
            │       │   │   └── h2.horizon-headline         (393)
            │       │   └── div.horizon-header-right        (395)
            │       │       ├── p.horizon-question          (396)
            │       │       └── p.horizon-body              (397)
            │       ├── div#horizon-labs.horizon-proof      (400) ← JS-populated
            │       └── div.horizon-footnote                (403)
            ├── footer.social-links                         (410)
            │   ├── a.social-link (Telegram)                (411)
            │   ├── a.social-link (Instagram)               (416)
            │   └── a.social-link (LinkedIn)                (421)
            ├── img.footer-logo                             (429)
            └── div#muse-popup.muse-popup                   (433)
                ├── canvas#muse-popup-starfield             (434)
                ├── div#muse-popup-overlay.muse-popup-overlay (435)
                ├── div.muse-popup-content                  (436)
                │   ├── h2#muse-popup-title.muse-popup-title (437)
                │   ├── div.muse-card-wrapper               (438)
                │   │   └── div.muse-card-shell             (439)
                │   │       └── section.muse-card           (440)
                │   │           └── div.muse-card-inside    (441)
                │   │               ├── div.muse-card-shine (442)
                │   │               ├── div.muse-card-glare (443)
                │   │               └── div#muse-popup-image (444)
                │   │                   └── img#muse-popup-img (445)
                │   ├── p#muse-popup-cause.muse-popup-cause (451)
                │   ├── div.muse-popup-body                 (452)
                │   │   └── p#muse-popup-text.muse-popup-text (453)
                │   └── button#muse-popup-close.muse-popup-close (455)
                ├── div#muse-popup-particles.muse-popup-particles (457)
                └── div.muse-popup-hint                     (458)
    <!-- Scripts (outside scroll-container) -->
    <script> GSAP 3.12.5 + ScrollTrigger + MotionPathPlugin  (463–465)
    <script> js/main.js?v=3.0                                (466)
```

---

## HTML Conventions

### Class Naming Patterns

- **BEM-lite with hyphens:** `.comet-collab-intro`, `.muse-orbit-item`, `.step-popup-content`
- **Modifier via extra class:** `.pill-opt.active`, `.comet-panel.active`, `.step-row.step-addon`
- **State class added by JS:** `.active` (panels, tabs, popup open state), `.visible` (final-dot), `.clickable` (comet-image-item when JS enables it)
- **Section prefix:** classes are namespaced to their section — `muse-*`, `comet-*`, `stardust-*`, `horizon-*`
- **Canvas elements:** always get both a class and an id — class for CSS targeting, id for JS `getElementById`

### Data-Attribute Patterns

| Attribute | Element | Values | Purpose |
|-----------|---------|--------|---------|
| `data-angle` | `.muse-orbit-item` | `0`, `51.43`, `102.86`, `154.29`, `205.71`, `257.14`, `308.57` | Starting orbit angle in degrees (evenly distributed: 360/7 = ~51.43° apart) |
| `data-color` | `.muse-orbit-item` | hex color string e.g. `#5783A6` | Muse accent color used by popup aura and particles |
| `data-popup-title` | `.muse-orbit-item` | `"Name · Cause"` e.g. `"Lunes · Water"` | Title shown in the muse popup modal |
| `data-process` | `.floating-process` | `"1"` through `"5"` | Identifies which process image; used by `FloatingProcesses` module for drag logic |
| `data-step` | `.comet-image-item` | `"1"` through `"5"` | Maps connected image to `STEP_DATA[method][step]` for the step popup |
| `data-method` | `.comet-panel` | `"stardust"`, `"horizon"` | Identifies panel for `switchTab()` toggle logic |

### ARIA Patterns

| Attribute | Where Used | Value |
|-----------|-----------|-------|
| `aria-label` | `section.intro` (27) | `"Introduction animation"` |
| `aria-label` | `section.text-section-wrapper` (56) | `"Mission statement"` |
| `aria-label` | `section#white-section` (68) | `"Muse portfolio"` |
| `aria-label` | `article#muse-section` (84) | `"Muse collection"` |
| `aria-label` | `section#comet-collab-intro` (183) | `"Comet collab introduction"` |
| `aria-label` | `footer.social-links` (410) | `"Social media links"` |
| `aria-label` | `a.social-link` Telegram (411) | `"Join us on Telegram"` |
| `aria-label` | `a.social-link` Instagram (416) | `"Follow us on Instagram"` |
| `aria-label` | `a.social-link` LinkedIn (421) | `"Connect on LinkedIn"` |
| `aria-label` | `button.step-popup-close` (357) | `"Close popup"` |
| `aria-label` | `button#muse-popup-close` (455) | `"Close popup (press Escape)"` |
| `aria-hidden="true"` | All decorative canvases | `#bg-canvas` (28), `#unified-starfield-canvas` (65), `#muse-background-canvas` (87), `#comet-collab-background-canvas` (217), `#comet-collab-background-canvas-2` (328), `#comet-connection-canvas` (331), `#events-background-canvas` (367), `#muse-popup-starfield` (434) |
| `aria-hidden="true"` | `.intro-content` (30), `.intro-spacer` (24) | Decorative animation containers |
| `role="main"` | `div.scroll-container` (22) | Page landmark |
| `role="dialog"` | `div.step-popup` (354), implicitly `div#muse-popup` | Modal dialogs |
| `aria-modal="true"` | `div.step-popup` (354) | Prevents background interaction |
| `aria-labelledby` | `div.step-popup` (354) | `"step-popup-title"` |

### When to Use section vs div vs article

- **`<section>`** — named, thematically distinct content blocks that appear in the document outline: `.intro` (27), `.text-section-wrapper` (56), `#white-section` (68), `.muse-intro-page` (74), `#comet-collab-intro` (183), `#comet-collab-connected-content` (326), `.events-page-wrapper` (365), `#stardust` (378), `#horizon` (389). Always add `aria-label`.
- **`<article>`** — self-contained, independently reusable content: `#muse-section` (84) — the orbiting portfolio. Add `aria-label`.
- **`<footer>`** — site-level footer: `.social-links` (410).
- **`<div>`** — layout wrappers, JS-controlled containers, non-semantic groupings: `.scroll-container`, `.muse-section-wrapper`, `.comet-collab-wrapper`, `.comet-panels`, `.muse-orbit-container`, etc.
- **Never** use a `<div>` where a semantic element applies. Do not add landmark elements (section/article) purely for styling.

### External Link Pattern

Every link to an external domain uses exactly this attribute combination:

```html
<a href="https://..." target="_blank" rel="noopener noreferrer" ...>
```

`rel="noopener noreferrer"` is non-negotiable on all `target="_blank"` links.

### Image Pattern

```html
<!-- Lazy-loaded (below the fold) -->
<img src="assets/images/..." alt="Descriptive text" loading="lazy">

<!-- Eager (above the fold / critical path) -->
<img src="assets/images/..." alt="Descriptive text">
```

Rules:
- All `<img>` elements must have a non-empty `alt` attribute.
- Decorative images that are pure visuals (muse orbit images, process images) use a short descriptive `alt` matching the file name or label (e.g. `alt="Lunes"`, `alt="Process 1"`).
- JS-populated images start with `src=""` and `alt=""` and are set by JS before display (see `#muse-popup-img` at line 445).
- Partnership logos inside the JS-generated slider use `loading="lazy"`.
- No `width`/`height` attributes on responsive images — sizes are handled by CSS with `clamp()`.

---

## Section-by-Section Element Reference

### 1. Head / Meta (lines 1–19)

```
head                                          (3)
├── meta charset="UTF-8"                      (4)
├── meta name="viewport"                      (5)   content="width=device-width, initial-scale=1.0"
├── meta name="description"                   (6)   SEO description
├── meta name="theme-color" content="#000000" (7)
├── title "cocoex e.V."                       (8)
├── link rel="icon" href="assets/images/logowhite.png" type="image/png"  (9)
├── link rel="stylesheet" href="https://use.typekit.net/afs8ors.css"     (11)  Adobe Fonts / Canela
├── link rel="stylesheet" href="css/styles.css?v=3.0"                    (12)
├── meta property="og:type"        content="website"                     (14)
├── meta property="og:title"       content="cocoex - Art, Community & Impact" (15)
├── meta property="og:description" content="..."                         (16)
├── meta property="og:image"       content="assets/images/logowhite.png" (17)
└── meta name="twitter:card"       content="summary_large_image"         (18)
```

**Version query string:** `?v=3.0` on both `styles.css` and `main.js` — increment on major releases to bust cache.

---

### 2. Intro Section (`.intro`, lines 27–53)

**Selector:** `section.intro` | **Scroll Range:** 0–400vh | **Position:** fixed overlay

```
section.intro[aria-label="Introduction animation"]             (27)
├── canvas#bg-canvas.intro-canvas[aria-hidden="true"]         (28)
│     WebGL starfield + big bang pulse. Managed by initWebGL() (main.js:399)
└── div.intro-content[aria-hidden="true"]                     (30)
    ├── div#dot-white.orbit-dot.orbit-dot-white                (32)
    │     White orbiting dot. Positioned by updateOrbitPositions() (JS:1258)
    ├── div#dot-black.orbit-dot.orbit-dot-black                (33)
    │     Black (outlined) orbiting dot
    ├── div#logo-container.logo-container                      (36)
    │     GSAP animates width/height 80px → 250px + 2 full rotations
    │   └── img#intro-logo.intro-logo[alt="cocoex logo"]      (37)
    │         src: assets/images/logowhite.png
    ├── div#final-dot.final-dot                               (41)
    │     Hidden initially. JS adds .visible when dots merge
    ├── div#transition-text.transition-text                    (44)
    │     Fades in at 76% orbit progress, fades out before explosion
    │   └── p                                                  (45)
    │       "Unleashing the compounds of existence..."
    │       └── span.tagline "cocoex · compounds co-exist"    (46)
    └── canvas#constellation-canvas.constellation-canvas       (50)
          7-dot explosion + galaxy. No aria-hidden (purely decorative,
          enclosed in aria-hidden parent)
```

**No data-attributes on intro elements.** All positioning is set via inline style by JS.

---

### 3. Text Section (`.text-section-wrapper`, lines 55–62)

**Selector:** `section.text-section-wrapper` | **Scroll Range:** 400–550vh | **Position:** sticky

```
section.text-section-wrapper[aria-label="Mission statement"]  (56)
└── div#text-section.text-section                             (57)
    └── div.text-content                                      (58)
        └── p#reveal-text.reveal-text                        (59)
              Contains <em> tags on "cocoex".
              GSAP fade-in animation driven by ScrollTrigger (JS:914)
```

**No IDs or data-attributes beyond `#reveal-text`.** Inline `<em>` on the word "cocoex".

---

### 4. Muse Section Wrapper (`.muse-section-wrapper`, lines 71–178)

**Outer selector:** `div.muse-section-wrapper` (inside `section#white-section`)

#### 4a. Muse Intro Page (`.muse-intro-page`, lines 74–80)

```
section#muse-intro-page.muse-intro-page                       (74)
├── p.muse-intro-text-top                                     (75)
├── div.muse-intro-logo                                       (76)
│   └── img.muse-intro-logo-image[alt="Muse"]                (77)
│         src: assets/images/muse/muse_logo_black.png
└── p.muse-intro-text-bottom                                  (79)
```

#### 4b. Orbiting Muse Portfolio (`.muse-section`, lines 82–176)

```
div.white-section-content                                     (82)
└── article#muse-section.muse-section[aria-label="Muse collection"] (84)
    ├── canvas#muse-background-canvas.muse-background-canvas  (87)
    │     [aria-hidden="true"] — WebGL 7-color gradient (JS:1323)
    ├── div.muse-center-logo                                  (90)
    │   └── img.muse-logo-image[alt="Muse"]                  (91)
    │         src: assets/images/muse/muse_logo_black.png
    └── div.muse-orbit-container                              (95)
        ├── div.muse-orbit-item[data-angle="0"][data-color="#5783A6"][data-popup-title="Lunes · Water"]   (98)
        │   ├── div.muse-image                                (99)
        │   │   └── img[src="assets/images/muse/lunes.png"][alt="Lunes"]  (100)
        │   └── div.muse-text                                (102)
        │       ├── h3 "Lunes"                               (103)
        │       └── p  (description)                         (104)
        ├── div.muse-orbit-item[data-angle="51.43"][data-color="#D54D2E"][data-popup-title="Ares · Reforestation"]  (109)
        │   └── … same structure …
        ├── div.muse-orbit-item[data-angle="102.86"][data-color="#8CB07F"][data-popup-title="Rabu · Human Rights"]  (120)
        ├── div.muse-orbit-item[data-angle="154.29"][data-color="#F8D86A"][data-popup-title="Thunor · Renewable Energy"] (131)
        ├── div.muse-orbit-item[data-angle="205.71"][data-color="#5E47A1"][data-popup-title="Shukra · Bio-diversity"]  (142)
        ├── div.muse-orbit-item[data-angle="257.14"][data-color="#7F49A2"][data-popup-title="Dosei · Zero Hunger"]    (153)
        └── div.muse-orbit-item[data-angle="308.57"][data-color="#D48348"][data-popup-title="Solis · Well-being"]    (164)
```

**Complete data-attribute inventory for all 7 muse-orbit-items:**

| Line | Name | `data-angle` | `data-color` | `data-popup-title` | Image src |
|------|------|-------------|-------------|-------------------|-----------|
| 98 | Lunes | `0` | `#5783A6` | `Lunes · Water` | `muse/lunes.png` |
| 109 | Ares | `51.43` | `#D54D2E` | `Ares · Reforestation` | `muse/ares.png` |
| 120 | Rabu | `102.86` | `#8CB07F` | `Rabu · Human Rights` | `muse/rabu.png` |
| 131 | Thunor | `154.29` | `#F8D86A` | `Thunor · Renewable Energy` | `muse/thunor.png` |
| 142 | Shukra | `205.71` | `#5E47A1` | `Shukra · Bio-diversity` | `muse/shukra.png` |
| 153 | Dosei | `257.14` | `#7F49A2` | `Dosei · Zero Hunger` | `muse/dosei.png` |
| 164 | Solis | `308.57` | `#D48348` | `Solis · Well-being` | `muse/solis.png` |

Angle spacing is 360 / 7 ≈ 51.43°. JS (`MuseScroll`, main.js:2034) reads `data-angle` for initial orbit position and `data-color` / `data-popup-title` for popup rendering.

---

### 5. Comet Collab Wrapper (`.comet-collab-wrapper`, lines 181–362)

**Outer selector:** `div.comet-collab-wrapper`

#### 5a. Comet Intro (`.comet-collab-intro`, lines 183–212)

```
section#comet-collab-intro.comet-collab-intro
  [aria-label="Comet collab introduction"]                    (183)
├── div#comet-collab-intro-logo.comet-collab-intro-logo       (185)
│   └── img[src="assets/images/comet-collabs/comet-collabs-logo-white.png"][alt="Comet Collabs"] (186)
├── div.comet-collab-intro-content                            (190)
│   └── p.comet-methods-text                                  (191)
└── div#floating-processes.floating-processes                  (195)
    ├── div.floating-process[data-process="1"][draggable="true"]  (196)
    │   └── img[src="...process-one.png"][alt="Process 1"]    (197)
    ├── div.floating-process[data-process="2"][draggable="true"]  (199)
    ├── div.floating-process[data-process="3"][draggable="true"]  (202)
    ├── div.floating-process[data-process="4"][draggable="true"]  (205)
    └── div.floating-process[data-process="5"][draggable="true"]  (208)
```

`draggable="true"` enables HTML5 drag API, which `FloatingProcesses` module (JS:2298) augments with touch drag support.

#### 5b. Methods Toggle (`.comet-collab-methods`, lines 215–323)

```
div.comet-collab-methods                                      (215)
├── canvas#comet-collab-background-canvas
│     .comet-collab-background-canvas[aria-hidden="true"]    (217)
├── div.comet-toggle-wrap                                     (220)
│   └── div.comet-pill                                        (221)
│       ├── button#tab-stardust.pill-opt.active               (222)
│       │     onclick="switchTab('stardust')"
│       │     text: "I · Stardust"
│       ├── button#tab-horizon.pill-opt                       (223)
│       │     onclick="switchTab('horizon')"
│       │     text: "II · Horizon"
│       └── div#pillSlider.pill-slider                        (224)
│             JS adds class .right when horizon is active
└── div.comet-panels                                          (229)
    ├── div#panel-stardust.comet-panel.active                 (231)
    │     [data-method="stardust"]
    │   ├── div.comet-panel-desc                              (232)
    │   │   └── div                                           (233)
    │   │       ├── div.comet-panel-subtitle "comet collab I" (234)
    │   │       ├── div.comet-panel-title "Stardust"          (235)
    │   │       ├── p.comet-panel-body                        (236)
    │   │       └── a.comet-cta[href="#stardust"]             (237)
    │   │             "View campaigns →"
    │   └── div.comet-steps                                   (240)
    │       ├── div.step-row                                   (241)  step 01
    │       │   ├── div.step-num "01"                         (242)
    │       │   └── div.step-content                          (243)
    │       │       ├── div.step-title "Choose"               (244)
    │       │       └── div.step-body                         (245)
    │       ├── div.step-row                                   (248)  step 02
    │       ├── div.step-row                                   (255)  step 03
    │       └── div.step-row                                   (262)  step 04
    └── div#panel-horizon.comet-panel                         (273)
          [data-method="horizon"]
        ├── div.comet-panel-desc                              (274)
        │   └── div                                           (275)
        │       ├── div.comet-panel-subtitle "comet collab II"(276)
        │       ├── div.comet-panel-title "Horizon"           (277)
        │       ├── p.comet-panel-body                        (278)
        │       └── a.comet-cta[href="#horizon"]              (279)
        │             "View Future Labs →"
        └── div.comet-steps                                   (282)
            ├── div.step-row                                   (283)  step 01
            ├── div.step-row.step-addon                       (290)  step 02 — Horizon-only variant
            │   └── div.step-content includes:
            │       └── div.step-addon-badge "+ Horizon"      (293)
            ├── div.step-row                                   (298)  step 03
            ├── div.step-row                                   (305)  step 04
            └── div.step-row                                   (312)  step 05
```

**Inline event handlers:** `onclick="switchTab('stardust')"` and `onclick="switchTab('horizon')"` on the two pill buttons (lines 222–223). `switchTab()` is exposed as `window.switchTab` in JS (main.js:2821) specifically to support these inline calls.

#### 5c. Connected Images (`.comet-collab-connected-content`, lines 326–351)

```
section#comet-collab-connected-content.comet-collab-connected-content (326)
├── canvas#comet-collab-background-canvas-2
│     .comet-collab-background-canvas-2[aria-hidden="true"]  (328)
├── canvas#comet-connection-canvas.comet-connection-canvas    (331)
│     [aria-hidden="true"] — JS draws white lines between images
└── div.comet-connected-images                                (334)
    ├── div.comet-image-item[data-step="1"]                   (335)
    │   └── img[src="...process-one.png"][alt="Process 1"]   (336)
    ├── div.comet-image-item[data-step="2"]                   (338)
    ├── div.comet-image-item[data-step="3"]                   (341)
    ├── div.comet-image-item[data-step="4"]                   (344)
    └── div.comet-image-item[data-step="5"]                   (347)
```

`StepPopup` module (JS:2604) adds `.clickable` to `.comet-image-item` elements and attaches click/keydown listeners. `data-step` maps to keys `1`–`5` in `STEP_DATA[method]` (JS:198–243).

#### 5d. Step Popup Modal (`.step-popup`, lines 354–361)

```
div.step-popup[role="dialog"][aria-modal="true"]              (354)
  [aria-labelledby="step-popup-title"]
├── div.step-popup-overlay                                    (355)
│     Click → close popup (JS listener, not onclick attr)
└── div.step-popup-content                                    (356)
    ├── button.step-popup-close[aria-label="Close popup"] "×" (357)
    ├── h2#step-popup-title.step-popup-title                  (358)
    │     Empty on load — JS sets textContent from STEP_DATA
    └── p.step-popup-description                              (359)
          Empty on load — JS sets textContent from STEP_DATA
```

JS adds/removes `.active` on `.step-popup` to show/hide.

---

### 6. Events Page (`.events-page-wrapper`, lines 365–407)

**Selector:** `section#events-page.events-page-wrapper`

```
section#events-page.events-page-wrapper                       (365)
├── canvas#events-background-canvas.events-background-canvas  (367)
│     [aria-hidden="true"]
├── div.partnership-section                                   (370)
│   ├── h2.partnership-title "Partnership"                    (371)
│   └── div#partnership-slideshow                             (372)
│         ← JS-populated (PartnershipSlider module)
├── section#stardust.stardust                                 (378)
│   ├── div.stardust-header                                   (379)
│   │   ├── div                                               (380)
│   │   │   └── div.section-label[style="color:white;opacity:0.28;"]
│   │   │         "Stardust"
│   │   └── h2.stardust-headline                              (381)
│   │         "Where <em>art</em> meets cause."
│   └── div#stardust-campaigns                                (383)
│         ← JS-populated from data/events.json stardust[]
└── section#horizon.horizon                                   (389)
    ├── div.horizon-header                                     (390)
    │   ├── div.horizon-header-left                           (391)
    │   │   ├── div.section-label "Horizon · Future Lab"      (392)
    │   │   └── h2.horizon-headline                           (393)
    │   │         "Communities designing their own <em>futures.</em>"
    │   └── div.horizon-header-right                          (395)
    │       ├── p.horizon-question                            (396)
    │       └── p.horizon-body                                (397)
    ├── div#horizon-labs.horizon-proof                        (400)
    │     ← JS-populated from data/events.json horizon[]
    └── div.horizon-footnote                                  (403)
          Footnote about Robert Jungk's Zukunftswerkstatt
```

The inline `style="color:white;opacity:0.28;"` on `.section-label` at line 380 is an exception — it overrides a CSS default for this specific instance. All other styling uses CSS classes.

---

### 7. Footer (`.social-links`, lines 410–429)

```
footer.social-links[aria-label="Social media links"]         (410)
├── a.social-link[href="https://t.me/coco_ex"]               (411)
│     [target="_blank"][rel="noopener noreferrer"]
│     [aria-label="Join us on Telegram"]
│   └── svg.social-icon[viewBox="0 0 24 24"][fill="currentColor"] (412)
│         Telegram icon path                                  (413)
├── a.social-link[href="https://instagram.com/cocoex_"]      (416)
│     [target="_blank"][rel="noopener noreferrer"]
│     [aria-label="Follow us on Instagram"]
│   └── svg.social-icon[viewBox="0 0 24 24"][fill="currentColor"] (417)
└── a.social-link[href="https://www.linkedin.com/company/cocoex/"] (421)
      [target="_blank"][rel="noopener noreferrer"]
      [aria-label="Connect on LinkedIn"]
    └── svg.social-icon[viewBox="0 0 24 24"][fill="currentColor"] (422)

img.footer-logo[src="assets/images/cocoex-text.png"][alt="cocoex"] (429)
```

Footer is a sibling of `#events-page` inside `section#white-section`. It is **fixed-position**, revealed by GSAP when `#horizon` enters viewport (JS:1072–1086).

---

### 8. Muse Popup Modal (`#muse-popup`, lines 433–459)

```
div#muse-popup.muse-popup                                     (433)
  JS adds .active to show; removes to hide
├── canvas#muse-popup-starfield.muse-popup-starfield          (434)
│     Animated starfield inside popup background
├── div#muse-popup-overlay.muse-popup-overlay                 (435)
│     Click → close popup
├── div.muse-popup-content                                    (436)
│   ├── h2#muse-popup-title.muse-popup-title                 (437)
│   │     Empty on load — JS sets textContent (muse name)
│   ├── div.muse-card-wrapper                                 (438)
│   │   └── div.muse-card-shell                              (439)
│   │       └── section.muse-card                            (440)
│   │           └── div.muse-card-inside                     (441)
│   │               ├── div.muse-card-shine                  (442)
│   │               ├── div.muse-card-glare                  (443)
│   │               └── div#muse-popup-image.muse-popup-image (444)
│   │                   └── img#muse-popup-img[src=""][alt=""] (445)
│   │                         src + alt set by JS on popup open
│   ├── p#muse-popup-cause.muse-popup-cause                  (451)
│   │     JS sets textContent (e.g. "Lunes · Water")
│   ├── div.muse-popup-body                                   (452)
│   │   └── p#muse-popup-text.muse-popup-text                (453)
│   │         JS sets textContent (muse description paragraph)
│   └── button#muse-popup-close.muse-popup-close             (455)
│         [aria-label="Close popup (press Escape)"]
│         No visible text — CSS styles it as an × icon
├── div#muse-popup-particles.muse-popup-particles             (457)
│     JS injects <span> particle elements here; cleared on close
└── div.muse-popup-hint                                       (458)
      "Click outside or press ESC to close" — static text
```

**No `role="dialog"` or `aria-modal` on `#muse-popup`.** This differs from `.step-popup` (354) which has both. If adding accessibility attributes, follow the `.step-popup` pattern.

---

## Dynamic HTML (JS-Populated Elements)

### `#partnership-slideshow` — `PartnershipSlider` (JS:2560–2598)

Logo data comes from `PartnershipSlider.logos` array hardcoded in JS (not from `events.json` at runtime — logos array is in JS source at main.js:2564–2570). Logos are duplicated for seamless infinite scroll.

Structure JS inserts:

```html
<div class="partnership-track">
  <!-- First set (logos × N) -->
  <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Partner 1">
    <img src="assets/images/partnerships/partner1.png" alt="Partner 1" class="partnership-logo" loading="lazy">
  </a>
  <!-- … -->
  <!-- Duplicate set (same logos, for seamless loop) -->
  <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Partner 1">
    <img src="assets/images/partnerships/partner1.png" alt="Partner 1" class="partnership-logo" loading="lazy">
  </a>
  <!-- … -->
</div>
```

`partnership-track` is the scrolling inner element; CSS animation runs on it.

---

### `#stardust-campaigns` — populated from `data/events.json` `stardust[]`

**Note:** As of 2026-05-10, rendering of stardust campaigns into `#stardust-campaigns` is not yet implemented in `main.js`. The container holds a `<!-- Campaigns will be dynamically inserted here -->` comment. The `events.json` schema and expected card structure below are authoritative for when this is implemented.

Expected structure per campaign card (based on `events.json` schema and CSS class names in `styles.css`):

```html
<div class="campaign-card" data-status="active|open|archive">
  <div class="campaign-number">003</div>
  <div class="campaign-status">active</div><!-- or "open" / "archive" -->
  <div class="campaign-name">La Luna 007</div>
  <div class="campaign-subtitle">Silat Beksi × Wex Records × La Luna · Silent Rixdorf, Berlin · August 2026</div>
  <div class="campaign-ngo">Repair Together — rebuilding communities in war-affected Ukraine</div>
  <div class="campaign-muses">
    <span class="campaign-muse" style="color: var(--shukra)">♀ Shukra · Bio-diversity</span>
    <!-- repeat per muse in the muses[] array -->
  </div>
  <a href="#" class="campaign-link">View →</a><!-- omit if link is null -->
</div>
```

---

### `#horizon-labs` — populated from `data/events.json` `horizon[]`

**Note:** As of 2026-05-10, rendering is not yet implemented in `main.js`. Expected structure per horizon lab entry:

```html
<div class="horizon-lab">
  <div class="horizon-col">
    <div class="horizon-col-label">The event</div>
    <div class="horizon-col-title">Future Lab, Carezzano · 2024</div>
    <p class="horizon-col-body">Held during Vinili e Vinelli…</p>
  </div>
  <div class="horizon-col">
    <div class="horizon-col-label">The outcome</div>
    <div class="horizon-col-title">A community's choice</div>
    <p class="horizon-col-body">Participants chose Slow Food…</p>
  </div>
  <div class="horizon-col">
    <div class="horizon-col-label">The conclusion</div>
    <div class="horizon-col-title">Art as closure · September 2025</div>
    <p class="horizon-col-body">Works exhibited and sold…</p>
  </div>
</div>
```

---

### `.step-popup-title` / `.step-popup-description` — `StepPopup` (JS:2604–2711)

JS sets `textContent` (not `innerHTML`) on both elements. Content comes from `STEP_DATA[method][step]` in `main.js:198–243`. `method` is `"stardust"` or `"horizon"` (from `MethodToggle.getCurrentMethod()`); `step` is the string value of `data-step` on the clicked `.comet-image-item` (`"1"`–`"5"`).

No HTML structure is injected — only plain text strings.

---

### `#muse-popup-*` fields — `MusePopup` (JS:1828)

On click of any `.muse-orbit-item`, JS reads `data-color`, `data-popup-title`, and the `img` src/alt from within that item, then sets:

- `#muse-popup-title` → `textContent` = muse name (from `data-popup-title`, left of ` · `)
- `#muse-popup-cause` → `textContent` = cause string (from `data-popup-title`, right of ` · `)
- `#muse-popup-img` → `src` = image path from orbit item's `img`; `alt` = muse name
- `#muse-popup-text` → `textContent` = description `<p>` text from `.muse-text p` in orbit item
- `#muse-popup-particles` → JS clears then injects `<span>` elements with inline `style` for particle animation

---

## How to Add a New Muse Orbit Item

**Use case:** adding an 8th muse. Follow these steps exactly.

**1. Calculate the new angle.** Divide 360 by the new total count, space evenly. For 8 muses: 360 / 8 = 45°. Assign angles 0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°.

**2. Choose a hex color** for the muse accent (used in popup aura). Add it as a CSS variable in `:root` in `styles.css` following the existing muse color pattern.

**3. Add the image** to `assets/images/muse/` as a PNG.

**4. Insert this block inside `div.muse-orbit-container` (line 95), after the last `.muse-orbit-item` (before the closing `</div>` at line 174):**

```html
<!-- NewMuse -->
<div class="muse-orbit-item" data-angle="NEW_ANGLE" data-color="#HEXCOLOR" data-popup-title="NewMuse · Cause">
  <div class="muse-image">
    <img src="assets/images/muse/newmuse.png" alt="NewMuse">
  </div>
  <div class="muse-text">
    <h3>NewMuse</h3>
    <p>Description paragraph — one to two sentences about the muse's theme and global cause.</p>
  </div>
</div>
```

**Required attributes:**
- `data-angle` — numeric string, degrees (no unit suffix)
- `data-color` — hex string with `#`, must match the CSS variable value
- `data-popup-title` — `"Name · Cause"` format exactly; JS splits on ` · ` to extract name and cause separately

**Do not** add any `id`, `onclick`, or `tabindex` — `MusePopup` and `MuseScroll` use `querySelectorAll('.muse-orbit-item')` and handle keyboard focus automatically.

**5. Update `data-angle` values on all existing orbit items** to redistribute evenly at the new total count.

---

## How to Add a New Stardust Campaign

Stardust campaigns live entirely in `data/events.json`. Do not edit HTML.

**1. Open `data/events.json`.**

**2. Prepend a new object to the `stardust[]` array** (newest campaign first):

```json
{
  "number": "004",
  "status": "active",
  "name": "Campaign Name",
  "subtitle": "Artist · Venue · Location · Month Year",
  "ngo": "NGO Name — brief description of the organization",
  "muses": [
    {
      "symbol": "◯",
      "name": "Lunes",
      "cause": "Water",
      "color": "--lunes"
    }
  ],
  "link": "#",
  "linkText": "View →"
}
```

**Required fields:**

| Field | Type | Notes |
|-------|------|-------|
| `number` | string | Zero-padded 3-digit string: `"004"` |
| `status` | string | `"active"` (live), `"open"` (applications open), `"archive"` (past) |
| `name` | string | Campaign display name |
| `subtitle` | string | Context line — artist, venue, location, date |
| `ngo` | string | Partner NGO name and one-line description |
| `muses` | array | At least one entry; each has `symbol`, `name`, `cause`, `color` |
| `muses[].color` | string | CSS variable name without `var()`: `"--lunes"`, `"--ares"`, etc. |
| `link` | string or null | URL for CTA button; `null` if no link (renders label only) |
| `linkText` | string | CTA button label |

**3. No HTML changes needed.** Once the JS rendering is implemented, campaigns populate automatically.

---

## How to Add a New Process Step

Process steps appear in two places: the method panels (`.comet-steps`) and the connected images section (`.comet-connected-images`). Currently fixed at 5 steps. To add a 6th:

**1. Add the step row to both method panels.**

In `#panel-stardust` (line 231), inside `div.comet-steps`, add after the last `.step-row`:

```html
<div class="step-row">
  <div class="step-num">05</div>
  <div class="step-content">
    <div class="step-title">Step Title</div>
    <div class="step-body">Short description of this step.</div>
  </div>
</div>
```

In `#panel-horizon` (line 273), inside its `div.comet-steps`, add similarly with step number `06` (since horizon already has 5 steps).

**2. Add a connected image item** inside `div.comet-connected-images` (line 334):

```html
<div class="comet-image-item" data-step="6">
  <img src="assets/images/comet-collabs/process-six.png" alt="Process 6">
</div>
```

`data-step` must match the key in `STEP_DATA` in `main.js:198`.

**3. Add the image asset** to `assets/images/comet-collabs/process-six.png`.

**4. Update `STEP_DATA`** in `main.js:198–243` — add key `6` to both `stardust` and `horizon` objects with `title` and `description` strings.

**5. Add a floating process image** inside `div#floating-processes` (line 195):

```html
<div class="floating-process" data-process="6" draggable="true">
  <img src="assets/images/comet-collabs/process-six.png" alt="Process 6">
</div>
```

---

## HTML Checklist (before committing new markup)

- [ ] Semantic element used (`section`/`article`/`nav`/`footer`, not div soup) — see conventions above
- [ ] `aria-label` on every new `<section>` and `<article>`
- [ ] `aria-label` on every interactive element without visible text (icon buttons, canvas elements that receive focus)
- [ ] `aria-hidden="true"` on all decorative canvases and animation containers
- [ ] Descriptive `alt` text on all `<img>` elements — never empty except JS-populated images set before display
- [ ] `rel="noopener noreferrer"` on every `target="_blank"` link
- [ ] `data-*` attributes use kebab-case (e.g. `data-popup-title`, not `data-popupTitle`)
- [ ] No inline `style` attributes — use CSS classes (exception: the `.section-label` at line 380 is a documented exception)
- [ ] No inline event handlers except `onclick="switchTab('...')"` on `.pill-opt` buttons — that pattern is intentional and the function is globally exposed
- [ ] Touch targets ≥ 44px for all interactive elements (social icons are 52px)
- [ ] `loading="lazy"` on all below-the-fold images
- [ ] Version query string (`?v=X.X`) incremented on `styles.css` and `main.js` links if making a cache-breaking release
- [ ] New canvases get both a `class` (CSS) and an `id` (JS) and `aria-hidden="true"`
- [ ] New modal dialogs get `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the title element
