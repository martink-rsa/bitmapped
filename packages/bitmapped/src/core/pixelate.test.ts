import { describe, it, expect } from 'vitest';
import type { RGB, PixelateResult } from './types.js';
import {
  pixelateBlockAverage,
  pixelateResample,
  renderPixelateResult,
} from './pixelate.js';

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

describe('pixelateBlockAverage', () => {
  it('returns a grid with correct dimensions for evenly divisible image', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 100, b: 100 });
    const result = pixelateBlockAverage(input, 4);

    expect(result.width).toBe(2);
    expect(result.height).toBe(2);
    expect(result.grid).toHaveLength(2);
    expect(result.grid[0]).toHaveLength(2);
    expect(result.blockSize).toBe(4);
  });

  it('handles non-evenly divisible dimensions (edge blocks)', () => {
    const input = createTestImageData(10, 10, { r: 50, g: 50, b: 50 });
    const result = pixelateBlockAverage(input, 4);

    // ceil(10/4) = 3
    expect(result.width).toBe(3);
    expect(result.height).toBe(3);
    expect(result.grid).toHaveLength(3);
    for (const row of result.grid) {
      expect(row).toHaveLength(3);
    }
  });

  it('returns the fill color for a uniform image', () => {
    const fill: RGB = { r: 42, g: 84, b: 126 };
    const input = createTestImageData(8, 8, fill);
    const result = pixelateBlockAverage(input, 4);

    for (const row of result.grid) {
      for (const color of row) {
        expect(color).toEqual(fill);
      }
    }
  });

  it('computes correct average for a 2x2 block with different colors', () => {
    // 2x2 image with four different colors
    const data = new Uint8ClampedArray([
      255,
      0,
      0,
      255, // red
      0,
      255,
      0,
      255, // green
      0,
      0,
      255,
      255, // blue
      255,
      255,
      0,
      255, // yellow
    ]);
    const input = new ImageData(data, 2, 2);
    const result = pixelateBlockAverage(input, 2);

    // Single block averaging all 4 pixels
    expect(result.width).toBe(1);
    expect(result.height).toBe(1);
    expect(result.grid[0]![0]).toEqual({ r: 128, g: 128, b: 64 });
  });

  it('produces independent block averages', () => {
    // 4x2 image: left half red, right half blue
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 255, 0, 0,
      255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    ]);
    const input = new ImageData(data, 4, 2);
    const result = pixelateBlockAverage(input, 2);

    expect(result.width).toBe(2);
    expect(result.height).toBe(1);
    expect(result.grid[0]![0]).toEqual({ r: 255, g: 0, b: 0 }); // left block = red
    expect(result.grid[0]![1]).toEqual({ r: 0, g: 0, b: 255 }); // right block = blue
  });

  it('blockSize of 1 returns each pixel as its own block', () => {
    const data = new Uint8ClampedArray([10, 20, 30, 255, 40, 50, 60, 255]);
    const input = new ImageData(data, 2, 1);
    const result = pixelateBlockAverage(input, 1);

    expect(result.width).toBe(2);
    expect(result.height).toBe(1);
    expect(result.grid[0]![0]).toEqual({ r: 10, g: 20, b: 30 });
    expect(result.grid[0]![1]).toEqual({ r: 40, g: 50, b: 60 });
  });

  it('colors array contains all block colors in row-major order', () => {
    const input = createTestImageData(4, 4, { r: 100, g: 200, b: 50 });
    const result = pixelateBlockAverage(input, 2);

    expect(result.colors).toHaveLength(4); // 2x2 grid
    for (const color of result.colors) {
      expect(color).toEqual({ r: 100, g: 200, b: 50 });
    }
  });
});

describe('pixelateResample', () => {
  it('returns a grid with correct dimensions for evenly divisible image', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 100, b: 100 });
    const result = pixelateResample(input, 4);

    expect(result.width).toBe(2);
    expect(result.height).toBe(2);
    expect(result.grid).toHaveLength(2);
    expect(result.grid[0]).toHaveLength(2);
    expect(result.blockSize).toBe(4);
  });

  it('handles non-evenly divisible dimensions', () => {
    const input = createTestImageData(10, 10, { r: 50, g: 50, b: 50 });
    const result = pixelateResample(input, 4);

    // ceil(10/4) = 3
    expect(result.width).toBe(3);
    expect(result.height).toBe(3);
    expect(result.grid).toHaveLength(3);
    for (const row of result.grid) {
      expect(row).toHaveLength(3);
    }
  });

  it('returns approximately the fill color for a uniform image', () => {
    const fill: RGB = { r: 42, g: 84, b: 126 };
    const input = createTestImageData(8, 8, fill);
    const result = pixelateResample(input, 4);

    for (const row of result.grid) {
      for (const color of row) {
        // Bilinear interpolation of a uniform image should be exact
        expect(color.r).toBeCloseTo(fill.r, 0);
        expect(color.g).toBeCloseTo(fill.g, 0);
        expect(color.b).toBeCloseTo(fill.b, 0);
      }
    }
  });

  it('throws when blockSize is less than 1', () => {
    const input = createTestImageData(4, 4, { r: 0, g: 0, b: 0 });
    expect(() => pixelateResample(input, 0)).toThrow(
      'blockSize must be at least 1',
    );
  });

  it('blockSize of 1 returns each pixel as its own block', () => {
    const data = new Uint8ClampedArray([10, 20, 30, 255, 40, 50, 60, 255]);
    const input = new ImageData(data, 2, 1);
    const result = pixelateResample(input, 1);

    expect(result.width).toBe(2);
    expect(result.height).toBe(1);
    expect(result.grid[0]![0]).toEqual({ r: 10, g: 20, b: 30 });
    expect(result.grid[0]![1]).toEqual({ r: 40, g: 50, b: 60 });
  });

  it('colors array has correct length in row-major order', () => {
    const input = createTestImageData(8, 8, { r: 100, g: 200, b: 50 });
    const result = pixelateResample(input, 4);

    expect(result.colors).toHaveLength(4); // 2x2 grid
  });

  it('distinguishes left/right halves of a two-color image', () => {
    // 4x2 image: left half red, right half blue
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255, 255, 0, 0,
      255, 255, 0, 0, 255, 0, 0, 255, 255, 0, 0, 255, 255,
    ]);
    const input = new ImageData(data, 4, 2);
    const result = pixelateResample(input, 2);

    expect(result.width).toBe(2);
    expect(result.height).toBe(1);
    // Left block should be predominantly red
    expect(result.grid[0]![0]!.r).toBeGreaterThan(result.grid[0]![0]!.b);
    // Right block should be predominantly blue
    expect(result.grid[0]![1]!.b).toBeGreaterThan(result.grid[0]![1]!.r);
  });
});

describe('renderPixelateResult', () => {
  it('renders a single-block result to a uniform image', () => {
    const result: PixelateResult = {
      grid: [[{ r: 255, g: 0, b: 0 }]],
      colors: [{ r: 255, g: 0, b: 0 }],
      width: 1,
      height: 1,
      blockSize: 4,
    };

    const output = renderPixelateResult(result, 4, 4);
    expect(output.width).toBe(4);
    expect(output.height).toBe(4);

    // Every pixel should be red
    for (let i = 0; i < 16; i++) {
      expect(output.data[i * 4]).toBe(255);
      expect(output.data[i * 4 + 1]).toBe(0);
      expect(output.data[i * 4 + 2]).toBe(0);
      expect(output.data[i * 4 + 3]).toBe(255);
    }
  });

  it('renders a 2x1 grid into distinct left/right halves', () => {
    const result: PixelateResult = {
      grid: [
        [
          { r: 255, g: 0, b: 0 },
          { r: 0, g: 0, b: 255 },
        ],
      ],
      colors: [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 0, b: 255 },
      ],
      width: 2,
      height: 1,
      blockSize: 2,
    };

    const output = renderPixelateResult(result, 4, 2);
    expect(output.width).toBe(4);
    expect(output.height).toBe(2);

    // Left 2 columns = red
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < 2; x++) {
        const i = (y * 4 + x) * 4;
        expect(output.data[i]).toBe(255);
        expect(output.data[i + 1]).toBe(0);
        expect(output.data[i + 2]).toBe(0);
      }
    }

    // Right 2 columns = blue
    for (let y = 0; y < 2; y++) {
      for (let x = 2; x < 4; x++) {
        const i = (y * 4 + x) * 4;
        expect(output.data[i]).toBe(0);
        expect(output.data[i + 1]).toBe(0);
        expect(output.data[i + 2]).toBe(255);
      }
    }
  });

  it('handles edge blocks that are smaller than blockSize', () => {
    // 3x3 image with blockSize=2 → 2x2 grid, edge blocks are 1px wide/tall
    const result: PixelateResult = {
      grid: [
        [
          { r: 255, g: 0, b: 0 },
          { r: 0, g: 255, b: 0 },
        ],
        [
          { r: 0, g: 0, b: 255 },
          { r: 255, g: 255, b: 0 },
        ],
      ],
      colors: [
        { r: 255, g: 0, b: 0 },
        { r: 0, g: 255, b: 0 },
        { r: 0, g: 0, b: 255 },
        { r: 255, g: 255, b: 0 },
      ],
      width: 2,
      height: 2,
      blockSize: 2,
    };

    const output = renderPixelateResult(result, 3, 3);
    expect(output.width).toBe(3);
    expect(output.height).toBe(3);

    // Top-left 2x2 block = red
    expect(output.data[0]).toBe(255); // (0,0)
    expect(output.data[1]).toBe(0);
    expect(output.data[2]).toBe(0);

    // Top-right 1x2 block (x=2) = green
    const idx = 2 * 4;
    expect(output.data[idx]).toBe(0);
    expect(output.data[idx + 1]).toBe(255);
    expect(output.data[idx + 2]).toBe(0);

    // Bottom-right corner (2,2) = yellow
    const cornerIdx = (2 * 3 + 2) * 4;
    expect(output.data[cornerIdx]).toBe(255);
    expect(output.data[cornerIdx + 1]).toBe(255);
    expect(output.data[cornerIdx + 2]).toBe(0);
  });

  it('round-trips through pixelateBlockAverage for uniform images', () => {
    const fill: RGB = { r: 42, g: 84, b: 126 };
    const input = createTestImageData(8, 8, fill);
    const pixResult = pixelateBlockAverage(input, 4);
    const output = renderPixelateResult(pixResult, 8, 8);

    for (let i = 0; i < 64; i++) {
      expect(output.data[i * 4]).toBe(42);
      expect(output.data[i * 4 + 1]).toBe(84);
      expect(output.data[i * 4 + 2]).toBe(126);
      expect(output.data[i * 4 + 3]).toBe(255);
    }
  });
});
