import { describe, it, expect } from 'vitest';
import { buildFilterString } from './build-filter-string.js';

describe('buildFilterString', () => {
  it('returns empty string for an empty object', () => {
    expect(buildFilterString({})).toBe('');
  });

  it('returns empty string when all values are defaults', () => {
    expect(
      buildFilterString({
        brightness: 1,
        contrast: 1,
        grayscale: 0,
        sepia: 0,
        invert: 0,
        saturate: 1,
        hueRotate: 0,
        blur: 0,
      }),
    ).toBe('');
  });

  it('returns single filter for brightness', () => {
    expect(buildFilterString({ brightness: 1.5 })).toBe('brightness(1.5)');
  });

  it('returns multiple filters space-separated', () => {
    const result = buildFilterString({ brightness: 1.2, contrast: 1.5 });
    expect(result).toBe('brightness(1.2) contrast(1.5)');
  });

  it('uses deg unit for hue-rotate', () => {
    expect(buildFilterString({ hueRotate: 90 })).toBe('hue-rotate(90deg)');
  });

  it('uses px unit for blur', () => {
    expect(buildFilterString({ blur: 2 })).toBe('blur(2px)');
  });

  it('omits filters at their default values', () => {
    const result = buildFilterString({
      brightness: 1,
      contrast: 1.8,
      grayscale: 0,
      saturate: 0.5,
    });
    expect(result).toBe('contrast(1.8) saturate(0.5)');
  });

  it('handles all eight filter types', () => {
    const result = buildFilterString({
      brightness: 0.5,
      contrast: 1.5,
      grayscale: 0.5,
      sepia: 0.3,
      invert: 1,
      saturate: 2,
      hueRotate: 180,
      blur: 3,
    });
    expect(result).toBe(
      'brightness(0.5) contrast(1.5) grayscale(0.5) sepia(0.3) invert(1) saturate(2) hue-rotate(180deg) blur(3px)',
    );
  });
});
