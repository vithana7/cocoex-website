# Comet → Toggle dive — full fix history

> Archived from memoedit-comettransition.md (active doc keeps only the START HERE state).

# Comet Intro -> Toggle: Lenis-style Zoom Transition (history)

Goal: replace the flat black->white **cross-fade** between the Comet Collab intro
(dark over starfield) and the Methods/Toggle panel (offwhite) with a **zoom-into-the-
logo portal** reveal, in the spirit of lenis.dev's "enter Lenis" beat.

**Focal point = the white Comet Collab logo** (`#comet-collab-intro-logo`). We fly INTO
the logo; the logo is white, so it doubles as the seed of the white fill that becomes
the Methods panel.

---

## 1. What lenis.dev does (from the screenshots)

A **scroll-driven camera push into a focal point**, not a fade:
1. A focal element sits centered and stays put — the "fly into here" anchor.
2. A **white shape grows from that point outward**, swallowing the black scene from the
   middle until it fills the viewport (corners last).
3. The black scene **rushes past / scales up and out** — the "flying forward" feel.
4. End state: full white = the next light section, revealed *through* the portal.

Net: white opening from a center point + dark scene dollying out, scrubbed to scroll.
Geometric (scale), not opacity. **Our anchor is the white comet logo.**

---

## 2. Current transition (being replaced)

`src/sections/comet.js` `buildCometTimeline()`:
- intro panel: `opacity 1->0` over `bottom-=100vh -> bottom` of `.comet-panel-intro`.
- methods panel: `opacity 0->1` over `top -> top+100vh` of `.comet-panel-tabs`.

Handoff straddles the **200vh boundary** between the two sticky panels. Methods
(`.comet-collab-methods`) is offwhite, `opacity:0`, sticky. Intro is transparent over the
starfield (reads black). The logo (`#comet-collab-intro-logo`) sits in the intro's flex
column, slightly above viewport center. That boundary is where the portal opens.

---

## 3. Recommended — camera PUSH-IN on the whole scene, aimed at the logo

The idea: the intro's **foreground elements** (logo + text + floating processes)
**scale up together** as one, with the `transform-origin` pinned to the **logo's
center**. That single detail is what makes it read as the camera *flying into the logo*
rather than into the middle of the screen — the logo enlarges to fill the frame while
everything around it rushes off past the edges. The logo is white, so the frame goes
white -> then the toggle section fades in.

**The starfield is deliberately NOT scaled.** It's the global, fixed
`#unified-starfield-canvas` (gated to `comet`), which already lives OUTSIDE the comet
intro DOM — the intro panel is transparent over it. So wrapping only the foreground in
`#comet-scene` leaves the stars completely untouched (no pixelated stars zooming at the
camera). The growing white disc simply covers the static starfield at the end.

One catch: a PNG scaled big enough to fill the screen turns blurry/pixelated. So right
near the end a **clean offwhite disc** (seeded at the same logo point) crossfades in to
give a crisp full white *over* the over-enlarged logo, before the toggle reveals. Push-in
= the cinematic dive; disc = the clean white hand-off.

Three coordinated, scroll-scrubbed layers (all `transform: scale`, composited — no
`clip-path`, no per-frame paint):

### A. Markup
```html
<!-- (a) wrap ONLY the foreground in a scaling "camera" layer.
        The starfield (#unified-starfield-canvas) is global/fixed and stays OUTSIDE
        this wrapper, so the stars never scale or pixelate. -->
<section class="comet-collab-intro" id="comet-collab-intro" ...>
  <div class="comet-scene" id="comet-scene">   <!-- logo + copy (+ processes?) push in -->
    ...comet logo + intro copy (+ floating-processes, see Q2) ...
  </div>
</section>

<!-- (b) the clean white fill, seeded at the logo center -->
<div class="comet-zoom-portal" aria-hidden="true">
  <span class="comet-zoom-disc"></span>
</div>
```

### B. CSS sketch (-> comet.css)
```css
.comet-scene{
  width:100%; height:100%;
  transform-origin:var(--zoom-x,50%) var(--zoom-y,50%);  /* the LOGO center */
  transform:scale(1); will-change:transform;
}
.comet-zoom-portal{
  position:fixed; inset:0; z-index:40;     /* above intro(5), below methods content(50) */
  pointer-events:none; opacity:0;          /* JS toggles on only during the window */
}
.comet-zoom-disc{
  position:absolute;
  left:var(--zoom-x,50%); top:var(--zoom-y,50%);   /* same logo point */
  width:100vmax; height:100vmax; margin:-50vmax 0 0 -50vmax;
  border-radius:50%;
  background:var(--color-offwhite);
  transform:scale(0); will-change:transform;
}
```
JS sets `--zoom-x/--zoom-y` from `#comet-collab-intro-logo`'s `getBoundingClientRect()`
center on init + on resize/`ScrollTrigger.refresh` — used by BOTH the scene's
`transform-origin` and the disc's position, so the push and the fill share one focal
point. (Note: the floating-processes read live rects for the starline; verify the scene
scale doesn't fight that — if it does, leave processes outside `.comet-scene` and just
fade them.)

### C. Scroll wiring (replace the two fade tweens)
Scrub over the **last 100vh of `.comet-panel-intro`** (`bottom-=100vh -> bottom`).
Convert vh->px per the **vh-as-px trap** (`vhToPx()` / function-form start/end +
`invalidateOnRefresh`):

- **scene** (`#comet-scene`): `scale 1 -> ~14`, `ease:'none'` (linear = constant dolly
  speed). Origin = logo center, so the logo grows into the frame and the text/processes
  fly outward off the edges. Optionally fade the scene `opacity 1 -> 0` over the last
  ~30% so the blurry over-scaled logo dissolves under the disc.
- **disc**: `scale 0 -> 1.05` (overshoot clears the corners), starting ~50% into the
  window (once the logo already dominates the frame) so the crisp white takes over just
  as the PNG would start to blur.
- **methods** (`.comet-collab-methods`): `opacity -> 1` to complete **before** the disc
  fully fills (~75% in) so the toggle is painted under the white at full coverage; then
  fade `.comet-zoom-portal` `opacity -> 0` at the very end (same offwhite -> no seam) and
  the toggle is simply *there*.
- Gate `.comet-zoom-portal` opacity on at window start / off at end
  (`onEnter`/`onLeaveBack`) so the fixed disc never covers anything outside the window.

### D. Reduced motion / safety
- `prefers-reduced-motion`: skip the push-in + disc -> keep the current opacity
  cross-fade. Branch in JS on the media query.
- Perf: composited `transform:scale` only; no `clip-path`, no `shadowBlur`. Watch GPU
  memory — scaling a layer to 14x is fine as long as it stays a transform (don't trigger
  layout). Keep `will-change:transform` and remove it after the beat if it lingers.
- z-index: portal `40` above intro/starfield; methods content (`50`) above it -> toggle
  stays interactive once revealed.

---

## 4. Alternative (simpler, costlier) — `clip-path: circle()` at the logo
Keep methods `opacity:1`, scrub `clip-path: circle(0% at var(--zoom-x) var(--zoom-y)) ->
circle(75% ...)`. Fewer elements but repaints per frame. Use only if the disc stacking
proves fiddly.

---

## 5. Timeline impact (timeline.js)
- No new phase required — fits the existing `comet.introHold`(100)/`comet.methodsIn`(100)
  handoff at the 200vh boundary.
- If the dive feels rushed, bump `comet.introHold` by ~50-100vh (one `PHASES` number;
  heights recascade). Don't hardcode vh in the tweens.

## IMPLEMENTED (2026-06-13) — what actually shipped + why it differs from §3

Critique during build killed the "scale the in-flow `#comet-scene`" idea: the intro panel
is **200vh with a 100vh sticky child**, so during the transition window the intro is
**un-sticking and scrolling up**. A fixed `transform-origin` on a scrolling element makes
the focal point drift upward — the dive smears up-and-off. Also found comet.js's existing
tweens used **raw `vh` strings = the vh-as-px bug** (near-instant fades).

**Final approach — a `position:fixed` portal layer (immune to the sticky scroll-away):**
- `index.html`: `.comet-zoom-portal` (fixed) inside `.comet-collab-wrapper`, holding
  `.comet-zoom-disc` (z0, BEHIND), `.comet-zoom-logo` clone (z1), `.comet-zoom-ripple` (z2).
- `comet.css`: portal `z-index:60` (above methods z50 so the white covers the toggle,
  then fades to "develop" it out). Disc = soft offwhite **radial bloom** (not a hard dot),
  grows from BEHIND the logo so the white reads as coming THROUGH the logo's own white.
- `comet.js` `buildCometTimeline`: one scrubbed GSAP timeline, window **80vh→275vh** into
  comet (1 unit == 1vh), `vhToPx()` per the vh-as-px trap, `onRefresh: setFocal`.
  - `setFocal()` seeds `--zoom-x/--zoom-y` from the logo's `offsetLeft/Top` (scroll-
    independent layout center == its resting viewport center while pinned).
  - **Clean crossfade swap** real logo→fixed clone over 6vh (identical image, same spot)
    → removes the "ghost original behind the one flying forward".
  - Clone scale 1→**9** (capped to limit raster pixelation), dissolves into the white-out.
  - **White-out = uniform `.comet-zoom-fill` veil (opacity-only), NOT a radial disc.** A
    radial bloom concentrated a bright centre dot AND showed a hard circular edge mid-grow
    (both rejected). Flat offwhite veil fading in = no circle, no hotspot.
  - **Sequenced** so it reads as logic, not mush: burst swells+fades FIRST (peak ~unit85),
    THEN the white-out completes (unit95→150), methods in under it (unit120, panel pins),
    portal out last (unit165).
  - Burst shader's **white core flash removed** (it was a second centre dot at this focal).
- **Ripple = the real intro "constellation burst"** (NOT a CSS ring — that read as an
  unwanted circle outline). Reused `INTRO_FRAG`'s `u_pulse` muse-spectrum shockwave as a
  standalone transparent shader `BURST_RIPPLE_FRAG` (+ `u_center`), new surface
  `createBurstRipple` (`src/webgl/burst-ripple.js`), registered as a `comet`-gated Renderer
  layer, canvas `#comet-zoom-ripple-canvas` inside the portal (z2). comet.js drives a
  `pulse` proxy 0→1 across the dive (`setPulse`) and `setCenter` to the logo's uv focal.
  6 WebGL contexts now (under Safari's 8).
- Reduced-motion / missing markup → plain cross-fade fallback (the zoom is never built).

### Open / needs you
- **Hi-def or vector logo** (BLOCKING the pixelation fix): current is `1545×833` PNG,
  displayed ~320px, scaled ~9× → upscales past native. **SVG ideal** (infinite crisp), or
  a ≥4000px-wide transparent PNG. Drop it in `public/assets/images/comet-collabs/` and tell
  me the filename; I'll swap it in and can raise the dive scale for a punchier push.
- Timing/feel is best tuned live — tell me what's off (dive speed, when white takes over,
  ripple strength) and I'll nudge the unit positions in the timeline.

## 6. Open questions (superseded by IMPLEMENTED above)
- Push-in scale: ~14 (punchy dive) vs lower (gentler glide)? And where the disc takes
  over (~50%)?
- Floating processes inside `.comet-scene` (they dolly out with the camera) or left
  outside and just faded (safer for the live-rect starline)?
- Focal point exactly at the logo center (logo sits a bit above viewport center, so the
  dive is slightly off-axis — usually feels MORE cinematic) vs. nudged to true center?

---

# FIX PLAN v2 — mobile progression issues (2026-06-13) — PLAN ONLY, do not implement yet

Reviewed 5 mobile screenshots of the live transition (early dive -> rising white ->
washing out -> pure white -> revealed toggle). Below is the diagnosis (root-caused, not
guessed) and the fix approach. Numbers reference the current timeline in `comet.js`
(window 80vh->275vh into comet; position p == scrollY 80+p vh):
  logo scale 0->130 (80->210vh) | logo opacity 100->150 (180->230) | pulse 20->150
  (100->230) | veil 95->150 (175->230) | methods 120->165 (200->245) | portal 165->195
  (245->275).

## Observed → root cause

### A. The logo "goes sideways" instead of diving straight in  ← THE BIG ONE
`comet-collabs-logo-white.png` is **1545×833 (ratio 1.85) — a WIDE image: the swirl mark
on the LEFT + "Comet Collab." cursive on the RIGHT**. The clone scales around the IMAGE
centre (which sits BETWEEN the swirl and the text), so the swirl flies off to the left
and the text flies off to the right — it reads as the logo splitting/sliding sideways,
not a focused dive into the comet mark.
- Fix options:
  - (i) **Dive into the SWIRL only** — use a swirl-only asset for the clone (ideally the
    vector you'll provide: just the comet mark, no text), centred + scaled on the swirl.
    Cleanest; also fixes pixelation. **Recommended.**
  - (ii) Keep the wide logo but set the clone's `transform-origin` to the swirl's location
    inside the image (~20–25% from the left) so the swirl stays put as the focus (text
    still slides off). Hacky stopgap.
  - (iii) Crossfade the wide logo → a swirl-only mark at dive start, then dive the mark.

### B. Burst ripple "not centered" + "circle stops cropped on top" (mobile)
`burst.setCenter` is fed the **logo's centre**, which on mobile sits HIGH (the logo is in
the upper third) and at the wide-image centre. So the shockwave emanates from a high
point → the upper rings run off the top edge (cropped) and it doesn't feel centred.
- Fix options:
  - (i) Centre the burst on the **viewport centre (0.5,0.5)** → symmetric, never cropped.
    Decoupled from the logo. Simple + robust. **Recommended** unless the burst must stay
    locked to the dive point.
  - (ii) Keep it on the dive focal but CLAMP toward centre on tall viewports so it can't
    crop.

### C. White overlay mis-timed — "should happen as the logo gets closer"
The veil fades in 175->230vh on a fixed schedule, independent of the logo's approach. It
should ramp with the logo getting big/close and complete when the logo is "in your face".
- Fix: tie the veil ramp to the BACK HALF of the logo-scale (start the veil only once the
  logo is large — ~scale ≥6 — and complete it as the logo reaches max/closest, ~210vh).
  i.e. white arrives *because* the logo is bearing down, not on a separate clock.

### D. Toggle text appears → disappears → reappears  (the flicker)
Precise cause: methods opacity tweens **200->245vh**, but the veil only reaches FULL
opacity at **230vh**. So:
- 200->230: methods fades in UNDER a still-translucent veil → text visible (shots 2–3).
- 230->245: veil fully opaque → text hidden (shot 4, pure white).
- 245->275: portal fades out → text reappears (shot 5).
That double-appearance is the bug.
- Fix: methods must become visible ONLY by the veil LIFTING — never seen through a partial
  veil. So gate the methods reveal entirely INSIDE the fully-opaque-veil window:
  - keep methods opacity 0 until the veil is fully opaque (~230vh),
  - bring methods to opacity 1 while the veil still fully covers it (or just set it 1
    instantly behind the opaque veil),
  - THEN fade the portal/veil out to reveal. Single, clean appearance.

### E. Pixelation (carried over)
Wide raster scaled ~9×. A **swirl-only vector** (fix A-i) solves the sideways problem AND
the pixelation in one asset.

## Proposed retimed sequence (illustrative — tune live)
1. Dive: swirl scales 1→N, accelerating, straight in (focal = swirl).
2. Burst: swells + fades, peak mid-dive, **screen-centred** (or clamped) so it never crops.
3. Veil: holds at 0 until the swirl is big, then ramps to full **as the swirl reaches
   closest** (white because the logo is bearing down).
4. Methods: opacity 0 until the veil is fully opaque; then to 1 fully under the white.
5. Portal/veil: fades out LAST → toggle revealed once. No flicker.

## Questions (please answer before implementing)
1. **Dive target:** into the SWIRL mark only (recommended), or the whole wide logo?
2. **Asset:** can you provide the **swirl-only** comet mark as **SVG** (or ≥2000px
   transparent PNG)? It fixes both the sideways slide and the pixelation.
3. **Burst centre:** lock it to the dive/swirl point, or just **screen-centred** (never
   crops, symmetric)?
4. **Burst lifespan:** fully fade the muse rings BEFORE the white-out, or let them carry
   into the white as it fills?

## DECISIONS (answered 2026-06-13) — locked
1. Dive target = **the swirl mark only**.
2. Asset = **swirl-only SVG** (user providing). → razor-crisp, can push dive deeper.
3. Burst centre = **locked to the swirl**, but **clamped on tall screens** so it can't crop.
4. Burst lifespan = **carry into the white** (rings still fading as the veil fills → muse
   tint briefly washes the white-out).

### Asset drop
- Put the SVG at `public/assets/images/comet-collabs/comet-swirl-white.svg`
  (WHITE fill — it dives on the dark scene; it naturally dissolves once the white veil
  fills, so white-on-white disappearing is fine/desired).
- If easier, a ≥2000px transparent PNG `comet-swirl-white.png` works too.

### Concrete implementation steps (once the SVG lands)
1. **Clone = swirl SVG.** Swap the `.comet-zoom-logo` `<img>` to the swirl asset. Keep the
   full wide logo in the *intro* (unchanged) — only the DIVE clone is swirl-only.
2. **Swirl focal.** Measure the swirl's bbox fraction inside the wide 1545×833 logo
   (swirl ≈ left ~0–45%, centre x ≈ 0.21–0.23, vertical centre). Seed the clone position
   + scale-origin + `--zoom-x/--zoom-y` from `logoRect.left + width*SWIRL_CX_FRAC`,
   `top + height*0.5`, and size the clone to the swirl's displayed size so the swap from
   the real logo's swirl is aligned (text just fades).
3. **Burst centre = swirl focal**, but clamp uv toward centre on tall viewports (e.g.
   clamp uv_y into ~[0.4,0.6], or blend toward 0.5 by an aspect factor) so the upper rings
   never crop. Fix the `setCenter(... 1 - cy/innerHeight)` feed accordingly.
4. **Veil tied to proximity (C).** Hold veil at 0 until the swirl is big (~scale ≥6), ramp
   to full AS the swirl reaches closest (~end of the scale tween). White arrives because
   the logo bears down.
5. **Flicker fix (D).** Methods opacity stays 0 until the veil is FULLY opaque; bring it to
   1 entirely under the opaque veil (or set 1 instantly behind it); portal/veil fades out
   LAST to reveal. One appearance only.
6. **Burst carries into white (4).** Keep the pulse fading through the veil ramp so rings
   tint the white briefly; no hard cut.
7. Can raise the dive scale now that it's vector (no pixelation cap).

### Open (not blocking the plan)
- Exact `SWIRL_CX_FRAC` / swirl bbox — I'll measure from the asset when it lands.
- Final timing numbers — tuned live after the structural fixes.

## IMPLEMENTED v2 (2026-06-13) — built, pending live tune
- **Asset reality check:** the dropped `comet-swirl-white.svg` (and `white.svg`) were the
  FULL logo (swirl+text), not swirl-only — and the first rendered BLACK (no fill). Derived
  `comet-mark-white.svg` = `white.svg` with viewBox cropped to `0 0 255 247.28` (text
  clipped out), keeping its `.cls-1{fill:#fff}` white. Verified by headless render (clean
  white swirl, no text). The intro keeps the wide logo; only the DIVE clone is the mark.
- Clone `<img>` → `comet-mark-white.svg`, sized by `--swirl-h` (= intro logo height).
- `setFocal`: swirl focal = wide-logo rect * `SWIRL_CX=0.235`, `SWIRL_CY=0.5` (TUNABLE);
  burst centre = same point but CLAMPED uv to [0.38,0.62]x / [0.40,0.60]y so tall screens
  don't crop the top rings.
- Dive scale → 16 (vector, no pixel cap). Veil ramp moved to unit120→160 (200→240vh) =
  tied to the swirl bearing down. Burst pulse 95→240vh carries into the white.
- **Flicker fixed:** methods opacity 0 until the veil is FULLY opaque (unit160), fades to 1
  under the white (160→172), THEN portal fades out (172→195) to reveal. Single appearance.
- TUNE LIVE: `SWIRL_CX/CY` (swirl alignment), `--swirl-h` factor (clone size vs intro
  swirl), dive scale, veil/pulse timing. transformOrigin is centre — may nudge toward the
  spiral eye if the dive doesn't aim dead-on.

## AUDIT FIX (2026-06-13) — "only the ripple shows, no diving swirl"
Root-caused via live CDP audit (headless Chrome driving the dev page), NOT assumed:
  swirlHVar="0px", imgRendered="0px x 0px", logoElOffset="0x0".
**Cause:** the clone was sized/anchored from `#comet-collab-intro-logo`, but that logo had
`loading="lazy"` and is far below the fold, so at boot it measured **0×0** → `--swirl-h`=0
→ the swirl rendered at 0×0 (invisible). The ripple is independent of it, so it was the
only thing visible. (Also verified a transparent-cleared WebGL canvas composites
transparently, ruling OUT the "opaque ripple canvas" theory first.)
**Fix (3 parts):**
1. Clone SIZE is now pure CSS — `height: calc(var(--comet-logo-size) * 0.5)` (= the intro
   swirl's height since the wide logo's max-height binds). No runtime measurement → never 0.
2. Removed `loading="lazy"` from the intro logo so it lays out (the focal still measures it).
3. `setFocal` guards `if(!lw||!lh) return`, recomputes on `requestAnimationFrame` + the
   logo's `load` event → focal anchors to real dimensions, never a 0×0 element.
Re-audited: imgRendered=92.8×90px, focal sane, forced-mid-dive screenshot shows the crisp
white swirl at the focal. Build green.

## PIXELATION FIX (2026-06-13) — "why is it still pixelated?"
Switching the clone to SVG did NOT fix pixelation because **`transform: scale()` on an
`<img>` scales the rasterised BITMAP, not the vector** — an SVG `<img>` is rasterised once
at its CSS size (~93px) then `scale(16)` upscales that 93px bitmap, same as a PNG.
**Fix (render big, scale down):** clone CSS height = `comet-logo-size*0.5 * --swirl-super`
(16×) so the SVG rasterises at hi-res (~1440px); the dive then transform-scales it
`1/16 → 1`, i.e. only ever DOWNscaling the bitmap → crisp at the peak. Removed the
clone's drop-shadow (huge filter region at 16× + filters can re-introduce raster blur).
Verified via CDP: clone height 1440px, base scale 0.0625, forced-dive screenshot shows
smooth crisp edges. `SWIRL_SUPER` (comet.js) is the quality/memory knob.

## REDESIGN v3 (2026-06-13) — centred Lenis-style dive (stops-halfway + angle fix)
Per user + lenis.dev reference: symbol takes over, centres, then an EVEN zoom into white.
- **Centred**: clone anchored at page centre (CSS left/top:50%). On scroll it SLIDES from
  the wide logo's swirl (x/y offset -> 0) while the wide logo (text) fades = "symbol pushes
  the text out and centres". Subsequent zoom is symmetric → no angle, no crop. Burst also
  centred (0.5,0.5), no clamp needed.
- **"Stops halfway" fixed**: the scale tween now runs THROUGH the white-out (scale ends
  exactly when the veil fills, unit165), so it never finishes-then-whites. The swirl stays
  white and MERGES into the veil (white-on-white) instead of vanishing early.
- Pixelation fix (v2) retained: hi-res raster, scale 1/16 -> 1.
- Flicker fix retained: methods only revealed under fully-opaque white, then portal lifts.
- Verified via CDP: forced centred mid-zoom shows the crisp swirl dead-centre.
- TUNE: SWIRL_CX/CY (start-slide origin), SWIRL_SUPER (crisp/mem), and the unit timings.

## REFINE v4 (2026-06-13) — drift-to-centre + exact size match (user answers)
User clarified: (1) don't pre-slide to dead-centre — keep its height and let the CAMERA
drift correct the centring during the zoom; (2) the clone must START exactly the on-page
swirl's size (no pop), reading as the on-page swirl itself zooming.
- **Drift-to-centre:** removed the pre-slide beat. The clone starts at the swirl's spot
  (swirlStart x/y) and during the zoom BOTH scales (power2.in) AND drifts x/y→0
  (power1.inOut) — centred by the time it fills the screen.
- **Exact size match:** added `SWIRL_FIT = 0.855` (CSS `--swirl-fit`). MEASURED: cropped-SVG
  swirl glyph fills ~0.997 of its box but the wide-logo swirl glyph is ~0.85 of the logo
  box, so the clone was ~17% too big; ×0.855 matches. Verified via CDP: clone apparent
  height 76.9px vs on-page swirl glyph 76.5px (was a 17% pop). Tunable live.

## REDESIGN v5 (2026-06-13) — vector logo, unified burst, true "into the white"
User audit: both swirls showed, symbol mismatched, ripple not unified, and the white was a
veil fade (grey). Fixes (answers: vector logo + zoom INTO the swirl's white):
- **On-page logo -> white.svg** (same vector artwork the clone is cropped from): the clone
  overlays the on-page swirl EXACTLY (SWIRL_CX=0.2415, clone height = logo height). No
  two-swirls, exact size.
- **Squish bug fixed:** global `img{max-width:100%}` was capping the hi-res clone WIDTH (not
  height) -> tall-narrow squish. Added `max-width:none` + explicit width. CDP-verified clone
  2473x2395 (ratio 1.03), crisp.
- **Unified burst:** `trackBurst()` sets the burst centre to the swirl's LIVE screen position
  each frame, so ripple + symbol move as one (was locked at 0.5,0.5).
- **True into-the-white (no veil):** removed `.comet-zoom-fill`. The camera flies into a
  measured thick WHITE point of the swirl (origin 46% 54%, white-radius ~4%) and scales DEEP
  (`fillScale()`, ~11x) until that white fills the viewport DIAGONAL. CDP-verified: peak =
  centre + all 4 corners pure white, from the swirl alone. power3.in = fast warp into white.
  Toggle revealed by setting methods opaque UNDER the full white, then portal fades (white->
  white, no grey).
- TUNE: WHITE_ORIGIN / WHITE_R (white point), fillScale margin (1.4), SWIRL_SUPER (crisp/mem),
  timings. Thin line-art => deep zoom is inherent.
