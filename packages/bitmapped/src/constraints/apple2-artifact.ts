import type { RGB, DistanceAlgorithm } from '../core/types.js';
import { getDistanceFunction } from '../color/distance.js';
import { createImageData } from '../core/buffer.js';

/**
 * Parses a hex color string (#RRGGBB or RRGGBB) into an RGB object.
 */
function hexToRgb(hex: string): RGB {
  const clean = hex.startsWith('#') ? hex.slice(1) : hex;
  if (!/^[0-9A-Fa-f]{6}$/.test(clean)) {
    throw new Error(`Invalid hex color: "${hex}"`);
  }
  return {
    r: parseInt(clean.substring(0, 2), 16),
    g: parseInt(clean.substring(2, 4), 16),
    b: parseInt(clean.substring(4, 6), 16),
  };
}

/**
 * Apple II NTSC artifact color constraint solver.
 *
 * In Apple II Hi-Res mode, each byte controls 7 pixels. The MSB (bit 7)
 * selects between two color groups:
 *  - Group 1 (MSB=0): Black, Purple, Green, White
 *  - Group 2 (MSB=1): Black, Blue, Orange, White
 *
 * Within a 7-pixel group (or pixelsPerGroup), all pixels share the same
 * color group. The solver tests both groups for each pixel group and
 * picks the one with the lowest total error.
 *
 * Algorithm: For each group of pixelsPerGroup pixels:
 *  1. Test both color groups
 *  2. For each group, map all pixels to the nearest of the group's colors
 *  3. Choose the group with lowest total error
 *
 * @param imageData - Source image data
 * @param paletteSets - Array of color groups, each an array of hex color strings
 * @param pixelsPerGroup - Number of pixels per group (typically 7)
 * @param distanceAlgorithm - Color distance algorithm (default: 'redmean')
 * @returns New ImageData with artifact color constraint applied
 */
export function solveApple2Artifact(
  imageData: ImageData,
  paletteSets: readonly (readonly string[])[],
  pixelsPerGroup: number,
  distanceAlgorithm?: DistanceAlgorithm,
): ImageData {
  const { width, height, data: srcData } = imageData;
  const output = createImageData(width, height);
  const outData = output.data;
  const distFn = getDistanceFunction(distanceAlgorithm ?? 'redmean');

  if (paletteSets.length === 0) {
    throw new Error(
      'Apple II artifact solver requires at least one palette set',
    );
  }

  // Pre-parse all palette sets from hex strings to RGB
  const parsedSets: RGB[][] = paletteSets.map((set, i) => {
    if (set.length === 0) {
      throw new Error(`Apple II artifact solver: palette set ${i} is empty`);
    }
    return set.map((hex) => hexToRgb(hex));
  });

  for (let y = 0; y < height; y++) {
    // Process pixels in groups of pixelsPerGroup across the scanline
    for (let groupStart = 0; groupStart < width; groupStart += pixelsPerGroup) {
      const groupEnd = Math.min(groupStart + pixelsPerGroup, width);
      const groupWidth = groupEnd - groupStart;

      // Collect source pixels for this group
      const groupPixels: RGB[] = [];
      for (let x = groupStart; x < groupEnd; x++) {
        const idx = (y * width + x) * 4;
        groupPixels.push({
          r: srcData[idx]!,
          g: srcData[idx + 1]!,
          b: srcData[idx + 2]!,
        });
      }

      // Test each palette set and find the one with lowest total error
      let bestTotalError = Infinity;
      let bestMappedColors: RGB[] | null = null;

      for (let s = 0; s < parsedSets.length; s++) {
        const setColors = parsedSets[s]!;
        let totalError = 0;
        const mapped: RGB[] = [];

        for (let i = 0; i < groupWidth; i++) {
          const pixel = groupPixels[i]!;
          let bestDist = Infinity;
          let bestColor = setColors[0]!;

          for (let c = 0; c < setColors.length; c++) {
            const d = distFn(pixel, setColors[c]!);
            if (d < bestDist) {
              bestDist = d;
              bestColor = setColors[c]!;
            }
          }

          totalError += bestDist;
          mapped.push(bestColor);
        }

        if (totalError < bestTotalError) {
          bestTotalError = totalError;
          bestMappedColors = mapped;
        }
      }

      // Write the best mapping to output
      if (bestMappedColors) {
        for (let i = 0; i < groupWidth; i++) {
          const x = groupStart + i;
          const idx = (y * width + x) * 4;
          const color = bestMappedColors[i]!;
          outData[idx] = color.r;
          outData[idx + 1] = color.g;
          outData[idx + 2] = color.b;
          outData[idx + 3] = 255;
        }
      }
    }
  }

  return output;
}
