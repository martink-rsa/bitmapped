import type { RGB } from './types.js';

/**
 * Reads the RGB color at a given pixel index from an ImageData buffer.
 * @param data - The flat Uint8ClampedArray from ImageData
 * @param index - The pixel index (not byte offset)
 * @returns The RGB color at that pixel
 */
export function getPixelRGB(data: Uint8ClampedArray, index: number): RGB {
  const offset = index * 4;
  return {
    r: data[offset]!,
    g: data[offset + 1]!,
    b: data[offset + 2]!,
  };
}

/**
 * Writes an RGB color to a given pixel index in an ImageData buffer.
 * @param data - The flat Uint8ClampedArray from ImageData
 * @param index - The pixel index (not byte offset)
 * @param color - The RGB color to write
 */
export function setPixelRGB(
  data: Uint8ClampedArray,
  index: number,
  color: RGB,
): void {
  const offset = index * 4;
  data[offset] = color.r;
  data[offset + 1] = color.g;
  data[offset + 2] = color.b;
  data[offset + 3] = 255;
}

/**
 * Computes the average RGB color across all pixels in an ImageData.
 * @param imageData - The ImageData to average
 * @returns The average RGB color
 */
export function calculateAverageColor(imageData: ImageData): RGB {
  const { data, width, height } = imageData;
  const pixelCount = width * height;

  if (pixelCount === 0) {
    return { r: 0, g: 0, b: 0 };
  }

  let rSum = 0;
  let gSum = 0;
  let bSum = 0;

  for (let i = 0; i < pixelCount; i++) {
    rSum += data[i * 4]!;
    gSum += data[i * 4 + 1]!;
    bSum += data[i * 4 + 2]!;
  }

  return {
    r: Math.round(rSum / pixelCount),
    g: Math.round(gSum / pixelCount),
    b: Math.round(bSum / pixelCount),
  };
}

/**
 * Creates a new ImageData with the given dimensions.
 * @param width - Width in pixels
 * @param height - Height in pixels
 * @returns A new ImageData instance
 */
export function createImageData(width: number, height: number): ImageData {
  const data = new Uint8ClampedArray(width * height * 4);
  return new ImageData(data, width, height);
}

/**
 * Wraps an ImageData's underlying buffer as a Uint32Array for fast 4-byte-at-a-time iteration.
 * @param imageData - The ImageData to wrap
 * @returns A Uint32Array view of the pixel data
 */
export function imageDataToUint32(imageData: ImageData): Uint32Array {
  return new Uint32Array(imageData.data.buffer);
}

/**
 * Extracts RGB from a packed 32-bit ABGR value (little-endian).
 * @param pixel - The 32-bit packed pixel value
 * @returns The extracted RGB color
 */
export function uint32ToRGB(pixel: number): RGB {
  return {
    r: pixel & 0xff,
    g: (pixel >> 8) & 0xff,
    b: (pixel >> 16) & 0xff,
  };
}

/**
 * Packs RGB + alpha into a 32-bit ABGR value (little-endian).
 * @param color - The RGB color to pack
 * @param alpha - Alpha value 0–255 (default 255)
 * @returns The packed 32-bit pixel value
 */
export function rgbToUint32(color: RGB, alpha: number = 255): number {
  return (alpha << 24) | (color.b << 16) | (color.g << 8) | color.r;
}
