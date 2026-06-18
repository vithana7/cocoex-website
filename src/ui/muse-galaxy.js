// Spiral-galaxy particle field for the muse popup. Colored dots orbit the disc
// (faster near the core → trailing spiral arms) while drifting inward, vanishing
// as they fall into the card. 2D canvas, drawn by the shared gated Renderer loop
// (no private RAF). Centered on the live card rect so it tracks the disc.
//
// "Deep galaxy" (immersive): the field FILLS the viewport (reach = the farthest
// screen corner from the disc), so particles stream in from every edge and pour
// into the disc — the disc is the gravitational eye. Each particle carries a
// DEPTH d∈[0,1]: near (1) = bigger/brighter/faster/longer-streak, far (0) = tiny/
// dim/slow → parallax. The whole field also turns slowly (globalTheta) so it reads
// volumetric, not a flat 2D swirl.
export function createMuseGalaxy(canvasId, options = {}) {
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
  const COUNT = options.count || 140;
  const GLOBAL_OMEGA = 0.03; // rad/s — slow overall turn of the whole field

  return {
    canvasId,
    canvas: null,
    ctx: null,
    w: 0,
    h: 0,
    particles: [],
    color: [255, 255, 255],
    cardEl: null,
    last: 0,
    reduced: false,
    globalTheta: 0,

    init() {
      this.canvas = document.getElementById(this.canvasId);
      if (!this.canvas) return;
      this.ctx = this.canvas.getContext('2d');
      this.cardEl = document.querySelector('.muse-card-wrapper');
      this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.resize();
      this.seed();
    },

    resize() {
      if (!this.canvas) return;
      const dpr = DPR();
      this.w = this.canvas.clientWidth;
      this.h = this.canvas.clientHeight;
      this.canvas.width = Math.max(1, Math.round(this.w * dpr));
      this.canvas.height = Math.max(1, Math.round(this.h * dpr));
      if (this.ctx) this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    },

    // Live geometry: center + core (disc rim, the sink) from the card rect, and
    // maxR = distance to the FARTHEST screen corner so the annulus core→maxR always
    // covers the whole viewport, wherever the disc sits (no off-screen cropping of
    // the motion, no top-heavy bunching).
    _geom() {
      let cx = this.w / 2, cy = this.h / 2, core = Math.min(this.w, this.h) * 0.12;
      if (this.cardEl) {
        const rect = this.cardEl.getBoundingClientRect();
        if (rect.width) {
          cx = rect.left + rect.width / 2;
          cy = rect.top + rect.height / 2;
          core = rect.width * 0.5;
        }
      }
      const maxR = Math.hypot(Math.max(cx, this.w - cx), Math.max(cy, this.h - cy));
      return { cx, cy, core, maxR };
    },

    seed() {
      const { core, maxR } = this._geom();
      this.particles = [];
      for (let i = 0; i < COUNT; i++) {
        // Mild outer-density bias (denser/dimmer at the rim, brighter into the disc).
        this.particles.push(this._spawn(core + (maxR - core) * Math.pow(Math.random(), 0.6)));
      }
    },

    _spawn(r) {
      // Bias spawn angle into two loose arms for a galaxy read; the r*0.012 twist
      // wraps the arms past a full turn over the large maxR, so they fill all around.
      const arm = (Math.random() < 0.5 ? 0 : Math.PI);
      return {
        r,
        theta: arm + (Math.random() - 0.5) * 1.6 + r * 0.012,
        size: 0.8 + Math.random() * 1.8,
        spin: 0.85 + Math.random() * 0.3,
        d: Math.random(), // depth: 0 = far (tiny/dim/slow) → 1 = near (big/bright/fast)
      };
    },

    setColor(hex) {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec((hex || '').trim());
      if (m) this.color = [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)];
    },

    render(now) {
      const ctx = this.ctx;
      if (!ctx) return;
      const dt = this.last ? Math.min(0.05, (now - this.last) / 1000) : 0.016;
      this.last = now;

      const { cx, cy, core, maxR } = this._geom();
      const [r, g, b] = this.color;

      // Slow overall turn (added at DRAW time, on top of each particle's own orbit).
      if (!this.reduced) this.globalTheta += GLOBAL_OMEGA * dt;
      const gt = this.globalTheta;

      const STREAK = 0.05; // seconds of motion the streak trails behind the head

      ctx.clearRect(0, 0, this.w, this.h);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      for (const p of this.particles) {
        const depth = p.d;
        const par = 0.8 + depth * 0.4; // parallax: near particles move a touch faster
        // Polar velocity rates (own orbit only — global turn is folded in at draw).
        const localOmega = p.spin * (0.25 + (core / Math.max(p.r, 1)) * 1.1) * par;
        const dr = -(18 + 160 * (core / Math.max(p.r, 1))) * par; // inward, accelerates near rim
        if (!this.reduced) {
          p.theta += localOmega * dt;
          p.r += dr * dt;
          // Stop AT the rim — merge onto the card's edge/outline, never over the face.
          if (p.r <= core) { Object.assign(p, this._spawn(maxR), { r: maxR }); continue; }
        }
        const ang = p.theta + gt;
        const cosT = Math.cos(ang), sinT = Math.sin(ang);
        const x = cx + cosT * p.r;
        const y = cy + sinT * p.r;

        // alpha: fade in from the outer edge → brighten approaching the rim (punch through
        // the glow) → fully dissolve in the thin band just OUTSIDE the rim, so particles
        // merge onto the outline and vanish exactly at `core`. Depth dims the far ones.
        const fadeIn = Math.min(1, (maxR - p.r) / (maxR * 0.25));
        const dissolve = Math.min(1, (p.r - core) / (core * 0.25));
        const boost = 1 + 0.8 * Math.max(0, Math.min(1, (core * 1.3 - p.r) / (core * 0.3)));
        const a = Math.max(0, Math.min(1, fadeIn * dissolve * 0.9 * boost * (0.35 + depth * 0.65)));
        if (a <= 0.01) continue;
        const sz = p.size * (0.7 + (1 - p.r / maxR) * 0.8) * (0.4 + depth * 1.2);

        // Streak: tail trails opposite the velocity, length ∝ speed (and depth, so near
        // particles draw longer light-streaks). Total angular velocity includes the global turn.
        const omegaTotal = localOmega + GLOBAL_OMEGA;
        const vx = dr * cosT - p.r * sinT * omegaTotal;
        const vy = dr * sinT + p.r * cosT * omegaTotal;
        const streak = STREAK * (0.5 + depth);
        const tx = x - vx * streak, ty = y - vy * streak;

        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a * 0.22})`; // soft glow streak
        ctx.lineWidth = sz * 3;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${a})`;        // bright core streak
        ctx.lineWidth = sz;
        ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(x, y); ctx.stroke();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`;          // head
        ctx.beginPath(); ctx.arc(x, y, sz * 0.9, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
    },
  };
}
