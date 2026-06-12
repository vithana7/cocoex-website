# Technical Specification — Architecture Decisions

Why the codebase is structured this way. For exact behaviour at each scroll position, read the modules under `src/` and the section copy in `index.html`. This doc explains the *why*.

The site is a Vite + ES-module build: vanilla JS organised into small modules, GSAP and Lenis as npm dependencies (not CDN), no framework. `index.html` loads a single entry (`/src/main.js`); everything else is reached by `import`.

---

## Scroll Budget

Total page height ≈ **1482vh** (intro 592 + muse 490 + comet 400, plus the static events page + footer). All scroll-driven distances live in `src/scroll/timeline.js`. Never hardcode `vh` values inline.

| Section | Span | Position | Phases (`timeline.js`) |
|---|---|---|---|
| Landing + Mission | 592vh | Fixed overlay | `intro.orbit` 192 + `intro.explosion` 100 + `intro.statement` 40 + `intro.mission` 100 + `intro.missionHold` 160 |
| Muse (intro → orbit) | 490vh | Sticky `.muse-stage`, one overlapping panel | `muse.fadein` 50 + `muse.hold` 120 + `muse.switch` 100 + `muse.orbitHold` 220 |
| Comet Intro | 200vh | Sticky `.comet-panel-intro` | `comet.introIn` 100 + `comet.introHold` 100 |
| Comet Methods | 200vh | Sticky `.comet-panel-tabs` | `comet.methodsIn` 100 + `comet.methodsHold` 100 |
| Events + Footer | static | Normal flow | — |

Muse intro and orbit are **one overlapping sticky panel** (the center logo stays put while the background flips black→white). Comet is **two sequential sticky panels** that never co-exist on screen — the old connected-images panel and its z-index race are gone.

### Why these values?

- **592vh intro:** five phases need room. Orbit (the "compounds co-exist" tagline fades in over its back half), a front-loaded constellation explosion (the "Unleashing…" statement fades in DURING the outward burst), a dedicated `intro.statement` hold over the settled constellation, then a smoke-clear, a mission fade-in, and a long readable hold before the joint fade-out into muse. The two copy beats are driven on sub-ranges in `intro.js`, not as their own phases. The hold was lengthened (`missionHold` 160) so the mission statement reads comfortably.
- **490vh muse:** fade-in 50 + readable hold 120 + black→white switch 100 + orbit hold/exit 220. The intro reveal is **deliberately matched to the cocoex mission** (~50vh fade-in + ~120vh readable hold); the logo + intro copy fade in **together, pure opacity** (no slide, no stagger — mirrors the mission's flow). `muse.orbitHold` (220) = a **100vh structural exit tail + ~120vh pinned hold**: the switch completes while the sticky stage is still pinned, the orbit then sits revealed for ~120vh (a beat to read/click the muses), then scrolls its own height up into comet over the final 100vh (a 100dvh sticky stage must scroll its full height to leave; pinned dwell = `orbitHold − 100`). **NB:** these vh are converted to **px** in `buildMuseTimeline` — ScrollTrigger reads a raw `top+=Xvh` string as pixels, so an un-converted `vh` collapses the timeline (the bug that was fixed here; `comet.js` still has it latent).
- **200vh per comet panel:** intro = fade-in 100 + hold 100; tabs = methods fade 100 + dwell 100.

**Rule of thumb:** any phase under 100vh stutters on trackpads. Any phase over 200vh feels slack — Lenis's lerp amplifies that.

---

## `timeline.js` is the Single Source of Truth

All scroll pacing is declared **once** in `src/scroll/timeline.js`. The model:

```javascript
export const PHASES = [
  { id: 'intro.orbit', section: 'intro', vh: 192 },
  // ...
];
```

A builder (`buildTimeline`) turns the ordered list into absolute `{ startVh, endVh, durationVh }` per phase plus per-section spans. Three consumers read it:

1. **GSAP** — `phase(id)` returns a descriptor with px-offset getters (`startPx`/`endPx`/`startFromSection`/`endFromSection`) computed against the **live** `window.innerHeight`. ScrollTriggers read these inside function-form `start`/`end` with `invalidateOnRefresh: true`, so resizing recomputes offsets correctly.
2. **CSS** — `applyHeightsToCss()` writes each section's height to `:root` as a custom property: `--intro-h`, `--muse-h`, `--comet-h`, `--total-h`. CSS reads `height: var(--intro-h)` etc. — heights are injected, never hardcoded.
3. **Section gate** — `sectionSpan(name)` and `vhToPx()` derive section boundaries.

**Why declarative:** in the old monolith, phase boundaries were coupled constants that had to be hand-synced against CSS wrapper heights and GSAP scroll offsets — drift was constant. Now changing ONE `vh` number in `PHASES` recascades both the CSS heights and every GSAP offset. There is nothing to keep in sync. **One gotcha:** GSAP start/end strings take **pixels**, not `vh` (`top+=NNNvh` is silently read as `NNN` px), so triggers must feed **`top+=${vhToPx(...)}px top`** (or `phase().*FromSection()`, which return px) inside **function-form** start/end with `invalidateOnRefresh: true`. A trigger that interpolates a raw `vh` number collapses its whole timeline into a few hundred px — the bug fixed in `muse.js` (2026-06-12); `comet.js` still carries it latently.

The one deliberate exception: `.comet-panel-intro` / `.comet-panel-tabs` use literal `200vh` in `comet.css`, because each panel is exactly one 200vh phase pair and CSS `position: sticky` needs a concrete child height.

The mission/smoke/fade transitions are derived inside `buildIntroTimelines` as fixed fractions of the `intro.mission` / `intro.missionHold` phases — so the transition *speed* stays constant while the long hold lives entirely in `missionHold`.

---

## Single Gated `Renderer` RAF Loop

Every animated surface registers a **layer** with the `Renderer` singleton (`src/webgl/renderer.js`), tagged with the section(s) it belongs to:

```javascript
Renderer.add({ sections: ['muse'], render: (now) => surface.render(now) });
```

The loop is one `requestAnimationFrame` for the whole page. Each tick renders **only** the layers whose section is currently active (set by the section gate). Off-screen WebGL never touches the GPU. The loop also pauses entirely on `visibilitychange` when the tab is hidden.

**Why one loop:**
1. Browsers throttle every additional RAF independently — multiple loops compound jitter.
2. Section gating means a starfield outside its section costs nothing — no per-block `if (currentSection === …)` guards scattered through a monolithic render function.
3. `render(now)` receives the **shared RAF timestamp**, so every surface advances on the same clock. (The old monolith passed `performance.now()` per call site, which could drift.)
4. The muse orbit update (`MuseScroll.update`) is itself a gated layer — same frame budget, skipped outside `'muse'`.

---

## WebGL Architecture: One Shader Factory

Four of the five WebGL surfaces are produced by `createStarfield(canvasId, options)` (`src/webgl/starfield.js`) — one shader (`STARFIELD_FRAG`), parameterised:

- `invert: true` — fragment output becomes `1.0 - color`, turning the canonical white-on-black starfield into black-on-offwhite. Used for the muse and comet backdrops (light surface).
- `intensity` — multiplies star brightness; inverted variants use `0.9` to read against off-white; the popup starfield is recolored/pulsed at runtime by `MusePopup` (tints `starColor` to the muse hue + an intensity pulse on open/switch).

Instances (created in `src/main.js`): the unified white-on-black starfield (`#unified-starfield-canvas`, fixed full-screen, gated to `intro` + muse + comet + the transparent events section — the `intro` membership keeps it drawn BEHIND the intro overlay so the mission has stars the instant the `#bg-canvas` smoke-clears, instead of pure black on first load), the muse backdrop (`#muse-background-canvas`, inverted), the comet backdrop (`#comet-collab-background-canvas`, inverted), and the **muse popup starfield** (`#muse-popup-starfield`, reactive). The popup also has a 2D spiral-galaxy particle layer (`src/ui/muse-galaxy.js`); both popup surfaces register as gated layers with `active: () => MusePopup.isOpen` rather than a section tag.

**Why a factory:** the previous architecture had separate gradient shaders that drifted out of sync, duplicated GLSL, and triggered extra `gl.useProgram()` switches. One shader with two parameters removed the duplication and makes adding a surface trivial — pass options, don't write a shader. Shared GLSL (`SIMPLEX_NOISE`, `STAR_FIELD`, `VERTEX_QUAD`) lives in `src/webgl/shaders/glsl-utils.js`.

### Intro shader is separate

`#bg-canvas` (`src/webgl/intro-starfield.js`, shader `INTRO_FRAG`) uses its own program because it has unique needs: a cosmic-noise background (simplex, not a star grid) and a `u_pulse` uniform driving a **muse-spectrum ripple** at the explosion — concentric ease-out wavefront rings (`museTint` across the 7 hues, snoise wobble) that decelerate as they expand to the screen edges. `u_pulse` is fed the **explosion scroll progress** (`setPulse`, `pulse = min(1, progress/0.45)`) so the ripple rides the burst rather than running on a clock. Folding this into the factory would make every starfield pay for a uniform it never uses. It also owns its `webglcontextlost`/`webglcontextrestored` handlers and rebuilds on restore.

### Constellation + starline are 2D

`#constellation-canvas` (intro explosion) and `#process-link-canvas` (comet starline) use the 2D Canvas API, not WebGL — z-depth sorting, gradient connection lines, and trails are easier there and don't need shader-level performance. Keeping them off WebGL also keeps the live context count at 4, well under Safari's ~8 cap.

---

## DPR Cap

```javascript
export const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
```

`src/webgl/gl-context.js` caps device-pixel-ratio at 2× for every WebGL canvas; the 2D canvases (`process-links.js`, `intro.js`) apply the same cap. Modern phones report `devicePixelRatio` 3 — a full-screen shader at 3× is 9× the pixels of 1×; capping at 2× cuts that to 4×, a ~33% fill reduction with negligible visual difference for animated noise/star content.

The cap is **non-negotiable on mobile** — removing it has caused 30→15fps regressions on iPhones.

---

## Lenis-driven Scroll (replaces `normalizeScroll`)

`src/scroll/smooth-scroll.js`:

```javascript
const lenis = new Lenis({
  wrapper: document.body,
  content: document.querySelector('.scroll-container'),
  autoRaf: false,
  lerp: 0.1,
});
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
ScrollTrigger.scrollerProxy(document.body, { /* scrollTop + getBoundingClientRect */ });
ScrollTrigger.defaults({ scroller: document.body });
```

Production iOS Safari froze scroll on the body-as-scroller layout; `ScrollTrigger.normalizeScroll(true)` deadlocks with non-passive touch listeners there. Lenis 1.3.4 virtualizes scroll position, sidestepping the iOS quirk while smoothing every platform.

**Why this exact wiring:**
- `wrapper: document.body, content: '.scroll-container'` — the app body-scrolls (`html, body { height: 100% }; body { overflow-y: auto }` in `base.css`), so Lenis is told explicitly. Removing those CSS rules breaks layout.
- `autoRaf: false` + `gsap.ticker.add(t => lenis.raf(t * 1000))` — single RAF source. Two RAFs double-tick ScrollTrigger and corrupt scrub progress.
- `lenis.on('scroll', ScrollTrigger.update)` — every Lenis tick refreshes ST positions, or pinned/scrubbed sections drift.
- `scrollerProxy` + `ScrollTrigger.defaults({ scroller: document.body })` — every trigger is implicitly tied to body; new triggers need no per-instance scroller.

`normalizeScroll` is intentionally NOT enabled. **Never re-enable it alongside Lenis.**

---

## Section Gating & the Intro Teardown Gotcha

`src/scroll/section-gate.js` creates a ScrollTrigger over `.scroll-container` that derives the active section (`intro`/`muse`/`comet`/`events`) from scroll position using `timeline.js` section spans, with a 75vh **lead buffer** so the next section's starfields wake up early and avoid pop-in. It pushes the result to `Renderer.setSection`.

**Gotcha — the intro overlay teardown is decoupled from the gate.** Hiding the `.intro` overlay (so its canvases can't bleed into muse) is driven by its OWN ScrollTrigger inside `src/sections/intro.js`, keyed to the **TRUE, unbuffered** intro end (`sectionSpan('intro').endVh`). It must NOT use the gate: the gate's 75vh lead buffer would hide the overlay ~75vh early — erasing the mission statement that fades in and holds through the last 260vh of intro. This separation is intentional; keep them apart.

---

## Jank Fixes Carried Into the Rebuild

These were the per-frame costs that motivated the rebuild. Do not reintroduce them.

- **Per-frame `shadowBlur` (process starline).** The old draw set `ctx.shadowBlur = 12` on every frame across two blurred stroke passes — the single worst cost in the comet section. `process-links.js` fakes the glow with cheap wide translucent gradient strokes (no blur). It now redraws every frame to animate the running muse-spectrum comet (the old epsilon redraw-skip was dropped) — fine, since the draw is a handful of plain strokes; the only hard rule is no `shadowBlur`.
- **zIndex churn (muse orbit).** The old orbit wrote `el.style.zIndex` every frame, forcing stacking-context recalcs. `muse.js` keeps a `lastZ` per item and writes only when the rounded value changes. `data-angle` is also parsed once on init rather than per frame.
- **Multiple RAF loops / drifting clocks.** Collapsed to the single `Renderer` loop with a shared timestamp.
- **Off-screen WebGL.** Now gated by section membership rather than scattered conditionals.

---

## Common Pitfalls

**Canvas rotation flicker.** Never apply both manual rotation (in canvas draw) and CSS `transform` rotation on the same canvas. Store unrotated positions; let CSS rotate.

**Scroll position reads as 0.** Use `window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0`.

**`scroll-behavior: smooth` on `html`.** Conflicts with GSAP scroll control — forbidden.

**`overflow-y: scroll` on both `html` and `body`.** Doubled scrollbar; one stops responding to GSAP. Set on one only.

**Floating processes are non-interactive.** The comet `.floating-process` images are placed once and bob via CSS only — `pointer-events: none`, no drag. Drag was removed (it conflicted with mobile scroll). Do not re-add `touchmove`/drag handlers.

**WebGL context limit.** Browsers cap concurrent WebGL contexts (~8–16). Five are active (the 5th, `#muse-popup-starfield`, only renders while the popup is open but its context exists from boot) — stay under eight. Reuse the starfield factory.

**WebGL context loss.** Mobile browsers can drop contexts at any time. `intro-starfield.js` registers `webglcontextlost`/`webglcontextrestored` and rebuilds the program on restore. Replicate this on any new context.

---

## Performance Targets

| Metric | Target |
|---|---|
| FCP | < 1.5s on 4G |
| LCP | < 2.5s on 4G |
| CLS | < 0.1 |
| Lighthouse | 95+ all categories |
| Desktop scroll | 60fps |
| Mobile WebGL | ≥ 30fps (DPR capped at 2×) |
| Resize debounce | 150ms |

---

## Cross-Browser & Responsive Verification

Before a release, scroll through the entire page on:

- Chrome / Firefox / Safari / Edge desktop (latest).
- iOS Safari (current iPhone): popup interactions, portrait constellation runs tall, no scroll freeze.
- Android Chrome: Lenis-driven scroll smooth, DPR cap visible (no overheating).
- 320px / 375px / 768px / 1024px / 1440px / 1920px viewports.
- `prefers-reduced-motion`: CSS animations disabled; popup tilt + card flip skipped (crossfade), galaxy field static.
- Keyboard navigation: Tab through muses, Enter opens popup, ←/→ switch muses, Escape closes.
- All external links open in a new tab with `rel="noopener noreferrer"`.
