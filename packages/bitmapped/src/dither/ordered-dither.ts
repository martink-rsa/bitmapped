import type {
  RGB,
  Palette,
  ThresholdMatrix,
  DistanceAlgorithm,
} from '../core/types.js';
import {
  createImageData,
  imageDataToUint32,
  rgbToUint32,
} from '../core/buffer.js';
import { createPaletteMatcher } from '../color/match.js';

/**
 * Applies ordered dithering to an ImageData using a pre-built matchColor
 * function and a normalized threshold matrix.
 *
 * This is the low-level engine used by both the public `orderedDither()` API
 * and the backward-compatible `bayerDither()` wrapper.
 *
 * @param imageData - The source ImageData
 * @param matchColor - A function that maps an RGB color to the nearest palette color
 * @param matrix - A 2D array of normalized threshold values (0–1)
 * @param strength - Dither intensity: 0 = none, 1 = full (default: 1)
 * @returns A new ImageData with dithered colors
 */
export function applyOrderedDither(
  imageData: ImageData,
  matchColor: (color: RGB) => RGB,
  matrix: ThresholdMatrix,
  strength: number = 1.0,
): ImageData {
  if (matrix.length === 0 || matrix[0]!.length === 0) {
    throw new Error('Threshold matrix must not be empty');
  }

  const { width, height } = imageData;
  const output = createImageData(width, height);
  const outU32 = imageDataToUint32(output);
  const matrixH = matrix.length;
  const matrixW = matrix[0]!.length;
  const spread = 64 * strength;
  const src = imageData.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const si = (y * width + x) * 4;

      // Get threshold normalized to [-0.5, 0.5] and scale by spread
      const bias = (matrix[y % matrixH]![x % matrixW]! - 0.5) * spread;

      const r = Math.max(0, Math.min(255, Math.round(src[si]! + bias)));
      const g = Math.max(0, Math.min(255, Math.round(src[si + 1]! + bias)));
      const b = Math.max(0, Math.min(255, Math.round(src[si + 2]! + bias)));

      const matched = matchColor({ r, g, b });
      outU32[y * width + x] = rgbToUint32(matched);
    }
  }

  return output;
}

/**
 * Applies ordered dithering to an ImageData using any threshold matrix.
 *
 * Accepts a palette and optional distance algorithm to perform color matching
 * internally. The strength parameter controls dither intensity: at 0 the
 * output is equivalent to direct palette matching (no dither), at 1 the
 * full threshold pattern is applied.
 *
 * Does NOT modify the input ImageData.
 *
 * @param imageData - The source ImageData
 * @param palette - The target color palette
 * @param matrix - A 2D array of normalized threshold values (0–1)
 * @param options - Optional distance algorithm and strength
 * @returns A new ImageData with dithered colors
 */
export function orderedDither(
  imageData: ImageData,
  palette: Palette,
  matrix: ThresholdMatrix,
  options?: {
    distanceAlgorithm?: DistanceAlgorithm;
    strength?: number;
  },
): ImageData {
  const { distanceAlgorithm = 'redmean', strength = 1.0 } = options ?? {};
  const matcher = createPaletteMatcher(palette, distanceAlgorithm);
  const matchColor = (color: RGB): RGB => matcher(color).color;
  return applyOrderedDither(imageData, matchColor, matrix, strength);
}
