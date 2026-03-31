import type { RGB } from '../core/types.js';

/** A distance function that computes perceptual distance between two colors */
export type DistanceFn = (a: RGB, b: RGB) => number;

/** Configuration for attribute-block constraint solving */
export interface AttributeBlockConfig {
  /** Block width in pixels */
  width: number;
  /** Block height in pixels */
  height: number;
  /** Maximum colors allowed per block */
  maxColors: number;
  /** Whether bright and non-bright colors cannot mix in the same block (ZX Spectrum) */
  brightLocked?: boolean;
  /** Index of a globally-shared background color slot (C64 multicolor) */
  globalBackground?: number;
}

/** Configuration for tile-palette constraint solving */
export interface TilePaletteConfig {
  /** Tile width in pixels */
  tileWidth: number;
  /** Tile height in pixels */
  tileHeight: number;
  /** Number of subpalettes available (reserved; not yet used by solver) */
  subpaletteCount?: number;
  /** Colors per subpalette */
  colorsPerSubpalette: number;
  /** Whether first color in each subpalette is shared/transparent */
  sharedTransparent: boolean;
}

/** Configuration for HAM (Hold-And-Modify) constraint solving */
export interface HAMConfig {
  /** Number of base palette colors */
  basePaletteSize: number;
  /** Number of bits for channel modification */
  modifyBits: number;
}

/** Result from a constraint solver — the constrained image data */
export interface ConstraintResult {
  imageData: ImageData;
  /** Optional grid representation */
  grid?: RGB[][];
}
