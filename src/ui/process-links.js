// Thin starline connecting the 5 floating processes 1→…→5. Reads live screen positions
// so the line follows the CSS bob. A bright light runs along the line 1→5 on a loop and
// SHIFTS HUE through the muse spectrum as it travels (red near 1 → purple near 5) — the
// "AI Mode" running-glow, in cocoex's own colours.
//
// JANK RULE (kept): never set ctx.shadowBlur per frame (the original's worst cost) —
// the glow is faked with cheap wide translucent strokes. The glint is animated, so we
// redraw every frame (no epsilon skip) but only with a handful of plain strokes.

// Muse hues in spectrum order (Ares red → … → Dosei purple).
const MUSE_SPECTRUM = [
  [0xD5, 0x4D, 0x2E], // Ares red
  [0xD4, 0x83, 0x48], // Solis orange
  [0xF8, 0xD8, 0x6A], // Thunor yellow
  [0x8C, 0xB0, 0x7F], // Rabu green
  [0x57, 0x83, 0xA6], // Lunes blue
  [0x5E, 0x47, 0xA1], // Shukra indigo
  [0x7F, 0x49, 0xA2], // Dosei purple
];

export const ProcessLinks = {
  canvas: null,
  ctx: null,
  nodes: [],

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
  },

  // `now` is the shared RAF timestamp (ms) from the Renderer — drives the glint.
  draw(now = 0) {
    if (!this.ctx || this.nodes.length < 2) return;
    const base = this.canvas.getBoundingClientRect();
    const pts = this.nodes.map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - base.left, y: r.top + r.height / 2 - base.top };
    });

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

    // Cool-silver base — thin, solid (fakes a soft glow without shadowBlur). Opacity
    // dropped ~20% from the previous pass so the running light reads as the brightness.
    ctx.setLineDash([]);
    ctx.lineDashOffset = 0;
    ctx.strokeStyle = 'rgba(200, 210, 225, 0.032)'; ctx.lineWidth = 4;    path();
    ctx.strokeStyle = 'rgba(200, 210, 225, 0.064)'; ctx.lineWidth = 2;    path();
    ctx.strokeStyle = 'rgba(214, 224, 238, 0.141)'; ctx.lineWidth = 0.75; path();

    // Travelling muse-spectrum comet (the toggle beam, running the wire). FLUID MOTION:
    // one continuous pass across the WHOLE path per cycle with a sinusoidal velocity
    // (easeInOutSine) — speed is zero ONLY at the two endpoints, never at the interior
    // processes, so it no longer stalls/jumps node-to-node like the old per-segment ease.
    // The streak length tracks instantaneous speed (motion blur: faster → longer), and
    // the loop seam (node 5 → node 1) is hidden by a short opacity fade so there's no
    // visible teleport. Glow = layered strokes, no shadowBlur.
    const segLen = [], cumStart = [0];
    let total = 0;
    for (let i = 1; i < pts.length; i++) {
      const L = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
      segLen.push(L); total += L; cumStart.push(total);
    }
    if (total > 0) {
      const nSeg = segLen.length;
      const RUN_MS = 3000, GAP_MS = 220;       // one 1→5 pass + a tiny seam pause
      const cycle = RUN_MS + GAP_MS;
      const t = now % cycle;
      if (t < RUN_MS) {
        const p = t / RUN_MS;                          // 0 at node 1 → 1 at node 5
        const eased = (1 - Math.cos(Math.PI * p)) / 2; // easeInOutSine (position)
        const speed = Math.sin(Math.PI * p);           // |velocity|: 0 at ends, 1 mid
        const head = eased * total;
        const glint = Math.min(150, total * 0.18) * (0.4 + 0.9 * speed); // stretch with speed
        const tail = Math.max(0, head - glint);
        const fade = Math.min(1, p / 0.1, (1 - p) / 0.1); // fade in/out so the seam is invisible

        const pointAt = (dist) => {
          let dd = Math.max(0, Math.min(total, dist));
          for (let i = 0; i < nSeg; i++) {
            if (dd <= segLen[i] || i === nSeg - 1) {
              const f = segLen[i] > 0 ? dd / segLen[i] : 0;
              return { x: pts[i].x + (pts[i + 1].x - pts[i].x) * f, y: pts[i].y + (pts[i + 1].y - pts[i].y) * f };
            }
            dd -= segLen[i];
          }
          return pts[pts.length - 1];
        };

        // Sub-path tail→head (include any node it spans), drawn with a spectrum gradient.
        const a = pointAt(tail), b = pointAt(head);
        const sub = [a];
        for (let i = 1; i < pts.length - 1; i++) {
          if (cumStart[i] > tail && cumStart[i] < head) sub.push(pts[i]);
        }
        sub.push(b);

        const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
        const n = MUSE_SPECTRUM.length - 1;
        MUSE_SPECTRUM.forEach((c, i) => grad.addColorStop(i / n, `rgb(${c[0]},${c[1]},${c[2]})`));

        const strokeSub = () => {
          ctx.beginPath();
          ctx.moveTo(sub[0].x, sub[0].y);
          for (let i = 1; i < sub.length; i++) ctx.lineTo(sub[i].x, sub[i].y);
          ctx.stroke();
        };
        ctx.strokeStyle = grad;
        ctx.globalAlpha = 0.30 * fade; ctx.lineWidth = 6;    strokeSub(); // soft colour halo
        ctx.globalAlpha = 0.95 * fade; ctx.lineWidth = 1.75; strokeSub(); // bright core
        ctx.globalAlpha = 1;
      }
    }
  },
};
