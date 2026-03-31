import type { ThresholdMatrix } from '../../core/types.js';

/**
 * Generates a 2×2 checkerboard threshold matrix.
 * Only two threshold levels, producing the classic alternating pattern.
 *
 * @returns A 2×2 normalized threshold matrix
 */
export function generateCheckerboardMatrix(): ThresholdMatrix {
  return [
    [0.25, 0.75],
    [0.75, 0.25],
  ];
}
