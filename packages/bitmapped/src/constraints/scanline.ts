import type { RGB, Palette, DistanceAlgorithm } from '../core/types.js';
import { getDistanceFunction } from '../color/distance.js';
import { createImageData } from '../core/buffer.js';

/**
 * Atari 2600 per-scanline constraint solver.
 *
 * Limits each horizontal scanline to at most N colors from the palette.
 * Colors are selected using frequency-weighted scoring to minimize overall error.
 *
 * Algorithm: For each scanline row:
 *  1. Collect all pixel colors in that row
 *  2. Find the best N colors from the palette (using frequency-weighted selection)
 *  3. Map each pixel to the nearest of those N colors
 *
 * @param imageData - Source image data
 * @param palette - Available palette colors
 * @param maxColorsPerLine - Maximum number of palette colors allowed per scanline
 * @param distanceAlgorithm - Color distance algorithm (default: 'redmean')
 * @returns New ImageData with per-scanline constraint applied
 */
export function solveScanline(
  imageData: ImageData,
  palette: Palette,
  maxColorsPerLine: number,
  distanceAlgorithm?: DistanceAlgorithm,
): ImageData {
  const { width, height, data: srcData } = imageData;
  const output = createImageData(width, height);
  const outData = output.data;
  const distFn = getDistanceFunction(distanceAlgorithm ?? 'redmean');
  const paletteSize = palette.length;

  // If the palette is already within the limit, just map directly
  if (paletteSize <= maxColorsPerLine) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const pixel: RGB = {
          r: srcData[idx]!,
          g: srcData[idx + 1]!,
          b: srcData[idx + 2]!,
        };

        let bestDist = Infinity;
        let bestColor = palette[0]!.color;
        for (let p = 0; p < paletteSize; p++) {
          const d = distFn(pixel, palette[p]!.color);
          if (d < bestDist) {
            bestDist = d;
            bestColor = palette[p]!.color;
          }
        }

        outData[idx] = bestColor.r;
        outData[idx + 1] = bestColor.g;
        outData[idx + 2] = bestColor.b;
        outData[idx + 3] = 255;
      }
    }
    return output;
  }

  for (let y = 0; y < height; y++) {
    // Collect pixels for this scanline
    const rowPixels: RGB[] = [];
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      rowPixels.push({
        r: srcData[idx]!,
        g: srcData[idx + 1]!,
        b: srcData[idx + 2]!,
      });
    }

    // For each palette color, compute a frequency-weighted relevance score.
    // Score = sum over all pixels of (1 / (1 + distance)), weighted so that
    // colors that are the nearest match for many pixels rank highest.
    const scores: number[] = new Array(paletteSize).fill(0);

    // First pass: find the nearest palette color for each pixel and tally scores
    for (let x = 0; x < width; x++) {
      const pixel = rowPixels[x]!;
      let bestIdx = 0;
      let bestDist = Infinity;

      for (let p = 0; p < paletteSize; p++) {
        const d = distFn(pixel, palette[p]!.color);
        if (d < bestDist) {
          bestDist = d;
          bestIdx = p;
        }
      }

      scores[bestIdx] = (scores[bestIdx] ?? 0) + 1; // frequency count for nearest color
    }

    // Select the top N palette colors by frequency
    const rankedIndices = Array.from({ length: paletteSize }, (_, i) => i);
    rankedIndices.sort((a, b) => scores[b]! - scores[a]!);
    const selectedIndices = rankedIndices.slice(0, maxColorsPerLine);

    // Build the sub-palette for this scanline
    const subPalette: RGB[] = selectedIndices.map((i) => palette[i]!.color);

    // Map each pixel to the nearest color in the sub-palette
    for (let x = 0; x < width; x++) {
      const pixel = rowPixels[x]!;
      let bestDist = Infinity;
      let bestColor = subPalette[0]!;

      for (let s = 0; s < subPalette.length; s++) {
        const d = distFn(pixel, subPalette[s]!);
        if (d < bestDist) {
          bestDist = d;
          bestColor = subPalette[s]!;
        }
      }

      const idx = (y * width + x) * 4;
      outData[idx] = bestColor.r;
      outData[idx + 1] = bestColor.g;
      outData[idx + 2] = bestColor.b;
      outData[idx + 3] = 255;
    }
  }

  return output;
}
