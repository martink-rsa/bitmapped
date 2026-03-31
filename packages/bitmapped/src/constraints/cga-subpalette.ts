import type { RGB, Palette, DistanceAlgorithm } from '../core/types.js';
import { getDistanceFunction } from '../color/distance.js';
import { createImageData } from '../core/buffer.js';

/**
 * CGA sub-palette lock constraint solver.
 *
 * In CGA Mode 4, only 4 colors are available (background + 3 from a fixed
 * sub-palette). This solver simply maps every pixel to the nearest color
 * in the provided sub-palette.
 *
 * This is the simplest constraint solver -- it performs the same operation
 * as a standard palette map. It exists for consistency with the constraint
 * system so that all hardware constraint types have a corresponding solver.
 *
 * @param imageData - Source image data
 * @param palette - The CGA sub-palette (typically 4 colors)
 * @param distanceAlgorithm - Color distance algorithm (default: 'redmean')
 * @returns New ImageData with all pixels mapped to the nearest palette color
 */
export function solveCGASubpalette(
  imageData: ImageData,
  palette: Palette,
  distanceAlgorithm?: DistanceAlgorithm,
): ImageData {
  const { width, height, data: srcData } = imageData;
  const output = createImageData(width, height);
  const outData = output.data;
  const distFn = getDistanceFunction(distanceAlgorithm ?? 'redmean');
  const paletteSize = palette.length;

  const pixelCount = width * height;

  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    const pixel: RGB = {
      r: srcData[offset]!,
      g: srcData[offset + 1]!,
      b: srcData[offset + 2]!,
    };

    let bestDist = Infinity;
    let bestColor: RGB = palette[0]!.color;

    for (let p = 0; p < paletteSize; p++) {
      const d = distFn(pixel, palette[p]!.color);
      if (d < bestDist) {
        bestDist = d;
        bestColor = palette[p]!.color;
      }
    }

    outData[offset] = bestColor.r;
    outData[offset + 1] = bestColor.g;
    outData[offset + 2] = bestColor.b;
    outData[offset + 3] = 255;
  }

  return output;
}
