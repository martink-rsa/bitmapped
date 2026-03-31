import { describe, it, expect } from 'vitest';
import type { RGB, Palette } from '../core/types.js';
import { solveAttributeClash } from './attribute-clash.js';
import type { AttributeBlockConfig } from './types.js';

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

const defaultConfig: AttributeBlockConfig = {
  width: 8,
  height: 8,
  maxColors: 2,
};

const basicPalette = makePalette([
  { r: 0, g: 0, b: 0 },
  { r: 255, g: 255, b: 255 },
  { r: 255, g: 0, b: 0 },
  { r: 0, g: 255, b: 0 },
  { r: 0, g: 0, b: 255 },
]);

describe('solveAttributeClash', () => {
  it('throws error if palette has < 2 colors', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    const palette = makePalette([{ r: 0, g: 0, b: 0 }]);
    expect(() => solveAttributeClash(input, palette, defaultConfig)).toThrow(
      'at least 2 colors',
    );
  });

  it('output has same dimensions as input', () => {
    const input = createTestImageData(16, 16, { r: 128, g: 128, b: 128 });
    const output = solveAttributeClash(input, basicPalette, defaultConfig);
    expect(output.width).toBe(16);
    expect(output.height).toBe(16);
    expect(output.data.length).toBe(input.data.length);
  });

  it('all output pixels have alpha 255', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 150, b: 200 });
    const output = solveAttributeClash(input, basicPalette, defaultConfig);
    for (let i = 0; i < output.width * output.height; i++) {
      expect(output.data[i * 4 + 3]).toBe(255);
    }
  });

  it('all output pixels are palette colors', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 150, b: 200 });
    const output = solveAttributeClash(input, basicPalette, defaultConfig);
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
    solveAttributeClash(input, basicPalette, defaultConfig);
    expect(input.data).toEqual(originalData);
  });

  it('1x1 image works', () => {
    const input = createTestImageData(1, 1, { r: 200, g: 200, b: 200 });
    const output = solveAttributeClash(input, basicPalette, defaultConfig);
    expect(output.width).toBe(1);
    expect(output.height).toBe(1);
    const pixel = getPixel(output, 0, 0);
    expect(isPaletteColor(pixel, basicPalette)).toBe(true);
  });

  it('handles partial blocks at image boundaries', () => {
    // 10x10 image with 8x8 blocks produces partial blocks on right and bottom
    const input = createTestImageData(10, 10, { r: 128, g: 128, b: 128 });
    const output = solveAttributeClash(input, basicPalette, defaultConfig);
    expect(output.width).toBe(10);
    expect(output.height).toBe(10);
    // Check corner pixel in the partial block area
    const pixel = getPixel(output, 9, 9);
    expect(isPaletteColor(pixel, basicPalette)).toBe(true);
  });

  it('with maxColors=2: each 8x8 block uses at most 2 colors', () => {
    // Create an image with varied colors
    const input = createTestImageData(16, 16, { r: 0, g: 0, b: 0 });
    // Paint some pixels with different colors
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const idx = (y * 16 + x) * 4;
        if ((x + y) % 2 === 0) {
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

    const config: AttributeBlockConfig = {
      width: 8,
      height: 8,
      maxColors: 2,
    };
    const output = solveAttributeClash(input, basicPalette, config);

    // Check each 8x8 block uses at most 2 colors
    const blocksX = Math.ceil(16 / 8);
    const blocksY = Math.ceil(16 / 8);
    for (let by = 0; by < blocksY; by++) {
      for (let bx = 0; bx < blocksX; bx++) {
        const colorsInBlock = new Set<string>();
        const x0 = bx * 8;
        const y0 = by * 8;
        for (let py = y0; py < Math.min(y0 + 8, 16); py++) {
          for (let px = x0; px < Math.min(x0 + 8, 16); px++) {
            const p = getPixel(output, px, py);
            colorsInBlock.add(`${p.r},${p.g},${p.b}`);
          }
        }
        expect(colorsInBlock.size).toBeLessThanOrEqual(2);
      }
    }
  });

  it('with maxColors >= palette.length: acts as simple nearest-color', () => {
    const input = createTestImageData(8, 8, { r: 250, g: 5, b: 5 });
    const config: AttributeBlockConfig = {
      width: 8,
      height: 8,
      maxColors: 10, // >= palette size
    };
    const output = solveAttributeClash(input, basicPalette, config);
    // Nearly-red input should map to red
    const pixel = getPixel(output, 0, 0);
    expect(pixel).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('with maxColors=4 and greedy selection: each block uses at most 4 colors', () => {
    // Create image with many distinct colors
    const input = createTestImageData(8, 8, { r: 0, g: 0, b: 0 });
    for (let i = 0; i < 64; i++) {
      input.data[i * 4] = (i * 4) % 256;
      input.data[i * 4 + 1] = (i * 7) % 256;
      input.data[i * 4 + 2] = (i * 11) % 256;
    }

    const config: AttributeBlockConfig = {
      width: 8,
      height: 8,
      maxColors: 4,
    };
    const output = solveAttributeClash(input, basicPalette, config);

    const colorsInBlock = new Set<string>();
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const p = getPixel(output, x, y);
        colorsInBlock.add(`${p.r},${p.g},${p.b}`);
      }
    }
    expect(colorsInBlock.size).toBeLessThanOrEqual(4);
  });

  describe('brightLocked (ZX Spectrum mode)', () => {
    // ZX Spectrum palette: 8 non-bright + 8 bright colors
    const zxPalette = makePalette([
      // Non-bright (indices 0-7)
      { r: 0, g: 0, b: 0 }, // black
      { r: 0, g: 0, b: 192 }, // blue
      { r: 192, g: 0, b: 0 }, // red
      { r: 192, g: 0, b: 192 }, // magenta
      { r: 0, g: 192, b: 0 }, // green
      { r: 0, g: 192, b: 192 }, // cyan
      { r: 192, g: 192, b: 0 }, // yellow
      { r: 192, g: 192, b: 192 }, // white
      // Bright (indices 8-15)
      { r: 0, g: 0, b: 0 }, // black (bright)
      { r: 0, g: 0, b: 255 }, // bright blue
      { r: 255, g: 0, b: 0 }, // bright red
      { r: 255, g: 0, b: 255 }, // bright magenta
      { r: 0, g: 255, b: 0 }, // bright green
      { r: 0, g: 255, b: 255 }, // bright cyan
      { r: 255, g: 255, b: 0 }, // bright yellow
      { r: 255, g: 255, b: 255 }, // bright white
    ]);

    const brightConfig: AttributeBlockConfig = {
      width: 8,
      height: 8,
      maxColors: 2,
      brightLocked: true,
    };

    it('output has same dimensions as input', () => {
      const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
      const output = solveAttributeClash(input, zxPalette, brightConfig);
      expect(output.width).toBe(8);
      expect(output.height).toBe(8);
    });

    it('all output pixels are palette colors', () => {
      const input = createTestImageData(8, 8, { r: 100, g: 50, b: 200 });
      const output = solveAttributeClash(input, zxPalette, brightConfig);
      for (let y = 0; y < output.height; y++) {
        for (let x = 0; x < output.width; x++) {
          const pixel = getPixel(output, x, y);
          expect(isPaletteColor(pixel, zxPalette)).toBe(true);
        }
      }
    });

    it('each block uses at most 2 colors', () => {
      // Create varied input
      const input = createTestImageData(16, 16, { r: 0, g: 0, b: 0 });
      for (let i = 0; i < 256; i++) {
        input.data[i * 4] = (i * 17) % 256;
        input.data[i * 4 + 1] = (i * 31) % 256;
        input.data[i * 4 + 2] = (i * 47) % 256;
      }

      const output = solveAttributeClash(input, zxPalette, brightConfig);

      const blocksX = Math.ceil(16 / 8);
      const blocksY = Math.ceil(16 / 8);
      for (let by = 0; by < blocksY; by++) {
        for (let bx = 0; bx < blocksX; bx++) {
          const colorsInBlock = new Set<string>();
          const x0 = bx * 8;
          const y0 = by * 8;
          for (let py = y0; py < Math.min(y0 + 8, 16); py++) {
            for (let px = x0; px < Math.min(x0 + 8, 16); px++) {
              const p = getPixel(output, px, py);
              colorsInBlock.add(`${p.r},${p.g},${p.b}`);
            }
          }
          expect(colorsInBlock.size).toBeLessThanOrEqual(2);
        }
      }
    });

    it('block colors come from same brightness group', () => {
      // Create an input that could match bright or non-bright
      const input = createTestImageData(8, 8, { r: 200, g: 50, b: 50 });
      const output = solveAttributeClash(input, zxPalette, brightConfig);

      const colorsInBlock: RGB[] = [];
      for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
          const pixel = getPixel(output, x, y);
          if (
            !colorsInBlock.some(
              (c) => c.r === pixel.r && c.g === pixel.g && c.b === pixel.b,
            )
          ) {
            colorsInBlock.push(pixel);
          }
        }
      }

      // All colors should be from either non-bright (0-7) OR bright (8-15)
      const nonBrightColors = zxPalette.slice(0, 8).map((pc) => pc.color);
      const brightColors = zxPalette.slice(8, 16).map((pc) => pc.color);

      const allNonBright = colorsInBlock.every((c) =>
        nonBrightColors.some(
          (nb) => nb.r === c.r && nb.g === c.g && nb.b === c.b,
        ),
      );
      const allBright = colorsInBlock.every((c) =>
        brightColors.some((br) => br.r === c.r && br.g === c.g && br.b === c.b),
      );

      expect(allNonBright || allBright).toBe(true);
    });

    it('bright red input maps to bright palette colors', () => {
      const input = createTestImageData(8, 8, { r: 255, g: 0, b: 0 });
      const output = solveAttributeClash(input, zxPalette, brightConfig);
      const pixel = getPixel(output, 0, 0);
      // Should match bright red (255,0,0) at index 10
      expect(pixel).toEqual({ r: 255, g: 0, b: 0 });
    });
  });

  it('uniform color input matches the palette exactly', () => {
    const input = createTestImageData(8, 8, { r: 255, g: 0, b: 0 });
    const output = solveAttributeClash(input, basicPalette, defaultConfig);
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const pixel = getPixel(output, x, y);
        expect(pixel).toEqual({ r: 255, g: 0, b: 0 });
      }
    }
  });
});
