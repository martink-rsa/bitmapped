import { describe, it, expect } from 'vitest';
import type { RGB } from '../core/types.js';
import {
  euclideanDistance,
  redmeanDistance,
  cie76Distance,
  ciede2000Distance,
  oklabDistance,
  getDistanceFunction,
  rgbToLab,
  rgbToOklab,
} from './distance.js';

const black: RGB = { r: 0, g: 0, b: 0 };
const white: RGB = { r: 255, g: 255, b: 255 };
const red: RGB = { r: 255, g: 0, b: 0 };
const blue: RGB = { r: 0, g: 0, b: 255 };
const orange: RGB = { r: 255, g: 165, b: 0 };

const allDistanceFns = [
  { name: 'euclidean', fn: euclideanDistance },
  { name: 'redmean', fn: redmeanDistance },
  { name: 'cie76', fn: cie76Distance },
  { name: 'ciede2000', fn: ciede2000Distance },
  { name: 'oklab', fn: oklabDistance },
] as const;

describe.each(allDistanceFns)('$name distance', ({ fn }) => {
  it('returns 0 for identical colors', () => {
    expect(fn(red, red)).toBeCloseTo(0, 10);
    expect(fn(black, black)).toBeCloseTo(0, 10);
    expect(fn(white, white)).toBeCloseTo(0, 10);
  });

  it('returns a positive value for different colors', () => {
    expect(fn(black, white)).toBeGreaterThan(0);
    expect(fn(red, blue)).toBeGreaterThan(0);
  });

  it('is symmetric', () => {
    expect(fn(red, blue)).toBeCloseTo(fn(blue, red), 10);
    expect(fn(black, white)).toBeCloseTo(fn(white, black), 10);
  });
});

describe('perceptual ordering', () => {
  it('red-to-orange is closer than red-to-blue for perceptual algorithms', () => {
    const perceptualFns = [
      redmeanDistance,
      cie76Distance,
      ciede2000Distance,
      oklabDistance,
    ];

    for (const fn of perceptualFns) {
      expect(fn(red, orange)).toBeLessThan(fn(red, blue));
    }
  });
});

describe('black vs white distance', () => {
  it('euclidean distance for black-white is sqrt(3) * 255', () => {
    const expected = Math.sqrt(3) * 255;
    expect(euclideanDistance(black, white)).toBeCloseTo(expected, 1);
  });
});

describe('getDistanceFunction', () => {
  it('returns the correct function for each algorithm', () => {
    expect(getDistanceFunction('euclidean')).toBe(euclideanDistance);
    expect(getDistanceFunction('redmean')).toBe(redmeanDistance);
    expect(getDistanceFunction('cie76')).toBe(cie76Distance);
    expect(getDistanceFunction('ciede2000')).toBe(ciede2000Distance);
    expect(getDistanceFunction('oklab')).toBe(oklabDistance);
  });
});

describe('rgbToLab', () => {
  it('converts black to L*≈0', () => {
    const lab = rgbToLab(black);
    expect(lab.L).toBeCloseTo(0, 0);
  });

  it('converts white to L*≈100', () => {
    const lab = rgbToLab(white);
    expect(lab.L).toBeCloseTo(100, 0);
  });

  it('returns near-zero a* and b* for neutral gray', () => {
    const lab = rgbToLab({ r: 128, g: 128, b: 128 });
    expect(Math.abs(lab.a)).toBeLessThan(1);
    expect(Math.abs(lab.b)).toBeLessThan(1);
  });

  it('red has positive a* value', () => {
    const lab = rgbToLab(red);
    expect(lab.a).toBeGreaterThan(0);
  });
});

describe('rgbToOklab', () => {
  it('converts black to L≈0', () => {
    const ok = rgbToOklab(black);
    expect(ok.L).toBeCloseTo(0, 1);
  });

  it('converts white to L≈1', () => {
    const ok = rgbToOklab(white);
    expect(ok.L).toBeCloseTo(1, 1);
  });

  it('returns near-zero a and b for neutral gray', () => {
    const ok = rgbToOklab({ r: 128, g: 128, b: 128 });
    expect(Math.abs(ok.a)).toBeLessThan(0.01);
    expect(Math.abs(ok.b)).toBeLessThan(0.01);
  });
});

describe('ciede2000 hue angle edge cases', () => {
  it('handles colors with widely separated hue angles (sum < 360)', () => {
    // Blue and red produce hue angles in Lab space where |h1p - h2p| > 180
    // and h1p + h2p < 360
    const dist = ciede2000Distance(
      { r: 0, g: 0, b: 255 },
      { r: 255, g: 0, b: 0 },
    );
    expect(dist).toBeGreaterThan(0);
  });

  it('handles colors with widely separated hue angles (sum >= 360)', () => {
    // Magenta and warm red produce hue angles in Lab space where
    // |h1p - h2p| > 180 and h1p + h2p >= 360
    const dist = ciede2000Distance(
      { r: 255, g: 0, b: 255 },
      { r: 255, g: 50, b: 0 },
    );
    expect(dist).toBeGreaterThan(0);
  });

  it('handles achromatic colors (C1p * C2p == 0)', () => {
    // Gray vs gray — both have near-zero chroma in Lab
    const dist = ciede2000Distance(
      { r: 128, g: 128, b: 128 },
      { r: 64, g: 64, b: 64 },
    );
    expect(dist).toBeGreaterThan(0);
  });
});

describe('triangle inequality', () => {
  it('holds for euclidean distance', () => {
    const a = { r: 100, g: 50, b: 200 };
    const b = { r: 50, g: 100, b: 150 };
    const c = { r: 200, g: 200, b: 0 };
    // d(a,c) <= d(a,b) + d(b,c)
    expect(euclideanDistance(a, c)).toBeLessThanOrEqual(
      euclideanDistance(a, b) + euclideanDistance(b, c) + 1e-10,
    );
  });
});
