import type { ThresholdMatrix } from '../../core/types.js';

/**
 * Builds an ordering that fills from the center outward.
 * Returns an array of indices ordered so the center index is first.
 */
function centerOutwardOrder(size: number): number[] {
  const center = (size - 1) / 2;
  const indices = Array.from({ length: size }, (_, i) => i);
  indices.sort((a, b) => Math.abs(a - center) - Math.abs(b - center));
  return indices;
}

/**
 * Generates a horizontal-line threshold matrix.
 * Thresholds are arranged so pixels activate in horizontal rows,
 * filling from the center outward. Produces a scanline/CRT aesthetic.
 *
 * @param size - The matrix dimension (number of distinct threshold levels)
 * @returns A 2D array of normalized threshold values in the 0–1 range
 */
export function generateHorizontalLineMatrix(size: number): ThresholdMatrix {
  if (size < 2) {
    throw new Error(`Horizontal-line matrix size must be >= 2, got ${size}`);
  }

  const order = centerOutwardOrder(size);
  // Assign ranks: the row that appears earliest in the order gets the lowest threshold
  const thresholds = new Array<number>(size);
  for (let rank = 0; rank < order.length; rank++) {
    thresholds[order[rank]!] = (rank + 0.5) / size;
  }

  const matrix: ThresholdMatrix = [];
  for (let y = 0; y < size; y++) {
    matrix[y] = new Array<number>(size).fill(thresholds[y]!);
  }

  return matrix;
}

/**
 * Generates a vertical-line threshold matrix.
 * Thresholds are arranged so pixels activate in vertical columns,
 * filling from the center outward.
 *
 * @param size - The matrix dimension (number of distinct threshold levels)
 * @returns A 2D array of normalized threshold values in the 0–1 range
 */
export function generateVerticalLineMatrix(size: number): ThresholdMatrix {
  if (size < 2) {
    throw new Error(`Vertical-line matrix size must be >= 2, got ${size}`);
  }

  const order = centerOutwardOrder(size);
  const thresholds = new Array<number>(size);
  for (let rank = 0; rank < order.length; rank++) {
    thresholds[order[rank]!] = (rank + 0.5) / size;
  }

  const matrix: ThresholdMatrix = [];
  for (let y = 0; y < size; y++) {
    matrix[y] = [];
    for (let x = 0; x < size; x++) {
      matrix[y]![x] = thresholds[x]!;
    }
  }

  return matrix;
}

/**
 * Generates a diagonal-line threshold matrix.
 * Thresholds are arranged along 45° diagonal lines, producing a
 * hatching/rain effect. Pixels along the same diagonal share thresholds.
 *
 * @param size - The matrix dimension
 * @returns A 2D array of normalized threshold values in the 0–1 range
 */
export function generateDiagonalLineMatrix(size: number): ThresholdMatrix {
  if (size < 2) {
    throw new Error(`Diagonal-line matrix size must be >= 2, got ${size}`);
  }

  const order = centerOutwardOrder(size);
  const thresholds = new Array<number>(size);
  for (let rank = 0; rank < order.length; rank++) {
    thresholds[order[rank]!] = (rank + 0.5) / size;
  }

  const matrix: ThresholdMatrix = [];
  for (let y = 0; y < size; y++) {
    matrix[y] = [];
    for (let x = 0; x < size; x++) {
      matrix[y]![x] = thresholds[(x + y) % size]!;
    }
  }

  return matrix;
}
