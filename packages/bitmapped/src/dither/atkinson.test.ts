import { describe, it, expect } from 'vitest';
import type { RGB } from '../core/types.js';
import { atkinsonDither } from './atkinson.js';

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

const bwPalette: RGB[] = [
  { r: 0, g: 0, b: 0 },
  { r: 255, g: 255, b: 255 },
];

function matchBW(color: RGB): RGB {
  const brightness = (color.r + color.g + color.b) / 3;
  return brightness > 127 ? bwPalette[1]! : bwPalette[0]!;
}

describe('atkinsonDither', () => {
  it('output has same dimensions as input', () => {
    const input = createTestImageData(10, 8, { r: 128, g: 128, b: 128 });
    const output = atkinsonDither(input, matchBW);
    expect(output.width).toBe(10);
    expect(output.height).toBe(8);
    expect(output.data.length).toBe(input.data.length);
  });

  it('every output pixel is a palette color', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 150, b: 200 });
    const output = atkinsonDither(input, matchBW);

    for (let i = 0; i < output.width * output.height; i++) {
      const r = output.data[i * 4]!;
      const g = output.data[i * 4 + 1]!;
      const b = output.data[i * 4 + 2]!;
      const isPaletteColor = bwPalette.some(
        (p) => p.r === r && p.g === g && p.b === b,
      );
      expect(isPaletteColor).toBe(true);
    }
  });

  it('does not mutate the input ImageData', () => {
    const input = createTestImageData(4, 4, { r: 128, g: 128, b: 128 });
    const originalData = new Uint8ClampedArray(input.data);
    atkinsonDither(input, matchBW);
    expect(input.data).toEqual(originalData);
  });

  it('handles a 1x1 image', () => {
    const input = createTestImageData(1, 1, { r: 200, g: 200, b: 200 });
    const output = atkinsonDither(input, matchBW);
    expect(output.width).toBe(1);
    expect(output.height).toBe(1);
    // White since brightness > 127
    expect(output.data[0]).toBe(255);
    expect(output.data[1]).toBe(255);
    expect(output.data[2]).toBe(255);
  });

  it('pure white input stays white', () => {
    const input = createTestImageData(4, 4, { r: 255, g: 255, b: 255 });
    const output = atkinsonDither(input, matchBW);

    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4]).toBe(255);
      expect(output.data[i * 4 + 1]).toBe(255);
      expect(output.data[i * 4 + 2]).toBe(255);
    }
  });

  it('pure black input stays black', () => {
    const input = createTestImageData(4, 4, { r: 0, g: 0, b: 0 });
    const output = atkinsonDither(input, matchBW);

    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4]).toBe(0);
      expect(output.data[i * 4 + 1]).toBe(0);
      expect(output.data[i * 4 + 2]).toBe(0);
    }
  });

  it('mid-gray input produces a mix of black and white pixels', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    const output = atkinsonDither(input, matchBW);

    let blackCount = 0;
    let whiteCount = 0;
    for (let i = 0; i < 64; i++) {
      if (output.data[i * 4] === 0) blackCount++;
      else whiteCount++;
    }

    // Both black and white pixels should be present for a mid-gray input
    expect(blackCount).toBeGreaterThan(0);
    expect(whiteCount).toBeGreaterThan(0);
  });

  it('all output pixels have alpha 255', () => {
    const input = createTestImageData(4, 4, { r: 100, g: 150, b: 200 });
    const output = atkinsonDither(input, matchBW);

    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4 + 3]).toBe(255);
    }
  });

  it('works with a multi-color palette', () => {
    const palette: RGB[] = [
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 },
      { r: 128, g: 128, b: 128 },
    ];

    const matchColor = (color: RGB): RGB => {
      let best = palette[0]!;
      let bestDist = Infinity;
      for (const p of palette) {
        const d =
          Math.abs(color.r - p.r) +
          Math.abs(color.g - p.g) +
          Math.abs(color.b - p.b);
        if (d < bestDist) {
          bestDist = d;
          best = p;
        }
      }
      return best;
    };

    const input = createTestImageData(8, 8, { r: 100, g: 150, b: 200 });
    const output = atkinsonDither(input, matchColor);

    for (let i = 0; i < output.width * output.height; i++) {
      const r = output.data[i * 4]!;
      const g = output.data[i * 4 + 1]!;
      const b = output.data[i * 4 + 2]!;
      const isPaletteColor = palette.some(
        (p) => p.r === r && p.g === g && p.b === b,
      );
      expect(isPaletteColor).toBe(true);
    }
  });
});
