import type { RGB } from '../core/types.js';
import { createImageData } from '../core/buffer.js';

/**
 * Applies Atkinson error-diffusion dithering to an ImageData.
 *
 * Similar to Floyd-Steinberg but distributes only 75% of the error
 * (each of six neighbors gets 1/8). The remaining 25% error is lost,
 * which produces higher contrast results with a distinctive retro feel.
 *
 * Error distribution pattern:
 * - (x+1, y):   1/8
 * - (x+2, y):   1/8
 * - (x-1, y+1): 1/8
 * - (x, y+1):   1/8
 * - (x+1, y+1): 1/8
 * - (x, y+2):   1/8
 *
 * Does NOT modify the input ImageData.
 *
 * @param imageData - The source ImageData
 * @param matchColor - A function that maps an RGB color to the nearest palette color
 * @returns A new ImageData with dithered colors
 */
export function atkinsonDither(
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

      // Current color (clamped)
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
      const errR = (oldR - matched.r) / 8;
      const errG = (oldG - matched.g) / 8;
      const errB = (oldB - matched.b) / 8;

      // Distribute 1/8 of the error to each of 6 neighbors
      const neighbors: [number, number][] = [
        [x + 1, y], // right
        [x + 2, y], // right+1
        [x - 1, y + 1], // bottom-left
        [x, y + 1], // bottom
        [x + 1, y + 1], // bottom-right
        [x, y + 2], // bottom+1 row
      ];

      for (const [nx, ny] of neighbors) {
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const ni = (ny * width + nx) * 3;
          pixels[ni] = pixels[ni]! + errR;
          pixels[ni + 1] = pixels[ni + 1]! + errG;
          pixels[ni + 2] = pixels[ni + 2]! + errB;
        }
      }
    }
  }

  return output;
}
