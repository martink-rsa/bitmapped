import type {
  RGB,
  LabColor,
  OklabColor,
  DistanceAlgorithm,
} from '../core/types.js';

// ── Color Space Conversion Helpers ──────────────────────────────────

/**
 * Converts a single sRGB channel (0–255) to linear RGB (0–1).
 */
function srgbToLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/**
 * Converts an RGB color to CIE L*a*b* via the sRGB → linear → XYZ (D65) → Lab chain.
 * @param color - The RGB color to convert
 * @returns The color in CIE L*a*b* space
 */
export function rgbToLab(color: RGB): LabColor {
  // sRGB to linear RGB
  const r = srgbToLinear(color.r);
  const g = srgbToLinear(color.g);
  const b = srgbToLinear(color.b);

  // Linear RGB to XYZ (D65 illuminant)
  let x = 0.4124564 * r + 0.3575761 * g + 0.1804375 * b;
  let y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  let z = 0.0193339 * r + 0.119192 * g + 0.9503041 * b;

  // D65 reference white
  x /= 0.95047;
  y /= 1.0;
  z /= 1.08883;

  // XYZ to Lab
  const epsilon = 216 / 24389; // (6/29)^3
  const kappa = 24389 / 27; // (29/6)^3 * 3 = (29/3)^3

  const fx = x > epsilon ? Math.cbrt(x) : (kappa * x + 16) / 116;
  const fy = y > epsilon ? Math.cbrt(y) : (kappa * y + 16) / 116;
  const fz = z > epsilon ? Math.cbrt(z) : (kappa * z + 16) / 116;

  return {
    L: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

/**
 * Converts an RGB color to Oklab via the sRGB → linear → LMS → Oklab chain.
 * @param color - The RGB color to convert
 * @returns The color in Oklab space
 */
export function rgbToOklab(color: RGB): OklabColor {
  // sRGB to linear RGB
  const r = srgbToLinear(color.r);
  const g = srgbToLinear(color.g);
  const b = srgbToLinear(color.b);

  // Linear RGB to LMS
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  // Cube root
  const lc = Math.cbrt(l);
  const mc = Math.cbrt(m);
  const sc = Math.cbrt(s);

  // LMS to Oklab
  return {
    L: 0.2104542553 * lc + 0.793617785 * mc - 0.0040720468 * sc,
    a: 1.9779984951 * lc - 2.428592205 * mc + 0.4505937099 * sc,
    b: 0.0259040371 * lc + 0.7827717662 * mc - 0.808675766 * sc,
  };
}

// ── Distance Functions ──────────────────────────────────────────────

/**
 * Simple Euclidean distance in RGB space.
 * Fast but perceptually inaccurate.
 * @param a - First RGB color
 * @param b - Second RGB color
 * @returns Distance value (lower = more similar)
 */
export function euclideanDistance(a: RGB, b: RGB): number {
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Weighted Euclidean distance that accounts for human color perception.
 * Uses the redmean approximation for perceptual weighting.
 * @param a - First RGB color
 * @param b - Second RGB color
 * @returns Distance value (lower = more similar)
 */
export function redmeanDistance(a: RGB, b: RGB): number {
  const rmean = (a.r + b.r) / 2;
  const dr = a.r - b.r;
  const dg = a.g - b.g;
  const db = a.b - b.b;
  return Math.sqrt(
    (2 + rmean / 256) * dr * dr +
      4 * dg * dg +
      (2 + (255 - rmean) / 256) * db * db,
  );
}

/**
 * CIE76 color distance. Converts both colors to CIE L*a*b* first,
 * then computes Euclidean distance in Lab space.
 * @param a - First RGB color
 * @param b - Second RGB color
 * @returns Distance value (lower = more similar)
 */
export function cie76Distance(a: RGB, b: RGB): number {
  const labA = rgbToLab(a);
  const labB = rgbToLab(b);
  const dL = labA.L - labB.L;
  const da = labA.a - labB.a;
  const db = labA.b - labB.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Full CIEDE2000 color distance — the gold standard for perceptual accuracy.
 * Operates in CIE L*a*b* space with corrections for lightness, chroma,
 * hue, and a rotation term.
 * @param a - First RGB color
 * @param b - Second RGB color
 * @returns Distance value (lower = more similar)
 */
export function ciede2000Distance(a: RGB, b: RGB): number {
  const lab1 = rgbToLab(a);
  const lab2 = rgbToLab(b);

  const kL = 1;
  const kC = 1;
  const kH = 1;

  const C1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
  const C2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
  const Cb = (C1 + C2) / 2;

  const POW25_7 = 6103515625; // 25^7
  const Cb7 = Math.pow(Cb, 7);
  const G = 0.5 * (1 - Math.sqrt(Cb7 / (Cb7 + POW25_7)));

  const a1p = lab1.a * (1 + G);
  const a2p = lab2.a * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + lab1.b * lab1.b);
  const C2p = Math.sqrt(a2p * a2p + lab2.b * lab2.b);

  const rad2deg = 180 / Math.PI;
  const deg2rad = Math.PI / 180;

  let h1p = Math.atan2(lab1.b, a1p) * rad2deg;
  if (h1p < 0) h1p += 360;

  let h2p = Math.atan2(lab2.b, a2p) * rad2deg;
  if (h2p < 0) h2p += 360;

  // Delta L', C'
  const dLp = lab2.L - lab1.L;
  const dCp = C2p - C1p;

  // Delta h'
  let dhp: number;
  if (C1p * C2p === 0) {
    dhp = 0;
  } else if (Math.abs(h2p - h1p) <= 180) {
    dhp = h2p - h1p;
  } else if (h2p - h1p > 180) {
    dhp = h2p - h1p - 360;
  } else {
    dhp = h2p - h1p + 360;
  }

  const dHp = 2 * Math.sqrt(C1p * C2p) * Math.sin((dhp / 2) * deg2rad);

  // Arithmetic mean of L', C', h'
  const Lbp = (lab1.L + lab2.L) / 2;
  const Cbp = (C1p + C2p) / 2;

  let hbp: number;
  if (C1p * C2p === 0) {
    hbp = h1p + h2p;
  } else if (Math.abs(h1p - h2p) <= 180) {
    hbp = (h1p + h2p) / 2;
  } else if (h1p + h2p < 360) {
    hbp = (h1p + h2p + 360) / 2;
  } else {
    hbp = (h1p + h2p - 360) / 2;
  }

  // T term
  const T =
    1 -
    0.17 * Math.cos((hbp - 30) * deg2rad) +
    0.24 * Math.cos(2 * hbp * deg2rad) +
    0.32 * Math.cos((3 * hbp + 6) * deg2rad) -
    0.2 * Math.cos((4 * hbp - 63) * deg2rad);

  // SL, SC, SH
  const Lbp50sq = (Lbp - 50) * (Lbp - 50);
  const SL = 1 + (0.015 * Lbp50sq) / Math.sqrt(20 + Lbp50sq);
  const SC = 1 + 0.045 * Cbp;
  const SH = 1 + 0.015 * Cbp * T;

  // RT (rotation term)
  const dTheta = 30 * Math.exp(-((hbp - 275) / 25) * ((hbp - 275) / 25));
  const Cbp7 = Math.pow(Cbp, 7);
  const RC = 2 * Math.sqrt(Cbp7 / (Cbp7 + POW25_7));
  const RT = -Math.sin(2 * dTheta * deg2rad) * RC;

  // Final distance
  const lTerm = dLp / (kL * SL);
  const cTerm = dCp / (kC * SC);
  const hTerm = dHp / (kH * SH);

  return Math.sqrt(
    lTerm * lTerm + cTerm * cTerm + hTerm * hTerm + RT * cTerm * hTerm,
  );
}

/**
 * Oklab Euclidean distance. Converts both colors to Oklab space,
 * then computes Euclidean distance. Very good accuracy/speed ratio.
 * @param a - First RGB color
 * @param b - Second RGB color
 * @returns Distance value (lower = more similar)
 */
export function oklabDistance(a: RGB, b: RGB): number {
  const okA = rgbToOklab(a);
  const okB = rgbToOklab(b);
  const dL = okA.L - okB.L;
  const da = okA.a - okB.a;
  const db = okA.b - okB.b;
  return Math.sqrt(dL * dL + da * da + db * db);
}

/**
 * Returns the appropriate distance function for the given algorithm name.
 * @param algorithm - The distance algorithm to use
 * @returns A function that computes color distance between two RGB values
 */
export function getDistanceFunction(
  algorithm: DistanceAlgorithm,
): (a: RGB, b: RGB) => number {
  switch (algorithm) {
    case 'euclidean':
      return euclideanDistance;
    case 'redmean':
      return redmeanDistance;
    case 'cie76':
      return cie76Distance;
    case 'ciede2000':
      return ciede2000Distance;
    case 'oklab':
      return oklabDistance;
  }
}
