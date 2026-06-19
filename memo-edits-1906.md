# memo-edits-1906 — Safari/cross-browser fixes

Branch `memo-edits-1906`. Vanilla HTML/CSS/JS + Vite + GSAP/Lenis + WebGL. All changes below are in
the working tree (UNCOMMITTED). Don't commit unless asked. Test on real iOS Safari (the remaining
items are device-specific): `npm run dev -- --host`, open from the phone at the printed Network URL,
add `?debug` for the diagnostic overlay.

## Status

| Issue | State | Fix / file |
|---|---|---|
| 3 — constellation missing on full scroll-up (cross-browser) | ✅ confirmed | `drawExplosion(1)` repaint in `setIntroVisible` — `src/sections/intro.js` |
| 2a — muse logo switched too EARLY on iOS (timing offset) | ✅ confirmed (Δ 196→0) | `vhToPx` measures the CSS `vh` unit via a probe instead of `window.innerHeight` — `src/scroll/timeline.js` |
| 2b — muse logo LAGGED the scroll (Safari) | ✅ confirmed | removed the blurred `drop-shadow` from the muse logos + `transform: translateZ(0)` — `src/styles/muse.css` |
| 5 — popup symbol outline on first open (Safari) | ✅ confirmed | preload + `img.decode()` all 7 symbols in `setMuses` — `src/ui/muse-popup.js` |
| 1 — muse intro top-heavy on mobile | ✅ confirmed | shift copy block down at ≤768px — `src/styles/responsive.css` |
| 6 — muse logo soft glow (Safari scrub-lag) | ✅ confirmed (lag gone; glow left soft) | glow BAKED into PNG assets, `filter: none` — `index.html` + `src/styles/muse.css` (see Remaining work) |
| 4 — orbit froze while scrolling | ◑ accepted | removed the `touchstart` pause — `src/sections/muse.js`. Slow drag: orbit drifts (rAF runs). Fast fling: iOS throttles rAF → orbit pauses, resumes on stop. Unavoidable while keeping native scroll. |

## Root-cause notes (Safari)

- **2a (offset):** iOS CSS `vh` = the *large* (stable) viewport; `window.innerHeight` = the *dynamic*
  one (shrinks under the URL bar). Section heights are written in CSS `vh`, so the scroll math must
  use the same unit. `vhToPx` now measures a `100vh` probe (re-measured in `applyHeightsToCss`).
  Confirmed via `?debug`: `panel Δ` went 196 → 0 on Safari.
- **2b (lag):** with the offset fixed (Δ=0) and rAF running during scroll (frames climb), the
  scrubbed opacity *value* was correct — but Safari re-rasterises a **blurred `drop-shadow`** every
  opacity frame when the element isn't on its own GPU layer, so the *filtered logo* rendered behind
  the scroll. The intro text (no filter) never lagged. Removing the blur (and promoting the layer
  with `translateZ(0)`) fixed it.

## Decisions

- **Keep native mobile scroll feel** — no Lenis `syncTouch`. (Trade-off accepted: orbit pauses during
  a fast momentum fling on iOS; that's the platform throttling rAF, only `syncTouch` could beat it.)
- **Keep the `?debug` diagnostic scaffolding** — inert without `?debug`, reusable for future device bugs.

## Diagnostic scaffolding (kept)

- `src/dev/viewport-debug.js` + import in `src/main.js` — `?debug`-gated overlay (panel Δ, vh unit,
  rAF frames, scroll, muse offsets).
- `Renderer.frames` counter in `src/webgl/renderer.js` — one increment per rAF tick.

## Remaining work

- ✅ **Muse logo soft glow re-added (BAKED into PNG assets).** The CSS-filter route was retried first
      (`drop-shadow` + `translateZ(0)` layer promotion) and **lagged again on device** — Safari
      re-rasterises the blurred filter every opacity-scrub frame even when the element is layer-promoted.
      So the **fallback was taken: the glow is baked into the assets**, awaiting device retest:
      - New assets `public/assets/images/muse/muse_logo_white_glow.png` + `muse_logo_black_glow.png`
        (generated from `muse_logo_black.png` via PIL — see the bake recipe below). The original logo
        FILLS its frame (zero transparent margin), so the halo needs room: baked onto an expanded,
        **symmetric-padded** canvas (factor **f = 1.25**, ~12.5%/side, aspect preserved → glyph stays
        centred under the parent's `translate(-50%,-50%)`). White asset is genuinely white (replaces the
        old `brightness(0) invert(1)` recolour) with a `rgba(255,255,255,0.30)` halo; black asset carries
        a `rgba(0,0,0,0.20)` halo. Glow: gaussian `sigma ≈ 3% of width`, downward `offset ≈ 1.5% of
        height` (mirrors the old `0 8px 16px`). Final assets downsampled to **1600px** wide (2× the
        max display need: 300px glyph × 1.25 × 2 DPR ≈ 750px) to keep file size sane.
      - `index.html`: both `#muse-logo-white` / `#muse-logo-black` `src` → the `*_glow.png` files.
      - `src/styles/muse.css`: `.muse-logo-white` + `.muse-logo-black` → **`filter: none`** (NO runtime
        filter — that's the whole point); `.muse-logo-image { width: calc(var(--muse-logo-size) * 1.25) }`
        to compensate the baked padding so the glyph renders at `--muse-logo-size`. `translateZ(0)` +
        `will-change` kept (harmless, stable layer).
      - **Device result (2026-06-19):** no more scroll-lag ✅ (the whole point — plain bitmap now). The
        glow itself reads as ~invisible on iOS Safari (the baked halo is soft + a white glow on black
        barely registers on a phone); user is fine with it ("peanuts"), so left soft. To make it
        visible later, just RE-BAKE with a stronger alpha (white 0.30→~0.55) and a wider sigma — no
        code change, the assets keep their names.

### Bake recipe (to regenerate the glow PNGs)
PIL only (no ImageMagick on this machine; `sips` can't blur). From repo root:
- load `muse_logo_black.png` (RGBA, 2877×2634, content fills the frame edge-to-edge);
- expand to a symmetric-padded canvas at `f = 1.25` (must match the CSS `calc(... * 1.25)`);
- glow = source alpha → coloured silhouette (`white@0.30` / `black@0.20`), offset down `~1.5%·H`,
  `GaussianBlur(sigma ≈ 3%·W)`, composited UNDER the crisp glyph (white = white-recoloured, black = source);
- save, then resize the final composite to **1600px** wide (LANCZOS). **If you change `f`, update the
  CSS `calc()` multiplier to match.**
- [x] Confirm Issue 1 spacing + Issue 5 first-open clean on device. ✅ both confirmed 2026-06-19.
- [ ] Run `/doc-minder` to fold everything into CLAUDE.md.
