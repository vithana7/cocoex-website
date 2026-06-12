// Static content + layout constants. The canonical muse data, constellation
// geometry, and partnership logos live here so sections import rather than
// hardcode them.

export const CONFIG = {
  refWidth: 1400,
  refHeight: 800,
  mobileBreakpoint: 768,
  tabletBreakpoint: 1024,
  finalDotSize: 150,
  finalDotSizeMobile: 100,
  totalRotations: 2,
};

export const isMobile = () => window.innerWidth <= CONFIG.mobileBreakpoint;

// Constellation dot fills (intro explosion). Distinct from muse brand hexes.
export const DOT_COLORS = [
  { hex: '#FF9F5A', r: 255, g: 159, b: 90 },
  { hex: '#FFEC8A', r: 255, g: 236, b: 138 },
  { hex: '#8A6FD1', r: 138, g: 111, b: 209 },
  { hex: '#7AAFD6', r: 122, g: 175, b: 214 },
  { hex: '#B0D89F', r: 176, g: 216, b: 159 },
  { hex: '#FF6B4A', r: 255, g: 107, b: 74 },
  { hex: '#A96FD2', r: 169, g: 111, b: 210 },
];

// Reference coords (1400x800 space), shifted 10% left. z = depth (-1 back, +1 front).
export const CONSTELLATION_REF = [
  { x: 406 - 140, y: 335, z: -0.3 },
  { x: 455 - 140, y: 668, z: 0.4 },
  { x: 754 - 140, y: 343, z: -0.5 },
  { x: 779 - 140, y: 504, z: 0.2 },
  { x: 1057 - 140, y: 128, z: 0.6 },
  { x: 1209 - 140, y: 378, z: -0.2 },
  { x: 1032 - 140, y: 629, z: 0.1 },
];

export const CONNECTIONS = [
  [0, 1], [0, 2], [1, 3], [2, 3], [2, 4], [4, 5], [5, 6], [6, 3],
].map((points) => ({ points }));

// The seven muses (canonical). var = CSS custom property for the brand hex.
export const MUSES = [
  { name: 'Lunes',  cause: 'Water',            color: 'var(--lunes)' },
  { name: 'Ares',   cause: 'Reforestation',    color: 'var(--ares)' },
  { name: 'Rabu',   cause: 'Human Rights',     color: 'var(--rabu)' },
  { name: 'Thunor', cause: 'Renewable Energy', color: 'var(--thunor)' },
  { name: 'Shukra', cause: 'Bio-diversity',    color: 'var(--shukra)' },
  { name: 'Dosei',  cause: 'Zero Hunger',      color: 'var(--dosei)' },
  { name: 'Solis',  cause: 'Well-being',       color: 'var(--solis)' },
];

// Partner logos in public/assets/images/partnerships/. `name` drives alt/aria text;
// `src` is URL-encoded so filenames with spaces resolve correctly.
// `url`: each partner's site or Instagram. Empty → the logo renders but isn't a link.
// Fill these in to make the logos clickable.
export const PARTNERS = [
  { name: 'C. Volpi',         file: 'C.Volpi.png',         url: 'https://www.cantinevolpi.it' },
  { name: 'CdTortona',        file: 'CdTortona.png',       url: 'https://www.comune.tortona.al.it' },
  { name: 'Lukso',            file: 'Lukso.png',           url: 'https://lukso.network' },
  { name: 'Peng',             file: 'Peng.png',            url: 'https://www.peng-drink.de/en-US' },
  { name: 'RJB',              file: 'RJB.png',             url: 'https://jungk-bibliothek.org' },
  { name: 'SFT',              file: 'SFT.png',             url: 'https://www.facebook.com/slowfoodterrederthona/' },
  { name: 'SIRX',             file: 'SIRX.png',            url: 'https://www.silentrixdorf.de' },
  { name: 'TN',               file: 'TN.png',              url: 'https://www.instagram.com/terranuda3000/' },
  { name: 'Vinili e Vinelli', file: 'Vinili e vinelli.png', url: 'https://www.instagram.com/vinili_vinelli' },
  { name: 'WR',               file: 'WR.png',              url: 'https://wexrecords.bandcamp.com' },
].map((p) => ({ name: p.name, url: p.url || '', src: `assets/images/partnerships/${encodeURIComponent(p.file)}` }));

export function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}
export function easeOutBack(t) {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}
