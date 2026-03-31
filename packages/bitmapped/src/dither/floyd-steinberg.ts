import type { RGB } from '../core/types.js';
import { createImageData } from '../core/buffer.js';

/**
 * Applies Floyd-Steinberg error-diffusion dithering to an ImageData.
 *
 * For each pixel left-to-right, top-to-bottom: finds the nearest palette color
 * via the provided matchColor function, computes the error, and distributes it
 * to neighboring pixels:
 * - right: 7/16
 * - bottom-left: 3/16
 * - bottom: 5/16
 * - bottom-right: 1/16
 *
 * Does NOT modify the input ImageData.
 *
 * @param imageData - The source ImageData
 * @param matchColor - A function that maps an RGB color to the nearest palette color
 * @returns A new ImageData with dithered colors
 */
export function floydSteinberg(
  imageData: ImageData,
  matchColor: (color: RGB) => RGB,
): ImageData {
  const { width, height } = imageData;
  const output = createImageData(width, height);

  // Work on float arrays for error accumulation
  const pixels = new Float32Array(width * height * 3);
  for (let i = 0; i < width * height; i++) {
    pixels[i * 3] = imageData.data[i * 4]!;
    pixels[i * 3 + 1] = imageData.data[i * 4 + 1]!;
    pixels[i * 3 + 2] = imageData.data[i * 4 + 2]!;
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const fi = idx * 3;

      // Current color (clamped to valid range)
      const oldR = Math.max(0, Math.min(255, pixels[fi]!));
      const oldG = Math.max(0, Math.min(255, pixels[fi + 1]!));
      const oldB = Math.max(0, Math.min(255, pixels[fi + 2]!));

      const matched = matchColor({
        r: Math.round(oldR),
        g: Math.round(oldG),
        b: Math.round(oldB),
      });

      // Write matched color to output
      const oi = idx * 4;
      output.data[oi] = matched.r;
      output.data[oi + 1] = matched.g;
      output.data[oi + 2] = matched.b;
      output.data[oi + 3] = 255;

      // Compute error
      const errR = oldR - matched.r;
      const errG = oldG - matched.g;
      const errB = oldB - matched.b;

      // Distribute error to neighbors (indices are always in bounds due to guard checks)
      // Right: 7/16
      if (x + 1 < width) {
        const ni = fi + 3;
        pixels[ni] = pixels[ni]! + errR * (7 / 16);
        pixels[ni + 1] = pixels[ni + 1]! + errG * (7 / 16);
        pixels[ni + 2] = pixels[ni + 2]! + errB * (7 / 16);
      }

      // Bottom-left: 3/16
      if (x - 1 >= 0 && y + 1 < height) {
        const ni = ((y + 1) * width + (x - 1)) * 3;
        pixels[ni] = pixels[ni]! + errR * (3 / 16);
        pixels[ni + 1] = pixels[ni + 1]! + errG * (3 / 16);
        pixels[ni + 2] = pixels[ni + 2]! + errB * (3 / 16);
      }

      // Bottom: 5/16
      if (y + 1 < height) {
        const ni = ((y + 1) * width + x) * 3;
        pixels[ni] = pixels[ni]! + errR * (5 / 16);
        pixels[ni + 1] = pixels[ni + 1]! + errG * (5 / 16);
        pixels[ni + 2] = pixels[ni + 2]! + errB * (5 / 16);
      }

      // Bottom-right: 1/16
      if (x + 1 < width && y + 1 < height) {
        const ni = ((y + 1) * width + (x + 1)) * 3;
        pixels[ni] = pixels[ni]! + errR * (1 / 16);
        pixels[ni + 1] = pixels[ni + 1]! + errG * (1 / 16);
        pixels[ni + 2] = pixels[ni + 2]! + errB * (1 / 16);
      }
    }
  }

  return output;
}
