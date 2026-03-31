export { floydSteinberg } from './floyd-steinberg.js';
export { bayerDither, generateBayerMatrix } from './bayer.js';
export { atkinsonDither } from './atkinson.js';
export { orderedDither } from './ordered-dither.js';
export { applyPS1Dither, PS1_DITHER_MATRIX } from './ps1.js';
export {
  matrices,
  generateBayerMatrix as generateBayerThresholdMatrix,
  generateClusteredDotMatrix,
  generateHorizontalLineMatrix,
  generateVerticalLineMatrix,
  generateDiagonalLineMatrix,
  generateCheckerboardMatrix,
  generateBlueNoiseMatrix,
} from './matrices/index.js';
