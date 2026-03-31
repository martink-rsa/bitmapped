import { describe, it, expect } from 'vitest';
import { applyFilters } from './apply-filters.js';

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

function getPixel(
  imageData: ImageData,
  x: number,
  y: number,
): [number, number, number, number] {
  const offset = (y * imageData.width + x) * 4;
  return [
    imageData.data[offset]!,
    imageData.data[offset + 1]!,
    imageData.data[offset + 2]!,
    imageData.data[offset + 3]!,
  ];
}

describe('applyFilters (browser — active filters)', () => {
  it('returns ImageData with same dimensions when filters are active', () => {
    const input = createTestImageData(8, 6, 100, 100, 100);
    const result = applyFilters(input, { brightness: 1.5 });
    expect(result.width).toBe(8);
    expect(result.height).toBe(6);
    expect(result.data.length).toBe(8 * 6 * 4);
  });

  it('brightness > 1 increases channel values', () => {
    const input = createTestImageData(4, 4, 100, 100, 100);
    const result = applyFilters(input, { brightness: 2 });
    const [r, g, b] = getPixel(result, 2, 2);
    expect(r).toBeGreaterThan(100);
    expect(g).toBeGreaterThan(100);
    expect(b).toBeGreaterThan(100);
  });

  it('brightness < 1 decreases channel values', () => {
    const input = createTestImageData(4, 4, 200, 200, 200);
    const result = applyFilters(input, { brightness: 0.5 });
    const [r, g, b] = getPixel(result, 2, 2);
    expect(r).toBeLessThan(200);
    expect(g).toBeLessThan(200);
    expect(b).toBeLessThan(200);
  });

  it('grayscale: 1 removes color (R, G, B approximately equal)', () => {
    // Start with a strongly colored pixel
    const input = createTestImageData(4, 4, 200, 50, 20);
    const result = applyFilters(input, { grayscale: 1 });
    const [r, g, b] = getPixel(result, 2, 2);
    // In a fully desaturated image all three channels should be close
    expect(Math.abs(r - g)).toBeLessThanOrEqual(5);
    expect(Math.abs(g - b)).toBeLessThanOrEqual(5);
    expect(Math.abs(r - b)).toBeLessThanOrEqual(5);
  });

  it('contrast: 0 produces flat gray (channels converge toward ~128)', () => {
    // contrast(0) maps every colour to mid-gray
    const input = createTestImageData(4, 4, 220, 30, 10);
    const result = applyFilters(input, { contrast: 0 });
    const [r, g, b] = getPixel(result, 2, 2);
    // All channels should be close to 128
    expect(r).toBeGreaterThanOrEqual(110);
    expect(r).toBeLessThanOrEqual(145);
    expect(g).toBeGreaterThanOrEqual(110);
    expect(g).toBeLessThanOrEqual(145);
    expect(b).toBeGreaterThanOrEqual(110);
    expect(b).toBeLessThanOrEqual(145);
  });

  it('invert flips channel values', () => {
    const input = createTestImageData(4, 4, 200, 100, 50);
    const result = applyFilters(input, { invert: 1 });
    const [r, g, b] = getPixel(result, 2, 2);
    // invert(1): each channel c -> 255 - c, allow ±5 for rendering variance
    expect(r).toBeGreaterThanOrEqual(255 - 200 - 5);
    expect(r).toBeLessThanOrEqual(255 - 200 + 5);
    expect(g).toBeGreaterThanOrEqual(255 - 100 - 5);
    expect(g).toBeLessThanOrEqual(255 - 100 + 5);
    expect(b).toBeGreaterThanOrEqual(255 - 50 - 5);
    expect(b).toBeLessThanOrEqual(255 - 50 + 5);
  });

  it('does not mutate input ImageData', () => {
    const input = createTestImageData(4, 4, 128, 64, 32);
    const originalData = Uint8ClampedArray.from(input.data);
    applyFilters(input, { brightness: 2 });
    expect(Array.from(input.data)).toEqual(Array.from(originalData));
  });

  it('preserves alpha channel (alpha > 0)', () => {
    const input = createTestImageData(4, 4, 100, 100, 100);
    const result = applyFilters(input, { brightness: 1.5 });
    // Check every pixel's alpha
    for (let i = 3; i < result.data.length; i += 4) {
      expect(result.data[i]).toBeGreaterThan(0);
    }
  });

  it('multiple filters compose correctly (grayscale + brightness)', () => {
    // Bright red, desaturated then brightened — result should be a light gray
    const input = createTestImageData(4, 4, 180, 0, 0);
    const result = applyFilters(input, { grayscale: 1, brightness: 1.5 });
    const [r, g, b] = getPixel(result, 2, 2);
    // After full grayscale the three channels are equal; brightness boosts all
    expect(Math.abs(r - g)).toBeLessThanOrEqual(8);
    expect(Math.abs(g - b)).toBeLessThanOrEqual(8);
    // The result should be brighter than the grayscale-only version
    const grayOnly = applyFilters(input, { grayscale: 1 });
    const [gr] = getPixel(grayOnly, 2, 2);
    expect(r).toBeGreaterThanOrEqual(gr);
  });
});
