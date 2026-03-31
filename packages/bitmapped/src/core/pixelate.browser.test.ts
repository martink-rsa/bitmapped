import { describe, it, expect } from 'vitest';
import { pixelateDownscale } from './pixelate.js';

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

function getPixel(
  imageData: ImageData,
  x: number,
  y: number,
): { r: number; g: number; b: number; a: number } {
  const idx = (y * imageData.width + x) * 4;
  return {
    r: imageData.data[idx]!,
    g: imageData.data[idx + 1]!,
    b: imageData.data[idx + 2]!,
    a: imageData.data[idx + 3]!,
  };
}

describe('pixelateDownscale', () => {
  it('returns ImageData with the same dimensions as the input', () => {
    const input = createTestImageData(16, 12, { r: 100, g: 150, b: 200 });
    const output = pixelateDownscale(input, 4);

    expect(output.width).toBe(16);
    expect(output.height).toBe(12);
    expect(output).toBeInstanceOf(ImageData);
  });

  it('returns same dimensions for non-evenly divisible image', () => {
    const input = createTestImageData(10, 7, { r: 80, g: 80, b: 80 });
    const output = pixelateDownscale(input, 3);

    expect(output.width).toBe(10);
    expect(output.height).toBe(7);
  });

  it('produces uniform output for uniform input', () => {
    const fill = { r: 42, g: 128, b: 200 };
    const input = createTestImageData(8, 8, fill);
    const output = pixelateDownscale(input, 4);

    for (let y = 0; y < output.height; y++) {
      for (let x = 0; x < output.width; x++) {
        const px = getPixel(output, x, y);
        expect(px.r).toBeCloseTo(fill.r, -1);
        expect(px.g).toBeCloseTo(fill.g, -1);
        expect(px.b).toBeCloseTo(fill.b, -1);
      }
    }
  });

  it('blockSize of 1 preserves the image approximately', () => {
    const data = new Uint8ClampedArray([
      255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 0, 255,
    ]);
    const input = new ImageData(data, 2, 2);
    const output = pixelateDownscale(input, 1);

    expect(output.width).toBe(2);
    expect(output.height).toBe(2);

    // Each pixel should be close to the original value
    const topLeft = getPixel(output, 0, 0);
    expect(topLeft.r).toBeCloseTo(255, -1);
    expect(topLeft.g).toBeCloseTo(0, -1);
    expect(topLeft.b).toBeCloseTo(0, -1);

    const topRight = getPixel(output, 1, 0);
    expect(topRight.r).toBeCloseTo(0, -1);
    expect(topRight.g).toBeCloseTo(255, -1);
    expect(topRight.b).toBeCloseTo(0, -1);

    const bottomLeft = getPixel(output, 0, 1);
    expect(bottomLeft.r).toBeCloseTo(0, -1);
    expect(bottomLeft.g).toBeCloseTo(0, -1);
    expect(bottomLeft.b).toBeCloseTo(255, -1);
  });

  it('each block region has a uniform color (imageSmoothingEnabled=false on upscale)', () => {
    // Use a 2-color image where left half is red and right half is blue
    const width = 8;
    const height = 4;
    const blockSize = 4;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        if (x < 4) {
          data[idx] = 255;
          data[idx + 1] = 0;
          data[idx + 2] = 0;
          data[idx + 3] = 255;
        } else {
          data[idx] = 0;
          data[idx + 1] = 0;
          data[idx + 2] = 255;
          data[idx + 3] = 255;
        }
      }
    }
    const input = new ImageData(data, width, height);
    const output = pixelateDownscale(input, blockSize);

    // All pixels within the left block should have the same color
    const leftBlockColor = getPixel(output, 0, 0);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < blockSize; x++) {
        const px = getPixel(output, x, y);
        expect(px.r).toBe(leftBlockColor.r);
        expect(px.g).toBe(leftBlockColor.g);
        expect(px.b).toBe(leftBlockColor.b);
      }
    }

    // All pixels within the right block should have the same color
    const rightBlockColor = getPixel(output, blockSize, 0);
    for (let y = 0; y < height; y++) {
      for (let x = blockSize; x < width; x++) {
        const px = getPixel(output, x, y);
        expect(px.r).toBe(rightBlockColor.r);
        expect(px.g).toBe(rightBlockColor.g);
        expect(px.b).toBe(rightBlockColor.b);
      }
    }

    // The two blocks should be different (one reddish, one bluish)
    expect(leftBlockColor.r).toBeGreaterThan(leftBlockColor.b);
    expect(rightBlockColor.b).toBeGreaterThan(rightBlockColor.r);
  });

  it('does not mutate the input ImageData', () => {
    const fill = { r: 10, g: 20, b: 30 };
    const input = createTestImageData(8, 8, fill);
    const originalData = new Uint8ClampedArray(input.data);

    pixelateDownscale(input, 4);

    expect(input.data).toEqual(originalData);
  });
});
