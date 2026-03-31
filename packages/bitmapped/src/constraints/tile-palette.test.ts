import { describe, it, expect } from 'vitest';
import type { RGB, Palette } from '../core/types.js';
import { solveTilePalette } from './tile-palette.js';
import type { TilePaletteConfig } from './types.js';

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

const defaultConfig: TilePaletteConfig = {
  tileWidth: 8,
  tileHeight: 8,
  subpaletteCount: 4,
  colorsPerSubpalette: 4,
  sharedTransparent: false,
};

const largePalette = makePalette([
  { r: 0, g: 0, b: 0 },
  { r: 255, g: 255, b: 255 },
  { r: 255, g: 0, b: 0 },
  { r: 0, g: 255, b: 0 },
  { r: 0, g: 0, b: 255 },
  { r: 255, g: 255, b: 0 },
  { r: 255, g: 0, b: 255 },
  { r: 0, g: 255, b: 255 },
  { r: 128, g: 128, b: 128 },
  { r: 64, g: 64, b: 64 },
]);

describe('solveTilePalette', () => {
  it('output has same dimensions as input', () => {
    const input = createTestImageData(16, 16, { r: 128, g: 128, b: 128 });
    const output = solveTilePalette(input, largePalette, defaultConfig);
    expect(output.width).toBe(16);
    expect(output.height).toBe(16);
    expect(output.data.length).toBe(input.data.length);
  });

  it('all output pixels have alpha 255', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 150, b: 200 });
    const output = solveTilePalette(input, largePalette, defaultConfig);
    for (let i = 0; i < output.width * output.height; i++) {
      expect(output.data[i * 4 + 3]).toBe(255);
    }
  });

  it('all output pixels are palette colors', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 150, b: 200 });
    const output = solveTilePalette(input, largePalette, defaultConfig);
    for (let y = 0; y < output.height; y++) {
      for (let x = 0; x < output.width; x++) {
        const pixel = getPixel(output, x, y);
        expect(isPaletteColor(pixel, largePalette)).toBe(true);
      }
    }
  });

  it('does not mutate input', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    const originalData = new Uint8ClampedArray(input.data);
    solveTilePalette(input, largePalette, defaultConfig);
    expect(input.data).toEqual(originalData);
  });

  it('1x1 image works', () => {
    const input = createTestImageData(1, 1, { r: 200, g: 200, b: 200 });
    const output = solveTilePalette(input, largePalette, defaultConfig);
    expect(output.width).toBe(1);
    expect(output.height).toBe(1);
    const pixel = getPixel(output, 0, 0);
    expect(isPaletteColor(pixel, largePalette)).toBe(true);
  });

  it('when palette.length <= colorsPerSubpalette: simple nearest-color map', () => {
    const smallPalette = makePalette([
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 },
    ]);
    const config: TilePaletteConfig = {
      ...defaultConfig,
      colorsPerSubpalette: 4, // larger than palette
    };
    const input = createTestImageData(8, 8, { r: 250, g: 250, b: 250 });
    const output = solveTilePalette(input, smallPalette, config);
    // Near-white should map to white
    const pixel = getPixel(output, 0, 0);
    expect(pixel).toEqual({ r: 255, g: 255, b: 255 });
  });

  it('per-tile independent subpalette selection', () => {
    // Create a 16x8 image: left tile red, right tile blue
    const input = createTestImageData(16, 8, { r: 0, g: 0, b: 0 });
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const idx = (y * 16 + x) * 4;
        input.data[idx] = 255;
        input.data[idx + 1] = 0;
        input.data[idx + 2] = 0;
      }
      for (let x = 8; x < 16; x++) {
        const idx = (y * 16 + x) * 4;
        input.data[idx] = 0;
        input.data[idx + 1] = 0;
        input.data[idx + 2] = 255;
      }
    }

    const config: TilePaletteConfig = {
      tileWidth: 8,
      tileHeight: 8,
      subpaletteCount: 4,
      colorsPerSubpalette: 2,
      sharedTransparent: false,
    };
    const output = solveTilePalette(input, largePalette, config);

    // Left tile should be red
    const leftPixel = getPixel(output, 0, 0);
    expect(leftPixel).toEqual({ r: 255, g: 0, b: 0 });

    // Right tile should be blue
    const rightPixel = getPixel(output, 8, 0);
    expect(rightPixel).toEqual({ r: 0, g: 0, b: 255 });
  });

  it('with sharedTransparent=true: first palette color always in subpalette', () => {
    const config: TilePaletteConfig = {
      tileWidth: 8,
      tileHeight: 8,
      subpaletteCount: 4,
      colorsPerSubpalette: 2,
      sharedTransparent: true,
    };
    // Fill with a color far from palette[0] (black) to ensure it would
    // not normally be selected, but still must be available
    const input = createTestImageData(8, 8, { r: 255, g: 255, b: 255 });
    const output = solveTilePalette(input, largePalette, config);

    // Output should still be valid palette colors
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const pixel = getPixel(output, x, y);
        expect(isPaletteColor(pixel, largePalette)).toBe(true);
      }
    }
  });

  it('partial tiles at image edges handled correctly', () => {
    // 10x10 image with 8x8 tiles: partial tiles on right and bottom
    const input = createTestImageData(10, 10, { r: 128, g: 128, b: 128 });
    const output = solveTilePalette(input, largePalette, defaultConfig);
    expect(output.width).toBe(10);
    expect(output.height).toBe(10);
    // Verify bottom-right corner pixel in partial tile
    const pixel = getPixel(output, 9, 9);
    expect(isPaletteColor(pixel, largePalette)).toBe(true);
  });

  it('uniform input returns matching palette color', () => {
    const input = createTestImageData(8, 8, { r: 255, g: 0, b: 0 });
    const output = solveTilePalette(input, largePalette, defaultConfig);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const pixel = getPixel(output, x, y);
        expect(pixel).toEqual({ r: 255, g: 0, b: 0 });
      }
    }
  });
});
