import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TIMELINE, vhToPx } from './timeline.js';
import { Renderer } from '../webgl/renderer.js';

// Derives the active section from scroll position and pushes it to the Renderer
// (which gates WebGL draws). Next-section starfields wake a LEAD_BUFFER early to
// avoid pop-in. Past the intro end, the intro overlay is hidden so its canvases
// don't bleed into the muse section.

const LEAD_VH = 75; // wake next section's surfaces this early

export function initSectionGate({ onSection } = {}) {
  const order = ['intro', 'muse', 'comet', 'events'];

  function sectionForScroll(scrollPx) {
    const lead = vhToPx(LEAD_VH);
    // events begins where comet ends.
    const cometEnd = vhToPx(TIMELINE.sections.comet.endVh);
    const museStart = vhToPx(TIMELINE.sections.muse.startVh);
    const cometStart = vhToPx(TIMELINE.sections.comet.startVh);

    if (scrollPx + lead >= cometEnd) return 'events';
    if (scrollPx + lead >= cometStart) return 'comet';
    if (scrollPx + lead >= museStart) return 'muse';
    return 'intro';
  }

  let current = 'intro';
  const set = (next) => {
    if (next === current) return;
    current = next;
    Renderer.setSection(next);
    if (onSection) onSection(next, order.indexOf(next));
  };

  ScrollTrigger.create({
    trigger: '.scroll-container',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => {
      const scrollPx = self.scroll();
      set(sectionForScroll(scrollPx));
    },
  });

  return { get current() { return current; } };
}
