// SINGLE SOURCE OF TRUTH for scroll pacing.
//
// Declare each phase once, in order, with its vh duration. The builder turns the
// list into absolute {start,end} offsets (vh and px), groups phases by section,
// and writes the per-section heights back to the DOM as CSS custom properties.
// Change ONE number here and everything recascades — no hand-syncing CSS heights
// or magic fractions ever again.
//
// RHYTHM: 1 scroll = 100vh. Every fade-in is followed by a real hold so content
// never flashes past.

export const PHASES = [
  // ---- INTRO (section: intro) ----
  { id: 'intro.orbit',       section: 'intro', vh: 192 }, // logo grows + dots orbit, 2 rotations (tagline fades in over the back half)
  { id: 'intro.explosion',   section: 'intro', vh: 140 }, // constellation explodes + settles
  { id: 'intro.statement',   section: 'intro', vh: 80  }, // "Unleashing…" statement in/hold/out over the settled constellation
  { id: 'intro.mission',     section: 'intro', vh: 100 }, // smoke clears + mission fade-in
  { id: 'intro.missionHold', section: 'intro', vh: 160 }, // mission holds fully bright, then fades out

  // ---- MUSE (section: muse) ----
  { id: 'muse.fadein', section: 'muse', vh: 100 }, // intro logo + copy fade up
  { id: 'muse.hold',   section: 'muse', vh: 250 }, // intro holds fully readable
  { id: 'muse.switch', section: 'muse', vh: 100 }, // black→white + logo crossfade → orbit

  // ---- COMET (section: comet) ----
  { id: 'comet.introIn',    section: 'comet', vh: 100 }, // comet intro fades in
  { id: 'comet.introHold',  section: 'comet', vh: 100 }, // intro holds
  { id: 'comet.methodsIn',  section: 'comet', vh: 100 }, // methods/tabs panel fades in
  { id: 'comet.methodsHold',section: 'comet', vh: 100 }, // methods hold through closure
];

// How many vh into a section's first phase the constellation 2D canvas should
// finish hiding (overlaps comet.introIn). Kept here so it lives with the pacing.
export const COMET_CONST_HIDE_VH = 40;

function buildTimeline(phases) {
  const map = {};
  const sections = {}; // section -> { start, end }
  let cursor = 0;

  for (const p of phases) {
    const start = cursor;
    const end = cursor + p.vh;
    map[p.id] = {
      id: p.id,
      section: p.section,
      startVh: start,
      endVh: end,
      durationVh: p.vh,
    };
    if (!sections[p.section]) sections[p.section] = { startVh: start, endVh: end };
    sections[p.section].endVh = end;
    cursor = end;
  }

  const totalVh = cursor;
  return { phases: map, sections, totalVh };
}

export const TIMELINE = buildTimeline(PHASES);

// Convert a vh value to absolute pixels using the live viewport height.
export const vhToPx = (vh) => (vh / 100) * window.innerHeight;

// A phase descriptor with px offsets computed against the CURRENT viewport.
// ScrollTriggers read these inside their function-form start/end so they stay
// correct across resizes (paired with invalidateOnRefresh).
export function phase(id) {
  const p = TIMELINE.phases[id];
  if (!p) throw new Error(`Unknown timeline phase: ${id}`);
  return {
    ...p,
    startPx: () => vhToPx(p.startVh),
    endPx: () => vhToPx(p.endVh),
    // Offset (px) from the start of the phase's owning section.
    startFromSection: () => vhToPx(p.startVh - TIMELINE.sections[p.section].startVh),
    endFromSection: () => vhToPx(p.endVh - TIMELINE.sections[p.section].startVh),
  };
}

export function sectionSpan(name) {
  const s = TIMELINE.sections[name];
  return {
    startVh: s.startVh,
    endVh: s.endVh,
    durationVh: s.endVh - s.startVh,
  };
}

// Write section heights to :root as CSS custom properties so the markup/CSS
// never hardcode vh budgets. CSS reads e.g. height: var(--intro-h).
export function applyHeightsToCss() {
  const root = document.documentElement.style;
  for (const [name, span] of Object.entries(TIMELINE.sections)) {
    root.setProperty(`--${name}-h`, `${span.endVh - span.startVh}vh`);
  }
  root.setProperty('--total-h', `${TIMELINE.totalVh}vh`);
}
