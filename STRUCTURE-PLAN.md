# Repository Structure Plan

## Executive summary

- **Recommendation: stay monolithic.** Three flat files (HTML 466, CSS 2,228, JS 2,348) with disciplined section banners is the right shape for a vanilla, no-build, single-page art site of this size. Splitting buys little and costs real complexity.
- The `js/main.js` IIFE has clean internal module boundaries, but its modules share enough state (`elements`, `CONFIG`, `SCROLL_TIMING`, `GLSL_UTILS`, `MethodToggle.getCurrentMethod()`, `STEP_DATA`) that cutting the file imposes either ES-module rewrites or fragile multi-IIFE load-order coupling. Neither is worth it at this size.
- There is meaningful **dead weight to remove first**: `js/main.js.backup` (90 KB), `css/styles.css.backup` (37 KB), `MotionPathPlugin` (registered but unused per `docs/libraries.md`), and a documentation/code mismatch around `data/events.json` (CLAUDE.md and TECHNICAL-SPEC reference it; the file does not exist — content is hardcoded inside `PartnershipSlider.logos`, `STEP_DATA`, etc.).
- One genuinely defensible split exists if the project grows: extract `STEP_DATA` + the partnership/stardust/horizon content arrays into a single `data/content.js` (a `window.COCOEX_DATA = {...}` blob, no fetch, no module). That removes ~150–250 LOC of pure copy from `main.js` without touching the animation engine. **Defer until that data actually lives outside the codebase or grows past ~30 entries.**
- Estimated effort to implement everything in this plan (cleanup + doc reconcile): under one hour. Estimated effort to do a full ES-module split: a day plus regression risk on iOS scroll behaviour. Don't do it.

---

## Current state

### Measured sizes (verified)

| File | LOC | Bytes | Note |
|---|---:|---:|---|
| `index.html` | 466 | 26 KB | Single page, semantic, section comments |
| `css/styles.css` | 2,228 | 50 KB | One file, 33 banner sections |
| `js/main.js` | 2,348 | 86 KB | One IIFE, ~30 banner sections |
| `js/main.js.backup` | — | 90 KB | **Stale; should be deleted (git is the backup)** |
| `css/styles.css.backup` | — | 37 KB | **Stale; should be deleted** |
| `data/events.json` | — | — | **Does not exist.** CLAUDE.md and `docs/technical-spec.md` references are stale. |

### CSS section map (largest first)

| Section | Range | LOC |
|---|---|---:|
| Comet Collab Methods Toggle | 503–923 | **420** |
| Muse Popup + Muse Section | 1113–1618 | **505** |
| Events Page (partnership / stardust / horizon) | 1854–2197 | **343** |
| Responsive (tablet / mobile / small) | 1619–1809 | 190 |
| Comet Connected / Step Popup / Social | 924–1112 | 188 |
| Globals (vars, reset, scrollbar) | 1–147 | 147 |
| Intro / dots / transition / canvases | 155–353 | 198 |
| White Section + Comet Intro | 400–502 | 102 |
| Utilities / Print / Events Responsive | 1810–end | ~95 |

No section is alarming on its own. The two ~500-LOC sections (Methods Toggle, Muse Popup) are dense but cohesive.

### JS module map (verified line numbers)

| Range | Module | Touches |
|---|---|---|
| 13–19 | GSAP setup, iOS-guarded `normalizeScroll` | `gsap`, `ScrollTrigger` |
| 24–91 | `GLSL_UTILS` (shared SIMPLEX_NOISE + STAR_FIELD) | consumed by all WebGL |
| 96–124 | `SCROLL_TIMING` constants | consumed everywhere |
| 129–246 | `CONFIG` + `CONNECTIONS` (constellation coords, dot colors) | intro + constellation |
| 249–267 | DOM `elements` cache | consumed everywhere |
| 270–282 | State variables | shared mutable |
| 285–349 | `log`, `isMobile`, `isTablet`, `getResponsiveValue`, easings, `debounce` | helpers |
| 400–540 | `initWebGL` + `createShader` (intro shader) | uses `GLSL_UTILS` |
| 545–566 | `resize()` | DOM, all canvases |
| 571–603 | `initFireworkDots()` | constellation |
| 608–650 | `updateConstellationExplosion(progress)` | constellation |
| 655–672 | `updatePositions(scrollTrigger)` | dots |
| 677–820 | `updateFireworkDots()` | constellation render |
| 827–932 | `masterRender()` — single RAF for ALL canvases | depends on every WebGL module |
| 937–987 | `initEventListeners()` | DOM, popups, modules |
| 992–1252 | `initGSAPAnimations()` | every section, `SCROLL_TIMING`, `MuseScroll`, `CometConnections` |
| 1256–1316 | `updateOrbitPositions(orbitState)` | shared with `MuseScroll` |
| 1323–1431 | `createStarfield(canvasId, options)` factory | uses `GLSL_UTILS` |
| 1434, 1437, 1443–1444 | Starfield instances (Unified, Muse, Comet ×2) | rendered in `masterRender` |
| 1449–1650 | `MusePopup` | DOM, particles, easings |
| 1655–1790 | `MuseScroll` | `updateOrbitPositions`, `MusePopup`, `SCROLL_TIMING` |
| 1795–1924 | `CometConnections` | canvas 2D, `MethodToggle` |
| 1929–2037 | `FloatingProcesses` (drag + touch) | DOM only |
| 2042–2048 | `MethodToggle` | DOM, called by `window.switchTab` |
| 2053–2092 | `PartnershipSlider` (logos hardcoded inline) | DOM |
| 2097–2204 | `StepPopup` | DOM, `MethodToggle.getCurrentMethod()`, `STEP_DATA` |
| 2209–2258 | `setInitialState()` | every module |
| 2263–2306 | `init()` orchestration | calls every module's init |
| 2312– | `window.switchTab` global (called by inline `onclick`) | exposed for HTML |

**Coupling assessment.** Modules look standalone but share four anchor points: the `elements` cache, `SCROLL_TIMING`, `GLSL_UTILS`, and the single `masterRender()` RAF loop. `masterRender()` in particular hardcodes the active canvas list. Splitting modules into separate files means either (a) re-exposing all four to global scope, (b) wiring an explicit registry pattern, or (c) ES-module imports. Each adds machinery for no behavioural gain.

---

## Recommendation

**Stay monolithic.** Single HTML, single CSS, single JS.

Justification:

1. **No build step is a hard project constraint** (CLAUDE.md). The two ways to split JS without one — multiple `<script>` tags or `<script type="module">` — both cost more than they buy here.
   - Multiple plain scripts: every module becomes its own IIFE attaching to `window.COCOEX = {...}`. Load order matters. The `masterRender()` RAF loop has to discover canvases at runtime instead of referencing module instances directly. This *is* doable but you trade one well-organised file for ~10 mutually-dependent ones plus a registry shim.
   - ES modules: clean syntax, but `<script type="module">` is fetched per-module over HTTP. With ~10 modules each importing `GLSL_UTILS` / `SCROLL_TIMING` / `elements`, you get a waterfall. More importantly, ES modules are deferred; the iOS-guarded `normalizeScroll` block at line 15 must run before anything paints, and order-of-execution differences with `defer` semantics have caused production scroll freezes on this codebase before (per `docs/libraries.md` § iOS-guarded normalizeScroll). Not worth the regression risk.

2. **Cohesion is real.** The "modules" share state by design — orbit math feeds `masterRender`, popup state interacts with `MuseScroll`, `CometConnections` reads `MethodToggle`. They are not independently reusable; they are sections of the same animation engine that happen to be commented as modules for grep-ability. Splitting them implies they could live in another project. They cannot.

3. **File sizes are within senior-engineer cognitive load** for a vanilla site. 2,228 LOC of CSS and 2,348 LOC of JS, both with disciplined banner comments that match the section structure of the page, is well under the threshold where files become unnavigable. By contrast, the rule-of-thumb numbers in the prompt (~500 CSS, ~800 JS) are framework-app heuristics; they don't apply to a single-page WebGL/scroll showcase where one file = one experience.

4. **Onboarding is easier monolithic.** A new contributor opens three files. Search-and-jump works without an editor index. The `CLAUDE.md` DOM Quick Reference table maps element → CSS line → JS line, which is only useful while there's one of each.

5. **Splitting now is premature.** None of the modules are being lifted into another project. None have an independent change cadence — every meaningful PR touches multiple sections. There is no failing test, no perf regression, no merge-conflict pain that splitting would resolve.

---

## If splitting (proposed structure)

Captured in case the constraints change (e.g., an admin UI is added; a team grows; campaigns become CMS-driven). **This is contingent — do not implement now.**

Minimal, low-coupling split (two new files, not ten):

| Path | LOC | Contents |
|---|---:|---|
| `js/main.js` | ~2,100 | Everything except the data block below |
| `js/data.js` | ~150–250 | `STEP_DATA`, `PartnershipSlider.logos`, `STARDUST_CAMPAIGNS`, `HORIZON_LABS`, exposed as `window.COCOEX_DATA = {...}` |
| `css/styles.css` | ~2,228 | Unchanged. CSS does not benefit from splitting in this codebase. |

`index.html` change:

```html
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
<script src="js/data.js?v=3.0"></script>   <!-- new, must precede main.js -->
<script src="js/main.js?v=3.0"></script>
```

Init order: `data.js` is a pure data assignment to `window.COCOEX_DATA`; no DOM access, no GSAP dependency. Loading it before `main.js` is sufficient.

Backwards-compatibility concerns:

- `MotionPathPlugin` is registered but unused. Confirm before removing the script tag — `docs/libraries.md` already flags it safe to remove.
- The inline `onclick="switchTab(...)"` calls in `index.html:222–223` depend on `window.switchTab` being defined. Keep that global at the bottom of `main.js`.
- No `.backup` files should be committed in the split.

What this split does **not** include:

- No splitting of WebGL modules out (they all hit `masterRender()` directly).
- No splitting of popup modules (they share styles + DOM patterns).
- No CSS split. `@import` chains are sequentially blocking and harm FCP. Hand-concatenation at edit time creates merge conflicts. Stay one file.

---

## If staying (improvements within the current structure)

These are the work items worth doing now:

1. **Delete `.backup` files.** `js/main.js.backup` (90 KB) and `css/styles.css.backup` (37 KB). Git is the backup. Add `*.backup` to `.gitignore`.
2. **Reconcile `data/events.json` references.** The file does not exist; the data is hardcoded inline (`PartnershipSlider.logos`, presumably `STEP_DATA` + stardust/horizon arrays). Either:
   - **Option A (recommended now):** update CLAUDE.md and `docs/technical-spec.md` to remove the "Data Layer (`data/events.json`)" section. Document the actual location (inline in `main.js`).
   - **Option B (if content editing becomes painful):** create the file and `fetch()` it in. Adds an HTTP request and a flicker window. Don't do this until a non-developer is editing campaigns.
3. **Update LOC numbers in CLAUDE.md.** It says CSS 2,481 / JS 2,859 / events.json 107. Actuals are 2,228 / 2,348 / not present. `/doc-minder` should catch this on next run.
4. **Remove unused `MotionPathPlugin`** if confirmed unused (`docs/libraries.md` says it's safe). Saves an HTTP request, ~5 KB minified.
5. **Add a CSS table-of-contents at the top of `styles.css`** — an index of the 33 banner sections with their starting line ranges. Five minutes; pays back on every search.
6. **Add the same to `main.js`** at line 9 (inside the IIFE, top of file). The CLAUDE.md "JavaScript Architecture" block already has this; mirror it in the source so it doesn't drift.
7. **Audit duplicate animation keyframes in CSS.** Sections at 503–923 (Methods Toggle) and 1352–1618 (Muse Popup) define a number of `@keyframes` — confirm none of these are near-duplicates that could share a name. Quick visual pass; only act if you find ≥2 obvious duplicates.
8. **Do not** add `@import` chains in CSS, JS-driven HTML templating, or split the file purely by section count. Those are anti-patterns at this scale.

---

## Asset organization

`assets/images/` is well-organised. Subfolders match section names (`muse/`, `comet-collabs/`, `partnerships/`). No orphans observed. Top-level logo files (`logowhite.png`, `logoblack.png`, `cocoex-text.png`) are correctly hoisted out of subfolders because they're shared across sections.

One nit: there's a path mismatch worth verifying.
- `js/main.js:2058–2062` references `assets/images/partnerships/partner1.png` (no hyphen).
- The actual files are `partner-1.png` … `partner-5.png` (with hyphen).
- CLAUDE.md asset map shows the hyphenated form.

This either means the partnership slider currently renders broken images or the discrepancy was masked by `loading="lazy"` and unset alt fallbacks. **Verify by loading the events page in the browser; fix the JS path strings if needed.** This is a bug, not a structural issue, but surfaced during this audit.

`docs/` folder is appropriately slim (3 files: `technical-spec.md`, `libraries.md`, `responsive-design.md`). Note CLAUDE.md still references `docs/js-reference.md`, `docs/css-reference.md`, `docs/html-reference.md` which no longer exist. Either remove those references from CLAUDE.md or restore the files. **Recommend removing the references** — the source files themselves are the reference at this size; the prior generated docs were duplicated work.

---

## What this is NOT solving

- **Performance.** This plan does not measure or change runtime performance. Lighthouse / 60fps targets are unaffected by file structure.
- **Accessibility.** No a11y changes proposed. Audit separately.
- **Content management.** If the goal is letting a non-engineer edit Stardust campaigns, the answer is a CMS or a JSON file plus a fetch — neither is a "structure" question and both should be scoped separately.
- **Testing.** No test scaffolding exists; this plan does not introduce any. End-to-end visual regression is the right approach for an animation-heavy site, and that is a separate decision.
- **Build tooling.** Adding Vite / Rollup / esbuild is out of scope per CLAUDE.md.
- **TypeScript / linting.** Not proposed. Adds toolchain weight; current discipline (banner sections, IIFE, no globals except `switchTab`) covers most of what a linter would catch.

---

## Open questions

1. Confirm the `partnerships/partner1.png` vs `partner-1.png` filename mismatch in `js/main.js:2058–2062`. Render the events page locally and verify whether the partnership logos load. If they don't, fix the JS, not the assets.
2. Confirm `MotionPathPlugin` is unused. Searching `main.js` for `motionPath` / `MotionPath` / `MotionPathPlugin` will settle it. If unused, remove the CDN script tag in `index.html:464` (drops ~5 KB).
3. Should `docs/js-reference.md`, `docs/css-reference.md`, `docs/html-reference.md` be restored, or should CLAUDE.md drop those references? Recommendation: drop the references; the source is the reference at 2,348 / 2,228 LOC.
4. Is there a near-term plan to let non-engineers edit campaigns/partners? If yes, that motivates `data/content.js` (the contingent split above) ahead of any other restructuring. If no, the inline data stays.
5. Are the `.backup` files in any active workflow (e.g., `git diff` against them)? If not, delete and add `*.backup` to `.gitignore`. Confirm before deletion.
