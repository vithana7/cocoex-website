// Spiral-galaxy particle field for the muse popup. Colored dots orbit the disc
// (faster near the core → trailing spiral arms) while drifting inward, vanishing
// as they fall into the card. 2D canvas, drawn by the shared gated Renderer loop
// (no private RAF). Centered on the live card rect so it tracks the disc.
export function createMuseGalaxy(canvasId, options = {}) {
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
  const COUNT = options.count || 120;

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

    _maxR() {
      return Math.max(120, Math.min(this.w, this.h) * 0.6);
    },

    seed() {
      const maxR = this._maxR();
      const core = maxR * 0.18;
      this.particles = [];
      for (let i = 0; i < COUNT; i++) {
        // Bias toward the outer edge so the field reads denser where it starts.
        this.particles.push(this._spawn(core + (maxR - core) * Math.pow(Math.random(), 0.45)));
      }
    },

    _spawn(r) {
      // Bias spawn angle into two loose arms for a galaxy read.
      const arm = (Math.random() < 0.5 ? 0 : Math.PI);
      return {
        r,
        theta: arm + (Math.random() - 0.5) * 1.6 + r * 0.012,
        size: 0.8 + Math.random() * 1.8,
        spin: 0.85 + Math.random() * 0.3,
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

      // Center + core radius from the live card rect (falls back to canvas center).
      let cx = this.w / 2, cy = this.h / 2, core = this._maxR() * 0.18;
      if (this.cardEl) {
        const rect = this.cardEl.getBoundingClientRect();
        if (rect.width) {
          cx = rect.left + rect.width / 2;
          cy = rect.top + rect.height / 2;
          core = rect.width * 0.5;
        }
      }
      const maxR = this._maxR();
      const [r, g, b] = this.color;

      // Aspect stretch: on portrait the circular field (maxR = min(w,h)) leaves a
      // landscape band in a tall viewport — stretch the drawn Y so it extends up/down.
      // Desktop (landscape) stays sy=1 → unchanged circular look.
      const sy = this.h > this.w ? Math.max(1, Math.min(2.2, (this.h / this.w) * 0.85)) : 1;

      const STREAK = 0.05; // seconds of motion the streak trails behind the head

      ctx.clearRect(0, 0, this.w, this.h);
      ctx.globalCompositeOperation = 'lighter';
      ctx.lineCap = 'round';

      for (const p of this.particles) {
        // Polar velocity rates (used for both motion and the streak direction).
        const omega = p.spin * (0.25 + (core / Math.max(p.r, 1)) * 1.1);
        const dr = -(18 + 160 * (core / Math.max(p.r, 1)));   // inward, accelerates near rim
        if (!this.reduced) {
          p.theta += omega * dt;
          p.r += dr * dt;
          // Stop AT the rim — merge onto the card's edge/outline, never over the face.
          if (p.r <= core) { Object.assign(p, this._spawn(maxR), { r: maxR }); continue; }
        }
        const cosT = Math.cos(p.theta), sinT = Math.sin(p.theta);
        const x = cx + cosT * p.r;
        const y = cy + sinT * p.r * sy;

        // alpha: fade in from the outer edge → brighten approaching the rim (punch through
        // the glow) → fully dissolve in the thin band just OUTSIDE the rim, so particles
        // merge onto the outline and vanish exactly at `core`.
        const fadeIn = Math.min(1, (maxR - p.r) / (maxR * 0.25));
        const dissolve = Math.min(1, (p.r - core) / (core * 0.25));
        const boost = 1 + 0.8 * Math.max(0, Math.min(1, (core * 1.3 - p.r) / (core * 0.3)));
        const a = Math.max(0, Math.min(1, fadeIn * dissolve * 0.9 * boost));
        if (a <= 0.01) continue;
        const sz = p.size * (0.7 + (1 - p.r / maxR) * 0.8);

        // Streak: tail trails opposite the velocity, length ∝ speed (longer as it's
        // sucked in). Cartesian velocity from the polar rates above.
        const vx = dr * cosT - p.r * sinT * omega;
        const vy = (dr * sinT + p.r * cosT * omega) * sy;
        const tx = x - vx * STREAK, ty = y - vy * STREAK;

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
