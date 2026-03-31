import type { FilterOptions } from '../core/types.js';
import { FILTER_DEFAULTS } from './defaults.js';

/** Maps FilterOptions keys to their CSS function names and units. */
const FILTER_ENTRIES: {
  key: keyof FilterOptions;
  css: string;
  unit: string;
}[] = [
  { key: 'brightness', css: 'brightness', unit: '' },
  { key: 'contrast', css: 'contrast', unit: '' },
  { key: 'grayscale', css: 'grayscale', unit: '' },
  { key: 'sepia', css: 'sepia', unit: '' },
  { key: 'invert', css: 'invert', unit: '' },
  { key: 'saturate', css: 'saturate', unit: '' },
  { key: 'hueRotate', css: 'hue-rotate', unit: 'deg' },
  { key: 'blur', css: 'blur', unit: 'px' },
];

/**
 * Builds a CSS filter string from FilterOptions.
 * Only includes filters that differ from their default (no-op) values.
 * Returns an empty string if all filters are at defaults.
 */
export function buildFilterString(filters: FilterOptions): string {
  const parts: string[] = [];

  for (const { key, css, unit } of FILTER_ENTRIES) {
    const value = filters[key];
    if (value !== undefined && value !== FILTER_DEFAULTS[key]) {
      parts.push(`${css}(${value}${unit})`);
    }
  }

  return parts.join(' ');
}
