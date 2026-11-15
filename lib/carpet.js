// The site's one motif: a Tabriz "lachak-toranj" carpet drawn the way carpet cartoons are,
// one knot per grid cell. Pure functions only, used on the server (SVG strips) and in the browser (canvas).

export const C = {
  NIGHT: '#060918', NAVY: '#0D1440', COB: '#2B4FE0', LAKI: '#A3182B', LAKD: '#7C1021',
  FIR: '#19C7BD', GOLD: '#F2B83B', CREAM: '#F6EBD3', ROSE: '#F08C7A',
};
export const GW = 120;
export const GH = 168;

// Level sets of this are eight-pointed stars, the shape behind most medallions.
export const star = (x, y) => Math.min(Math.max(x, y), (x + y) / 1.4142);

export function knot(i, j) {
  const { NIGHT, NAVY, COB, LAKI, LAKD, FIR, GOLD, CREAM, ROSE } = C;
  const x = Math.abs(i - 59.5), y = Math.abs(j - 83.5);
  const ex = 59.5 - x, ey = 83.5 - y, e = Math.min(ex, ey);
  if (e < 2) return (i + j) & 1 ? NAVY : GOLD; // outer guard
  if (e < 3) return NIGHT;
  if (e < 13) { // main border: a row of small stars
    const s = ex < ey ? j : i, u = Math.abs((s % 14) - 6.5), d = Math.abs(e - 8), v = star(u, d);
    if (v < 1.2) return CREAM;
    if (v < 2.6) return GOLD;
    if (v < 4) return FIR;
    if (u > 5.6 && d < 1.6) return ROSE;
    return NAVY;
  }
  if (e < 14) return NIGHT;
  if (e < 16) return (i + j) & 1 ? FIR : CREAM; // inner guard
  if (e < 17) return NIGHT;
  const cv = star(42.5 - x, 66.5 - y); // corner pieces (lachak)
  if (cv < 20) return [CREAM, GOLD, NAVY, FIR, NAVY, COB, NAVY, ROSE, NAVY, GOLD][Math.floor(cv / 2)];
  const mv = star(x, y * 0.8); // central medallion (toranj)
  if (mv < 24) return [GOLD, CREAM, LAKI, CREAM, FIR, NAVY, GOLD, NAVY, COB, NAVY, FIR, CREAM][Math.floor(mv / 2)];
  const pv = star(x, Math.abs(y - 51)); // pendants above and below the medallion
  if (pv < 7) return [CREAM, GOLD, NAVY, FIR][Math.floor(pv / 1.75)];
  const a = ((i + (Math.floor(j / 10) % 2) * 5) % 10) - 4.5, b = (j % 10) - 4.5, m = Math.abs(a) + Math.abs(b);
  if (m < 1.2) return GOLD; // small flowers scattered on the red field
  if (m < 2.6) return CREAM;
  if (m < 3.6) return LAKD;
  return LAKI;
}

function svgUri(w, h, colorAt) {
  let rects = '';
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; ) {
      const c = colorAt(i, j);
      let n = 1;
      while (i + n < w && colorAt(i + n, j) === c) n++;
      rects += `<rect x="${i}" y="${j}" width="${n}" height="1" fill="${c}"/>`;
      i += n;
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">${rects}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

const PALETTES = [
  [C.NAVY, C.FIR, C.CREAM, C.GOLD],
  [C.LAKI, C.CREAM, C.GOLD, C.NAVY],
  [C.COB, C.CREAM, C.FIR, C.NAVY],
  [C.GOLD, C.NAVY, C.CREAM, C.LAKI],
  [C.FIR, C.NAVY, C.CREAM, C.LAKI],
];

let cache;
/** CSS custom properties with the carpet border strip and five repeating cover patterns. */
export function patternVars() {
  if (cache) return cache;
  cache = { '--band': svgUri(14, 17, (i, j) => knot(42 + i, j)) };
  PALETTES.forEach(([bg, a, b, c], n) => {
    cache[`--pat-${n}`] = svgUri(16, 16, (i, j) => {
      const v = star(Math.abs(i - 7.5), Math.abs(j - 7.5));
      return v < 1.2 ? c : v < 2.8 ? a : v < 4.4 ? b : v < 5.6 ? a : bg;
    });
  });
  return cache;
}
