# Website Rewrite — Working Plan

> Living planning/backlog doc for the **`copy/website-rewrite`** branch (off `main`, currently uncommitted).
> Leads with the backlog of upcoming changes; the lower sections are context (decisions + what's done).
> Update this as we go: add new items to **Backlog**, tick them, move finished ones to **Done**.
>
> Dev: `npm run dev` → http://localhost:5173 · build check: `npm run build`. **Do not commit until asked.**

---

## Backlog / next

No new changes queued — awaiting the next batch. On resume, run `npm run dev` and visually confirm the latest tweaks, then take direction.

### Awaiting visual confirmation (rounds 5–6, on the live build)
- [ ] **Halo:** size + subtle breathing feel right; the hop is now seamless through a full cycle (no "almost-round-then-jump"); spreads/visible enough.
- [ ] **Flip-card back face:** black disc + muse-colour text legible on ALL muses (esp. the dark ones Dosei/Lunes); concave shine reads well. Text is brightened ~75% hue / 25% white — can go more vivid if lower contrast on dark muses is acceptable.
- [ ] **Popup flip** weight matches the orbit flip.
- [ ] Earlier opens worth a glance: popup description vertical position on mobile; scroll-up (slow + fast) — constellation never lags the "Art · Community · Impact" text.

### Awaiting visual confirmation (rounds 7–8, on the live build)
- [ ] **Orbit halo recolor:** each muse's "click me" halo now uses its OWN colour (was the rainbow). Check the dark muses (Dosei/Lunes/Shukra) still throw a visible bloom on the white section; tune head alpha (`78%,#fff`) / ring alpha (`45%`) / head width (`80°→220°`) in `muse.css` if weak.
- [ ] **Popup entrance/exit:** disc-led bloom (disc `0.62→1` `back.out(1.4)`, then title→cause→text stagger); exit releases the disc to `0.84`. Confirm the bloom weight + stagger rhythm; toggle OS reduced-motion to check the plain-crossfade path.
- [ ] **Popup galaxy (deep galaxy):** full-screen inflow centred on the disc + depth/parallax + slow turn. Check on **mobile**: fills the view, streams into the rim, no top-bunching/cropping, ~60fps; and desktop didn't get too sparse/dense. Tune `COUNT` (140), `GLOBAL_OMEGA` (0.03), depth multipliers in `muse-galaxy.js`.
- [ ] **Mobile step gap:** Stardust/Horizon step description now hugs its title (removed the extra mobile `.step-title` margin).
- [ ] **CTA rainbow hover:** "View campaigns →" shows a drifting stained-glass rainbow fill on hover, text still legible; reduced-motion = static fill. Tune gradient alpha / hover opacity in `comet.css` if needed.
- [ ] **Draggable toggle:** grab the thumb and drag left/right (mouse + touch), release snaps + switches; tap a label still switches; vertical swipe still scrolls; no double-switch.
- [ ] **Intro statement (Beat 2) presentation:** "Art / Community / Impact" now **bigger + bold, stacked as 3 pillars**, each **igniting one-by-one** (glow blooms then settles); still leaves with the constellation smoke. Check the ignite rhythm + glow weight, "Community" doesn't overflow at any width, no flash at load, and reduced-motion = plain staggered fade. Tune `IGN`/`STG` (intro.js), font clamp + `--glow` mix (intro.css).
- [ ] **Toggle "privacy-glass" body:** the pill body is a **heavily-muted rainbow drifting BEHIND a static reeded/rippled frosted glass with grain** (`.pill-glass` child — privacy-window read) instead of a flat opaque body; racing `.beam-glow` rim line on top, black thumb marks the active side. Check: colour is barely-there/soft (privacy feel, not garish), the vertical reeded ripple reads as glass, dark inactive label legible on every hue (Thunor test), labels legible through the switch, **60fps on mobile** (if it stutters, freeze the body conic — drop `.pill-glass` `animation`). Knobs: `::before` frost alpha (~0.68, mute level), reeded-ripple contrast/period, noise `opacity` (0.22) + `baseFrequency` (0.7), body drift (`12s`).
- [ ] **Campaign CTAs match the toggle:** the two buttons (now **"Explore campaigns"**, arrow removed, text centered) carry the always-on `.beam-glow` racing-rainbow rim + a `.cta-glass` frosted-glass body that **fades in on hover** (shares the toggle's `.pill-glass` rainbow+frost+noise via grouped selectors). Check: hover shows the muted glass behind black text (legible), rim races, label centered, focus ring + link click still work.
- [ ] _(add the next changes here)_

---

## Decisions locked

- **Muse purples:** Shukra = `#7F49A2` (lighter), Dosei = `#5E47A1` (darker).
- **Ares cause:** "Rewilding" (not "Reforestation").
- **Brand copy:** `cocoex` always lowercase. Never use: DAO, blockchain, on-chain, innovative, transformative, impactful.
- **Footer:** social icons + cocoex wordmark unchanged; only the mission line + legal identifier added as small print (no contact block, no signature). Desktop flanks mission left / legal right; mobile stacks mission → socials → logo → legal.
- **Typography:** balance wrapped copy, never strand a lone word / chopped fragment (orphans/widows). Use `text-wrap: balance` (short/centered blocks) or `pretty` (long paragraphs) — **never full justification**. Intentional hard breaks are fine.
- **Muse-intro hook:** "Seven causes. / One constellation." stays a deliberate two-line stack (hard `<br>`).
- ✅ **CLAUDE.md reconciled via `/doc-minder` (2026-06-18)** — hexes corrected (Shukra `#7F49A2`, Dosei `#5E47A1`), Ares = Rewilding, DAO/blockchain removed from the identity + banned-words list, and the halo / deep-galaxy / popup-bloom / Beat-2 pillars / liquid-glass toggle / draggable thumb / "Explore campaigns" CTAs all written in. ⚠️ `~/Documents/Claude/Projects/cocoex/approved-patterns.md` (outside the repo) may still list the OLD hexes / "Reforestation" — trust the live code.

---

## Done

**Copy rewrite (S1–S10)** — meta/SEO, hero statement, mission overlay, muse intro, all 7 muse descriptions, comet intro, Stardust + Horizon panels, partnership (already matched), footer build. Plus the Shukra/Dosei hex swap and Ares → Rewilding.

**Refinement round 1** — comet intro text smaller on desktop; muse popup widened + `min-height` retuned so discs stay level; Future-Lab "+Horizon" pill stretches to title height; footer 3-column flank layout (socials tight over logo); intro statement "Art · Community · Impact" enlarged; starfield visibility +20% (`intensity` 0.275 → 0.33 in `src/main.js`).

**Refinement round 2** — `text-wrap: balance` on the muse-intro paragraph + comet intro; popup description nudged lower on mobile; comet steps regrouped (tight title→body, wider gap between steps); "+Horizon" pill label bold + centered; footer mission/legal pushed to outer edges, mission split to two lines, more space under the mobile logo; typography rule saved to memory.

**Refinement round 3** — popup tilt now reacts to the cursor anywhere in the modal (listener moved to the overlay, rotation clamped); roaming halo smoother hop (0.9s ease-in-out), more feather (blur 10px, ring 6px) + tighter to disc (inset −6px); comet intro re-adds hollow `Stardust`/`Horizon` after "Two approaches:" + font-independent mobile paragraph gap; both method CTAs read "View campaigns →"; step title/number line-height set to 1.15 (groups title↔body, fixes Horizon step-2 "Future Lab" riding above "02"); footer desktop side-padding reduced so mission/legal sit nearer the edges; **scroll-up fix** — smoke/constellation fade re-timed to lead the statement on reverse (no more text-before-constellation). Mobile phone-tilt intentionally dropped.

**Refinement round 4** — roaming halo reworked: full continuous spectrum (no transparent gap → seamless spin, no reset glitch), brighter + blur 13px so it blooms outward, calmer 3s spin; orbit card flip given weight (0.72s back-out overshoot); flip-card back face gets a dark scrim over the muse hue + tighter name/cause shadows so the **titles read on pale discs (Thunor)** — front symbol left as-is (researched & rejected emboss/engrave: low-contrast by design + muddies Canela's thin strokes); muse-intro paragraph widened to 940px on desktop so "…a different way in." stops stranding. Confirmed: the "smoke" dissolve is intro-only.

**Refinement round 5** — halo: dropped the ring mask so the rainbow **blooms outward as a real halo** (inset −18px, blur 16px) instead of a contained ring; spin back to 2s (faster). Flip weight nudged up (0.82s, stronger overshoot). Flip-card back face reworked per feedback: **black disc + name/cause in the muse's own colour** (brightened ~75% hue / 25% white so the dark muses — Dosei/Lunes — stay legible on black) + the film grain switched to `screen` blend so it shows on black (matches the popup card). Dark scrim removed.

**Refinement round 6** — halo: reduced spread (inset −12px, blur 12px), added a very subtle breathe (`halo-breathe` scale 0.97↔1.06), and **made the spin continuous** (moved off `.is-hinting` so `--beam-angle` no longer snaps to 0 on each hop — fixes the "almost round then jump" glitch; only opacity is toggled now). Back face: added a soft top sheen + inset shadows for a **concave, glassy** read. Popup flip given the **same weight** as the orbit flip (GSAP `back.out(1.6)` settle over ~0.8s).

**Refinement round 7** — **Orbit halo recoloured to each muse's OWN hue** (the rainbow read as confusing on every coloured disc): `.muse-orbit-card::before` is now a single-hue conic of `--muse-color` — a dim ring + a brighter, white-lifted head that travels with `--beam-angle` (circling preserved), lifted brighter than the disc so it doesn't wash into the edge (Safari `<16.2` solid fallback). **Muse popup entrance/exit reworked** (`muse-popup.js`): disc-LED bloom (disc `0.62→1` `back.out(1.4)` as the hero, then title→cause→text rise in one tight stagger; the column no longer scales → no compound double-grow); exit mirrors it, releasing the disc to `0.84` (was yanked to `0.7`); added a real `prefers-reduced-motion` branch (plain crossfade — the GSAP tweens ignored the CSS rule before).

**Refinement round 11** — **Toggle gets a "liquid glass" body** (`index.html` + `comet.css`). Added a `.pill-glass` child (z-0, below thumb/labels/rim line): a full muse-spectrum **conic rainbow** drifting slowly (`beam-spin 12s`), under a translucent **white-tint glass** (`::before` — mutes it to pastel + a top sheen + inset shadows for liquid-glass curvature), under a **noise grain** (`::after`, reusing the muse-disc `feTurbulence` SVG, `overlay` @ 0.14). So the body now shows the rainbow muted THROUGH frosted glass instead of blocking it; the `.beam-glow` rim line still races on top and the black thumb still marks the active side. No `backdrop-filter`. (Replaces the opaque body the user flagged in the screenshot.)

**Refinement round 10** — *(tried + reverted)* Moved the toggle rainbow from the `.beam-glow` border ring into a filled translucent **stained-glass back** (`.comet-pill::before`, alpha `0.40`). On review the user preferred the original look, so it was **reverted**: the pill is back to `class="comet-pill beam-glow"` — a **rainbow LINE racing around the rim** with a muted light body (labels on the calm interior) — and the `::before` fill was removed. The round-8 `.comet-cta` stained-glass fill is unaffected; `.beam-glow` remains the pill's treatment.

**Refinement round 9** — **Intro statement (Beat 2) reworked from a small flat line into 3 bold "pillars"** (`index.html` + `intro.css` + `intro.js`): "Art · Community · Impact" → stacked `.intro-statement-word` spans (dots dropped), `clamp(28px,6vw,64px)` bold 700, that **ignite one-by-one** top→bottom — a glow that blooms to full then settles to a faint resting halo, riding a tweenable `--glow` custom prop (GSAP writes it each frame, the `text-shadow` `calc()` re-evaluates — same trick as the tagline `--sweep`, no `@property`). The ignite spreads over the first ~40% of the scrubbed beat; the **unified fade-out stays at the same final ~18.5% window** (position 0.815 → total 1.0) so the words still leave WITH the constellation smoke. Reduced-motion → plain staggered fade. Fixes the "lost in space" feel (was `clamp(17px,2.5vw,30px)` weight 400, one-block fade).

**Refinement round 8** — **Popup galaxy → "deep galaxy" (immersive)** (`muse-galaxy.js`): the field now fills the viewport (reach = the farthest screen corner from the disc), centred on the disc, so particles stream in from every edge and pour into the rim on any device — fixes the mobile cropping / top-heavy bunching / off-centre "doesn't reach the card". Added per-particle **depth/parallax** (near = big/bright/fast/long-streak, far = tiny/dim/slow) and a **slow overall turn** (`GLOBAL_OMEGA` 0.03 rad/s) so it reads volumetric; dropped the portrait vertical stretch; count 120→140. **Mobile step gap**: removed the extra `.step-title` mobile `margin-bottom` so the description hugs its title (matches desktop grouping). **"View campaigns →" CTA**: stained-glass rainbow fill behind the text on hover (`.comet-cta::before`, muse-spectrum conic via the shared `--beam-angle`/`beam-spin`, translucent so the label stays legible; replaces the black-fill hover). **Toggle now draggable**: grab the thumb and drag left/right (Pointer Events on `.comet-pill`, `touch-action: pan-y`), snap to the nearest side on release; tap-to-switch retained; drag/tap disambiguated by a 4px threshold + a capture-phase click swallow.

---

## Where things live

- **Copy** is static markup in `index.html` (only meta/head + that markup — there's no separate copy module).
- **Muse descriptions** live in hidden `.muse-text` blocks in `index.html`, parsed by `src/sections/muse.js` and rendered by `src/ui/muse-popup.js`. `src/data.js` `MUSES` holds only name/cause/color.
- **Styles** in `src/styles/*.css` (`tokens.css`, `base.css`, `intro.css`, `muse.css`, `comet.css`, `events-footer.css`, `responsive.css`).
- **Scroll pacing** is centralized in `src/scroll/timeline.js` (single source of vh; CSS heights injected) — never hardcode vh elsewhere.

---

## Verification & workflow

- After each change: rely on dev-server HMR for visual review, then `npm run build` to confirm no errors.
- Reuse the existing `text-wrap: balance` pattern; keep `timeline.js` as the only place vh pacing is defined.
- Review on the branch; **commit only when explicitly asked.**
