import { PARTNERS } from '../data.js';

// Partnership logo strip — duplicated once for a seamless CSS marquee.
export function initEvents() {
  const container = document.getElementById('partnership-slideshow');
  if (!container) return;

  const track = document.createElement('div');
  track.className = 'partnership-track';

  const logoHTML = (p) => `
    <a href="#" target="_blank" rel="noopener noreferrer" aria-label="${p.name}">
      <img src="${p.src}" alt="${p.name}" class="partnership-logo" decoding="async">
    </a>`;

  const set = PARTNERS.map(logoHTML).join('');
  track.innerHTML = set + set;
  container.appendChild(track);
}
