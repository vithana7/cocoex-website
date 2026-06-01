# Scroll Pacing Plan

> Read-only diagnosis. No code changes proposed below — only a target rhythm and a delta table the implementation phase can apply.

---

## Current state

### Wrapper heights and section ranges

| # | Section | Wrapper | Wrapper height | Page range (vh) | Source |
|---|---|---|---|---|---|
| 1 | Intro | `.intro-spacer` | 400vh | 0 → 400 | `css/styles.css:157-158` |
| 2 | Mission text | `.text-section-wrapper` | 150vh | 400 → 550 | `css/styles.css:357-360` |
| 3a/b | Muse intro + orbit | `.muse-section-wrapper` (inside `.white-section`) | 470vh | 550 → 1020 | `css/styles.css:1115-1120`, comment cites `MUSE_INTRO_HOLD (350) + MUSE_CROSSFADE (120)` |
| 4–6 | Comet (intro / methods / connected) | `.comet-collab-wrapper` | 600vh | 1020 → 1620 | `css/styles.css:419-424` |
| 7 | Events | `.events-page-wrapper` | `min-height: 100vh` (natural flow) | 1620 → … | `css/styles.css:1856-1864` |

`.white-section` itself has `min-height: 100vh` only (`css/styles.css:402-414`); its scroll budget is set entirely by the inner `.muse-section-wrapper`.

### SCROLL_TIMING constants (`js/main.js:96-124`)

```
INTRO_TOTAL                400   // intro span
INTRO_PHASE1_END           0.40  // 160vh — orbit ends
INTRO_PHASE2_TEXT          0.50  // 200vh — transition text peak
INTRO_PHASE3_START         0.50  // 200vh — explosion begins

TEXT_SECTION_HEIGHT        150

MUSE_INTRO_HOLD            350
MUSE_CROSSFADE             120
MUSE_TOTAL                 470

COMET_INTRO_PAUSE          100
COMET_CROSSFADE_START      360
COMET_CROSSFADE_DURATION   120
COMET_PHASES_START         480
COMET_TOTAL                600

COMET_LOGO_MOVEMENT        180   // (unused — see below)
COMET_MOVEMENT_START       100   // (unused)
COMET_BOTTOM_HOLD           80   // (unused)
COMET_PHASE_DURATION        40   // (unused)
COMET_PHASE_COUNT            3   // (unused)
```

> The five constants tagged `(unused)` are declared in `SCROLL_TIMING` but never referenced anywhere else in `js/main.js`. They describe a comet-logo descent and per-phase scroll that the current code does not implement. They inflate `COMET_TOTAL` to 600vh without a matching animation.

### Per-transition map (animation distance vs. dwell)

All `scrollTrigger` blocks use `scrub: true` (linear scrub of the timeline). Where an inner `.fromTo()` sets `ease: 'power2.out'`, the curve only applies inside the timeline — the scroll-to-progress mapping is still linear.

| Section pair | Trigger source | Start (vh) | End (vh) | Duration | Easing | Dwell before | Dwell after | File:line |
|---|---|---|---|---|---|---|---|---|
| Intro orbit (P1) | scroll-container | 0 | 160 | **160vh** | linear | 0 | 40 (text starts at 122) | `main.js:1005-1026` |
| Intro transition text | scroll-container | 122 | 200 | **78vh** | power2 in/out (but linear-scrubbed) | 0 | 0 | `main.js:1030-1050` |
| Intro explosion (P3) | scroll-container | 200 | 400 | **200vh** | linear | 0 | 0 (text reveal already started at 320vh) | `main.js:1055-1074` |
| Mission text reveal | `.text-section-wrapper` `top 80% → bottom 60%` | 320 | 490 | **170vh** | linear | -80 (starts during explosion) | 60 (dwell to 550) | `main.js:1077-1091` |
| Muse intro fade-in | `.muse-section-wrapper` `top 80% → top 40%` | 470 | 510 | **40vh** | linear | -80 (starts during text wrapper) | ~390 (hold to 900) | `main.js:1107-1121` |
| Muse crossfade (intro → orbit) | `.muse-section-wrapper` `top+=350vh → top+=470vh` | 900 | 1020 | **120vh** | linear | 390 (long muse-intro hold) | 0 (wrapper ends) | `main.js:1124-1159` |
| Comet — fade out constellation | `.comet-collab-wrapper` `top 90% → top 60%` | 930 | 960 | **30vh** | linear | overlaps muse crossfade | — | `main.js:1167-1181` |
| Comet intro fade-in | `.comet-collab-wrapper` `top 80% → top 40%` | 940 | 980 | **40vh** | linear | overlaps muse crossfade | 40 (until methods fade-in starts at 1120) | `main.js:1184-1198` |
| Comet methods fade-in | `.comet-collab-wrapper` `top+=100 → top+=200` | 1120 | 1220 | **100vh** | linear | 100 (intro pause) | 160 (until crossfade at 1380) | `main.js:1201-1218` |
| Comet crossfade (intro → connected) | `.comet-collab-wrapper` `top+=360 → top+=480` | 1380 | 1500 | **120vh** | linear | 160 (methods dwell) | 120 (dead dwell to 1620) | `main.js:1221-1249` |
| Events entry | natural flow | 1620 | — | n/a (no transition) | n/a | 120 of comet-wrapper deadspace | — | `index.html:365` |

Effective animation lengths span **30vh** (constellation fade) → **200vh** (explosion). The user's "uneven" feeling is reproducible directly from this column.

---

## Where it feels uneven

1. **Transition lengths vary by ~7×.** The constellation-canvas fadeout is 30vh; the explosion is 200vh. Even ignoring the explosion (it's section-internal, not section-to-section), section-to-section transitions span 40vh → 170vh: muse intro fade-in is 40vh (`main.js:1115`), comet intro fade-in is 40vh (`main.js:1192`), comet methods fade-in is 100vh (`main.js:1209-1210`), text reveal is 170vh (`main.js:1080-1081`). The user perceives the 40vh ones as "snaps" and the 170vh one as "lingering."

2. **Two "holds" are very long; one is missing.** The muse-intro hold is ~390vh (`MUSE_INTRO_HOLD = 350` minus the late tail of the fade-in puts pure hold at ~390vh, `main.js:1103, 1127`). The comet-connected hold after the crossfade ends is 120vh (`COMET_TOTAL 600` minus `COMET_PHASES_START 480`, see `main.js:120,123`). Meanwhile the intro→text junction has **0vh of dwell** between phase 3 ending and the text reveal starting — in fact the text reveal's `start: 'top 80%'` (`main.js:1080`) puts its onset at 320vh, *during* the still-running explosion. There is overlap, not anchoring.

3. **Triggers overlap across section boundaries.** Three pairs overlap the boundary instead of anchoring it:
   - Text reveal (320–490vh) vs. intro phase 3 (200–400vh) — overlap 200–400.
   - Muse intro fade-in (470–510vh) vs. text wrapper (400–550vh) — fade-in begins inside the previous section.
   - Comet const-canvas fade (930–960vh) and comet intro fade-in (940–980vh) both fire inside the still-running muse crossfade (900–1020vh) — `main.js:1173, 1190, 1127`.
   
   Each overlap "softens" one boundary while leaving the next one (intro→text, methods→crossfade) without a corresponding cushion. That asymmetry is what reads as "uneven."

4. **Mixed scrub behavior.** Most timelines use raw `scrub: true` (linear). The transition-text timeline (`main.js:1042,1049`) uses `power2.out` / `power2.in` *inside* the scrubbed timeline — meaning easing applied to a linearly-scrubbed playhead. This reads as a sharper-than-expected fade because the GSAP scrub doesn't re-interpolate the easing across scroll position; it just plays the eased keyframe at the linear playhead. Other sections never use this pattern. Inconsistent scrub semantics ⇒ inconsistent feel.

5. **`COMET_PHASES_START 480` references a non-existent animation.** `COMET_TOTAL` is 600vh; the last referenced animation ends at 480vh (`main.js:1225`). The remaining 120vh (1500→1620) is empty wrapper height that the user simply scrolls through with the connected-images view static. That dwell happens to act as a "rest before events" — but it's **accidental**, not designed, and it's twice as long as any other inter-section anchor.

6. **The 78vh transition-text window is the shortest "phase" in the page** (`main.js:1029, 1034`). It feels rushed compared to the 160vh orbit and the 200vh explosion that bracket it.

---

## Target rhythm

A consistent inter-section "anchor" is the right primitive. Recommendation:

- **Every section transition is a 100vh scrubbed crossfade**, linear (`ease: 'none'`), preceded by **40vh of dwell** on the outgoing section (its content is fully present, no animation), and followed by **40vh of dwell** on the incoming section. Total per junction: **180vh of "transition zone"** (40 + 100 + 40).
- 100vh is the minimum the technical spec already commits to (`docs/TECHNICAL-SPEC.md:30` — "any phase under 100vh stutters on trackpads").
- 40vh of dwell on each side is just enough that the user feels the section "land" without it reading as a stall. Less and it merges with the crossfade; more and it stalls.
- The **intra-section** animations (intro orbit, intro explosion, muse orbit hold) are not transitions and stay as-is, with the single exception of trimming the muse-intro hold so it doesn't dwarf every other anchor.
- Triggers should **not** cross wrapper boundaries. Every fade-in/fade-out should fire entirely inside its own wrapper. This is the structural fix; the value tuning is secondary.

Why not snap-style hard pauses: the user explicitly asked for "not too much" resistance. Soft anchor (40vh dwell) gives them the punctuation without halting scroll.

---

## Proposed changes

### A. SCROLL_TIMING constants (`js/main.js:96-124`)

| File:line | Current | Proposed | Rationale |
|---|---|---|---|
| `js/main.js:107` | `MUSE_INTRO_HOLD: 350` | `MUSE_INTRO_HOLD: 200` | Current 350 produces ~390vh of dead hold after the 40vh fade-in. 200 leaves a comfortable read window and matches "longest dwell ≈ 2× anchor dwell." |
| `js/main.js:108` | `MUSE_CROSSFADE: 120` | `MUSE_CROSSFADE: 100` | Bring crossfade to the canonical 100vh. |
| `js/main.js:110` | `MUSE_TOTAL: 470` | `MUSE_TOTAL: 300` | Recompute: 200 hold + 100 crossfade. |
| `js/main.js:113` | `COMET_INTRO_PAUSE: 100` | `COMET_INTRO_PAUSE: 80` | Reduce to be the "incoming dwell" of the previous transition (40) plus a small read window before methods enter. Tune by viewing. |
| `js/main.js:117` | `COMET_CROSSFADE_START: 360` | `COMET_CROSSFADE_START: 260` | Pull forward: 80 (intro pause) + 100 (methods fade) + 80 (methods read) = 260. |
| `js/main.js:118` | `COMET_CROSSFADE_DURATION: 120` | `COMET_CROSSFADE_DURATION: 100` | Canonical 100vh. |
| `js/main.js:120` | `COMET_PHASES_START: 480` | (delete or rename to `COMET_CROSSFADE_END: 360`) | Currently unused except as the crossfade end — rename for clarity. |
| `js/main.js:114-116, 119, 121` | `COMET_LOGO_MOVEMENT`, `COMET_MOVEMENT_START`, `COMET_BOTTOM_HOLD`, `COMET_PHASE_DURATION`, `COMET_PHASE_COUNT` | Delete | Dead constants; no consumer in `main.js`. Removing them is clarifying, not behaviour-changing. |
| `js/main.js:123` | `COMET_TOTAL: 600` | `COMET_TOTAL: 400` | Recompute: 80 + 100 + 80 + 100 + 40 (post-crossfade dwell on connected images before events) = 400. |

### B. CSS wrapper heights (must follow A exactly)

| File:line | Current | Proposed | Rationale |
|---|---|---|---|
| `css/styles.css:359` | `.text-section-wrapper { height: 150vh; }` | `height: 180vh;` | 40 (dwell after intro) + 100 (text reveal scrub) + 40 (dwell before muse). Today it is 150vh with the text reveal occupying 170vh that *spans into the previous section* — the new value lets the reveal fit inside its own wrapper. |
| `css/styles.css:1118` | `.muse-section-wrapper { height: 470vh; }` | `height: 300vh;` | Match new `MUSE_TOTAL`. |
| `css/styles.css:422` | `.comet-collab-wrapper { height: 600vh; }` | `height: 400vh;` | Match new `COMET_TOTAL`. Update inline comment to reflect the new breakdown. |

### C. ScrollTrigger ranges (move every trigger inside its own wrapper, harmonise to the canonical anchor)

| File:line | Current trigger | Proposed trigger | Rationale |
|---|---|---|---|
| `main.js:1080-1081` | text reveal: `'top 80%'` → `'bottom 60%'` (yields 320→490vh) | `start: 'top+=40vh top'`, `end: 'top+=140vh top'` on `.text-section-wrapper` | Anchors fade entirely inside the 180vh text wrapper: 40vh dwell + 100vh fade + 40vh dwell. |
| `main.js:1112-1116` | muse intro fade-in: `'top 80%'` → `'top 40%'` (470→510vh) | `start: 'top top'`, `end: 'top+=100vh top'` on `.muse-section-wrapper` | Fade fires inside its wrapper. The previous section's tail-dwell (last 40vh of `.text-section-wrapper`) provides the "incoming dwell." |
| `main.js:1127-1128` | muse crossfade: `top+=350vh → top+=470vh` (900→1020) | `top+=200vh → top+=300vh` | Matches new `MUSE_INTRO_HOLD` and `MUSE_CROSSFADE`. |
| `main.js:1042, 1046, 1049` | transition text uses `power2.out`/`power2.in` inside a linear-scrubbed timeline | Use `ease: 'none'` everywhere, or remove the scrub from this timeline and play it at the explosion onset | Eliminates the only scrub-with-eased-keyframes block in the page; consistent semantics. (User-facing impact: a hair smoother fade.) |
| `main.js:1172-1178` | const-canvas fadeout: `'top 90%'` → `'top 60%'` (930→960) | `'top top'` → `'top+=40vh top'` on `.comet-collab-wrapper` | Triggers inside its own wrapper. 40vh window matches the "incoming dwell" of the muse→comet anchor. |
| `main.js:1188-1193` | comet intro fade-in: `'top 80%'` → `'top 40%'` (940→980) | `'top top'` → `'top+=80vh top'` on `.comet-collab-wrapper` | Inside-wrapper, 80vh fade — slightly longer than canonical because comet intro carries five draggable images that need time to register visually. (Defensible exception; flag in PR.) |
| `main.js:1209-1210` | methods fade: `top+=100vh → top+=200vh` | `top+=80vh → top+=180vh` | Matches new `COMET_INTRO_PAUSE`. |
| `main.js:1224-1225` | crossfade: `top+=360vh → top+=480vh` | `top+=260vh → top+=360vh` | Matches new `COMET_CROSSFADE_START`. |

### D. Optional polish (defer if time-boxed)

- Add `ease: 'none'` explicitly to every `.fromTo()` inside scrubbed timelines so the "scrub linearity" rule is visible at the call site. Today most omit it (defaults to power-style on opacity); a few set `ease: 'none'` (e.g. `main.js:1139,1146,1151,1157,1241,1247`). Consistency reduces surprise.

---

## Risk notes

1. **Total page height shrinks** from ~1820vh (`400 + 150 + 470 + 600 + 100 events` floor) to ~1380vh (`400 + 180 + 300 + 400 + 100`). That is a **~24% shorter scroll**. On trackpads with momentum this is a feature. On wheels with discrete clicks this halves perceived "weight." Worth verifying with the user before implementation.

2. **`ScrollTrigger.refresh()` on resize** (`main.js:955`) recomputes pixel positions of every trigger. Since all proposed triggers use vh-based offsets relative to their wrapper, refresh behaviour is unchanged. No new risk.

3. **`anticipatePin: 1`** is set on the muse and comet triggers (`main.js:1117, 1131, 1178, 1194, 1213, 1228`). Shrinking the wrappers does not affect the `anticipatePin` window — but if any new trigger is added, keep this flag for parity.

4. **Mobile vh ≠ desktop vh.** All proposed values are relative — they scale with viewport. The Q is whether 100vh feels right on a 700px-tall iPhone (=700px scroll for one transition vs. ~1080px on desktop). Past tuning (the doc-cited "≥100vh" rule, `docs/TECHNICAL-SPEC.md:30`) treats this as fine. Worth a manual check on iPhone.

5. **Text reveal currently begins during the intro explosion.** Removing the overlap (proposed) means the user gets a beat of pure black starfield between explosion settle and text fade-in. That is the desired "subtle resistance." But it is a perceptible behaviour change; flag it in the PR description.

6. **Muse intro hold cut from 390vh to ~160vh** means users have less time on the muse-intro framing. The two intro paragraphs are short (one sentence top, one bottom). 160vh is ~1.6 viewports of dwell, which is still long enough to read. If the team wants a slower read, raise `MUSE_INTRO_HOLD` to 250 (and `MUSE_TOTAL` to 350); the rhythm survives because the *anchor* (40+100+40) stays canonical, only the muse-intro internal hold changes.

7. **The comet intro 80vh fade-in is the only intentional exception** to the 100vh canon. If the floating-images dwell needs more, raise to 100 — but then `COMET_INTRO_PAUSE` should also bump to 100 to keep "fade + read = 80+80" balanced.

8. **Timeline overlap at `main.js:1138-1158` (muse crossfade)** keeps four opacity tweens at offset `0` — the relative simultaneity is unchanged; only the outer scrollTrigger range moves. No risk.

---

## Scope decision (locked in 2026-06-01)

**Events page is being trimmed to Partnership only** before this scroll plan is implemented. The Stardust + Horizon subsections are being deleted (`index.html:377–406`), `events-background-canvas` is being removed, and a small breathing space sits between the partnership row and the static footer.

**Implication for the rhythm calculations above:** the events page contribution to total page height drops further than this plan assumed. After deletion, expect the page to be even shorter than the projected ~24% reduction. The 40/100/40 anchor at the comet → events junction still applies; the post-events tail is just shorter. Re-measure total height after the trim before locking in `EVENTS_PRELUDE` or final wrapper values.

The `comet → events` transition junction is unaffected — the partnership block is what receives the fade-in.

---

## Open questions for the user

1. **Total page height drops ~24% (now slightly more after the events trim).** Is the shorter overall scroll acceptable, or should we keep total height by adding `MUSE_INTRO_HOLD` and a longer `EVENTS_PRELUDE` to absorb the slack?

2. **Anchor size = 40 / 100 / 40.** Is "subtle" closer to 30 / 100 / 30 (tighter, faster) or 60 / 100 / 60 (slower, more deliberate)? Recommend 40/100/40 as the starting point and tune by feel after first implementation.

3. **Intro→text junction** currently has zero dwell. The proposed change introduces ~40vh of pure black-starfield dwell between the explosion settling and the mission text fading in. Confirm that is the intent — alternative is to keep the small overlap (10vh) so the explosion's settle blends into the fade-in.

4. **Muse intro paragraphs**: cut hold from ~390vh to ~160vh. Does the team consider that enough read time, or is 250–300vh required? Affects only the muse-internal pacing, not the inter-section rhythm.

5. **Transition text behaviour** (`main.js:1030-1050`). Three keyframes (fade in, hold, fade out) on a single 78vh window. After the fix to `ease: 'none'` it will read more linear. Is that acceptable, or do we want to widen the window to ~120vh to match the canonical anchor (and thereby cut into the orbit/explosion phases)?

6. **Dead `SCROLL_TIMING` constants** (`COMET_LOGO_MOVEMENT`, `COMET_MOVEMENT_START`, `COMET_BOTTOM_HOLD`, `COMET_PHASE_DURATION`, `COMET_PHASE_COUNT`). Confirm they can be deleted — or are they reserved for an in-progress feature not yet in `main.js`?
