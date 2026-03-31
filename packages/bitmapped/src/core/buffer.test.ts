import { describe, it, expect } from 'vitest';
import type { RGB } from './types.js';
import {
  getPixelRGB,
  setPixelRGB,
  calculateAverageColor,
  createImageData,
  imageDataToUint32,
  uint32ToRGB,
  rgbToUint32,
} from './buffer.js';

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

describe('getPixelRGB / setPixelRGB', () => {
  it('reads the correct color at a given pixel index', () => {
    const data = new Uint8ClampedArray([10, 20, 30, 255, 40, 50, 60, 255]);
    const imgData = new ImageData(data, 2, 1);
    expect(getPixelRGB(imgData.data, 0)).toEqual({ r: 10, g: 20, b: 30 });
    expect(getPixelRGB(imgData.data, 1)).toEqual({ r: 40, g: 50, b: 60 });
  });

  it('writes a color to the correct pixel index', () => {
    const data = new Uint8ClampedArray(8);
    setPixelRGB(data, 1, { r: 100, g: 150, b: 200 });
    expect(data[4]).toBe(100);
    expect(data[5]).toBe(150);
    expect(data[6]).toBe(200);
    expect(data[7]).toBe(255);
  });
});

describe('calculateAverageColor', () => {
  it('returns the average of a 2x2 image with known colors', () => {
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
    const imgData = new ImageData(data, 2, 2);
    const avg = calculateAverageColor(imgData);
    expect(avg.r).toBe(128);
    expect(avg.g).toBe(128);
    expect(avg.b).toBe(64);
  });

  it('returns the fill color for a uniform image', () => {
    const imgData = createTestImageData(4, 4, { r: 42, g: 84, b: 126 });
    const avg = calculateAverageColor(imgData);
    expect(avg).toEqual({ r: 42, g: 84, b: 126 });
  });
});

describe('createImageData', () => {
  it('creates an ImageData with the correct dimensions', () => {
    const imgData = createImageData(10, 20);
    expect(imgData.width).toBe(10);
    expect(imgData.height).toBe(20);
    expect(imgData.data.length).toBe(10 * 20 * 4);
  });
});

describe('uint32ToRGB / rgbToUint32', () => {
  it('round-trips correctly', () => {
    const colors: RGB[] = [
      { r: 0, g: 0, b: 0 },
      { r: 255, g: 255, b: 255 },
      { r: 128, g: 64, b: 32 },
      { r: 1, g: 2, b: 3 },
    ];

    for (const color of colors) {
      const packed = rgbToUint32(color);
      const unpacked = uint32ToRGB(packed);
      expect(unpacked).toEqual(color);
    }
  });

  it('packs with correct alpha', () => {
    const packed = rgbToUint32({ r: 0, g: 0, b: 0 }, 128);
    // Alpha is in the highest byte
    expect((packed >>> 24) & 0xff).toBe(128);
  });
});

describe('imageDataToUint32', () => {
  it('returns a Uint32Array view of the data', () => {
    const imgData = createTestImageData(2, 2, { r: 255, g: 0, b: 0 });
    const u32 = imageDataToUint32(imgData);
    expect(u32.length).toBe(4);
    const rgb = uint32ToRGB(u32[0]!);
    expect(rgb).toEqual({ r: 255, g: 0, b: 0 });
  });
});

describe('setPixelRGB', () => {
  it('sets alpha to 255', () => {
    const data = new Uint8ClampedArray(4);
    setPixelRGB(data, 0, { r: 10, g: 20, b: 30 });
    expect(data[3]).toBe(255);
  });
});

describe('calculateAverageColor', () => {
  it('handles a 1x1 image', () => {
    const data = new Uint8ClampedArray([42, 84, 126, 255]);
    const imgData = new ImageData(data, 1, 1);
    expect(calculateAverageColor(imgData)).toEqual({ r: 42, g: 84, b: 126 });
  });
});

describe('createImageData', () => {
  it('initializes all bytes to zero', () => {
    const imgData = createImageData(2, 2);
    for (let i = 0; i < imgData.data.length; i++) {
      expect(imgData.data[i]).toBe(0);
    }
  });
});

describe('rgbToUint32', () => {
  it('defaults alpha to 255', () => {
    const packed = rgbToUint32({ r: 0, g: 0, b: 0 });
    expect((packed >>> 24) & 0xff).toBe(255);
  });

  it('correctly packs known color', () => {
    const packed = rgbToUint32({ r: 1, g: 2, b: 3 });
    const rgb = uint32ToRGB(packed);
    expect(rgb).toEqual({ r: 1, g: 2, b: 3 });
  });
});
