/** An RGB color with channels 0–255 */
export interface RGB {
  r: number;
  g: number;
  b: number;
}

/** An RGBA color with channels 0–255 and alpha 0–1 */
export interface RGBA extends RGB {
  a: number;
}

/** A color in the Oklab perceptual color space */
export interface OklabColor {
  L: number;
  a: number;
  b: number;
}

/** A color in the CIE L*a*b* color space */
export interface LabColor {
  L: number;
  a: number;
  b: number;
}

/** A named palette color with optional label */
export interface PaletteColor {
  color: RGB;
  name?: string;
}

/** A user palette is an array of PaletteColors */
export type Palette = PaletteColor[];

/** A 2D grid of RGB values representing pixelated blocks */
export type PixelGrid = RGB[][];

/** Result of pixelation containing the grid and flat color list */
export interface PixelateResult {
  grid: PixelGrid;
  colors: RGB[];
  width: number;
  height: number;
  blockSize: number;
}

/** Supported color distance algorithms */
export type DistanceAlgorithm =
  | 'euclidean'
  | 'redmean'
  | 'cie76'
  | 'ciede2000'
  | 'oklab';

/** A threshold matrix is a 2D array of normalized values in the 0–1 range */
export type ThresholdMatrix = number[][];

/** Names of all built-in ordered dither patterns */
export type OrderedDitherPattern =
  | 'bayer'
  | 'clustered-dot'
  | 'horizontal-line'
  | 'vertical-line'
  | 'diagonal-line'
  | 'checkerboard'
  | 'blue-noise';

/** Supported dithering algorithms */
export type DitheringAlgorithm =
  | 'none'
  | 'floyd-steinberg'
  | 'bayer'
  | 'atkinson'
  | 'clustered-dot'
  | 'horizontal-line'
  | 'vertical-line'
  | 'diagonal-line'
  | 'checkerboard'
  | 'blue-noise'
  | 'ps1-ordered'
  | 'custom';

/**
 * CSS filter options applied to an image before pixelation.
 * All values are at their "no effect" defaults when omitted.
 */
export interface FilterOptions {
  /** Brightness multiplier. 0 = black, 1 = unchanged, 2 = double. Default: 1 */
  brightness?: number;
  /** Contrast multiplier. 0 = flat gray, 1 = unchanged, 2 = high. Default: 1 */
  contrast?: number;
  /** Grayscale amount. 0 = full color, 1 = fully gray. Default: 0 */
  grayscale?: number;
  /** Sepia amount. 0 = no effect, 1 = full warm tone. Default: 0 */
  sepia?: number;
  /** Invert amount. 0 = normal, 1 = fully inverted. Default: 0 */
  invert?: number;
  /** Saturation multiplier. 0 = desaturated, 1 = unchanged, 3 = vivid. Default: 1 */
  saturate?: number;
  /** Hue rotation in degrees. 0–360. Default: 0 */
  hueRotate?: number;
  /** Gaussian blur radius in pixels. 0 = no blur. Default: 0 */
  blur?: number;
}

/** Full pipeline options */
export interface ProcessOptions {
  blockSize: number;
  palette: Palette;
  dithering?: DitheringAlgorithm;
  /** Custom threshold matrix; required when dithering is 'custom' */
  ditherMatrix?: ThresholdMatrix;
  /** Dither intensity for ordered patterns: 0 = none, 1 = full. Default: 1 */
  ditherStrength?: number;
  /** Matrix size for built-in ordered patterns. Default: 8 (2 for checkerboard, 64 for blue-noise) */
  ditherMatrixSize?: number;
  distanceAlgorithm?: DistanceAlgorithm;
  targetResolution?: { width: number; height: number };
  resizeFit?: 'contain' | 'cover' | 'stretch';
  resizeMethod?: 'nearest' | 'bilinear';
  /** CSS filters to apply to the source image before pixelation. */
  filters?: FilterOptions;
  /** Hardware constraint to apply (e.g. 'ham' for Amiga HAM mode) */
  constraintType?: ConstraintType;
  /** HAM configuration; required when constraintType is 'ham' */
  hamConfig?: { basePaletteSize: number; modifyBits: number };
  /** Attribute block config; required when constraintType is 'attribute-block' */
  attributeBlockConfig?: {
    width: number;
    height: number;
    maxColors: number;
    brightLocked?: boolean;
    globalBackground?: number;
  };
  /** Tile palette config; required when constraintType is 'per-tile-palette' */
  tilePaletteConfig?: {
    tileWidth: number;
    tileHeight: number;
    subpaletteCount?: number;
    colorsPerSubpalette: number;
    sharedTransparent: boolean;
  };
  /** Per-row-in-tile config; required when constraintType is 'per-row-in-tile' */
  perRowInTileConfig?: {
    tileWidth: number;
    tileHeight: number;
  };
  /** Scanline config; required when constraintType is 'per-scanline' */
  scanlineConfig?: { maxColorsPerLine: number };
  /** Apple II artifact config; required when constraintType is 'artifact-color' */
  artifactConfig?: {
    pixelsPerGroup: number;
    paletteSets: readonly (readonly string[])[];
  };
}

/** Result of the full pipeline */
export interface ProcessResult {
  imageData: ImageData;
  grid: PixelGrid;
  width: number;
  height: number;
  effectiveResolution?: { width: number; height: number };
}

/** Pixel aspect ratio — width:height of a single pixel */
export interface PixelAspectRatio {
  x: number;
  y: number;
}

/** Display technology type */
export type DisplayType =
  | 'crt-rf'
  | 'crt-composite'
  | 'crt-svideo'
  | 'crt-rgb'
  | 'lcd-stn'
  | 'lcd-tft'
  | 'lcd-backlit';

/** Display effect configuration */
export interface DisplayEffects {
  scanlines?: {
    enabled: boolean;
    intensity: number;
    gap: number;
  };
  crtBloom?: {
    enabled: boolean;
    radius: number;
    intensity: number;
  };
  compositeDither?: {
    enabled: boolean;
    blendRadius: number;
  };
  lcdGhosting?: {
    enabled: boolean;
    opacity: number;
  };
  lcdGrid?: {
    enabled: boolean;
    gridOpacity: number;
    gridColor: RGB;
  };
  colorFringe?: {
    enabled: boolean;
    type: 'ntsc' | 'pal';
  };
}

/** Color space bit-depth descriptor for programmable palettes */
export interface ColorBitDepth {
  type: 'fixed' | 'programmable';
  bitsPerChannel: number;
  totalBits: number;
  format: string;
  maxSimultaneous: number;
  quantize?: (r: number, g: number, b: number) => RGB;
}

/** Palette classification for hardware systems */
export type PaletteType =
  | 'fixed-lut'
  | 'rgb-bitdepth'
  | 'composite-artifact'
  | 'monochrome-shades'
  | 'three-level';

/** Hardware constraint type governing color selection rules */
export type ConstraintType =
  | 'attribute-block'
  | 'per-tile-palette'
  | 'per-scanline'
  | 'ham'
  | 'artifact-color'
  | 'sub-palette-lock'
  | 'per-row-in-tile'
  | 'none'
  | 'monochrome-global';

/** Full hardware preset definition */
export interface HardwarePreset {
  id: string;
  name: string;
  category:
    | 'computer'
    | 'nintendo'
    | 'sega'
    | 'other'
    | 'arcade'
    | 'ibm-pc'
    | 'fantasy';
  system: string;
  region?: 'ntsc' | 'pal' | 'both';
  palette?: Palette;
  colorSpace?: ColorBitDepth;
  resolution: {
    width: number;
    height: number;
    alternativeModes?: Array<{ width: number; height: number; label: string }>;
  };
  par: PixelAspectRatio;
  display: {
    type: DisplayType;
    defaultEffects: DisplayEffects;
  };
  notes?: string;

  // --- Hardware profile fields (Section 4 of INITIAL_SETUP_2) ---

  paletteType?: PaletteType;
  masterPalette?: readonly string[];
  totalColors?: number;
  simultaneousColors?: number;
  bitsPerChannel?: {
    readonly r: number;
    readonly g: number;
    readonly b: number;
  };

  paletteLayout?: {
    readonly subpaletteCount: number;
    readonly colorsPerSubpalette: number;
    readonly sharedTransparent: boolean;
    readonly sharedBackdrop?: boolean;
  };

  constraintType?: ConstraintType;

  attributeBlock?: {
    readonly width: number;
    readonly height: number;
    readonly maxColors: number;
    readonly brightLocked?: boolean;
    readonly globalBackground?: number;
  };

  tileSize?: { readonly width: number; readonly height: number };

  hamConfig?: {
    readonly basePaletteSize: number;
    readonly modifyBits: number;
  };

  artifactConfig?: {
    readonly pixelsPerGroup: number;
    readonly paletteSets: readonly (readonly string[])[];
  };

  scanlineLimits?: {
    readonly maxColors?: number;
    readonly maxSprites?: number;
  };

  displayCharacteristics?: {
    readonly crtScanlines?: boolean;
    readonly compositeBlending?: boolean;
    readonly colorTint?: {
      readonly r: number;
      readonly g: number;
      readonly b: number;
    };
    readonly orderedDither?: boolean;
    readonly doubleWidePixels?: boolean;
    readonly nonlinearDAC?: boolean;
  };

  recommendedDithering?: DitheringAlgorithm;
  recommendedDistance?: DistanceAlgorithm;
  paletteVariant?: string;
}
