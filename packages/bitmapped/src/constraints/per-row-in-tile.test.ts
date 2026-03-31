import { describe, it, expect } from 'vitest';
import type { RGB, Palette } from '../core/types.js';
import { solvePerRowInTile } from './per-row-in-tile.js';

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

function makePalette(colors: RGB[]): Palette {
  return colors.map((color, i) => ({ color, name: `c${i}` }));
}

function getPixel(img: ImageData, x: number, y: number): RGB {
  const idx = (y * img.width + x) * 4;
  return {
    r: img.data[idx]!,
    g: img.data[idx + 1]!,
    b: img.data[idx + 2]!,
  };
}

function isPaletteColor(pixel: RGB, palette: Palette): boolean {
  return palette.some(
    (pc) =>
      pc.color.r === pixel.r &&
      pc.color.g === pixel.g &&
      pc.color.b === pixel.b,
  );
}

const basicPalette = makePalette([
  { r: 0, g: 0, b: 0 },
  { r: 255, g: 255, b: 255 },
  { r: 255, g: 0, b: 0 },
  { r: 0, g: 255, b: 0 },
  { r: 0, g: 0, b: 255 },
]);

describe('solvePerRowInTile', () => {
  it('output has same dimensions as input', () => {
    const input = createTestImageData(16, 16, { r: 128, g: 128, b: 128 });
    const output = solvePerRowInTile(input, basicPalette, 8, 8);
    expect(output.width).toBe(16);
    expect(output.height).toBe(16);
    expect(output.data.length).toBe(input.data.length);
  });

  it('all output pixels have alpha 255', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 150, b: 200 });
    const output = solvePerRowInTile(input, basicPalette, 8, 8);
    for (let i = 0; i < output.width * output.height; i++) {
      expect(output.data[i * 4 + 3]).toBe(255);
    }
  });

  it('all output pixels are palette colors', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 150, b: 200 });
    const output = solvePerRowInTile(input, basicPalette, 8, 8);
    for (let y = 0; y < output.height; y++) {
      for (let x = 0; x < output.width; x++) {
        const pixel = getPixel(output, x, y);
        expect(isPaletteColor(pixel, basicPalette)).toBe(true);
      }
    }
  });

  it('does not mutate input', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    const originalData = new Uint8ClampedArray(input.data);
    solvePerRowInTile(input, basicPalette, 8, 8);
    expect(input.data).toEqual(originalData);
  });

  it('1x1 image works', () => {
    const input = createTestImageData(1, 1, { r: 200, g: 200, b: 200 });
    const output = solvePerRowInTile(input, basicPalette, 8, 8);
    expect(output.width).toBe(1);
    expect(output.height).toBe(1);
    const pixel = getPixel(output, 0, 0);
    expect(isPaletteColor(pixel, basicPalette)).toBe(true);
  });

  it('single palette color: all pixels become that color', () => {
    const singlePalette = makePalette([{ r: 42, g: 100, b: 200 }]);
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    const output = solvePerRowInTile(input, singlePalette, 8, 8);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const pixel = getPixel(output, x, y);
        expect(pixel).toEqual({ r: 42, g: 100, b: 200 });
      }
    }
  });

  it('each row within a tile uses at most 2 colors', () => {
    // Create an image with varied colors across a tile row
    const input = createTestImageData(8, 8, { r: 0, g: 0, b: 0 });
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const idx = (y * 8 + x) * 4;
        // Alternate between different colors per pixel
        input.data[idx] = x % 3 === 0 ? 255 : x % 3 === 1 ? 0 : 0;
        input.data[idx + 1] = x % 3 === 0 ? 0 : x % 3 === 1 ? 255 : 0;
        input.data[idx + 2] = x % 3 === 0 ? 0 : x % 3 === 1 ? 0 : 255;
      }
    }

    const output = solvePerRowInTile(input, basicPalette, 8, 8);

    // Check each row within the single 8x8 tile
    for (let row = 0; row < 8; row++) {
      const rowColors = new Set<string>();
      for (let x = 0; x < 8; x++) {
        const p = getPixel(output, x, row);
        rowColors.add(`${p.r},${p.g},${p.b}`);
      }
      expect(rowColors.size).toBeLessThanOrEqual(2);
    }
  });

  it('partial tiles at boundaries handled', () => {
    // 10x10 image with 8x8 tiles: partial tiles on edges
    const input = createTestImageData(10, 10, { r: 128, g: 128, b: 128 });
    const output = solvePerRowInTile(input, basicPalette, 8, 8);
    expect(output.width).toBe(10);
    expect(output.height).toBe(10);
    // Check pixel in partial tile area
    const pixel = getPixel(output, 9, 9);
    expect(isPaletteColor(pixel, basicPalette)).toBe(true);
  });

  it('uniform input returns matching palette color', () => {
    const input = createTestImageData(8, 8, { r: 255, g: 0, b: 0 });
    const output = solvePerRowInTile(input, basicPalette, 8, 8);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const pixel = getPixel(output, x, y);
        expect(pixel).toEqual({ r: 255, g: 0, b: 0 });
      }
    }
  });
});
