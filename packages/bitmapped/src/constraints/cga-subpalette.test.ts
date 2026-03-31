import { describe, it, expect } from 'vitest';
import type { RGB, Palette } from '../core/types.js';
import { solveCGASubpalette } from './cga-subpalette.js';

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

const cgaPalette: Palette = [
  { color: { r: 0, g: 0, b: 0 }, name: 'Black' },
  { color: { r: 0, g: 255, b: 255 }, name: 'Cyan' },
  { color: { r: 255, g: 0, b: 255 }, name: 'Magenta' },
  { color: { r: 255, g: 255, b: 255 }, name: 'White' },
];

describe('solveCGASubpalette', () => {
  it('output has same dimensions as input', () => {
    const input = createTestImageData(10, 8, { r: 128, g: 128, b: 128 });
    const output = solveCGASubpalette(input, cgaPalette);
    expect(output.width).toBe(10);
    expect(output.height).toBe(8);
    expect(output.data.length).toBe(input.data.length);
  });

  it('all output pixels are palette colors', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 150, b: 200 });
    const output = solveCGASubpalette(input, cgaPalette);

    for (let i = 0; i < output.width * output.height; i++) {
      const r = output.data[i * 4]!;
      const g = output.data[i * 4 + 1]!;
      const b = output.data[i * 4 + 2]!;
      const isPaletteColor = cgaPalette.some(
        (p) => p.color.r === r && p.color.g === g && p.color.b === b,
      );
      expect(isPaletteColor).toBe(true);
    }
  });

  it('does not mutate the input ImageData', () => {
    const input = createTestImageData(4, 4, { r: 128, g: 128, b: 128 });
    const originalData = new Uint8ClampedArray(input.data);
    solveCGASubpalette(input, cgaPalette);
    expect(input.data).toEqual(originalData);
  });

  it('pure palette color input stays the same', () => {
    // Fill with cyan, which is in the palette
    const input = createTestImageData(4, 4, { r: 0, g: 255, b: 255 });
    const output = solveCGASubpalette(input, cgaPalette);

    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4]).toBe(0);
      expect(output.data[i * 4 + 1]).toBe(255);
      expect(output.data[i * 4 + 2]).toBe(255);
    }
  });

  it('handles a 1x1 image', () => {
    const input = createTestImageData(1, 1, { r: 200, g: 200, b: 200 });
    const output = solveCGASubpalette(input, cgaPalette);
    expect(output.width).toBe(1);
    expect(output.height).toBe(1);
    // Should map to white (closest to light gray)
    expect(output.data[0]).toBe(255);
    expect(output.data[1]).toBe(255);
    expect(output.data[2]).toBe(255);
  });

  it('all output pixels have alpha 255', () => {
    const input = createTestImageData(4, 4, { r: 100, g: 150, b: 200 });
    const output = solveCGASubpalette(input, cgaPalette);

    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4 + 3]).toBe(255);
    }
  });

  it('maps near-red to the closest palette color', () => {
    // Pure red (255,0,0) — nearest in CGA 4-color is magenta (255,0,255)
    const input = createTestImageData(1, 1, { r: 255, g: 0, b: 0 });
    const output = solveCGASubpalette(input, cgaPalette);
    expect(output.data[0]).toBe(255);
    expect(output.data[1]).toBe(0);
    expect(output.data[2]).toBe(255);
  });

  it('maps black input to black', () => {
    const input = createTestImageData(4, 4, { r: 0, g: 0, b: 0 });
    const output = solveCGASubpalette(input, cgaPalette);

    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4]).toBe(0);
      expect(output.data[i * 4 + 1]).toBe(0);
      expect(output.data[i * 4 + 2]).toBe(0);
    }
  });

  it('maps white input to white', () => {
    const input = createTestImageData(4, 4, { r: 255, g: 255, b: 255 });
    const output = solveCGASubpalette(input, cgaPalette);

    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4]).toBe(255);
      expect(output.data[i * 4 + 1]).toBe(255);
      expect(output.data[i * 4 + 2]).toBe(255);
    }
  });

  it('works with a custom distance algorithm', () => {
    const input = createTestImageData(4, 4, { r: 100, g: 150, b: 200 });
    const output = solveCGASubpalette(input, cgaPalette, 'euclidean');
    expect(output.width).toBe(4);
    expect(output.height).toBe(4);

    for (let i = 0; i < 16; i++) {
      const r = output.data[i * 4]!;
      const g = output.data[i * 4 + 1]!;
      const b = output.data[i * 4 + 2]!;
      const isPaletteColor = cgaPalette.some(
        (p) => p.color.r === r && p.color.g === g && p.color.b === b,
      );
      expect(isPaletteColor).toBe(true);
    }
  });
});
