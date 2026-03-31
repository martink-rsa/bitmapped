import type { FilterOptions } from '../core/types.js';
import { FILTER_DEFAULTS } from './defaults.js';

/**
 * Returns true if any filter values differ from their defaults.
 * Useful for short-circuiting: skip canvas creation when no filters are active.
 */
export function hasActiveFilters(filters: FilterOptions): boolean {
  for (const key of Object.keys(FILTER_DEFAULTS) as (keyof FilterOptions)[]) {
    if (filters[key] !== undefined && filters[key] !== FILTER_DEFAULTS[key]) {
      return true;
    }
  }
  return false;
}
