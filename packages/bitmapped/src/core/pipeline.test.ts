import { describe, it, expect } from 'vitest';
import type { RGB, Palette, ProcessOptions } from './types.js';
import { process } from './pipeline.js';

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

const testPalette: Palette = [
  { color: { r: 0, g: 0, b: 0 }, name: 'Black' },
  { color: { r: 255, g: 255, b: 255 }, name: 'White' },
  { color: { r: 255, g: 0, b: 0 }, name: 'Red' },
  { color: { r: 0, g: 255, b: 0 }, name: 'Green' },
  { color: { r: 0, g: 0, b: 255 }, name: 'Blue' },
];

describe('process', () => {
  it('returns result with correct dimensions', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    const options: ProcessOptions = {
      blockSize: 4,
      palette: testPalette,
    };

    const result = process(input, options);

    expect(result.width).toBe(8);
    expect(result.height).toBe(8);
    expect(result.imageData.width).toBe(8);
    expect(result.imageData.height).toBe(8);
  });

  it('returns a grid matching the blockSize', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    const options: ProcessOptions = {
      blockSize: 4,
      palette: testPalette,
    };

    const result = process(input, options);

    // 8/4 = 2x2 grid
    expect(result.grid).toHaveLength(2);
    expect(result.grid[0]).toHaveLength(2);
  });

  it('maps a red image to the red palette entry with no dithering', () => {
    const input = createTestImageData(4, 4, { r: 240, g: 10, b: 5 });
    const options: ProcessOptions = {
      blockSize: 4,
      palette: testPalette,
      dithering: 'none',
    };

    const result = process(input, options);

    // Grid should map to red
    expect(result.grid[0]![0]).toEqual({ r: 255, g: 0, b: 0 });

    // All pixels should be red
    for (let i = 0; i < 16; i++) {
      expect(result.imageData.data[i * 4]).toBe(255);
      expect(result.imageData.data[i * 4 + 1]).toBe(0);
      expect(result.imageData.data[i * 4 + 2]).toBe(0);
    }
  });

  it('all output pixels are palette colors when dithering is none', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 150, b: 200 });
    const options: ProcessOptions = {
      blockSize: 2,
      palette: testPalette,
      dithering: 'none',
    };

    const result = process(input, options);
    const paletteColors = testPalette.map((p) => p.color);

    for (let i = 0; i < 64; i++) {
      const r = result.imageData.data[i * 4]!;
      const g = result.imageData.data[i * 4 + 1]!;
      const b = result.imageData.data[i * 4 + 2]!;
      const isPaletteColor = paletteColors.some(
        (p) => p.r === r && p.g === g && p.b === b,
      );
      expect(isPaletteColor).toBe(true);
    }
  });

  it('works with floyd-steinberg dithering', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    const options: ProcessOptions = {
      blockSize: 2,
      palette: testPalette,
      dithering: 'floyd-steinberg',
    };

    const result = process(input, options);

    expect(result.imageData.width).toBe(8);
    expect(result.imageData.height).toBe(8);

    // Output should still only contain palette colors
    const paletteColors = testPalette.map((p) => p.color);
    for (let i = 0; i < 64; i++) {
      const r = result.imageData.data[i * 4]!;
      const g = result.imageData.data[i * 4 + 1]!;
      const b = result.imageData.data[i * 4 + 2]!;
      const isPaletteColor = paletteColors.some(
        (p) => p.r === r && p.g === g && p.b === b,
      );
      expect(isPaletteColor).toBe(true);
    }
  });

  it('works with bayer dithering', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    const options: ProcessOptions = {
      blockSize: 2,
      palette: testPalette,
      dithering: 'bayer',
    };

    const result = process(input, options);

    expect(result.imageData.width).toBe(8);
    expect(result.imageData.height).toBe(8);
  });

  it('works with atkinson dithering', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    const options: ProcessOptions = {
      blockSize: 2,
      palette: testPalette,
      dithering: 'atkinson',
    };

    const result = process(input, options);

    expect(result.imageData.width).toBe(8);
    expect(result.imageData.height).toBe(8);
  });

  it('respects the distanceAlgorithm option', () => {
    const input = createTestImageData(4, 4, { r: 200, g: 50, b: 50 });

    const resultDefault = process(input, {
      blockSize: 4,
      palette: testPalette,
    });

    const resultEuclidean = process(input, {
      blockSize: 4,
      palette: testPalette,
      distanceAlgorithm: 'euclidean',
    });

    // Both should map to red, but this tests that the option is accepted
    expect(resultDefault.grid[0]![0]).toEqual({ r: 255, g: 0, b: 0 });
    expect(resultEuclidean.grid[0]![0]).toEqual({ r: 255, g: 0, b: 0 });
  });

  it('handles non-evenly-divisible dimensions', () => {
    const input = createTestImageData(10, 10, { r: 0, g: 0, b: 0 });
    const options: ProcessOptions = {
      blockSize: 4,
      palette: testPalette,
      dithering: 'none',
    };

    const result = process(input, options);

    expect(result.width).toBe(10);
    expect(result.height).toBe(10);
    // ceil(10/4) = 3
    expect(result.grid).toHaveLength(3);
    expect(result.grid[0]).toHaveLength(3);
  });

  it.each(['floyd-steinberg', 'bayer', 'atkinson'] as const)(
    'dithering (%s) produces solid-color blocks',
    (dithering) => {
      // Use a gradient-like image where adjacent blocks differ
      const width = 16;
      const height = 16;
      const blockSize = 4;
      const data = new Uint8ClampedArray(width * height * 4);
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          data[i] = Math.round((x / width) * 255);
          data[i + 1] = Math.round((y / height) * 255);
          data[i + 2] = 128;
          data[i + 3] = 255;
        }
      }
      const input = new ImageData(data, width, height);

      const result = process(input, {
        blockSize,
        palette: testPalette,
        dithering,
      });

      // Every pixel within a blockSize×blockSize block must be the same color
      const gridW = Math.ceil(width / blockSize);
      const gridH = Math.ceil(height / blockSize);
      for (let gy = 0; gy < gridH; gy++) {
        for (let gx = 0; gx < gridW; gx++) {
          const startX = gx * blockSize;
          const startY = gy * blockSize;
          const refIdx = (startY * width + startX) * 4;
          const refR = result.imageData.data[refIdx]!;
          const refG = result.imageData.data[refIdx + 1]!;
          const refB = result.imageData.data[refIdx + 2]!;

          for (let dy = 0; dy < blockSize && startY + dy < height; dy++) {
            for (let dx = 0; dx < blockSize && startX + dx < width; dx++) {
              const idx = ((startY + dy) * width + (startX + dx)) * 4;
              expect(result.imageData.data[idx]).toBe(refR);
              expect(result.imageData.data[idx + 1]).toBe(refG);
              expect(result.imageData.data[idx + 2]).toBe(refB);
            }
          }
        }
      }
    },
  );

  it('does not mutate the input ImageData', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    const originalData = new Uint8ClampedArray(input.data);
    process(input, { blockSize: 4, palette: testPalette });
    expect(input.data).toEqual(originalData);
  });

  it('works with custom dithering and a user-provided matrix', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    // Simple 2x2 Bayer-like threshold matrix
    const ditherMatrix = [
      [0.25, 0.75],
      [1.0, 0.5],
    ];
    const options: ProcessOptions = {
      blockSize: 2,
      palette: testPalette,
      dithering: 'custom',
      ditherMatrix,
    };

    const result = process(input, options);

    expect(result.imageData.width).toBe(8);
    expect(result.imageData.height).toBe(8);

    // All output pixels should be palette colors
    const paletteColors = testPalette.map((p) => p.color);
    for (let i = 0; i < result.imageData.data.length; i += 4) {
      const r = result.imageData.data[i]!;
      const g = result.imageData.data[i + 1]!;
      const b = result.imageData.data[i + 2]!;
      const isPalette = paletteColors.some(
        (p) => p.r === r && p.g === g && p.b === b,
      );
      expect(isPalette).toBe(true);
    }
  });

  it('throws when custom dithering is used without a ditherMatrix', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    expect(() =>
      process(input, {
        blockSize: 2,
        palette: testPalette,
        dithering: 'custom',
      }),
    ).toThrow("ditherMatrix is required when dithering is 'custom'");
  });

  it('works with ps1-ordered dithering', () => {
    const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
    const options: ProcessOptions = {
      blockSize: 2,
      palette: testPalette,
      dithering: 'ps1-ordered',
    };

    const result = process(input, options);

    expect(result.imageData.width).toBe(8);
    expect(result.imageData.height).toBe(8);

    // All output pixels should be palette colors
    const paletteColors = testPalette.map((p) => p.color);
    for (let i = 0; i < result.imageData.data.length; i += 4) {
      const r = result.imageData.data[i]!;
      const g = result.imageData.data[i + 1]!;
      const b = result.imageData.data[i + 2]!;
      const isPalette = paletteColors.some(
        (p) => p.r === r && p.g === g && p.b === b,
      );
      expect(isPalette).toBe(true);
    }
  });

  it('ps1-ordered dithering produces correct grid dimensions', () => {
    const input = createTestImageData(16, 16, { r: 200, g: 100, b: 50 });
    const result = process(input, {
      blockSize: 4,
      palette: testPalette,
      dithering: 'ps1-ordered',
    });

    // 16/4 = 4x4 grid
    expect(result.grid).toHaveLength(4);
    expect(result.grid[0]).toHaveLength(4);
  });

  describe('with targetResolution', () => {
    it('resizes output to target resolution', () => {
      const input = createTestImageData(64, 64, { r: 128, g: 128, b: 128 });
      const result = process(input, {
        blockSize: 1,
        palette: testPalette,
        targetResolution: { width: 32, height: 32 },
      });
      expect(result.width).toBe(32);
      expect(result.height).toBe(32);
      expect(result.imageData.width).toBe(32);
      expect(result.imageData.height).toBe(32);
    });

    it('sets effectiveResolution when targetResolution is used', () => {
      const input = createTestImageData(64, 64, { r: 128, g: 128, b: 128 });
      const result = process(input, {
        blockSize: 1,
        palette: testPalette,
        targetResolution: { width: 32, height: 32 },
      });
      expect(result.effectiveResolution).toEqual({ width: 32, height: 32 });
    });

    it('does not set effectiveResolution without targetResolution', () => {
      const input = createTestImageData(8, 8, { r: 128, g: 128, b: 128 });
      const result = process(input, { blockSize: 2, palette: testPalette });
      expect(result.effectiveResolution).toBeUndefined();
      expect(result.width).toBe(8);
      expect(result.height).toBe(8);
    });

    it('works with dithering and targetResolution together', () => {
      const input = createTestImageData(64, 64, { r: 128, g: 128, b: 128 });
      const result = process(input, {
        blockSize: 2,
        palette: testPalette,
        dithering: 'floyd-steinberg',
        targetResolution: { width: 32, height: 32 },
      });
      expect(result.width).toBe(32);
      expect(result.height).toBe(32);
    });
  });
});
