import { DPR } from '../webgl/gl-context.js';

// Comet→toggle DIVE swirl, rendered into a 2D canvas (NOT a CSS-transformed <img>).
//
// Why a canvas: the dive used to be a hi-res SVG <img> scaled via CSS transform. On a fast
// reverse scrub the compositor couldn't keep that giant layer's paint in sync with the WebGL
// ripple (which repaints instantly), so a full-screen ripple flashed over a tiny/pixelated
// swirl. Drawing the swirl into a canvas that the SAME `Renderer` paints every frame — from the
// SAME scrub value as the ripple — makes the two surfaces present together at any scroll speed
// (lenis.dev renders its whole zoom in one canvas for exactly this reason). `drawImage` from a
// hi-res offscreen raster is also crisp at every visible scale (no pixelation), and the swirl is
// positioned from the on-page logo's LIVE rect each frame, so the take-over aligns on any device
// (self-corrects mobile URL-bar / dvh drift).
//
// This module also DRIVES the burst ripple (centre + pulse) so both come from one place — they
// can never desync. Add it as a `Renderer` layer BEFORE the ripple layer so the ripple renders
// with fresh state.

const SVG_SRC = 'assets/images/comet-collabs/comet-mark-white.svg';
const RASTER_H = 2048;          // offscreen raster height (crisp source; px)
const SWIRL_AR = 255 / 247.28;  // comet-mark viewBox width/height

// Dive geometry (was in comet.js). The swirl sits over the on-page logo's swirl region, then
// flies into a thick WHITE point of itself until that white fills the viewport.
export const SWIRL_CX = 0.2415; // swirl centre as a fraction of the on-page LOGO width
const SWIRL_CY = 0.50;
const WHITE_OX = 0.46, WHITE_OY = 0.54; // the white point as fractions of the swirl box (scale pivot)
const WHITE_R = 0.041;          // white-point disc radius as a fraction of the swirl width
const FILL_MARGIN = 1.9;        // overscan so the white fully covers EARLY in the warp (~p0.8),
                                // not just at the exact p=1 frame — no transient dark corner on a
                                // fast pass. Symmetric (white point drifts to centre), all white.
const DRIFT_END_P = 0.75;       // white point reaches screen centre by this dive progress
// Ripple pulse window in dive-progress p (matches the old [unit28,unit148] over the [22,172] dive).
const PULSE_IN_P = 0.04, PULSE_SPAN_P = 0.80;

const MASK_URL = `url(${SVG_SRC})`; // the swirl SVG doubles as the methods reveal mask

const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const smoothstep = (t) => t * t * (3 - 2 * t);

export function createCometDive(canvasId, burst) {
  return {
    canvasId,
    burst,
    canvas: null,
    ctx: null,
    bmp: null,        // pre-rasterised hi-res swirl
    ready: false,
    p: 0,             // dive progress 0..1 (linear; ease applied here)
    appear: 0,        // take-over fade-in 0..1
    reveal: 0,        // 0..1 cross-dissolve: canvas white -> methods seen THROUGH the swirl
    logoRect: null,   // live on-page logo rect {x,y,width,height}
    methodsEl: null,  // the static methods panel masked by the swirl as it grows
    _masked: false,   // is the inline mask currently applied? (avoid clearing every frame)
    _fixed: false,    // is the panel currently `position:fixed` (full-viewport during the dive)?
    _sizedW: 0,
    _sizedH: 0,

    init() {
      this.canvas = document.getElementById(this.canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.resize();
      // Rasterise the swirl SVG once into an offscreen canvas (fast bitmap scaling thereafter).
      const img = new Image();
      img.decoding = 'async';
      img.onload = () => {
        const off = document.createElement('canvas');
        off.height = RASTER_H;
        off.width = Math.round(RASTER_H * SWIRL_AR);
        off.getContext('2d').drawImage(img, 0, 0, off.width, off.height);
        this.bmp = off;
        this.ready = true;
      };
      img.src = SVG_SRC;
      if (this.burst) this.burst.setPulse(0);
    },

    resize() {
      if (!this.canvas) return;
      const dpr = DPR();
      const w = window.innerWidth, h = window.innerHeight;
      this.canvas.width = w * dpr;
      this.canvas.height = h * dpr;
      this.canvas.style.width = w + 'px';
      this.canvas.style.height = h + 'px';
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._sizedW = w;
      this._sizedH = h;
    },

    // Fed every frame by comet.js's timeline onUpdate.
    setState({ p, appear, reveal, logoRect, methodsEl }) {
      if (p != null) this.p = p;
      if (appear != null) this.appear = appear;
      if (reveal != null) this.reveal = reveal;
      // The mask is applied in draw(), but draw() only runs while comet is the active gated layer.
      // If a fast scrub/jump lands OUTSIDE the dive while comet is already gated off (jumped before
      // the dive, or past it into events), draw() never runs to clean up → the panel would stay
      // masked. setState is driven by the timeline onUpdate (fires regardless of gating), so clear
      // here when out of band. Out-of-band = the dive is inactive (`appear<=0`) OR past the reveal
      // (`>=0.999`). NOT `reveal<=0`: the mask now applies from reveal==0 (the take-over), so
      // clearing at reveal==0 would fight draw()'s per-frame re-apply and could re-flash.
      if (this._masked && (this.appear <= 0 || this.reveal >= 0.999)) this.clearMask();
      if (logoRect) this.logoRect = logoRect;
      if (methodsEl !== undefined) this.methodsEl = methodsEl;
      // Re-evaluate the fixed/sticky position here too: setState is driven by the timeline
      // onUpdate (fires on any scrub/jump regardless of Renderer gating), so a fast jump OUT of
      // the comet section — where draw() stops running — still releases `.dive-fixed` correctly.
      this.updateFixed();
    },

    // Drop the inline swirl mask so the methods panel is fully painted + interactive (and
    // nothing sticks on a reverse scrub back out of the dive). NOTE: does NOT touch `.dive-fixed`
    // (the position) — that's managed by updateFixed() on its own geometry-based schedule.
    clearMask() {
      if (!this.methodsEl) return;
      const st = this.methodsEl.style;
      st.webkitMaskImage = st.maskImage = '';
      st.webkitMaskSize = st.maskSize = '';
      st.webkitMaskPosition = st.maskPosition = '';
      this._masked = false;
    },

    // `.dive-fixed` (position:fixed, full viewport) is applied by GEOMETRY, decoupled from the
    // reveal/mask: while the dive is active AND the tabs panel has not pinned yet (`parent.top>1`).
    // Why not tie it to `reveal>0`: toggling `position` is a LAYOUT change that can lag a frame
    // under heavy scroll, and if it lands while the masked toggle is visible at a mid-pin spot you
    // get a 1-frame hard seam (CDP-reproduced). By engaging `fixed` EARLY (during the take-over,
    // panel still opacity:0/invisible) and releasing it only when the panel naturally pins
    // (`parent.top<=0`, where sticky and fixed both sit at top:0), no position change ever happens
    // while the toggle is on-screen at a non-pinned position → the seam is impossible.
    updateFixed() {
      if (!this.methodsEl) return;
      const parent = this.methodsEl.parentElement;
      const want = this.appear > 0 && !!parent && parent.getBoundingClientRect().top > 1;
      if (want !== this._fixed) {
        this.methodsEl.classList.toggle('dive-fixed', want);
        this._fixed = want;
      }
    },

    draw() {
      const ctx = this.ctx;
      if (!ctx) return;
      // Self-heal the backing store if the viewport drifted (iOS URL bar resizes the 100dvh
      // panel without a reliable window resize — same fix as ProcessLinks).
      if (Math.abs(window.innerWidth - this._sizedW) > 1 || Math.abs(window.innerHeight - this._sizedH) > 1) {
        this.resize();
      }
      const vw = window.innerWidth, vh = window.innerHeight;
      ctx.clearRect(0, 0, vw, vh);

      // Position the panel (fixed/sticky) every frame on its own geometry schedule — runs even
      // when there's nothing to draw, so `fixed` is released the moment the dive isn't active.
      this.updateFixed();

      // Nothing to show before the take-over (or if the raster/anchor isn't ready).
      if (!this.ready || this.appear <= 0 || !this.logoRect) {
        if (this.burst) this.burst.setPulse(0);
        if (this._masked) this.clearMask(); // reversed out before the dive — drop any mask
        return;
      }

      const r = this.logoRect;
      const H0 = r.height;             // swirl height == on-page logo height
      const W0 = H0 * SWIRL_AR;
      const cx0 = r.x + r.width * SWIRL_CX; // on-page swirl centre
      const cy0 = r.y + r.height * SWIRL_CY;
      // White point at base (screen) = the scale pivot, offset from the swirl centre.
      const wpx0 = cx0 + (WHITE_OX - 0.5) * W0;
      const wpy0 = cy0 + (WHITE_OY - 0.5) * H0;

      const p = this.p;
      const sp = p * p * p;            // power3.in => fast warp into white at the end
      const need = Math.hypot(vw, vh) / 2;
      const endFactor = (need * FILL_MARGIN) / (WHITE_R * W0);
      const S = 1 + (endFactor - 1) * sp;

      // Drift the white point to the viewport centre as we dive (symmetric white fill).
      const drift = smoothstep(clamp01(p / DRIFT_END_P));
      const wpx = wpx0 + (vw / 2 - wpx0) * drift;
      const wpy = wpy0 + (vh / 2 - wpy0) * drift;

      // Draw the swirl scaled around its white point (the point that stays fixed under scale).
      // The swirl top-left doubles as the methods reveal mask's position/size.
      const dw = W0 * S, dh = H0 * S;
      const sx = wpx - WHITE_OX * dw;
      const sy = wpy - WHITE_OY * dh;
      // Fade the canvas white as the masked toggle takes over (cross-dissolve white -> text).
      ctx.globalAlpha = this.appear * (1 - this.reveal);
      ctx.drawImage(this.bmp, sx, sy, dw, dh);
      ctx.globalAlpha = 1;

      // Reveal the methods toggle THROUGH the swirl: mask the (static, full-screen) methods
      // panel with the SAME swirl SVG, sized/positioned to the swirl's live rect — so the toggle
      // shows through the growing logo. Fed from the same numbers as drawImage in the SAME frame,
      // so the window can't desync from the swirl at any scroll speed. mask-position is relative
      // to the panel's own box, so offset by its live rect (robust whether pinned or mid-pin).
      if (this.methodsEl) {
        if (this.reveal >= 0.999) {
          // Fully revealed: the window covers the screen — drop the mask so the panel is clean
          // and fully interactive (no lingering inline mask / repaint cost).
          if (this._masked) this.clearMask();
        } else {
          // reveal in [0, 0.999): apply the swirl mask — INCLUDING reveal==0. comet.js sets the
          // methods panel opaque at the reveal-start unit; if the mask isn't applied that same
          // frame (the old `reveal > 0` skipped the reveal==0 boundary), the panel is opaque-but-
          // unmasked for ~1 scroll step and the full light SECTION background flashes ("the
          // background turns white" — CDP-confirmed at the reveal start). Masking from reveal==0
          // (panel still opacity:0 before the reveal-start unit, so harmless) means it's NEVER
          // opaque-but-unmasked. Position is already `fixed` via updateFixed(), so no layout seam.
          const m = this.methodsEl.getBoundingClientRect();
          const st = this.methodsEl.style;
          st.webkitMaskImage = MASK_URL;
          st.maskImage = MASK_URL;
          st.webkitMaskSize = st.maskSize = `${dw}px ${dh}px`;
          st.webkitMaskPosition = st.maskPosition = `${sx - m.left}px ${sy - m.top}px`;
          this._masked = true;
        }
      }

      // Drive the ripple from the SAME state: centre on the white point, pulse from p. One
      // source of truth → ripple and swirl can never desync, any scroll speed/direction.
      if (this.burst) {
        this.burst.setCenter(wpx / vw, 1 - wpy / vh);
        this.burst.setPulse(clamp01((p - PULSE_IN_P) / PULSE_SPAN_P));
      }
    },
  };
}
