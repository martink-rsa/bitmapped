import type { RGB, Palette, DistanceAlgorithm } from '../core/types.js';
import { getDistanceFunction } from '../color/distance.js';
import { createImageData } from '../core/buffer.js';

/**
 * TMS9918A per-row-in-tile constraint solver.
 *
 * Used by ColecoVision, MSX1, SG-1000, and Thomson MO5. Within each 8x8 tile,
 * EACH 8x1 pixel row independently selects a foreground and background color
 * from the palette. More flexible than ZX Spectrum (per 8x8 cell) but still
 * heavily constrained.
 *
 * Algorithm: For each tile, for each of the 8 rows:
 *  1. Try all C(paletteSize, 2) color pairs
 *  2. Select the pair with lowest total error for that row
 *  3. Assign each pixel to the closer of the two colors
 *
 * @param imageData - Source image data
 * @param palette - Available palette colors
 * @param tileWidth - Tile width in pixels (typically 8)
 * @param tileHeight - Tile height in pixels (typically 8)
 * @param distanceAlgorithm - Color distance algorithm (default: 'redmean')
 * @returns New ImageData with per-row-in-tile constraint applied
 */
export function solvePerRowInTile(
  imageData: ImageData,
  palette: Palette,
  tileWidth: number,
  tileHeight: number,
  distanceAlgorithm?: DistanceAlgorithm,
): ImageData {
  const { width, height, data: srcData } = imageData;
  const output = createImageData(width, height);
  const outData = output.data;
  const distFn = getDistanceFunction(distanceAlgorithm ?? 'redmean');
  const paletteSize = palette.length;

  // Copy alpha = 255 for all pixels
  for (let i = 3; i < outData.length; i += 4) {
    outData[i] = 255;
  }

  const tilesX = Math.ceil(width / tileWidth);
  const tilesY = Math.ceil(height / tileHeight);

  for (let ty = 0; ty < tilesY; ty++) {
    for (let tx = 0; tx < tilesX; tx++) {
      const tileStartX = tx * tileWidth;
      const tileStartY = ty * tileHeight;

      // Process each row within this tile independently
      for (let row = 0; row < tileHeight; row++) {
        const py = tileStartY + row;
        if (py >= height) break;

        // Collect pixels in this row of the tile
        const rowPixels: RGB[] = [];
        const rowWidth = Math.min(tileWidth, width - tileStartX);

        for (let col = 0; col < rowWidth; col++) {
          const px = tileStartX + col;
          const idx = (py * width + px) * 4;
          rowPixels.push({
            r: srcData[idx]!,
            g: srcData[idx + 1]!,
            b: srcData[idx + 2]!,
          });
        }

        // Handle edge case: only 1 palette color
        if (paletteSize === 1) {
          const c = palette[0]!.color;
          for (let col = 0; col < rowWidth; col++) {
            const px = tileStartX + col;
            const idx = (py * width + px) * 4;
            outData[idx] = c.r;
            outData[idx + 1] = c.g;
            outData[idx + 2] = c.b;
            outData[idx + 3] = 255;
          }
          continue;
        }

        // Try all C(paletteSize, 2) pairs plus each single color as both fg and bg
        let bestError = Infinity;
        let bestA = 0;
        let bestB = 0;

        for (let i = 0; i < paletteSize; i++) {
          for (let j = i; j < paletteSize; j++) {
            const colorA = palette[i]!.color;
            const colorB = palette[j]!.color;
            let totalError = 0;

            for (let col = 0; col < rowWidth; col++) {
              const pixel = rowPixels[col]!;
              const dA = distFn(pixel, colorA);
              const dB = distFn(pixel, colorB);
              totalError += Math.min(dA, dB);
            }

            if (totalError < bestError) {
              bestError = totalError;
              bestA = i;
              bestB = j;
            }
          }
        }

        // Assign each pixel to the closer of the two best colors
        const colorA = palette[bestA]!.color;
        const colorB = palette[bestB]!.color;

        for (let col = 0; col < rowWidth; col++) {
          const px = tileStartX + col;
          const pixel = rowPixels[col]!;
          const dA = distFn(pixel, colorA);
          const dB = distFn(pixel, colorB);
          const chosen = dA <= dB ? colorA : colorB;

          const idx = (py * width + px) * 4;
          outData[idx] = chosen.r;
          outData[idx + 1] = chosen.g;
          outData[idx + 2] = chosen.b;
          outData[idx + 3] = 255;
        }
      }
    }
  }

  return output;
}
