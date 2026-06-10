// 5 process images, placed once and left to their CSS float animation. Drag was
// removed — users liked the fixed arrangement; the starline still tracks the
// live bob via getBoundingClientRect().

export const FloatingProcesses = {
  processes: [],

  init() {
    this.processes = Array.from(document.querySelectorAll('.floating-process'));
    if (!this.processes.length) return;
    this.setInitialPositions();
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
};
