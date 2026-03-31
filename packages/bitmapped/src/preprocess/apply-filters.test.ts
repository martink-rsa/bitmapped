import { describe, it, expect } from 'vitest';
import { applyFilters } from './apply-filters.js';

const hasCanvas =
  typeof OffscreenCanvas !== 'undefined' || typeof document !== 'undefined';

function createTestImageData(
  width: number,
  height: number,
  r: number,
  g: number,
  b: number,
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = r;
    data[i * 4 + 1] = g;
    data[i * 4 + 2] = b;
    data[i * 4 + 3] = 255;
  }
  return new ImageData(data, width, height);
}

describe('applyFilters', () => {
  it('returns a copy (not the same reference) when filters are all defaults', () => {
    const input = createTestImageData(2, 2, 100, 100, 100);
    const result = applyFilters(input, {
      brightness: 1,
      contrast: 1,
      grayscale: 0,
    });
    expect(result).not.toBe(input);
    expect(result.data).not.toBe(input.data);
    expect(Array.from(result.data)).toEqual(Array.from(input.data));
  });

  it('returns a copy for empty filter object', () => {
    const input = createTestImageData(2, 2, 50, 150, 250);
    const result = applyFilters(input, {});
    expect(result).not.toBe(input);
    expect(Array.from(result.data)).toEqual(Array.from(input.data));
  });

  it('throws when Canvas API is unavailable and filters are active', () => {
    if (hasCanvas) return; // skip in browser environments
    const input = createTestImageData(2, 2, 100, 100, 100);
    expect(() => applyFilters(input, { brightness: 1.5 })).toThrow(
      'applyFilters requires a browser environment with Canvas support',
    );
  });

  describe.skipIf(!hasCanvas)('with Canvas support', () => {
    it('returns ImageData of the same dimensions', () => {
      const input = createTestImageData(4, 4, 128, 64, 32);
      const result = applyFilters(input, { brightness: 1.5 });
      expect(result.width).toBe(4);
      expect(result.height).toBe(4);
    });

    it('returns new ImageData with non-default filters (structural contract)', () => {
      const input = createTestImageData(4, 4, 128, 64, 32);
      const result = applyFilters(input, { contrast: 2 });
      expect(result).not.toBe(input);
      expect(result.width).toBe(4);
      expect(result.height).toBe(4);
      expect(result.data.length).toBe(input.data.length);
    });
  });
});
