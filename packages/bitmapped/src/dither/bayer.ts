import type { RGB } from '../core/types.js';
import { generateBayerMatrix as generateNormalizedBayer } from './matrices/bayer.js';
import { applyOrderedDither } from './ordered-dither.js';

/**
 * Recursively generates a Bayer threshold matrix of the given size.
 * Size must be a power of 2 (2, 4, 8, 16, ...).
 *
 * Returns integer values in the range [0, size*size - 1].
 *
 * @param size - The matrix dimension (must be a power of 2, minimum 2)
 * @returns A 2D number array representing the Bayer threshold matrix
 */
export function generateBayerMatrix(size: number): number[][] {
  if (size < 2 || (size & (size - 1)) !== 0) {
    throw new Error(
      `Bayer matrix size must be a power of 2 (>= 2), got ${size}`,
    );
  }

  if (size === 2) {
    return [
      [0, 2],
      [3, 1],
    ];
  }

  const half = size / 2;
  const sub = generateBayerMatrix(half);
  const matrix: number[][] = [];

  for (let y = 0; y < size; y++) {
    matrix[y] = [];
    for (let x = 0; x < size; x++) {
      const subVal = sub[y % half]![x % half]!;
      const quadrant = y < half ? (x < half ? 0 : 2) : x < half ? 3 : 1;
      matrix[y]![x] = 4 * subVal + quadrant;
    }
  }

  return matrix;
}

/**
 * Applies ordered (Bayer) dithering to an ImageData.
 *
 * For each pixel, adds a threshold bias from the Bayer matrix (scaled to the
 * color range), then finds the nearest palette color via the provided
 * matchColor function.
 *
 * Does NOT modify the input ImageData.
 *
 * @param imageData - The source ImageData
 * @param matchColor - A function that maps an RGB color to the nearest palette color
 * @param matrixSize - The Bayer matrix size (default: 4, must be a power of 2)
 * @returns A new ImageData with dithered colors
 */
export function bayerDither(
  imageData: ImageData,
  matchColor: (color: RGB) => RGB,
  matrixSize: number = 4,
): ImageData {
  const matrix = generateNormalizedBayer(matrixSize);
  return applyOrderedDither(imageData, matchColor, matrix);
}
