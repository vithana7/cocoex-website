// Single RAF loop. Every animated surface registers a layer with the section(s)
// it belongs to; the loop only renders layers whose section is currently active.
// This is the core jank guard: off-screen WebGL never touches the GPU, and there
// is exactly one requestAnimationFrame for the whole page.

export const Renderer = {
  layers: [],
  section: 'intro',
  running: false,
  visible: true,
  _raf: null,

  // layer: { sections: ['muse'], render(now) {}, active(section) -> bool? }
  add(layer) {
    this.layers.push(layer);
    return layer;
  },

  setSection(section) {
    this.section = section;
  },

  _isActive(layer) {
    if (typeof layer.active === 'function') return layer.active(this.section);
    return layer.sections.includes(this.section);
  },

  start() {
    if (this.running) return;
    this.running = true;
    const tick = (now) => {
      if (this.visible) {
        for (const layer of this.layers) {
          if (this._isActive(layer)) layer.render(now);
        }
      }
      this._raf = requestAnimationFrame(tick);
    };
    this._raf = requestAnimationFrame(tick);

    document.addEventListener('visibilitychange', () => {
      this.visible = !document.hidden;
    });
  },

  stop() {
    if (this._raf) cancelAnimationFrame(this._raf);
    this.running = false;
  },
};
