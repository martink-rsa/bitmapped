import { describe, it, expect } from 'vitest';
import { hasActiveFilters } from './has-active-filters.js';

describe('hasActiveFilters', () => {
  it('returns false for empty object', () => {
    expect(hasActiveFilters({})).toBe(false);
  });

  it('returns false when all values match defaults', () => {
    expect(
      hasActiveFilters({
        brightness: 1,
        contrast: 1,
        grayscale: 0,
        sepia: 0,
        invert: 0,
        saturate: 1,
        hueRotate: 0,
        blur: 0,
      }),
    ).toBe(false);
  });

  it('returns true when any single value differs from default', () => {
    expect(hasActiveFilters({ brightness: 1.5 })).toBe(true);
  });

  it('returns true for partial object with one non-default value', () => {
    expect(hasActiveFilters({ brightness: 1, contrast: 1, blur: 2 })).toBe(
      true,
    );
  });
});
