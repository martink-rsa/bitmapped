import { describe, it, expect } from 'vitest';
import type { RGB, Palette } from '../core/types.js';
import { solveScanline } from './scanline.js';

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

describe('solveScanline', () => {
  it('output has same dimensions as input', () => {
    const input = createTestImageData(16, 8, { r: 128, g: 128, b: 128 });
    const output = solveScanline(input, basicPalette, 2);
    expect(output.width).toBe(16);
    expect(output.height).toBe(8);
    expect(output.data.length).toBe(input.data.length);
  });

  it('all output pixels have alpha 255', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 150, b: 200 });
    const output = solveScanline(input, basicPalette, 2);
    for (let i = 0; i < output.width * output.height; i++) {
      expect(output.data[i * 4 + 3]).toBe(255);
    }
  });

  it('all output pixels are palette colors', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 150, b: 200 });
    const output = solveScanline(input, basicPalette, 2);
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
    solveScanline(input, basicPalette, 2);
    expect(input.data).toEqual(originalData);
  });

  it('1x1 image works', () => {
    const input = createTestImageData(1, 1, { r: 200, g: 200, b: 200 });
    const output = solveScanline(input, basicPalette, 2);
    expect(output.width).toBe(1);
    expect(output.height).toBe(1);
    const pixel = getPixel(output, 0, 0);
    expect(isPaletteColor(pixel, basicPalette)).toBe(true);
  });

  it('when palette.length <= maxColorsPerLine: all palette colors available', () => {
    const input = createTestImageData(8, 8, { r: 250, g: 5, b: 5 });
    // maxColorsPerLine >= palette size, so no constraint
    const output = solveScanline(input, basicPalette, 10);
    // Near-red should map to red
    const pixel = getPixel(output, 0, 0);
    expect(pixel).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('with maxColorsPerLine=1: each scanline uses exactly 1 color', () => {
    // Create image with varied pixels per row
    const input = createTestImageData(8, 4, { r: 0, g: 0, b: 0 });
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 8; x++) {
        const idx = (y * 8 + x) * 4;
        // Mix of colors per row
        if (x < 4) {
          input.data[idx] = 255;
          input.data[idx + 1] = 0;
          input.data[idx + 2] = 0;
        } else {
          input.data[idx] = 0;
          input.data[idx + 1] = 0;
          input.data[idx + 2] = 255;
        }
      }
    }

    const output = solveScanline(input, basicPalette, 1);

    // Each row should have exactly 1 unique color
    for (let y = 0; y < 4; y++) {
      const rowColors = new Set<string>();
      for (let x = 0; x < 8; x++) {
        const p = getPixel(output, x, y);
        rowColors.add(`${p.r},${p.g},${p.b}`);
      }
      expect(rowColors.size).toBe(1);
    }
  });

  it('with maxColorsPerLine=2: each scanline uses at most 2 colors', () => {
    // Create image with many colors per row
    const input = createTestImageData(10, 4, { r: 0, g: 0, b: 0 });
    for (let y = 0; y < 4; y++) {
      for (let x = 0; x < 10; x++) {
        const idx = (y * 10 + x) * 4;
        if (x < 3) {
          input.data[idx] = 255;
          input.data[idx + 1] = 0;
          input.data[idx + 2] = 0;
        } else if (x < 6) {
          input.data[idx] = 0;
          input.data[idx + 1] = 255;
          input.data[idx + 2] = 0;
        } else {
          input.data[idx] = 0;
          input.data[idx + 1] = 0;
          input.data[idx + 2] = 255;
        }
      }
    }

    const output = solveScanline(input, basicPalette, 2);

    for (let y = 0; y < 4; y++) {
      const rowColors = new Set<string>();
      for (let x = 0; x < 10; x++) {
        const p = getPixel(output, x, y);
        rowColors.add(`${p.r},${p.g},${p.b}`);
      }
      expect(rowColors.size).toBeLessThanOrEqual(2);
    }
  });

  it('uniform input returns matching palette color', () => {
    const input = createTestImageData(8, 8, { r: 255, g: 0, b: 0 });
    const output = solveScanline(input, basicPalette, 2);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const pixel = getPixel(output, x, y);
        expect(pixel).toEqual({ r: 255, g: 0, b: 0 });
      }
    }
  });
});
