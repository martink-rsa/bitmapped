import type { ThresholdMatrix } from '../../core/types.js';

/**
 * The standard 4×4 clustered-dot (halftone) threshold ordering.
 * Pixels activate from center outward, producing circular dot patterns.
 */
const BASE_4X4 = [
  [12, 5, 6, 13],
  [4, 0, 1, 7],
  [11, 3, 2, 8],
  [15, 10, 9, 14],
];

/**
 * Generates a clustered-dot (halftone) threshold matrix.
 * Thresholds are arranged so pixels activate from the center of each cell
 * outward, producing a dot pattern similar to newspaper print.
 *
 * @param size - The matrix dimension (must be >= 4)
 * @returns A 2D array of normalized threshold values in the 0–1 range
 */
export function generateClusteredDotMatrix(size: number): ThresholdMatrix {
  if (size < 4) {
    throw new Error(`Clustered-dot matrix size must be >= 4, got ${size}`);
  }

  const matrix: ThresholdMatrix = [];
  for (let y = 0; y < size; y++) {
    matrix[y] = [];
    for (let x = 0; x < size; x++) {
      matrix[y]![x] = (BASE_4X4[y % 4]![x % 4]! + 0.5) / 16;
    }
  }

  return matrix;
}
