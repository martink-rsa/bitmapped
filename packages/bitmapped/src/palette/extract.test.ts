import { describe, it, expect } from 'vitest';
import type { RGB } from '../core/types.js';
import { extractPalette } from './extract.js';

function createTestImageData(
  width: number,
  height: number,
  fill: RGB,
): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    data[i * 4] = fill.r;
    data[i * 4 + 1] = fill.g;
    data[i * 4 + 2] = fill.b;
    data[i * 4 + 3] = 255;
  }
  return new ImageData(data, width, height);
}

function createMultiColorImage(colors: RGB[], width: number): ImageData {
  const height = Math.ceil(colors.length / width);
  const totalPixels = width * height;
  const data = new Uint8ClampedArray(totalPixels * 4);

  for (let i = 0; i < totalPixels; i++) {
    const color = colors[i % colors.length]!;
    data[i * 4] = color.r;
    data[i * 4 + 1] = color.g;
    data[i * 4 + 2] = color.b;
    data[i * 4 + 3] = 255;
  }

  return new ImageData(data, width, height);
}

describe('extractPalette', () => {
  it('returns a palette with at most maxColors entries', () => {
    const input = createTestImageData(4, 4, { r: 128, g: 128, b: 128 });
    const palette = extractPalette(input, 8);
    expect(palette.length).toBeLessThanOrEqual(8);
  });

  it('default maxColors is 16', () => {
    // Create an image with many distinct colors
    const data = new Uint8ClampedArray(100 * 100 * 4);
    for (let i = 0; i < 10000; i++) {
      data[i * 4] = (i * 7) % 256;
      data[i * 4 + 1] = (i * 13) % 256;
      data[i * 4 + 2] = (i * 29) % 256;
      data[i * 4 + 3] = 255;
    }
    const input = new ImageData(data, 100, 100);
    const palette = extractPalette(input);
    expect(palette.length).toBeLessThanOrEqual(16);
  });

  it('returns a single color for a uniform image', () => {
    const fill: RGB = { r: 42, g: 84, b: 126 };
    const input = createTestImageData(4, 4, fill);
    const palette = extractPalette(input, 4);

    expect(palette).toHaveLength(1);
    expect(palette[0]!.color).toEqual(fill);
  });

  it('returns each palette entry with a color property', () => {
    const input = createTestImageData(4, 4, { r: 100, g: 200, b: 50 });
    const palette = extractPalette(input, 4);

    for (const entry of palette) {
      expect(entry.color).toBeDefined();
      expect(entry.color.r).toBeGreaterThanOrEqual(0);
      expect(entry.color.r).toBeLessThanOrEqual(255);
      expect(entry.color.g).toBeGreaterThanOrEqual(0);
      expect(entry.color.g).toBeLessThanOrEqual(255);
      expect(entry.color.b).toBeGreaterThanOrEqual(0);
      expect(entry.color.b).toBeLessThanOrEqual(255);
    }
  });

  it('finds distinct color groups in a two-color image', () => {
    // Build a 10x10 image: top half red, bottom half blue
    const data = new Uint8ClampedArray(10 * 10 * 4);
    for (let i = 0; i < 50; i++) {
      data[i * 4] = 255;
      data[i * 4 + 1] = 0;
      data[i * 4 + 2] = 0;
      data[i * 4 + 3] = 255;
    }
    for (let i = 50; i < 100; i++) {
      data[i * 4] = 0;
      data[i * 4 + 1] = 0;
      data[i * 4 + 2] = 255;
      data[i * 4 + 3] = 255;
    }
    const input = new ImageData(data, 10, 10);

    const palette = extractPalette(input, 4);

    // Should identify at least 2 distinct colors
    expect(palette.length).toBeGreaterThanOrEqual(2);

    // The extracted colors should be close to red and blue
    const hasReddish = palette.some((p) => p.color.r > 200 && p.color.b < 50);
    const hasBluish = palette.some((p) => p.color.b > 200 && p.color.r < 50);
    expect(hasReddish).toBe(true);
    expect(hasBluish).toBe(true);
  });

  it('handles a very small image', () => {
    const data = new Uint8ClampedArray([100, 150, 200, 255]);
    const input = new ImageData(data, 1, 1);
    const palette = extractPalette(input, 4);

    expect(palette.length).toBeGreaterThanOrEqual(1);
    expect(palette[0]!.color).toEqual({ r: 100, g: 150, b: 200 });
  });

  it('handles maxColors = 1', () => {
    const colors: RGB[] = [
      { r: 255, g: 0, b: 0 },
      { r: 0, g: 0, b: 255 },
    ];
    const input = createMultiColorImage(colors, 2);
    const palette = extractPalette(input, 1);

    expect(palette).toHaveLength(1);
  });

  it('samples large images to keep performance reasonable', () => {
    // Create a large image — extraction should still work via sampling
    const size = 200;
    const data = new Uint8ClampedArray(size * size * 4);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = i % 256;
      data[i * 4 + 1] = (i * 3) % 256;
      data[i * 4 + 2] = (i * 7) % 256;
      data[i * 4 + 3] = 255;
    }
    const input = new ImageData(data, size, size);

    const palette = extractPalette(input, 8);
    expect(palette.length).toBeGreaterThanOrEqual(1);
    expect(palette.length).toBeLessThanOrEqual(8);
  });
});
