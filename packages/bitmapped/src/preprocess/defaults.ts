import type { FilterOptions } from '../core/types.js';

/**
 * Default (no-op) values for all filter options.
 */
export const FILTER_DEFAULTS: Required<FilterOptions> = {
  brightness: 1,
  contrast: 1,
  grayscale: 0,
  sepia: 0,
  invert: 0,
  saturate: 1,
  hueRotate: 0,
  blur: 0,
};
