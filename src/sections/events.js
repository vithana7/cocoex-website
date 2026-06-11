import { PARTNERS } from '../data.js';

// Partnership logo strip — duplicated once for a seamless CSS marquee.
export function initEvents() {
  const container = document.getElementById('partnership-slideshow');
  if (!container) return;

  const track = document.createElement('div');
  track.className = 'partnership-track';

  // Real external link when the partner has a `url`; otherwise a non-clickable wrapper
  // (no href → not focusable/navigable) so the marquee layout stays identical.
  const logoHTML = (p) => {
    const attrs = p.url
      ? `href="${p.url}" target="_blank" rel="noopener noreferrer"`
      : 'aria-disabled="true" style="cursor: default"';
    return `
    <a ${attrs} aria-label="${p.name}">
      <img src="${p.src}" alt="${p.name}" class="partnership-logo" decoding="async">
    </a>`;
  };

  const set = PARTNERS.map(logoHTML).join('');
  track.innerHTML = set + set;
  container.appendChild(track);
}
