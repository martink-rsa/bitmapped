import { describe, it, expect } from 'vitest';
import { resizeImageData, fitToResolution } from './resize.js';
import { createImageData } from './buffer.js';

function createTestImageData(
  width: number,
  height: number,
  fill: { r: number; g: number; b: number } = { r: 0, g: 0, b: 0 },
): ImageData {
  const img = createImageData(width, height);
  for (let i = 0; i < width * height; i++) {
    img.data[i * 4] = fill.r;
    img.data[i * 4 + 1] = fill.g;
    img.data[i * 4 + 2] = fill.b;
    img.data[i * 4 + 3] = 255;
  }
  return img;
}

function setPixel(
  img: ImageData,
  x: number,
  y: number,
  r: number,
  g: number,
  b: number,
) {
  const i = (y * img.width + x) * 4;
  img.data[i] = r;
  img.data[i + 1] = g;
  img.data[i + 2] = b;
  img.data[i + 3] = 255;
}

function getPixel(img: ImageData, x: number, y: number) {
  const i = (y * img.width + x) * 4;
  return { r: img.data[i]!, g: img.data[i + 1]!, b: img.data[i + 2]! };
}

describe('resizeImageData', () => {
  describe('nearest-neighbor', () => {
    it('returns correct dimensions for downscale', () => {
      const input = createTestImageData(4, 4);
      const result = resizeImageData(input, 2, 2);
      expect(result.width).toBe(2);
      expect(result.height).toBe(2);
    });

    it('returns correct dimensions for upscale', () => {
      const input = createTestImageData(2, 2);
      const result = resizeImageData(input, 4, 4);
      expect(result.width).toBe(4);
      expect(result.height).toBe(4);
    });

    it('identity resize returns same-dimension copy', () => {
      const input = createTestImageData(4, 4, { r: 128, g: 64, b: 32 });
      const result = resizeImageData(input, 4, 4);
      expect(result.width).toBe(4);
      expect(result.height).toBe(4);
      expect(getPixel(result, 0, 0)).toEqual({ r: 128, g: 64, b: 32 });
    });

    it('preserves color on upscale', () => {
      const input = createTestImageData(2, 2);
      setPixel(input, 0, 0, 255, 0, 0);
      setPixel(input, 1, 0, 0, 255, 0);
      setPixel(input, 0, 1, 0, 0, 255);
      setPixel(input, 1, 1, 255, 255, 0);

      const result = resizeImageData(input, 4, 4);
      // Top-left 2x2 block should be red
      expect(getPixel(result, 0, 0)).toEqual({ r: 255, g: 0, b: 0 });
      expect(getPixel(result, 1, 0)).toEqual({ r: 255, g: 0, b: 0 });
      // Top-right 2x2 block should be green
      expect(getPixel(result, 2, 0)).toEqual({ r: 0, g: 255, b: 0 });
      expect(getPixel(result, 3, 0)).toEqual({ r: 0, g: 255, b: 0 });
    });

    it('downscale samples correct pixels', () => {
      const input = createTestImageData(4, 4);
      setPixel(input, 0, 0, 255, 0, 0);
      setPixel(input, 2, 0, 0, 255, 0);
      setPixel(input, 0, 2, 0, 0, 255);
      setPixel(input, 2, 2, 255, 255, 0);

      const result = resizeImageData(input, 2, 2);
      expect(getPixel(result, 0, 0)).toEqual({ r: 255, g: 0, b: 0 });
      expect(getPixel(result, 1, 0)).toEqual({ r: 0, g: 255, b: 0 });
      expect(getPixel(result, 0, 1)).toEqual({ r: 0, g: 0, b: 255 });
      expect(getPixel(result, 1, 1)).toEqual({ r: 255, g: 255, b: 0 });
    });

    it('does not mutate input', () => {
      const input = createTestImageData(4, 4, { r: 100, g: 100, b: 100 });
      const dataCopy = new Uint8ClampedArray(input.data);
      resizeImageData(input, 2, 2);
      expect(input.data).toEqual(dataCopy);
    });
  });

  describe('bilinear', () => {
    it('returns correct dimensions', () => {
      const input = createTestImageData(4, 4);
      const result = resizeImageData(input, 8, 8, 'bilinear');
      expect(result.width).toBe(8);
      expect(result.height).toBe(8);
    });

    it('produces intermediate values for gradient', () => {
      // 2x1 image: black on left, white on right
      const input = createTestImageData(2, 1);
      setPixel(input, 0, 0, 0, 0, 0);
      setPixel(input, 1, 0, 255, 255, 255);

      const result = resizeImageData(input, 4, 1, 'bilinear');
      const mid = getPixel(result, 1, 0);
      // Middle pixels should have intermediate values
      expect(mid.r).toBeGreaterThan(0);
      expect(mid.r).toBeLessThan(255);
    });

    it('preserves corners exactly', () => {
      const input = createTestImageData(2, 2);
      setPixel(input, 0, 0, 255, 0, 0);
      setPixel(input, 1, 1, 0, 0, 255);

      const result = resizeImageData(input, 4, 4, 'bilinear');
      expect(getPixel(result, 0, 0)).toEqual({ r: 255, g: 0, b: 0 });
      expect(getPixel(result, 3, 3)).toEqual({ r: 0, g: 0, b: 255 });
    });
  });
});

describe('fitToResolution', () => {
  describe('contain', () => {
    it('output dimensions match target resolution', () => {
      const input = createTestImageData(400, 200, { r: 255, g: 0, b: 0 });
      const result = fitToResolution(input, { width: 200, height: 200 });
      expect(result.width).toBe(200);
      expect(result.height).toBe(200);
    });

    it('letterboxes wide image with black bars', () => {
      const input = createTestImageData(400, 200, { r: 255, g: 0, b: 0 });
      const result = fitToResolution(input, { width: 200, height: 200 });
      // Top bar should be black
      expect(getPixel(result, 100, 0)).toEqual({ r: 0, g: 0, b: 0 });
      // Center should contain the scaled red image
      expect(getPixel(result, 100, 100).r).toBe(255);
      // Bottom bar should be black
      expect(getPixel(result, 100, 199)).toEqual({ r: 0, g: 0, b: 0 });
    });

    it('letterboxes tall image with black bars', () => {
      const input = createTestImageData(200, 400, { r: 0, g: 255, b: 0 });
      const result = fitToResolution(input, { width: 200, height: 200 });
      // Left bar should be black
      expect(getPixel(result, 0, 100)).toEqual({ r: 0, g: 0, b: 0 });
      // Center should contain the scaled green image
      expect(getPixel(result, 100, 100).g).toBe(255);
      // Right bar should be black
      expect(getPixel(result, 199, 100)).toEqual({ r: 0, g: 0, b: 0 });
    });
  });

  describe('stretch', () => {
    it('output dimensions match target resolution', () => {
      const input = createTestImageData(100, 50);
      const result = fitToResolution(
        input,
        { width: 200, height: 200 },
        'stretch',
      );
      expect(result.width).toBe(200);
      expect(result.height).toBe(200);
    });

    it('stretches content to fill', () => {
      const input = createTestImageData(2, 2, { r: 128, g: 128, b: 128 });
      const result = fitToResolution(input, { width: 4, height: 4 }, 'stretch');
      // All pixels should be the gray color
      expect(getPixel(result, 0, 0)).toEqual({ r: 128, g: 128, b: 128 });
      expect(getPixel(result, 3, 3)).toEqual({ r: 128, g: 128, b: 128 });
    });
  });

  describe('cover', () => {
    it('output dimensions match target resolution', () => {
      const input = createTestImageData(400, 200);
      const result = fitToResolution(
        input,
        { width: 200, height: 200 },
        'cover',
      );
      expect(result.width).toBe(200);
      expect(result.height).toBe(200);
    });

    it('fills target completely (no black bars)', () => {
      const input = createTestImageData(400, 200, { r: 255, g: 0, b: 0 });
      const result = fitToResolution(
        input,
        { width: 200, height: 200 },
        'cover',
      );
      // All edge pixels should be red (content fills the entire area)
      expect(getPixel(result, 0, 0).r).toBe(255);
      expect(getPixel(result, 199, 199).r).toBe(255);
    });
  });
});
