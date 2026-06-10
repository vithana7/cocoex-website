// 5 draggable process images. Document-level touchmove is PASSIVE — scroll is
// blocked mid-drag only via element.touchAction='none' (set on drag start,
// cleared on end). Do NOT add { passive: false } back; it kills mobile scroll.

export const FloatingProcesses = {
  processes: [],
  dragged: null,
  offsetX: 0,
  offsetY: 0,
  isDragging: false,

  init() {
    this.processes = Array.from(document.querySelectorAll('.floating-process'));
    if (!this.processes.length) return;

    this.setInitialPositions();

    this.processes.forEach((p) => {
      p.addEventListener('mousedown', (e) => this.startDrag(e, p));
      p.addEventListener('touchstart', (e) => this.startDrag(e, p), { passive: true });
    });

    document.addEventListener('mousemove', (e) => this.drag(e));
    document.addEventListener('mouseup', () => this.endDrag());
    document.addEventListener('touchmove', (e) => { if (this.isDragging) this.drag(e); }, { passive: true });
    document.addEventListener('touchend', () => this.endDrag());
  },

  setInitialPositions() {
    const positions = [
      { top: '15%', left: '10%' },
      { top: '25%', left: '75%' },
      { top: '80%', left: '8%' },
      { top: '60%', left: '80%' },
      { top: '75%', left: '45%' },
    ];
    this.processes.forEach((p, i) => {
      const pos = positions[i];
      if (pos) { p.style.top = pos.top; p.style.left = pos.left; }
    });
  },

  startDrag(e, el) {
    this.isDragging = true;
    this.dragged = el;
    el.style.touchAction = 'none';
    el.style.animation = 'none';
    const cx = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const cy = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const rect = el.getBoundingClientRect();
    this.offsetX = cx - rect.left;
    this.offsetY = cy - rect.top;
  },

  drag(e) {
    if (!this.isDragging || !this.dragged) return;
    const cx = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const cy = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    const parent = this.dragged.parentElement;
    const pr = parent.getBoundingClientRect();
    const er = this.dragged.getBoundingClientRect();
    let left = cx - pr.left - this.offsetX;
    let top = cy - pr.top - this.offsetY;
    left = Math.max(0, Math.min(left, pr.width - er.width));
    top = Math.max(0, Math.min(top, pr.height - er.height));
    this.dragged.style.left = `${left}px`;
    this.dragged.style.top = `${top}px`;
  },

  endDrag() {
    if (!this.isDragging) return;
    this.isDragging = false;
    if (this.dragged) {
      const idx = parseInt(this.dragged.getAttribute('data-process'), 10);
      const delay = (idx - 1) * 1.2;
      this.dragged.style.animation = `float 6s ease-in-out ${delay}s infinite`;
      this.dragged.style.touchAction = '';
      this.dragged = null;
    }
  },
};
