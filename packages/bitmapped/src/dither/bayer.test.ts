import { describe, it, expect } from 'vitest';
import type { RGB } from '../core/types.js';
import { bayerDither, generateBayerMatrix } from './bayer.js';

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

describe('generateBayerMatrix', () => {
  it('generates a 2x2 matrix', () => {
    const matrix = generateBayerMatrix(2);
    expect(matrix).toHaveLength(2);
    expect(matrix[0]).toHaveLength(2);
  });

  it('generates a 4x4 matrix', () => {
    const matrix = generateBayerMatrix(4);
    expect(matrix).toHaveLength(4);
    for (const row of matrix) {
      expect(row).toHaveLength(4);
    }
  });

  it('generates a 8x8 matrix', () => {
    const matrix = generateBayerMatrix(8);
    expect(matrix).toHaveLength(8);
    for (const row of matrix) {
      expect(row).toHaveLength(8);
    }
  });

  it('matrix contains unique values for 4x4', () => {
    const matrix = generateBayerMatrix(4);
    const values = matrix.flat();
    const unique = new Set(values);
    expect(unique.size).toBe(16);
  });

  it('matrix values range from 0 to size*size - 1', () => {
    const size = 4;
    const matrix = generateBayerMatrix(size);
    const values = matrix.flat();
    expect(Math.min(...values)).toBe(0);
    expect(Math.max(...values)).toBe(size * size - 1);
  });

  it('throws for size 0', () => {
    expect(() => generateBayerMatrix(0)).toThrow('power of 2');
  });

  it('throws for size 1', () => {
    expect(() => generateBayerMatrix(1)).toThrow('power of 2');
  });

  it('throws for non-power-of-2', () => {
    expect(() => generateBayerMatrix(3)).toThrow('power of 2');
    expect(() => generateBayerMatrix(6)).toThrow('power of 2');
  });
});

describe('bayerDither', () => {
  const bwPalette: RGB[] = [
    { r: 0, g: 0, b: 0 },
    { r: 255, g: 255, b: 255 },
  ];

  const matchBW = (color: RGB): RGB => {
    const brightness = (color.r + color.g + color.b) / 3;
    return brightness > 127 ? bwPalette[1]! : bwPalette[0]!;
  };

  it('output has same dimensions as input', () => {
    const input = createTestImageData(10, 8, { r: 128, g: 128, b: 128 });
    const output = bayerDither(input, matchBW);
    expect(output.width).toBe(10);
    expect(output.height).toBe(8);
    expect(output.data.length).toBe(input.data.length);
  });

  it('every output pixel is a palette color', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 150, b: 200 });
    const output = bayerDither(input, matchBW);

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
    bayerDither(input, matchBW);
    expect(input.data).toEqual(originalData);
  });

  it('accepts a custom matrixSize parameter', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    const output = bayerDither(input, matchBW, 8);
    expect(output.width).toBe(8);
    expect(output.height).toBe(8);

    for (let i = 0; i < 64; i++) {
      const r = output.data[i * 4]!;
      const g = output.data[i * 4 + 1]!;
      const b = output.data[i * 4 + 2]!;
      const isPaletteColor = bwPalette.some(
        (p) => p.r === r && p.g === g && p.b === b,
      );
      expect(isPaletteColor).toBe(true);
    }
  });

  it('pure white input stays white', () => {
    const input = createTestImageData(4, 4, { r: 255, g: 255, b: 255 });
    const output = bayerDither(input, matchBW);

    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4]).toBe(255);
      expect(output.data[i * 4 + 1]).toBe(255);
      expect(output.data[i * 4 + 2]).toBe(255);
    }
  });

  it('pure black input stays black', () => {
    const input = createTestImageData(4, 4, { r: 0, g: 0, b: 0 });
    const output = bayerDither(input, matchBW);

    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4]).toBe(0);
      expect(output.data[i * 4 + 1]).toBe(0);
      expect(output.data[i * 4 + 2]).toBe(0);
    }
  });

  it('all output pixels have alpha 255', () => {
    const input = createTestImageData(4, 4, { r: 100, g: 150, b: 200 });
    const output = bayerDither(input, matchBW);

    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4 + 3]).toBe(255);
    }
  });

  it('handles a 1x1 image', () => {
    const input = createTestImageData(1, 1, { r: 200, g: 200, b: 200 });
    const output = bayerDither(input, matchBW);
    expect(output.width).toBe(1);
    expect(output.height).toBe(1);
  });
});
