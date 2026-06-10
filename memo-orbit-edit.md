# Muse Orbital — Card Redesign Plan (Section 3.4)

Planning doc for reworking the **orbiting muses** (not the popup — that's §3.5, done).
Code refs below are ground truth; verify line numbers before editing.

- **Markup:** `index.html:67–96` (`.muse-orbit-container` → 7× `.muse-orbit-item`)
- **Logic:** `src/sections/muse.js` (`MuseScroll` — `update`, `attachHandlers`)
- **Styles:** `src/styles/muse.css:168–222` (orbit items) — reuse the popup card recipe at `:318–440`
- **Popup reference (proven flip + disc):** `src/ui/muse-popup.js:129–137` (Y-flip), `muse.css:336–440` (disc/gradient/engrave)

---

## 1. Current state (proofed)

Each `.muse-orbit-item` (`muse.css:168`) is a flex column:
1. `.muse-image` → colored ring+glyph PNG (`muse/<name>.png`), `drop-shadow + saturate + brightness` (`muse.css:188`).
2. `.muse-text` → `<h3>` muse name in **solid black uppercase** (`muse.css:202`) + `<p>` (already `display:none`, `muse.css:220`).

`MuseScroll.update()` (`muse.js:52`) writes `transform: translate(...) scale(...)` + `zIndex` per frame to each item. The orbit **only pauses on `touchstart`** for 2s (`muse.js:118`) — on desktop there is **no hover pause**, so the muses keep drifting and are hard to click. The black name label reads heavy and flat against the off-white section.

---

## 2. Target (locked decisions)

Turn each orbiting muse into a **mini popup card**: a colored radial-gradient disc with the **white** symbol engraved on it. On **hover (desktop)** the orbit **freezes** and the card does a **3D flip** to reveal the muse **name**. Click still opens the full popup.

| # | Decision | Choice |
|---|----------|--------|
| 1 | Back face | **Name only** — colored disc, name centered, styled like the popup title |
| 2 | Disc fidelity | **Lighter** — radial gradient + white engraved symbol + noise grain + flip. **No** 3D pointer-tilt / shine-glare (odd on small drifting cards, and 7× `pointermove` is wasteful) |
| 3 | Touch | **Tap opens popup directly** — flip is a `@media (hover: hover)` desktop-only enhancement; mobile keeps current tap→open |

---

## 3. Technique (why this is safe)

A **pure-CSS 3D flip card** nested *inside* the JS-positioned item — the exact separation the popup already uses (positioned `.muse-card-wrapper` vs. flipping `.muse-card-shell`).

- **Don't flip the element JS transforms.** `MuseScroll.update` writes `translate/scale` to `.muse-orbit-item` every frame. The flip lives on an **inner** `.muse-orbit-card-shell`, so the per-frame transform and the hover flip never fight.
- **Self-contained 3D context.** The item's per-frame `translate/scale` is a 2D transform that flattens 3D for descendants — but `perspective` + `transform-style: preserve-3d` live on the inner card elements, forming their own 3D context (same as the popup). The item's `scale()` just scales the whole 3D card. Works.
- **Flip = CSS only.** `:hover → rotateY(180deg)` with a `transition`, two `backface-visibility: hidden` faces (back pre-rotated 180°). No GSAP, no per-frame JS for the flip.
- **Hover-freeze = one flag in `update()`.** No new RAF, no fighting the existing touch-pause.

---

## 4. Proposed structure

### 4.1 Markup (`index.html`, per item)
Restructure each `.muse-orbit-item`. **Keep `.muse-text` in the DOM (hidden)** — `attachHandlers` (`muse.js:83–101`) reads `<h3>` (name) and `<p>` (description) to build the popup's muse array; deleting it breaks the popup data source.

```html
<div class="muse-orbit-item" data-angle="0" data-color="#5783A6" data-popup-title="Lunes · Water">
  <div class="muse-orbit-card">                 <!-- perspective wrapper, hover target -->
    <div class="muse-orbit-card-shell">         <!-- preserve-3d, flips on hover -->
      <div class="muse-orbit-face muse-orbit-face--front">
        <div class="muse-orbit-disc">
          <img src="assets/images/muse/lunes-white.png" alt="Lunes" loading="lazy" decoding="async">
        </div>
      </div>
      <div class="muse-orbit-face muse-orbit-face--back">
        <div class="muse-orbit-disc">
          <span class="muse-orbit-name">Lunes</span>
        </div>
      </div>
    </div>
  </div>
  <div class="muse-text" aria-hidden="true"><h3>Lunes</h3><p>The Moon has pulled…</p></div>
</div>
```

Notes:
- Front `<img>` swaps `muse/<name>.png` → **`muse/<name>-white.png`** (white art, like the popup). The colored orbit PNGs become unused for the orbit.
- The visible **name now lives on the back face** (`.muse-orbit-name`); the `.muse-text h3` is hidden and kept only as data.

### 4.2 CSS (`src/styles/muse.css`)
Reuse the popup recipe — factor the shared disc gradient/noise/engrave into something both `.muse-card-inside`/`.muse-popup-image img` and the new `.muse-orbit-disc`/`.muse-orbit-face--front img` can share, or duplicate the few rules.

- **Hide old label:** `.muse-orbit-item .muse-text { display: none }` (replaces the visible `h3` styling at `:202–218`). Drop the `.muse-image` rules at `:180–194`.
- **`.muse-orbit-card`** — `width/height: var(--muse-orbit-image-size)`, `perspective: 600px`.
- **`.muse-orbit-card-shell`** — `position: relative; width/height: 100%; transform-style: preserve-3d; transition: transform 0.6s cubic-bezier(.2,.7,.2,1);`
- **Flip on hover (desktop only):**
  ```css
  @media (hover: hover) {
    .muse-orbit-item:hover .muse-orbit-card-shell { transform: rotateY(180deg); }
  }
  ```
- **`.muse-orbit-face`** — `position: absolute; inset: 0; border-radius: 50%; backface-visibility: hidden; -webkit-backface-visibility: hidden;`. `--back` gets `transform: rotateY(180deg)`.
- **`.muse-orbit-disc`** — the popup `.muse-card-inside` radial gradient (`var(--muse-color)` → `color-mix … #000`) + the SVG-noise `::after` grain. Set `--muse-color` per item (see JS) or inline.
- **`.muse-orbit-face--front img`** — popup engrave filter (`muse.css:431–440`): dark-below + light-above drop-shadows; ~78–80% of the disc.
- **`.muse-orbit-name`** — Canela, popup-title scale (clamp), `text-transform: uppercase`. **Contrast:** white-on-disc fails AA on light hues (Thunor `#F8D86A`, Rabu `#8CB07F`) — use a readable treatment (e.g. white text + soft dark text-shadow, or per-disc darken). Mirror whatever the popup title does.
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` → `.muse-orbit-card-shell { transition: none }` (instant flip, per site convention).

### 4.3 JS (`src/sections/muse.js`)
- **Hover-freeze the whole orbit.** Add a `hovering` flag; in `update()` (`:58`) only advance `animationTime` when **not** hovering and not in the touch-pause window:
  ```js
  if (!this.hovering && (!this.orbitPauseUntil || now >= this.orbitPauseUntil)) {
    this.animationTime += delta * this.orbitSpeed;
  }
  ```
  Wire `mouseenter`/`mouseleave` on each item (or delegate on `.muse-orbit-container`) → set/clear `this.hovering`. Freezing the *entire* orbit (not just the hovered card) is intentional — it makes every muse catchable, which is the core complaint.
- **Set the disc color once** in `init`/`attachHandlers`: `el.style.setProperty('--muse-color', el.getAttribute('data-color'))`.
- **Leave `attachHandlers` data sourcing untouched** — it still reads `.muse-text h3`/`p`; the popup array (incl. `-white.png` path) is already correct (`muse.js:83–101`).
- **No change to click/keyboard** — `click`/Enter/Space still `MusePopup.open(i)`. Touch unchanged (tap opens popup; the existing 2s `touchstart` pause stays).

### 4.4 A11y
- Keep `tabindex="0"` + `role="button"` + `aria-label` on the item (`muse.js:106–108`). The flip is decorative; the name is also announced via `aria-label` (`data-popup-title`), so the visually-hidden `.muse-text` can be `aria-hidden`.
- `:hover` flip has a `:focus-within` twin so keyboard focus also reveals the name:
  `@media (hover: hover){ .muse-orbit-item:focus-within .muse-orbit-card-shell { transform: rotateY(180deg) } }`
- Tap targets unchanged (existing `::before { inset: -16px }` halo at the mobile breakpoint).

---

## 5. Build order

1. **CSS first** (`muse.css`): add `.muse-orbit-card*` / `.muse-orbit-face*` / `.muse-orbit-disc` / `.muse-orbit-name`; hide `.muse-text`; remove old `.muse-image` + visible `h3` rules; hover/focus flip behind `@media (hover: hover)`; reduced-motion guard; reuse popup gradient/noise/engrave.
2. **Markup** (`index.html:67–96`): wrap each item's front/back faces; swap front img → `-white.png`; move name to `.muse-orbit-name`; keep `.muse-text` hidden + `aria-hidden`.
3. **JS** (`muse.js`): `hovering` flag in `update()` + enter/leave listeners; set `--muse-color` per item. Verify popup data array still builds.
4. **Verify:** flip is smooth (no z-fighting with the per-frame transform), orbit truly freezes on hover and resumes on leave, names legible on all 7 hues, mobile tap still opens the popup, reduced-motion = instant, keyboard focus reveals the name.

## 6. Risks / watch-list

- **3D flatten gotcha** — confirm `perspective` is on `.muse-orbit-card` and `preserve-3d` on `.muse-orbit-card-shell`; if the flip looks flat, the per-frame 2D transform is flattening the context (move perspective inward).
- **backface-visibility on iOS** — include the `-webkit-` prefix; Safari is the historical offender.
- **Name contrast** on light discs (Thunor/Rabu/Thunor) — don't ship white-on-yellow without a shadow/darken.
- **Depth scale** — the item still scales 0.65→1.05 by depth (`muse.js:67`); the flip card scales with it, which is fine. Back-face text stays legible at min scale — check at `scale(0.65)`.
- **Don't re-add pointer tilt** to orbit cards (decision 2) and **don't delete `.muse-text`** (popup data source).
