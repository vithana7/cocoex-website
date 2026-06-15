# cocoex.xyz — AI Context & Technical Reference

> **UPDATED AT:** 2026-06-15 (COMET DIVE — REVEAL-START FLASH FIX. The Comet→toggle "dive" reveals the Stardust/Horizon panel THROUGH the growing Comet-Collab swirl — a 2D-canvas swirl (`src/ui/comet-dive.js`) + WebGL ripple (`src/webgl/burst-ripple.js`), both drawn by the central `Renderer` from one `dive.p`, masking the static methods panel with the holey swirl SVG (`comet-mark-white.svg`) so it reveals ONLY within the WHITE of the logo (content + section masked-revealed through the swirl). The flicker was the section **background** flashing **unmasked** ("the background turns white") for one scroll step at the reveal start: `comet.js` sets the panel opaque (`.set(methods,{opacity:1},70)`) but `comet-dive.js` applied the mask only when `reveal > 0`, so at the `reveal == 0` boundary the panel was opaque-but-unmasked (CDP-confirmed `op:1, mask:no` at scroll 10430–10434, mobile). **Fixed** in `comet-dive.js` `draw()`: apply the mask for the whole reveal **including `reveal == 0`** (dropped the `reveal > 0` gate) so the panel is never opaque-but-unmasked; and `setState`'s out-of-band clear changed from `reveal<=0` to `appear<=0` (`reveal==0` is now the masked take-over, so clearing there would re-flash; `appear<=0` still releases on jumps before the dive). NOT the toggle content (an earlier content-gate attempt was reverted — gating it proved the flash persisted). Full feature history + knobs in `memoedit-comettransition.md` (`comet-dive.js`/`burst-ripple.js` are NOT yet in the module map below). ALSO this pass: **stars +10%** — the unified white-on-black starfield is `createStarfield('unified-starfield-canvas', { intensity: 0.275 })` (was the `0.25` default; `intensity` is the linear brightness mult in `STARFIELD_FRAG`). **Intro idle-dots fix** — the orbit `onUpdate` idle branch now ALSO clears the dots' inline `opacity`/position so `.intro-idle .orbit-dot{opacity:0}` re-hides them on scroll-back to the top (they'd been left stuck visible + off-position by `updateOrbit`'s inline `opacity:1`). **Mission copy replaced** (`#mission-overlay .reveal-text` top+bottom = the new "transdisciplinary social impact lab" text) + **`.reveal-text` sized down** from `--font-body-size` to `--font-lead-size`/`--font-lead-height` now that it's multi-sentence prose. PRIOR — MUSE PACING FIX + ORBIT HALO. **Critical:** `muse.js`/`comet.js` fed ScrollTrigger `top+=Xvh` strings, which GSAP reads as **px** — collapsing the whole muse timeline into ~460px (~½ a swipe), which is why editing `PHASES` "did nothing". `buildMuseTimeline` now converts vh→px via `phase().startFromSection()`/`endFromSection()` in function-form start/end (the intro pattern); the muse pacing is now actually driven by `PHASES`. **Muse 490vh** = `fadein 50 / hold 120 / switch 100 / orbitHold 220`: intro copy reveal **matched to the cocoex mission** (~50vh fade-in + ~120vh readable hold), and the orbit gets a **~120vh pinned hold** before its 100vh scroll-out (`orbitHold` = 100 structural exit + 120 dwell). **NEW roaming "click me" halo:** `MuseScroll` moves a spectrum comet-trail glow (`.muse-orbit-card::before`, `.beam-glow` recipe, continuous ~300° trail + bright leading head, `2s` spin) across one random orbit muse at a time (`.is-hinting`), gated to when the orbit is live, yielding to hover/popup. `PARTNERS` in `data.js` now carry real clickable `url`s. **comet.js still has the latent vh-as-px bug** (left per product call — comet pacing unchanged). Prior pass (RIPPLE + SAFARI): Intro **big-bang pulse → muse-spectrum RIPPLE**: `INTRO_FRAG` now draws concentric ease-OUT wavefront rings (decelerate as they widen, reach all screen edges), tinted across the 7 muse hues (`museTint`), organic via snoise wobble. `u_pulse` is **scroll-driven from the explosion progress** (`updateExplosion`: `pulse = min(1, progress/0.45)`), not time — so it rides the burst; the time-incrementer `Renderer` layer was removed. Statement (`#intro-statement`) now **exits WITH the constellation** (one timeline `explosion.start → mission-mid`, fade-out lands on the smoke window). Idle orbit dots fixed (`.intro-idle .orbit-dot { animation: none }` — pulseDot keyframes were overriding `opacity:0`, leaving dots pulsing at the top-left). Intro tagline flare is now **scroll-scrubbed** (`--sweep` on a `scrub` trigger) + a wider feathered band. Comet **starline wire now invisible** — only the muse-spectrum comet runs the (now hidden) 1→5 path; `ProcessLinks` gained a **self-heal resize** in `draw()` (iOS `100dvh` URL-bar fix). `.beam-glow::after` bloom **masked to the rounded ring** (Safari leaked a square box on the blurred filled pseudo). Muse popup subtitle opened up (`letter-spacing 0.14em`, larger) + subtitle/description grouped (`.muse-popup-caption`). Footer **~50% smaller desktop / ~20% mobile** (`min-width:1024px` breakpoint) + bottom buffer. Safari audit: guarded a shader NaN (`pow(max(sin·,0),0.6)`), added `color-mix` disc fallbacks. **Section totals: intro 592 + muse 490 + comet 500 = ~1582vh** (plus static events + footer). 5 WebGL + 3 2D-canvas surfaces.)
> Run `/doc-minder` after any meaningful change to keep this file current.

---

## What This File Is

Ground-truth context for any Claude session working on this codebase. Read this before touching any file. When in doubt about a line number, verify with the actual file — this document can lag behind the code.

**Source code is the reference.** `index.html`, the ES modules under `src/`, and the stylesheets under `src/styles/*.css` are authoritative — grep them directly. The `docs/` folder explains *why*, not *what*.

**On session start — read these docs before writing any code:**

| Priority | File | Read when |
|---|---|---|
| Always | `docs/technical-spec.md` | Architecture decisions, scroll timing, WebGL rationale |
| Layout work | `docs/responsive-design.md` | Fluid typography strategy, orbit ellipse, breakpoint philosophy |
| Dependencies | `docs/libraries.md` | GSAP + Lenis, Typekit, project-specific patterns |

---

## Project Identity

**cocoex** is an art DAO blending art, blockchain, community and social impact.

**Mission:** Art moves people. People move the world.
**Throughline:** The creation belongs to the artists. The impact belongs to the world.

**Brand rules (apply silently):**
- `cocoex` — always lowercase in copy. `CoCoEX` is a graphic asset only, never typed.
- Tone: precise, poetic. Never: "innovative", "transformative", "impactful", "leveraging".
- Reference world: independent publishing, art institutions, artist studios.
- Font: Canela (bold 700 + regular 400) via Adobe Typekit ID `afs8ors`. Fallback: Georgia, serif.
- Logo system: three hand-drawn logos (cocoex symbol, Comet Collab, Muse constellation). Never simplify or substitute geometry.

---

## The Seven Muses (Canonical)

| # | Name | Cause | Hex | CSS Var | Planet | Day |
|---|------|-------|-----|---------|--------|-----|
| 1 | **Lunes** | Water | `#5783A6` | `--lunes` | Moon | Monday |
| 2 | **Ares** | Reforestation | `#D54D2E` | `--ares` | Mars | Tuesday |
| 3 | **Rabu** | Human Rights | `#8CB07F` | `--rabu` | Mercury | Wednesday |
| 4 | **Thunor** | Renewable Energy | `#F8D86A` | `--thunor` | Jupiter | Thursday |
| 5 | **Shukra** | Bio-diversity | `#5E47A1` | `--shukra` | Venus | Friday |
| 6 | **Dosei** | Zero Hunger | `#7F49A2` | `--dosei` | Saturn | Saturday |
| 7 | **Solis** | Well-being | `#D48348` | `--solis` | Sun | Sunday |

Muse colors are used for: orbit dot fills, popup aura glow, muse tags in campaign cards, WebGL gradient blends.

---

## Site Architecture

**Stack:** Vanilla HTML5 / CSS3 / JavaScript ES modules · Vite build (`^5.4.0`) · GSAP 3.12.5 + Lenis 1.3.4 (npm deps, imported as modules — **not CDN**) · WebGL (custom GLSL).

**Build & deps:**
- `package.json` (`type: module`) — deps `gsap 3.12.5`, `lenis 1.3.4`; devDep `vite ^5.4.0`.
- `vite.config.js` — `base: './'`, build `target: es2018`, `outDir: dist`, `assetsInlineLimit: 0`; dev server port `5173`.
- `index.html` loads exactly one module entry — `<script type="module" src="/src/main.js">`. **No CDN `<script>` tags, no inline `onclick`.**
- GSAP / ScrollTrigger / Lenis are `import`ed in the modules that need them (`import { gsap } from 'gsap'`, `import { ScrollTrigger } from 'gsap/ScrollTrigger'`, `import Lenis from 'lenis'`).
- `npm install` → `npm run dev` (Vite dev server, port 5173) → `npm run build` (emits `dist/`) → `npm run preview`.

**Module map (`src/`):**

| Path | Responsibility |
|------|----------------|
| `src/main.js` | `boot()`: import CSS, `applyHeightsToCss()`, `initSmoothScroll()`, create 5 WebGL surfaces (+ the 2D popup galaxy) + register them as gated `Renderer` layers, init the four sections, `initSectionGate()`, `Renderer.start()`, debounced resize. |
| `src/data.js` | `CONFIG`, `isMobile`, `DOT_COLORS`, `CONSTELLATION_REF`, `CONNECTIONS`, `MUSES`, `PARTNERS`, easing fns. |
| `src/scroll/timeline.js` | **Single source of truth** for scroll pacing — `PHASES`, builder, `phase()`, `sectionSpan()`, `vhToPx()`, `applyHeightsToCss()`, `COMET_CONST_HIDE_VH`. |
| `src/scroll/smooth-scroll.js` | Lenis init, body-as-scroller, rides `gsap.ticker`, `scrollerProxy`; `normalizeScroll` deliberately OFF. |
| `src/scroll/section-gate.js` | Derives active section (`intro`/`muse`/`comet`/`events`) from scroll with a 75vh **lead buffer**; drives `Renderer.setSection`. |
| `src/webgl/renderer.js` | `Renderer` singleton — one `requestAnimationFrame` loop, renders only layers whose section is active; `visibilitychange` gating. |
| `src/webgl/gl-context.js` | `DPR` cap (`min(devicePixelRatio, 2)`), `getGL`, `compileShader`, `createProgram`, `bindFullscreenQuad`, `sizeCanvas`. |
| `src/webgl/starfield.js` | `createStarfield(canvasId, options)` factory — shared by 3 surfaces; `render(now)` uses the shared RAF timestamp. |
| `src/webgl/intro-starfield.js` | `createIntroStarfield(canvasId)` — own shader, `setPulse(v)` drives the muse-spectrum ripple (v = explosion scroll progress), context-lost handlers. |
| `src/webgl/shaders/glsl-utils.js` | `SIMPLEX_NOISE`, `STAR_FIELD`, `VERTEX_QUAD` (verbatim GLSL). |
| `src/webgl/shaders/intro-frag.js` | `INTRO_FRAG` (cosmic noise + scroll-driven muse-spectrum ripple burst via `museTint` + ease-out wavefront) + `STARFIELD_FRAG` (factory shader). |
| `src/sections/intro.js` | Orbit → transition text → 2D-canvas constellation explosion → smoke clear → mission reveal; builds GSAP timelines wired to `timeline.js`; owns intro-overlay teardown at the TRUE intro end. |
| `src/sections/muse.js` | `initMuse`: `MuseScroll` adaptive-ellipse orbit (depth + zIndex churn fix); orbit items are hover-flip cards (`hovering` flag freezes the orbit on hover/focus, per-item `--muse-color`); registers gated layer; black→white switch + logo crossfade. `buildMuseTimeline` uses **px** (vh→px via `phase().*FromSection()`) in function-form start/end — NOT raw `vh` strings (ScrollTrigger reads those as px). Roaming **`.is-hinting` "click me" halo** (`scheduleHint`/`showHint`/`clearHint`). |
| `src/sections/comet.js` | `initComet`: pill `Toggle` (attached listeners, no inline onclick); registers `ProcessLinks.draw` as gated layer; two sequential sticky panels (intro 200vh + tabs 300vh). |
| `src/sections/events.js` | `initEvents`: partnership logo marquee (duplicated track). |
| `src/ui/focus-trap.js` | `getFocusable`, `createFocusTrap`, `wireModalDismiss`. |
| `src/ui/muse-popup.js` | `MusePopup` — modal over the orbit. Holds the ordered muse array; `open(index)` / `next()` / `prev()` / `goTo(index, dir)` with wrap. White symbol on a colored disc; 3D pointer tilt; **Y-flip** on muse switch (swap at edge-on); reactive popup starfield (tints to muse hue + intensity pulse) + galaxy color; keyboard ←/→, swipe, focus-trap. Renders the description as one block per sentence. |
| `src/ui/muse-galaxy.js` | `createMuseGalaxy(canvasId)` — 2D spiral-galaxy particle field for the popup (~120 dots, polar `(r,θ)`, differential rotation + inward drift, outer-biased density). Drawn by the gated `Renderer` only while the popup is open; centers on the live card rect; portrait `sy` stretch; particles draw as velocity-aligned **streaks** that brighten and dissolve onto the disc rim (absorbed, never over the face). |
| `src/ui/floating-processes.js` | `FloatingProcesses` — places 5 process imgs once (`setInitialPositions`); they bob via CSS `float` animation. Drag was removed; `pointer-events: none`. |
| `src/ui/process-links.js` | `ProcessLinks` — 2D-canvas path through the 5 processes. The **connecting wire is no longer drawn** (invisible); only a **muse-spectrum comet** runs the hidden 1→5 path with fluid `easeInOutSine` motion + speed-based streak stretch (motion blur), looping with a fade-hidden seam. `draw(now)` self-heals the canvas backing store if the live rect drifts (iOS `100dvh` URL-bar fix), redraws EVERY frame but cheap — NO per-frame `shadowBlur`. |
| `src/styles/tokens.css` | `:root` design tokens — colors, 7 muse hexes, font clamps, logo sizes, spacing, z-index, transitions. |
| `src/styles/base.css` | reset, `html/body` height 100% + body `overflow-y:auto` for Lenis, scrollbar, `canvas.bg-layer`, `.visually-hidden`, `prefers-reduced-motion`; **reusable `.beam-glow`** (`@property --beam-angle` + `@keyframes beam-spin` — animated muse-spectrum border-beam, the standard button glow). Both `::before` (crisp ring) AND `::after` (soft bloom) are **masked to the rounded ring band** — Safari fails to clip a *blurred filled* pseudo to `border-radius` and leaks a square box, so the bloom reuses the ring mask + blur instead. |
| `src/styles/intro.css` | intro section; `.intro-spacer { height: var(--intro-h) }`; orbit dots, `.intro-tagline` / `.intro-statement` (the two transition beats), mission overlay, unified starfield, white-section. |
| `src/styles/muse.css` | `.muse-panel { height: var(--muse-h) }`; sticky muse stage; orbit hover-flip cards (`.muse-orbit-card`/`-shell`/`-face`/`-disc`/`-name`/`-cause`); the roaming `.muse-orbit-card::before` "click me" halo (shown via `.muse-orbit-item.is-hinting`); full popup system. |
| `src/styles/comet.css` | `.comet-panel-intro` literal `200vh` / `.comet-panel-tabs` literal `300vh`; pill toggle (`.comet-pill.beam-glow`, `:focus-visible`); `@keyframes fadeInPanel`. |
| `src/styles/events-footer.css` | partnership marquee + `.partnership-intro` framing line + footer. Footer is deliberately shrunk **~20% on mobile (base) / ~50% on desktop (`min-width:1024px` override)** — needs a breakpoint, not a clamp (desktop must be *smaller* than mobile, an inverted relationship); `.footer-logo` carries a `clamp` bottom buffer so it isn't flush to the page edge. |
| `src/styles/responsive.css` | 1024/768/480 breakpoints + `max-height:500px`; reduced-motion lives in `base.css`. |

Assets live in `public/assets/images/` — Vite serves `public/` at the site root, so HTML references them as `assets/images/...`. `PartnershipSlider` (now `initEvents`) uses a hardcoded array from `data.js`; Stardust/Horizon panels render static markup.

**Total scroll height:** ~1582vh (intro 592 incl. mission overlay + muse 490 + comet 500, plus the static events page + footer). Heights are injected from `timeline.js` — see SCROLL pacing below.

---

## Page Sections (Top → Bottom)

### 1. Landing / Intro + Mission (`0–592vh`, section `intro`)
**HTML:** `index.html:24–57` · **CSS:** `src/styles/intro.css` · **JS:** `src/sections/intro.js` (timelines) + `src/webgl/intro-starfield.js` (`#bg-canvas`)

Fixed overlay. The mission statement is part of this section — it overlays the settled constellation dots rather than living in its own scroll section. The section height is injected as `var(--intro-h)`; `.intro-spacer` reads it. The intro is built from five `timeline.js` phases (see SCROLL pacing): `intro.orbit` 192, `intro.explosion` 100, `intro.statement` 40, `intro.mission` 100, `intro.missionHold` 160 → **592vh total**. (The two transition copy "beats" are NOT their own phases — see below.)
- **Landing idle (before any scroll):** `.intro-content` carries the `intro-idle` class, which shows ONLY the centered cocoex logo (at the 80px orbit-START size, `ORBIT.logoMinSize`) gently pulsing, plus a bottom-centered scroll-down arrow hint (`#scroll-hint`). The orbit dots are hidden. The orbit ScrollTrigger's `onUpdate` toggles `intro-idle` off the instant `progress > 0.001` (and clears the inline logo size so `updateOrbit` takes over with no size jump); on scroll-BACK to the top the idle branch ALSO clears the dots' inline `opacity`/`left`/`top`/`width`/`height` so `.intro-idle .orbit-dot{opacity:0}` re-hides them (else `updateOrbit`'s inline `opacity:1` left them stuck visible + off-position).
- **`intro.orbit` (0–192vh):** white + black dots orbit center; logo scales up, 2 full rotations (`updateOrbit`). **Beat 1 — tagline** (`#intro-tagline`, "cocoex · compounds co-exist") fades in over the BACK HALF of this phase (sub-range `orbit 45% → explosion 12%`, driven in `intro.js`, not a phase) and holds to the burst — sized to match the statement. It also does a **"Dia" text reveal**: a muse-spectrum colour band (wide, feathered) sweeps across the otherwise-white text (`.intro-tagline p` is `background-clip:text` over a gradient whose position is the `--sweep` var; GSAP **scroll-scrubs** `--sweep` 100→0 on a `scrub` trigger over the same on-screen window so the band carries scroll weight, skipped under reduced-motion).
- **`intro.explosion` (192–292vh):** 7 colored constellation dots explode from center on the 2D `#constellation-canvas`, and the WebGL `#bg-canvas` fires a **muse-spectrum ripple** synced to the same burst — `u_pulse` is driven straight from the explosion scroll progress (`updateExplosion`: `pulse = min(1, progress/0.45)`, NOT time), so the concentric ease-out wavefront expands + decelerates with the dots flying out. Both front-loaded so they settle then hold. The layout reference is landscape (1400×800); on a **portrait** viewport (`height > width`) `initFireworkDots` transposes it 90° (ref-x → vertical, ref-y → horizontal). `resize()` re-projects if the explosion already ran. **Beat 2 — statement** (`#intro-statement`, "Unleashing the compounds of existence through ART, IMPACT, and COMMUNITY." — no quotation marks) fades in DURING the outward burst (first ~15% of one timeline spanning `explosion.start → mission-mid`), holds over the settled constellation, then **fades out together with the constellation** (its fade-out lands exactly on the smoke-clear window, so words + dots leave as one).
- **`intro.statement` (292–332vh):** dedicated hold/fade-out room for Beat 2 over the settled constellation (smoke hasn't cleared yet).
- **`intro.mission` (332–432vh):** smoke clears, then the mission fades in. Smoke = BOTH the 2D constellation (`#constellation-canvas`) AND the cosmic-noise WebGL backdrop (`#bg-canvas`) fading to opacity 0 over the first half of this phase (`smokeLayers`); the mission overlay then fades in over the back half.
- **`intro.missionHold` (432–592vh):** mission holds fully bright, then `.intro-content` fades out over the last 25% of the phase, handing off to the muse intro fading in underneath.

The mission overlay (`#mission-overlay`) centers both `.reveal-text` lines together as one centered flex block. `<em>cocoex</em>` renders as hollow outlined text.

Key elements: `#bg-canvas` (WebGL starfield), `#dot-white`, `#dot-black`, `#intro-logo`, `#final-dot`, `#intro-tagline` (Beat 1), `#constellation-canvas`, `#intro-statement` (Beat 2), `#mission-overlay` / `#reveal-text`.

---

### 2. Muse — Intro → Orbit (section `muse`, 490vh, follows intro at ~592vh)
**HTML:** `index.html:61–178` (single `.muse-section-wrapper` → `.section-panel.muse-panel` → `.muse-stage`) · **CSS:** `src/styles/muse.css` · **JS:** `src/sections/muse.js` (`MuseScroll` + `buildMuseTimeline`)

**ONE overlapping panel.** Intro and orbit share `.muse-stage` (sticky), so the center logo stays put while the background flips black→white. The 490vh panel height is `var(--muse-h)`. Phases (from `timeline.js`): `muse.fadein` 50, `muse.hold` 120, `muse.switch` 100, `muse.orbitHold` 220. **`buildMuseTimeline` converts these vh→px** via `phase().startFromSection()`/`endFromSection()` in function-form `start`/`end` (+ `invalidateOnRefresh`) — ScrollTrigger reads a raw `top+=Xvh` string as **pixels**, so the vh MUST be converted or the whole timeline collapses (see Common Bugs). The intro reveal is **deliberately matched to the cocoex mission** (~50vh fade-in + ~120vh readable hold).
- **Intro fade-in (0–50vh into the panel):** `.muse-shared-logo` + `.muse-intro-copy` fade in **TOGETHER** (**pure opacity, no translateY/slide, no stagger** — one linear `[logo, copy]` opacity move that mirrors the cocoex mission reveal's flow + duration). Copy is a short couplet: the hook "Seven causes. / One constellation." (top, LEADS — H1 size, weight 700) + the framework line (bottom, `--font-lead-size`, demoted so the hook leads), both centered. The two lines sit at `top: 16%` / `bottom: 16%` for breathing room from the center logo.
- **Hold (50–170vh):** intro holds fully readable (~120vh, mission-length).
- **Switch (170–270vh):** the white `.muse-section` bg fades in, the center logo **opacity-crossfades white→black** (two stacked `<img>`: `#muse-logo-white` out, `#muse-logo-black` in — NO `filter()` tween), and the intro copy fades out as the orbit takes over.
- **Orbit hold + exit (`muse.orbitHold`, 270–490vh):** `orbitHold` = a **100vh structural exit tail + ~120vh pinned hold** of the revealed orbit. The switch ends at 270vh; the 100dvh sticky stage un-sticks at `panelHeight − 100vh` (= 390vh into the panel), so the orbit sits **fully revealed and pinned for ~120vh** (270→390) — a beat to read/click the muses — then scrolls its own height out into comet over the final 100vh. (Pinned dwell = `orbitHold − 100`; raise `orbitHold` for more orbit hold, but it can't drop below ~100 or the reveal completes during the exit.)

The switch is race-free: intro layers are transparent (black starfield shows through), only the white `.muse-section` is opaque, so fading white IN over the transparent intro has no opaque-over-opaque fight.

7 `.muse-orbit-item` elements rotate on an adaptive ellipse (`MuseScroll.calcRadius`/`update`). Ratio interpolates smoothly with viewport aspect (no breakpoint pop): wide → horizontal, square → near-circular, tall → vertical. Each muse has depth scaling from `sin(angle)` (front ~1.05, back ~0.65) with matching `zIndex` — `zIndex` is only written when its rounded value changes (a per-frame stacking-context churn fix). `data-angle` is parsed once on init.

Each orbit item is a **mini flip card** that mirrors the popup disc: `.muse-orbit-item` (JS writes per-frame `translate/scale`) → `.muse-orbit-card` (perspective) → `.muse-orbit-card-shell` (flips) → two `.muse-orbit-face`s. **Front** = the **white** symbol (`<muse>-white.png`) engraved on a `--muse-color` radial-gradient disc with SVG-noise grain (same recipe as the popup `.muse-card-inside`); **back** = the muse **name** (`.muse-orbit-name`) **+ cause caption** (`.muse-orbit-cause`, smaller), both UPPERCASE, stacked and centred, white + dark text-shadow for AA on the light hues (cause wraps to 2 lines on long ones like "Renewable Energy"). The flip lives on the inner shell so it never fights the item's per-frame transform — a CSS-only `rotateY(180deg)` on `:hover`/`:focus-visible`, gated behind `@media (hover: hover)` (`prefers-reduced-motion` drops the transition). **`:focus-visible` not `:focus-within`** — closing the popup restores focus to the orbit item, and `:focus-within` left the card stuck flipped (the JS freeze likewise now only fires on `:focus-visible`). On hover/focus the **whole orbit freezes** (`MuseScroll.hovering` flag skips the `animationTime` advance) so the now-still card is easy to click; `mouseleave`/`blur` thaws. Per-item `--muse-color` is set from `data-color` in `attachHandlers`. The old black name label under each muse is gone; the original `.muse-text` (`h3` + `p`) stays in the DOM `display:none` + `aria-hidden` purely as the popup's data source. Touch devices skip the flip/freeze entirely — a tap just opens the popup.

**Roaming "click me" halo:** to signal the discs are clickable, `MuseScroll` moves a single spectrum halo from muse to muse. `.muse-orbit-card::before` is a `.beam-glow`-style conic-gradient ring (masked thin core + `blur` so it spreads to a soft ray), sitting `z-index:-1` behind the disc so only its rim glows; it's a **continuous ~300° comet trail with a bright leading head** (no big dark gap → the `2s` spin reads as one smooth turn, not a disappear-and-snap). Hidden until the owning `.muse-orbit-item` gets `.is-hinting`. The JS roamer (`scheduleHint`/`showHint`/`clearHint`) gives one random muse `.is-hinting` at a time, hopping every ~3.5s (CSS opacity crossfades the swap); it's gated to when the orbit is actually live (keys off `update()`'s `lastTime`) and yields to hover/`:focus-visible`/`MusePopup.isOpen`/hidden tab. Hover/focus calls `clearHint()` so the halo never fights the flip. Reduced-motion freezes the spin to a static glow.

Click any muse → **Muse Popup** (`src/ui/muse-popup.js` `MusePopup`). Layout: **name** header (`#muse-popup-title`, the `aria-labelledby` target, UPPERCASE) above the disc; **cause** subtitle (`#muse-popup-cause`, bold italic, `clamp(18px,2vw,24px)`, `letter-spacing: 0.14em` for legibility) + **description** (`#muse-popup-text`, `clamp(18px,1.4vw,20px)`) **grouped in `.muse-popup-caption`** (own tight gap so the description sits a line under the subtitle) below. The disc (`.muse-card-inside`) is a muse-color radial gradient with a faint SVG-noise grain; the **white** symbol (`<muse>-white.png`) sits on it with an engrave filter (dark-below + light-above drop-shadows). 3D pointer **tilt** drives the shine/glare via CSS vars. Behind it: a reactive WebGL **starfield** (`#muse-popup-starfield`) + a 2D **spiral-galaxy** particle field (`#muse-popup-galaxy`) whose dots are absorbed onto the disc rim.
- **Navigation:** prev/next arrow buttons (`#muse-popup-prev`/`#muse-popup-next`) + keyboard ←/→ + horizontal swipe, **wrapping** 0↔6. Switching does a **3D Y-flip** of `.muse-card-shell` (direction follows the arrow), swapping symbol + disc color + galaxy color at the edge-on moment; title/cause/description fade in sync. Reduced-motion → instant crossfade.
- **Close:** top-right **`.muse-popup-close`** styled as the arrow-twin (`.muse-popup-nav`), pinned to the popup (not the content) so copy length never moves it. Escape / click-outside also close.
- **Card stays level across muses:** `.muse-card-wrapper` is `flex-shrink:0` (never squished into an oval) and `.muse-popup-body` reserves a constant `min-height: clamp(148px, 10vw, 160px)` (measured against real Canela so the tallest description fits at every width — all 7 bodies equal, disc level, no overflow/leak) with copy top-aligned, so variable-length descriptions don't shift the disc.

WebGL: `#muse-background-canvas` (inverted starfield — black stars on off-white), a `createStarfield(..., { invert: true })` instance created in `main.js`.

---

### 3. Comet Collab Intro (section `comet` panel 1, `comet-panel-intro` = literal 200vh)
**HTML:** `index.html:181–202` · **CSS:** `src/styles/comet.css` · **JS:** `src/sections/comet.js` (`buildCometTimeline`) + `src/ui/floating-processes.js` + `src/ui/process-links.js`

Sticky panel. Constellation hides over `COMET_CONST_HIDE_VH = 40`vh (from `timeline.js`, overlaps the fade-in). The intro fades in over 100vh, holds, then fades out as the panel scrolls away (phases `comet.introIn` 100 + `comet.introHold` 100). The White Comet Collabs logo descent is CSS-positioned (**no JS descent tween**). Intro copy ends "...through Stardust and Horizon." then "Guided by Muse, in a continuous loop of creation and impact." on its own line, centered.

5 floating process images (`.floating-process`, positions set once in `FloatingProcesses.setInitialPositions`, then left to a CSS `float` bob). **Drag was removed** — users liked the fixed arrangement; the elements are `pointer-events: none` and carry no `draggable` attribute or drag listeners. The connecting **wire is intentionally NOT drawn** (`#process-link-canvas`, 2D, `ProcessLinks` registered as a gated `Renderer` layer, fed the shared `now`) — only a **muse-spectrum comet** (the toggle beam, in canvas) runs the hidden 1→2→3→4→5 path, reading live `getBoundingClientRect()` as they bob, with fluid `easeInOutSine` motion — velocity `sin(πp)`, zero only at the two endpoints so it flows through interior nodes without stalling — its streak length tracking speed (motion blur), looping with a short fade so the seam is invisible. Glow is faked with translucent gradient strokes; NO per-frame `shadowBlur`. `draw()` self-heals the canvas size if the live rect drifts (the iOS `100dvh` URL-bar fix).

---

### 4. Comet Methods Toggle (section `comet` panel 2, `comet-panel-tabs` = literal 300vh)
**HTML:** `index.html:203–254` · **CSS:** `src/styles/comet.css` · **JS:** `src/sections/comet.js` (`Toggle`)

Second sticky panel (sequential, not overlapping the intro). Methods panel fades in over 100vh, then holds through closure (phases `comet.methodsIn` 100 + `comet.methodsHold` 100). Comet ends here — there is **no connected-images panel**.

Pill toggle (`.comet-pill.beam-glow`) — labels are just "Stardust" / "Horizon" (no "I·/II·"; the numbering lives in the panel subtitles). Carries the reusable `.beam-glow` running-glow. Switches between:
- **Stardust:** artist flow (select cause → create work → launch campaign → funds split)
- **Horizon:** Future Lab flow, with the `+Horizon` badge **inline in front of the "Future Lab" step title** (the differentiator)

The toggle is wired by `Toggle.init()` attaching `click` listeners to `#tab-stardust` / `#tab-horizon` (**no inline onclick, no global `window.switchTab`**); `Toggle.switch(method)` flips `.active` classes + the `#pillSlider` position. Switch smoothness: `.pill-slider` has `will-change: transform` (composites independent of the beam repaint), the active label's whiten is delayed `0.1s` so it changes as the slider arrives (no white-on-offwhite flash), and the focus ring is `:focus-visible` only (no mouse-click outline pop). No `backdrop-filter` on the pill — it re-blurred the moving bloom and stuttered. The two panels top-align (`align-content: start`) so headers don't jump between Stardust/Horizon. Panel body copy is `--font-lead-size`, left-aligned (was justified). Titles are solid (the **hollow/outline** treatment lives on the words "Stardust"/"Horizon" in the *intro* copy, not the panel titles).

---

### 5. Events Page (section `events`, static after comet)
**HTML:** `index.html:256–262` · **CSS:** `src/styles/events-footer.css` · **JS:** `src/sections/events.js` (`initEvents`)

`.events-page-wrapper` → `.partnership-section` only. A framing line (`.partnership-intro`, "Those who have hosted us, supported the work, and made the impact possible.") sits under the `.partnership-title`; the wrapper has extra top padding so the title isn't tight to the section edge.

**Partnership marquee:** `initEvents` builds a `.partnership-track`, fills it with the `PARTNERS` array from `data.js` (10 `{ name, src, url }` logos → each an `<a><img>` with `name` as alt/aria), and **duplicates the set once** for a seamless CSS marquee loop. Each `<a>` is a real `target="_blank"` link when the partner has a `url`, else a non-clickable wrapper (no href) — fill in the `url`s in `data.js` to make logos clickable. Seamless loop requires BOTH: `.partnership-track { width: max-content }` (so `translateX(-50%)` is 50% of the *content*, not the parent width — the bug that made it jump) AND per-item `margin-right` rather than container `gap` (so each item's trailing margin makes the seam align; `gap` is off by half a gap). Logos are capped via `max-width` + `object-fit: contain` so wide marks (Lukso/Peng) don't dominate. The `.events-page-wrapper` is **transparent** so the fixed unified starfield (now gated to `events` too) shows behind the strip; `.partnership-slideshow` lays a `rgba(0,0,0,0.5)` veil (stars still read) and fades its left/right edges with a horizontal `mask-image` linear-gradient so the strip eases in/out instead of a flat cut.

---

### Footer (Static at end of flow)
**HTML:** `index.html:264–276` · **CSS:** `src/styles/events-footer.css` (`.social-links`)

Static footer at the page end. 3 social icons (Telegram, Instagram, LinkedIn). cocoex text logo.

---

## CSS Design System

### Colors (`:root` — `src/styles/tokens.css`)
```css
--color-black: #000
--color-white: #fff
--color-offwhite: #FAFAFA   /* muse + comet section background */
--lunes: #5783A6
--ares: #D54D2E
--rabu: #8CB07F
--thunor: #F8D86A
--shukra: #5E47A1
--dosei: #7F49A2
--solis: #D48348
```

### Typography
```css
--font-canela: 'canela', Georgia, serif
--font-h1-size: clamp(24px, 3vw, 48px)    /* weight 700 */
--font-h2-size: clamp(14px, 1.5vw, 22px)  /* weight 400 — caption/subtitle */
--font-lead-size: clamp(18px, 1.7vw, 26px) /* weight 400 — LEAD paragraph tier, between H2 and body */
--font-body-size: clamp(20px, 2.5vw, 36px) /* weight 400 — statement */
```
All text sizes use `clamp()` — never hardcode px values for typography. The `--font-lead-size` tier exists for explanatory prose that read as fine-print at H2 (used by `.muse-intro-text-bottom`, `.comet-panel-body`, `.partnership-intro`, and the mission `.reveal-text` — moved here from `--font-body-size` once the mission copy became multi-sentence prose). Two deliberate one-off clamps that do NOT use the tokens: `.muse-popup-text` `clamp(18px,1.4vw,20px)` (dense popup column, capped at the cause size) and the intro tagline/statement.

### Responsive Logo Sizes
```css
--intro-logo-size: clamp(60px, 15vw, 250px)
--muse-logo-size: clamp(150px, 20vw, 300px)
--muse-orbit-image-size: clamp(80px, 12vw, 150px)
--comet-logo-size: clamp(180px, 25vw, 320px)
```

### Spacing
```css
--spacing-xs through --spacing-xl  /* all clamp()-based */
```

### Z-Index Layers (`src/styles/tokens.css`)
```css
--z-bg: 0
--z-intro: 10
--z-white-section: 30
--z-events: 40
--z-popup: 1000
```

### Breakpoints (layout-only — prefer clamp() over media queries)
- `≤1024px` Tablet: Touch optimization
- `≤768px` Mobile: Layout adjustments, vertical ellipse orbit
- `≤480px` Small: Fine-tuning

---

## JavaScript Architecture

**Pattern:** ES modules under `src/`, bundled by Vite. No IIFE, no global scope. `index.html` loads one entry, `/src/main.js`; everything else is reached by `import`. The module map lives under "Site Architecture" above.

**Boot order (`src/main.js` `boot()`):**
1. `applyHeightsToCss()` — inject section heights from the declarative timeline.
2. `initSmoothScroll()` — Lenis ↔ GSAP wiring.
3. Create 5 WebGL surfaces (`createIntroStarfield` for `#bg-canvas`; four `createStarfield` instances — unified white-on-black, muse inverted, comet inverted, and the muse-popup starfield) + the 2D `createMuseGalaxy('muse-popup-galaxy')`, `init()` each, then register every surface as a gated `Renderer` layer (the two popup surfaces gate on `active: () => MusePopup.isOpen`, the rest on section).
4. `initIntro` / `initMuse` / `initComet` / `initEvents` — each registers its own per-frame `Renderer` layers and GSAP timelines.
5. `initSectionGate()` — drives `Renderer.setSection` (NOT the intro overlay teardown; see gotcha).
6. `Renderer.start()` — the single RAF loop.
7. Debounced (150ms) `resize` → `applyHeightsToCss`, resize every surface, `intro/muse/comet.resize()`, `ScrollTrigger.refresh()`.

### Scroll pacing — declarative `PHASES` (`src/scroll/timeline.js`)
RHYTHM: 1 scroll = 100vh. Every fade-in is followed by a REAL hold so content never flashes past. **`timeline.js` is the single source of truth.**

`PHASES` is an ordered array of `{ id, section, vh }`. A builder turns it into absolute `{ startVh, endVh, durationVh }` per phase plus per-section spans. `phase(id)` returns a descriptor with px-offset getters (`startPx`/`endPx`/`startFromSection`/`endFromSection`) computed against the **live** viewport (read inside ScrollTrigger function-form `start`/`end` with `invalidateOnRefresh: true`). `sectionSpan(name)` and `vhToPx(vh)` are also exported.

`applyHeightsToCss()` writes each section's height to `:root` as a CSS custom property — `--intro-h`, `--muse-h`, `--comet-h`, plus `--total-h`. CSS reads `height: var(--intro-h)` etc. — heights are **injected, never hardcoded**. So changing ONE `vh` number in `PHASES` recascades both the CSS heights and the GSAP offsets — no hand-syncing.

Current `PHASES` (copy exact values from the file — this is a snapshot):
```javascript
// INTRO — section total 592vh
intro.orbit       192   // logo grows + dots orbit, 2 rotations (Beat 1 tagline fades in over the back half)
intro.explosion   100   // constellation explodes + settles (Beat 2 statement fades in during the burst)
intro.statement    40   // statement holds over the settled constellation, fades out before mission
intro.mission     100   // smoke clears + mission fade-in
intro.missionHold 160   // mission holds bright, then fades out

// MUSE — section total 490vh  (buildMuseTimeline converts these vh→px; see Common Bugs)
muse.fadein        50   // logo + copy fade in TOGETHER (pure opacity, matched to the mission fade-in)
muse.hold         120   // intro holds fully readable (~mission length)
muse.switch       100   // black→white + logo crossfade → orbit reveal
muse.orbitHold    220   // 100 structural exit tail + ~120 pinned hold of the revealed orbit

// COMET — section total 500vh (intro panel 200vh + tabs panel 300vh)
comet.introIn     100   // comet intro fades in
comet.introHold   100   // intro holds
comet.methodsIn   100   // methods/tabs fade in
comet.methodsHold 200   // methods toggle holds pinned (tabs panel = methodsIn 100 + this 200 = 300vh)

// plus: COMET_CONST_HIDE_VH = 40  // constellation hides on comet entry
```
The mission/smoke/fade transitions are derived inside `buildIntroTimelines` as fixed fractions of the `intro.mission` / `intro.missionHold` phases (so transition SPEED stays constant while the long hold lives in `missionHold`): smoke clears over the first 50% of `intro.mission`, mission fades in over the back 50%, holds bright through `missionHold`, then `.intro-content` fades out over its last 25%.

**Never hardcode vh values in animations or CSS heights** — reference `timeline.js` (`phase()`/`sectionSpan()`/CSS vars). The `.comet-panel-intro` (`200vh`) / `.comet-panel-tabs` (`300vh`) literal heights in `comet.css` are the one deliberate exception (intro = one 200vh phase pair; tabs = methodsIn 100 + methodsHold 200).

### Off-screen WebGL gating (`src/scroll/section-gate.js` + `src/webgl/renderer.js`)
`initSectionGate` creates a ScrollTrigger over `.scroll-container` that derives the active section (`'intro' | 'muse' | 'comet' | 'events'`) from scroll position using `timeline.js` section spans with a 75vh **lead buffer** (next-section starfields wake up 75vh early to avoid pop-in), then calls `Renderer.setSection`. `Renderer`'s single RAF loop renders ONLY the layers whose `sections` include the active one — off-screen WebGL never touches the GPU, and `MuseScroll.update()` (its own layer) is skipped outside `'muse'`. The loop also pauses entirely on `visibilitychange` when the tab is hidden.

**Gotcha — intro overlay teardown is decoupled from the gate.** Hiding the `.intro` overlay so its canvases can't bleed into muse is driven by its OWN ScrollTrigger inside `src/sections/intro.js`, keyed to the **TRUE (unbuffered) intro end** (`sectionSpan('intro').endVh`). It is deliberately NOT driven by the section gate: the gate's 75vh lead buffer would hide the overlay ~75vh early — erasing the mission statement that fades in / holds during the last 260vh of intro.

---

## Data Layer

Static content lives in `src/data.js` (imported, not fetched):

- **`PARTNERS`** — 10 partner logos as `{ name, src, url }` objects (`src` URL-encoded; `url` = each partner's site/Instagram — **all 10 now filled**, so every logo is a clickable `target="_blank"` link), consumed by `initEvents` for the marquee.
- **`MUSES`** — canonical muse name / cause / CSS-var color.
- **`CONFIG`, `DOT_COLORS`, `CONSTELLATION_REF`, `CONNECTIONS`** — intro layout params + constellation geometry.
- **Stardust / Horizon panels:** static HTML in `index.html`. `Toggle` only flips the active panel — no data-driven rendering.

When real data needs to drive these surfaces, prefer a thin `fetch('data/...json')` (or a JSON import) inside the relevant module rather than a global.

---

## WebGL System

All surfaces render inside the single `Renderer` RAF loop (`src/webgl/renderer.js`), gated by section (or, for the popup surfaces, by `MusePopup.isOpen`). There are **5 WebGL canvases** (4 share one shader via the `createStarfield()` factory, `src/webgl/starfield.js`; the intro has its own shader) plus **3 2D-canvas** surfaces.

| Canvas | ID | Source | Type | Active when |
|---|---|---|---|---|
| Intro starfield | `#bg-canvas` | `createIntroStarfield` (`src/webgl/intro-starfield.js`) | WebGL (own shader + scroll-driven muse-spectrum ripple) | `intro` |
| Constellation | `#constellation-canvas` | `src/sections/intro.js` (`drawExplosion`) | 2D | `intro` (cleared on exit) |
| Unified starfield | `#unified-starfield-canvas` | `createStarfield` (white-on-black, fixed full-screen) | WebGL | `intro`, `muse`, `comet`, `events` |
| Muse backdrop | `#muse-background-canvas` | `createStarfield(..., { invert: true })` | WebGL | `muse` |
| Comet backdrop | `#comet-collab-background-canvas` | `createStarfield(..., { invert: true })` | WebGL | `comet` |
| Process starline | `#process-link-canvas` | `ProcessLinks` (`src/ui/process-links.js`) | 2D | `comet` (intro panel) |
| Muse popup starfield | `#muse-popup-starfield` | `createStarfield` (reactive — tints to muse hue) | WebGL | `MusePopup.isOpen` |
| Muse popup galaxy | `#muse-popup-galaxy` | `createMuseGalaxy` (`src/ui/muse-galaxy.js`) | 2D | `MusePopup.isOpen` |

**Rules:**
- DPR capped at `Math.min(devicePixelRatio, 2)` — `gl-context.js` `DPR()` and the 2D canvases all respect it; never remove the cap.
- The starfield factory shader (`STARFIELD_FRAG`) takes `invert` + `intensity` uniforms — add new starfield surfaces by passing options, **not** by writing a new shader.
- `render(now)` receives the **shared RAF timestamp** from `Renderer` — never start a private `requestAnimationFrame`.
- Stay under 8 concurrent WebGL contexts (Safari cap). Currently 5 WebGL active (the 5th, `#muse-popup-starfield`, only renders while the popup is open, but the context exists from boot).
- WebGL context loss: `intro-starfield.js` registers `webglcontextlost`/`webglcontextrestored` handlers and rebuilds the program on restore — replicate on any new context.

---

## Accessibility

- Keyboard: Tab through muses (each `.muse-orbit-item` gets `tabindex="0"` + `role="button"` in `MuseScroll.attachHandlers`), Enter/Space opens popup, Escape closes.
- The Muse popup (`#muse-popup`) has `role="dialog" aria-modal="true"`, `aria-labelledby="muse-popup-title"` (the muse name), and a focus-trap over the whole popup (shared `createFocusTrap` / `wireModalDismiss` in `src/ui/focus-trap.js`) so the prev/next/close buttons stay reachable. Focus is restored to the previously-focused element on close. Prev/next arrows + ←/→ keys + swipe navigate; reduced-motion swaps without the flip.
- The popup controls (`.muse-popup-nav` — prev/next and the top-right `.muse-popup-close`) are `clamp(44px, 8vw, 56px)` ≥ WCAG mobile minimum, with `aria-label`s.
- Mobile orbit tap surface expanded via `.muse-orbit-item::before { inset: -16px }` halo (preserves the transform-based centring).
- Orbit auto-rotation pauses for 2s on `touchstart` inside the muse section so mobile users have a stable target.
- Muse orbit names live on the flip card's back face (`.muse-orbit-name`) in white with a dark text-shadow for AA contrast on the colored discs (esp. the light hues Thunor `#F8D86A` / Rabu `#8CB07F`). The hover/focus flip is gated to hover-capable pointers (`@media (hover: hover)`), so touch users reach the name via the popup, and the orbit-freeze listeners are likewise hover-only (a tap can't strand the orbit frozen).
- `prefers-reduced-motion`: disables CSS animations/transitions; the popup skips the 3D tilt and the card flip (instant crossfade), and the galaxy renders a static scatter (no rotation/inward drift). WebGL canvases continue rendering (visual ambience, not vestibular motion).
- Touch targets: 44px minimum for interactive controls (muse orbit, popup nav). **Exception:** the footer social icons were deliberately shrunk below 44px on mobile as part of the ~20% footer reduction (explicit product decision — the only sub-44px tap targets).
- Focus indicators: 2px outline + 2px offset.

---

## Asset Map

Assets live in `public/assets/images/`. Vite serves `public/` at the site root, so HTML/JS reference them as `assets/images/...` (no `public/` prefix).

```
public/assets/images/
├── logowhite.png / logoblack.png
├── cocoex-text.png / cocoex-text-black.png
├── muse/
│   ├── muse_logo_black.png
│   ├── lunes.png · ares.png · rabu.png · thunor.png · shukra.png · dosei.png · solis.png   (colored ring+glyph — UNUSED; orbit now uses the white variants on a colored disc)
│   └── lunes-white.png · ares-white.png · … · solis-white.png                               (white — orbit flip-card front + popup symbol)
├── comet-collabs/
│   ├── comet-collabs-logo.png · comet-collabs-logo-white.png
│   └── process-one.png … process-five.png
└── partnerships/
    └── C.Volpi.png · CdTortona.png · Lukso.png · Peng.png · RJB.png · SFT.png · SIRX.png · TN.png · "Vinili e vinelli.png" · WR.png   (10 named logos)
```

`src/data.js` `PARTNERS` lists these 10 by `{ name, src, url }` (src URL-encoded for the file with a space; `url` optional → clickable link); `initEvents` renders them into the marquee with `name` as alt/aria text.

---

## DOM → Module Quick Reference

Element IDs/selectors are stable; the module that owns each is listed (grep `index.html` to confirm markup). CSS for each lives in the obvious `src/styles/*.css` per section.

| Element | Selector | Owning module |
|---|---|---|
| Scroll container | `.scroll-container` | — (gated by `section-gate.js`) |
| Intro spacer | `.intro-spacer` (`height: var(--intro-h)`) | `timeline.js` injects height |
| Intro starfield | `#bg-canvas` | `intro-starfield.js` |
| Orbit dots / logo / merged dot | `#dot-white` `#dot-black` `#intro-logo` `#final-dot` | `sections/intro.js` |
| Transition beats | `#intro-tagline` (Beat 1) / `#intro-statement` (Beat 2) | `sections/intro.js` |
| Constellation canvas | `#constellation-canvas` | `sections/intro.js` (2D) |
| Mission overlay | `#mission-overlay` / `.reveal-text` (top + bottom, centered) | `sections/intro.js` |
| Unified starfield | `#unified-starfield-canvas` | `starfield.js` (white-on-black) |
| Muse panel | `.muse-panel` (`height: var(--muse-h)`) / `.muse-stage` | `sections/muse.js` |
| Muse backdrop | `#muse-background-canvas` | `starfield.js` (inverted) |
| Muse orbit items | `.muse-orbit-item` (×7) → `.muse-orbit-card`/`-card-shell`/`-face`(`--front`/`--back`)/`-disc`/`-name`; hidden `.muse-text` data source | `sections/muse.js` (`MuseScroll`) |
| Muse shared logo | `.muse-shared-logo` (`#muse-logo-white` / `#muse-logo-black`) | `sections/muse.js` |
| Muse intro copy | `.muse-intro-copy` | `sections/muse.js` |
| Muse popup | `#muse-popup` (title `#muse-popup-title` / cause `#muse-popup-cause` / text `#muse-popup-text` / disc `.muse-card-shell`+`.muse-card-inside` / symbol `#muse-popup-img`) | `ui/muse-popup.js` + `ui/focus-trap.js` |
| Muse popup nav / close | `#muse-popup-prev` / `#muse-popup-next` / `#muse-popup-close` (`.muse-popup-nav`) | `ui/muse-popup.js` |
| Muse popup starfield / galaxy | `#muse-popup-starfield` (WebGL) / `#muse-popup-galaxy` (2D) | `webgl/starfield.js` / `ui/muse-galaxy.js` |
| Comet intro panel | `.comet-panel-intro` / `#comet-collab-intro` (literal 200vh) | `sections/comet.js` |
| Floating processes | `.floating-processes` (×5 `.floating-process`) | `ui/floating-processes.js` |
| Process starline | `#process-link-canvas` | `ui/process-links.js` (2D) |
| Comet backdrop | `#comet-collab-background-canvas` | `starfield.js` (inverted) |
| Comet tabs panel | `.comet-panel-tabs` / `.comet-pill` (literal 300vh) | `sections/comet.js` (`Toggle`) |
| Pill tabs | `#tab-stardust` / `#tab-horizon` / `#pillSlider` | `sections/comet.js` (`Toggle`) |
| Stardust / Horizon panels | `#panel-stardust` / `#panel-horizon` | `sections/comet.js` |
| Events page | `#events-page` / `#partnership-slideshow` | `sections/events.js` |
| Footer | `.social-links` / `.footer-logo` | static (`events-footer.css`) |

---

## Common Bugs & Rules

**Canvas flickering:** never apply both manual rotation and CSS `transform` on the same canvas. Store unrotated positions; let CSS rotate.

**Scroll reads 0:** use `window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0`.

**iOS scroll (Lenis):** Lenis 1.3.4 virtualizes scroll position and is wired to GSAP in `src/scroll/smooth-scroll.js`. Body is the scroll container (`overflow-y: auto; height: 100%`), so Lenis is initialised with `wrapper: document.body, content: '.scroll-container'`, rides `gsap.ticker` (`autoRaf: false`), gets a `scrollerProxy` over body, and `ScrollTrigger.defaults({ scroller: document.body })`. `normalizeScroll` is intentionally NOT enabled — **do not re-enable it**; Lenis replaces its purpose and the two together deadlock on iOS Safari. Removing `html, body { height: 100% }` or `body { overflow-y: auto }` (in `base.css`) breaks layout — leave them.

**Intro overlay teardown vs. section gate:** the intro overlay must be hidden at the **unbuffered** intro end (`sectionSpan('intro').endVh`), driven by its own ScrollTrigger in `sections/intro.js` — NOT by the section gate. The gate's 75vh lead buffer would hide the overlay ~75vh early and erase the mission statement before it reveals. Keep these two decoupled.

**CSS not applying:** debug with `window.getComputedStyle(element).propertyName`. Use `!important` only to resolve specificity — document why.

**Animations too fast:** increase the relevant phase `vh` in `timeline.js` `PHASES`. Minimum 100vh per scroll-driven phase for 60fps smoothness.

**WebGL performance:** one shared `Renderer` RAF loop; off-screen layers are gated out by section. DPR cap at 2× is non-negotiable. Use the starfield factory rather than new shaders.

**Process starline jank:** `ProcessLinks.draw(now)` must NOT set `ctx.shadowBlur` per frame (the original's worst cost) — the glow is faked with wide translucent gradient strokes. It now redraws EVERY frame (the running comet is animated, so the old epsilon redraw-skip was removed) — that's fine because the draw is just a few cheap strokes; the ONLY hard rule is no `shadowBlur`.

**ScrollTrigger reads `vh` as `px`:** a `start`/`end` offset string like `top+=340vh top` is parsed by GSAP as **340 pixels** — the `vh` unit is stripped. So scroll triggers MUST convert vh→px first (`top+=${vhToPx(x)}px top` / `top+=${phase(id).endFromSection()}px top`) in **function-form** start/end with `invalidateOnRefresh: true`. `intro.js` always did this; `muse.js` did NOT (used raw `vh` strings) and the whole muse timeline collapsed into ~460px until fixed (2026-06-12). **`comet.js` still uses raw `vh` strings (lines ~60/70/77/88) — latent same bug, left intentionally.** Editing `PHASES` appearing to "do nothing" is the classic symptom.

**Muse zIndex churn:** `MuseScroll.update` only writes `el.style.zIndex` when its rounded depth value changes — writing every frame forces stacking-context recalcs (a measured jank source). Keep the `lastZ` guard.

**Canvas touch blocking:** never rely on inherited `pointer-events: none` for canvas elements on iOS/Android — set it explicitly on the canvas.

**Floating processes are non-interactive (by design):** the 5 `.floating-process` images are placed once and bob via CSS only — `pointer-events: none`, no `draggable`, no drag listeners. Drag was deliberately removed (it conflicted with mobile scroll and the fixed layout reads better). Do NOT re-add drag/`touchmove` handlers.

**Never:** add frameworks, pollute global scope, duplicate `timeline.js` vh values anywhere, use `scroll-behavior: smooth` on `html {}` (breaks GSAP), use `overflow-y: scroll` on both `html` and `body`.

---

## Dev Workflow

```bash
npm install        # first time
npm run dev        # Vite dev server, http://localhost:5173 (auto-opens)
npm run build      # production bundle → dist/
npm run preview    # serve the built dist/ locally
```

Pre-push checklist:
- [ ] Cross-browser: Chrome, Firefox, Safari, Edge
- [ ] Mobile: iOS Safari, Android Chrome
- [ ] `prefers-reduced-motion` verified
- [ ] Keyboard navigation intact
- [ ] Lighthouse 95+ (all categories)
- [ ] Run `/doc-minder` to update documentation

---

## Related Docs

### Architecture Docs (`docs/`)

| File | Purpose |
|---|---|
| `docs/technical-spec.md` | Why: scroll budget rationale, single-RAF master loop, factory shader, Lenis integration, DPR cap |
| `docs/responsive-design.md` | Why: clamp-first strategy, adaptive orbit ellipse, mobile touch + scroll coexistence |
| `docs/libraries.md` | GSAP + Lenis, Typekit kit ID, project-specific WebGL patterns |

For *what* the code does, read `index.html`, the ES modules under `src/`, and the stylesheets under `src/styles/*.css` directly. Those files are the reference.

### Brand & Concept (`.claude/memo/`)

| File | Purpose |
|------|---------|
| `.claude/memo/The Seven Muses.md` | Muse canon (planet, day, cause, color) |
| `.claude/memo/Stardust.md` | Stardust programme concept |
| `.claude/memo/Horizon.md` | Horizon + Future Lab methodology |
| `.claude/memo/cocoex Brand Rules.md` | Tone, typography, visual identity |

### Dev Tools

| File | Purpose |
|------|---------|
| `tools/coordinate-picker.html` | Interactive dev tool for constellation dot positioning |
