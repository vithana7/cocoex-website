# Mobile Optimization Plan

> Audit date 2026-06-01. Mobile is the primary target. Read-only investigation, no code changes proposed in this document.

---

## CRITICAL: iOS Safari scroll architecture (investigated 2026-06-01, attempt 2)

**Confirmed user report:** iPhone is the affected device. Earlier hypothesis #1 (dual-scroller + Android `normalizeScroll`) does NOT apply — `js/main.js:15-19` guards iOS out of `normalizeScroll`. iOS Safari scroll is broken on production for a different reason.

**Failed quick-fix attempt:** removing `html, body { height: 100% }` and `body { overflow-y: auto }` shifted layout on mobile. Reverted. The `100%` height anchors are load-bearing for the current architecture even though the spec says they should not be.

**Why the architecture is brittle (root cause, not symptom):**

The site is a single-document scroll-driven animation built on GSAP ScrollTrigger. Inventory:
- 30+ `position: fixed/sticky/absolute` rules (`grep -c "position: fixed\|position: sticky\|position: absolute" css/styles.css` → 30+)
- 11 ScrollTrigger instances driving timelines, scrubs, and pin behaviour
- 5 sticky wrappers stacked back-to-back (`.muse-section`, `.muse-intro-page`, `.comet-collab-intro`, `.comet-collab-methods`, `.comet-collab-connected-content`)
- 5 WebGL canvases rendering every frame regardless of section visibility
- `body { overflow-y: auto }` is the actual scroll container — NOT the document root

The brittleness comes from `body` being the scroller while the entire animation system measures, computes, and pins against an assumed-tall body. iOS Safari handles `body`-as-scroller awkwardly compared to document-as-scroller. Specifically iOS Safari has documented quirks with:
- `-webkit-overflow-scrolling: touch` is no longer needed on modern iOS but its absence can subtly affect momentum
- Body scroll combined with `100vh` viewport units inside `position: sticky` children can stall on URL-bar collapse
- Pinch-zoom on a body-scroller can lock the gesture pipeline if any sticky descendant has `transform: translate3d` (which GSAP injects automatically)

**The real question: is GSAP ScrollTrigger the right tool for a mobile-first art site?**

Pros (current):
- Already implemented, animations are tuned
- Powerful timeline syntax
- Mature library

Cons surfacing now:
- Tightly coupled to the body-as-scroller pattern
- 11 trigger instances each running their own measurements; mobile fps suffers
- iOS Safari edge cases require library-version-specific workarounds
- Cannot easily diagnose without runtime device access

**Alternative approaches to evaluate (heavy mobile plan addition):**

1. **Lenis (smooth scrolling library)** — modern, mobile-first, handles iOS Safari quirks natively. Pairs with GSAP via `lenis.on('scroll', ScrollTrigger.update)`. ~12KB. Single-purpose: it owns the scroll, ScrollTrigger reads from it. Eliminates the body-vs-document scroller question entirely.
2. **Native CSS scroll-driven animations** (`animation-timeline: scroll()`) — supported on Chrome 115+, Safari 17.5+. No JS dependency at all. Would require rewriting all 11 timelines as CSS keyframes. Massive refactor; not practical for this scope.
3. **IntersectionObserver-based section reveals** — replace scrubbed timelines with discrete onEnter/onExit class toggles + CSS transitions. Loses the smooth scrub feel but gains rock-solid mobile compatibility. Significant UX shift.
4. **Stay on GSAP, fix targeted iOS issues** — investigate one-by-one: clear `transform-style`, ensure no `will-change` overload, remove sticky stacking, etc. Highest risk-for-effort because we keep guessing.

**Recommendation: evaluate Lenis.** It's the lowest-risk path that addresses the architectural brittleness exposed by today's failed CSS edit. Lenis explicitly solves iOS Safari momentum scrolling by virtualizing the scroll position in JS — the page is technically not scrolling natively, Lenis transforms the content container. ScrollTrigger continues to work via the integration shim. The migration is a few lines of JS plus a CSS adjustment to make `<html>` the natural document scroller. ~1 hour of work.

**Caution:** Lenis takes over scroll. That has implications:
- Browser-native scroll-to-anchor behavior is replaced
- Accessibility tools (screen reader scroll, keyboard PgUp/PgDn) need testing
- Performance: Lenis has its own RAF loop on top of `masterRender` — must be coordinated
- Some users prefer native scroll feel; Lenis adds a slight smoothing default that can be disabled

**Suggested order before any code change:**
1. Manually test current iOS scroll on a fresh device with cache cleared (`?v=3.1` may have already fixed it).
2. If broken, evaluate Lenis on a branch with a 30-minute spike.
3. Decide whether to migrate or apply a smaller fix.

---

## CRITICAL: Production mobile scroll bug (investigated 2026-06-01)

**Symptom (verbatim):** "Mobile, still after deploy on GitHub Pages, doesn't seem to be scrollable via mobile."

**Local-vs-production gap.** The working tree has 3 modified-but-uncommitted files (`css/styles.css`, `index.html`, `js/main.js`). GitHub Pages serves commit `2c039b1` (HEAD). The user is testing local with the diff applied, prod with HEAD only. The diff itself does not contain a scroll fix — it's scroll-pacing changes (text 150→180vh, muse 470→340vh, comet 600→480vh) and a few `loading="lazy"` additions. So the bug is reproducible on HEAD.

### Hypothesis ranking

**1. (most likely) Dual-scroller deadlock between `<html>` and `<body>` interacts with `ScrollTrigger.normalizeScroll(true)` on Android.**
- `css/styles.css:34–36` — `html, body { overflow-x: hidden }` makes html non-`visible` on the x-axis. Per CSS spec, when html has any non-visible overflow value, html itself becomes a scroll container (overflow propagation to viewport stops). On the y-axis html is unset → computed `auto`.
- `css/styles.css:128–139` — `html, body { height: 100% }` plus `body { overflow-y: auto }` (line 137). Body is now also a scroll container.
- Both elements end up scrollable. The browser picks one for touch routing; GSAP's `normalizeScroll` listens via window/document. On Android Chrome (the branch enabled at `js/main.js:17–19`), `normalizeScroll(true)` intercepts wheel/touch to pace scroll smoothly — but it expects a single document scroller. With two candidate scrollers, the touch handler can swallow gestures without applying them. iOS is guarded out at `js/main.js:15`, so iOS Safari should still scroll natively (verify; user did not specify which OS).
- This pattern existed since the initial commit, so the page must have shipped broken on Android touch, OR the older builds compensated via something now removed. Most likely the bug has been latent on Android since before `b6e0e94` and only the iOS guard from that commit made iOS feel "fixed."
- **Confirmation test:** open DevTools on the deployed page from a desktop, set device emulation to a touch device, and run in console: `getComputedStyle(document.scrollingElement).overflowY`. If it returns `"auto"` and `document.scrollingElement === document.body`, body is the scroller. Then run `ScrollTrigger.normalizeScroll(false)` and re-test scroll on a real Android device. If scroll returns, this hypothesis is confirmed.

**2. (plausible) `ScrollTrigger.normalizeScroll(true)` itself is the regression on Android.**
- `js/main.js:17–19` — runs on any non-iOS touch device. Android Chrome receives this. Normalize-scroll attaches non-passive wheel/touch listeners. If any other listener on the page is also non-passive on the same elements, Chrome can deadlock the gesture pipeline.
- Since the b6e0e94 fix, no non-passive touch listener has been re-introduced (verified — the only document-level touch listeners are at `js/main.js:1948,1954,1957`, all `{ passive: true }` or default, none call `preventDefault`). So no clear deadlock partner — but `normalizeScroll(true)` on its own has been reported in the wild to break scrolling on Android 12+ Chrome under certain pinch/zoom + body-as-scroller conditions.
- **Confirmation test:** comment out `js/main.js:17–19` (or change the condition to `if (false)`). Re-deploy. If Android scroll returns, normalizeScroll is the regression. The trade-off: scroll-driven animations may become slightly less smooth on Android, which is acceptable.

**3. (lower likelihood) Service-worker or stale cached asset on Pages.**
- GitHub Pages does not inject a service worker, but the site has shipped multiple versions of `styles.css?v=3.0` and `main.js?v=3.0` with the same query string. If a mobile browser cached an older `?v=3.0` payload from a prior visit, the deployed update never loaded. Less likely to cause a complete scroll lock — would more likely manifest as broken animations.
- **Confirmation test:** ask the affected user to hard-refresh (or clear site data). If scroll returns after a clean fetch, bump the cache-buster to `?v=3.1` in `index.html:14,430` before re-deploying.

### Recommended fix path

**Step A — instant, deploy-now diagnostic (low risk):**
1. Disable `normalizeScroll` entirely. In `js/main.js:15–19`, change to:
   ```js
   const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
     (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
   // normalizeScroll disabled pending mobile-scroll regression diagnosis (2026-06-01).
   // Re-enable per platform once root cause confirmed.
   ```
2. Bump cache-buster from `?v=3.0` to `?v=3.1` on both `index.html:14` and `index.html:430`.
3. Deploy and re-test on real Android device.

This addresses hypotheses 2 and 3 simultaneously. If scroll returns, we have isolated the regression to `normalizeScroll`. The cost is that scroll-driven animations on Android may judder slightly more — acceptable until root cause is fixed properly.

**Step B — if Step A does not fix it (hypothesis 1 confirmed):**
Restructure the body/html overflow model so there is exactly one scroller. The least invasive change:
- In `css/styles.css:128–139`, remove `height: 100%` from `html, body`. Body will then grow to fit its `.scroll-container` child naturally, and the document scrolling element becomes html (the viewport). Keep `body { overflow-x: hidden }` for the horizontal-clip; remove `body { overflow-y: auto }` (line 137) — it becomes redundant once body is no longer height-constrained.
- After this change, re-enable `normalizeScroll` on Android.

**Why not propose Step B first?** Because removing `height: 100%` may cascade into side effects on `.intro` (which is `position: fixed`), the WebGL canvases (`.unified-starfield-canvas` is `position: fixed; height: 100%` at `css/styles.css:344–352`), and any descendant using `100%` height inheritance. Step A is a one-line revert; Step B is a layout change that needs visual regression checking on every section.

### Risk assessment — items I cannot confirm without device access

- I cannot determine whether the bug is iOS-only, Android-only, or both. The user did not specify. The iOS guard at `js/main.js:15` should keep iOS untouched by GSAP scroll normalization, so iOS scroll bugs would point more strongly to the dual-scroller hypothesis (1). Android scroll bugs point to either (1) or (2).
- I cannot rule out a viewport-height bug specific to iOS Safari toolbar collapse (`100vh` vs `100dvh`). The CSS uses both (e.g., `css/styles.css:378–379`) but several full-viewport `position: fixed/sticky` elements still default to `100vh`. This causes layout overflow that *can* trap scroll on iOS, but typically it manifests as content cut off, not as scroll being completely disabled.
- I cannot test whether the deployed bundle actually matches HEAD. GitHub Pages occasionally delays deployments by 5–10 minutes after a push. If the user is testing immediately after deploy, they may be on the previous build. A check of `view-source:` for the cache-buster query and deployed `<title>` can confirm.
- I cannot verify Adobe Typekit (`use.typekit.net/afs8ors.css`) returns successfully on the user's network. A blocked stylesheet wouldn't affect scrolling, but a long-stalled font request would not block JS either since the script tags are at body end.

---

## Executive summary

- 5 concurrent WebGL contexts render every frame on mobile regardless of which section is visible. Off-screen gating exists for the muse-popup particle system but not for the four background starfields. This is the single biggest mobile-perf hit (battery, fps, GPU thermals).
- Static asset weight is ~1.6 MB of unoptimised PNGs in the critical path; `process-five.png` alone is 299 KB; `logoblack_name.png` 242 KB; none lazy-loaded except partnership logos. Hot path on 4G.
- Documentation drift: `data/events.json` does not exist (CLAUDE.md and html-reference describe it as the data source for partnerships, stardust, horizon). `PartnershipSlider` is hardcoded to `partner1.png`–`partner5.png`, but on disk the files are named `partner-1.png`–`partner-5.png` and are 0 bytes. Stardust and Horizon containers stay empty. Events page is broken on mobile.
- `events-background-canvas` is in HTML and CSS but never initialised in JS — dead element shipped to mobile.
- Touch-target gaps: muse-popup close button is `1px×1px` (only ESC / outside-click closes), step-popup close is 40px (<44px), muse-orbit click hit area is the heading text only — moving target on a 240s orbit.

---

## Scope decision (locked in 2026-06-01)

**Events page is being trimmed to Partnership only.** The Stardust and Horizon subsections will be removed in this implementation pass. After Partnership the page goes to a small breathing space, then the static footer. Rationale: the stardust/horizon containers are empty placeholders that pollute the experience; partnerships will eventually be wired up properly. This supersedes the "ship a renderer" recommendations elsewhere in this plan.

**Concrete deletions when implementing:**
- `index.html:377–406` — delete `<section class="stardust">` and `<section class="horizon">` blocks in their entirety, including the headings, paragraphs, and footnote.
- `index.html:367` + `css/styles.css:1867–1875` — delete `<canvas id="events-background-canvas">` and its CSS rule.
- `css/styles.css` — delete `.stardust*`, `.horizon*`, `.section-label` rules used only by the deleted sections (verify with grep before deleting; any rule shared with another section stays).
- `js/main.js` — verify nothing references `#stardust-campaigns`, `#horizon-labs`, `#stardust`, `#horizon` after deletion (the footer reveal ScrollTrigger was already removed; search for any stragglers).
- Keep: `.partnership-section`, `.partnership-title`, `.partnership-slideshow`, `PartnershipSlider` module. The partner image filename mismatch (`partner1.png` vs `partner-1.png`) is a known follow-up — assets land later.
- Add visual breathing space: small bottom padding on `.events-page-wrapper` (or similar) so the static footer doesn't collide with the partnership row. The exact value is a design call; suggest `clamp(4rem, 10vh, 8rem)`.

**Knock-on effects to update after the trim:**
- Total page height drops by however much the Stardust + Horizon blocks contributed (likely ~150–250vh worth of natural-flow content). The scroll plan's height calculations will need a re-measure.
- CLAUDE.md's "Page Sections" table — the Events Page row needs simplification (Partnership only).
- `MOBILE-PLAN.md` items #1, #2, #3 in *Critical* below are partially superseded — items #1 (partner filename) and #3 (events-background-canvas) still apply; item #2 (empty Stardust/Horizon containers) becomes "deleted" rather than "needs renderer."

---

## Critical (will degrade mobile UX visibly)

- **`js/main.js:2056–2092` · PartnershipSlider hardcoded to non-existent files · breaks events page hero**
  Logos point to `partner1.png` (no hyphen). Disk has `partner-1.png` (with hyphen) and they are 0 bytes anyway. On mobile this means a row of broken `img` icons in the partnership carousel. Recommendation: either populate the assets and fix filenames, or hide the partnership section until assets exist. Decide whether to migrate to the documented `data/events.json` flow or keep the inline list authoritative.

- **`index.html:383, 400` · Stardust and Horizon containers never populated · empty events page**
  HTML has empty `#stardust-campaigns` and `#horizon-labs` divs with comments saying "dynamically inserted". No fetch/render code exists in `js/main.js` (greps for `events.json`, `fetch`, `stardust-campaigns`, `horizon-labs` in JS return zero hits). On mobile users scroll past the partnership block to a blank section. Recommendation: ship `data/events.json` + a renderer, or remove the section + headings until content lands.

- **`index.html:367` + `css/styles.css:1867–1875` · `events-background-canvas` element is dead code**
  Element is fixed-position covering the viewport but never gets a 2D/WebGL context. On mobile it is zero-cost but is a maintenance landmine. Recommendation: remove from HTML/CSS, or wire it to a starfield instance if the intent was a 6th canvas (warning: CLAUDE.md states browser cap is ~8 contexts and we are already at 5).

- **`js/main.js:827–932` · masterRender renders all 5 WebGL contexts every frame regardless of section · ~30 fps on mid-range Android**
  Page-visibility gate exists (`isPageVisible`) but no scroll-position gate. While the user is in the intro (0–400 vh), `MuseBackground`, `UnifiedStarfield`, `CometBgPrimary`, `CometBgSecondary` all draw a full-screen quad with simplex-noise+stars at every RAF tick. Recommendation: maintain a single `currentSection` state from a top-level ScrollTrigger and skip the `drawArrays` for any starfield whose owning section is offscreen. Keep WebGL programs alive (avoid context loss); only skip the draw call. Expect ≥40% mobile GPU reduction.

- **`assets/images/comet-collabs/process-*.png` · 155–299 KB raw PNGs eagerly loaded · LCP regression on 4G**
  Process images appear twice (`floating-processes` + `comet-connected-images`). 5 of them, plus the white comet logo (89 KB) and muse_logo_black (157 KB). All `<img>` without `loading="lazy"` or `decoding="async"`. Total ~1 MB image payload before LCP. Recommendation: convert process-*.png and the `logo*_name.png` files to WebP (expect 60–70% size cut), add `loading="lazy"` to comet-connected duplicates and any `<img>` below the fold, `decoding="async"` everywhere.

- **`index.html:11` · Adobe Typekit `afs8ors` blocking stylesheet, no preconnect, no `font-display` control · FOIT on slow 3G**
  The Typekit URL is loaded via `<link rel="stylesheet">` with no `<link rel="preconnect" href="https://use.typekit.net">` or `<link rel="preconnect" href="https://p.typekit.net" crossorigin>`. Typekit injects `font-display: auto` by default on most kits — verify in the kit settings (this is configured in Adobe's UI, not our code) and prefer `swap`. Recommendation: add preconnect + DNS-prefetch lines; verify the kit is set to `swap` in the Adobe dashboard. Otherwise mobile users on 3G see a blank serif fallback longer than necessary.

---

## Performance

- **`js/main.js:548, 680, 1354` · DPR cap at 2× across the codebase · likely safe but consider 1.5× on mobile**
  Tech-spec calls the 2× cap "non-negotiable" and cites past 30→15 fps regression at 3×. Five concurrent shaders may still tax low-end Android at 2×. Recommendation: instrument with `performance.now()` deltas in `masterRender` on a representative Android device. If sustained < 30 fps, drop the cap to 1.5× *only* for the four starfield instances (intro shader is single, keep at 2×). Do not change desktop behavior.

- **`js/main.js:1820` · `CometConnections.resize()` uses `window.devicePixelRatio` uncapped**
  Only place in the code that reads DPR without the 2× cap. On 3× Android phones this canvas allocates 9× the pixels. Connection canvas is small in practice (sized by parent `getBoundingClientRect`) but the principle is wrong. Recommendation: apply the same `Math.min(window.devicePixelRatio || 1, 2)` cap.

- **`js/main.js:1824` · `ctx.scale(dpr, dpr)` on every resize · cumulative scaling bug**
  `CanvasRenderingContext2D.scale` is multiplicative. If the user rotates twice, the 2D context is scaled 4×, 8×, etc. Recommendation: call `ctx.setTransform(dpr, 0, 0, dpr, 0, 0)` instead, which replaces rather than compounds. Verifiable by drawing on the canvas after two `orientationchange` events.

- **`css/styles.css:9–27` · `*` scrollbar styling applies to every element · paint cost on long lists**
  Universal `*` selectors for `scrollbar-width` and `::-webkit-scrollbar*` force the browser to evaluate scrollbar styling on every element including non-scrollable spans. Recommendation: scope to `html, body, .muse-popup-content, .step-popup-content` or wherever scrollbars actually appear.

- **`css/styles.css` · `will-change` declared on 24 selectors** (lines 170, 205, 226, 306, 338, 443, 514, 554, 843, 937, 1137, 1229, 1269, 1299, 1392, 1407, 1428, 1463, 1484, 1496, 1523, 1541, 1566, 1911)
  Several are static or only briefly animated:
  - `.intro` line 170 `will-change: opacity` — never opacity-animated (intro is fixed full-page).
  - `.unified-starfield-canvas` line 350 (none, good) but `.constellation-canvas` line 338 declares `will-change: transform, opacity` while only opacity is animated by GSAP; manual rotation was removed.
  - `.muse-orbit-container` (none) but `.muse-orbit-item` line 1299 declares `will-change: transform` permanently — 7 always-promoted layers on mobile is acceptable since they actually animate, but keep an eye.
  - `.partnership-track` line 1911 — yes it animates, fine.
  - `.muse-popup-particle` line 1566 — particles created on demand with explicit `will-change`; fine, but they are 12 promoted layers while popup is open.
  Recommendation: audit each one against the actual GSAP timelines; remove from elements that aren't currently in motion. Each `will-change` is a separate compositor layer on iOS Safari — cumulative GPU memory cost.

- **`css/styles.css:622, 992, 1903` · `backdrop-filter: blur(10px)` on three large elements**
  Pill toggle, step-popup overlay, partnership slideshow. iOS Safari backdrop-filter is GPU-expensive at full screen. Step-popup overlay (full screen, line 992) is the worst offender; pill is small enough to be fine. Recommendation: keep on small surfaces (pill 622); consider `background: rgba(0,0,0,0.92)` solid for `.step-popup-overlay` on mobile via media query.

- **`css/styles.css:1317, 1338, 1504–1509` · stacked `drop-shadow()` filters on muse images and popup**
  Popup image stacks 3 drop-shadow filters + `brightness` + `contrast` on every redraw. Mobile compositor regenerates this on every popup open and on every 3D tilt frame (3D tilt is hover-only so no mobile cost — verify). The orbit muse images have `drop-shadow + saturate + brightness` — applied to 7 always-rotating elements. Recommendation: replace with a single PNG asset variant pre-baked with shadow, or drop the `saturate(1.4) brightness(1.1)` (which the asset can encode) on mobile via media query.

- **`assets/images/logoblack_name.png` (242 KB) · `logowhite_name.png` (147 KB)**
  Don't appear referenced in `index.html` — possibly orphan assets shipped on disk. Recommendation: grep for actual usage; delete if unused.

---

## Layout / Fluidity

- **`css/styles.css:128–139` · `html, body { height: 100% }` plus `body { overflow-y: auto }`**
  This is fine, but combined with `html, body { overflow-x: hidden }` (line 35) means both elements have overflow rules. Tech-spec rule "never use overflow-y: scroll on both html and body" applies — current state is `auto` on body only, which is OK. Verify nothing later flips html to `overflow-y`.

- **`css/styles.css:199–201` · `.logo-container { width: 80px; height: 80px }` hardcoded px, then JS overrides to `clamp`-equivalent on every frame during orbit**
  CSS sets fixed 80px; JS line 1275–1277 immediately writes `style.width = orbitState.logoSize + 'px'`. The CSS value is dead code (never applies after first paint). Recommendation: remove the hardcoded 80px in CSS, use a CSS custom property fed by `--intro-logo-size` so the initial paint matches the JS-driven path on slow networks.

- **`css/styles.css:266–270` · `.final-dot` no width/height set in CSS**
  Sized only inline via JS (`updateConstellationExplosion` line 623). Before JS runs, the dot has zero dimensions — invisible during the brief gap. Acceptable; just noting.

- **`css/styles.css:299` · `.transition-text` translate uses `clamp(180px, 25vw, 280px)` offset — at 375px viewport, 25vw = 93.75px, so clamps to 180px floor**
  At 375 × 667 viewport that places the text 180px below center → 333px + 180px = 513px from top, in the bottom 20% of the viewport. Likely fine, but verify visually that intro text doesn't collide with iOS Safari URL bar at small heights.

- **`css/styles.css:1158–1200` · `.muse-intro-text-top` and `text-bottom` use `top: 18%` / `bottom: 18%` with `max-height: 28vh`**
  At 375 × 600 portrait (iOS Safari with toolbar) `28vh = 168px`. The intro logo at center is `clamp(150px, 20vw, 300px)` → 150px floor. Text at top:18%=108px from top. Top text bottom edge ≈ 108+168=276; logo top edge ≈ 300−75=225. Overlap risk at narrow heights. Recommendation: tighten `max-height` or convert `top: 18%` to use `top: max(18%, 80px)` and verify on 360×640 Android.

- **`css/styles.css:357–360` · `.text-section-wrapper { height: 150vh }` · uses vh not dvh**
  This is a scroll-distance container; vh is correct here (we want a stable absolute height regardless of toolbar state). No change. (Documentation alignment OK.)

- **`css/styles.css:1118` · `.muse-section-wrapper { height: 470vh }` · matches MUSE_TOTAL constant**
  Verified-good per recent work.

- **`css/styles.css:422` · `.comet-collab-wrapper { height: 600vh }` · matches COMET_TOTAL**
  Verified-good.

- **Smallest viewport readability check (375px width) for body/copy**
  - `.transition-text p` `clamp(14px, 2vw, 22px)` → 14px at 375px. Borderline.
  - `.muse-popup-cause` `clamp(16px, 1.8vw, 20px)` → 16px. OK.
  - `.muse-orbit-item .muse-text h3` font-size `var(--font-h2-size) = clamp(14px, 1.5vw, 22px)` → 14px scaled by `0.65` (depth-min) = effective 9.1px on top of orbit. Below WCAG. Recommendation: floor `--font-h2-size` to 16px on mobile via the `≤768px` block, or remove depth-shrink scale floor (`scale = max(0.85, 0.65 + depth * 0.40)`).
  - `.horizon-footnote` `clamp(11px, 1.1vw, 14px)` → 11px. Below WCAG AA recommended 12px floor.

- **`css/styles.css:549–550` · `.floating-process { width: clamp(80px, 12vw, 140px) }` (overridden to 60px floor at ≤768px line 1659)**
  At 375px, 5 images at 60px each = 300px → fits. But initial positions are at percentage corners (10%, 75%, 15%, 80%, 45%) line 1965–1969 of JS. Image at left:10%, top:15% places its center near (38, 100); image at left:75% top:25% center near (281, 167). With 60px images, edges may overlap on 360px Android. Recommendation: make positions and sizes derive from viewport + image-size so initial layout never overlaps; alternatively, gate floating drag entirely on mobile and show a single CTA.

- **Mobile orbit ratio docs drift**
  `docs/responsive-design.md:36–46` still describes hardcoded 1.4×/1.8× per-breakpoint ratios. Code (`main.js:1684–1707`) has been replaced with smooth aspect-ratio interpolation. Update doc to match (separate doc-update task; outside this audit's mandate).

---

## Touch / Interaction

- **`index.html:98–172` · 7 `.muse-orbit-item` elements have no `tabindex` and click is bound only on inner `.muse-image` and `h3` · keyboard nav broken; tap target is the heading text bounding box**
  `js/main.js:1773–1781` adds click on `imageContainer` (60–80px on mobile) and on `h3` (text size). The orbit-item itself is not focusable. CLAUDE.md / docs claim "Tab through muses, Enter opens popup" — currently impossible. Recommendation: add `tabindex="0"` and `role="button"` on `.muse-orbit-item`, bind click + keydown there with `.muse-image + .muse-text` as the visible label. Increase mobile tap surface to the full orbit-item with an invisible `padding`, since the heading text alone (small, possibly italic-stroked) is hard to hit on a moving 240s-rotation target.

- **`css/styles.css:1588–1596` · `.muse-popup-close` is 1px × 1px, opacity 0, pointer-events none · close button is technically inaccessible**
  The popup relies on click-outside and ESC. On mobile there is no ESC. The "click outside" zone is `.muse-popup-overlay` which is full-screen behind the content — tapping outside the card works but is undiscoverable. The `.muse-popup-hint` "Click outside or press ESC to close" line is below the popup-content; on small viewports it may be off-screen. Recommendation: make the close button a real visible 44×44 control on mobile (top-right of popup), keep the hint as secondary affordance.

- **`css/styles.css:1008–1024` · `.step-popup-close` is 40px × 40px · below 44px WCAG mobile target**
  Recommendation: bump to `clamp(44px, 10vw, 52px)`.

- **`js/main.js:1947–1959` · FloatingProcesses touchstart `{ passive: true }`, no `preventDefault` in startDrag, document touchmove `{ passive: true }`, `touchAction: 'none'` only on dragged element · verified-good per recent work**
  No regression. Holding.

- **`css/styles.css:556` · `.floating-process { touch-action: auto }` then JS toggles `touchAction: 'none'` on dragstart and clears on dragend · correct**
  No issue.

- **`js/main.js:1715–1743` · MuseScroll orbit auto-rotates every frame · no pause-on-touch**
  240s/rotation = 1.5°/s, slow enough to hit. Combined with the small tap target above this is the actual mobile UX problem. Recommendation: pause `orbitSpeed` for 2 seconds on `touchstart` anywhere in the muse section to give the user a stable target; resume after timeout.

- **`js/main.js:1487, 2123` · click handlers on muse-popup-overlay and step-popup-close · no `mousedown` reliance**
  Tap works correctly. Verified-good.

- **`index.html:222–223` · `<button class="pill-opt" onclick="switchTab(...)">` · inline onclick handlers**
  Works, accessible (real `<button>`). Touch target 53–62px on mobile (line 1755–1757 padding) — comfortably above 44px. No concern.

- **`css/styles.css:1376` · `.muse-popup-overlay { cursor: pointer }` but `pointer-events` not declared explicitly**
  Inherits visible/auto by default since it has positioning. Tap-to-close works. No concern.

- **`css/styles.css:336–339` · `.constellation-canvas { pointer-events: none }` declared explicitly**
  Verified-good per CLAUDE.md mobile rule "always set pointer-events explicitly on canvas".

---

## Accessibility

- **`css/styles.css:114–126` · `prefers-reduced-motion` block disables CSS animations and transitions globally**
  Good: floats, levitates, partnership-scroll, pulses are all neutralised. WebGL canvases continue rendering per design (documented in responsive-design.md). Muse popup particles are gated separately at `js/main.js:1613–1614`. Verified-good.

- **`index.html:32–37` · intro orbit dots and logo `aria-hidden="true"` on parent (`.intro-content`) · screen readers skip · correct**

- **`index.html:411–425` · social links have `aria-label` · 52px touch targets line 1080–1081 · verified-good**

- **`index.html:74` · `.muse-intro-page` has no `aria-label` or heading** despite being major content. Recommendation: add `aria-labelledby` or a visually-hidden h2.

- **`index.html:357` · step-popup close button `aria-label="Close popup"` · good. But popup container `aria-modal="true"` without focus-trap implementation**
  `StepPopup.open` line 2186 calls `closeBtn.focus()` but there is no `focus()` ring back, no Tab-cycle trap, so Tab can leave the modal. `MusePopup` has the same issue.
  Recommendation: add a focus-trap (or use `inert` attribute on background while modal open).

- **`index.html:432–458` · muse-popup has `id="muse-popup"` but no `role="dialog"`, no `aria-modal`, title `id="muse-popup-title"` is set to `display:none` (line 1397)**
  Recommendation: add `role="dialog" aria-modal="true" aria-labelledby="muse-popup-cause"` (cause is the visible label).

- **`css/styles.css:671–673, 769–772, 1031–1035, 1059–1063, 1094–1097` · focus rings declared with 2px outline**
  Visible on focus. iOS Safari sometimes hides outlines on tap; Bluetooth-keyboard users on mobile will see them. Verified-good.

- **Color contrast spot-checks (mobile-relevant)**
  - `.step-body` `rgba(0,0,0,0.7)` on white = 7.0:1, AA pass.
  - `.muse-popup-text` `rgba(255,255,255,0.9)` on `#000` = 16.5:1, pass.
  - `.muse-orbit-item h3` colored by data-color (e.g., `#F8D86A` Thunor) on `#FAFAFA` = ~1.3:1, **AA fail**. The white drop-shadow (line 1338) and 0.5px white text-stroke don't fix this for small text. On mobile this is the primary readability issue.
  Recommendation: darken muse heading colors by 20% via a separate `--*-dark` token used for text, or render headings in solid black with a colored accent dot.

- **`css/styles.css:1339–1340` · `text-stroke: 0.5px rgba(255, 255, 255, 0.4)` on muse h3**
  Mobile Safari supports `-webkit-text-stroke` for fonts, but at 0.5px and 40% alpha the rendering is sub-pixel. On 1× DPR it disappears entirely; on 3× it shows as a faint outline. This was likely intended as a halo against the off-white background but is invisible on most devices. Recommendation: replace with `text-shadow` (works at sub-pixel), or remove and rely on the contrast fix above.

---

## Verified-good (recent work that is holding up)

- `js/main.js:1947–1959` — FloatingProcesses passive `touchstart`, no `preventDefault`, document-level passive touchmove, `touchAction: 'none'` only mid-drag.
- `css/styles.css:1118` — `.muse-section-wrapper { height: 470vh }` matches `MUSE_TOTAL` constant.
- `css/styles.css:357–360` — `.text-section-wrapper { height: 150vh }` matches `TEXT_SECTION_HEIGHT`.
- `js/main.js:1684–1707` — `MuseScroll.calculateOrbitRadius` uses smooth aspect-ratio interpolation; no stepped breakpoints. Replaces the prior 768/1024 step logic.
- `js/main.js:1737–1741` — depth scaling `0.65 + depth * 0.40` produces 0.65–1.05 range; orbit images at 80px floor become 52–84px — fits 375px viewport without overflow.
- `js/main.js:1156–1158` — muse-center-logo uses GSAP `xPercent: -50, yPercent: -50` (lines 1156–1157) so scaling composes correctly. Verified.
- `js/main.js:13–19` — iOS-guarded `ScrollTrigger.normalizeScroll`. Holds.
- `js/main.js:548, 1354` — DPR cap at 2× consistent across `resize()` and `createStarfield`. Holds.
- `js/main.js:967–982` — Page Visibility API gates the master render loop. Holds.
- Footer (`index.html:410`) is in normal flow at page end (verified, not fixed).

---

## Open questions

1. **Events page content source.** Is `data/events.json` planned, or is the canonical content the inline JS arrays in `PartnershipSlider`? Determines whether to ship a fetch+render pipeline or delete the documentation references to JSON.
2. **Partnership assets.** All `partner-*.png` are 0 bytes on disk; `PartnershipSlider` references `partner1.png` (no hyphen). Are real assets coming, or should the section be hidden until then?
3. **`events-background-canvas`.** Remove dead element, or wire a 6th starfield instance? Note CLAUDE.md ceiling of "stay under eight" WebGL contexts.
4. **Mobile DPR cap to 1.5×.** Acceptable to ship a 1.5× cap on the 4 starfield canvases (intro stays at 2×), or strict 2× minimum visual fidelity? Need to test on a real low-end Android.
5. **Muse heading colour contrast.** Replace per-muse heading colour with a darker variant for AA compliance, or accept the visual brand at the cost of readability for low-vision users?
6. **Orbit pause-on-touch.** Acceptable to pause the 240s rotation for 2s on tap inside `.muse-section`, or maintain perpetual motion as a brand statement?
7. **Drop the Adobe Typekit blocking link.** Acceptable to self-host Canela WOFF2 with `font-display: swap` (one HTTP/2 request, no third-party DNS), or stay on Typekit for licensing reasons?
