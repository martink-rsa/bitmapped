// Core types and functions
export type {
  RGB,
  RGBA,
  OklabColor,
  LabColor,
  PaletteColor,
  Palette,
  PixelGrid,
  PixelateResult,
  DistanceAlgorithm,
  DitheringAlgorithm,
  ThresholdMatrix,
  OrderedDitherPattern,
  ProcessOptions,
  ProcessResult,
  FilterOptions,
  PixelAspectRatio,
  DisplayType,
  DisplayEffects,
  ColorBitDepth,
  HardwarePreset,
  PaletteType,
  ConstraintType,
} from './core/types.js';

export {
  getPixelRGB,
  setPixelRGB,
  calculateAverageColor,
  createImageData,
  imageDataToUint32,
  uint32ToRGB,
  rgbToUint32,
} from './core/buffer.js';

export {
  pixelateBlockAverage,
  pixelateResample,
  pixelateDownscale,
  renderPixelateResult,
} from './core/pixelate.js';

export { process } from './core/pipeline.js';

export { resizeImageData, fitToResolution } from './core/resize.js';

// Color distance and matching
export {
  euclideanDistance,
  redmeanDistance,
  cie76Distance,
  ciede2000Distance,
  oklabDistance,
  getDistanceFunction,
  rgbToLab,
  rgbToOklab,
} from './color/distance.js';

export {
  createPaletteMatcher,
  findNearestColor,
  findNearestColors,
  mapImageToPalette,
} from './color/match.js';

// Palette parsers
export { parseGPL } from './palette/parse-gpl.js';
export { parseHex } from './palette/parse-hex.js';
export { parseASE } from './palette/parse-ase.js';
export { extractPalette } from './palette/extract.js';

// Color quantization
export {
  quantizeBits,
  quantizeGenesis,
  quantizeCPC,
  expandVGA6to8,
  GENESIS_DAC_NORMAL,
  GENESIS_DAC_SHADOW,
  GENESIS_DAC_HIGHLIGHT,
  LEVELS,
} from './color/quantize.js';

// Dithering
export { floydSteinberg } from './dither/floyd-steinberg.js';
export { bayerDither, generateBayerMatrix } from './dither/bayer.js';
export { atkinsonDither } from './dither/atkinson.js';
export { orderedDither } from './dither/ordered-dither.js';
export { applyPS1Dither, PS1_DITHER_MATRIX } from './dither/ps1.js';
export { matrices } from './dither/matrices/index.js';

// Export
export { toPNGBlob, downloadPNG, imageDataToBlob } from './export/png.js';
export { toJPEGBlob, downloadJPEG } from './export/jpeg.js';
export { toWebPBlob, downloadWebP } from './export/webp.js';
export { imageDataToSVG, toSVGBlob, downloadSVG } from './export/svg.js';

// Presets (registry functions only — import individual presets from 'bitmapped/presets')
export {
  getPreset,
  listPresets,
  listPresetsByCategory,
} from './presets/registry.js';

// Constraints
export {
  solveAttributeClash,
  solveTilePalette,
  solvePerRowInTile,
  solveScanline,
  solveHAM,
  solveApple2Artifact,
  solveCGASubpalette,
  decodeNeoGeoColor,
  encodeNeoGeoColor,
} from './constraints/index.js';

export type {
  AttributeBlockConfig,
  TilePaletteConfig,
  HAMConfig,
  ConstraintResult,
} from './constraints/types.js';

// Pre-processing filters
export {
  applyFilters,
  buildFilterString,
  hasActiveFilters,
  FILTER_DEFAULTS,
} from './preprocess/index.js';
