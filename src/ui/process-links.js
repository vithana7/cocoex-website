// Faint starline connecting the 5 floating processes 1→…→5. Reads live screen
// positions so the line follows both the CSS bob and any drag.
//
// JANK FIX vs. the original: the old draw set ctx.shadowBlur=12 on EVERY frame
// (two blurred stroke passes) — the single worst per-frame cost in the comet
// section. Here the glow is faked with a cheap wide translucent stroke (no blur),
// and we skip the redraw entirely when no node moved beyond a sub-pixel epsilon.

export const ProcessLinks = {
  canvas: null,
  ctx: null,
  nodes: [],
  _last: null,

  init() {
    this.canvas = document.getElementById('process-link-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.nodes = Array.from(document.querySelectorAll('.floating-process'))
      .sort((a, b) => (+a.dataset.process) - (+b.dataset.process));
    this.resize();
  },

  resize() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._last = null; // force redraw after a resize
  },

  draw() {
    if (!this.ctx || this.nodes.length < 2) return;
    const base = this.canvas.getBoundingClientRect();
    const pts = this.nodes.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top };
    });

    // Skip if nothing moved appreciably since last frame.
    if (this._last && !this._moved(pts, this._last)) return;
    this._last = pts;

    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const path = () => {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.stroke();
    };

    // Wide soft pass (fakes the glow without shadowBlur).
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 6;
    path();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.10)';
    ctx.lineWidth = 3;
    path();
    // Crisp core.
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    path();
  },

  _moved(a, b) {
    const EPS = 0.4;
    for (let i = 0; i < a.length; i++) {
      if (Math.abs(a[i].x - b[i].x) > EPS || Math.abs(a[i].y - b[i].y) > EPS) return true;
    }
    return false;
  },
};
