# Muse Popup — Redesign Plan (Section 3.5)

Planning doc for reworking the muse popup. Code refs below are ground truth.

- **Markup:** `index.html:212–237`
- **Logic:** `src/ui/muse-popup.js`
- **Styles:** `src/styles/muse.css` (`.muse-popup*`, `.muse-card*` — lines 225–510, incl. `@keyframes float-particle`/`fade-hint`)
- **Invocation:** `src/sections/muse.js:80–108` (`attachHandlers` → `MusePopup.open(title, desc, color, img)`)

---

## 1. Current state (proofed)

Layout, top → bottom inside `.muse-popup-content` (flex column, `gap: clamp(1.5rem,4vw,3rem)`):
1. `.muse-popup-title` (`#muse-popup-title`) — **`display:none`, unused.**
2. `.muse-card-wrapper` → colored circle (`.muse-card-inside` radial gradient of `--muse-color`) holding the symbol img (`#muse-popup-img`, 70% of card).
3. `.muse-popup-cause` (`#muse-popup-cause`) — shows the combined title e.g. "Lunes · Water".
4. `.muse-popup-body` → `.muse-popup-text` — description.
5. `.muse-popup-close` (absolute, top-right), `.muse-popup-particles` (12 CSS dots), `.muse-popup-hint`.

Background: flat `#000`. `aria-labelledby="muse-popup-cause"`.

---

## 2. Critique / bugs found

| # | Finding | Evidence |
|---|---------|----------|
| A | **Symbol low-contrast.** Symbol PNG sits on a circle of the *same* muse hue with no recolor → it blends in. | `muse.css` `.muse-card-inside` gradient + `.muse-popup-image img` (drop-shadows only, no recolor) |
| B | **Dead 3D tilt.** `--pointer-*`, `--rotate-*`, `--background-*`, `--muse-glow` are read in CSS but never set by JS → shine/glare at opacity 0, no tilt, glow falls back to generic white (not muse color). | `grep` shows refs only in `muse.css`; `muse-popup.js` sets none |
| C | **No in-popup navigation.** Must ESC + reselect each muse. | `muse-popup.js open()` takes loose args, no index/list |
| D | **Title hierarchy flat.** Real `<h2>` title hidden; name+cause crammed into one line *below* the symbol. | `index.html:215` hidden; `:229` cause below |
| E | **Sparse background.** Only 12 particles on flat black; nothing reacts to the circle. | `createParticles` count = 12 |
| F | **Offset too wide.** `gap: clamp(1.5rem,4vw,3rem)` + symbol only 70% of card → composition reads loose / off-center. | `.muse-popup-content` gap |

---

## 3. Proposed changes

### 3.1 White symbol on its color (Finding A) — per decision 4.2/4.6
- Swap the symbol src to the white asset (`muse/<name>-white.png`) so it reads on the colored disc. **No CSS filter** — the white art preserves detail.
- Keep the colored radial disc (`.muse-card-inside`) as the backdrop; add a subtle inner vignette/ring for separation.
- Drop the muse-color drop-shadow on the symbol itself (redundant once white); keep a soft dark shadow for lift.

### 3.2 Prev / next arrows (Finding C) — per decision 4.3
- Refactor: `MusePopup` holds an ordered muse array of `{ name, cause, description, color, img }`. `open(index)` replaces the loose `(title, desc, color, img)` signature.
- **Data sourcing** (the gap to mind): the orbit DOM gives `name` (`.muse-text h3`), `description` (`.muse-text p`), `color` (`data-color`). It does NOT give a clean `cause` or the white `img`:
  - `cause` → parse from `data-popup-title` (`"Lunes · Water"` → split on `·`), or import `MUSES` from `data.js` (`{name, cause, color}`).
  - `img` → derive the white path `assets/images/muse/<name.toLowerCase()>-white.png`.
- Add left/right arrow buttons (absolute, vertically centered, outside the disc). `next()/prev()` **wrap around 0↔6**, swap content + recolor, replay the entrance tween (no close/reopen).
- Keyboard: `←/→` navigate; mobile: horizontal swipe. ESC/outside still close.
- `createParticles` re-fires with the new color on each switch.

### 3.3 Title above, cause + description below (Finding D) — per decision 4.5
- New order: **NAME (header, above the disc)** → disc → **cause (subtitle)** → **description**.
- Use `#muse-popup-title` for the name. Un-hiding it requires removing BOTH the CSS rule (`.muse-popup-title { display:none }`, `muse.css:265`) AND the JS `gsap.set(this.title, { display:'none' })` (`muse-popup.js:25`), then animating it in.
- Update `aria-labelledby` from `muse-popup-cause` → `muse-popup-title` (`index.html:212`).
- Split data: header = `Lunes`, subtitle = `Water` (was the combined `"Lunes · Water"` in `#muse-popup-cause`).

### 3.4 Reactive starfield (Finding E) — per decision 4.1
- New `createStarfield()` WebGL instance for the popup, denser than the 12 particles, gated to open-only, reacting to the disc (brighten / drift toward the muse color on open + switch).

### 3.5 Center + tighten (Finding F)
- Reduce `gap` to `clamp(0.75rem, 2vw, 1.5rem)`.
- Bump symbol to ~78–82% of the disc; verify the whole stack is vertically centered within `max-height:80vh`.
- Confirm arrows don't push the disc off-center (absolute-position them).

### 3.6 Revive the dead tilt (Finding B) — per decision 4.4
- Add pointer-move JS on `.muse-card` to set `--pointer-x/y`, `--pointer-from-*`, `--rotate-x/y`, `--background-x/y`, and `--muse-glow` (from the muse color) so the shine/glare/tilt actually render.

---

## 4. Decisions (locked)

1. **Background stars → WebGL.** New `createStarfield()` instance for the popup, gated to open-only (+1 GL context, under Safari's 8 cap). Reacts to the disc on open + switch.
2. **Symbol → swap white assets.** White-on-transparent symbol PNGs (`muse/<name>-white.png`), now in place (see 4.6). Popup swaps the src to these — no CSS filter, preserving detail.
3. **Arrows → keyboard ←/→ + mobile swipe, wrap-around.** Past Solis loops to Lunes; arrows always active.
4. **Tilt card → revive.** Wire pointer-move JS so shine/glare/tilt + muse-color glow work.
5. **Title split → name / cause.** Header = `Lunes` (above disc), subtitle = `Water` (below disc).
6. **White assets → in place.** 7 white symbols at `public/assets/images/muse/<muse>-white.png` (`lunes-white.png` … `solis-white.png`). Refreshed colored versions (`<muse>.png`) also replaced the orbit art. Old `logo updated/` subfolder removed.

   | Muse | Orbit (colored) | Popup (white) |
   |---|---|---|
   | Lunes | `muse/lunes.png` | `muse/lunes-white.png` |
   | Ares | `muse/ares.png` | `muse/ares-white.png` |
   | Rabu | `muse/rabu.png` | `muse/rabu-white.png` |
   | Thunor | `muse/thunor.png` | `muse/thunor-white.png` |
   | Shukra | `muse/shukra.png` | `muse/shukra-white.png` |
   | Dosei | `muse/dosei.png` | `muse/dosei-white.png` |
   | Solis | `muse/solis.png` | `muse/solis-white.png` |

   Popup maps each muse → its `-white.png` (built into the ordered array in `muse.js`).

## 5. Build order (once white assets land)

1. **Markup** (`index.html:212–237`): move `#muse-popup-title` above `.muse-card-wrapper` as the name header; demote `#muse-popup-cause` to subtitle below disc; add prev/next arrow buttons + popup WebGL `<canvas>`; update `aria-labelledby` → `muse-popup-title`; update `.muse-popup-hint` text to mention arrow nav.
2. **Data + invocation** (`muse.js:80–108`): build ordered `{name,cause,description,color,img}` array once (cause via `data-popup-title` split / `MUSES`; img via derived `-white.png` path); call `MusePopup.open(index)`.
3. **Logic** (`muse-popup.js`): remove the `gsap.set(this.title,{display:'none'})` line; `open(index)` / `next()` / `prev()` (wrap 0↔6), keyboard ←/→, swipe, recolor + re-fire particles on switch; wire pointer-move tilt vars + `--muse-glow`; init/gate the popup starfield.
4. **Styles** (`muse.css`): remove `.muse-popup-title{display:none}`, style the name header; white-symbol shadow tweak; tightened `gap`; larger symbol (~80%); centered stack; arrow positioning; revive shine/glare opacity.
5. **A11y**: arrows labelled + keyboard-reachable, focus-trap still covers new controls, `prefers-reduced-motion` skips tilt + particles (starfield keeps rendering, per site convention).
6. Run `/doc-minder` after.

> **Round 1 status: SHIPPED.** All of §3–§5 implemented; build passes, 5 WebGL contexts. The items below are the next round.

---

# ROUND 2 — Polish (planning)

Four asks: (1) level the symbols, (2) fix desktop text overlap + X-style close + smaller desktop description, (3) galaxy-spiral magnetized particles, (4) emboss the symbol + noise on the disc.

## R2.1 — The card jumps to a different height per muse  ✅ DECIDED

**User clarification:** it's the **whole card** (ring + symbol) that's not on the same level across muses — not the inner glyph.

**Root cause (confirmed):** in the popup, `.muse-popup-content` is a flex column that is **vertically centered** in the viewport (`.muse-popup { align-items/justify-content: center }`). Descriptions vary in length (measured 118→152 chars → different line counts), so the block's total height changes per muse. Centering a taller/shorter block moves everything — including the card — **up or down**. So arrowing between muses shifts the card vertically. (The orbit is NOT involved: its descriptions are `display:none`, so those items are uniform-height. Orbit untouched, as before.)

**Fix:** make the card's vertical position constant by giving the text region a **reserved constant height**, so block height no longer depends on copy length:
- Set a `min-height` on `.muse-popup-body` (and/or the title+cause stack) sized to the longest description at the new smaller desktop size, with the text vertically centered inside that reserved space.
- Net effect: title + card + cause always occupy the same vertical footprint; the card lands at the same Y for all seven. Pairs naturally with R2.2 (smaller desktop text + capped body height).
- No art changes; no orbit changes.

## R2.2 — Desktop: description overlaps the close CTA

**Current:** `.muse-popup-close` is an `×` anchored above the content (`top: clamp(-3rem,-4vw,-2rem); right:0`); a separate `.muse-popup-hint` sits at the popup bottom. On desktop the longer descriptions (e.g. Shukra) grow the centered content block until the text collides with the bottom hint / close zone.

**Proposal:**
- **Close → top-right X, arrow-styled.** Restyle `.muse-popup-close` to match `.muse-popup-nav` (same size/color/hover/focus), anchored to the **popup** (viewport top-right), not the content — so it never moves with text length. Use the same `‹ ›`-family `×` glyph.
- **Drop the bottom hint** (`.muse-popup-hint`) — the arrows + X make it redundant and it's the thing the text overlaps. (Or keep a one-time fade-out; lean: remove.)
- **Smaller desktop description.** `.muse-popup-text` is `--font-h2-size` = `clamp(14px,1.5vw,22px)` → 22px on desktop. Reduce to ~`clamp(14px,1.1vw,17px)` and cap `.muse-popup-body { max-height }` with internal centering so it can never reach the edges.

## R2.3 — Galaxy-spiral, magnetized particles

**Current:** 12 CSS dots (`.muse-popup-particle`) drift straight outward via `@keyframes float-particle`. No rotation, no inward pull.

**Proposal — replace with a 2D-canvas particle field** (the CSS keyframe system can't do per-particle orbital state):
- New `<canvas id="muse-popup-particles-canvas">` centered on the disc; registered as a **Renderer layer gated `active: () => MusePopup.isOpen`** (same pattern as the popup starfield — no private RAF, respects the single loop + DPR cap).
- **Motion model (spiral galaxy + accretion):** each particle has polar state `(r, θ)`. Per frame: `θ += ω(r)` with `ω` larger near the core (differential/Keplerian-style rotation → spiral arms naturally trail); `r -= drift` (magnetized inward). When `r < coreRadius`, respawn at the outer radius with a random θ. Optionally seed θ into 2 spiral arms for a clearer galaxy read.
- **Look:** color = current muse color; size + alpha scale with proximity to core (brighter as they fall in); glow faked with translucent radial fill (NOT per-frame `shadowBlur`, per the ProcessLinks lesson). ~100–150 particles.
- **Reduced-motion:** render a static sparse scatter (no rotation/inward drift), consistent with current particle skip.
- Recolor instantly on muse switch (same hook as `createParticles` today).

**Decisions needed (Q2):** density (~120?), and whether particles should also be *emitted* on switch (a burst) or just continuously spiral.

## R2.4 — Emboss the symbol + noise on the disc

**Current:** white symbol with a single soft dark `drop-shadow`; disc is a clean radial gradient (`.muse-card-inside`).

**Proposal (two layered effects):**
- **Emboss/letterpress the symbol.** Swap the single drop-shadow for a dual-shadow engrave: a dark shadow offset down + a light highlight offset up — e.g. `filter: drop-shadow(0 2px 1px rgba(0,0,0,.45)) drop-shadow(0 -1px 1px rgba(255,255,255,.35))`. Reads as pressed into the disc. (Alt: `mix-blend-mode: soft-light` so the symbol picks up disc tint — richer "embed" but lower contrast; see Q3 previews.)
- **Noise on the disc.** Add a subtle grain layer inside `.muse-card-inside` via an inline SVG `feTurbulence` data-URI as a second `background-image`, ~6–10% opacity, `mix-blend-mode: overlay`. GPU-cheap static texture; breaks up the flat gradient. Sits under the symbol, clipped by the existing `border-radius:50%`.

**Decision needed (Q3):** emboss style — **engrave (dual drop-shadow)** vs **embed (soft-light blend)**.

## R2 build order (after Q1–Q3)
1. (If Q1=a) PIL normalize script → regenerate 14 PNGs; verify in orbit + popup.
2. **CSS** (`muse.css`): restyle `.muse-popup-close` as top-right arrow-twin; remove `.muse-popup-hint` (+ its responsive rules); shrink `.muse-popup-text` desktop clamp + cap body height; emboss filter on `.muse-popup-image img`; noise layer on `.muse-card-inside`.
3. **Markup** (`index.html`): move close button out of `.muse-popup-content` to a direct child of `.muse-popup` (viewport-anchored); remove hint div; add particles canvas.
4. **Particles** (`muse-popup.js` + `main.js`): new 2D galaxy field as an open-gated Renderer layer; remove the CSS-particle path (`createParticles`/`.muse-popup-particle`) or repoint it; recolor + resize-on-open hooks.
5. A11y/perf pass; `/doc-minder`.

> **Round 2 status: SHIPPED.** Build passes; galaxy field live; card now level across muses; close is the top-right arrow-twin.

---

# ROUND 3 — Typography + card flip (planning)

Four asks: (1) tighten subtitle→description spacing + legible description, (2) 3D card *flip* on muse switch, (3) more disc noise, (4) stronger shine on hover.

## R3.1 — Subtitle→description spacing + legibility

**Current measured state:**
- `.muse-popup-content { gap: clamp(0.75rem, 2vw, 1.5rem) }` applies between ALL items (title, card, cause, body).
- `.muse-popup-cause { margin: clamp(1rem,2vh,1.5rem) 0 0 0 }` (space ABOVE the subtitle).
- `.muse-popup-body { margin-top: clamp(0.5rem,1vh,1rem); min-height: clamp(4.5rem,12vh,6.5rem); display:flex; align-items:center }`.
- So desktop subtitle→description gap = content-gap (1.5rem) + body margin-top (1rem) **+ extra empty space from `align-items:center`** inside the 6.5rem reserved box (short copy floats to the vertical middle, opening a big gap under the subtitle). This centering is the main culprit.

**Two bugs found in the description type:**
- **Line-height is a px clamp, not a ratio.** `line-height: var(--font-h2-height)` = `clamp(18px,1.8vw,26px)` scales on its OWN vw curve, independent of the font-size clamp `clamp(14px,1.1vw,17px)`. At ~900–1100px widths the ratio collapses to ~1.3 → cramped lines. **Root cause of "hard to read."**
- Letter-spacing currently inherits 0; on light-on-dark serif text a hair of tracking helps (light text blooms on black).

**Proposal (research-backed for Canela text on dark):**
- **Pull description up ~1/3:** switch `.muse-popup-body` to `align-items: flex-start` (kills the centered empty gap; keeps the reserved `min-height` so the card stays level), and cut `margin-top` to `clamp(0.15rem, 0.5vh, 0.4rem)`. Net desktop gap ≈ 1.7rem and now constant across muses.
- **Legibility:**
  - `line-height: 1.55` (unitless ratio → tracks font-size; meets WCAG ≥1.5 for body). This is the key fix.
  - `letter-spacing: 0.01em` (subtle; serif text wants near-zero — avoid over-tracking).
  - keep weight 400; bump color `rgba(255,255,255,0.9)` → `0.92` for a touch more contrast on black.
  - measure already ~50ch at `max-width:400px` (ideal 45–75) — leave.
- (Subtitle `.muse-popup-cause` stays as-is; only the gap *below* it tightens.)

## R3.2 — Card flips to the next muse

**Current:** `goTo()` fades title/cause/text out→in and scales the symbol out→in, while the disc just recolors via `_applyMuse`. Reads disjointed — card recolors instantly while everything else "jumps."

**Proposal — a true 3D Y-axis flip that carries the swap:**
- Animate `rotationY` on **`.muse-card-shell`** (lives inside `.muse-card-wrapper`'s `perspective:1000px`). Single-face flip with the content swap hidden at the edge-on moment:
  ```
  reset wrapper tilt vars (--rotate-x/y → 0) so the flip is clean
  tl.to(shell,   { rotationY: dir*90, duration: 0.22, ease: 'power2.in' })
    .add(_applyMuse)                 // swap symbol + disc color + galaxy color while edge-on (width≈0)
    .set(shell,  { rotationY: -dir*90 })
    .to(shell,   { rotationY: 0, duration: 0.3, ease: 'power2.out' });
  ```
  `dir = +1` for next, `-1` for prev (flip follows the arrow). Staying within ±90° means the single face never shows its mirror — no need for back-face markup.
- Because the symbol + disc live INSIDE the shell, they flip *together* — the symbol no longer "jumps in" separately; it arrives on the turning card.
- Title/cause/description are siblings OUTSIDE the card → keep a quick fade synced to the flip (fade out during first half, in during second) so the whole switch feels like one motion.
- **Remove** `.muse-card-shell { transition: transform 180ms }` (would fight GSAP).
- **Pointer tilt coexistence:** tilt writes `--rotate-y` on `.muse-card` (a shell descendant); during the flip we zero the tilt vars at start so they compose cleanly; pointermove resumes after.
- **Reduced-motion:** skip the flip — instant swap with a short opacity crossfade (no rotation).

**Decision (Q1):** flip direction follows the arrow (next vs prev) — yes? And keep it a horizontal Y-flip (vs a vertical X-flip)?

## R3.3 — More noise on the disc

`.muse-card-inside::after` opacity `0.12` → **`~0.18`** (and optionally drop `baseFrequency` 0.9 → 0.8 for slightly coarser grain). One-line change; `mix-blend-mode: overlay` stays.

## R3.4 — Stronger hover shine

`.muse-card-shine` currently: white stops `0.4/0.2/transparent`, `opacity: calc(var(--pointer-from-center) * 0.8)`.
**Proposal:** brighten stops to `0.6/0.3/transparent` and raise the multiplier to `* 1.0` (and optionally nudge `.muse-card-glare` `*0.6 → *0.75`). Tunable live.

## R3 build order (after Q1)
1. **CSS** (`muse.css`): R3.1 body `flex-start` + margin + `.muse-popup-text` line-height/letter-spacing/color; R3.3 noise opacity; R3.4 shine/glare; remove `.muse-card-shell` transform transition.
2. **JS** (`muse-popup.js`): rewrite `goTo()` as the Y-flip timeline w/ direction + tilt-var reset + reduced-motion branch; `next()/prev()` pass `dir`.
3. Build verify; `/doc-minder`.

> **Round 3 status: SHIPPED.** Flip + legibility + noise/shine live; build passes.

---

# ROUND 4 — Copy layout + mobile galaxy + subtitle (planning)

Four asks: (1) description still too tight + per-sentence layout with no orphans/widows, (2) galaxy too "landscape" on mobile — extend vertically, (3) flip = perfect (no change), (4) subtitle in bold italic.

## R4.1 — Description: looser + one sentence per block, no orphans

**Current:** `.muse-popup-text` is a single `<p>` holding the whole 2-sentence description; `line-height: 1.55`, `letter-spacing: 0.01em`. Lines wrap wherever they land — so the 2nd sentence can start mid-line (a word or two trailing on a line), and lines can end on a lone word (widows/orphans).

**Facts:** every muse description is exactly **two sentences** (verified all 7), 118–152 chars.

**Proposal:**
- **One sentence per block.** Split the description on sentence boundaries (`/[^.]+\./g`) in `muse.js`, store `sentences: [s1, s2]`, and render each in its own block element (`.muse-popup-sentence { display:block }`) inside `#muse-popup-text`. So sentence 1 stands alone; sentence 2 always starts fresh — no trailing-word-into-next-sentence.
- **Kill orphans/widows.** Apply `text-wrap: balance` to each sentence block — balances line lengths so no line ends on a single word (ideal for short ≤~4-line blocks; graceful no-op on old browsers). (`text-wrap: pretty` is the alternative — better for long paragraphs, but `balance` is right for these short blocks.)
- **Looser spacing:** bump `line-height` `1.55 → 1.6`; `letter-spacing` `0.01em → 0.015em`; add a small gap between the two sentences (`.muse-popup-sentence + .muse-popup-sentence { margin-top: 0.5em }`).
- **Re-tune reserved height:** the split + extra gap + taller line-height makes the tallest copy (Shukra/Solis) grow; bump `.muse-popup-body { min-height }` so the tallest still fits and the card stays level (extra space sits *below* the text via `flex-start`, so the subtitle gap is unaffected). Verify live.
- **innerHTML note:** content is our own static `data.js` copy (no user input) → safe to set as markup.

## R4.2 — Galaxy extends vertically on mobile

**Root cause:** in `muse-galaxy.js`, the field is **circular** with `maxR = min(w, h) * 0.6`. On portrait mobile `min(w,h)=w` (small), so the galaxy is a small circle in a tall viewport → particles cluster in a horizontal band ("landscape crop"), not reaching top/bottom.

**Proposal — make the field an aspect-aware ellipse (output stretch only, sim stays circular):**
- Add per-axis stretch in `render()`:
  ```
  const portrait = this.h > this.w;
  const sx = 1;
  const sy = portrait ? Math.max(1, Math.min(2.2, (this.h / this.w) * 0.85)) : 1;
  x = cx + cos(theta) * p.r * sx;
  y = cy + sin(theta) * p.r * sy;
  ```
- **Desktop (landscape, w>h): `sy = 1` → unchanged** (stays the circular look you liked).
- **Mobile (portrait): `sy > 1`** stretches the spiral vertically to ~half the viewport height (e.g. 390×844 → sy≈1.8), so it extends up/down and fills the tall frame.
- Core/vanish logic (scalar `r` vs `core`) is untouched — particles still fall into the disc; only the drawn position is stretched. Fade-out masks the slight elliptical core near the disc.

## R4.3 — Card flip
No change. (Confirmed perfect.)

## R4.4 — Subtitle bold italic

`.muse-popup-cause` is currently `font-weight: var(--font-h1-weight)` (700), upright. Add **`font-style: italic`** (keep weight 700) → bold italic.
- **Risk to verify:** the Typekit kit (`afs8ors`) loads Canela 700 + 400 *roman*. If a Canela **italic** face isn't in the kit, the browser will synthesize a faux-oblique (slanted roman) — usable but not true italic. **Q below.**

## R4 build order (after Qs)
1. **`muse.js`**: split `description` → `sentences[]` in the muse array.
2. **`muse-popup.js`**: `_applyMuse` renders sentence blocks into `#muse-popup-text`.
3. **`muse-galaxy.js`**: aspect-aware `sy` stretch in `render()`.
4. **`muse.css`**: `.muse-popup-sentence` block + `text-wrap: balance` + inter-sentence margin; `.muse-popup-text` line-height/letter-spacing; `.muse-popup-body` min-height re-tune; `.muse-popup-cause` `font-style: italic`.
5. Build verify; `/doc-minder`.

> **Round 4 status: SHIPPED** (+ hotfix: `.muse-card-wrapper { flex-shrink:0 }` so the flex column can't squish the disc into an oval; body `min-height` dialed back so it doesn't overflow 80vh / push the card up).

---

# ROUND 5 — Galaxy absorption + outer density (planning)

Quick galaxy-only tweaks in `muse-galaxy.js`:
- **Absorb into the card (not "underneath").** Cause: `fadeOut` uses a wide band (`core * 0.8`), so particles dim well outside the disc and seem to slip away before reaching it. Fix: tighten the fade to the last stretch near the rim and let particles cross *slightly* onto the disc before respawning, so they visibly sink into it (galaxy is already z-index 4, above the disc).
  - `fadeOut = min(1, (r - core*0.85) / (core*0.5))` (bright until the rim, quick absorb just inside it)
  - respawn threshold `r <= core` → `r <= core * 0.85`
- **Denser outer ring at start.** Seed `r` is uniform → looks sparse outside. Bias the initial radius toward the outer edge: `r = core + (maxR-core) * Math.pow(Math.random(), 0.45)`.

> **R5 status: shipped but INSUFFICIENT** — still reads as fading behind the disc, not absorbing. Superseded by Round 6.

---

# ROUND 6 — Real absorption effect (planning)

**Why R5 failed (diagnosed):**
1. Disc glow `box-shadow: 0 0 50px var(--muse-glow)` is bright; additive (`lighter`) particles lose contrast inside that halo near the rim → they wash out *in the glow* → reads as "behind."
2. No motion/energy cue — a dot that merely dims looks like it goes *behind* the disc.
3. Particles die at the rim and never touch the disc surface → no visible merge.

**Researched techniques (accretion / "sucked in" looks):**
- **A — Radial streaks (motion stretch).** Store each particle's previous `(x,y)`; draw a line prev→current sized by speed. Inward acceleration near the rim → elongated streaks pointing at the center → strong "pulled in" read. Cheap, the primary cue. (Per-particle streaks, NOT full-canvas trails — a translucent clear would darken the transparent canvas over the starfield.)
- **B — Land & dissolve ON the disc.** Let particles travel a bit *inside* the rim (to ~0.6·core) and fade on the disc surface (galaxy is z-4, above the card), confined to a thin band near the edge so they never cover the center symbol. Makes the merge literal.
- **C — Absorption flash.** On respawn (the moment it's absorbed), drop a brief bright point/expanding ring at that rim position that fades in ~0.2s. Accumulated around the rim → the disc looks like it's *eating* them.
- **D — Contrast fix.** Brighten particles as they approach the rim (counter the glow wash) and/or shrink the disc glow slightly so streaks stay legible.

**Recommended:** A + B + D (streaks that accelerate, land and dissolve just inside the rim, with a brightness ramp so they punch through the glow). C (flashes) optional for extra drama.

**Implementation sketch (`muse-galaxy.js`):**
- add `px,py` (previous pos) to each particle; draw a streak (`moveTo/lineTo`, `lineWidth ≈ size`, `lineCap round`) instead of just a dot, length ∝ inward speed.
- inward velocity ramps up sharply for `r < core*1.3` (suck-in); respawn at `r <= core*0.55`.
- alpha: ramp brightness UP from `core*1.3 → core` (punch through glow), then hard fade `core → core*0.55` (dissolve on the surface).
- keep outer-density bias + mobile `sy` stretch from R4/R5.
- (D) optionally drop `.muse-card` glow `0 0 50px → 0 0 35px` so streaks read.

**Decision (Q):** A+B+D (recommended) — or add C (rim absorption flashes) for a more dramatic, energetic effect?

> **R6 status: SHIPPED** (A+B+D). Streaks + dissolve + contrast ramp; glow trimmed 50→38px.

### R6.1 — Merge on the rim, not over the disc face
Feedback: particles dissolved *inside* the disc (to `core*0.55`), drawing over the card face. Want them to merge onto the **edge/outline** instead.
- Respawn at `p.r <= core` (stop at the rim — never cross onto the face).
- Dissolve in the band just OUTSIDE the rim: `dissolve = min(1, (p.r - core) / (core*0.25))` → fully gone exactly at `core`, bright just before it (boost still peaks at the rim). So they converge onto the outline and vanish there.

## R4 open questions
- **Q1 (subtitle italic):** OK to use faux-italic if the Typekit kit lacks a true Canela italic — or should I add the italic face to the kit first / fall back to a different emphasis (e.g. keep roman, just bolder/letter-spaced)?
- **Q2 (sentence gap):** small gap between the two sentences (recommended) vs sentences flush like a normal paragraph but still each starting on its own line?

---

# ROUND 7 — Partnership / Events strip (SHIPPED)

Not popup-related — surfaced while wiring the real partner logos. Logged here as the running change record.

## R7.1 — Real partner logos
- `data.js` `PARTNERS` was generating placeholder `partner-1..5.png` (deleted). Replaced with the 10 actual logos as `{ name, src }` objects; `src` is `encodeURIComponent`-ed (one filename has a space: `Vinili e vinelli.png`). `events.js` renders each `<a><img>` using `name` for `alt`/`aria-label`.

## R7.2 — Logos were invisible (width collapse)
- DevTools showed `img.partnership-logo` at `0 × 60` — height applied, **width 0**.
- **Cause:** global `img { max-width: 100% }` × the shrink-to-fit flex anchors created a circular width dependency → resolved to 0. (Not a path/load/filter/visibility issue — all 10 serve `200`, are white-on-transparent.)
- **Fix:** `.partnership-logo { max-width: <clamp> }` (absolute, breaks the cycle) + `.partnership-track > a { flex: 0 0 auto }`. Also removed the old `filter: brightness(0) invert(1)` (no-op now the art is white).

## R7.3 — Seamless marquee (the real loop fix)
- Symptom: strip jumped/reset each loop.
- **Cause:** `.partnership-track` (block-level flex) had **no width → defaulted to 100% of the parent**, so `translateX(-50%)` was half the *slideshow*, not half the *content*. Mismatch → jump. (`gap` is also wrong: off by half a gap at the seam.)
- **Fix (both required):** `.partnership-track { width: max-content }` so `-50%` = exactly one duplicated set, AND per-item `margin-right` (not container `gap`) so each item's trailing margin aligns the seam. Track = `set + set` (identical) → frame at `-50%` == frame at `0` → continuous.

## R7.4 — Sizing, spacing, title, top space
- Wide marks (Lukso 5.4:1, Peng 3.2:1) dominated when sized by height → `max-width: clamp(90px,14vw,118px)` + `object-fit: contain` (capped + letterboxed, ratio kept). Base height `clamp(48px,7vh,68px)`.
- Wider spacing: `margin-right: clamp(3rem,7vw,6.5rem)` (mobile `clamp(2.25rem,7vw,3.5rem)`).
- Title bigger: `.partnership-title` `clamp(24px,3vw,42px)` → `clamp(32px,5vw,60px)`.
- Awkward top band: removed `.events-page-wrapper { min-height:60vh }` (its flex-centering left an empty band above the title); trimmed top padding.

## R7.5 — Stars behind + soft strip
- `.events-page-wrapper` made **transparent** and the fixed unified starfield extended to render in `events` (`main.js` sections `['muse','comet','events']`) so the cosmic bg shows behind the strip.
- `.partnership-slideshow`: `background: rgba(0,0,0,0.5)` (50% black veil — stars still read), backdrop blur removed, and L/R edge fade via `mask-image: linear-gradient(to right, transparent, #000 10%, #000 90%, transparent)` so the strip eases in/out instead of a flat cut.
