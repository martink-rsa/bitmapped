import { describe, it, expect } from 'vitest';
import type { RGB, Palette } from '../core/types.js';
import type { HAMConfig } from './types.js';
import { solveHAM } from './ham.js';

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

const ham6Config: HAMConfig = { basePaletteSize: 16, modifyBits: 4 };
const ham8Config: HAMConfig = { basePaletteSize: 64, modifyBits: 6 };

const basePalette16: Palette = [
  { color: { r: 0, g: 0, b: 0 }, name: 'Black' },
  { color: { r: 255, g: 255, b: 255 }, name: 'White' },
  { color: { r: 255, g: 0, b: 0 }, name: 'Red' },
  { color: { r: 0, g: 255, b: 0 }, name: 'Green' },
  { color: { r: 0, g: 0, b: 255 }, name: 'Blue' },
  { color: { r: 255, g: 255, b: 0 }, name: 'Yellow' },
  { color: { r: 0, g: 255, b: 255 }, name: 'Cyan' },
  { color: { r: 255, g: 0, b: 255 }, name: 'Magenta' },
  { color: { r: 128, g: 0, b: 0 } },
  { color: { r: 0, g: 128, b: 0 } },
  { color: { r: 0, g: 0, b: 128 } },
  { color: { r: 128, g: 128, b: 0 } },
  { color: { r: 0, g: 128, b: 128 } },
  { color: { r: 128, g: 0, b: 128 } },
  { color: { r: 128, g: 128, b: 128 } },
  { color: { r: 192, g: 192, b: 192 } },
];

describe('solveHAM', () => {
  it('output has same dimensions as input', () => {
    const input = createTestImageData(10, 8, { r: 128, g: 128, b: 128 });
    const output = solveHAM(input, basePalette16, ham6Config);
    expect(output.width).toBe(10);
    expect(output.height).toBe(8);
    expect(output.data.length).toBe(input.data.length);
  });

  it('all output pixels have alpha 255', () => {
    const input = createTestImageData(4, 4, { r: 100, g: 150, b: 200 });
    const output = solveHAM(input, basePalette16, ham6Config);

    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4 + 3]).toBe(255);
    }
  });

  it('handles a 1x1 image', () => {
    const input = createTestImageData(1, 1, { r: 200, g: 200, b: 200 });
    const output = solveHAM(input, basePalette16, ham6Config);
    expect(output.width).toBe(1);
    expect(output.height).toBe(1);
  });

  it('uniform palette color input produces that color', () => {
    // Fill with black, which is the first palette color
    const input = createTestImageData(4, 4, { r: 0, g: 0, b: 0 });
    const output = solveHAM(input, basePalette16, ham6Config);

    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4]).toBe(0);
      expect(output.data[i * 4 + 1]).toBe(0);
      expect(output.data[i * 4 + 2]).toBe(0);
    }
  });

  it('palette color input maps exactly for white', () => {
    const input = createTestImageData(4, 4, { r: 255, g: 255, b: 255 });
    const output = solveHAM(input, basePalette16, ham6Config);

    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4]).toBe(255);
      expect(output.data[i * 4 + 1]).toBe(255);
      expect(output.data[i * 4 + 2]).toBe(255);
    }
  });

  it('does not mutate the input ImageData', () => {
    const input = createTestImageData(4, 4, { r: 128, g: 128, b: 128 });
    const originalData = new Uint8ClampedArray(input.data);
    solveHAM(input, basePalette16, ham6Config);
    expect(input.data).toEqual(originalData);
  });

  it('each scanline starts fresh from first palette color', () => {
    // Create a 4x2 image. Row 0 = red, Row 1 = green.
    // Each scanline should start with prev = first palette color (black).
    const width = 4;
    const height = 2;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let x = 0; x < width; x++) {
      // Row 0: red
      const idx0 = x * 4;
      data[idx0] = 255;
      data[idx0 + 1] = 0;
      data[idx0 + 2] = 0;
      data[idx0 + 3] = 255;
      // Row 1: green
      const idx1 = (width + x) * 4;
      data[idx1] = 0;
      data[idx1 + 1] = 255;
      data[idx1 + 2] = 0;
      data[idx1 + 3] = 255;
    }
    const input = new ImageData(data, width, height);
    const output = solveHAM(input, basePalette16, ham6Config);

    // The first pixel of row 1 should be independent of row 0's last pixel.
    // Row 1 starts with prev = palette[0] (black).
    // Green (0,255,0) is in the palette, so it should match directly.
    const row1Start = width * 4;
    expect(output.data[row1Start]).toBe(0);
    expect(output.data[row1Start + 1]).toBe(255);
    expect(output.data[row1Start + 2]).toBe(0);
  });

  it('works with HAM6 config', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 50, b: 200 });
    const output = solveHAM(input, basePalette16, ham6Config);
    expect(output.width).toBe(8);
    expect(output.height).toBe(8);
  });

  it('works with HAM8 config', () => {
    // HAM8 uses 64 base palette colors and 6 modify bits
    const largePalette: Palette = Array.from({ length: 64 }, (_, i) => ({
      color: {
        r: (i * 4) & 255,
        g: (i * 6) & 255,
        b: (i * 8) & 255,
      },
    }));
    const input = createTestImageData(8, 8, { r: 100, g: 50, b: 200 });
    const output = solveHAM(input, largePalette, ham8Config);
    expect(output.width).toBe(8);
    expect(output.height).toBe(8);

    for (let i = 0; i < 64; i++) {
      expect(output.data[i * 4 + 3]).toBe(255);
    }
  });

  it('handles empty palette gracefully', () => {
    const input = createTestImageData(2, 2, { r: 128, g: 128, b: 128 });
    const emptyPalette: Palette = [];
    const config: HAMConfig = { basePaletteSize: 0, modifyBits: 4 };
    const output = solveHAM(input, emptyPalette, config);
    expect(output.width).toBe(2);
    expect(output.height).toBe(2);
  });

  it('palette color red input maps exactly', () => {
    const input = createTestImageData(4, 4, { r: 255, g: 0, b: 0 });
    const output = solveHAM(input, basePalette16, ham6Config);

    // Red is in the palette; every pixel should be red
    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4]).toBe(255);
      expect(output.data[i * 4 + 1]).toBe(0);
      expect(output.data[i * 4 + 2]).toBe(0);
    }
  });
});
