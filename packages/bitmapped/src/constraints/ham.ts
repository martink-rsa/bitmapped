import type { RGB, Palette, DistanceAlgorithm } from '../core/types.js';
import type { HAMConfig } from './types.js';
import { getDistanceFunction } from '../color/distance.js';
import { createImageData } from '../core/buffer.js';

/**
 * Amiga HAM6 (Hold-And-Modify) constraint solver.
 *
 * HAM6 encodes each pixel as one of:
 *  - 00: Use base palette color (16 colors)
 *  - 01: Modify blue channel of previous pixel
 *  - 10: Modify red channel of previous pixel
 *  - 11: Modify green channel of previous pixel
 *
 * The "modify" operations replace the high bits of one channel with bits
 * from the pixel data, allowing smooth gradients at the cost of fringing
 * artifacts on sharp horizontal color transitions.
 *
 * Algorithm (per scanline, left to right):
 *  1. Start with background color (first palette entry)
 *  2. For each pixel, choose the option with minimum error:
 *     a. Direct palette color (any of the base colors)
 *     b. Modify R of previous pixel to match target
 *     c. Modify G of previous pixel to match target
 *     d. Modify B of previous pixel to match target
 *  3. Use the best option
 *
 * @param imageData - Source image data
 * @param basePalette - The base palette (typically 16 colors for HAM6)
 * @param config - HAM configuration (basePaletteSize, modifyBits)
 * @param distanceAlgorithm - Color distance algorithm (default: 'redmean')
 * @returns New ImageData with HAM constraint applied
 */
export function solveHAM(
  imageData: ImageData,
  basePalette: Palette,
  config: HAMConfig,
  distanceAlgorithm?: DistanceAlgorithm,
): ImageData {
  const { width, height, data: srcData } = imageData;
  const output = createImageData(width, height);
  const outData = output.data;
  const distFn = getDistanceFunction(distanceAlgorithm ?? 'redmean');

  // Use only up to basePaletteSize colors from the palette
  const effectivePalette = basePalette.slice(0, config.basePaletteSize);

  // modifyBits determines the quantization of the channel modification.
  // For HAM6: modifyBits = 4, so we replace the top 4 bits of a channel.
  // For HAM8: modifyBits = 6, so we replace the top 6 bits.
  const modBits = config.modifyBits;
  const modShift = 8 - modBits;
  const modMask = ((1 << modBits) - 1) << modShift;
  const keepMask = 0xff & ~modMask;

  /**
   * Quantize a channel value to the modify-bit resolution, keeping
   * the low bits from the original previous pixel value.
   */
  function modifyChannel(prevChannel: number, targetChannel: number): number {
    const highBits = targetChannel & modMask;
    const lowBits = prevChannel & keepMask;
    return highBits | lowBits;
  }

  for (let y = 0; y < height; y++) {
    // Start each scanline with the first palette color (background)
    let prev: RGB =
      effectivePalette.length > 0
        ? { ...effectivePalette[0]!.color }
        : { r: 0, g: 0, b: 0 };

    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const target: RGB = {
        r: srcData[idx]!,
        g: srcData[idx + 1]!,
        b: srcData[idx + 2]!,
      };

      let bestDist = Infinity;
      let bestColor: RGB = prev;

      // Option A: Direct palette color
      for (let p = 0; p < effectivePalette.length; p++) {
        const c = effectivePalette[p]!.color;
        const d = distFn(target, c);
        if (d < bestDist) {
          bestDist = d;
          bestColor = c;
        }
      }

      // Option B: Modify red channel of previous pixel
      const modR: RGB = {
        r: modifyChannel(prev.r, target.r),
        g: prev.g,
        b: prev.b,
      };
      const dR = distFn(target, modR);
      if (dR < bestDist) {
        bestDist = dR;
        bestColor = modR;
      }

      // Option C: Modify green channel of previous pixel
      const modG: RGB = {
        r: prev.r,
        g: modifyChannel(prev.g, target.g),
        b: prev.b,
      };
      const dG = distFn(target, modG);
      if (dG < bestDist) {
        bestDist = dG;
        bestColor = modG;
      }

      // Option D: Modify blue channel of previous pixel
      const modB: RGB = {
        r: prev.r,
        g: prev.g,
        b: modifyChannel(prev.b, target.b),
      };
      const dB = distFn(target, modB);
      if (dB < bestDist) {
        bestDist = dB;
        bestColor = modB;
      }

      // Write the chosen color
      outData[idx] = bestColor.r;
      outData[idx + 1] = bestColor.g;
      outData[idx + 2] = bestColor.b;
      outData[idx + 3] = 255;

      // Update previous pixel for next iteration
      prev = { r: bestColor.r, g: bestColor.g, b: bestColor.b };
    }
  }

  return output;
}
