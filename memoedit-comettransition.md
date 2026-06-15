# 🚦 START HERE — Comet → Toggle transition (handoff, 2026-06-15)

**What this is:** a scroll transition from the Comet Collab intro (dark, over starfield)
into the Stardust/Horizon toggle panel (white). The "Comet Collab" SWIRL symbol takes over
(text fades), the camera flies INTO the swirl's own white until it fills the screen, the
muse-spectrum burst ripple rides with it, then the toggle develops out of the white. Style
ref: lenis.dev "enter Lenis". Built in vanilla JS + GSAP ScrollTrigger.

**ARCHITECTURE (2026-06-15): the diving swirl is now a 2D CANVAS, not a CSS-transformed `<img>`.**
Both the swirl (`src/ui/comet-dive.js`, 2D canvas `#comet-zoom-swirl-canvas`) and the burst
ripple (`src/webgl/burst-ripple.js`, WebGL `#comet-zoom-ripple-canvas`) are drawn by the central
`Renderer` every frame from ONE scrub value (`dive.p`), so they always present the same frame —
this is what finally killed the fast-reverse glitch (a CSS-transform layer and a canvas can't be
guaranteed to composite the same frame; lenis.dev renders its whole zoom in one canvas for this
reason). `comet.js` now only owns the timeline (feeds `cometDive.setState({p, appear, logoRect})`).

**Status: WORKS, fully CDP-verified (mobile + desktop, slow + hard-flick reverse).** Zoom-into-
white reaches full white (no corner), swirl crisp at every scale (hi-res raster `drawImage`),
ripple always proportional to the swirl, take-over anchored to the on-page logo's LIVE rect.

**✅ FLICKER FIXED — MASK FROM `reveal==0` (2026-06-15):** the flicker was the methods SECTION
**background** flashing **unmasked** ("the background turns white") for a ~1-step scroll window right
as the reveal begins. **Root cause, CDP-confirmed** (mobile 390×844, `/tmp/cdp-boundary.mjs`): at the
reveal-start unit `comet.js` sets the panel opaque (`.set(methods,{opacity:1},70)`), but
`comet-dive.js` applied the swirl mask only when `reveal > 0`. At the boundary frame where
`reveal == 0`, the panel was **opaque-but-unmasked** → the full light section background filled the
screen (the white portal swirl on top is invisible against it). Captured at scroll 10430–10434
(`op:1, mask:no`) — exactly the user's DOM screenshot. **NOT the toggle content** (proven earlier: it
was gated to `autoAlpha:0` and the flash persisted — that gate is reverted, content reveals through
the swirl again as before). **Fix (`comet-dive.js` `draw()`):** apply the swirl mask for the whole
reveal **including `reveal == 0`** — dropped the `reveal > 0` gate (`else { applyMask }`). The panel
is `opacity:0` before the reveal-start unit, so masking from `reveal==0` is harmless then and means
it's NEVER opaque-but-unmasked. **Also (`setState`):** the out-of-band clear guard changed from
`reveal <= 0 || reveal >= 0.999` to `this.appear <= 0 || reveal >= 0.999` — `reveal==0` is now a
valid masked state (the take-over), so clearing at `reveal<=0` would fight draw()'s per-frame
re-apply and re-flash; clearing on `appear<=0` (dive inactive) still releases on jumps before the
dive. CDP-verified: FLASH COUNT 0 across the op→1 boundary; content revealed through the growing
swirl (masked in the white); jumps to before-comet/muse/events clear mask + release fixed; build green.

**↩︎ DISC REVEAL REVERTED (2026-06-15) — back to the swirl-shaped SVG mask:**
A "clean disc" reveal (radial-gradient mask growing from the white point) was briefly tried to kill
the swirl's dark negative-space wedges (the triangular notch read as a black triangle), but the user
**preferred the swirl-shaped mask** ("the circle ruins the masked look") and it was reverted. Current
reveal mask = `MASK_URL` (the holey `comet-mark-white.svg`) sized/positioned to the swirl's live
rect — white-only, exactly as designed. The swirl's dark negative spaces during the reveal are its
natural look (kept); they only read as a glitch when toggle CONTENT strobes through them, which the
toggle-content gate (see the TOGGLE-FLICKER entry above) removes. The seam/position fixes (v1+v2,
`updateFixed`) remain in place.

> Useful diagnostic from that pass (kept for reference): the seam was confirmed ALREADY FIXED via
> **6× CPU throttle** (`Emulation.setCPUThrottlingRate{rate:6}`, amplifies transient lag) + a
> **pixel seam-detector** (per-frame per-row luminance, flag full-width row jumps; dive scored 4–33
> vs a 254 real edge). DOM polling reads correct on transient paint bugs — this catches them.

**✅ SEAM FIX v2 (2026-06-15) — TRANSIENT seam on slow scroll (position-toggle layout lag):**
After v1 a faint seam still appeared on *really slow* continuous scroll. CDP-reproduced via a
slow continuous wheel-scroll **screencast** (frame 464 = a one-frame outlier showing the dark/
offwhite seam; neighbours clean) — and crucially DOM polling read `fixed/top:0` the whole time.
So the seam is a **transient compositor lag**: v1 toggled `.dive-fixed` (a `position` change =
LAYOUT) exactly when the mask turned on (a paint-only change, instant), so for one heavy-scroll
frame the mask revealed the toggle while the panel was still painted at its sticky mid-pin
`top:376`. Fix: **decouple `.dive-fixed` from `reveal`** — apply it by GEOMETRY in a new
`updateFixed()`: `appear>0 && parentPanel.getBoundingClientRect().top > 1` (dive active AND tabs
panel not yet pinned). So `fixed` engages EARLY during the take-over while the panel is still
`opacity:0` (invisible), and releases only at the natural pin (`parent.top<=0`, where sticky and
fixed both sit at `top:0` → seamless). Net: NO position change ever coincides with the masked
toggle being visible at a non-pinned spot → the transient is impossible. `updateFixed()` runs in
`draw()` (per-frame, before the early-return) AND `setState()` (timeline-driven, so fast jumps
out of comet still release it); `clearMask()` no longer touches the class. CDP-verified: state
trace shows `FIXED` engages at vh1234 (mask still OFF) and releases at vh1282 (pin), `methTop=0`
across the whole masked range; slow-scroll screencast seam GONE; jumps to before/events/muse all
release fixed (no stuck panel).

**✅ SEAM FIX v1 (2026-06-15) — masked reveal clipped to the un-pinned panel (hard horizontal seam):**
On desktop (and subtly on mobile) the reveal showed a hard horizontal seam mid-screen: the swirl
window revealed the toggle only in the LOWER part, dark scene above. Root cause (CDP-proven):
`.comet-collab-methods` is `position:sticky` and the reveal starts (~unit70) BEFORE it finishes
pinning — measured `methTop` = 249px→93px→0 across vh1250→1282 — so while mid-pin the panel's box
starts partway down and the swirl-mask clips to it → seam. Fix: `comet-dive.js` adds a **`.dive-fixed`
class** (`position:fixed; left:0` — top/width/height already on the panel) while `0 < reveal < 0.999`
so the panel covers the FULL viewport during the reveal; removed at full/no reveal. `fixed` and the
pinned-`sticky` state both render at top:0 so the swap is seamless (and happens under a tiny mask).
The 300vh tabs panel keeps its explicit height → taking the child out of flow does NOT shift scroll;
partnerships still scroll in normally (sticky restored before the scroll-away). **Robustness:** the
class/mask are applied in `draw()` (a comet-gated Renderer layer), so a fast JUMP that lands outside
the reveal band while comet is already gated off (before the dive, or into events/muse) would stick —
so `setState()` ALSO clears (`if _masked && (reveal<=0 || reveal>=0.999) clearMask()`); setState is
driven by the timeline onUpdate which fires regardless of gating. CDP-verified: seam GONE at the exact
glitch scroll (desktop 1440×781 + mobile), panel `fixed/top0` through the whole reveal then `sticky/top0`;
jumps to before-comet(1000)/events(1650)/muse(500) all revert to sticky (no stuck fixed/mask); hard
reverse-flick screencast on desktop = 0 violations, no seam/flash under motion.

**✅ EARLIER (2026-06-15) — toggle revealed THROUGH the swirl (window/mask into the logo):**
The dive no longer flies into flat white then shows the toggle after — the swirl is now a
**growing window**: the Stardust/Horizon methods panel is revealed *through* the swirl shape as
it zooms ("you start to see the text masked into the logo"). Mechanics — **desync-safe** because
nothing new scales: the methods panel sits static/full-screen behind the dive canvas, and
`comet-dive.js` masks it with the SAME swirl SVG (`mask-image`), writing `maskSize`/`maskPosition`
each frame from the swirl's OWN per-frame rect (`dw/dh`, `sx/sy` = the same numbers as the
`drawImage`), offset by the methods' live `getBoundingClientRect` (robust whether pinned). A
`reveal` 0→1 (comet.js dive units **70→165**, ease `power2.in`, p≈0.3→0.95) cross-dissolves the
canvas white by `(1 - reveal)` so the white logo dominates first then the toggle emerges through
the growing window; at `reveal≥0.999` the mask auto-clears (`clearMask()`) so the toggle is clean
+ interactive. Early-return + `reveal≤0` both clear the mask (no stuck mask on reverse). Ripple
unchanged (gone by p≈0.84). CDP-verified: forward shows the white swirl → toggle ghosting through
→ growing window → full toggle; mask grows 1944→12040px then clears; stepped reverse/jumps keep
mask state correct (deep=none/op1, before=none/op0, mid=mask/op1); **hard-flick reverse screencast
shows NO big-window-over-tiny-swirl** (swirl shrinks proportionally, scene restores). Knobs:
`reveal` window + ease in `comet.js` `buildCometTimeline`. CSS: `.comet-collab-methods` carries
only `mask-repeat:no-repeat` (image/size/pos written inline by the dive, inert otherwise).

**✅ EARLIER (2026-06-15) — illustrations linger + implode (negative-space fix):** the intro
text and the 5 floating process illustrations used to fade out together in ONE tween, so the
moment the swirl began diving the bottom of the screen emptied (the swirl rests above centre
and drifts down). Now the fade is **split**: text leaves fast (`content` opacity over unit
0→20) while the illustrations **linger ~3× longer** (`#floating-processes` opacity 0→60) AND
**implode toward the swirl** (`#floating-process-group` `scale 1→0.3` 0→60) — filling the
bottom with inward "sucked into the vortex" motion instead of a void. Mechanics: a new
`.floating-process-group` wraps ONLY the 5 images in `index.html` (the `#process-link-canvas`
starline stays a sibling, so scaling the group never resizes the self-healing canvas); the
group's scale pivot is seeded at the on-page swirl point via `setProcessOrigin()` in `comet.js`
(re-seeded on `onRefresh`), using `SWIRL_CX` **now exported from `comet-dive.js`** so the dive
and the implosion can't drift. The dive geometry in `comet-dive.js` was NOT touched. Tune the
durations (20 / 60) and `scale 0.3` live in `comet.js` `buildCometTimeline`. (Re-centring the
resting logo to kill the negative space was rejected — it only trades bottom-space for
top-space and risks top-crop on short mobile.)

> **Full design history + every prior fix:** see `memoedit-comettransition-history.md`.

**✅ FIXED (2026-06-15) — fast-reverse glitch + mobile take-over, via CANVAS REWORK:**
Symptom: on a FAST scroll-up flick a full-screen ripple flashed over a tiny/pixelated swirl
(slow scroll was fine). Root cause (proven via CDP **screencast** — streams the real composited
frames — during a wheel-momentum flick): the swirl was a CSS-transformed `<img>` whose paint
LAGS the instant WebGL ripple on fast scrubs (the ripple being big proved the main-thread scale
was big, yet the painted swirl was small → compositor desync, a class of bug no pulse-timing
tweak can fix). Slow scroll = paint keeps up = fine. lenis.dev avoids it entirely with ONE WebGL
canvas (CDP-confirmed: 1 canvas, no video/scaled img).
Fix: rebuilt the dive as a **2D canvas drawn by the Renderer** (`src/ui/comet-dive.js`) — see
ARCHITECTURE above. The swirl + ripple now come from one `dive.p` painted in the same frame, so
they can't desync at any speed; `drawImage` from a hi-res offscreen raster is crisp at every
scale (no pixelation); and the swirl is positioned from the on-page logo's LIVE
`getBoundingClientRect` each frame, so the take-over aligns on any device (self-corrects mobile
`dvh`/URL-bar). Knobs in `comet-dive.js`: `SWIRL_CX/CY`, `WHITE_OX/OY`, `WHITE_R`, `FILL_MARGIN`
(1.9 = white fully covers early in the warp, no transient corner), `DRIFT_END_P`, pulse window.
Verified: hard-flick reverse screencast (mobile 390×844 + desktop) shows NO big-ripple-over-tiny-
swirl frame; peak = full white; methods reveal clean. Old `<img>`/`swirlStart`/`fillScale`/
`trackBurst`/`SWIRL_SUPER`/`--swirl-super` and the `.comet-zoom-logo` CSS are GONE.

**✅ FIXED (2026-06-13, earlier session) — both issues, CDP-verified:**
1. **On-page logo was missing** — root cause: `white.svg` has a `viewBox` but **no
   `width`/`height` attributes**, and `.comet-collab-intro-logo img` sized it with
   `width:auto; height:auto` + only `max-*` caps → an SVG `<img>` with no intrinsic px size
   resolves to **0×0** (the old PNG had intrinsic dims, so the PNG→SVG swap regressed it).
   This ALSO zeroed `swirlStart`'s `offsetWidth/Height` measurement (it hit the `{0,0}`
   guard → clone parked at page-centre, over the description = symptom 2).
   **Fix:** `comet.css` `.comet-collab-intro-logo img` now sets `width: var(--comet-logo-size);
   height: auto; max-width: none` (the viewBox supplies the ratio). Logo renders 320×150.
2. **Dive started from the wrong spot** — after (1) `swirlStart` measured correctly, but a
   *second* offset remained: the clone scales around `WHITE_ORIGIN '46% 54%'` (off-centre),
   so at the base scale `1/16` that pivot shifts the rendered box ~93px left / ~90px down
   from where `swirlStart` placed it. **Fix:** `swirlStart` now adds an origin-compensation
   term `W·(1-s)·(0.5-originFrac)` (constants `WHITE_OX=0.46`, `WHITE_OY=0.54`). This adjusts
   ONLY the start anchor — the dive still tweens `x,y→0`, so the verified white-fill endpoint
   is untouched. CDP-verified: clone img rect `(560,201,155,150)` == on-page swirl exactly;
   red-tinted overlay sits dead-on the white on-page swirl.

**✅ ALSO FIXED (2026-06-13, ripple + adaptability pass) — CDP-verified mobile+desktop:**
3. **Ripple was off to the side + too small.** `trackBurst` centred the burst on the clone's
   BOX centre, but the dive scales around the off-centre WHITE point — so the ripple sat
   up-right of the swirl while the white filled from the lower-left (disconnected). Fix:
   `trackBurst` now targets the **white-point screen position** (`centre + x/y + box·(originFrac
   −0.5)`, scale-invariant since it's the transform-origin) using cached clone box dims
   (`measureClone`, refreshed in `applyStart`). Drift tween also got `onUpdate: trackBurst`.
4. **Ripple behind the logo:** `.comet-zoom-ripple-canvas` z `2 → 0` (was above the clone;
   now behind it — radiates from behind the swirl, swirl rides on top, white swallows it).
5. **Ripple spills the screen:** `BURST_RIPPLE_FRAG` shockwave `rad ×1.6 → ×3.0` (+ ring
   spacing `0.16 → 0.22`) so the wavefront clears every edge on a tall mobile.
- **Reverse scroll verified clean:** scrolling back up through the window resets portal/clone/
  methods opacity → 0 and on-page logo → 1 (no stuck artifacts), on both desktop + mobile.
- **Adaptability verified:** take-over overlay aligns within ~1px at 390×844 AND 360×640
  (`cloneImgCentre == onPageSwirlCentre`). NOTE: headless has no URL bar — if a real device
  still shows a vertical offset at take-over, it's a `100dvh` vs `vh` pin drift; `onRefresh`
  re-seeds on the URL-bar resize, but the robust fix would be to seed `swirlStart` from the
  logo's LIVE `getBoundingClientRect` during the pre-dive phase (not done — unproven need).

**✅ ALSO FIXED (2026-06-13, scroll-back glitch):** on fast REVERSE scrub the ripple flashed
full-screen over the tiny base swirl ("big ripple + tiny swirl" — impossible in normal scrub).
Root cause (took TWO passes):
- Pass 1 (insufficient): the pulse was a SEPARATE proxy tween from the scale tween, so derive
  pulse from `tl.time()` inside `trackBurst` instead. BUT `trackBurst` was still wired to the
  scale/drift **tween** `onUpdate`s.
- Pass 2 (THE fix): a tween's `onUpdate` only fires while the playhead is **inside that tween's
  range**. A fast reverse scrub jumps from mid-dive to before the dive in ONE render — GSAP sets
  scale→base but the scale tween's `onUpdate` does NOT fire (playhead now outside its range), so
  `trackBurst` never runs and the pulse stays stale/high → full ripple over the base swirl.
  Moved `trackBurst` to the **timeline-level `onUpdate`** (`gsap.timeline({ onUpdate: trackBurst,
  scrollTrigger:{…} })`), which fires on EVERY playhead move regardless of active children, and
  removed the per-tween `onUpdate`s. Now pulse always matches `tl.time()`.
- Passes 1–2 reduced it but it PERSISTED. (Kept the timeline-level `onUpdate` — still correct.)

**✅ ACTUALLY FIXED (2026-06-14) — the real root cause, CDP-proven with wheel-momentum scroll:**
Reproduced via CDP `Input.dispatchMouseEvent` wheel events (drives Lenis's real momentum) +
per-frame logging. The smoking gun: during a scrub, **`tl.time()` runs AHEAD of the child
tweens' actually-rendered values** (GSAP scrub catch-up — `onUpdate` sees the target time while
children are still rendered to an earlier time). Measured on reverse: at `tl.time()=79.6` the
pulse (from tl.time) was 0.43 but the rendered `scale` was 0.31 (== scale at t≈64; `gsap.get
Property` and `getComputedStyle` AGREED, so it's NOT compositor lag). So a `tl.time()`-based
pulse ALWAYS runs ahead of the swirl → big ripple over a small swirl. **Fix: pulse is now
derived from the RENDERED `scale`, not `tl.time()`** — invert the scale tween's `power3.in` ease
(`Math.cbrt`) to recover its linear progress, then apply the same `[PULSE_IN,PULSE_OUT]` window.
The rendered scale is the swirl's ground truth, so the ripple can't desync from it in either
direction or at any scrub speed. Extracted `SCALE_BASE`/`DIVE_START=22`/`DIVE_DUR=150` shared by
the tween + `trackBurst` (cbrt ASSUMES `power3.in` — change both if the ease changes).
- **CDP-proven:** wheel-momentum forward+reverse, per-frame `|pulse − expPulseFromScale|` = **0**
  across all dive frames; a big pulse (0.5) now requires `scale≈1.0` (swirl filling the screen
  ~3.7×). Big-ripple-over-tiny-swirl is mathematically impossible. Forward feel unchanged (when
  synced, recovered unit == tl.time). Reverse-to-rest still resets clean.

**Minor / pre-existing (NOT addressed — out of scope):** at the forced peak on a landscape
viewport a tiny black sliver remains in the far top-right corner (the `fillScale` margin
`1.4` vs the off-centre white point). Bump the margin if it ever shows at scrub speed.

**Key files & how it works (CURRENT — canvas architecture):**
- `src/ui/comet-dive.js` → `createCometDive(canvasId, burst)` owns ALL the dive VISUALS + math.
  Rasterizes `comet-mark-white.svg` once to a hi-res offscreen (`RASTER_H=2048`); `draw()` (a
  Renderer layer) reads `{p, appear, logoRect}` and `drawImage`s the swirl at the current
  centre+scale, masks the methods panel with the SAME holey swirl SVG (`MASK_URL`), then drives the
  burst (`setCenter`/`setPulse`) from the SAME `p`. (The toggle's pill+text are gated separately in
  `comet.js` so they don't get sliced by the mask — see the TOGGLE-FLICKER entry.) Knobs:
  `SWIRL_CX=0.2415`/`SWIRL_CY=0.5` (swirl spot in the on-page logo), `WHITE_OX=0.46`/`WHITE_OY=0.54`
  (white point = scale pivot), `WHITE_R=0.041`, `FILL_MARGIN=1.9` (white covers early in the warp),
  `DRIFT_END_P=0.75` (white point reaches centre), `PULSE_IN_P/PULSE_SPAN_P` (ripple window),
  `power3.in` ease (`p*p*p`).
- `src/sections/comet.js` → `buildCometTimeline(cometDive)` owns ONLY the timeline: tweens
  `dive.p` 0→1 (linear) + `dive.appear` (take-over fade) + portal/logo/methods opacity, and on
  `onUpdate` calls `cometDive.setState({p, appear, logoRect:liveRect})`. No transform math here.
- `src/styles/comet.css` → `.comet-zoom-portal` (z60) + `.comet-zoom-ripple-canvas` (z0) +
  `.comet-zoom-swirl-canvas` (z1). Both canvases full-viewport; content drawn in canvas space
  (NOT CSS transform — that's the whole point).
- `index.html` → `.comet-zoom-portal` holds TWO canvases (`#comet-zoom-ripple-canvas` +
  `#comet-zoom-swirl-canvas`). On-page logo `#comet-collab-intro-logo` = `white.svg`.
- `src/webgl/burst-ripple.js` + `shaders/intro-frag.js` (`BURST_RIPPLE_FRAG`) — transparent
  muse-spectrum ripple (unchanged); `main.js` creates `cometRipple` + `cometDive` (added as
  Renderer layers, dive BEFORE ripple so the ripple renders with fresh state), passes
  `cometDive` to `initComet`.

**Assets** (`public/assets/images/comet-collabs/`): `white.svg` = full logo (swirl+text) used
on-page; `comet-mark-white.svg` = swirl-only crop (viewBox 0 0 255 247) rasterised by comet-dive.

**Run / verify:** `npm run dev` → localhost:5173 (`--host` for phone on the LAN). Lenis
virtualizes scroll, so drive headless Chrome via CDP. KEY tool for the fast-scroll bug:
`Page.startScreencast` (streams the real COMPOSITED frames during a wheel-momentum flick —
`Input.dispatchMouseEvent type:mouseWheel` drives Lenis's real momentum). Settled screenshots
MISS the transient; the screencast catches it. Scripts in `/tmp/cdp-screencast*.mjs`. Smallest
JPEG ≈ flattest frame = the white-fill peak.

**Sequence (current):** on-page logo (white.svg) → text fades, swirl clone takes over (exact
overlay) → flies into the white point, scaling ~11× until white fills (no veil) while
drifting to centre, burst tracking it → methods set opaque UNDER the full white → portal
fades (white→white) → toggle.
