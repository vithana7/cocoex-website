
# cocoex.xyz — To-Do & Improvement Backlog
Last updated: 2026-04-27

---

## 1. docs/ folder — context engineering for Claude sessions

**Goal:** Split the 794-line CLAUDE.md into focused topic files so Claude only loads
what is relevant to the task at hand, improving precision and reducing context noise.

**Proposed structure:**
```
docs/
  sections/
    landing.md        — intro starfield, orbiting dots, explosion (Section 1)
    text-reveal.md    — mission text fade-in (Section 2)
    muse.md           — muse intro page, orbit layout, popup modal (Sections 3–4)
    comet-collab.md   — comet intro + connected images (Sections 5–6)
    footer.md         — footer reveal, social links
  webgl.md            — shared shaders, canvases, master render loop
  animations.md       — GSAP patterns, full SCROLL_TIMING reference
  responsive.md       — (already exists) fluid typography, breakpoints
  debugging.md        — common issues, logging patterns, profiling workflow
```

CLAUDE.md becomes a short index: project summary, values, file map, pointers to docs/.
Each docs/ file is self-contained so it can be read alone at the start of a focused session.

---

## 2. (reserved)

---

## 3. Website design enhancements

### 3.1 Mobile: scroll not working
**Problem:** Scroll-driven animations break on mobile (exact device/browser TBC).

**Likely causes (in priority order):**
1. iOS Safari 100vh bug — browser chrome is included in 100vh, miscalculating sticky/fixed
   positions and causing GSAP ScrollTrigger to fire at wrong offsets.
2. Fixed-position overlay elements (.intro, .muse-intro-page) consuming touch events
   before they reach the scroll listener.
3. touch-action not set correctly — blocks native scroll on certain surfaces.
4. GSAP ScrollTrigger scrub stuttering during iOS momentum scrolling.

**Before touching code:** test on a real iOS Safari device (not DevTools emulation),
confirm which section breaks first, check debug scroll position logging.

---

### 3.2 Cocoex intro description: text legibility
**Section:** .text-section-wrapper (scroll 400–550vh) — the mission statement reveal.

**Likely issues:**
- Contrast: white text over the unified starfield canvas may lose contrast if the canvas
  brightness bleeds into this section.
- Font size: clamp(20px, 2.5vw, 36px) resolves to ~22–25px at mid-range viewports
  (900–1100px), which reads small given uppercase + justified styling.
- Justified alignment on mobile creates river gaps (uneven word spacing) at narrow widths.
- Line height / letter spacing may need loosening at larger sizes.

**Clarify before implementing:** is the primary complaint contrast, size, or spacing?
These require different fixes and should not be bundled into one change.

---

### 3.3 Muse: staged text slide-in
**Section:** .muse-intro-page (scroll 550–700vh) — currently fades in as a single block.

**Goal:** break content into distinct elements (overview paragraph, seven muses intro,
.highlight-muse hollow text) and animate each in sequentially as the user scrolls —
easier to read, more intentional pacing.

**Key decision before implementation:**
- Animation style: slide up from below (classic reveal), slide from side, or stagger fade?
- Duration: the current MUSE_INTRO_HOLD is 150vh — too short for 3–4 staged blocks
  without feeling rushed. Likely needs expanding in SCROLL_TIMING, which increases
  total scroll height.

---

### 3.4 Muse orbital: background brightness + logo clarity
**Two separate problems:**

**Background:** the WebGL gradient (main.js:1148-1289) blends 7 muse colors via simplex
noise and averages toward dark mid-tones. Fix is in the GLSL fragment shader — lift
base luminance or increase white mix toward center.

**Logo clarity:** .muse-orbit-item images may disappear against the dark gradient.
Check asset format first (should be transparent-background PNG or SVG). If assets are
correct, fix with CSS drop-shadow or filter on the orbit items.

**Note:** fixing background brightness may resolve logo clarity on its own — address
background first, then evaluate logos.

---

### 3.5 Muse popup: needs updating
**Section:** .muse-popup modal (main.js:1521-1719, index.html:245-260).

**Scope is undefined — clarify which of these applies before writing any code:**
- Content: text/images are outdated or placeholder?
- Design: layout, typography, or modal size needs rethinking?
- Interaction: bugs with open/close animation, Escape key, or click-outside?

This could be a 10-line text change or a full redesign of the modal module.
Define the scope first.

---

### 3.6 Comet steps: connecting line with traveling spark
**Section:** .comet-collab-connected-content — 5 process images in flex layout.
The .comet-connection-canvas element is already in the HTML, just not populated
(noted in CLAUDE.md as known technical debt).

**Three sub-problems — recommend shipping in this order:**

1. Static line rendering: draw white lines between image centers on the canvas.
   (scaffolding already exists)

2. Spark animation: animate a glowing point traveling along each line segment,
   looping via requestAnimationFrame with a radial gradient at the spark position.

3. Drag-responsive lines: if images become draggable, re-render lines in real time
   following image positions. Requires pointer event handling + drag state per image.
   This is a separate, more complex task — scope independently from 1+2.

---

### 3.7 Stardust/Horizon: content crowded toward bottom
**Section:** .comet-collab-intro at its bottom-hold state (after 280vh logo descent,
during the 150vh bottom hold added March 9, 2026).

**Problem:** the Stardust/Horizon text content sits too close to the bottom viewport
edge when the logo is in its descended position. The 150vh hold made this more
noticeable since users spend more time in this state.

**Likely cause:** the content's upward shift was calculated relative to the logo's
travel distance, not the resulting visual center. The vertical offset needs adjusting
so the content block is optically centered in the viewport during the bottom hold.

**Before implementing:** confirm on which viewport sizes the crowding is most visible
(desktop vs. mobile have different logo/content proportions).

---

### 3.8 Partners logos
**New content section — resolve these before implementation:**
- Placement: new section between comet-collab-2 and footer, integrated into footer,
  or a subtle row within the comet section?
- How many logos? Determines layout: flex row, grid, or horizontal marquee.
- Animation: slow marquee (common) vs. static grid (simpler, more accessible).
- Asset format: SVGs strongly preferred — scalable, no blur, CSS-invertible for
  dark/light background compatibility.

Adding as a dedicated section increases total scroll height (currently 1720vh).
Integrating into an existing section keeps it flat.

---

### 3.9 Stars missing in text section background
**Problem:** .text-section-wrapper (Section 2, scroll 400–550vh) sits between the
intro WebGL starfield and the unified starfield, leaving the mission text on a flat
dark background — visually disconnected from the rest of the site.

**Fix direction:** check whether #bg-canvas (intro starfield) is position: fixed.
If yes, it naturally covers all scroll positions and may just need its visibility
extended further into the scroll range rather than fading out early.
Alternatively, extend #unified-starfield-canvas top value to also cover this section.

**Before implementing:** scroll through the section and confirm exactly where the
stars disappear and reappear to scope the fix precisely.

---

### 4.0 RSS feed on Stardust / Horizon
*(Deferred — define feed source and display format before scoping)*

### 4.1 RJB asterisk: description placement
*(Deferred — needs design decision on layout)*

### 4.2 Footer: overlaps sections / should appear at page bottom only
*(Deferred — investigate z-index layering and reveal trigger timing)*

---

## 4. Website content
*(TBD)*

## 5. Accessibility
*(TBD)*

## 6. Iterate over implementation to optimise
*(TBD)*

## 7. Deploy
*(TBD)*
