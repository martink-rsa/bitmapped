import type {
  ThresholdMatrix,
  OrderedDitherPattern,
} from '../../core/types.js';
import { generateBayerMatrix } from './bayer.js';
import { generateClusteredDotMatrix } from './clustered-dot.js';
import {
  generateHorizontalLineMatrix,
  generateVerticalLineMatrix,
  generateDiagonalLineMatrix,
} from './line.js';
import { generateCheckerboardMatrix } from './checkerboard.js';
import { generateBlueNoiseMatrix } from './blue-noise.js';

export {
  generateBayerMatrix,
  generateClusteredDotMatrix,
  generateHorizontalLineMatrix,
  generateVerticalLineMatrix,
  generateDiagonalLineMatrix,
  generateCheckerboardMatrix,
  generateBlueNoiseMatrix,
};

/** Factory object for generating built-in matrices by name */
export const matrices: Record<
  OrderedDitherPattern,
  (size?: number) => ThresholdMatrix
> = {
  bayer: (size = 8) => generateBayerMatrix(size),
  'clustered-dot': (size = 8) => generateClusteredDotMatrix(size),
  'horizontal-line': (size = 8) => generateHorizontalLineMatrix(size),
  'vertical-line': (size = 8) => generateVerticalLineMatrix(size),
  'diagonal-line': (size = 8) => generateDiagonalLineMatrix(size),
  checkerboard: () => generateCheckerboardMatrix(),
  'blue-noise': (size = 64) => generateBlueNoiseMatrix(size),
};
