import type { ThresholdMatrix } from '../../core/types.js';

/**
 * Recursively generates a normalized Bayer threshold matrix.
 * Size must be a power of 2 (2, 4, 8, 16, ...).
 * Returns values normalized to the 0–1 range.
 *
 * @param size - The matrix dimension (must be a power of 2, minimum 2)
 * @returns A 2D array of normalized threshold values
 */
export function generateBayerMatrix(size: number): ThresholdMatrix {
  if (size < 2 || (size & (size - 1)) !== 0) {
    throw new Error(
      `Bayer matrix size must be a power of 2 (>= 2), got ${size}`,
    );
  }

  const raw = generateRawBayerMatrix(size);
  const area = size * size;
  return raw.map((row) => row.map((v) => (v + 0.5) / area));
}

function generateRawBayerMatrix(size: number): number[][] {
  if (size === 2) {
    return [
      [0, 2],
      [3, 1],
    ];
  }

  const half = size / 2;
  const sub = generateRawBayerMatrix(half);
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
