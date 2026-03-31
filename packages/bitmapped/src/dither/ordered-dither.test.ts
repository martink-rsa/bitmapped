import { describe, it, expect } from 'vitest';
import type { Palette } from '../core/types.js';
import { orderedDither } from './ordered-dither.js';
import { matrices } from './matrices/index.js';
import { generateCheckerboardMatrix } from './matrices/checkerboard.js';

function createTestImageData(
  width: number,
  height: number,
  fill: { r: number; g: number; b: number },
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

const bwPalette: Palette = [
  { color: { r: 0, g: 0, b: 0 } },
  { color: { r: 255, g: 255, b: 255 } },
];

describe('orderedDither', () => {
  it('returns ImageData of the same dimensions as input', () => {
    const input = createTestImageData(10, 8, {
      r: 128,
      g: 128,
      b: 128,
    });
    const matrix = generateCheckerboardMatrix();
    const output = orderedDither(input, bwPalette, matrix);
    expect(output.width).toBe(10);
    expect(output.height).toBe(8);
    expect(output.data.length).toBe(input.data.length);
  });

  it('with strength 0, output matches direct palette mapping', () => {
    const input = createTestImageData(8, 8, {
      r: 128,
      g: 128,
      b: 128,
    });
    const matrix = matrices.bayer(4);
    const noDither = orderedDither(input, bwPalette, matrix, {
      strength: 0,
    });
    // With strength 0, all pixels get the same nearest match
    const firstR = noDither.data[0]!;
    const firstG = noDither.data[1]!;
    const firstB = noDither.data[2]!;
    for (let i = 0; i < 64; i++) {
      expect(noDither.data[i * 4]).toBe(firstR);
      expect(noDither.data[i * 4 + 1]).toBe(firstG);
      expect(noDither.data[i * 4 + 2]).toBe(firstB);
    }
  });

  it('with strength 1, output differs from direct palette mapping', () => {
    const input = createTestImageData(8, 8, {
      r: 128,
      g: 128,
      b: 128,
    });
    const matrix = matrices.bayer(4);
    const dithered = orderedDither(input, bwPalette, matrix, {
      strength: 1,
    });
    // Mid-gray with B/W palette should produce a mix of black and white
    const colors = new Set<number>();
    for (let i = 0; i < 64; i++) {
      colors.add(dithered.data[i * 4]!);
    }
    expect(colors.size).toBeGreaterThan(1);
  });

  it('works with every built-in matrix type', () => {
    const input = createTestImageData(8, 8, {
      r: 128,
      g: 128,
      b: 128,
    });
    const patternNames = Object.keys(matrices) as Array<keyof typeof matrices>;
    for (const name of patternNames) {
      const matrix = matrices[name]();
      const output = orderedDither(input, bwPalette, matrix);
      expect(output.width).toBe(8);
      expect(output.height).toBe(8);
    }
  });

  it('throws helpful error if an empty matrix is provided', () => {
    const input = createTestImageData(4, 4, {
      r: 128,
      g: 128,
      b: 128,
    });
    expect(() => orderedDither(input, bwPalette, [])).toThrow(/empty/i);
  });

  it('does not mutate the input ImageData', () => {
    const input = createTestImageData(4, 4, {
      r: 128,
      g: 128,
      b: 128,
    });
    const originalData = new Uint8ClampedArray(input.data);
    const matrix = generateCheckerboardMatrix();
    orderedDither(input, bwPalette, matrix);
    expect(input.data).toEqual(originalData);
  });

  it('all output pixels have alpha 255', () => {
    const input = createTestImageData(4, 4, {
      r: 100,
      g: 150,
      b: 200,
    });
    const matrix = matrices.bayer(4);
    const output = orderedDither(input, bwPalette, matrix);
    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4 + 3]).toBe(255);
    }
  });
});
